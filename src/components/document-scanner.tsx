"use client";

import React, { useState, useRef, useEffect, useCallback, type ChangeEvent } from 'react';
import { 
    Camera, 
    Download, 
    X, 
    Loader2, 
    UploadCloud,
    CheckCircle2,
    Zap, 
    ScanLine,
    Sparkles,
    Maximize,
    Move,
    FileText,
    ChevronRight,
    Trash2,
    RefreshCcw,
    Settings2,
    Plus,
    FileStack,
    Layers,
    Smartphone,
    Wand2,
    Eye,
    Droplets,
    Highlighter,
    Scan,
    Monitor,
    ImageIcon,
    ShieldCheck,
    Archive,
    FileArchive,
    Edit3,
    CheckCircle,
    LayoutGrid,
    Share2,
    Square,
    RotateCw,
    Baseline,
    Sun,
    Contrast,
    ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// --- TYPES ---
export type FilterType = 'original' | 'photo' | 'bw' | 'document' | 'magic';

export interface Point {
  x: number;
  y: number;
}

interface ScannedPage {
    id: string;
    processedSrc: string;
    originalSrc: string;
    points: Point[];
    isScanned: boolean;
    originalIndex: number;
    rotation: number;
}

type Stage = 'viewfinder' | 'camera' | 'adjust' | 'studio';

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i}`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

/**
 * HELPER: PERSPECTIVE WARP SOLVER (Homography)
 */
function solvePerspective(src: Point[], dst: Point[]) {
    const p = [];
    for (let i = 0; i < 4; i++) {
        p.push([src[i].x, src[i].y, 1, 0, 0, 0, -src[i].x * dst[i].x, -src[i].y * dst[i].x, dst[i].x]);
        p.push([0, 0, 0, src[i].x, src[i].y, 1, -src[i].x * dst[i].y, -src[i].y * dst[i].y, dst[i].y]);
    }
    const n = 8;
    for (let i = 0; i < n; i++) {
        let max = i;
        for (let j = i + 1; j < n; j++) if (Math.abs(p[j][i]) > Math.abs(p[max][i])) max = j;
        const temp = p[i]; p[i] = p[max]; p[max] = temp;
        for (let j = i + 1; j < n; j++) {
            const f = p[j][i] / p[i][i];
            for (let k = i; k <= n; k++) p[j][k] -= f * p[i][k];
        }
    }
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        let s = 0;
        for (let j = i + 1; j < n; j++) s += p[i][j] * x[j];
        x[i] = (p[i][n] - s) / p[i][i];
    }
    return x;
}

export default function DocumentScanner() {
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>('viewfinder');
  
  const [pendingPages, setPendingPages] = useState<ScannedPage[]>([]);
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('magic');
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [rotation, setRotation] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [currentRawImage, setCurrentRawImage] = useState<string | null>(null);
  const [flattenedSrc, setFlattenedSrc] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);

  const [points, setPoints] = useState<Point[]>([
    { x: 15, y: 15 }, { x: 85, y: 15 }, { x: 85, y: 85 }, { x: 15, y: 85 }
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [liveResultSrc, setLiveResultSrc] = useState<string | null>(null);

  /**
   * CORE: FRAMEDOC FILTER ENGINE
   * Strictly implementing the provided logic: Shadow Removal & Color Dodge
   */
  const applyFrameDocFilter = async (imageSrc: string, filterType: FilterType): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            // 1. Rotation Handler
            const rotCanvas = document.createElement('canvas');
            if (rotation === 90 || rotation === 270) {
              rotCanvas.width = img.height;
              rotCanvas.height = img.width;
            } else {
              rotCanvas.width = img.width;
              rotCanvas.height = img.height;
            }
            const rotCtx = rotCanvas.getContext('2d')!;
            rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
            rotCtx.rotate((rotation * Math.PI) / 180);
            rotCtx.drawImage(img, -img.width / 2, -img.height / 2);

            // 2. Initial Adjustments (Brightness & Contrast)
            const adjCanvas = document.createElement('canvas');
            adjCanvas.width = rotCanvas.width;
            adjCanvas.height = rotCanvas.height;
            const adjCtx = adjCanvas.getContext('2d')!;
            adjCtx.filter = `brightness(${brightness[0]}%) contrast(${contrast[0]}%)`;
            adjCtx.drawImage(rotCanvas, 0, 0);
            adjCtx.filter = 'none';

            if (filterType === 'original') return resolve(adjCanvas.toDataURL('image/jpeg', 0.95));
            
            if (filterType === 'photo') {
                const pCanvas = document.createElement('canvas');
                pCanvas.width = adjCanvas.width; pCanvas.height = adjCanvas.height;
                const pCtx = pCanvas.getContext('2d')!;
                pCtx.filter = 'saturate(1.2) contrast(1.1)';
                pCtx.drawImage(adjCanvas, 0, 0);
                return resolve(pCanvas.toDataURL('image/jpeg', 0.95));
            }

            // --- Advanced Illumination Correction (Shadow Removal) ---
            const scale = 0.1;
            const smallW = Math.max(1, Math.floor(adjCanvas.width * scale));
            const smallH = Math.max(1, Math.floor(adjCanvas.height * scale));
            
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = smallW; smallCanvas.height = smallH;
            const smallCtx = smallCanvas.getContext('2d')!;
            
            smallCtx.filter = 'blur(4px)';
            smallCtx.drawImage(adjCanvas, 0, 0, smallW, smallH);
            
            // Background inversion (difference with white)
            smallCtx.globalCompositeOperation = 'difference';
            smallCtx.fillStyle = 'white';
            smallCtx.fillRect(0, 0, smallW, smallH);

            const normCanvas = document.createElement('canvas');
            normCanvas.width = adjCanvas.width; normCanvas.height = adjCanvas.height;
            const normCtx = normCanvas.getContext('2d')!;
            
            normCtx.drawImage(adjCanvas, 0, 0);
            // Apply color-dodge composite to mitigate shadows
            normCtx.globalCompositeOperation = 'color-dodge';
            normCtx.imageSmoothingEnabled = true;
            normCtx.imageSmoothingQuality = 'high';
            normCtx.drawImage(smallCanvas, 0, 0, smallW, smallH, 0, 0, adjCanvas.width, adjCanvas.height);

            const imageData = normCtx.getImageData(0, 0, adjCanvas.width, adjCanvas.height);
            const data = imageData.data;

            let blackPoint = 120;
            let whitePoint = 230;
            const satBoost = filterType === 'magic' ? 1.5 : 1.1;

            if (filterType === 'magic') { blackPoint = 60; whitePoint = 245; }
            else if (filterType === 'bw') { blackPoint = 140; whitePoint = 220; }
            
            const range = whitePoint - blackPoint;

            // Pixel-level adaptive thresholding
            for (let i = 0; i < data.length; i += 4) {
                let r = data[i], g = data[i+1], b = data[i+2];
                let lum = r * 0.299 + g * 0.587 + b * 0.114;
                
                if (filterType === 'bw') {
                    let v = lum < blackPoint ? 0 : lum > whitePoint ? 255 : (lum - blackPoint) * 255 / range;
                    data[i] = data[i+1] = data[i+2] = v;
                } else {
                    let s = lum < blackPoint ? 0 : lum > whitePoint ? 255 / lum : ((lum - blackPoint) * 255 / range) / lum;
                    r = (r - lum) * satBoost + lum * s;
                    g = (g - lum) * satBoost + lum * s;
                    b = (b - lum) * satBoost + lum * s;
                    data[i] = Math.min(255, Math.max(0, r));
                    data[i+1] = Math.min(255, Math.max(0, g));
                    data[i+2] = Math.min(255, Math.max(0, b));
                }
            }
            normCtx.putImageData(imageData, 0, 0);
            resolve(normCanvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = () => reject("Load failed");
        img.src = imageSrc;
    });
  };

  /**
   * PERSPECTIVE WARP (FLATTEN) LOGIC
   */
  const handleFlatten = async () => {
      const image = imgRef.current;
      if (!image || !currentRawImage) return;
      setIsProcessing(true);

      try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
          const w = image.naturalWidth;
          const h = image.naturalHeight;

          const srcPoints = points.map(p => ({ x: p.x * (w / 100), y: p.y * (h / 100) }));
          const w1 = Math.hypot(srcPoints[1].x - srcPoints[0].x, srcPoints[1].y - srcPoints[0].y);
          const w2 = Math.hypot(srcPoints[2].x - srcPoints[3].x, srcPoints[2].y - srcPoints[3].y);
          const h1 = Math.hypot(srcPoints[3].x - srcPoints[0].x, srcPoints[3].y - srcPoints[0].y);
          const h2 = Math.hypot(srcPoints[2].x - srcPoints[1].x, srcPoints[2].y - srcPoints[1].y);
          const tw = Math.max(10, Math.floor(Math.max(w1, w2)));
          const th = Math.max(10, Math.floor(Math.max(h1, h2)));

          canvas.width = tw; canvas.height = th;
          const dstPoints = [{ x: 0, y: 0 }, { x: tw, y: 0 }, { x: tw, y: th }, { x: 0, y: th }];
          const matrix = solvePerspective(dstPoints, srcPoints);
          const imgData = ctx.createImageData(tw, th);

          const srcCanvas = document.createElement('canvas');
          srcCanvas.width = w; srcCanvas.height = h;
          const srcCtx = srcCanvas.getContext('2d')!;
          srcCtx.drawImage(image, 0, 0);
          const srcPixels = srcCtx.getImageData(0, 0, w, h).data;

          for (let y = 0; y < th; y++) {
              for (let x = 0; x < tw; x++) {
                  const z = matrix[6] * x + matrix[7] * y + 1;
                  const sx = Math.floor((matrix[0] * x + matrix[1] * y + matrix[2]) / z);
                  const sy = Math.floor((matrix[3] * x + matrix[4] * y + matrix[5]) / z);
                  if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
                      const di = (y * tw + x) * 4, si = (sy * w + sx) * 4;
                      imgData.data[di] = srcPixels[si]; imgData.data[di+1] = srcPixels[si+1];
                      imgData.data[di+2] = srcPixels[si+2]; imgData.data[di+3] = srcPixels[si+3];
                  }
              }
          }
          ctx.putImageData(imgData, 0, 0);
          const flattened = canvas.toDataURL('image/jpeg', 1.0);
          setFlattenedSrc(flattened);
          
          const filtered = await applyFrameDocFilter(flattened, activeFilter);
          setLiveResultSrc(filtered);
          setStage('studio');
      } catch (err) {
          toast({ variant: 'destructive', title: 'Warp Error' });
      } finally {
          setIsProcessing(false);
      }
  };

  useEffect(() => {
      if (stage === 'studio' && flattenedSrc) {
          const timer = setTimeout(async () => {
              const res = await applyFrameDocFilter(flattenedSrc, activeFilter);
              setLiveResultSrc(res);
          }, 50);
          return () => clearTimeout(timer);
      }
  }, [activeFilter, brightness, contrast, rotation, flattenedSrc, stage]);

  const startCamera = async () => {
    setIsCameraStarting(true);
    setStage('camera');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
        });
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.muted = true; }
    } catch (err) {
        cameraInputRef.current?.click();
    } finally {
        setIsCameraStarting(false);
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(video, 0, 0);
        setCurrentRawImage(canvas.toDataURL('image/jpeg', 1.0));
        setStage('adjust');
        if (video.srcObject) (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  const handleFilesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;
    setIsProcessing(true);
    const filesArray = Array.from(filesList);
    const newPages: ScannedPage[] = [];

    for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((res) => { 
            reader.onload = (ev) => res(ev.target?.result as string); 
            reader.readAsDataURL(file); 
        });
        newPages.push({ 
            id: Math.random().toString(36).substr(2, 9), 
            originalSrc: dataUrl, 
            processedSrc: dataUrl, 
            points: [{ x: 15, y: 15 }, { x: 85, y: 15 }, { x: 85, y: 85 }, { x: 15, y: 85 }], 
            isScanned: false, 
            originalIndex: scannedPages.length + newPages.length + 1, 
            rotation: 0 
        });
    }
    setPendingPages(prev => [...prev, ...newPages]);
    setIsProcessing(false);
  };

  const handleConfirmSave = () => {
      if (!liveResultSrc) return;
      const id = editingId || Math.random().toString(36).substr(2, 9);
      const newPage: ScannedPage = { id, originalSrc: currentRawImage!, processedSrc: liveResultSrc, points, isScanned: true, originalIndex: scannedPages.length + 1, rotation };
      setScannedPages(prev => [...prev.filter(p => p.id !== id), newPage].sort((a,b) => a.originalIndex - b.originalIndex));
      setPendingPages(prev => prev.filter(p => p.id !== id));
      setStage('viewfinder');
      setCurrentRawImage(null); setLiveResultSrc(null); setFlattenedSrc(null);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((cy - rect.top) / rect.height) * 100));
    setPoints(prev => { const next = [...prev]; next[draggingPoint] = { x, y }; return next; });
  };

  const handleDownloadPdf = async () => {
    if (scannedPages.length === 0) return;
    setIsGenerating(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    for (let i = 0; i < scannedPages.length; i++) {
        if (i > 0) pdf.addPage();
        const img = scannedPages[i].processedSrc;
        pdf.addImage(img, 'JPEG', 0, 0, 210, 297);
    }
    pdf.save(`Scan-${Date.now()}.pdf`);
    setIsGenerating(false);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-700 relative mt-4">
        
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8 px-4 min-h-[70vh]">
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="border-2 shadow-lg bg-card/50 rounded-[3rem] flex-1">
                        <CardHeader className="bg-muted/30 border-b p-6 flex justify-between items-center">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><LayoutGrid className="size-4 text-primary" /> QUEUE</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {pendingPages.length === 0 ? (
                                <div className="flex flex-col items-center py-20 opacity-20"><ImageIcon className="size-12 mb-4" /><p className="text-[10px] font-black uppercase">Drop Files to Start</p></div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {pendingPages.map((p) => (
                                        <div key={p.id} className="relative group rounded-2xl overflow-hidden border-2 cursor-pointer" onClick={() => { setCurrentRawImage(p.originalSrc); setEditingId(p.id); setStage('adjust'); }}>
                                            <img src={p.originalSrc} className="size-full object-cover grayscale opacity-50" alt="p" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm transition-all"><Button size="sm" className="font-black text-[9px] uppercase"><Scan className="size-3 mr-1" /> SCAN</Button></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 flex flex-col justify-center">
                    <Card className="border-2 border-dashed bg-card/50 text-center rounded-[3rem] p-10 flex flex-col items-center gap-8 shadow-2xl">
                        <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-xl"><ScanLine className="size-10" /></div>
                        <div className="space-y-4 w-full max-w-xs">
                            <Button className="h-16 w-full rounded-2xl bg-primary text-white font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all group" onClick={startCamera}>
                                <Camera className="size-6 mr-3 group-hover:rotate-12" /> LIVE SCANNER
                            </Button>
                            <Button variant="outline" className="h-14 w-full rounded-2xl border-2 font-black text-xs uppercase" onClick={() => fileInputRef.current?.click()}>
                                <Plus className="size-5 mr-3" /> IMPORT DOCS
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="border-2 shadow-lg bg-card/50 rounded-[3rem] flex-1">
                        <CardHeader className="bg-emerald-500/5 border-b p-6 flex justify-between items-center text-emerald-600">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><CheckCircle className="size-4" /> FINISHED</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {scannedPages.length === 0 ? (
                                <div className="flex flex-col items-center py-20 opacity-20"><FileArchive className="size-12 mb-4" /><p className="text-[10px] font-black uppercase">No Results Yet</p></div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {scannedPages.map((p) => (
                                        <div key={p.id} className="relative group rounded-2xl overflow-hidden border-2">
                                            <img src={p.processedSrc} className="size-full object-cover" alt="p" />
                                            <div className="absolute top-2 left-2 size-6 rounded-md bg-green-600 text-white flex items-center justify-center text-[8px] font-black">✓ P{p.originalIndex}</div>
                                            <button className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}><Trash2 className="size-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-6 border-t bg-muted/5 flex flex-col gap-3">
                            <Button onClick={handleDownloadPdf} disabled={scannedPages.length === 0} className="w-full h-14 rounded-2xl bg-[#00aeef] text-white font-black uppercase text-xs shadow-xl active:scale-95 border-none">
                                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Download className="size-4 mr-2" />} SAVE PDF BUNDLE
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {stage === 'camera' && (
            <div className="flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-500 min-h-[60vh]">
                <Card className="w-full max-w-3xl border-none shadow-3xl rounded-[3rem] overflow-hidden bg-black relative">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto object-contain max-h-[75vh]" />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-6">
                        <Button className="size-20 rounded-full bg-white text-black p-0 shadow-3xl hover:scale-110 active:scale-95 border-8 border-slate-900 ring-8 ring-white/10" onClick={captureFrame}><Camera className="size-10"/></Button>
                        <Button variant="ghost" onClick={() => setStage('viewfinder')} className="bg-black/40 text-white rounded-full px-6 uppercase font-black text-[10px] border border-white/10">Cancel</Button>
                    </div>
                </Card>
            </div>
        )}

        {stage === 'adjust' && currentRawImage && (
            <div className="flex flex-col items-center justify-start p-4 animate-in slide-in-from-bottom-6 duration-500">
                <Card className="w-full max-w-5xl border-2 shadow-2xl rounded-[3rem] overflow-hidden bg-card">
                    <CardHeader className="bg-muted/30 border-b p-6 flex justify-between items-center">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><ScanLine className="size-5 text-primary" /> 1. CORNER MAPPING</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setStage('viewfinder')} className="text-destructive"><X /></Button>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col items-center justify-center bg-slate-200 dark:bg-black/40 min-h-[600px] relative overflow-hidden select-none" 
                                 onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                        <div ref={containerRef} className="relative shadow-3xl border-4 border-white bg-white my-10 max-w-[95vw]" style={{ touchAction: 'none' }}>
                            <img ref={imgRef} src={currentRawImage} alt="s" className="max-h-[65vh] w-auto block pointer-events-none" />
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <polygon points={`${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[2].x},${points[2].y} ${points[3].x},${points[3].y}`} className="fill-primary/10 stroke-primary stroke-[0.8] dash-array-[5,5]" />
                            </svg>
                            {points.map((p, i) => (
                                <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-primary shadow-2xl cursor-grab active:cursor-grabbing z-20 flex items-center justify-center bg-white", draggingPoint === i && "scale-125")}
                                    style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }} onMouseDown={() => setDraggingPoint(i)} onTouchStart={() => setDraggingPoint(i)}><div className="size-2.5 bg-primary rounded-full" /></div>
                            ))}
                        </div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-3 bg-black/80 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-3xl"><Move className="size-4 text-primary animate-pulse" /> MAP ALL 4 CORNERS</div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-6 border-t flex justify-end">
                        <Button className="h-16 px-16 rounded-2xl bg-primary text-white font-black text-lg shadow-2xl active:scale-95 transition-all" onClick={handleFlatten}>FLATTEN / CROP <ChevronRight className="ml-2 size-6" /></Button>
                    </CardFooter>
                </Card>
            </div>
        )}

        {stage === 'studio' && liveResultSrc && (
            <div className="grid lg:grid-cols-12 gap-8 items-stretch animate-in slide-in-from-bottom-6 duration-500 w-full px-4 max-w-[1800px] mx-auto">
                <Card className="lg:col-span-8 border-2 shadow-xl overflow-hidden rounded-[3rem] bg-card flex flex-col">
                    <CardHeader className="bg-muted/30 border-b p-6 flex justify-between items-center">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><Eye className="size-5 text-primary" /> 2. HD PREVIEW</CardTitle>
                        <Badge className="bg-green-600 text-white font-black text-[9px] px-4 py-1.5 rounded-full border-2 border-white shadow-lg animate-pulse uppercase">RENDER READY</Badge>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12 flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-900 shadow-inner relative overflow-hidden">
                        <div className="relative bg-white shadow-3xl border-[12px] border-white max-w-full">
                            {isProcessing ? <Loader2 className="animate-spin size-12 text-primary opacity-20" /> : <img src={liveResultSrc} className="max-h-[65vh] w-auto object-contain block animate-in zoom-in-95 duration-500" alt="result" />}
                        </div>
                    </CardContent>
                    <CardFooter className="bg-white dark:bg-slate-950 p-6 border-t flex justify-center gap-8 text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">
                         <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
                         <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> INSTANT RENDER</div>
                         <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> HD OUTPUT</div>
                    </CardFooter>
                </Card>

                <Card className="lg:col-span-4 border-2 shadow-xl overflow-hidden rounded-[3rem] bg-card flex flex-col h-full no-print">
                    <CardHeader className="bg-primary/5 border-b p-6"><CardTitle className="text-base font-black uppercase tracking-tighter text-primary flex items-center gap-2"><Settings2 className="size-5" /> STUDIO CONTROLS</CardTitle></CardHeader>
                    <CardContent className="p-8 space-y-10 flex-1 text-left">
                        <div className="space-y-6">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Fidelity Filters</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <FilterBtn active={activeFilter === 'magic'} label="Magic" icon={Sparkles} onClick={() => setActiveFilter('magic')} />
                                <FilterBtn active={activeFilter === 'document'} label="Docu" icon={FileText} onClick={() => setActiveFilter('document')} />
                                <FilterBtn active={activeFilter === 'bw'} label="BW" icon={Highlighter} onClick={() => setActiveFilter('bw')} />
                                <FilterBtn active={activeFilter === 'photo'} label="Photo" icon={ImageIcon} onClick={() => setActiveFilter('photo')} />
                                <FilterBtn active={activeFilter === 'original'} label="None" icon={X} onClick={() => setActiveFilter('original')} />
                                <div className="flex flex-col items-center gap-2">
                                  <Button variant="outline" className="size-14 rounded-2xl shadow-lg border-2 transition-all p-0 bg-white/50 border-white/20 hover:border-primary/40" onClick={() => setRotation(r => (r + 90) % 360)}><RotateCw className="size-6"/></Button>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Rotate</span>
                                </div>
                            </div>
                        </div>
                        <Separator className="opacity-10" />
                        <div className="space-y-8">
                             <div className="space-y-4">
                                <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Exposure</Label><Badge variant="secondary" className="font-mono text-[9px]">{brightness[0]}%</Badge></div>
                                <Slider min={50} max={150} step={1} value={brightness} onValueChange={setBrightness} />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Contrast</Label><Badge variant="secondary" className="font-mono text-[9px]">{contrast[0]}%</Badge></div>
                                <Slider min={50} max={150} step={1} value={contrast} onValueChange={setContrast} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-8 border-t flex flex-col gap-4">
                         <Button onClick={handleConfirmSave} className="magic-button w-full h-16 rounded-[1.5rem] bg-primary text-white font-black text-lg shadow-2xl active:scale-95 transition-all border-none">
                            <StarIcons />
                            <CheckCircle2 className="size-6 mr-3" /> CONFIRM & SAVE
                        </Button>
                        <Button variant="outline" className="w-full h-12 border-2 rounded-xl font-black text-[10px] uppercase" onClick={() => setStage('adjust')}><RefreshCcw className="size-4 mr-2" /> RE-CROP</Button>
                    </CardFooter>
                </Card>
            </div>
        )}

        <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFilesUpload} />
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf" multiple onChange={handleFilesUpload} />
    </div>
  );
}

function FilterBtn({ active, label, icon: Icon, onClick }: { active: boolean, label: string, icon: any, onClick: () => void }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <Button variant={active ? 'default' : 'outline'} className={cn("size-14 rounded-2xl shadow-lg border-2 transition-all p-0", active ? "bg-primary border-primary text-white scale-110" : "bg-white/50 border-white/20 hover:border-primary/40")} onClick={onClick}><Icon className="size-6"/></Button>
            <span className={cn("text-[8px] font-black uppercase tracking-widest", active ? "text-primary" : "text-muted-foreground")}>{label}</span>
        </div>
    );
}
