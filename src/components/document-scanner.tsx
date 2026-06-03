
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
    Highlighter,
    Scan,
    Grid3X3,
    Monitor,
    ImageIcon,
    Grip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  
  // Industrial Defaults
  const [brightness, setBrightness] = useState([145]);
  const [contrast, setContrast] = useState([96]);
  const [saturation, setSaturation] = useState([70]);
  const [sharpness, setSharpness] = useState([2.5]);
  const [rotation, setRotation] = useState(0);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const [currentRawImage, setCurrentRawImage] = useState<string | null>(null);
  const [liveResultSrc, setLiveResultSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false);

  // Handles in CONTENT SPACE (0-100 relative to original image)
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

  const handleNativeCapture = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentRawImage(event.target?.result as string);
        setIsImageReady(false);
        setStage('adjust');
        setRotation(0);
        setPoints([{ x: 10, y: 10 }, { x: 50, y: 10 }, { x: 90, y: 10 }, { x: 90, y: 50 }, { x: 90, y: 90 }, { x: 50, y: 90 }, { x: 10, y: 90 }, { x: 10, y: 50 }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setRectCrop(centerCrop({ unit: '%', width: 90, height: 90 }, width, height));
    setIsImageReady(true);
  };

  const applyIntelligentScan = useCallback(async (): Promise<string> => {
    const image = imgRef.current;
    if (!image || !currentRawImage || !image.naturalWidth) return "";

    // Step 1: Create Rotated Content Buffer
    const visualCanvas = document.createElement('canvas');
    const isRotated = rotation % 180 !== 0;
    visualCanvas.width = isRotated ? image.naturalHeight : image.naturalWidth;
    visualCanvas.height = isRotated ? image.naturalWidth : image.naturalHeight;
    
    const vsCtx = visualCanvas.getContext('2d', { willReadFrequently: true });
    if (!vsCtx) return "";

    vsCtx.save();
    vsCtx.translate(visualCanvas.width / 2, visualCanvas.height / 2);
    vsCtx.rotate((rotation * Math.PI) / 180);
    vsCtx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
    vsCtx.restore();

    // Step 2: Apply Crop on Rotated Buffer
    const cropCanvas = document.createElement('canvas');
    const cCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
    if (!cCtx) return "";

    if (cropMode === 'rect') {
        const c = completedRectCrop || { x: 5, y: 5, width: 90, height: 90, unit: 'px' } as PixelCrop;
        const scaleX = visualCanvas.width / (imgRef.current?.width || 1);
        const scaleY = visualCanvas.height / (imgRef.current?.height || 1);
        cropCanvas.width = Math.max(10, c.width * scaleX);
        cropCanvas.height = Math.max(10, c.height * scaleY);
        cCtx.drawImage(visualCanvas, c.x * scaleX, c.y * scaleY, c.width * scaleX, c.height * scaleY, 0, 0, cropCanvas.width, cropCanvas.height);
    } else {
        const corners = [points[0], points[2], points[4], points[6]].map(p => ({ 
            x: (p.x / 100) * visualCanvas.width, 
            y: (p.y / 100) * visualCanvas.height 
        }));
        const w1 = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
        const w2 = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
        const h1 = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
        const h2 = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
        const tw = Math.max(10, Math.floor(Math.max(w1, w2)));
        const th = Math.max(10, Math.floor(Math.max(h1, h2)));
        cropCanvas.width = tw; cropCanvas.height = th;

        const dstPoints = [{ x: 0, y: 0 }, { x: tw, y: 0 }, { x: tw, y: th }, { x: 0, y: th }];
        const h = solvePerspective(dstPoints, corners);
        const imgData = cCtx.createImageData(tw, th);
        const srcPixels = vsCtx.getImageData(0, 0, visualCanvas.width, visualCanvas.height).data;

        for (let y = 0; y < th; y++) {
            for (let x = 0; x < tw; x++) {
                const z = h[6] * x + h[7] * y + 1;
                const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
                const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
                if (sx >= 0 && sx < visualCanvas.width && sy >= 0 && sy < visualCanvas.height) {
                    const di = (y * tw + x) * 4, si = (sy * visualCanvas.width + sx) * 4;
                    imgData.data[di] = srcPixels[si]; imgData.data[di+1] = srcPixels[si+1];
                    imgData.data[di+2] = srcPixels[si+2]; imgData.data[di+3] = srcPixels[si+3];
                }
            }
        }
        cCtx.putImageData(imgData, 0, 0);
    }

    // Step 3: Apply Filters
    const imageData = cCtx.getImageData(0, 0, cropCanvas.width, cropCanvas.height);
    const pixels = imageData.data;
    const bF = brightness[0] / 100, cF = contrast[0] / 100, sF = saturation[0] / 100;

    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i], g = pixels[i+1], b = pixels[i+2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        if (activeFilter === 'bw') r = g = b = luma > 128 ? 255 : 0;
        else if (activeFilter === 'document') {
            const v = luma > 180 ? 255 : luma < 100 ? luma * 0.7 : luma;
            r = g = b = v;
        } else if (activeFilter === 'gray') r = g = b = luma;

        if (activeFilter !== 'bw' && activeFilter !== 'gray') {
            r = luma + (r - luma) * sF; g = luma + (g - luma) * sF; b = luma + (b - luma) * sF;
        }
        pixels[i] = Math.max(0, Math.min(255, ((r / 255 - 0.5) * cF + 0.5) * 255 * bF));
        pixels[i+1] = Math.max(0, Math.min(255, ((g / 255 - 0.5) * cF + 0.5) * 255 * bF));
        pixels[i+2] = Math.max(0, Math.min(255, ((b / 255 - 0.5) * cF + 0.5) * 255 * bF));
    }
    cCtx.putImageData(imageData, 0, 0);

    // Step 4: Sharpness
    if (sharpness[0] > 0) {
        const factor = sharpness[0] / 3.0;
        const weights = [0, -factor, 0, -factor, 1 + (4 * factor), -factor, 0, -factor, 0];
        const curData = cCtx.getImageData(0, 0, cropCanvas.width, cropCanvas.height);
        const src = curData.data, out = cCtx.createImageData(cropCanvas.width, cropCanvas.height), dst = out.data;
        for (let y = 0; y < cropCanvas.height; y++) {
            for (let x = 0; x < cropCanvas.width; x++) {
                const i = (y * cropCanvas.width + x) * 4;
                let r = 0, g = 0, b = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const sy = Math.min(cropCanvas.height - 1, Math.max(0, y + ky)), sx = Math.min(cropCanvas.width - 1, Math.max(0, x + kx));
                        const si = (sy * cropCanvas.width + sx) * 4, wt = weights[(ky + 1) * 3 + (kx + 1)];
                        r += src[si] * wt; g += src[si + 1] * wt; b += src[si + 2] * wt;
                    }
                }
                dst[i] = Math.max(0, Math.min(255, r)); dst[i+1] = Math.max(0, Math.min(255, g)); dst[i+2] = Math.max(0, Math.min(255, b)); dst[i+3] = src[i+3];
            }
        }
        cCtx.putImageData(out, 0, 0);
    }
    return cropCanvas.toDataURL('image/jpeg', 0.95);
  }, [currentRawImage, cropMode, points, activeFilter, completedRectCrop, brightness, contrast, saturation, sharpness, rotation]);

  useEffect(() => {
    if (stage === 'adjust' && currentRawImage && isImageReady) {
        const timer = setTimeout(async () => {
            setIsProcessing(true);
            const res = await applyIntelligentScan();
            setLiveResultSrc(res);
            setIsProcessing(false);
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [points, activeFilter, cropMode, completedRectCrop, stage, currentRawImage, isImageReady, applyIntelligentScan, brightness, contrast, saturation, sharpness, rotation]);

  const handleConfirmAdd = () => {
    if (!liveResultSrc) return;
    setScannedPages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), processedSrc: liveResultSrc }]);
    setCurrentRawImage(null); setLiveResultSrc(null); setStage('viewfinder');
    toast({ title: "Page Saved" });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current || !points[draggingPoint]) return;
    if (e.cancelable) e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    let cx, cy;
    if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }

    // Convert Screen Mouse to Container-Relative Percentages
    let rx = ((cx - rect.left) / rect.width) * 100;
    let ry = ((cy - rect.top) / rect.height) * 100;

    // EXPERT FIX: INVERSE ROTATION MATRIX
    // We map visually rotated percentage back to absolute content percentage
    const rad = (-rotation * Math.PI) / 180;
    const s = Math.sin(rad), c = Math.cos(rad);
    
    // Map to [-50, 50] space for rotation
    const ox = rx - 50, oy = ry - 50;
    
    // Apply Inverse Rotation
    let x_content = ox * c - oy * s + 50;
    let y_content = ox * s + oy * c + 50;

    // Adjust for Aspect Ratio Swapping (90/270 degrees)
    if (rotation % 180 !== 0) {
        // When rotated 90/270, the mapping needs to flip its logic relative to the source image
        // because the visual width of the container now represents the content height.
        // The above matrix handles the vector rotation, but we must clamp to content bounds.
    }

    const x = Math.max(0, Math.min(100, x_content));
    const y = Math.max(0, Math.min(100, y_content));

    setMagnifierPos({ x: rx, y: ry }); // Magnifier stays in visual screen space for rendering
    
    setPoints(prev => {
        const next = [...prev];
        const idx = draggingPoint;
        if ([0, 2, 4, 6].includes(idx)) next[idx] = { x, y };
        else {
            // Midpoints (1, 3, 5, 7) move adjacent corners
            if (idx === 1) { next[0].y = y; next[2].y = y; } 
            else if (idx === 3) { next[2].x = x; next[4].x = x; } 
            else if (idx === 5) { next[6].y = y; next[4].y = y; } 
            else if (idx === 7) { next[0].x = x; next[6].x = x; } 
        }
        // Sync siblings
        next[1] = { x: (next[0].x + next[2].x) / 2, y: (next[0].y + next[2].y) / 2 };
        next[3] = { x: (next[2].x + next[4].x) / 2, y: (next[2].y + next[4].y) / 2 };
        next[5] = { x: (next[4].x + next[6].x) / 2, y: (next[4].y + next[6].y) / 2 };
        next[7] = { x: (next[6].x + next[0].x) / 2, y: (next[6].y + next[0].y) / 2 };
        return next;
    });
  }, [draggingPoint, points, rotation]);

  const handlePointDown = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
    setDraggingPoint(idx);
  };

  const handleDownloadPdf = () => {
    const pdf = new jsPDF();
    scannedPages.forEach((p, i) => { if(i > 0) pdf.addPage(); pdf.addImage(p.processedSrc, 'JPEG', 0, 0, 210, 297); });
    pdf.save(`Scan-${Date.now()}.pdf`);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-700 relative mt-12 overflow-x-hidden">
        
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start w-full px-4">
                <div className="lg:col-span-8">
                    <Card className="w-full border-2 border-dashed bg-card/50 text-center rounded-[3rem] overflow-hidden shadow-2xl hover:border-primary/40 transition-all">
                        <CardHeader className="pt-12 pb-6">
                            <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary animate-pulse shadow-inner"><ScanLine className="size-10" /></div>
                            <CardTitle className="text-4xl font-black uppercase tracking-tighter">Smart <span className="text-primary">Scanner</span></CardTitle>
                        </CardHeader>
                        <CardContent className="pb-16 pt-4 px-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                <div className="border-4 border-dashed border-primary/20 rounded-[2.5rem] p-12 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-primary/5 transition-all shadow-sm bg-white dark:bg-slate-900" onClick={startCamera}>
                                    <div className="size-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl"><Camera className="size-8" /></div>
                                    <p className="text-sm font-black uppercase tracking-widest">Live Capture</p>
                                </div>
                                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2.5rem] p-12 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/5 transition-all shadow-sm bg-white dark:bg-slate-900" onClick={() => fileInputRef.current?.click()}>
                                    <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground shadow-xl"><UploadCloud className="size-8" /></div>
                                    <p className="text-sm font-black uppercase tracking-widest">Gallery</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-4">
                    <Card className="border-2 shadow-2xl flex flex-col bg-card/50 rounded-[3rem] min-h-[400px]">
                        <CardHeader className="bg-primary/5 border-b p-6 flex items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest">BUNDLE ({scannedPages.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-6">
                            {scannedPages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20"><FileArchive className="size-16" /><p className="text-[10px] font-black uppercase mt-4">Queue Empty</p></div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {scannedPages.map((p, i) => (
                                        <div key={p.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 bg-white shadow-md group">
                                            <img src={p.processedSrc} className="size-full object-cover" alt="s" />
                                            <Button size="icon" variant="destructive" className="absolute top-1 right-1 size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}><Trash2 className="size-3.5" /></Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-6 border-t"><Button disabled={scannedPages.length === 0} className="w-full h-14 bg-green-600 font-black rounded-2xl shadow-xl hover:scale-105 transition-all" onClick={handleDownloadPdf}>DOWNLOAD PDF <Download className="ml-2 size-4" /></Button></CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {stage === 'adjust' && currentRawImage && (
            <div className="grid lg:grid-cols-12 gap-8 items-stretch animate-in slide-in-from-bottom-6 duration-500 w-full px-4 max-w-[1700px] mx-auto">
                
                {/* LEFT: ADJSUTMENT STUDIO */}
                <Card className="lg:col-span-6 border-none shadow-3xl overflow-hidden rounded-[3rem] bg-slate-950 flex flex-col min-h-[650px]">
                    <CardHeader className="bg-slate-900 border-b border-white/5 p-6 flex flex-row items-center justify-between text-white">
                        <div className="flex items-center gap-4"><div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-lg border border-primary/20"><ScanLine className="size-5" /></div><CardTitle className="text-xl font-black uppercase tracking-tighter">ADJUSTMENT</CardTitle></div>
                        <div className="flex items-center gap-4">
                            <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as any)} className="bg-white/10 p-1 rounded-xl border border-white/10">
                                <TabsList className="h-9 bg-transparent w-[160px]"><TabsTrigger value="rect" className="text-[10px] font-black uppercase">RECT</TabsTrigger><TabsTrigger value="scanner" className="text-[10px] font-black uppercase">SCANNER</TabsTrigger></TabsList>
                            </Tabs>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-white/20 text-white hover:bg-white/10" onClick={() => setRotation(r => (r + 90) % 360)}><RotateCw className="size-4" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col items-center justify-center relative overflow-hidden select-none bg-black/40 flex-1 group"
                                 onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                        
                        {/* UNIFIED ROTATED CONTAINER */}
                        <div ref={containerRef} className="relative cursor-crosshair transform-gpu transition-all duration-300 bg-black max-w-[95%] my-12" style={{ transform: `rotate(${rotation}deg)` }}>
                            {cropMode === 'rect' ? (
                                <ReactCrop crop={rectCrop} onChange={(_, p) => setRectCrop(p)} onComplete={c => setCompletedRectCrop(c)}>
                                    <img ref={imgRef} src={currentRawImage} alt="s" className="max-h-[60vh] w-auto block" onLoad={onImageLoad} />
                                </ReactCrop>
                            ) : (
                                <div className="relative">
                                    <img ref={imgRef} src={currentRawImage} alt="s" className="max-h-[60vh] w-auto pointer-events-none block" onLoad={onImageLoad} />
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <polygon points={`${points[0].x},${points[0].y} ${points[2].x},${points[2].y} ${points[4].x},${points[4].y} ${points[6].x},${points[6].y}`} className="fill-primary/10 stroke-primary stroke-[0.8] dash-array-[5,5]" />
                                    </svg>
                                    {points.map((p, i) => (
                                        <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-primary shadow-2xl cursor-grab active:scale-110 active:cursor-grabbing z-20 flex items-center justify-center transition-transform", draggingPoint === i ? "bg-white scale-125" : "bg-white/90")}
                                            style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }} onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}><div className="size-2.5 bg-primary rounded-full" /></div>
                                    ))}
                                    {draggingPoint !== null && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-44 rounded-full border-4 border-primary shadow-3xl bg-white animate-in zoom-in-50" style={{ transform: `rotate(${-rotation}deg)` }}>
                                            <img src={currentRawImage} alt="m" className="absolute max-w-none origin-top-left"
                                                style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} 
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px bg-primary/40 absolute"/><div className="h-full w-px bg-primary/40 absolute"/></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-3 bg-black/60 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 z-40 shadow-2xl"><Grip className="size-4 text-primary animate-pulse" /> PRECISION HANDLES ACTIVE</div>
                    </CardContent>
                    <CardFooter className="bg-slate-950 p-6 border-t border-white/5 flex flex-col gap-4">
                        <Button className="w-full h-16 rounded-[1.5rem] bg-primary text-slate-950 font-black text-xl shadow-2xl active:scale-95 transition-all group" onClick={handleConfirmAdd}>
                            CONFIRM & ADD PAGE <ChevronRight className="ml-2 size-6 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button variant="ghost" className="w-full h-10 font-black uppercase text-[10px] text-white/40 hover:text-white" onClick={() => setStage('viewfinder')}>CANCEL SCAN</Button>
                    </CardFooter>
                </Card>

                {/* RIGHT: PREVIEW STUDIO */}
                <Card className="lg:col-span-6 border-none shadow-3xl overflow-hidden rounded-[3rem] bg-white dark:bg-slate-900 flex flex-col min-h-[650px]">
                    <CardHeader className="bg-[#f0f9f9] dark:bg-slate-800 border-b p-6 flex flex-row items-center justify-between">
                         <div className="flex items-center gap-4"><div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 shadow-md border border-green-500/20"><Eye className="size-5" /></div><CardTitle className="text-xl font-black uppercase tracking-tighter">HD RESULT PREVIEW</CardTitle></div>
                         <Button variant="ghost" size="icon" className="size-10 rounded-full hover:bg-destructive/5 text-destructive" onClick={() => { setCurrentRawImage(null); setStage('viewfinder'); }}><X className="size-6" /></Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center bg-slate-50 dark:bg-black/20 shadow-inner relative overflow-hidden">
                        <div className="relative bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[12px] border-white max-w-full flex items-center justify-center overflow-hidden transition-all duration-300">
                            {liveResultSrc ? <img src={liveResultSrc} className="max-w-full max-h-[55vh] object-contain block animate-in fade-in zoom-in-95 duration-500" alt="r" /> : <Loader2 className="animate-spin size-16 text-primary opacity-20" />}
                            {isProcessing && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10"><Loader2 className="animate-spin size-12 text-primary" /><p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Rendering HD Studio...</p></div>}
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 border-t bg-[#f0f9f9] dark:bg-slate-800">
                        <div className="w-full flex items-center justify-between gap-4">
                             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                                <Button variant={activeFilter === 'document' ? 'default' : 'outline'} size="icon" className="h-12 w-12 rounded-xl shadow-md border-2" onClick={() => { setActiveFilter('document'); setBrightness([145]); setContrast([96]); setSaturation([70]); }} title="Document Pro"><FileText className="size-5"/></Button>
                                <Button variant={activeFilter === 'magic' ? 'default' : 'outline'} size="icon" className="h-12 w-12 rounded-xl shadow-md border-2" onClick={() => { setActiveFilter('magic'); setBrightness([110]); setContrast([110]); setSaturation([130]); }} title="Magic Color"><Sparkles className="size-5"/></Button>
                                <Button variant={activeFilter === 'bw' ? 'default' : 'outline'} size="icon" className="h-12 w-12 rounded-xl shadow-md border-2" onClick={() => { setActiveFilter('bw'); setBrightness([120]); setContrast([150]); }} title="BW PRO"><Highlighter className="size-5"/></Button>
                                <Button variant={activeFilter === 'gray' ? 'default' : 'outline'} size="icon" className="h-12 w-12 rounded-xl shadow-md border-2" onClick={() => { setActiveFilter('gray'); setBrightness([110]); setContrast([100]); setSaturation([0]); }} title="Grayscale"><Layers className="size-5"/></Button>
                             </div>
                             <div className="flex items-center gap-3">
                                <Dialog>
                                    <DialogTrigger asChild><Button variant="outline" size="icon" className="h-12 w-12 rounded-xl shadow-md border-2 text-primary hover:bg-primary/5 transition-all"><Settings2 className="size-5"/></Button></DialogTrigger>
                                    <DialogContent className="max-w-md rounded-[2.5rem] border-2 shadow-3xl bg-white dark:bg-slate-950">
                                        <DialogHeader><DialogTitle className="uppercase font-black tracking-widest text-primary flex items-center gap-3 py-2"><Settings2 className="size-6"/> Fine-Tune Engine</DialogTitle></DialogHeader>
                                        <div className="space-y-8 py-8 px-2">
                                            <div className="space-y-4"><div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-muted-foreground"><Sun className="size-4 inline mr-2 text-yellow-500"/> Brightness</span><Badge variant="secondary" className="font-mono text-xs">{brightness[0]}%</Badge></div><Slider min={50} max={200} step={1} value={brightness} onValueChange={setBrightness} /></div>
                                            <div className="space-y-4"><div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-muted-foreground"><Contrast className="size-4 inline mr-2 text-orange-500"/> Contrast</span><Badge variant="secondary" className="font-mono text-xs">{contrast[0]}%</Badge></div><Slider min={50} max={200} step={1} value={contrast} onValueChange={setContrast} /></div>
                                            <div className="space-y-4"><div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-muted-foreground"><Zap className="size-4 inline mr-2 text-primary"/> Sharpness HD</span><Badge variant="secondary" className="font-mono text-xs">{sharpness[0]}</Badge></div><Slider min={0} max={10} step={0.1} value={sharpness} onValueChange={setSharpness} /></div>
                                        </div>
                                        <DialogFooter className="bg-muted/10 p-4 -mx-6 -mb-6 border-t"><Button variant="ghost" className="w-full font-black uppercase text-[10px] tracking-widest text-muted-foreground" onClick={() => { setBrightness([145]); setContrast([96]); setSaturation([70]); setSharpness([2.5]); }}>RESET ENGINE DEFAULTS</Button></DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl shadow-md border-2 text-rose-500 hover:bg-destructive/5 transition-all" onClick={() => { setRotation(0); resetAdjustments(); }} title="Reset Visuals"><RotateCcw className="size-5"/></Button>
                             </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        )}

        <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleNativeCapture} />
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleNativeCapture} />
    </div>
  );

  function resetAdjustments() {
      setBrightness([145]);
      setContrast([96]);
      setSaturation([70]);
      setSharpness([2.5]);
      setActiveFilter('document');
  }
}
