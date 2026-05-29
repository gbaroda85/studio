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
    RotateCw,
    ImageIcon,
    Plus,
    Droplets,
    Scan,
    Layout,
    ArrowRightLeft,
    Eye,
    FileText,
    SearchCode
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
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentRawImage, setCurrentRawImage] = useState<string | null>(null);
  const [liveResultSrc, setLiveResultSrc] = useState<string | null>(null);
  
  // Rectangular Crop State
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

  const [activeFilter, setActiveFilter] = useState<ScanFilter>('magic');
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
    const initialCrop = centerCrop({ unit: '%', width: 85, height: 85 }, width, height);
    setRectCrop(initialCrop);
    
    // Initial 6 handles setup
    setPoints([
        { x: 10, y: 10 }, { x: 90, y: 10 },
        { x: 90, y: 50 }, { x: 90, y: 90 },
        { x: 10, y: 90 }, { x: 10, y: 50 }
    ]);
  };

  const solvePerspective = (src: Point[], dst: Point[]) => {
    const p = [];
    // Only use corners for warp: TL(0), TR(1), BR(3), BL(4)
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

  const applyCorrection = useCallback(async (): Promise<string> => {
    const image = imgRef.current;
    if (!image || !currentRawImage) return "";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return "";

    if (cropMode === 'rect') {
        const c = completedRectCrop || { x: 10, y: 10, width: 80, height: 80, unit: 'px' } as PixelCrop;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = (c.width * scaleX) || 1;
        canvas.height = (c.height * scaleY) || 1;
        ctx.drawImage(image, c.x * scaleX, c.y * scaleY, c.width * scaleX, c.height * scaleY, 0, 0, canvas.width, canvas.height);
    } else {
        const corners = [points[0], points[1], points[3], points[4]];
        const w1 = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
        const w2 = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
        const h1 = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
        const h2 = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
        
        const targetWidth = Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100));
        const targetHeight = Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100));
        canvas.width = targetWidth || 1;
        canvas.height = targetHeight || 1;

        const srcPoints = corners.map(p => ({ x: p.x * (image.naturalWidth / 100), y: p.y * (image.naturalHeight / 100) }));
        const dstPoints = [{ x: 0, y: 0 }, { x: targetWidth, y: 0 }, { x: targetWidth, y: targetHeight }, { x: 0, y: targetHeight }];
        
        const h = solvePerspective(dstPoints, srcPoints);
        const imgData = ctx.createImageData(canvas.width, canvas.height);
        
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = image.naturalWidth;
        srcCanvas.height = image.naturalHeight;
        const srcCtx = srcCanvas.getContext('2d');
        srcCtx?.drawImage(image, 0, 0);
        const srcData = srcCtx?.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;

        if (srcData) {
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const z = h[6] * x + h[7] * y + 1;
                    const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
                    const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
                    if (sx >= 0 && sx < image.naturalWidth && sy >= 0 && sy < image.naturalHeight) {
                        const dstIdx = (y * canvas.width + x) * 4;
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

    const processedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = processedData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i], g = pixels[i+1], b = pixels[i+2];

        if (activeFilter === 'magic') {
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            const factor = luma < 128 ? 1.2 : 1.4; 
            pixels[i] = Math.min(255, r * factor);
            pixels[i+1] = Math.min(255, g * factor);
            pixels[i+2] = Math.min(255, b * factor);
        } else if (activeFilter === 'bw') {
            const avg = (r + g + b) / 3;
            const res = avg > 140 ? 255 : 0;
            pixels[i] = pixels[i+1] = pixels[i+2] = res;
        } else if (activeFilter === 'grayscale') {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            pixels[i] = pixels[i+1] = pixels[i+2] = gray;
        }
    }
    ctx.putImageData(processedData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  }, [currentRawImage, cropMode, points, activeFilter, completedRectCrop]);

  // LIVE UPDATE LOOP
  useEffect(() => {
    if (stage === 'adjust' && currentRawImage) {
        const timer = setTimeout(async () => {
            const res = await applyCorrection();
            setLiveResultSrc(res);
        }, 50);
        return () => clearTimeout(timer);
    }
  }, [points, activeFilter, cropMode, completedRectCrop, stage, currentRawImage, applyCorrection]);

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

  const handleRotateSource = () => {
    if (!currentRawImage) return;
    setIsProcessing(true);
    const img = new window.Image();
    img.src = currentRawImage;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = img.height;
        canvas.height = img.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        setCurrentRawImage(canvas.toDataURL('image/jpeg', 0.95));
        setIsProcessing(false);
        // Reset handles for new orientation
        setPoints([
            { x: 10, y: 10 }, { x: 90, y: 10 },
            { x: 90, y: 50 }, { x: 90, y: 90 },
            { x: 10, y: 90 }, { x: 10, y: 50 }
        ]);
    };
  };

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

  const handleConfirmAdjustment = async () => {
    if (!liveResultSrc) return;
    const newPage: ScannedPage = {
        id: Math.random().toString(36).substr(2, 9),
        originalSrc: currentRawImage!,
        processedSrc: liveResultSrc,
        filter: activeFilter
    };
    setScannedPages(prev => [...prev, newPage]);
    setStage('stack');
    toast({ title: "Page Added", description: "Document stored in stack." });
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
        pdf.addImage(src, 'JPEG', (pw - imgProps.width * ratio) / 2, (ph - imgProps.height * ratio) / 2, imgProps.width * ratio, imgProps.height * ratio, undefined, 'FAST');
    }
    pdf.save(`Scan-Document-${Date.now()}.pdf`);
    setIsBuildingPdf(false);
  };

  return (
    <div className="w-full max-w-7xl flex flex-col gap-6 animate-in fade-in duration-700 pb-20 px-4">
        
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-4">
                    <Card className="border-2 shadow-2xl overflow-hidden bg-black relative rounded-2xl md:rounded-[3rem]">
                        <CardHeader className="bg-muted/30 border-b py-2 px-6 flex flex-row items-center justify-between">
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
                                        <p className="font-black uppercase text-sm">Camera Restricted</p>
                                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                            <Button onClick={startCamera} className="bg-primary rounded-xl font-black uppercase text-[10px]">Allow Access</Button>
                                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="rounded-xl font-black uppercase text-[10px]">Manual Upload</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {hasCameraPermission === true && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="size-[85%] border-2 border-dashed border-white/40 rounded-xl relative">
                                        <div className="absolute top-0 left-0 size-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                                        <div className="absolute top-0 right-0 size-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                                        <div className="absolute bottom-0 left-0 size-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                                        <div className="absolute bottom-0 right-0 size-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                                    </div>
                                </div>
                            )}
                            
                            <div className="absolute bottom-6 right-6 z-20">
                                <Button variant="secondary" className="h-12 rounded-xl font-black uppercase text-[9px] shadow-2xl" onClick={() => fileInputRef.current?.click()}>
                                    <ImageIcon className="mr-2 size-4" /> UPLOAD PHOTO
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 md:p-8 bg-white dark:bg-slate-950 border-t">
                            <Button onClick={handleCapture} className="h-16 w-full bg-gradient-button text-white font-black text-lg md:text-xl rounded-2xl shadow-2xl transition-transform active:scale-95">
                                <Zap className="mr-3 size-6 text-yellow-400" /> SCAN CURRENT PAGE
                            </Button>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-4">
                    <Card className="border-2 shadow-2xl border-primary/10 flex flex-col bg-card/50 rounded-[2.5rem] min-h-[400px]">
                        <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                <Layout className="size-5 text-primary" /> Page Stack
                            </CardTitle>
                            <Badge variant="outline" className="font-black text-primary border-primary/20">{scannedPages.length}</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 p-6">
                            {scannedPages.length === 0 ? (
                                <div className="py-20 text-center opacity-30 space-y-4">
                                    <Monitor className="size-16 mx-auto" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No pages scanned yet</p>
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
                            <Button disabled={scannedPages.length === 0} className="w-full h-14 bg-primary font-black text-sm rounded-xl shadow-xl" onClick={handleBuildPdf}>
                                {isBuildingPdf ? <Loader2 className="animate-spin mr-2"/> : <Download className="mr-2 size-5" />} GENERATE PDF ({scannedPages.length})
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {stage === 'adjust' && currentRawImage && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <Card className="border-none shadow-3xl overflow-hidden rounded-[2.5rem]">
                    <CardHeader className="bg-primary/5 border-b p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                                <Maximize className="size-5 md:size-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">Adjustment Studio</CardTitle>
                                <CardDescription className="text-[10px] font-black uppercase opacity-60">Adjust edges & pick visual effects</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as CropMode)} className="bg-background/50 p-1 rounded-lg border w-full md:w-auto">
                                <TabsList className="grid grid-cols-2 h-8">
                                    <TabsTrigger value="rect" className="text-[10px] font-black uppercase px-4"><Maximize className="size-3 mr-1.5" /> Rect</TabsTrigger>
                                    <TabsTrigger value="scanner" className="text-[10px] font-black uppercase px-4"><Scan className="size-3 mr-1.5" /> Scanner</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Button variant="outline" size="icon" onClick={handleRotateSource} className="h-10 w-10 border-2 rounded-xl text-primary"><RotateCw className="size-5" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setStage('viewfinder')} className="text-destructive"><X /></Button>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-0 bg-slate-200 dark:bg-slate-900 grid grid-cols-1 lg:grid-cols-2 min-h-[500px] md:min-h-[700px] relative overflow-hidden select-none">
                        
                        {/* LEFT: EDITING WINDOW */}
                        <div className="flex flex-col items-center justify-center p-4 md:p-10 border-r border-slate-300 dark:border-white/5 relative"
                             onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                            
                            <Badge variant="outline" className="absolute top-4 left-4 z-20 bg-white/80 dark:bg-black/80 font-black text-[8px] uppercase border-2">Source Alignment</Badge>

                            <div ref={containerRef} className="relative cursor-crosshair shadow-2xl border-4 border-white transform-gpu bg-white max-w-full">
                                {cropMode === 'rect' ? (
                                    <ReactCrop crop={rectCrop} onChange={c => setRectCrop(c)} onComplete={c => setCompletedRectCrop(c)} className="max-h-[50vh] md:max-h-[60vh]">
                                        <img ref={imgRef} src={currentRawImage} alt="rect-source" className="max-h-[50vh] md:max-h-[60vh] w-auto object-contain block" onLoad={onImageLoad} />
                                    </ReactCrop>
                                ) : (
                                    <div className="relative">
                                        <img ref={imgRef} src={currentRawImage} alt="warp-source" className="max-h-[50vh] md:max-h-[60vh] w-auto object-contain pointer-events-none block" onLoad={onImageLoad} />
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} className="fill-primary/20 stroke-primary stroke-[1.0]" />
                                        </svg>
                                        {points.map((p, i) => (
                                            <div key={i} className={cn("absolute size-9 md:size-12 -ml-4.5 md:-ml-6 -mt-4.5 md:-mt-6 rounded-full border-4 border-white shadow-2xl cursor-grab active:cursor-grabbing z-20 flex items-center justify-center transition-all", draggingPoint === i ? "bg-primary scale-125 ring-4 ring-primary/20" : "bg-primary/90")}
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
                        </div>

                        {/* RIGHT: LIVE RESULT WINDOW */}
                        <div className="flex flex-col items-center justify-center p-4 md:p-10 bg-slate-300/50 dark:bg-black/40 relative">
                             <Badge variant="secondary" className="absolute top-4 right-4 z-20 bg-green-600 text-white font-black text-[8px] uppercase shadow-lg border-2 border-white animate-pulse flex items-center gap-1.5"><Eye className="size-2.5"/> Live Processing</Badge>
                             
                             <div className="w-full max-w-md space-y-6">
                                <div className="aspect-[3/4] relative bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-sm overflow-hidden border-[8px] border-white transform transition-transform hover:scale-[1.02]">
                                    {liveResultSrc ? (
                                        <img src={liveResultSrc} className="size-full object-contain" alt="live-result" />
                                    ) : (
                                        <div className="size-full flex flex-col items-center justify-center gap-4 text-muted-foreground/30">
                                            <Loader2 className="size-10 animate-spin" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Rendering Result...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 gap-2 no-print">
                                    <FilterIcon active={activeFilter === 'magic'} onClick={() => setActiveFilter('magic')} icon={Sparkles} label="Magic" color="text-primary" />
                                    <FilterIcon active={activeFilter === 'bw'} onClick={() => setActiveFilter('bw')} icon={ScanLine} label="B&W" color="text-slate-800" />
                                    <FilterIcon active={activeFilter === 'grayscale'} onClick={() => setActiveFilter('grayscale')} icon={Droplets} label="Gray" color="text-blue-500" />
                                    <FilterIcon active={activeFilter === 'original'} onClick={() => setActiveFilter('original')} icon={ImageIcon} label="Original" color="text-orange-500" />
                                </div>
                             </div>
                        </div>

                    </CardContent>
                    <CardFooter className="bg-white dark:bg-slate-950 p-6 md:p-8 border-t flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 text-muted-foreground/50 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-green-500" /> Secure RAM</div>
                            <div className="flex items-center gap-1.5"><Zap className="size-4 text-yellow-500" /> 300 DPI HD</div>
                        </div>
                        <div className="flex gap-4 w-full sm:w-auto">
                            <Button variant="outline" onClick={() => setStage('viewfinder')} className="flex-1 sm:flex-none h-14 md:h-16 px-10 border-2 font-black uppercase text-xs rounded-2xl transition-all active:scale-95">CANCEL</Button>
                            <Button onClick={handleConfirmAdjustment} disabled={!liveResultSrc} className="flex-[2] sm:flex-none h-14 md:h-16 px-14 bg-primary text-black font-black text-lg md:text-xl rounded-2xl shadow-3xl transition-all active:scale-95 group">
                                <Plus className="mr-3 size-6 group-hover:scale-125 transition-transform" /> CONFIRM & ADD PAGE
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        )}

        {stage === 'stack' && (
            <div className="flex flex-col items-center gap-10 animate-in fade-in duration-500">
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                    <div className="flex items-center gap-5 text-left">
                        <div className="size-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-xl border-2 border-primary/10">
                            <Layout className="size-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Document <span className="text-primary">Stack</span></h2>
                            <p className="text-sm font-bold text-muted-foreground uppercase opacity-60 flex items-center gap-2">
                                <SearchCode className="size-3.5"/> Total {scannedPages.length} High-Definition pages ready.
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => { setCurrentRawImage(null); setStage('viewfinder'); }} variant="outline" className="h-16 px-10 border-4 border-dashed font-black text-sm uppercase rounded-[1.5rem] hover:border-primary hover:bg-primary/5 transition-all group">
                        <Plus className="mr-2 size-6 group-hover:rotate-90 transition-transform" /> Add Page
                    </Button>
                </div>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                     {scannedPages.map((page, idx) => (
                        <Card key={page.id} className="group overflow-hidden rounded-[2.5rem] border-2 shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all transform hover:-translate-y-2">
                            <div className="aspect-[3/4] relative bg-white flex items-center justify-center p-3">
                                <img src={page.processedSrc} className="size-full object-contain rounded-2xl" alt="scan" />
                                <div className="absolute top-5 left-5 bg-black/80 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-black">PAGE {idx + 1}</div>
                                <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Button size="icon" variant="destructive" className="size-10 rounded-xl shadow-2xl" onClick={() => setScannedPages(prev => prev.filter(p => p.id !== page.id))}>
                                        <Trash2 className="size-5" />
                                     </Button>
                                </div>
                            </div>
                        </Card>
                     ))}
                     <button onClick={() => { setCurrentRawImage(null); setStage('viewfinder'); }} className="aspect-[3/4] rounded-[2.5rem] border-4 border-dashed border-primary/20 flex flex-col items-center justify-center gap-6 hover:bg-primary/5 hover:border-primary transition-all group">
                        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                            <Plus className="size-10" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/40">Scan Next Page</span>
                     </button>
                </div>

                <Card className="w-full max-w-3xl bg-slate-950 text-white rounded-[3rem] p-10 md:p-14 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-t-4 border-white/5 relative overflow-hidden">
                     <div className="absolute top-0 right-0 size-64 bg-primary/5 blur-[100px] pointer-events-none" />
                     <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                        <div className="space-y-3 text-center md:text-left">
                            <Badge className="bg-primary text-black font-black text-[9px] uppercase tracking-widest px-3 py-1 mb-2">Final Step</Badge>
                            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">Export <br/><span className="text-primary">Bundle</span></h3>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest opacity-60">Single PDF Output</p>
                        </div>
                        <Button 
                            className="h-24 md:h-28 px-12 md:px-16 bg-primary text-black font-black text-2xl md:text-3xl rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(72,169,164,0.4)] active:scale-95 transition-all group hover:bg-white"
                            onClick={handleBuildPdf}
                            disabled={isBuildingPdf}
                        >
                            {isBuildingPdf ? <Loader2 className="animate-spin mr-3 size-10"/> : <FileDigit className="mr-4 size-10 group-hover:scale-110 transition-transform" />}
                            DOWNLOAD PDF
                        </Button>
                     </div>
                </Card>
            </div>
        )}
    </div>
  );
}

function FilterIcon({ active, onClick, icon: Icon, label, color }: { active: boolean, onClick: () => void, icon: any, label: string, color: string }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all group relative overflow-hidden",
                active ? "bg-white border-primary shadow-xl scale-110 z-10" : "bg-white/50 border-transparent opacity-60 hover:opacity-100"
            )}
        >
            <div className={cn("size-8 md:size-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12", active ? "bg-primary/10" : "bg-muted")}>
                <Icon className={cn("size-5", color)} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
            {active && <div className="absolute top-1 right-1"><CheckCircle2 className="size-2.5 text-primary" /></div>}
        </button>
    );
}
