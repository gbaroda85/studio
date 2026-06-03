
"use client";

import 'react-image-crop/dist/ReactCrop.css';
import React, { useState, useRef, useEffect, useCallback, type SyntheticEvent, type ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { 
    Camera, 
    Download, 
    X, 
    Loader2, 
    UploadCloud,
    CheckCircle2,
    Zap, 
    ShieldCheck, 
    ScanLine,
    RotateCw,
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
    SearchCode,
    Type,
    Wand2,
    RotateCcw,
    Eye,
    Droplets,
    Sun,
    Contrast,
    FileArchive,
    Highlighter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';

interface Point { x: number; y: number; }

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

type ScanFilter = 'original' | 'magic' | 'document' | 'bw' | 'photo' | 'gray';
type Stage = 'viewfinder' | 'live-camera' | 'adjust';

interface ScannedPage {
    id: string;
    processedSrc: string;
}

export default function DocumentScanner() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [stage, setStage] = useState<Stage>('viewfinder');
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [cropMode, setCropMode] = useState<'rect' | 'scanner'>('scanner');
  const [activeFilter, setActiveFilter] = useState<ScanFilter>('document');
  
  // Expert Specifications Defaults
  const [brightness, setBrightness] = useState([145]);
  const [contrast, setContrast] = useState([96]);
  const [saturation, setSaturation] = useState([70]);
  const [sharpness, setSharpness] = useState([2.5]);
  const [rotation, setRotation] = useState(0);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const [currentRawImage, setCurrentRawImage] = useState<string | null>(null);
  const [liveResultSrc, setLiveResultSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false);

  // 8-Point Scanner handles (In Unrotated Coordinate Space)
  const [points, setPoints] = useState<Point[]>([
    { x: 10, y: 10 }, { x: 50, y: 10 }, { x: 90, y: 10 }, 
    { x: 90, y: 50 }, { x: 90, y: 90 },                   
    { x: 50, y: 90 }, { x: 10, y: 90 },                   
    { x: 10, y: 50 }                                      
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  
  const [rectCrop, setRectCrop] = useState<Crop>();
  const [completedRectCrop, setCompletedRectCrop] = useState<PixelCrop>();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
    }
  }, [stream]);

  const startCamera = async () => {
    if (isMobile) {
        cameraInputRef.current?.click();
    } else {
        setIsVideoLoading(true);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false
            });
            setStream(mediaStream);
            setStage('live-camera');
        } catch (err) {
            setIsVideoLoading(false);
            toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access camera.' });
        }
    }
  };

  useEffect(() => {
    if (stage === 'live-camera' && stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().then(() => setIsVideoLoading(false)).catch(() => setIsVideoLoading(false));
    }
  }, [stage, stream]);

  const handleNativeCapture = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentRawImage(event.target?.result as string);
        setIsImageReady(false);
        setStage('adjust');
      };
      reader.readAsDataURL(file);
    }
  };

  const captureFrame = () => {
      if (!videoRef.current) return;
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.drawImage(video, 0, 0);
          setCurrentRawImage(canvas.toDataURL('image/jpeg', 0.95));
          setIsImageReady(false);
          stopCamera();
          setStage('adjust');
      }
  };

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setRectCrop(centerCrop({ unit: '%', width: 80, height: 80 }, width, height));
    setIsImageReady(true);
  };

  const applyIntelligentScan = useCallback(async (): Promise<string> => {
    const image = imgRef.current;
    if (!image || !currentRawImage || !image.naturalWidth) return "";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return "";

    // Content-Space Rotation Sanitization
    const tempCanvas = document.createElement('canvas');
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return "";
    
    if (rotation % 180 !== 0) {
        tempCanvas.width = image.naturalHeight;
        tempCanvas.height = image.naturalWidth;
    } else {
        tempCanvas.width = image.naturalWidth;
        tempCanvas.height = image.naturalHeight;
    }
    
    tCtx.translate(tempCanvas.width/2, tempCanvas.height/2);
    tCtx.rotate((rotation * Math.PI) / 180);
    tCtx.drawImage(image, -image.naturalWidth/2, -image.naturalHeight/2);

    if (cropMode === 'rect') {
        const c = completedRectCrop || { x: 10, y: 10, width: 80, height: 80, unit: 'px' } as PixelCrop;
        const scaleX = tempCanvas.width / (imgRef.current?.width || 1);
        const scaleY = tempCanvas.height / (imgRef.current?.height || 1);
        canvas.width = Math.max(10, c.width * scaleX);
        canvas.height = Math.max(10, c.height * scaleY);
        ctx.drawImage(tempCanvas, c.x * scaleX, c.y * scaleY, c.width * scaleX, c.height * scaleY, 0, 0, canvas.width, canvas.height);
    } else {
        const corners = [points[0], points[2], points[4], points[6]].map(p => ({ 
            x: (p.x / 100) * tempCanvas.width, 
            y: (p.y / 100) * tempCanvas.height 
        }));
        
        const w1 = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
        const w2 = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
        const h1 = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
        const h2 = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
        
        const targetWidth = Math.max(10, Math.floor(Math.max(w1, w2)));
        const targetHeight = Math.max(10, Math.floor(Math.max(h1, h2)));
        canvas.width = targetWidth; canvas.height = targetHeight;

        const dstPoints = [{ x: 0, y: 0 }, { x: targetWidth, y: 0 }, { x: targetWidth, y: targetHeight }, { x: 0, y: targetHeight }];
        const h = solvePerspective(dstPoints, corners);
        const imgData = ctx.createImageData(targetWidth, targetHeight);
        const srcPixels = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

        if (srcPixels) {
            for (let y = 0; y < targetHeight; y++) {
                for (let x = 0; x < targetWidth; x++) {
                    const z = h[6] * x + h[7] * y + 1;
                    const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
                    const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
                    if (sx >= 0 && sx < tempCanvas.width && sy >= 0 && sy < tempCanvas.height) {
                        const dstIdx = (y * targetWidth + x) * 4;
                        const srcIdx = (sy * tempCanvas.width + sx) * 4;
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

    // Filter Processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const bFactor = brightness[0] / 100;
    const cFactor = contrast[0] / 100;
    const sFactor = saturation[0] / 100;

    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i], g = pixels[i+1], b = pixels[i+2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;

        if (activeFilter === 'bw') {
            r = g = b = luma > 128 ? 255 : 0;
        } else if (activeFilter === 'document') {
            const val = luma > 180 ? 255 : luma < 100 ? luma * 0.6 : luma;
            r = g = b = val;
        } else if (activeFilter === 'gray') {
            r = g = b = luma;
        }

        if (activeFilter !== 'bw' && activeFilter !== 'gray') {
            r = luma + (r - luma) * sFactor;
            g = luma + (g - luma) * sFactor;
            b = luma + (b - luma) * sFactor;
        }

        pixels[i] = Math.max(0, Math.min(255, ((r / 255 - 0.5) * cFactor + 0.5) * 255 * bFactor));
        pixels[i+1] = Math.max(0, Math.min(255, ((g / 255 - 0.5) * cFactor + 0.5) * 255 * bFactor));
        pixels[i+2] = Math.max(0, Math.min(255, ((b / 255 - 0.5) * cFactor + 0.5) * 255 * bFactor));
    }
    ctx.putImageData(imageData, 0, 0);

    // High Sharpness Kernel
    if (sharpness[0] > 0) {
        const factor = sharpness[0] / 3.5;
        const weights = [0, -factor, 0, -factor, 1 + (4 * factor), -factor, 0, -factor, 0];
        const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const src = currentData.data;
        const output = ctx.createImageData(canvas.width, canvas.height);
        const dst = output.data;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const i = (y * canvas.width + x) * 4;
                let r = 0, g = 0, b = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const scy = Math.min(canvas.height - 1, Math.max(0, y + ky));
                        const scx = Math.min(canvas.width - 1, Math.max(0, x + kx));
                        const srcOff = (scy * canvas.width + scx) * 4;
                        const wt = weights[(ky + 1) * 3 + (kx + 1)];
                        r += src[srcOff] * wt; g += src[srcOff + 1] * wt; b += src[srcOff + 2] * wt;
                    }
                }
                dst[i] = Math.max(0, Math.min(255, r));
                dst[i+1] = Math.max(0, Math.min(255, g));
                dst[i+2] = Math.max(0, Math.min(255, b));
                dst[i+3] = src[i+3];
            }
        }
        ctx.putImageData(output, 0, 0);
    }

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [currentRawImage, cropMode, points, activeFilter, completedRectCrop, brightness, contrast, saturation, sharpness, rotation]);

  useEffect(() => {
    if (stage === 'adjust' && currentRawImage && isImageReady) {
        const timer = setTimeout(async () => {
            setIsProcessing(true);
            const res = await applyIntelligentScan();
            setLiveResultSrc(res);
            setIsProcessing(false);
        }, 200);
        return () => clearTimeout(timer);
    }
  }, [points, activeFilter, cropMode, completedRectCrop, stage, currentRawImage, isImageReady, applyIntelligentScan, brightness, contrast, saturation, sharpness, rotation]);

  const handleConfirmAdd = () => {
    if (!liveResultSrc) return;
    const newPage = { id: Math.random().toString(36).substr(2, 9), processedSrc: liveResultSrc };
    setScannedPages(prev => [...prev, newPage]);
    setCurrentRawImage(null); setLiveResultSrc(null); setStage('viewfinder');
    toast({ title: "Page Added", description: "Doc bundle updated." });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current || !points[draggingPoint]) return;
    if (e.cancelable) e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    let cx, cy;
    if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }

    const xScreen = (cx - rect.left) / rect.width;
    const yScreen = (cy - rect.top) / rect.height;

    // Inverse Rotation Matrix: Convert Visually Rotated Mouse to Content Space
    const rad = (-rotation * Math.PI) / 180;
    const dx = xScreen - 0.5;
    const dy = yScreen - 0.5;
    
    let nx, ny;
    if (rotation % 180 !== 0) {
        // Swap bounds factor for aspect change
        const aspect = rect.width / rect.height;
        nx = (dx * Math.cos(rad) - dy * Math.sin(rad) * (1/aspect)) + 0.5;
        ny = (dx * Math.sin(rad) * aspect + dy * Math.cos(rad)) + 0.5;
    } else {
        nx = (dx * Math.cos(rad) - dy * Math.sin(rad)) + 0.5;
        ny = (dx * Math.sin(rad) + dy * Math.cos(rad)) + 0.5;
    }

    const finalX = Math.max(0, Math.min(100, nx * 100));
    const finalY = Math.max(0, Math.min(100, ny * 100));

    setMagnifierPos({ x: finalX, y: finalY });
    setPoints(prev => {
        const next = [...prev];
        const idx = draggingPoint;
        if ([0, 2, 4, 6].includes(idx)) { next[idx] = { x: finalX, y: finalY }; }
        else {
            if (idx === 1) { next[0].y = finalY; next[2].y = finalY; } 
            else if (idx === 3) { next[2].x = finalX; next[4].x = finalX; } 
            else if (idx === 5) { next[6].y = finalY; next[4].y = finalY; } 
            else if (idx === 7) { next[0].x = finalX; next[6].x = finalX; } 
        }
        next[1] = { x: (next[0].x + next[2].x) / 2, y: (next[0].y + next[2].y) / 2 };
        next[3] = { x: (next[2].x + next[4].x) / 2, y: (next[2].y + next[4].y) / 2 };
        next[5] = { x: (next[4].x + next[6].x) / 2, y: (next[4].y + next[6].y) / 2 };
        next[7] = { x: (next[6].x + next[0].x) / 2, y: (next[6].y + next[0].y) / 2 };
        return next;
    });
  }, [draggingPoint, points, rotation]);

  const handlePointDown = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
      setDraggingPoint(idx);
      setMagnifierPos(points[idx]);
  };

  return (
    <div className="w-full max-w-[1600px] flex flex-col gap-4 animate-in fade-in duration-700 pb-20 px-4 mx-auto relative">
        
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                    <Card className="w-full border-2 border-dashed bg-card/50 text-center rounded-[2.5rem] overflow-hidden shadow-xl hover:-translate-y-1 transition-all">
                        <CardHeader className="pt-8 pb-4">
                            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary animate-pulse"><ScanLine className="size-8" /></div>
                            <CardTitle className="text-3xl font-black uppercase tracking-tighter leading-none">Smart <span className="text-primary">Scanner</span></CardTitle>
                        </CardHeader>
                        <CardContent className="pb-10 pt-2 px-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                                <div className="border-4 border-dashed border-primary/20 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-primary/5 transition-all group shadow-sm" onClick={startCamera}>
                                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl"><Camera className="size-5" /></div>
                                    <p className="text-[10px] font-black uppercase tracking-tighter">Capture Photo</p>
                                </div>
                                <div className="border-4 border-dashed border-muted-foreground/20 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/5 transition-all group shadow-sm" onClick={() => fileInputRef.current?.click()}>
                                    <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform"><UploadCloud className="size-5" /></div>
                                    <p className="text-[10px] font-black uppercase tracking-tighter">Pick from Album</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-4 h-full">
                    <Card className="border-2 shadow-2xl flex flex-col bg-card/50 rounded-[2.5rem] h-full min-h-[300px]">
                        <CardHeader className="bg-primary/5 border-b p-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-tighter flex items-center gap-3"><FileStack className="size-4 text-primary" /> COLLECTION</CardTitle>
                            <Badge className="bg-primary/20 text-primary font-black px-2 py-0.5 rounded-full text-[10px]">{scannedPages.length}</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 p-4">
                            {scannedPages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 opacity-20 gap-3">
                                    <FileArchive className="size-12" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No pages added</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                    {scannedPages.map((p, i) => (
                                        <div key={p.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 bg-white shadow-lg group hover:border-primary transition-all">
                                            <img src={p.processedSrc} className="size-full object-cover" alt="scan" />
                                            <div className="absolute top-1 left-1 size-5 rounded bg-black/60 backdrop-blur-md flex items-center justify-center text-[8px] font-black text-white">{i+1}</div>
                                            <Button size="icon" variant="destructive" className="absolute top-1 right-1 size-6 rounded opacity-0 group-hover:opacity-100 transition-all shadow-lg" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}><Trash2 className="size-3" /></Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-4 border-t bg-muted/10">
                            <Button disabled={scannedPages.length === 0} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-black text-xs rounded-xl shadow-xl uppercase active:scale-95 transition-all" onClick={() => {
                                const pdf = new jsPDF();
                                scannedPages.forEach((p, i) => { if(i > 0) pdf.addPage(); pdf.addImage(p.processedSrc, 'JPEG', 0, 0, 210, 297); });
                                pdf.save(`scan-${Date.now()}.pdf`); toast({ title: "PDF Exported" });
                            }}>EXPORT AS PDF <Download className="ml-2 size-3" /></Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {stage === 'adjust' && currentRawImage && (
            <div className="grid lg:grid-cols-12 gap-6 items-stretch animate-in slide-in-from-right-4 duration-500">
                <div className="lg:col-span-8 flex flex-col gap-4">
                    <Card className="border-none shadow-3xl overflow-hidden rounded-[2.5rem] bg-slate-950 flex flex-col flex-1 min-h-[500px]">
                        <CardHeader className="bg-slate-900 border-b p-4 md:p-6 flex flex-row items-center justify-between text-white flex-wrap gap-4">
                            <CardTitle className="text-base md:text-lg font-black uppercase tracking-tighter">Adjustment Studio</CardTitle>
                            <div className="flex items-center gap-2 md:gap-4 ml-auto">
                                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/20 text-white hover:bg-white/10" onClick={() => setRotation(r => (r + 90) % 360)}><RotateCw className="size-5" /></Button>
                                <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as any)} className="bg-white/10 p-1 rounded-xl border border-white/10">
                                    <TabsList className="grid grid-cols-2 h-9 bg-transparent w-[140px] md:w-[180px]">
                                        <TabsTrigger value="rect" className="text-[10px] font-black uppercase">RECT</TabsTrigger>
                                        <TabsTrigger value="scanner" className="text-[10px] font-black uppercase">SCANNER</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <Button variant="ghost" size="icon" onClick={() => setStage('viewfinder')} className="text-white hover:bg-white/10"><X className="size-6"/></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-center relative overflow-hidden select-none bg-black/40 flex-1 h-full"
                                     onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                            
                            <div ref={containerRef} className="relative cursor-crosshair shadow-2xl border-4 border-white/10 transform-gpu bg-black max-w-full" style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                                {cropMode === 'rect' ? (
                                    <ReactCrop crop={rectCrop} onChange={(_, p) => setRectCrop(p)} onComplete={c => setCompletedRectCrop(c)} className="max-h-[65vh]">
                                        <img ref={imgRef} src={currentRawImage} alt="source" className="max-h-[65vh] w-auto object-contain block" onLoad={onImageLoad} />
                                    </ReactCrop>
                                ) : (
                                    <div className="relative">
                                        <img ref={imgRef} src={currentRawImage} alt="scanner" className="max-h-[65vh] w-auto pointer-events-none block object-contain" onLoad={onImageLoad} />
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <polygon points={`${points[0].x},${points[0].y} ${points[2].x},${points[2].y} ${points[4].x},${points[4].y} ${points[6].x},${points[6].y}`} className="fill-primary/10 stroke-primary stroke-[0.8]" />
                                        </svg>
                                        {points.map((p, i) => (
                                            <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-2xl cursor-grab z-20 flex items-center justify-center", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/80")}
                                                style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                                                onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}><div className="size-3 bg-white rounded-full" /></div>
                                        ))}
                                        {draggingPoint !== null && (
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 md:size-48 rounded-full border-4 border-green-500 shadow-2xl bg-white animate-in zoom-in-50" style={{ transform: `rotate(${-rotation}deg)` }}>
                                                <img src={currentRawImage} alt="mag" className="absolute max-w-none origin-top-left"
                                                    style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} 
                                                /><div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-0.5 bg-green-500/50 absolute" /><div className="h-full w-0.5 bg-green-500/50 absolute" /></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-black/60 p-4 flex justify-center"><div className="flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-widest"><Move className="h-4 w-4 text-primary animate-pulse" /> Fine-tune edges for scanning</div></CardFooter>
                    </Card>
                </div>
                
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="border-none shadow-3xl overflow-hidden rounded-[2.5rem] bg-slate-100 dark:bg-slate-950 flex flex-col h-full">
                        <CardHeader className="bg-primary/5 border-b p-6 text-slate-800 dark:text-white shrink-0">
                            <CardTitle className="text-lg font-black uppercase tracking-tighter">Render Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-6 flex flex-col bg-white dark:bg-slate-900 shadow-inner overflow-hidden">
                            <ScrollArea className="h-full pr-2 custom-scrollbar">
                                <div className="relative bg-white shadow-3xl rounded-sm border-[4px] border-white max-w-full flex items-center justify-center overflow-hidden mb-8 min-h-[300px] md:min-h-[400px]" style={{ transform: `rotate(${rotation}deg)` }}>
                                    {liveResultSrc ? <img src={liveResultSrc} className="max-w-full max-h-full object-contain block animate-in fade-in" alt="result" /> : <Loader2 className="animate-spin size-10 text-primary opacity-20" />}
                                    {isProcessing && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}
                                </div>
                                
                                <div className="space-y-8 pb-10">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Sparkles className="size-3"/> Intelligent Presets</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['document', 'magic', 'bw', 'photo', 'gray', 'original'].map(f => (
                                                <Button key={f} variant={activeFilter === f ? 'default' : 'outline'} className="text-[8px] font-black h-10 rounded-xl" onClick={() => setActiveFilter(f as ScanFilter)}>{f.toUpperCase()}</Button>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator className="opacity-10" />

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Settings2 className="size-3"/> Fine Tuning</Label>
                                            <Button variant="ghost" size="sm" onClick={() => { setBrightness([145]); setContrast([96]); setSaturation([70]); setSharpness([2.5]); }} className="text-[8px] font-black uppercase text-muted-foreground h-6 px-2"><RotateCcw className="size-2.5 mr-1" /> Reset</Button>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center"><span className="text-[9px] font-bold uppercase opacity-60 flex items-center gap-1.5"><Sun className="size-3"/> Brightness</span><span className="text-[9px] font-mono font-black">{brightness[0]}%</span></div>
                                                <Slider min={50} max={200} step={1} value={brightness} onValueChange={setBrightness} />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center"><span className="text-[9px] font-bold uppercase opacity-60 flex items-center gap-1.5"><Contrast className="size-3"/> Contrast</span><span className="text-[9px] font-mono font-black">{contrast[0]}%</span></div>
                                                <Slider min={50} max={200} step={1} value={contrast} onValueChange={setContrast} />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center"><span className="text-[9px] font-bold uppercase opacity-60 flex items-center gap-1.5"><Droplets className="size-3"/> Saturation</span><span className="text-[9px] font-mono font-black">{saturation[0]}%</span></div>
                                                <Slider min={0} max={200} step={1} value={saturation} onValueChange={setSaturation} />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center"><span className="text-[9px] font-bold uppercase opacity-60 flex items-center gap-1.5"><Zap className="size-3 text-yellow-500"/> Sharpness (HD)</span><span className="text-[9px] font-mono font-black">{sharpness[0]}</span></div>
                                                <Slider min={0} max={10} step={0.1} value={sharpness} onValueChange={setSharpness} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <CardFooter className="p-6 border-t bg-white dark:bg-slate-950 flex flex-col gap-3 shrink-0">
                            <Button className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-xl active:scale-95 transition-all" onClick={handleConfirmAdd}>CONFIRM & ADD PAGE</Button>
                            <Button variant="ghost" className="w-full h-10 font-black uppercase text-[10px] text-muted-foreground" onClick={() => setStage('viewfinder')}>CANCEL SCAN</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleNativeCapture} />
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleNativeCapture} />
    </div>
  );
}
