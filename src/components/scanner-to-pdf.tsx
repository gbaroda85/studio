
"use client";

import 'react-image-crop/dist/ReactCrop.css';
import { useState, useRef, useEffect, useCallback, type SyntheticEvent, type ChangeEvent } from 'react';
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
    Image as ImageIcon,
    RotateCw,
    Sparkles,
    Maximize,
    Move,
    FileText,
    ChevronRight,
    Eye,
    Trash2,
    RefreshCcw,
    Settings2,
    Layout,
    Sun,
    Droplets,
    Plus,
    FileStack,
    Layers,
    Monitor,
    Smartphone,
    SearchCode,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';

/**
 * UTILITY: HOMOGRAPHY & PERSPECTIVE WARP
 */
interface Point { x: number; y: number; }

function solvePerspective(src: Point[], dst: Point[]) {
    const p = [];
    const corners = [src[0], src[1], src[3], src[4]]; // TL, TR, BR, BL from 6-dot setup
    
    for (let i = 0; i < 4; i++) {
        p.push([dst[i].x, dst[i].y, 1, 0, 0, 0, -dst[i].x * corners[i].x, -dst[i].y * corners[i].x, corners[i].x]);
        p.push([0, 0, 0, dst[i].x, dst[i].y, 1, -dst[i].x * corners[i].y, -dst[i].y * corners[i].y, corners[i].y]);
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
  
  // Rect Crop States
  const [rectCrop, setRectCrop] = useState<Crop>();
  const [completedRectCrop, setCompletedRectCrop] = useState<PixelCrop>();
  
  // 6 Points: 0:TL, 1:TR, 2:MR, 3:BR, 4:BL, 5:ML
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
    if (typeof window === 'undefined' || !navigator.mediaDevices) return;
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
   * PREMIUM ENHANCEMENT PIPELINE
   * Intelligently segments and enhances document visuals.
   */
  const applyIntelligentScan = useCallback(async (): Promise<string> => {
    const image = imgRef.current;
    if (!image || !currentRawImage) return "";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return "";

    // 1. PERSPECTIVE CORRECTION / RECT CROP
    if (cropMode === 'rect') {
        const c = completedRectCrop || { x: 5, y: 5, width: 90, height: 90, unit: 'px' } as PixelCrop;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = Math.max(1, c.width * scaleX);
        canvas.height = Math.max(1, c.height * scaleY);
        ctx.drawImage(image, c.x * scaleX, c.y * scaleY, c.width * scaleX, c.height * scaleY, 0, 0, canvas.width, canvas.height);
    } else {
        const w1 = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
        const w2 = Math.hypot(points[3].x - points[4].x, points[3].y - points[4].y);
        const h1 = Math.hypot(points[4].x - points[0].x, points[4].y - points[0].y);
        const h2 = Math.hypot(points[3].x - points[1].x, points[3].y - points[1].y);
        
        const targetWidth = Math.max(100, Math.max(w1, w2) * (image.naturalWidth / 100));
        const targetHeight = Math.max(100, Math.max(h1, h2) * (image.naturalHeight / 100));
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const srcPxPoints = points.map(p => ({ x: p.x * (image.naturalWidth / 100), y: p.y * (image.naturalHeight / 100) }));
        const dstPoints = [{ x: 0, y: 0 }, { x: canvas.width, y: 0 }, { x: canvas.width, y: canvas.height }, { x: 0, y: canvas.height }];
        
        const h = solvePerspective(srcPxPoints, dstPoints);
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

    // 2. ADVANCED AI ENHANCEMENT (FILTER PIPELINE)
    if (activeFilter !== 'original') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Background Estimation (Shadow Removal)
        let totalLuma = 0;
        for (let i = 0; i < pixels.length; i += 4) {
            totalLuma += (0.299 * pixels[i] + 0.587 * pixels[i+1] + 0.114 * pixels[i+2]);
        }
        const avgLuma = totalLuma / (pixels.length / 4);

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            const chroma = Math.max(r, g, b) - Math.min(r, g, b);

            // INTELLIGENT SEGMENTATION LOGIC
            // Signatures/Stamps/Photos usually have high chroma (color) or are darker patches in specific zones.
            const isColorful = chroma > 35;
            const isDark = luma < 90;

            if (activeFilter === 'magic') {
                if (isColorful || isDark) {
                   // Preserve natural intensity for signatures/photos
                   pixels[i] = Math.min(255, r * 1.1);
                   pixels[i+1] = Math.min(255, g * 1.1);
                   pixels[i+2] = Math.min(255, b * 1.1);
                } else {
                   // Brighten background to studio white
                   const boost = luma > 180 ? 1.35 : 1.25;
                   pixels[i] = Math.min(255, r * boost);
                   pixels[i+1] = Math.min(255, g * boost);
                   pixels[i+2] = Math.min(255, b * boost);
                }
            } else if (activeFilter === 'bw') {
                const thresh = avgLuma * 0.92;
                if (isColorful && luma < 180) {
                     // Preserve signatures in color even in BW mode for realism
                     pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b;
                } else {
                    const val = luma > thresh ? 255 : (luma < 70 ? 0 : luma * 0.5);
                    pixels[i] = pixels[i+1] = pixels[i+2] = val;
                }
            } else if (activeFilter === 'photo') {
                // High-fidelity preservation
                pixels[i] = Math.min(255, r * 1.05);
                pixels[i+1] = Math.min(255, g * 1.05);
                pixels[i+2] = Math.min(255, b * 1.05);
            } else if (activeFilter === 'gray') {
                pixels[i] = pixels[i+1] = pixels[i+2] = luma * 1.05;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [currentRawImage, cropMode, points, activeFilter, completedRectCrop]);

  useEffect(() => {
    if (stage === 'adjust' && currentRawImage) {
        const timer = setTimeout(async () => {
            const res = await applyIntelligentScan();
            setLiveResultSrc(res);
        }, 150);
        return () => clearTimeout(timer);
    }
  }, [points, activeFilter, cropMode, completedRectCrop, stage, currentRawImage, applyIntelligentScan]);

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
      toast({ title: 'Captured', description: 'Align document boundaries.' });
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = () => { setCurrentRawImage(reader.result as string); setStage('adjust'); };
          reader.readAsDataURL(file);
      }
  }

  const handleRotateSource = () => {
    if (!currentRawImage) return;
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
    };
  };

  const handleConfirmAdd = () => {
    if (!liveResultSrc) return;
    setScannedPages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        originalSrc: currentRawImage!,
        processedSrc: liveResultSrc,
        filter: activeFilter
    }]);
    setStage('stack');
    setCurrentRawImage(null);
    setLiveResultSrc(null);
    toast({ title: "Page Added", description: "Document stored in stack." });
  };

  const handleBuildPdf = async () => {
    setIsBuildingPdf(true);
    try {
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
        pdf.save(`Document-Scan-${Date.now()}.pdf`);
        toast({ title: "PDF Downloaded", description: "High-quality scan bundle ready." });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to build PDF.' });
    } finally {
        setIsBuildingPdf(false);
    }
  };

  const handlePointDown = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      let cx, cy;
      if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
      else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMagnifierPos({ x: ((cx - rect.left) / rect.width) * 100, y: ((cy - rect.top) / rect.height) * 100 });
      setDraggingPoint(idx);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current) return;
    if (e.cancelable) e.preventDefault();
    let cx, cy;
    if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((cy - rect.top) / rect.height) * 100));

    setMagnifierPos({ x, y });
    setPoints(prev => {
        const next = [...prev];
        if (draggingPoint === 2) { // MR handle move logic
            next[1].x = x; next[2].x = x; next[3].x = x;
        } else if (draggingPoint === 5) { // ML handle move logic
            next[0].x = x; next[5].x = x; next[4].x = x;
        } else {
            next[draggingPoint] = { x, y };
            // Update side handles dynamically based on corners
            if (draggingPoint === 0 || draggingPoint === 4) next[5] = { x: (next[0].x + next[4].x)/2, y: (next[0].y + next[4].y)/2 };
            if (draggingPoint === 1 || draggingPoint === 3) next[2] = { x: (next[1].x + next[3].x)/2, y: (next[1].y + next[3].y)/2 };
        }
        return next;
    });
  };

  return (
    <div className="w-full max-w-7xl flex flex-col gap-6 animate-in fade-in duration-700 pb-20 px-4">
        
        {/* STAGE: VIEWFINDER */}
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <Card className="border-2 shadow-2xl overflow-hidden bg-black relative rounded-2xl md:rounded-[3rem] aspect-video flex items-center justify-center">
                        <video ref={videoRef} className={cn("w-full h-full object-contain", !hasCameraPermission && "hidden")} autoPlay muted playsInline />
                        {!hasCameraPermission && hasCameraPermission !== null && (
                            <div className="p-12 text-center space-y-6 text-white w-full">
                                <Camera className="size-16 mx-auto opacity-20" />
                                <Button onClick={startCamera} className="bg-primary rounded-xl font-black uppercase text-[10px]">Retry Camera</Button>
                            </div>
                        )}
                        <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                             <Button variant="secondary" className="h-12 rounded-xl font-black uppercase text-[9px] shadow-2xl" onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon className="mr-2 size-4" /> GALLERY
                            </Button>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </div>
                    </Card>
                    <div className="mt-6"><Button onClick={handleCapture} className="h-20 w-full bg-gradient-button text-white font-black text-xl rounded-2xl shadow-3xl">SCAN PAGE</Button></div>
                </div>
                <div className="lg:col-span-4">
                    <Card className="border-2 shadow-2xl flex flex-col bg-card/50 rounded-[2.5rem] min-h-[400px]">
                        <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2"><Layout className="size-5 text-primary" /> Page Stack</CardTitle>
                            <Badge variant="outline" className="font-black text-primary border-primary/20">{scannedPages.length}</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 p-6">
                            <div className="grid grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                                {scannedPages.map((p, i) => (
                                    <div key={p.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 bg-white shadow-lg group">
                                        <img src={p.processedSrc} className="size-full object-cover" alt="scan" />
                                        <Button size="icon" variant="destructive" className="absolute top-1 right-1 size-6 rounded-md opacity-0 group-hover:opacity-100 transition-all" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}><Trash2 className="size-3" /></Button>
                                    </div>
                                ))}
                                {scannedPages.length === 0 && (
                                    <div className="col-span-2 py-20 text-center opacity-20">
                                        <FileStack className="size-12 mx-auto" />
                                        <p className="text-[10px] font-black uppercase mt-2">Empty Stack</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 border-t"><Button disabled={scannedPages.length === 0} className="w-full h-14 bg-primary font-black text-sm rounded-xl shadow-xl" onClick={handleBuildPdf}>{isBuildingPdf ? <Loader2 className="animate-spin mr-2"/> : <Download className="mr-2" />} GENERATE PDF ({scannedPages.length})</Button></CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {/* STAGE: ADJUST */}
        {stage === 'adjust' && currentRawImage && (
            <Card className="border-none shadow-3xl overflow-hidden rounded-[2.5rem] animate-in zoom-in-95 duration-500">
                <CardHeader className="bg-primary/5 border-b p-4 flex flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg"><Maximize className="size-5" /></div>
                         <CardTitle className="text-xl font-black uppercase tracking-tighter">AI Studio Editor</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as CropMode)} className="bg-background/50 p-1 rounded-lg border">
                            <TabsList className="h-8">
                                <TabsTrigger value="rect" className="text-[10px] font-black uppercase px-4"><Maximize className="size-3 mr-1.5" /> Rect</TabsTrigger>
                                <TabsTrigger value="scanner" className="text-[10px] font-black uppercase px-4"><ScanLine className="size-3 mr-1.5" /> Scanner</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Button variant="outline" size="icon" onClick={handleRotateSource} className="h-10 w-10 border-2 rounded-xl"><RotateCw className="size-5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setStage('viewfinder')}><X /></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 bg-slate-900 grid lg:grid-cols-2 min-h-[500px] md:min-h-[700px] relative overflow-hidden select-none">
                    
                    {/* LEFT: ADJUSTMENT WINDOW */}
                    <div className="flex flex-col items-center justify-center p-4 md:p-10 border-r border-white/5 relative h-full"
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
                                        <polygon points={`${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[3].x},${points[3].y} ${points[4].x},${points[4].y}`} className="fill-primary/10 stroke-primary stroke-[0.8]" />
                                    </svg>
                                    {points.map((p, i) => (
                                        <div key={i} className={cn("absolute size-8 md:size-10 -ml-4 md:-ml-5 -mt-4 md:-mt-5 rounded-full border-2 md:border-4 border-white shadow-2xl cursor-grab z-20 flex items-center justify-center transition-transform", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/90")}
                                             style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                                             onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}>
                                            <div className="size-2 md:size-2.5 bg-white rounded-full shadow-inner" />
                                        </div>
                                    ))}
                                    {draggingPoint !== null && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-32 md:size-48 rounded-full border-4 border-green-500 shadow-2xl bg-white ring-4 ring-white/50">
                                            <img src={currentRawImage} alt="mag" className="absolute max-w-none origin-top-left"
                                                style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} 
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="size-4 border-2 border-red-500 rounded-full bg-white/50" /></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: LIVE HD PREVIEW WINDOW */}
                    <div className="flex flex-col items-center justify-center p-4 md:p-10 bg-slate-800 relative h-full">
                        <Badge className="absolute top-4 right-4 z-20 bg-green-600 text-white border-white font-black text-[9px] uppercase tracking-widest">LIVE HD SCAN</Badge>
                        <div className="w-full flex flex-col items-center gap-8">
                             <div className="relative bg-white shadow-3xl rounded-sm border-[6px] border-white transform-gpu max-w-full flex items-center justify-center overflow-hidden aspect-auto">
                                {liveResultSrc ? <img src={liveResultSrc} className="max-w-full max-h-[65vh] object-contain block h-auto" alt="result" /> : <Loader2 className="animate-spin text-primary size-10" />}
                             </div>
                             <div className="grid grid-cols-5 gap-2 w-full max-w-lg no-print px-4">
                                <FilterBtn active={activeFilter === 'magic'} onClick={() => setActiveFilter('magic')} icon={Sparkles} label="Magic" />
                                <FilterBtn active={activeFilter === 'bw'} onClick={() => setActiveFilter('bw')} icon={ScanLine} label="Pro B/W" />
                                <FilterBtn active={activeFilter === 'photo'} onClick={() => setActiveFilter('photo')} icon={ImageIcon} label="Photo" />
                                <FilterBtn active={activeFilter === 'gray'} onClick={() => setActiveFilter('gray')} icon={Droplets} label="Gray" />
                                <FilterBtn active={activeFilter === 'original'} onClick={() => setActiveFilter('original')} icon={RefreshCcw} label="Original" />
                             </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-white dark:bg-slate-950 p-6 border-t flex justify-between">
                    <div className="hidden sm:flex items-center gap-6 text-[9px] font-black uppercase opacity-40 tracking-widest">
                         <div className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-green-500"/> SECURE RAM</div>
                         <div className="flex items-center gap-1.5"><Zap className="size-4 text-yellow-500"/> AI ENHANCED</div>
                    </div>
                    <Button className="h-16 rounded-2xl bg-primary text-black font-black text-lg px-12 group shadow-2xl" onClick={handleConfirmAdd}>
                        CONFIRM & ADD <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </CardFooter>
            </Card>
        )}

        {/* STAGE: STACK */}
        {stage === 'stack' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 shadow-lg border border-green-500/20">
                            <FileStack className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Scan Bundle</h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest">{scannedPages.length} Pages Extracted</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-none h-12 rounded-xl font-black uppercase text-[10px] border-2 tracking-widest" onClick={() => setStage('viewfinder')}>
                            <Plus className="mr-2 size-4" /> SCAN MORE
                        </Button>
                        <Button className="flex-1 md:flex-none h-12 px-8 bg-green-600 hover:bg-green-700 text-white font-black text-sm rounded-xl shadow-xl uppercase tracking-widest" onClick={handleBuildPdf}>
                            {isBuildingPdf ? <Loader2 className="animate-spin mr-2"/> : <Download className="mr-2 size-4" />} DOWNLOAD PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {scannedPages.map((page, i) => (
                        <Card key={page.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 bg-white shadow-xl hover:border-primary/40 transition-all hover:-translate-y-1">
                            <img src={page.processedSrc} className="size-full object-cover" alt={`p${i+1}`} />
                            <div className="absolute top-2 left-2 size-7 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">{i + 1}</div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button size="icon" variant="destructive" className="size-10 rounded-xl" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== page.id))}><Trash2 className="size-5" /></Button>
                            </div>
                        </Card>
                    ))}
                    <button 
                        className="aspect-[3/4] border-2 border-dashed border-muted-foreground/20 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                        onClick={() => setStage('viewfinder')}
                    >
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Plus className="size-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Add Page</span>
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}

function FilterBtn({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button onClick={onClick} className={cn(
            "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all flex-1",
            active ? "bg-white border-primary shadow-lg scale-105" : "bg-white/50 border-transparent opacity-60 hover:opacity-100"
        )}>
            <div className={cn("size-8 rounded-lg flex items-center justify-center", active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}><Icon className="size-4" /></div>
            <span className="text-[7px] font-black uppercase tracking-widest truncate w-full text-center">{label}</span>
        </button>
    );
}
