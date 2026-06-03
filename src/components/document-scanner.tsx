
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
  
  // Default values locked: 145, 96, 70, 2.5
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

  // 8-Dot Scanner Handles
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

    // STEP 1: CREATE ROTATED SOURCE BUFFER (THE "VISUAL SOURCE")
    const visualSourceCanvas = document.createElement('canvas');
    if (rotation % 180 !== 0) {
        visualSourceCanvas.width = image.naturalHeight;
        visualSourceCanvas.height = image.naturalWidth;
    } else {
        visualSourceCanvas.width = image.naturalWidth;
        visualSourceCanvas.height = image.naturalHeight;
    }
    const vsCtx = visualSourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!vsCtx) return "";

    vsCtx.save();
    vsCtx.translate(visualSourceCanvas.width / 2, visualSourceCanvas.height / 2);
    vsCtx.rotate((rotation * Math.PI) / 180);
    vsCtx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
    vsCtx.restore();

    // STEP 2: APPLY CROP ON THE VISUAL BUFFER
    const finalCanvas = document.createElement('canvas');
    const fCtx = finalCanvas.getContext('2d', { willReadFrequently: true });
    if (!fCtx) return "";

    if (cropMode === 'rect') {
        const c = completedRectCrop || { x: 5, y: 5, width: 90, height: 90, unit: 'px' } as PixelCrop;
        // Scale percentages to visualSource dimensions
        const scaleX = visualSourceCanvas.width / (imgRef.current?.width || 1);
        const scaleY = visualSourceCanvas.height / (imgRef.current?.height || 1);
        finalCanvas.width = Math.max(10, c.width * scaleX);
        finalCanvas.height = Math.max(10, c.height * scaleY);
        fCtx.drawImage(visualSourceCanvas, c.x * scaleX, c.y * scaleY, c.width * scaleX, c.height * scaleY, 0, 0, finalCanvas.width, finalCanvas.height);
    } else {
        const corners = [points[0], points[2], points[4], points[6]].map(p => ({ 
            x: (p.x / 100) * visualSourceCanvas.width, 
            y: (p.y / 100) * visualSourceCanvas.height 
        }));
        
        const w1 = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
        const w2 = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
        const h1 = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
        const h2 = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
        
        const targetWidth = Math.max(10, Math.floor(Math.max(w1, w2)));
        const targetHeight = Math.max(10, Math.floor(Math.max(h1, h2)));
        finalCanvas.width = targetWidth; finalCanvas.height = targetHeight;

        const dstPoints = [{ x: 0, y: 0 }, { x: targetWidth, y: 0 }, { x: targetWidth, y: targetHeight }, { x: 0, y: targetHeight }];
        const h = solvePerspective(dstPoints, corners);
        const imgData = fCtx.createImageData(targetWidth, targetHeight);
        const srcPixels = vsCtx.getImageData(0, 0, visualSourceCanvas.width, visualSourceCanvas.height).data;

        if (srcPixels) {
            for (let y = 0; y < targetHeight; y++) {
                for (let x = 0; x < targetWidth; x++) {
                    const z = h[6] * x + h[7] * y + 1;
                    const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
                    const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
                    if (sx >= 0 && sx < visualSourceCanvas.width && sy >= 0 && sy < visualSourceCanvas.height) {
                        const dstIdx = (y * targetWidth + x) * 4;
                        const srcIdx = (sy * visualSourceCanvas.width + sx) * 4;
                        imgData.data[dstIdx] = srcPixels[srcIdx];
                        imgData.data[dstIdx+1] = srcPixels[srcIdx+1];
                        imgData.data[dstIdx+2] = srcPixels[srcIdx+2];
                        imgData.data[dstIdx+3] = srcPixels[srcIdx+3];
                    }
                }
            }
            fCtx.putImageData(imgData, 0, 0);
        }
    }

    // STEP 3: APPLY FILTERS & SHARPNESS
    const imageData = fCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);
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
            const val = luma > 180 ? 255 : luma < 100 ? luma * 0.7 : luma;
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
    fCtx.putImageData(imageData, 0, 0);

    if (sharpness[0] > 0) {
        const factor = sharpness[0] / 3.0;
        const weights = [0, -factor, 0, -factor, 1 + (4 * factor), -factor, 0, -factor, 0];
        const currentData = fCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);
        const src = currentData.data;
        const out = fCtx.createImageData(finalCanvas.width, finalCanvas.height);
        const dst = out.data;

        for (let y = 0; y < finalCanvas.height; y++) {
            for (let x = 0; x < finalCanvas.width; x++) {
                const i = (y * finalCanvas.width + x) * 4;
                let r = 0, g = 0, b = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const scy = Math.min(finalCanvas.height - 1, Math.max(0, y + ky));
                        const scx = Math.min(finalCanvas.width - 1, Math.max(0, x + kx));
                        const srcOff = (scy * finalCanvas.width + scx) * 4;
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
        fCtx.putImageData(out, 0, 0);
    }

    return finalCanvas.toDataURL('image/jpeg', 0.95);
  }, [currentRawImage, cropMode, points, activeFilter, completedRectCrop, brightness, contrast, saturation, sharpness, rotation]);

  useEffect(() => {
    if (stage === 'adjust' && currentRawImage && isImageReady) {
        const timer = setTimeout(async () => {
            setIsProcessing(true);
            const res = await applyIntelligentScan();
            setLiveResultSrc(res);
            setIsProcessing(false);
        }, 250);
        return () => clearTimeout(timer);
    }
  }, [points, activeFilter, cropMode, completedRectCrop, stage, currentRawImage, isImageReady, applyIntelligentScan, brightness, contrast, saturation, sharpness, rotation]);

  const handleConfirmAdd = () => {
    if (!liveResultSrc) return;
    const newPage = { id: Math.random().toString(36).substr(2, 9), processedSrc: liveResultSrc };
    setScannedPages(prev => [...prev, newPage]);
    setCurrentRawImage(null); setLiveResultSrc(null); setStage('viewfinder');
    toast({ title: "Page Added", description: "Document bundle updated." });
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

    // Inverse 2D Transformation to map back to content space
    const rad = (-rotation * Math.PI) / 180;
    const dx = xScreen - 0.5;
    const dy = yScreen - 0.5;
    
    let nx, ny;
    if (rotation % 180 !== 0) {
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

  const handleDownloadPdf = () => {
    const pdf = new jsPDF();
    scannedPages.forEach((p, i) => { if(i > 0) pdf.addPage(); pdf.addImage(p.processedSrc, 'JPEG', 0, 0, 210, 297); });
    pdf.save(`gr7-scan-${Date.now()}.pdf`); 
    toast({ title: "PDF Downloaded" });
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-700 relative mt-8">
        
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start w-full">
                <div className="lg:col-span-8">
                    <Card className="w-full border-2 border-dashed bg-card/50 text-center rounded-[3rem] overflow-hidden shadow-2xl hover:border-primary/40 transition-all">
                        <CardHeader className="pt-12 pb-6">
                            <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary animate-pulse shadow-inner"><ScanLine className="size-10" /></div>
                            <CardTitle className="text-4xl font-black uppercase tracking-tighter leading-none">Industrial <span className="text-primary">Scanner</span></CardTitle>
                        </CardHeader>
                        <CardContent className="pb-16 pt-4 px-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                <div className="border-4 border-dashed border-primary/20 rounded-[2.5rem] p-12 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-primary/5 transition-all group shadow-sm bg-white dark:bg-slate-900" onClick={startCamera}>
                                    <div className="size-16 rounded-2xl bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl"><Camera className="size-8" /></div>
                                    <p className="text-sm font-black uppercase tracking-widest">Live Capture</p>
                                </div>
                                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2.5rem] p-12 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/5 transition-all group shadow-sm bg-white dark:bg-slate-900" onClick={() => fileInputRef.current?.click()}>
                                    <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform shadow-xl"><UploadCloud className="size-8" /></div>
                                    <p className="text-sm font-black uppercase tracking-widest">Device Gallery</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-4 h-full">
                    <Card className="border-2 shadow-2xl flex flex-col bg-card/50 rounded-[3rem] h-full min-h-[400px]">
                        <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3"><FileStack className="size-5 text-primary" /> BUNDLE STACK</CardTitle>
                            <Badge className="bg-primary text-white font-black px-3 py-1 rounded-full text-xs shadow-md">{scannedPages.length}</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 p-6">
                            {scannedPages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20 gap-4">
                                    <FileArchive className="size-20" />
                                    <p className="text-xs font-black uppercase tracking-[0.2em]">Queue is Empty</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                    {scannedPages.map((p, i) => (
                                        <div key={p.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 bg-white shadow-xl group hover:border-primary transition-all">
                                            <img src={p.processedSrc} className="size-full object-cover" alt="scan" />
                                            <div className="absolute top-2 left-2 size-6 rounded-lg bg-black/80 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">{i+1}</div>
                                            <Button size="icon" variant="destructive" className="absolute top-2 right-2 size-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}><Trash2 className="size-4" /></Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-6 border-t bg-muted/10">
                            <Button disabled={scannedPages.length === 0} className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-black text-base rounded-2xl shadow-2xl uppercase active:scale-95 transition-all" onClick={handleDownloadPdf}>BUILD PDF BUNDLE <Download className="ml-2 size-5" /></Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {stage === 'adjust' && currentRawImage && (
            <div className="grid lg:grid-cols-12 gap-8 items-stretch animate-in slide-in-from-bottom-6 duration-500 w-full px-2">
                
                {/* LEFT Panel: Adjustment */}
                <Card className="lg:col-span-6 border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden rounded-[3rem] bg-slate-950 flex flex-col min-h-[650px]">
                    <CardHeader className="bg-slate-900 border-b border-white/5 p-6 flex flex-row items-center justify-between text-white">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                                <ScanLine className="size-6" />
                            </div>
                            <CardTitle className="text-xl font-black uppercase tracking-tighter">ADJUSTMENT</CardTitle>
                        </div>
                        <div className="flex items-center gap-4">
                            <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as any)} className="bg-white/10 p-1 rounded-xl border border-white/10">
                                <TabsList className="grid grid-cols-2 h-10 bg-transparent w-[180px]">
                                    <TabsTrigger value="rect" className="text-[10px] font-black uppercase data-[state=active]:bg-white data-[state=active]:text-slate-900">RECT</TabsTrigger>
                                    <TabsTrigger value="scanner" className="text-[10px] font-black uppercase data-[state=active]:bg-white data-[state=active]:text-slate-900">SCANNER</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/20 text-white hover:bg-white/10 shadow-xl" onClick={() => setRotation(r => (r + 90) % 360)}>
                                <RotateCw className="size-5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col items-center justify-center relative overflow-hidden select-none bg-black/40 flex-1"
                                 onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                        
                        <div ref={containerRef} className="relative cursor-crosshair transform-gpu bg-black max-w-full my-12" style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                            {cropMode === 'rect' ? (
                                <ReactCrop crop={rectCrop} onChange={(_, p) => setRectCrop(p)} onComplete={c => setCompletedRectCrop(c)} className="max-h-[65vh]">
                                    <img ref={imgRef} src={currentRawImage} alt="source" className="max-h-[65vh] w-auto object-contain block" onLoad={onImageLoad} />
                                </ReactCrop>
                            ) : (
                                <div className="relative">
                                    <img ref={imgRef} src={currentRawImage} alt="scanner" className="max-h-[65vh] w-auto pointer-events-none block object-contain" onLoad={onImageLoad} />
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <polygon points={`${points[0].x},${points[0].y} ${points[2].x},${points[2].y} ${points[4].x},${points[4].y} ${points[6].x},${points[6].y}`} className="fill-primary/10 stroke-primary stroke-[0.8] stroke-dasharray-[5,5]" />
                                    </svg>
                                    {points.map((p, i) => (
                                        <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-primary shadow-2xl cursor-grab active:cursor-grabbing z-20 flex items-center justify-center transition-transform", draggingPoint === i ? "bg-white scale-125" : "bg-white/90")}
                                            style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                                            onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}><div className="size-2.5 bg-primary rounded-full" /></div>
                                    ))}
                                    {draggingPoint !== null && (
                                        <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 md:size-48 rounded-full border-4 border-primary shadow-3xl bg-white animate-in zoom-in-50" style={{ transform: `rotate(${-rotation}deg)` }}>
                                            <img src={currentRawImage} alt="mag" className="absolute max-w-none origin-top-left"
                                                style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} 
                                            /><div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-full h-0.5 bg-primary/30 absolute" /><div className="h-full w-0.5 bg-primary/30 absolute" /></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-3 bg-black/60 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl z-40">
                            <Grip className="size-4 text-primary animate-pulse" /> PRECISION HANDLES ACTIVE
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-950 p-6 border-t border-white/5 flex flex-col gap-4">
                        <Button className="w-full h-16 rounded-2xl bg-primary text-slate-950 font-black text-lg shadow-2xl active:scale-95 transition-all" onClick={handleConfirmAdd}>CONFIRM & ADD PAGE</Button>
                        <Button variant="ghost" className="w-full h-10 font-black uppercase text-[10px] text-white/40 hover:text-white" onClick={() => { setCurrentRawImage(null); setStage('viewfinder'); }}>CANCEL SCAN</Button>
                    </CardFooter>
                </Card>

                {/* RIGHT Panel: Preview */}
                <Card className="lg:col-span-6 border-none shadow-3xl overflow-hidden rounded-[3rem] bg-white dark:bg-slate-900 flex flex-col h-full min-h-[650px]">
                    <CardHeader className="bg-[#f0f9f9] dark:bg-slate-800 border-b p-6 flex flex-row items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 shadow-md border border-green-500/20">
                                <Eye className="size-6" />
                            </div>
                            <CardTitle className="text-xl font-black uppercase tracking-tighter">HD RESULT PREVIEW</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" className="size-10 rounded-full text-muted-foreground hover:bg-muted" onClick={() => { setCurrentRawImage(null); setStage('viewfinder'); }}>
                            <X className="size-5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-black/20 shadow-inner relative overflow-hidden">
                        <div className="relative bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] rounded-sm border-[10px] border-white max-w-full flex items-center justify-center overflow-hidden">
                            {liveResultSrc ? <img src={liveResultSrc} className="max-w-full max-h-[55vh] object-contain block animate-in fade-in duration-500" alt="result" /> : <Loader2 className="animate-spin size-16 text-primary opacity-20" />}
                            {isProcessing && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10"><Loader2 className="animate-spin size-12 text-primary" /><p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Rendering HD...</p></div>}
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 border-t bg-[#f0f9f9] dark:bg-slate-800">
                        <div className="w-full flex items-center justify-between gap-6">
                             <div className="flex items-center gap-3">
                                <Button variant={activeFilter === 'document' ? 'default' : 'outline'} size="icon" className="h-12 w-12 rounded-2xl shadow-md border-2" onClick={() => { setActiveFilter('document'); setBrightness([145]); setContrast([96]); setSaturation([70]); }} title="Document"><FileText className="size-5"/></Button>
                                <Button variant={activeFilter === 'magic' ? 'default' : 'outline'} size="icon" className="h-12 w-12 rounded-2xl shadow-md border-2" onClick={() => { setActiveFilter('magic'); setBrightness([110]); setContrast([110]); setSaturation([130]); }} title="Magic Color"><Sparkles className="size-5"/></Button>
                                <Button variant={activeFilter === 'bw' ? 'default' : 'outline'} size="icon" className="h-12 w-12 rounded-2xl shadow-md border-2" onClick={() => { setActiveFilter('bw'); setBrightness([120]); setContrast([150]); }} title="B&W Pro"><Highlighter className="size-5"/></Button>
                                <Button variant={activeFilter === 'gray' ? 'default' : 'outline'} size="icon" className="h-12 w-12 rounded-2xl shadow-md border-2" onClick={() => { setActiveFilter('gray'); }} title="Grayscale"><Layers className="size-5"/></Button>
                             </div>
                             <div className="flex items-center gap-3">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl shadow-md border-2 text-primary"><Settings2 className="size-5"/></Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md rounded-[3rem] border-2 shadow-3xl">
                                        <DialogHeader><DialogTitle className="uppercase font-black tracking-widest text-primary flex items-center gap-3"><Settings2 className="size-6"/> Fine-Tune Engine</DialogTitle></DialogHeader>
                                        <div className="space-y-8 py-8">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><span className="text-[11px] font-black uppercase flex items-center gap-2"><Sun className="size-4"/> Brightness</span><span className="text-xs font-mono font-black">{brightness[0]}%</span></div>
                                                <Slider min={50} max={200} step={1} value={brightness} onValueChange={setBrightness} />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><span className="text-[11px] font-black uppercase flex items-center gap-2"><Contrast className="size-4"/> Contrast</span><span className="text-xs font-mono font-black">{contrast[0]}%</span></div>
                                                <Slider min={50} max={200} step={1} value={contrast} onValueChange={setContrast} />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><span className="text-[11px] font-black uppercase flex items-center gap-2"><Zap className="size-4 text-yellow-500"/> Sharpness (HD)</span><span className="text-xs font-mono font-black">{sharpness[0]}</span></div>
                                                <Slider min={0} max={10} step={0.1} value={sharpness} onValueChange={setSharpness} />
                                            </div>
                                        </div>
                                        <DialogFooter><Button variant="ghost" className="w-full font-black uppercase text-xs h-12" onClick={() => { setBrightness([145]); setContrast([96]); setSaturation([70]); setSharpness([2.5]); }}>RESET TO DEFAULTS</Button></DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl shadow-md border-2 text-rose-500" onClick={() => { setCurrentRawImage(null); setStage('viewfinder'); }}><RotateCcw className="size-5"/></Button>
                             </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        )}

        <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleNativeCapture} />
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleNativeCapture} />
        
        <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 20px; }
        `}</style>
    </div>
  );
}
