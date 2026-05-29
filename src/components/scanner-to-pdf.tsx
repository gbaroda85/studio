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
    RefreshCcw,
    Zap, 
    ShieldCheck, 
    ScanLine,
    Monitor,
    Smartphone,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Palette,
    Maximize,
    Move,
    Grid3X3,
    Sun,
    Contrast,
    RotateCw,
    FileType,
    Image as ImageIcon,
    Plus,
    Droplets,
    Scan
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';

interface Point {
    x: number;
    y: number;
}

type ScanFilter = 'original' | 'magic' | 'bw' | 'grayscale';
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
  
  // Viewfinder State
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Adjustment State (Perspective & Rect)
  const [currentRawImage, setCurrentRawImage] = useState<string | null>(null);
  const [rectCrop, setRectCrop] = useState<Crop>();
  const [completedRectCrop, setCompletedRectCrop] = useState<PixelCrop>();
  
  // 6 Dots Logic: 4 Corners + 2 Mid-Height points for better side alignment
  const [points, setPoints] = useState<Point[]>([
      { x: 10, y: 10 }, { x: 90, y: 10 },
      { x: 90, y: 50 }, { x: 90, y: 90 }, // Mid-right and Bottom-right
      { x: 10, y: 90 }, { x: 10, y: 50 }  // Bottom-left and Mid-left
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Studio State
  const [activeFilter, setActiveFilter] = useState<ScanFilter>('magic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBuildingPdf, setIsBuildingPdf] = useState(false);

  // 1. CAMERA MANAGEMENT
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
    
    // 1. Standard Rect Crop: Set to typical document ratio
    const initialCrop = centerCrop(
        { unit: '%', width: 85, height: 85 },
        width,
        height
    );
    setRectCrop(initialCrop);
    
    // 2. Smart 6-Dot Heuristic
    // We attempt to set dots near the visual "safe edges" of a standard document
    const marginX = 10; // 10% horizontal margin
    const marginY = 8;  // 8% vertical margin
    
    setPoints([
        { x: marginX, y: marginY }, { x: 100 - marginX, y: marginY },
        { x: 100 - marginX, y: 50 }, { x: 100 - marginX, y: 100 - marginY },
        { x: marginX, y: 100 - marginY }, { x: marginX, y: 50 }
    ]);
  };

  // 2. CAPTURE & IMPORT
  const handleCapture = () => {
    if (!videoRef.current || !hasCameraPermission) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCurrentRawImage(dataUrl);
      setStage('adjust');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result?.toString() || null;
        setCurrentRawImage(src);
        setStage('adjust');
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. PERSPECTIVE LOGIC (Uses 4 corner points for Homography)
  const solvePerspective = (src: Point[], dst: Point[]) => {
    const p = [];
    // Only corners (indices 0, 1, 3, 4) are used for matrix math
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

  const applyCorrection = async (): Promise<string> => {
    const image = imgRef.current;
    if (!image || !currentRawImage) return "";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return "";

    if (cropMode === 'rect') {
        if (!completedRectCrop) return "";
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = completedRectCrop.width * scaleX;
        canvas.height = completedRectCrop.height * scaleY;
        ctx.drawImage(image, completedRectCrop.x * scaleX, completedRectCrop.y * scaleY, completedRectCrop.width * scaleX, completedRectCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
    } else {
        const corners = [points[0], points[1], points[3], points[4]];
        const w1 = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
        const w2 = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
        const h1 = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
        const h2 = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
        
        const targetWidth = Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100));
        const targetHeight = Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100));
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const srcPoints = corners.map(p => ({ x: p.x * (image.naturalWidth / 100), y: p.y * (image.naturalHeight / 100) }));
        const dstPoints = [{ x: 0, y: 0 }, { x: targetWidth, y: 0 }, { x: targetWidth, y: targetHeight }, { x: 0, y: targetHeight }];
        const h = solvePerspective(srcPoints, dstPoints);
        
        const imgData = ctx.createImageData(targetWidth, targetHeight);
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = image.naturalWidth;
        srcCanvas.height = image.naturalHeight;
        const srcCtx = srcCanvas.getContext('2d');
        srcCtx?.drawImage(image, 0, 0);
        const srcData = srcCtx?.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;

        if (srcData) {
            for (let y = 0; y < targetHeight; y++) {
                for (let x = 0; x < targetWidth; x++) {
                    const z = h[6] * x + h[7] * y + 1;
                    const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
                    const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
                    if (sx >= 0 && sx < image.naturalWidth && sy >= 0 && sy < image.naturalHeight) {
                        const dstIdx = (y * targetWidth + x) * 4;
                        const srcIdx = (sy * image.naturalWidth + sx) * 4;
                        imgData.data[dstIdx] = srcData[srcIdx];
                        imgData.data[dstIdx+1] = srcData[srcIdx+1];
                        imgData.data[dstIdx+2] = srcData[srcIdx+2];
                        imgData.data[dstIdx+3] = srcData[srcIdx+3];
                    }
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }
    }

    // Default "Magic" Filter for Scan look
    const processedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = processedData.data;
    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i], g = pixels[i+1], b = pixels[i+2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        const factor = luma < 128 ? 1.05 : 1.15; 
        pixels[i] = Math.min(255, r * factor);
        pixels[i+1] = Math.min(255, g * factor);
        pixels[i+2] = Math.min(255, b * factor);
    }
    ctx.putImageData(processedData, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  const handleConfirmAdjustment = async () => {
    setIsProcessing(true);
    const result = await applyCorrection();
    const newPage: ScannedPage = {
        id: Math.random().toString(36).substr(2, 9),
        originalSrc: currentRawImage!,
        processedSrc: result,
        filter: 'magic'
    };
    setScannedPages(prev => [...prev, newPage]);
    setStage('stack');
    setIsProcessing(false);
    toast({ title: "Page Added", description: "Perspective corrected and enhanced." });
  };

  // 4. INTERACTION
  const updateMagnifier = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setMagnifierPos({ x, y });
    return { x, y };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current) return;
    if (e.cancelable) e.preventDefault();
    let clientX, clientY;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else { clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY; }
    const pos = updateMagnifier(clientX, clientY);
    if (pos) {
        setPoints(prev => {
            const next = [...prev];
            next[draggingPoint] = { x: pos.x, y: pos.y };
            return next;
        });
    }
  }, [draggingPoint, updateMagnifier]);

  const handlePointDown = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      let clientX, clientY;
      if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
      else { clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY; }
      updateMagnifier(clientX, clientY);
      setDraggingPoint(idx);
  };

  const handleBuildPdf = async () => {
    if (scannedPages.length === 0) return;
    setIsBuildingPdf(true);
    const pdf = new jsPDF();
    for (let i = 0; i < scannedPages.length; i++) {
        if (i > 0) pdf.addPage();
        const src = scannedPages[i].processedSrc;
        const imgProps = pdf.getImageProperties(src);
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pw / imgProps.width, ph / imgProps.height);
        const w = imgProps.width * ratio;
        const h = imgProps.height * ratio;
        pdf.addImage(src, 'JPEG', (pw - w) / 2, (ph - h) / 2, w, h, undefined, 'FAST');
    }
    pdf.save(`Scan-Bundle-${Date.now()}.pdf`);
    setIsBuildingPdf(false);
    toast({ title: "PDF Ready", description: "Downloaded locally in browser RAM." });
  };

  return (
    <div className="w-full max-w-7xl flex flex-col gap-6 animate-in fade-in duration-700 pb-20 px-4">
        
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-4">
                    <Card className="border-2 shadow-2xl overflow-hidden bg-black relative rounded-2xl md:rounded-[3rem]">
                        <CardHeader className="bg-muted/30 border-b py-2 px-6 flex flex-row items-center justify-between no-print">
                            <div className="flex items-center gap-2">
                                <ScanLine className="size-4 text-primary" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scanner Viewfinder</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 relative aspect-[4/3] flex items-center justify-center overflow-hidden">
                            <video ref={videoRef} className={cn("w-full h-full object-contain", hasCameraPermission !== true && "hidden")} autoPlay muted playsInline />
                            
                            {hasCameraPermission === false && (
                                <div className="p-12 text-center space-y-6 text-white w-full">
                                    <Camera className="size-16 mx-auto opacity-20" />
                                    <div className="space-y-4">
                                        <p className="font-black uppercase text-sm">Camera Offline</p>
                                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                            <Button onClick={startCamera} className="bg-primary rounded-xl font-black uppercase text-[10px]">Retry Access</Button>
                                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="rounded-xl font-black uppercase text-[10px]">Upload Photo</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {hasCameraPermission === true && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="size-[80%] border-2 border-dashed border-white/40 rounded-xl relative">
                                        <div className="absolute top-0 left-0 size-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                                        <div className="absolute top-0 right-0 size-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                                        <div className="absolute bottom-0 left-0 size-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                                        <div className="absolute bottom-0 right-0 size-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                                    </div>
                                </div>
                            )}
                            
                            <div className="absolute bottom-6 right-6 md:right-10 md:bottom-10 z-20">
                                <Button variant="secondary" className="h-10 md:h-12 rounded-xl font-black uppercase text-[9px] shadow-2xl ring-4 ring-black/20" onClick={() => fileInputRef.current?.click()}>
                                    <ImageIcon className="mr-2 size-3.5" /> OR UPLOAD FILE
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 md:p-8 bg-white dark:bg-slate-950 border-t flex flex-col sm:flex-row gap-4">
                            <Button onClick={handleCapture} className="h-14 flex-[2] bg-gradient-button text-white font-black text-lg md:text-xl rounded-2xl shadow-2xl group transition-all">
                                <Zap className="mr-3 size-6 text-yellow-400 group-hover:scale-125 transition-transform" /> CAPTURE DOCUMENT
                            </Button>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-2 shadow-2xl border-primary/10 flex flex-col bg-card/50 rounded-[2rem] min-h-[400px]">
                        <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                <FileDigit className="size-5 text-primary" /> Multi-Scan Stack
                            </CardTitle>
                            <Badge variant="outline" className="font-black text-primary border-primary/20">{scannedPages.length}</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 p-6">
                            {scannedPages.length === 0 ? (
                                <div className="py-20 text-center opacity-30 space-y-4">
                                    <Monitor className="size-16 mx-auto" />
                                    <p className="text-[10px] font-black uppercase">Wait for first scan</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                    {scannedPages.map((page, idx) => (
                                        <div key={page.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 bg-white group shadow-lg">
                                            <img src={page.processedSrc} className="size-full object-cover" alt="scanned" />
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[8px] px-2 py-0.5 rounded-full font-black">P{idx + 1}</div>
                                            <Button size="icon" variant="destructive" className="absolute top-2 right-2 size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setScannedPages(prev => prev.filter(p => p.id !== page.id))}><Trash2 className="size-3.5"/></Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-6 bg-muted/10 border-t">
                            <Button disabled={scannedPages.length === 0} className="w-full h-14 bg-primary font-black text-sm rounded-xl shadow-xl active:scale-95" onClick={handleBuildPdf}>
                                {isBuildingPdf ? <Loader2 className="animate-spin mr-2"/> : <Download className="mr-2 size-5" />} SAVE AS PDF
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {/* STAGE: ADJUST (RECT & 6-DOT SCANNER) */}
        {stage === 'adjust' && currentRawImage && (
            <Card className="w-full max-w-5xl mx-auto shadow-2xl border-none overflow-hidden rounded-[2.5rem] animate-in zoom-in-95 duration-500">
                <CardHeader className="bg-primary/5 border-b p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <Maximize className="size-6 text-primary" /> Adjustment Studio
                    </CardTitle>
                    <div className="flex items-center gap-3">
                         <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as CropMode)} className="bg-background/50 p-1 rounded-lg border">
                            <TabsList className="grid grid-cols-2 h-8">
                                <TabsTrigger value="rect" className="text-[10px] font-black uppercase px-4"><Maximize className="size-3 mr-1.5" /> Rect</TabsTrigger>
                                <TabsTrigger value="scanner" className="text-[10px] font-black uppercase px-4"><Scan className="size-3 mr-1.5" /> Scanner</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Button variant="ghost" onClick={() => setStage('viewfinder')} className="text-destructive"><X /></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 bg-slate-200 dark:bg-slate-900 flex flex-col items-center justify-center min-h-[450px] md:min-h-[650px] relative overflow-hidden select-none"
                             onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                    
                    <div ref={containerRef} className="relative cursor-crosshair shadow-2xl border-4 border-white transform-gpu bg-white max-w-[90vw]">
                        {cropMode === 'rect' ? (
                            <ReactCrop crop={rectCrop} onChange={c => setRectCrop(c)} onComplete={c => setCompletedRectCrop(c)} className="max-h-[60vh] md:max-h-[70vh]">
                                <img ref={imgRef} src={currentRawImage} alt="raw rect" className="max-h-[60vh] md:max-h-[70vh] w-auto object-contain block" onLoad={onImageLoad} />
                            </ReactCrop>
                        ) : (
                            <div className="relative">
                                <img ref={imgRef} src={currentRawImage} alt="raw capture" className="max-h-[60vh] md:max-h-[70vh] w-auto object-contain pointer-events-none block" onLoad={onImageLoad} />
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <polygon points={`${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[2].x},${points[2].y} ${points[3].x},${points[3].y} ${points[4].x},${points[4].y} ${points[5].x},${points[5].y}`} className="fill-primary/10 stroke-primary stroke-[0.8]" />
                                </svg>
                                {points.map((p, i) => (
                                    <div key={i} className={cn("absolute size-10 md:size-12 -ml-5 md:-ml-6 -mt-5 md:-mt-6 rounded-full border-4 border-white shadow-2xl cursor-grab active:cursor-grabbing z-20 flex items-center justify-center transition-all", draggingPoint === i ? "bg-primary scale-125 ring-4 ring-primary/20" : "bg-primary/90")}
                                         style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                                         onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}>
                                        <div className="size-2.5 md:size-3 bg-white rounded-full shadow-inner" />
                                    </div>
                                ))}

                                {draggingPoint !== null && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-32 md:size-48 rounded-full border-4 border-green-500 shadow-2xl bg-white animate-in zoom-in-50 ring-4 ring-white/50">
                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                            <div className="w-full h-0.5 bg-green-500/50 absolute" />
                                            <div className="h-full w-0.5 bg-green-500/50 absolute" />
                                            <div className="size-3 border-2 border-red-500 rounded-full bg-white/50 shadow-sm" />
                                        </div>
                                        <img src={currentRawImage} alt="magnify" className="absolute max-w-none origin-top-left"
                                            style={{ 
                                                width: `${(imgRef.current?.width || 0) * 4}px`,
                                                height: `${(imgRef.current?.height || 0) * 4}px`,
                                                left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`,
                                                top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)`
                                            }} 
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-8 flex items-center gap-3 px-6 py-3 bg-black/70 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl z-40">
                        <Move className="size-4 text-primary animate-pulse" /> 
                        {cropMode === 'rect' ? "Adjust rectangular box" : "Drag 6 points to edges of document"}
                    </div>
                </CardContent>
                <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex justify-between gap-4">
                    <Button variant="ghost" onClick={() => setStage('viewfinder')} className="font-black text-[10px] uppercase h-12 px-8 rounded-xl">DISCARD</Button>
                    <div className="flex gap-3 flex-1 justify-end">
                         <Button onClick={() => setPoints([{x:10, y:10}, {x:90, y:10}, {x:90, y:50}, {x:90, y:90}, {x:10, y:90}, {x:10, y:50}])} variant="outline" className="h-12 px-6 border-2 font-black text-[10px] uppercase rounded-xl">Auto Reset</Button>
                         <Button className="h-12 px-12 bg-primary font-black text-base rounded-xl shadow-2xl group" onClick={handleConfirmAdjustment} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="animate-spin size-5 mr-2" /> : <ChevronRight className="mr-2 size-5" />}
                            CONFIRM ADJUSTMENT
                         </Button>
                    </div>
                </CardFooter>
            </Card>
        )}

        {/* STAGE: STACK (POST-SCAN VIEW) */}
        {stage === 'stack' && (
            <div className="flex flex-col items-center gap-10 animate-in fade-in duration-500">
                <div className="w-full max-w-4xl flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                            <FileDigit className="size-7" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Document <span className="text-primary">Ready</span></h2>
                            <p className="text-sm font-bold text-muted-foreground uppercase opacity-60">Bundle of {scannedPages.length} high-definition pages.</p>
                        </div>
                    </div>
                    <Button onClick={() => setStage('viewfinder')} variant="outline" className="h-14 px-8 border-2 font-black text-xs uppercase rounded-2xl hover:border-primary transition-all">
                        <Plus className="mr-2 size-5" /> Add New Page
                    </Button>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     {scannedPages.map((page, idx) => (
                        <Card key={page.id} className="group overflow-hidden rounded-[2.5rem] border-2 shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all transform hover:-translate-y-2">
                            <div className="aspect-[3/4] relative bg-white flex items-center justify-center p-3">
                                <img src={page.processedSrc} className="size-full object-contain rounded-xl" alt="scan" />
                                <div className="absolute top-5 left-5 bg-black/80 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-black">PAGE {idx + 1}</div>
                                <div className="absolute bottom-5 inset-x-5 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Button size="sm" variant="destructive" className="h-10 px-6 font-black rounded-xl" onClick={() => setScannedPages(prev => prev.filter(p => p.id !== page.id))}>
                                        <Trash2 className="mr-2 size-4" /> Remove
                                     </Button>
                                </div>
                            </div>
                        </Card>
                     ))}
                     <button onClick={() => setStage('viewfinder')} className="aspect-[3/4] rounded-[2.5rem] border-4 border-dashed border-primary/20 flex flex-col items-center justify-center gap-4 hover:bg-primary/5 hover:border-primary transition-all group">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Plus className="size-8" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest text-primary/40">Scan More</span>
                     </button>
                </div>

                <Card className="w-full max-w-2xl bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl border-t border-white/10">
                     <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-3xl font-black uppercase tracking-tighter">Final Bundle</h3>
                            <p className="text-slate-400 text-sm font-medium">Render as single multi-page PDF.</p>
                        </div>
                        <Button 
                            className="h-20 px-12 bg-primary text-black font-black text-xl rounded-[1.5rem] shadow-2xl active:scale-95 transition-all group"
                            onClick={handleBuildPdf}
                            disabled={isBuildingPdf}
                        >
                            {isBuildingPdf ? <Loader2 className="animate-spin mr-3 size-8"/> : <Download className="mr-3 size-8 group-hover:translate-y-1 transition-transform" />}
                            DOWNLOAD PDF
                        </Button>
                     </div>
                </Card>
            </div>
        )}
    </div>
  );
}