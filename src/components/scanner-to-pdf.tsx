"use client";

import 'react-image-crop/dist/ReactCrop.css';
import { useState, useRef, useEffect, useCallback, type SyntheticEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { 
    Camera, 
    Download, 
    X, 
    Loader2, 
    Crop as CropIcon, 
    FileDigit, 
    UploadCloud,
    CheckCircle2,
    Zap, 
    ShieldCheck, 
    ScanLine,
    Monitor,
    ImageIcon,
    Plus,
    Droplets,
    RotateCw,
    Sparkles,
    Maximize,
    Move,
    SearchCode,
    FileText,
    ChevronRight,
    Eye,
    Trash2,
    RefreshCcw,
    Settings2,
    Layout,
    Sun,
    Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import * as pdfjs from 'pdfjs-dist';

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface Point {
    x: number;
    y: number;
}

type ScanFilter = 'original' | 'magic' | 'photo' | 'bw' | 'gray';
type Stage = 'viewfinder' | 'adjust' | 'stack';
type CropMode = 'rect' | 'scanner';

interface ScannedPage {
    id: string;
    originalSrc: string;
    processedSrc: string;
    filter: ScanFilter;
}

export default function ScannerToPdf() {
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>('viewfinder');
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [cropMode, setCropMode] = useState<CropMode>('scanner');
  const [activeFilter, setActiveFilter] = useState<ScanFilter>('magic');
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentRawImage, setCurrentRawImage] = useState<string | null>(null);
  const [liveResultSrc, setLiveResultSrc] = useState<string | null>(null);
  
  // Rect Crop
  const [rectCrop, setRectCrop] = useState<Crop>();
  const [completedRectCrop, setCompletedRectCrop] = useState<PixelCrop>();
  
  // 6 Points: TL(0), TR(1), MR(2), BR(3), BL(4), ML(5)
  const [points, setPoints] = useState<Point[]>([
      { x: 10, y: 10 }, { x: 90, y: 10 },
      { x: 90, y: 50 }, { x: 90, y: 90 },
      { x: 10, y: 90 }, { x: 10, y: 50 }
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBuildingPdf, setIsBuildingPdf] = useState(false);

  const stopCamera = useCallback(() => {
    if(videoRef.current && videoRef.current.srcObject){
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
        setHasCameraPermission(false);
        return;
    }
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setHasCameraPermission(true);
      }
    } catch (error) {
      setHasCameraPermission(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (stage === 'viewfinder') startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [stage, startCamera, stopCamera]);

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setRectCrop(centerCrop({ unit: '%', width: 90, height: 90 }, width, height));
    setPoints([
        { x: 10, y: 10 }, { x: 90, y: 10 },
        { x: 90, y: 50 }, { x: 90, y: 90 },
        { x: 10, y: 90 }, { x: 10, y: 50 }
    ]);
  };

  /**
   * Safe Perspective Matrix Solver (Homography)
   */
  const solvePerspective = (src: Point[], dst: Point[]) => {
    const p = [];
    // Only use corners: TL(0), TR(1), BR(3), BL(4)
    const corners = [src[0], src[1], src[3], src[4]];
    
    for (let i = 0; i < 4; i++) {
        p.push([corners[i].x, corners[i].y, 1, 0, 0, 0, -corners[i].x * dst[i].x, -corners[i].y * dst[i].x, dst[i].x]);
        p.push([0, 0, 0, corners[i].x, corners[i].y, 1, -corners[i].x * dst[i].y, -corners[i].y * dst[i].y, dst[i].y]);
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
  };

  /**
   * INTELLIGENT DOCUMENT ENHANCEMENT ENGINE
   * Separately processes Text vs Photo/Color elements.
   */
  const applyIntelligentScan = useCallback(async (): Promise<string> => {
    const image = imgRef.current;
    if (!image || !currentRawImage) return "";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return "";

    // Step 1: Geometric Transformation (Crop or Warp)
    if (cropMode === 'rect') {
        const c = completedRectCrop || { x: 10, y: 10, width: 80, height: 80, unit: 'px' } as PixelCrop;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = Math.max(1, c.width * scaleX);
        canvas.height = Math.max(1, c.height * scaleY);
        ctx.drawImage(image, c.x * scaleX, c.y * scaleY, c.width * scaleX, c.height * scaleY, 0, 0, canvas.width, canvas.height);
    } else {
        const corners = [points[0], points[1], points[3], points[4]];
        const w1 = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
        const w2 = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
        const h1 = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
        const h2 = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
        
        const targetWidth = Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100));
        const targetHeight = Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100));
        canvas.width = Math.max(1, targetWidth);
        canvas.height = Math.max(1, targetHeight);

        const srcPoints = corners.map(p => ({ x: p.x * (image.naturalWidth / 100), y: p.y * (image.naturalHeight / 100) }));
        const dstPoints = [{ x: 0, y: 0 }, { x: canvas.width, y: 0 }, { x: canvas.width, y: canvas.height }, { x: 0, y: canvas.height }];
        const h = solvePerspective(srcPoints, dstPoints);
        
        const imgData = ctx.createImageData(canvas.width, canvas.height);
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = image.naturalWidth;
        srcCanvas.height = image.naturalHeight;
        const srcCtx = srcCanvas.getContext('2d');
        srcCtx?.drawImage(image, 0, 0);
        const srcPixels = srcCtx?.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;

        if (srcPixels) {
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const z = h[6] * x + h[7] * y + 1;
                    const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
                    const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
                    if (sx >= 0 && sx < image.naturalWidth && sy >= 0 && sy < image.naturalHeight) {
                        const dstIdx = (y * canvas.width + x) * 4;
                        const srcIdx = (sy * image.naturalWidth + sx) * 4;
                        imgData.data[dstIdx] = srcPixels[srcIdx];
                        imgData.data[dstIdx+1] = srcPixels[srcIdx+1];
                        imgData.data[dstIdx+2] = srcPixels[srcIdx+2];
                        imgData.data[dstIdx+3] = srcPixels[srcIdx+3];
                    }
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }
    }

    // Step 2: Intelligent Enhancement Logic
    if (activeFilter !== 'original') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Adaptive engine: Detect background vs foreground
        let totalLuma = 0;
        for (let i = 0; i < pixels.length; i += 4) {
            totalLuma += (0.299 * pixels[i] + 0.587 * pixels[i+1] + 0.114 * pixels[i+2]);
        }
        const avgLuma = totalLuma / (pixels.length / 4);

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            const saturation = Math.max(r, g, b) - Math.min(r, g, b);

            if (activeFilter === 'magic' || activeFilter === 'photo') {
                // Documents (Magic Color): High Contrast + Shadow Removal
                // Heuristic: If saturation is high, it's a stamp or photo - preserve it.
                if (activeFilter === 'magic' && saturation < 30) {
                    // Text processing
                    const factor = luma < avgLuma ? 1.4 : 1.7; // Deep darks, Bright whites
                    pixels[i] = Math.min(255, r * factor);
                    pixels[i+1] = Math.min(255, g * factor);
                    pixels[i+2] = Math.min(255, b * factor);
                } else {
                    // Photo preservation
                    const boost = 1.15;
                    pixels[i] = Math.min(255, r * boost);
                    pixels[i+1] = Math.min(255, g * boost);
                    pixels[i+2] = Math.min(255, b * boost);
                }
            } else if (activeFilter === 'bw') {
                // Adaptive B&W logic
                const threshold = avgLuma * 0.85;
                const val = (luma > threshold && saturation < 25) ? 255 : (luma < 60 ? 0 : luma * 0.6);
                pixels[i] = pixels[i+1] = pixels[i+2] = val;
            } else if (activeFilter === 'gray') {
                pixels[i] = pixels[i+1] = pixels[i+2] = luma * 1.1;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [currentRawImage, cropMode, points, activeFilter, completedRectCrop]);

  useEffect(() => {
    if (stage === 'adjust' && currentRawImage) {
        const run = async () => {
            const res = await applyIntelligentScan();
            if (res) setLiveResultSrc(res);
        };
        const timer = setTimeout(run, 150);
        return () => clearTimeout(timer);
    }
  }, [points, activeFilter, cropMode, completedRectCrop, stage, currentRawImage, applyIntelligentScan]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current) return;
    if (e.cancelable) e.preventDefault();
    let cx, cy;
    if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }
    const pos = updateMagnifier(cx, cy);
    if (pos) {
        setPoints(prev => {
            const next = [...prev];
            next[draggingPoint] = { x: pos.x, y: pos.y };
            return next;
        });
    }
  };

  const handlePointDown = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      let cx, cy;
      if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
      else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }
      updateMagnifier(cx, cy);
      setDraggingPoint(idx);
  };

  const updateMagnifier = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setMagnifierPos({ x, y });
    return { x, y };
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setCurrentRawImage(canvas.toDataURL('image/jpeg', 0.95));
      setStage('adjust');
    }
  };

  const handleRotateSource = () => {
    if (!currentRawImage) return;
    setIsProcessing(true);
    const img = new window.Image();
    img.src = currentRawImage;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = img.height; canvas.height = img.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        setCurrentRawImage(canvas.toDataURL('image/jpeg', 0.95));
        setIsProcessing(false);
    };
  };

  const handleConfirmPage = () => {
    if (!liveResultSrc) return;
    setScannedPages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        originalSrc: currentRawImage!,
        processedSrc: liveResultSrc,
        filter: activeFilter
    }]);
    setStage('stack');
  };

  const handleBuildPdf = async () => {
    setIsBuildingPdf(true);
    const pdf = new jsPDF();
    for (let i = 0; i < scannedPages.length; i++) {
        if (i > 0) pdf.addPage();
        const src = scannedPages[i].processedSrc;
        const props = pdf.getImageProperties(src);
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pw / props.width, ph / props.height);
        pdf.addImage(src, 'JPEG', (pw - props.width * ratio) / 2, (ph - props.height * ratio) / 2, props.width * ratio, props.height * ratio, undefined, 'FAST');
    }
    pdf.save(`Scan-${Date.now()}.pdf`);
    setIsBuildingPdf(false);
  };

  return (
    <div className="w-full max-w-7xl flex flex-col gap-6 animate-in fade-in duration-700 pb-20 px-4">
        
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <Card className="border-2 shadow-2xl overflow-hidden bg-black relative rounded-2xl md:rounded-[3rem] aspect-video sm:aspect-square md:aspect-video flex items-center justify-center">
                        <video ref={videoRef} className={cn("w-full h-full object-contain", !hasCameraPermission && "hidden")} autoPlay muted playsInline />
                        {hasCameraPermission === false && (
                            <div className="p-12 text-center space-y-6 text-white w-full">
                                <Camera className="size-16 mx-auto opacity-20" />
                                <div className="space-y-4">
                                    <p className="font-black uppercase text-sm">Camera Restricted</p>
                                    <Button onClick={startCamera} className="bg-primary rounded-xl font-black uppercase text-[10px]">Retry Camera</Button>
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                             <Button variant="secondary" className="h-12 rounded-xl font-black uppercase text-[9px] shadow-2xl" onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon className="mr-2 size-4" /> UPLOAD PHOTO
                            </Button>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </div>
                    </Card>
                    <div className="mt-6">
                        <Button onClick={handleCapture} className="h-20 w-full bg-gradient-button text-white font-black text-xl rounded-2xl shadow-3xl active:scale-95 transition-all">
                             SCAN CURRENT PAGE
                        </Button>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <Card className="border-2 shadow-2xl flex flex-col bg-card/50 rounded-[2.5rem] min-h-[400px]">
                        <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2"><Layout className="size-5" /> Stack</CardTitle>
                            <Badge className="bg-primary">{scannedPages.length}</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 p-6">
                            <div className="grid grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                {scannedPages.map((p, i) => (
                                    <div key={p.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 bg-white shadow-lg group">
                                        <img src={p.processedSrc} className="size-full object-cover" alt="scan" />
                                        <div className="absolute top-1 left-1 bg-black/60 text-white text-[8px] px-1.5 rounded-full font-black">P{i+1}</div>
                                        <Button size="icon" variant="destructive" className="absolute top-1 right-1 size-6 rounded-md opacity-0 group-hover:opacity-100 transition-all" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}><Trash2 className="size-3" /></Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 bg-muted/10 border-t">
                            <Button disabled={scannedPages.length === 0} className="w-full h-14 bg-primary font-black text-sm rounded-xl shadow-xl" onClick={handleBuildPdf}>
                                {isBuildingPdf ? <Loader2 className="animate-spin mr-2"/> : <Download className="mr-2" />} DOWNLOAD PDF
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {stage === 'adjust' && currentRawImage && (
            <Card className="border-none shadow-3xl overflow-hidden rounded-[2.5rem] animate-in zoom-in-95 duration-500">
                <CardHeader className="bg-primary/5 border-b p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg"><Maximize className="size-5" /></div>
                         <div><CardTitle className="text-xl font-black uppercase tracking-tighter leading-none">Studio Edit</CardTitle></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as CropMode)} className="bg-background/50 p-1 rounded-lg border">
                            <TabsList className="h-8"><TabsTrigger value="rect" className="text-[10px] font-black uppercase">Rect</TabsTrigger><TabsTrigger value="scanner" className="text-[10px] font-black uppercase">Scanner</TabsTrigger></TabsList>
                        </Tabs>
                        <Button variant="outline" size="icon" onClick={handleRotateSource} className="h-10 w-10 border-2 rounded-xl"><RotateCw className="size-5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setStage('viewfinder')}><X /></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 bg-slate-200 dark:bg-slate-900 grid lg:grid-cols-2 min-h-[500px] md:min-h-[700px] relative overflow-hidden select-none">
                    {/* LEFT: EDITING */}
                    <div className="flex flex-col items-center justify-center p-4 md:p-10 border-r border-slate-300 dark:border-white/5 relative h-full"
                         onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                        
                        <div ref={containerRef} className="relative cursor-crosshair shadow-2xl border-4 border-white transform-gpu bg-white max-w-full">
                            {cropMode === 'rect' ? (
                                <ReactCrop crop={rectCrop} onChange={c => setRectCrop(c)} onComplete={c => setCompletedRectCrop(c)} className="max-h-[55vh] md:max-h-[65vh]">
                                    <img ref={imgRef} src={currentRawImage} alt="rect" className="max-h-[55vh] md:max-h-[65vh] w-auto object-contain block" onLoad={onImageLoad} />
                                </ReactCrop>
                            ) : (
                                <div className="relative">
                                    <img ref={imgRef} src={currentRawImage} alt="scanner" className="max-h-[55vh] md:max-h-[65vh] w-auto object-contain pointer-events-none block" onLoad={onImageLoad} />
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} className="fill-primary/20 stroke-primary stroke-[1.0]" />
                                    </svg>
                                    {points.map((p, i) => (
                                        <div key={i} className={cn("absolute size-9 rounded-full border-4 border-white shadow-2xl cursor-grab z-20 flex items-center justify-center", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/90")}
                                             style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                                             onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}>
                                            <div className="size-2.5 bg-white rounded-full" />
                                        </div>
                                    ))}
                                    {draggingPoint !== null && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 rounded-full border-4 border-green-500 shadow-2xl bg-white ring-4 ring-white/50">
                                            <img src={currentRawImage} alt="mag" className="absolute max-w-none origin-top-left"
                                                style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} 
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="size-3 border-2 border-red-500 rounded-full bg-white/50" /></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground"><Move className="size-3 text-primary"/> Drag dots to align edges</div>
                    </div>

                    {/* RIGHT: LIVE RESULT */}
                    <div className="flex flex-col items-center justify-center p-4 md:p-10 bg-slate-300/50 dark:bg-black/40 relative h-full">
                        <Badge className="absolute top-4 right-4 z-20 bg-green-600 text-white border-white">LIVE HD PREVIEW</Badge>
                        <div className="w-full flex flex-col items-center gap-8">
                             <div className="relative bg-white shadow-3xl rounded-sm border-[6px] border-white transform transition-transform hover:scale-[1.01] max-w-full min-h-[300px] flex items-center justify-center">
                                {liveResultSrc ? <img src={liveResultSrc} className="max-w-full max-h-[65vh] object-contain block" alt="result" /> : <Loader2 className="animate-spin text-primary size-10" />}
                             </div>
                             <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 w-full max-w-lg">
                                <FilterBtn active={activeFilter === 'magic'} onClick={() => setActiveFilter('magic')} icon={Sparkles} label="Magic" />
                                <FilterBtn active={activeFilter === 'bw'} onClick={() => setActiveFilter('bw')} icon={ScanLine} label="B&W" />
                                <FilterBtn active={activeFilter === 'photo'} onClick={() => setActiveFilter('photo')} icon={ImageIcon} label="Photo" />
                                <FilterBtn active={activeFilter === 'gray'} onClick={() => setActiveFilter('gray')} icon={Droplets} label="Gray" />
                                <FilterBtn active={activeFilter === 'original'} onClick={() => setActiveFilter('original')} icon={RefreshCcw} label="Raw" />
                             </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-white dark:bg-slate-950 p-6 md:p-8 border-t flex justify-between gap-6">
                    <div className="hidden sm:flex items-center gap-4 text-[9px] font-black uppercase opacity-40">
                         <div className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-green-500"/> Privacy Secure</div>
                         <div className="flex items-center gap-1.5"><Zap className="size-4 text-yellow-500"/> 300 DPI Rendering</div>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <Button variant="outline" className="flex-1 sm:h-16 h-12 rounded-2xl font-black uppercase text-xs" onClick={() => setStage('viewfinder')}>Cancel</Button>
                        <Button className="flex-[2] sm:h-16 h-12 rounded-2xl bg-primary text-black font-black text-lg px-12 group" onClick={handleConfirmPage}>
                            CONFIRM & ADD <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        )}

        {stage === 'stack' && (
            <div className="flex flex-col items-center gap-10 animate-in fade-in duration-500">
                <div className="w-full flex justify-between items-center px-4">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl"><Layout className="size-7" /></div>
                        <div><h2 className="text-3xl font-black uppercase tracking-tighter">Page Stack</h2><p className="text-[10px] font-bold text-muted-foreground uppercase">{scannedPages.length} Pages ready</p></div>
                    </div>
                    <Button onClick={() => setStage('viewfinder')} className="h-14 px-8 border-4 border-dashed rounded-2xl hover:bg-primary/5 group" variant="outline">
                        <Plus className="mr-2 group-hover:rotate-90 transition-transform" /> Add Another Page
                    </Button>
                </div>
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6">
                    {scannedPages.map((p, idx) => (
                        <Card key={p.id} className="group relative rounded-3xl overflow-hidden border-2 shadow-xl hover:border-primary/50 transition-all aspect-[3/4] bg-white">
                            <img src={p.processedSrc} className="size-full object-cover" alt="p" />
                            <div className="absolute top-4 left-4 bg-black/80 text-white text-[9px] px-3 py-1 rounded-full font-black">PAGE {idx+1}</div>
                            <Button size="icon" variant="destructive" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all rounded-xl" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}><Trash2 className="size-4"/></Button>
                        </Card>
                    ))}
                </div>
                <Card className="w-full max-w-2xl bg-slate-950 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 size-40 bg-primary/10 blur-[60px]" />
                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-8">Export Full Document</h3>
                    <Button className="h-20 w-full max-w-sm bg-primary text-black font-black text-2xl rounded-2xl shadow-xl active:scale-95" onClick={handleBuildPdf} disabled={isBuildingPdf}>
                        {isBuildingPdf ? <Loader2 className="animate-spin mr-3"/> : <Download className="mr-3"/>} GENERATE PDF
                    </Button>
                </Card>
            </div>
        )}
    </div>
  );
}

function FilterBtn({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button onClick={onClick} className={cn(
            "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all group",
            active ? "bg-white border-primary shadow-lg scale-105" : "bg-white/50 border-transparent opacity-60"
        )}>
            <div className={cn("size-8 rounded-lg flex items-center justify-center", active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                <Icon className="size-4" />
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}
