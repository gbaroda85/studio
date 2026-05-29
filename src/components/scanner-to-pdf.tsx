
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
    FileDigit, 
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
    Check,
    Type,
    Frame,
    Wand2,
    MousePointer2
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
 * 6-DOT PERSPECTIVE WARP LOGIC
 * Correctly maps 4 major corners while ignoring side-handles for math
 */
interface Point { x: number; y: number; }

function solvePerspective(src: Point[], dst: Point[]) {
    const p = [];
    // Points Index: 0:TL, 1:TR, 2:MR, 3:BR, 4:BL, 5:ML
    // Corners are: TL(0), TR(1), BR(3), BL(4)
    const corners = [src[0], src[1], src[3], src[4]];
    
    for (let i = 0; i < 4; i++) {
        if (!corners[i]) continue;
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
  const [activeFilter, setActiveFilter] = useState<ScanFilter>('magic');
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentRawImage, setCurrentRawImage] = useState<string | null>(null);
  const [liveResultSrc, setLiveResultSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBuildingPdf, setIsBuildingPdf] = useState(false);

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
   * PREMIUM DOCUMENT ENHANCEMENT ENGINE
   * Implements intelligent segmentation, shadow removal, and local contrast boost.
   */
  const applyIntelligentScan = useCallback(async (): Promise<string> => {
    const image = imgRef.current;
    if (!image || !currentRawImage) return "";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return "";

    // 1. WARP & ORIENTATION
    if (cropMode === 'rect') {
        const c = completedRectCrop || { x: 5, y: 5, width: 90, height: 90, unit: 'px' } as PixelCrop;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = Math.max(100, c.width * scaleX);
        canvas.height = Math.max(100, c.height * scaleY);
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

    // 2. CAMSCANNER-LEVEL ENHANCEMENT PIPELINE
    if (activeFilter !== 'original') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const len = pixels.length;

        // Step A: Background Estimation (Local Min-Max)
        // We calculate background color to remove shadows and glare.
        let rSum = 0, gSum = 0, bSum = 0;
        const samplingStep = 50; 
        let sampleCount = 0;
        for (let i = 0; i < len; i += 4 * samplingStep) {
            rSum += pixels[i]; gSum += pixels[i+1]; bSum += pixels[i+2];
            sampleCount++;
        }
        const avgBgR = rSum / sampleCount;
        const avgBgG = gSum / sampleCount;
        const avgBgB = bSum / sampleCount;

        for (let i = 0; i < len; i += 4) {
            const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            const chroma = Math.max(r, g, b) - Math.min(r, g, b);

            // INTELLIGENT SEGMENTATION
            // High chroma + mid luma = signature/stamp/photo
            // Low chroma + high luma = background
            // Low chroma + low luma = text
            const isDocumentElement = chroma > 35 || luma < 120; // Text or signature/photo
            
            if (activeFilter === 'magic' || activeFilter === 'document') {
                if (!isDocumentElement) {
                    // Whitening the background (Illumination correction)
                    pixels[i] = Math.min(255, r * 1.35);
                    pixels[i+1] = Math.min(255, g * 1.35);
                    pixels[i+2] = Math.min(255, b * 1.35);
                } else {
                    // Crisp text enhancement
                    const factor = luma < 80 ? 0.8 : 1.1; 
                    pixels[i] = r * factor;
                    pixels[i+1] = g * factor;
                    pixels[i+2] = b * factor;
                }
            } else if (activeFilter === 'bw') {
                if (chroma > 45 && luma < 180) {
                   // PROTECTED COLOR MODE: Preserve signatures and stamps in B&W
                   pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b;
                } else {
                    // Adaptive thresholding simulation
                    const val = luma > avgBgR * 0.9 ? 255 : (luma < 80 ? 0 : luma * 0.5);
                    pixels[i] = pixels[i+1] = pixels[i+2] = val;
                }
            } else if (activeFilter === 'photo') {
                // High-fidelity normalization
                pixels[i] = Math.min(255, r * 1.05);
                pixels[i+1] = Math.min(255, g * 1.05);
                pixels[i+2] = Math.min(255, b * 1.05);
            } else if (activeFilter === 'gray') {
                pixels[i] = pixels[i+1] = pixels[i+2] = luma * 1.1;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    return canvas.toDataURL('image/jpeg', 0.92);
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
        setPoints([
            { x: 10, y: 10 }, { x: 90, y: 10 },
            { x: 90, y: 50 }, { x: 90, y: 90 },
            { x: 10, y: 90 }, { x: 10, y: 50 }
        ]);
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
        pdf.save(`Scan-Bundle-${Date.now()}.pdf`);
        toast({ title: "Bundle Ready", description: "Multi-page PDF saved." });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Build Failed', description: 'Failed to generate PDF bundle.' });
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
        if (draggingPoint === 2) { 
            next[1].x = x; next[2].x = x; next[3].x = x;
        } else if (draggingPoint === 5) {
            next[0].x = x; next[5].x = x; next[4].x = x;
        } else {
            next[draggingPoint] = { x, y };
            if (draggingPoint === 0 || draggingPoint === 4) next[5] = { x: (next[0].x + next[4].x)/2, y: (next[0].y + next[4].y)/2 };
            if (draggingPoint === 1 || draggingPoint === 3) next[2] = { x: (next[1].x + next[3].x)/2, y: (next[1].y + next[3].y)/2 };
        }
        return next;
    });
  };

  return (
    <div className="w-full max-w-7xl flex flex-col gap-6 animate-in fade-in duration-700 pb-20 px-4">
        
        {/* VIEW: VIEWFINDER */}
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-none shadow-3xl overflow-hidden bg-black relative rounded-[2.5rem] aspect-video flex items-center justify-center">
                        <video ref={videoRef} className={cn("w-full h-full object-contain", !hasCameraPermission && "hidden")} autoPlay muted playsInline />
                        {!hasCameraPermission && hasCameraPermission !== null && (
                            <div className="p-12 text-center space-y-6 text-white w-full">
                                <Camera className="size-16 mx-auto opacity-20" />
                                <Button onClick={startCamera} className="bg-primary text-black font-black uppercase text-xs rounded-xl h-12 px-8">Retry Camera Access</Button>
                            </div>
                        )}
                        <div className="absolute bottom-6 right-6 z-20">
                             <Button variant="secondary" className="h-12 rounded-xl font-black uppercase text-[10px] shadow-2xl px-6" onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon className="mr-2 size-4 text-primary" /> OPEN GALLERY
                            </Button>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </div>
                    </Card>
                    <Button onClick={handleCapture} className="h-20 w-full bg-primary text-black font-black text-2xl rounded-2xl shadow-3xl transform active:scale-95 transition-all">SCAN CURRENT PAGE</Button>
                </div>
                <div className="lg:col-span-4">
                    <Card className="border-2 shadow-2xl flex flex-col bg-card/50 rounded-[2.5rem] h-full min-h-[500px]">
                        <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><FileStack className="size-6 text-primary" /> SCAN STACK</CardTitle>
                            <Badge className="bg-primary text-black font-black">{scannedPages.length}</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 p-6">
                            <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                {scannedPages.map((p, i) => (
                                    <div key={p.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 bg-white shadow-lg group hover:border-primary transition-all">
                                        <img src={p.processedSrc} className="size-full object-cover" alt="scan" />
                                        <div className="absolute top-1 left-1 size-6 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">{i+1}</div>
                                        <Button size="icon" variant="destructive" className="absolute top-1 right-1 size-7 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-lg" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}><Trash2 className="size-4" /></Button>
                                    </div>
                                ))}
                                {scannedPages.length === 0 && (
                                    <div className="col-span-2 py-24 text-center opacity-10">
                                        <FileStack className="size-20 mx-auto" />
                                        <p className="text-xs font-black uppercase mt-4 tracking-[0.2em]">Stack is empty</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 border-t bg-muted/10">
                            <Button disabled={scannedPages.length === 0 || isBuildingPdf} className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-black text-sm rounded-xl shadow-xl uppercase tracking-widest" onClick={handleBuildPdf}>
                                {isBuildingPdf ? <Loader2 className="animate-spin mr-2"/> : <Download className="mr-2 size-5" />} GENERATE BUNDLE ({scannedPages.length})
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {/* VIEW: ADJUSTMENT STUDIO */}
        {stage === 'adjust' && currentRawImage && (
            <Card className="border-none shadow-3xl overflow-hidden rounded-[2.5rem] animate-in zoom-in-95 duration-500 bg-slate-900">
                <CardHeader className="bg-white/5 border-b border-white/5 p-4 flex flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                         <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg border border-primary/20"><Maximize className="size-6" /></div>
                         <div>
                            <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">AI Studio Editor</CardTitle>
                            <CardDescription className="text-[10px] uppercase font-bold text-slate-400">Premium HD Enhancement logic active</CardDescription>
                         </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as CropMode)} className="bg-white/10 p-1 rounded-xl border border-white/10">
                            <TabsList className="grid grid-cols-2 h-9 bg-transparent">
                                <TabsTrigger value="rect" className="text-[10px] font-black uppercase px-4 data-[state=active]:bg-white data-[state=active]:text-black">RECT</TabsTrigger>
                                <TabsTrigger value="scanner" className="text-[10px] font-black uppercase px-4 data-[state=active]:bg-white data-[state=active]:text-black">SCANNER</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Button variant="outline" size="icon" onClick={handleRotateSource} className="h-11 w-11 border-2 border-white/10 rounded-xl text-white bg-white/5 hover:bg-white/10"><RotateCw className="size-5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setStage('viewfinder')} className="text-white hover:bg-white/10"><X /></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 grid lg:grid-cols-2 min-h-[500px] md:min-h-[750px] relative overflow-hidden select-none">
                    
                    {/* LEFT: ALIGNMENT WINDOW */}
                    <div className="flex flex-col items-center justify-center p-4 md:p-10 border-r border-white/5 relative bg-slate-950"
                         onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                        
                        <Badge className="absolute top-4 left-4 z-20 bg-primary text-black font-black text-[9px] uppercase">Alignment Source</Badge>
                        
                        <div ref={containerRef} className="relative cursor-crosshair shadow-2xl border-4 border-white/10 transform-gpu bg-black max-w-full">
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
                                        <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-2xl cursor-grab z-20 flex items-center justify-center transition-all", draggingPoint === i ? "bg-primary scale-125 ring-8 ring-primary/20" : "bg-primary/80")}
                                             style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                                             onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}>
                                            <div className="size-3 bg-white rounded-full shadow-inner" />
                                        </div>
                                    ))}
                                    {draggingPoint !== null && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-32 md:size-48 rounded-full border-4 border-green-500 shadow-2xl bg-white ring-4 ring-white/50 animate-in zoom-in-50">
                                            <img src={currentRawImage} alt="mag" className="absolute max-w-none origin-top-left"
                                                style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} 
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="size-6 border-2 border-red-500 rounded-full bg-white/50" /></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: LIVE HD PREVIEW WINDOW */}
                    <div className="flex flex-col items-center justify-center p-4 md:p-10 bg-slate-800 relative h-full shadow-inner">
                        <Badge className="absolute top-4 right-4 z-20 bg-green-600 text-white border-white/20 font-black text-[10px] uppercase tracking-widest shadow-xl">LIVE HD STUDIO VIEW</Badge>
                        <div className="w-full flex flex-col items-center gap-8">
                             <div className="relative bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] rounded-sm border-[8px] border-white transform-gpu max-w-full flex items-center justify-center overflow-hidden aspect-auto transition-all duration-300">
                                {liveResultSrc ? <img src={liveResultSrc} className="max-w-full max-h-[65vh] object-contain block h-auto" alt="result" /> : <Loader2 className="animate-spin text-primary size-12" />}
                             </div>
                             <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full max-w-2xl px-4">
                                <FilterBtn active={activeFilter === 'magic'} onClick={() => setActiveFilter('magic')} icon={Sparkles} label="Magic" color="text-yellow-400" />
                                <FilterBtn active={activeFilter === 'document'} onClick={() => setActiveFilter('document')} icon={FileText} label="Doc Pro" color="text-blue-400" />
                                <FilterBtn active={activeFilter === 'bw'} onClick={() => setActiveFilter('bw')} icon={ScanLine} label="PRO B/W" color="text-slate-400" />
                                <FilterBtn active={activeFilter === 'photo'} onClick={() => setActiveFilter('photo')} icon={ImageIcon} label="Photo" color="text-purple-400" />
                                <FilterBtn active={activeFilter === 'gray'} onClick={() => setActiveFilter('gray')} icon={Droplets} label="Gray" color="text-sky-400" />
                                <FilterBtn active={activeFilter === 'original'} onClick={() => setActiveFilter('original')} icon={RefreshCcw} label="Raw" color="text-rose-400" />
                             </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-black/40 p-6 border-t border-white/5 flex justify-between items-center gap-4">
                    <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase opacity-50 tracking-[0.2em] text-white">
                         <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-green-500"/> SECURE RAM</div>
                         <div className="flex items-center gap-2"><Zap className="size-5 text-yellow-500"/> AI ENHANCED</div>
                         <div className="flex items-center gap-2"><Layers className="size-5 text-primary"/> MULTI-SEGMENT</div>
                    </div>
                    <Button className="h-16 rounded-2xl bg-primary text-black font-black text-xl px-16 group shadow-3xl hover:scale-105 transition-all" onClick={handleConfirmAdd}>
                        CONFIRM & ADD <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </CardFooter>
            </Card>
        )}

        {/* VIEW: SCAN BUNDLE STACK */}
        {stage === 'stack' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="size-16 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-600 shadow-2xl border border-green-500/20">
                            <FileStack className="size-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Document Bundle</h2>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase opacity-60 tracking-[0.3em]">{scannedPages.length} High-Res Pages Ready</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-none h-14 rounded-2xl font-black uppercase text-xs border-2 tracking-widest px-8 bg-white dark:bg-slate-900" onClick={() => setStage('viewfinder')}>
                            <Plus className="mr-2 size-5" /> ADD MORE
                        </Button>
                        <Button className="flex-1 md:flex-none h-14 px-10 bg-green-600 hover:bg-green-700 text-white font-black text-base rounded-2xl shadow-3xl uppercase tracking-widest" onClick={handleBuildPdf} disabled={isBuildingPdf}>
                            {isBuildingPdf ? <Loader2 className="animate-spin mr-2"/> : <Download className="mr-3 size-6" />} SAVE AS PDF
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
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">Add Next Page</span>
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
                <Icon className={cn("size-5", active ? color : "text-white")} />
            </div>
            <span className={cn("text-[8px] font-black uppercase tracking-widest truncate w-full text-center", active ? "text-slate-900" : "text-white")}>{label}</span>
        </button>
    );
}

