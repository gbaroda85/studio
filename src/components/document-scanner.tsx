
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
    UploadCloud,
    CheckCircle2,
    Zap, 
    ShieldCheck, 
    ScanLine,
    ImageIcon,
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
    Share2,
    Sun,
    Contrast,
    FileArchive
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
  
  // Fine-tune states
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const [currentRawImage, setCurrentRawImage] = useState<string | null>(null);
  const [liveResultSrc, setLiveResultSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false);

  // 8-Point Scanner handles
  const [points, setPoints] = useState<Point[]>([
    { x: 15, y: 15 }, { x: 50, y: 15 }, { x: 85, y: 15 }, 
    { x: 85, y: 50 }, { x: 85, y: 85 },                   
    { x: 50, y: 85 }, { x: 15, y: 85 },                   
    { x: 15, y: 50 }                                      
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
    setRectCrop(centerCrop({ unit: '%', width: 90, height: 90 }, width, height));
    setIsImageReady(true);
  };

  const applyIntelligentScan = useCallback(async (): Promise<string> => {
    const image = imgRef.current;
    if (!image || !currentRawImage || !image.naturalWidth) return "";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return "";

    if (cropMode === 'rect') {
        const c = completedRectCrop || { x: 5, y: 5, width: 90, height: 90, unit: 'px' } as PixelCrop;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = Math.max(10, c.width * scaleX);
        canvas.height = Math.max(10, c.height * scaleY);
        ctx.drawImage(image, c.x * scaleX, c.y * scaleY, c.width * scaleX, c.height * scaleY, 0, 0, canvas.width, canvas.height);
    } else {
        const w1 = Math.hypot(points[2].x - points[0].x, points[2].y - points[0].y);
        const w2 = Math.hypot(points[4].x - points[6].x, points[4].y - points[6].y);
        const h1 = Math.hypot(points[6].x - points[0].x, points[6].y - points[0].y);
        const h2 = Math.hypot(points[4].x - points[2].x, points[4].y - points[2].y);
        
        const targetWidth = Math.max(10, Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100)));
        const targetHeight = Math.max(10, Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100)));
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const srcPoints = [points[0], points[2], points[4], points[6]].map(p => ({ 
            x: p.x * (image.naturalWidth / 100), 
            y: p.y * (image.naturalHeight / 100) 
        }));
        const dstPoints = [{ x: 0, y: 0 }, { x: canvas.width, y: 0 }, { x: canvas.width, y: canvas.height }, { x: 0, y: canvas.height }];
        
        const h = solvePerspective(dstPoints, srcPoints);
        const imgData = ctx.createImageData(canvas.width, canvas.height);
        
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = image.naturalWidth; srcCanvas.height = image.naturalHeight;
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

    // Apply Filters & Fine-tuning
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const bFactor = brightness[0] / 100;
    const cFactor = contrast[0] / 100;

    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i], g = pixels[i+1], b = pixels[i+2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;

        if (activeFilter === 'bw') {
            const val = luma > 128 ? 255 : 0;
            r = g = b = val;
        } else if (activeFilter === 'document') {
            const val = luma > 180 ? 255 : luma < 100 ? luma * 0.5 : luma;
            r = g = b = val;
        } else if (activeFilter === 'magic') {
            r = Math.min(255, r * 1.1); g = Math.min(255, g * 1.1); b = Math.min(255, b * 1.1);
        } else if (activeFilter === 'gray') {
            r = g = b = luma;
        }

        pixels[i] = Math.max(0, Math.min(255, ((r / 255 - 0.5) * cFactor + 0.5) * 255 * bFactor));
        pixels[i+1] = Math.max(0, Math.min(255, ((g / 255 - 0.5) * cFactor + 0.5) * 255 * bFactor));
        pixels[i+2] = Math.max(0, Math.min(255, ((b / 255 - 0.5) * cFactor + 0.5) * 255 * bFactor));
    }
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [currentRawImage, cropMode, points, activeFilter, completedRectCrop, brightness, contrast]);

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
  }, [points, activeFilter, cropMode, completedRectCrop, stage, currentRawImage, isImageReady, applyIntelligentScan, brightness, contrast]);

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

  const handleConfirmAdd = () => {
    if (!liveResultSrc) return;
    setScannedPages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), processedSrc: liveResultSrc }]);
    setStage('viewfinder');
    setCurrentRawImage(null); setLiveResultSrc(null);
    setBrightness([100]); setContrast([100]);
    toast({ title: "Page Added to Collection" });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current || !points[draggingPoint]) return;
    if (e.cancelable) e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    let cx, cy;
    if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }

    const x = Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((cy - rect.top) / rect.height) * 100));

    setMagnifierPos({ x, y });
    setPoints(prev => {
        const next = [...prev];
        const idx = draggingPoint;
        if ([0, 2, 4, 6].includes(idx)) {
            next[idx] = { x, y };
        } else {
            if (idx === 1) { next[0].y = y; next[2].y = y; } 
            else if (idx === 3) { next[2].x = x; next[4].x = x; } 
            else if (idx === 5) { next[6].y = y; next[4].y = y; } 
            else if (idx === 7) { next[0].x = x; next[6].x = x; } 
        }
        next[1] = { x: (next[0].x + next[2].x) / 2, y: (next[0].y + next[2].y) / 2 };
        next[3] = { x: (next[2].x + next[4].x) / 2, y: (next[2].y + next[4].y) / 2 };
        next[5] = { x: (next[4].x + next[6].x) / 2, y: (next[4].y + next[6].y) / 2 };
        next[7] = { x: (next[6].x + next[0].x) / 2, y: (next[6].y + next[0].y) / 2 };
        return next;
    });
  }, [draggingPoint, points]);

  const handlePointDown = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
      setDraggingPoint(idx);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      let cx, cy;
      if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
      else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }
      setMagnifierPos({ x: ((cx - rect.left) / rect.width) * 100, y: ((cy - rect.top) / rect.height) * 100 });
  };

  return (
    <div className="w-full max-w-[1600px] flex flex-col gap-6 animate-in fade-in duration-700 pb-20 px-4 mx-auto">
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                    <Card className="w-full border-2 border-dashed bg-card/50 text-center rounded-[2.5rem] overflow-hidden shadow-xl hover:-translate-y-1 transition-all">
                        <CardHeader className="pt-20">
                            <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary animate-pulse"><ScanLine className="size-10" /></div>
                            <CardTitle className="text-5xl font-black uppercase tracking-tighter leading-none">Document <br className="md:hidden" /> <span className="text-primary">Scanner</span></CardTitle>
                        </CardHeader>
                        <CardContent className="pb-20 pt-10 px-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                <div className="border-4 border-dashed border-primary/20 rounded-3xl p-10 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-primary/5 transition-all group shadow-sm" onClick={startCamera}>
                                    <div className="size-16 rounded-2xl bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl"><Camera className="size-8" /></div>
                                    <p className="text-base font-black uppercase tracking-tighter">Capture Photo</p>
                                </div>
                                <div className="border-4 border-dashed border-muted-foreground/20 rounded-3xl p-10 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/5 transition-all group shadow-sm" onClick={() => fileInputRef.current?.click()}>
                                    <div className="size-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl"><UploadCloud className="size-8" /></div>
                                    <p className="text-base font-black uppercase tracking-tighter">Pick from Album</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-4 h-full">
                    <Card className="border-2 shadow-2xl flex flex-col bg-card/50 rounded-[2.5rem] h-full min-h-[400px]">
                        <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><FileStack className="size-6 text-primary" /> COLLECTION</CardTitle>
                            <Badge className="bg-primary text-black font-black px-3 py-1 rounded-full">{scannedPages.length}</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 p-6">
                            {scannedPages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20 gap-4">
                                    <FileArchive className="size-16" />
                                    <p className="text-xs font-black uppercase">No pages added yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                    {scannedPages.map((p, i) => (
                                        <div key={p.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 bg-white shadow-lg group hover:border-primary transition-all">
                                            <img src={p.processedSrc} className="size-full object-cover" alt="scan" />
                                            <div className="absolute top-1.5 left-1.5 size-6 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">{i+1}</div>
                                            <Button size="icon" variant="destructive" className="absolute top-1.5 right-1.5 size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}><Trash2 className="size-4" /></Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-6 border-t bg-muted/10">
                            <Button disabled={scannedPages.length === 0} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black text-sm rounded-xl shadow-xl uppercase active:scale-95 transition-all" onClick={() => {
                                const pdf = new jsPDF();
                                scannedPages.forEach((p, i) => {
                                    if(i > 0) pdf.addPage();
                                    pdf.addImage(p.processedSrc, 'JPEG', 0, 0, 210, 297);
                                });
                                pdf.save(`scan-${Date.now()}.pdf`);
                                toast({ title: "PDF Exported Successfully" });
                            }}>EXPORT AS PDF <Download className="ml-2 size-4" /></Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {stage === 'live-camera' && !isMobile && (
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-in zoom-in-95 duration-500">
                <Card className="border-none shadow-3xl bg-black rounded-[2.5rem] overflow-hidden relative">
                    <CardHeader className="absolute top-0 left-0 w-full z-10 p-6 flex flex-row items-center justify-between">
                         <Badge className="bg-primary text-black font-black uppercase text-[10px]">LIVE FEED</Badge>
                         <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => { stopCamera(); setStage('viewfinder'); }}><X /></Button>
                    </CardHeader>
                    <CardContent className="p-0 bg-black aspect-video flex items-center justify-center">
                        <video ref={videoRef} className="size-full object-cover" playsInline muted />
                        {isVideoLoading && <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xl"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}
                    </CardContent>
                    <CardFooter className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center w-full">
                        <button className="size-20 rounded-full border-4 border-white bg-white/10 p-1 group hover:scale-110 active:scale-90 transition-all shadow-2xl" onClick={captureFrame}>
                            <div className="size-full rounded-full bg-white group-hover:bg-primary transition-colors" />
                        </button>
                    </CardFooter>
                </Card>
                <div className="text-center opacity-40">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Center document and hold steady</p>
                </div>
            </div>
        )}

        {stage === 'adjust' && currentRawImage && (
            <div className="grid lg:grid-cols-12 gap-8 items-stretch animate-in slide-in-from-right-4 duration-500">
                <div className="lg:col-span-8">
                    <Card className="border-none shadow-3xl overflow-hidden rounded-[2.5rem] bg-slate-950 flex flex-col h-full">
                        <CardHeader className="bg-white/5 border-b p-6 flex flex-row items-center justify-between text-white">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter">Adjustment Studio</CardTitle>
                            <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as any)} className="bg-white/10 p-1 rounded-xl border border-white/10">
                                <TabsList className="grid grid-cols-2 h-9 bg-transparent"><TabsTrigger value="rect" className="text-[10px] font-black uppercase">RECT</TabsTrigger><TabsTrigger value="scanner" className="text-[10px] font-black uppercase">SCANNER</TabsTrigger></TabsList>
                            </Tabs>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-center relative overflow-hidden select-none bg-black/40 min-h-[500px]"
                                     onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                            <div ref={containerRef} className="relative cursor-crosshair shadow-2xl border-4 border-white/10 transform-gpu bg-black max-w-full">
                                {cropMode === 'rect' ? (
                                    <ReactCrop crop={rectCrop} onChange={(_, p) => setRectCrop(p)} onComplete={c => setCompletedRectCrop(c)} className="max-h-[60vh]">
                                        <img ref={imgRef} src={currentRawImage} alt="source" className="max-h-[60vh] w-auto object-contain block" onLoad={onImageLoad} />
                                    </ReactCrop>
                                ) : (
                                    <div className="relative">
                                        <img ref={imgRef} src={currentRawImage} alt="scanner" className="max-h-[60vh] w-auto pointer-events-none block" onLoad={onImageLoad} />
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <polygon points={`${points[0].x},${points[0].y} ${points[2].x},${points[2].y} ${points[4].x},${points[4].y} ${points[6].x},${points[6].y}`} className="fill-primary/10 stroke-primary stroke-[0.8]" />
                                        </svg>
                                        {points.map((p, i) => (
                                            <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-2xl cursor-grab z-20 flex items-center justify-center", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/80")}
                                                style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                                                onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}><div className="size-3 bg-white rounded-full" /></div>
                                        ))}
                                        {draggingPoint !== null && (
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 md:size-48 rounded-full border-4 border-green-500 shadow-2xl bg-white animate-in zoom-in-50">
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
                    <Card className="border-none shadow-3xl overflow-hidden rounded-[2.5rem] bg-slate-100 dark:bg-slate-950 flex flex-col flex-1">
                        <CardHeader className="bg-primary/5 border-b p-6 text-slate-800 dark:text-white">
                            <CardTitle className="text-lg font-black uppercase tracking-tighter">Render Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-6 flex flex-col bg-white dark:bg-slate-900 shadow-inner overflow-y-auto max-h-[600px] custom-scrollbar">
                            <div className="relative bg-white shadow-3xl rounded-sm border-[4px] border-white max-w-full flex items-center justify-center overflow-hidden mb-8 min-h-[200px]">
                                {liveResultSrc ? <img src={liveResultSrc} className="max-w-full h-auto block animate-in fade-in" alt="result" /> : <Loader2 className="animate-spin size-10 text-primary opacity-20" />}
                                {isProcessing && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}
                            </div>
                            
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Intelligent Presets</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['document', 'magic', 'bw', 'photo', 'gray', 'original'].map(f => (
                                            <Button key={f} variant={activeFilter === f ? 'default' : 'outline'} className="text-[8px] font-black h-10 rounded-xl" onClick={() => setActiveFilter(f as ScanFilter)}>{f.toUpperCase()}</Button>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="opacity-10" />

                                <div className="space-y-6">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Fine Tuning</Label>
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center"><span className="text-[9px] font-bold uppercase opacity-60">Brightness</span><span className="text-[9px] font-mono font-black">{brightness[0]}%</span></div>
                                            <Slider min={50} max={150} step={1} value={brightness} onValueChange={setBrightness} />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center"><span className="text-[9px] font-bold uppercase opacity-60">Contrast</span><span className="text-[9px] font-mono font-black">{contrast[0]}%</span></div>
                                            <Slider min={50} max={150} step={1} value={contrast} onValueChange={setContrast} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 border-t bg-white dark:bg-slate-950 flex flex-col gap-3">
                            <Button className="w-full h-14 rounded-xl bg-primary text-black font-black text-lg shadow-xl active:scale-95 transition-all" onClick={handleConfirmAdd}>CONFIRM & ADD</Button>
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
