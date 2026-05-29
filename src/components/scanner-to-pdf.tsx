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
    Layout,
    Sun,
    Droplets,
    Plus,
    FileStack,
    Layers,
    Monitor,
    Smartphone,
    SearchCode,
    Type,
    Frame,
    Wand2,
    MousePointer2,
    RotateCcw,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';

interface Point { x: number; y: number; }

/**
 * Homography Matrix Solver
 * Finds matrix H such that src = H * dst
 */
function solvePerspective(src: Point[], dst: Point[]) {
    const p = [];
    const corners = [src[0], src[1], src[3], src[4]]; 
    
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

type ScanFilter = 'original' | 'magic' | 'document' | 'bw' | 'photo' | 'gray';
type Stage = 'viewfinder' | 'adjust' | 'stack';
type CropMode = 'rect' | 'scanner';

interface ScannedPage {
    id: string;
    processedSrc: string;
}

export default function ScannerToPdf() {
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>('viewfinder');
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [cropMode, setCropMode] = useState<CropMode>('scanner');
  const [activeFilter, setActiveFilter] = useState<ScanFilter>('document');
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentRawImage, setCurrentRawImage] = useState<string | null>(null);
  const [liveResultSrc, setLiveResultSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [points, setPoints] = useState<Point[]>([
      { x: 10, y: 10 }, { x: 90, y: 10 },
      { x: 90, y: 50 }, { x: 90, y: 90 },
      { x: 10, y: 90 }, { x: 10, y: 50 }
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  
  const [rectCrop, setRectCrop] = useState<Crop>();
  const [completedRectCrop, setCompletedRectCrop] = useState<PixelCrop>();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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
        video: { 
            facingMode: { ideal: "environment" }, 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 } 
        } 
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
   * Premium Region-Aware Scan Logic
   * Calibrated for readability and shadow removal.
   */
  const applyIntelligentScan = useCallback(async (): Promise<string> => {
    const image = imgRef.current;
    if (!image || !currentRawImage) return "";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return "";

    // Step 1: Perspective / Rect Crop
    if (cropMode === 'rect') {
        const c = completedRectCrop || { x: 5, y: 5, width: 90, height: 90, unit: 'px' } as PixelCrop;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = Math.max(10, c.width * scaleX);
        canvas.height = Math.max(10, c.height * scaleY);
        ctx.drawImage(image, c.x * scaleX, c.y * scaleY, c.width * scaleX, c.height * scaleY, 0, 0, canvas.width, canvas.height);
    } else {
        const w1 = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
        const w2 = Math.hypot(points[3].x - points[4].x, points[3].y - points[4].y);
        const h1 = Math.hypot(points[4].x - points[0].x, points[4].y - points[0].y);
        const h2 = Math.hypot(points[3].x - points[1].x, points[3].y - points[1].y);
        
        const targetWidth = Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100));
        const targetHeight = Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100));
        canvas.width = Math.max(10, targetWidth);
        canvas.height = Math.max(10, targetHeight);

        const srcPxPoints = points.map(p => ({ x: p.x * (image.naturalWidth / 100), y: p.y * (image.naturalHeight / 100) }));
        const dstPoints = [{ x: 0, y: 0 }, { x: canvas.width, y: 0 }, { x: canvas.width, y: canvas.height }, { x: 0, y: canvas.height }];
        
        const h = solvePerspective(srcPxPoints, dstPoints);
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

    // Step 2: Advanced Filtering (Region-Aware)
    if (activeFilter !== 'original') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const len = pixels.length;

        // Illumination Normalization
        let bgSum = 0;
        let bgCount = 0;
        const skip = Math.max(8, Math.floor(len / 4000));
        for (let i = 0; i < len; i += skip * 4) {
            const luma = 0.299 * pixels[i] + 0.587 * pixels[i+1] + 0.114 * pixels[i+2];
            if (luma > 110) { bgSum += luma; bgCount++; }
        }
        
        const whitePoint = bgCount > 0 ? bgSum / bgCount : 220;
        const normFactor = 255 / Math.max(whitePoint, 150);

        for (let i = 0; i < len; i += 4) {
            const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            const normalizedLuma = Math.min(255, luma * normFactor);

            if (activeFilter === 'bw') {
                // Adaptive soft sigmoidal threshold for BW PRO
                let val;
                if (normalizedLuma < 135) {
                    val = Math.pow(normalizedLuma / 135, 1.4) * 55; // Dark Text
                } else if (normalizedLuma > 200) {
                    val = 255; // Clean Paper
                } else {
                    const t = (normalizedLuma - 135) / 65;
                    val = 55 + t * (255 - 55); // Smooth Transition
                }
                pixels[i] = pixels[i+1] = pixels[i+2] = val;
            } else if (activeFilter === 'document') {
                // MAGIC/DOC Mode: High readability, preserved detail
                let val;
                if (normalizedLuma > 195) val = 255;
                else if (normalizedLuma < 110) val = normalizedLuma * 0.4;
                else {
                    const t = (normalizedLuma - 110) / 85;
                    val = 45 + t * (255 - 45);
                }
                pixels[i] = pixels[i+1] = pixels[i+2] = val;
            } else if (activeFilter === 'magic') {
                // Color Magic: Preserves signatures/stamps
                pixels[i] = Math.min(255, r * normFactor * 1.05);
                pixels[i+1] = Math.min(255, g * normFactor * 1.05);
                pixels[i+2] = Math.min(255, b * normFactor * 1.05);
            } else if (activeFilter === 'photo') {
                // PHOTO: Balanced brightness boost (+15% with offset)
                pixels[i] = Math.min(255, r * 1.15 + 10);
                pixels[i+1] = Math.min(255, g * 1.15 + 10);
                pixels[i+2] = Math.min(255, b * 1.15 + 10);
            } else if (activeFilter === 'gray') {
                pixels[i] = pixels[i+1] = pixels[i+2] = luma;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [currentRawImage, cropMode, points, activeFilter, completedRectCrop]);

  useEffect(() => {
    if (stage === 'adjust' && currentRawImage) {
        const timer = setTimeout(async () => {
            setIsProcessing(true);
            try {
                const res = await applyIntelligentScan();
                setLiveResultSrc(res);
            } catch (e) {
                console.error(e);
            } finally {
                setIsProcessing(false);
            }
        }, 200);
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
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = () => { setCurrentRawImage(reader.result as string); setStage('adjust'); };
          reader.readAsDataURL(file);
      }
  };

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
        processedSrc: liveResultSrc
    }]);
    setStage('stack');
    setCurrentRawImage(null);
    setLiveResultSrc(null);
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
        if (draggingPoint === 2) { next[1].x = x; next[2].x = x; next[3].x = x; }
        else if (draggingPoint === 5) { next[0].x = x; next[5].x = x; next[4].x = x; }
        else {
            next[draggingPoint] = { x, y };
            if (draggingPoint === 0 || draggingPoint === 4) next[5] = { x: (next[0].x + next[4].x)/2, y: (next[0].y + next[4].y)/2 };
            if (draggingPoint === 1 || draggingPoint === 3) next[2] = { x: (next[1].x + next[3].x)/2, y: (next[1].y + next[3].y)/2 };
        }
        return next;
    });
  };

  const handleMouseUp = () => setDraggingPoint(null);

  return (
    <div className="w-full max-w-[1600px] flex flex-col gap-6 animate-in fade-in duration-700 pb-20 px-4 mx-auto">
        
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                    {/* FULL FRAME MOBILE CAMERA */}
                    <div className="relative w-full overflow-hidden bg-black rounded-[2rem] md:rounded-[3rem] shadow-3xl h-[65vh] md:h-[600px] border-4 border-white/10">
                        <video 
                            ref={videoRef} 
                            className="w-full h-full object-cover md:object-contain"
                            autoPlay 
                            muted 
                            playsInline 
                        />
                        {!hasCameraPermission && hasCameraPermission !== null && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/60 backdrop-blur-sm z-30">
                                <Smartphone className="size-16 mb-4 text-white/20" />
                                <p className="text-white font-bold mb-6">Camera permission required.</p>
                                <Button onClick={startCamera} className="bg-primary text-black font-black uppercase rounded-xl h-12 px-8">Allow Camera</Button>
                            </div>
                        )}
                        <div className="absolute top-6 left-6 z-20">
                             <Badge className="bg-black/60 backdrop-blur-md text-white font-black text-[10px] px-3 py-1 border border-white/20 uppercase tracking-widest">
                                {hasCameraPermission ? "HD SCANNER ACTIVE" : "CONNECTING..."}
                             </Badge>
                        </div>
                        <div className="absolute bottom-6 left-6 z-20">
                             <Button variant="secondary" className="h-10 md:h-12 rounded-xl font-black uppercase text-[10px] shadow-2xl px-5 md:px-6 bg-white/80 hover:bg-white backdrop-blur-md" onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon className="mr-2 size-4 text-primary" /> ALBUM
                            </Button>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </div>
                    </div>

                    <Button 
                        onClick={handleCapture} 
                        className="h-20 w-full bg-primary text-black font-black text-2xl rounded-3xl shadow-3xl transform active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <Camera className="mr-3 size-8" /> CAPTURE DOCUMENT
                    </Button>
                </div>

                <div className="lg:col-span-4">
                    <Card className="border-2 shadow-2xl flex flex-col bg-card/50 rounded-[2.5rem] h-full min-h-[400px]">
                        <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><FileStack className="size-6 text-primary" /> BUNDLE</CardTitle>
                            <Badge className="bg-primary text-black font-black px-3 py-1 rounded-full">{scannedPages.length}</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 p-6">
                            <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                {scannedPages.map((p, i) => (
                                    <div key={p.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 bg-white shadow-lg group hover:border-primary transition-all">
                                        <img src={p.processedSrc} className="size-full object-cover" alt="scan" />
                                        <div className="absolute top-1.5 left-1.5 size-6 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">{i+1}</div>
                                        <Button size="icon" variant="destructive" className="absolute top-1.5 right-1.5 size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}><Trash2 className="size-4" /></Button>
                                    </div>
                                ))}
                                {scannedPages.length === 0 && (
                                    <div className="col-span-2 py-20 text-center opacity-10">
                                        <FileStack className="size-20 mx-auto" />
                                        <p className="text-[10px] font-black uppercase mt-4 tracking-[0.3em]">No pages scanned</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 border-t bg-muted/10">
                            <Button disabled={scannedPages.length === 0} className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-black text-sm rounded-2xl shadow-xl uppercase" onClick={() => {
                                const pdf = new jsPDF();
                                scannedPages.forEach((p, i) => {
                                    if(i > 0) pdf.addPage();
                                    const props = pdf.getImageProperties(p.processedSrc);
                                    const pw = pdf.internal.pageSize.getWidth();
                                    const ph = pdf.internal.pageSize.getHeight();
                                    const ratio = Math.min(pw / props.width, ph / props.height);
                                    pdf.addImage(p.processedSrc, 'JPEG', (pw - props.width * ratio) / 2, (ph - props.height * ratio) / 2, props.width * ratio, props.height * ratio, undefined, 'FAST');
                                });
                                pdf.save(`GR7-Scan-${Date.now()}.pdf`);
                            }}>
                                <Download className="mr-3 size-6" /> EXPORT PDF
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {stage === 'adjust' && currentRawImage && (
            <div className="grid lg:grid-cols-2 gap-8 items-stretch animate-in zoom-in-95 duration-500">
                <Card className="border-none shadow-3xl overflow-hidden rounded-[2.5rem] bg-slate-950 flex flex-col h-full">
                    <CardHeader className="bg-white/5 border-b border-white/5 p-4 flex flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-white">
                             <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20"><Maximize className="size-6" /></div>
                             <CardTitle className="text-xl font-black uppercase tracking-tighter">Adjustment</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as CropMode)} className="bg-white/10 p-1 rounded-xl border border-white/10">
                                <TabsList className="grid grid-cols-2 h-9 bg-transparent">
                                    <TabsTrigger value="rect" className="text-[10px] font-black uppercase px-3">RECT</TabsTrigger>
                                    <TabsTrigger value="scanner" className="text-[10px] font-black uppercase px-3">SCAN</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Button variant="outline" size="icon" onClick={handleRotateSource} className="h-10 w-10 border-2 border-white/10 rounded-xl text-white bg-white/5"><RotateCw className="size-5" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex items-center justify-center relative overflow-hidden select-none bg-black/40 min-h-[500px]"
                                 onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}>
                        <div ref={containerRef} className="relative cursor-crosshair shadow-2xl border-4 border-white/10 transform-gpu bg-black max-w-full">
                            {cropMode === 'rect' ? (
                                <ReactCrop crop={rectCrop} onChange={c => setRectCrop(c)} onComplete={c => setCompletedRectCrop(c)} className="max-h-[60vh]">
                                    <img ref={imgRef} src={currentRawImage} alt="source" className="max-h-[60vh] w-auto object-contain block" onLoad={onImageLoad} />
                                </ReactCrop>
                            ) : (
                                <div className="relative">
                                    <img ref={imgRef} src={currentRawImage} alt="scanner" className="max-h-[60vh] w-auto object-contain pointer-events-none block" onLoad={onImageLoad} />
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <polygon points={`${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[3].x},${points[3].y} ${points[4].x},${points[4].y}`} className="fill-primary/10 stroke-primary stroke-[0.8]" />
                                    </svg>
                                    {points.map((p, i) => (
                                        <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-2xl cursor-grab z-20 flex items-center justify-center", draggingPoint === i ? "bg-primary scale-125 ring-8 ring-primary/20" : "bg-primary/80")}
                                             style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                                             onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}>
                                            <div className="size-3 bg-white rounded-full" />
                                        </div>
                                    ))}
                                    {draggingPoint !== null && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-32 md:size-48 rounded-full border-4 border-green-500 shadow-2xl bg-white ring-4 ring-white/50 animate-in zoom-in-50">
                                            <img src={currentRawImage} alt="mag" className="absolute max-w-none origin-top-left"
                                                style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} 
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="bg-black/60 p-4 border-t border-white/5 flex justify-center">
                         <div className="flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                            <Move className="h-4 w-4 text-primary animate-pulse" /> Precision handles active
                        </div>
                    </CardFooter>
                </Card>

                <Card className="border-none shadow-3xl overflow-hidden rounded-[2.5rem] bg-slate-100 dark:bg-slate-950 flex flex-col h-full">
                    <CardHeader className="bg-green-600/5 border-b p-4 flex flex-row items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-green-600/10 flex items-center justify-center text-green-600 shadow-md"><Eye className="size-6" /></div>
                            <CardTitle className="text-xl font-black uppercase tracking-tighter">HD Result Preview</CardTitle>
                         </div>
                         <Button variant="ghost" size="icon" onClick={() => setStage('viewfinder')}><X /></Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-900 h-full">
                         <div className="relative bg-white shadow-3xl rounded-sm border-[6px] md:border-[12px] border-white transform-gpu max-w-full flex items-center justify-center overflow-hidden">
                            {liveResultSrc ? <img src={liveResultSrc} className="max-w-full max-h-[60vh] object-contain block h-auto" alt="result" /> : <Loader2 className="animate-spin size-12 text-primary opacity-20" />}
                         </div>
                         
                         <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full mt-10">
                            <FilterBtn active={activeFilter === 'document'} onClick={() => setActiveFilter('document')} icon={FileText} label="DOC PRO" color="text-blue-500" />
                            <FilterBtn active={activeFilter === 'magic'} onClick={() => setActiveFilter('magic')} icon={Sparkles} label="MAGIC" color="text-yellow-500" />
                            <FilterBtn active={activeFilter === 'bw'} onClick={() => setActiveFilter('bw')} icon={ScanLine} label="BW PRO" color="text-slate-600" />
                            <FilterBtn active={activeFilter === 'photo'} onClick={() => setActiveFilter('photo')} icon={ImageIcon} label="PHOTO" color="text-purple-500" />
                            <FilterBtn active={activeFilter === 'gray'} onClick={() => setActiveFilter('gray')} icon={Droplets} label="GRAY" color="text-sky-500" />
                            <FilterBtn active={activeFilter === 'original'} onClick={() => setActiveFilter('original')} icon={RefreshCcw} label="RAW" color="text-rose-500" />
                         </div>
                    </CardContent>
                    <CardFooter className="p-6 border-t bg-white dark:bg-slate-950 flex flex-col sm:flex-row gap-4">
                        <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase text-xs border-2" onClick={() => setStage('viewfinder')}>CANCEL</Button>
                        <Button className="flex-[2] h-16 rounded-2xl bg-primary text-black font-black text-xl px-12 group shadow-3xl transition-all" onClick={handleConfirmAdd}>
                            CONFIRM & ADD <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )}

        {stage === 'stack' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="size-16 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-600 shadow-2xl border border-green-500/20">
                            <FileStack className="size-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Scan Bundle</h2>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase opacity-60 tracking-[0.3em]">{scannedPages.length} Pages Captured</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-none h-14 rounded-2xl font-black uppercase text-xs border-2 tracking-widest px-8 bg-white dark:bg-slate-900 shadow-md" onClick={() => setStage('viewfinder')}>
                            <Plus className="mr-2 size-5" /> SCAN MORE
                        </Button>
                        <Button className="flex-1 md:flex-none h-14 px-10 bg-green-600 hover:bg-green-700 text-white font-black text-base rounded-2xl shadow-3xl uppercase tracking-widest" onClick={() => {
                            const pdf = new jsPDF();
                            scannedPages.forEach((p, i) => {
                                if(i > 0) pdf.addPage();
                                const props = pdf.getImageProperties(p.processedSrc);
                                const pw = pdf.internal.pageSize.getWidth();
                                const ph = pdf.internal.pageSize.getHeight();
                                const ratio = Math.min(pw / props.width, ph / props.height);
                                pdf.addImage(p.processedSrc, 'JPEG', (pw - props.width * ratio) / 2, (ph - props.height * ratio) / 2, props.width * ratio, props.height * ratio, undefined, 'FAST');
                            });
                            pdf.save(`GR7-Final-Scan-${Date.now()}.pdf`);
                        }}>
                            <Download className="mr-3 size-6" /> EXPORT PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                    {scannedPages.map((page, i) => (
                        <Card key={page.id} className="group relative aspect-[3/4] rounded-3xl overflow-hidden border-2 bg-white shadow-2xl hover:border-primary/50 transition-all hover:-translate-y-2 transform-gpu">
                            <img src={page.processedSrc} className="size-full object-cover" alt={`p${i+1}`} />
                            <div className="absolute top-3 left-3 size-8 rounded-xl bg-black/70 backdrop-blur-md flex items-center justify-center text-xs font-black text-white border border-white/10 shadow-lg">P{i + 1}</div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <Button size="icon" variant="destructive" className="size-12 rounded-2xl shadow-2xl" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== page.id))}><Trash2 className="size-6" /></Button>
                            </div>
                        </Card>
                    ))}
                    <button 
                        className="aspect-[3/4] border-4 border-dashed border-muted-foreground/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:bg-primary/5 hover:border-primary/40 transition-all group shadow-inner"
                        onClick={() => setStage('viewfinder')}
                    >
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg border border-primary/20">
                            <Plus className="size-8" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Add Page</span>
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}

function FilterBtn({ active, onClick, icon: Icon, label, color }: { active: boolean, onClick: () => void, icon: any, label: string, color: string }) {
    return (
        <button onClick={onClick} className={cn(
            "flex flex-col items-center gap-2 p-2 rounded-2xl border-2 transition-all flex-1",
            active ? "bg-white border-primary shadow-2xl scale-105" : "bg-white/5 border-transparent opacity-40 hover:opacity-100"
        )}>
            <div className={cn("size-9 rounded-xl flex items-center justify-center shadow-inner", active ? "bg-primary/10" : "bg-white/5")}>
                <Icon className={cn("size-5", active ? color : "text-slate-400")} />
            </div>
            <span className={cn("text-[8px] font-black uppercase tracking-widest truncate w-full text-center", active ? "text-slate-900" : "text-slate-400")}>{label}</span>
        </button>
    );
}
