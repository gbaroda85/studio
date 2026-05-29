
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
    Crop, 
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
    Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

interface Point {
    x: number;
    y: number;
}

type ScanFilter = 'original' | 'magic' | 'bw' | 'grayscale';
type Stage = 'viewfinder' | 'adjust' | 'studio' | 'stack';

interface ScannedPage {
    id: string;
    originalSrc: string;
    processedSrc: string;
    filter: ScanFilter;
    points: Point[];
}

export default function ScannerToPdf() {
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>('viewfinder');
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number | null>(null);
  
  // Viewfinder State
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Adjustment State (Perspective)
  const [currentRawImage, setCurrentRawImage] = useState<string | null>(null);
  const [points, setPoints] = useState<Point[]>([
      { x: 15, y: 15 }, { x: 85, y: 15 },
      { x: 85, y: 85 }, { x: 15, y: 85 }
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Studio State (Filters)
  const [activeFilter, setActiveFilter] = useState<ScanFilter>('magic');
  const [brightness, setBrightness] = useState(100);
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
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
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

  // 2. CAPTURE LOGIC
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
      setPoints([{ x: 10, y: 10 }, { x: 90, y: 10 }, { x: 90, y: 90 }, { x: 10, y: 90 }]);
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
        setPoints([{ x: 15, y: 15 }, { x: 85, y: 15 }, { x: 85, y: 85 }, { x: 15, y: 85 }]);
        setStage('adjust');
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. PERSPECTIVE CORRECTION (Homography)
  const solvePerspective = (src: Point[], dst: Point[]) => {
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
  };

  const applyPerspectiveAndFilter = async (filter: ScanFilter = 'magic'): Promise<string> => {
    const image = imgRef.current;
    if (!image || !currentRawImage) return "";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return "";

    const w1 = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
    const w2 = Math.hypot(points[2].x - points[3].x, points[2].y - points[3].y);
    const h1 = Math.hypot(points[3].x - points[0].x, points[3].y - points[0].y);
    const h2 = Math.hypot(points[2].x - points[1].x, points[2].y - points[1].y);
    
    const targetWidth = Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100));
    const targetHeight = Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100));
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const srcPoints = points.map(p => ({ x: p.x * (image.naturalWidth / 100), y: p.y * (image.naturalHeight / 100) }));
    const dstPoints = [{ x: 0, y: 0 }, { x: targetWidth, y: 0 }, { x: targetWidth, y: targetHeight }, { x: 0, y: targetHeight }];
    const h = solvePerspective(dstPoints, srcPoints);
    
    const imgData = ctx.createImageData(targetWidth, targetHeight);
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = image.naturalWidth;
    srcCanvas.height = image.naturalHeight;
    const srcCtx = srcCanvas.getContext('2d');
    srcCtx?.drawImage(image, 0, 0);
    const srcData = srcCtx?.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;

    if (!srcData) return "";

    // 1. Perspective Transform
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

    // 2. Apply High-Grade Filters
    if (filter !== 'original') {
        const processedData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const pixels = processedData.data;

        for (let i = 0; i < pixels.length; i += 4) {
            let r = pixels[i], g = pixels[i+1], b = pixels[i+2];
            
            if (filter === 'magic') {
                // Adaptive Contrast / Brightness Stretch
                const luma = 0.299 * r + 0.587 * g + 0.114 * b;
                const factor = luma < 128 ? 1.1 : 1.25; // Boost highlights, preserve shadows
                r = Math.min(255, r * factor);
                g = Math.min(255, g * factor);
                b = Math.min(255, b * factor);
            } else if (filter === 'bw') {
                const luma = 0.299 * r + 0.587 * g + 0.114 * b;
                const v = luma > 140 ? 255 : 0;
                r = g = b = v;
            } else if (filter === 'grayscale') {
                const v = 0.299 * r + 0.587 * g + 0.114 * b;
                r = g = b = v;
            }
            
            pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b;
        }
        ctx.putImageData(processedData, 0, 0);
    }

    return canvas.toDataURL('image/jpeg', 0.92);
  };

  const handleConfirmAdjustment = async () => {
    setIsProcessing(true);
    const result = await applyPerspectiveAndFilter(activeFilter);
    const newPage: ScannedPage = {
        id: Math.random().toString(36).substr(2, 9),
        originalSrc: currentRawImage!,
        processedSrc: result,
        filter: activeFilter,
        points: [...points]
    };
    setScannedPages(prev => [...prev, newPage]);
    setStage('stack');
    setIsProcessing(false);
    toast({ title: "Page Added", description: "Successfully corrected and enhanced." });
  };

  // 4. MOUSE/TOUCH INTERACTION
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

  // 5. EXPORT LOGIC
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
    pdf.save(`AI-Scan-Bundle-${Date.now()}.pdf`);
    setIsBuildingPdf(false);
    toast({ title: "PDF Exported", description: "All pages bundled in HD quality." });
  };

  return (
    <div className="w-full max-w-7xl flex flex-col gap-6 animate-in fade-in duration-700 pb-20 px-4">
        
        {/* STAGE: VIEWFINDER */}
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-2 shadow-2xl overflow-hidden bg-black relative rounded-2xl md:rounded-[3rem]">
                        <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between no-print">
                            <div className="flex items-center gap-2">
                                <ScanLine className="size-4 text-primary" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Viewfinder</CardTitle>
                            </div>
                            <Badge className="bg-green-600 text-white font-black text-[9px] uppercase px-3 py-1">HD FOCUS ACTIVE</Badge>
                        </CardHeader>
                        <CardContent className="p-0 relative aspect-[4/3] flex items-center justify-center">
                            <video ref={videoRef} className={cn("w-full h-full object-contain", hasCameraPermission !== true && "hidden")} autoPlay muted playsInline />
                            
                            {hasCameraPermission === false && (
                                <div className="p-12 text-center space-y-6 text-white">
                                    <Camera className="size-16 mx-auto opacity-20" />
                                    <p className="font-black uppercase text-sm">Camera Permission Denied</p>
                                    <Button onClick={startCamera} className="bg-primary rounded-xl">Retry Connection</Button>
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
                        </CardContent>
                        <CardFooter className="p-6 md:p-10 bg-white dark:bg-slate-950 border-t flex flex-col sm:flex-row gap-4">
                            <Button onClick={handleCapture} className="h-16 flex-[2] bg-gradient-button text-white font-black text-xl rounded-2xl shadow-2xl group active:scale-95 transition-all">
                                <Zap className="mr-3 size-6 text-yellow-400 group-hover:scale-125 transition-transform" /> CAPTURE DOCUMENT
                            </Button>
                            <Button variant="outline" className="h-16 flex-1 border-2 font-black text-xs rounded-2xl uppercase" onClick={() => fileInputRef.current?.click()}>
                                <UploadCloud className="mr-2 size-5" /> Import
                            </Button>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </CardFooter>
                    </Card>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 no-print">
                        <ScanTip icon={ShieldCheck} title="100% PRIVATE" desc="Local RAM Process" color="text-green-500" />
                        <ScanTip icon={Zap} title="NATIVE SPEED" desc="Instant Homography" color="text-yellow-500" />
                        <ScanTip icon={Sparkles} title="HD CLARITY" desc="OCR-Ready Output" color="text-primary" />
                    </div>
                </div>

                {/* Side Stack Preview */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-2 shadow-2xl border-primary/10 flex flex-col bg-card/50 rounded-[2rem] min-h-[400px]">
                        <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                <FileDigit className="size-5 text-primary" /> Document Stack
                            </CardTitle>
                            <Badge variant="outline" className="font-black text-primary border-primary/20">{scannedPages.length}</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 p-6">
                            {scannedPages.length === 0 ? (
                                <div className="py-20 text-center opacity-30 space-y-4">
                                    <Monitor className="size-16 mx-auto" />
                                    <p className="text-[10px] font-black uppercase">Waiting for Capture</p>
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
                        <CardFooter className="p-6 bg-muted/10 border-t flex flex-col gap-3">
                            <Button disabled={scannedPages.length === 0} className="w-full h-14 bg-primary font-black text-sm rounded-xl shadow-xl active:scale-95" onClick={handleBuildPdf}>
                                {isBuildingPdf ? <Loader2 className="animate-spin mr-2"/> : <Download className="mr-2 size-5" />} GENERATE PDF BUNDLE
                            </Button>
                            {scannedPages.length > 0 && <Button variant="ghost" className="text-[9px] font-black uppercase opacity-50" onClick={() => setScannedPages([])}>Clear All</Button>}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {/* STAGE: ADJUST (4-DOT PERSPECTIVE) */}
        {stage === 'adjust' && currentRawImage && (
            <Card className="w-full max-w-5xl mx-auto shadow-2xl border-none overflow-hidden rounded-[2.5rem] animate-in zoom-in-95 duration-500">
                <CardHeader className="bg-primary/5 border-b p-4 md:p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Maximize className="size-6 text-primary" /> Perspective Correction
                        </CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase opacity-60">Drag 4 dots to document corners.</CardDescription>
                    </div>
                    <Button variant="ghost" onClick={() => setStage('viewfinder')} className="text-destructive"><X /></Button>
                </CardHeader>
                <CardContent className="p-0 bg-slate-200 dark:bg-slate-900 flex flex-col items-center justify-center min-h-[450px] md:min-h-[650px] relative overflow-hidden select-none"
                             onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                    
                    <div ref={containerRef} className="relative cursor-crosshair shadow-2xl border-4 border-white transform-gpu bg-white max-w-[90vw]">
                        <img ref={imgRef} src={currentRawImage} alt="raw capture" className="max-h-[60vh] md:max-h-[70vh] w-auto object-contain pointer-events-none" />
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} className="fill-primary/20 stroke-primary stroke-[0.8]" />
                        </svg>
                        {points.map((p, i) => (
                            <div key={i} className={cn("absolute size-10 md:size-14 -ml-5 md:-ml-7 -mt-5 md:-mt-7 rounded-full border-4 border-white shadow-2xl cursor-grab active:cursor-grabbing z-20 flex items-center justify-center transition-all", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/90")}
                                 style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                                 onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}>
                                <div className="size-2.5 md:size-4 bg-white rounded-full shadow-inner" />
                            </div>
                        ))}

                        {/* HIGH-PRECISION MAGNIFIER */}
                        {draggingPoint !== null && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-32 md:size-48 rounded-full border-4 border-green-500 shadow-2xl bg-white animate-in zoom-in-50 ring-4 ring-white/50">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="absolute size-full flex items-center justify-center z-10">
                                        <div className="w-full h-0.5 bg-green-500/50 absolute" />
                                        <div className="h-full w-0.5 bg-green-500/50 absolute" />
                                        <div className="size-3 border-2 border-red-500 rounded-full bg-white/50 shadow-sm" />
                                    </div>
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
                    
                    <div className="mt-8 flex items-center gap-3 px-6 py-3 bg-black/70 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl z-40">
                        <Move className="size-4 text-primary animate-pulse" /> 
                        Drag 4 dots to Corners
                    </div>
                </CardContent>
                <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex justify-between gap-4">
                    <Button variant="ghost" onClick={() => setStage('viewfinder')} className="font-black text-[10px] uppercase h-12 md:h-14 px-8 rounded-xl">CANCEL</Button>
                    <div className="flex gap-3 flex-1 justify-end">
                         <Button onClick={() => setPoints([{x:10, y:10}, {x:90, y:10}, {x:90, y:90}, {x:10, y:90}])} variant="outline" className="h-12 md:h-14 px-6 border-2 font-black text-[10px] uppercase rounded-xl">Reset Points</Button>
                         <Button className="h-12 md:h-14 px-12 bg-primary font-black text-base rounded-xl shadow-2xl group" onClick={() => setStage('studio')}>
                            NEXT STEP <ChevronRightIcon className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                         </Button>
                    </div>
                </CardFooter>
            </Card>
        )}

        {/* STAGE: STUDIO (FILTERS) */}
        {stage === 'studio' && currentRawImage && (
            <div className="grid lg:grid-cols-12 gap-8 items-start animate-in slide-in-from-right duration-500">
                <div className="lg:col-span-8">
                     <Card className="border-none shadow-2xl overflow-hidden bg-slate-200 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center p-6 md:p-12 min-h-[500px] md:min-h-[700px] relative">
                        {isProcessing ? (
                            <div className="flex flex-col items-center gap-6 text-center animate-pulse">
                                <Loader2 className="size-16 animate-spin text-primary stroke-[3]" />
                                <p className="text-xl font-black uppercase tracking-widest">Enhancing Details...</p>
                            </div>
                        ) : (
                            <div className="relative group shadow-3xl border-8 border-white bg-white rounded-sm transform transition-all hover:scale-[1.01]">
                                <ScannedImagePreview 
                                    originalSrc={currentRawImage} 
                                    filter={activeFilter} 
                                    points={points} 
                                    solvePerspective={solvePerspective}
                                />
                                <div className="absolute top-2 right-2 opacity-20 pointer-events-none">
                                    <Badge variant="outline" className="text-[8px] font-black uppercase border-black">HD SCAN OUTPUT</Badge>
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-10 flex items-center gap-3 px-6 py-3 bg-black/70 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl">
                             <Sparkles className="size-4 text-primary animate-pulse" /> Final Studio Refinement
                        </div>
                     </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950">
                        <CardHeader className="bg-primary/5 border-b p-6">
                             <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <Palette className="size-6 text-primary" /> Filter Studio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-10">
                            <div className="space-y-6">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Visual Presets</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <FilterButton active={activeFilter === 'magic'} onClick={() => setActiveFilter('magic')} icon={Sparkles} title="Magic Color" sub="Auto-Balanced" />
                                    <FilterButton active={activeFilter === 'bw'} onClick={() => setActiveFilter('bw')} icon={ScanLine} title="B&W" sub="Document High" />
                                    <FilterButton active={activeFilter === 'grayscale'} onClick={() => setActiveFilter('grayscale')} icon={Droplets} title="Grayscale" sub="Ink Classic" />
                                    <FilterButton active={activeFilter === 'original'} onClick={() => setActiveFilter('original')} icon={ImageIcon} title="Original" sub="Natural View" />
                                </div>
                            </div>

                            <div className="p-5 bg-green-500/5 rounded-2xl border-2 border-green-500/10 flex gap-4">
                                <ShieldCheck className="size-6 text-green-600 shrink-0" />
                                <p className="text-[10px] text-green-800 font-bold leading-relaxed uppercase">
                                    <span className="font-black block text-primary mb-1">OCR-READY OUTPUT</span>
                                    Magic mode extracts text patterns precisely for easier copy-pasting later.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 bg-muted/10 border-t flex flex-col gap-4">
                            <Button className="w-full h-18 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl group transition-all active:scale-95" onClick={handleConfirmAdjustment} disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="animate-spin mr-3"/> : <CheckCircle2 className="mr-3 size-7" />} 
                                {isProcessing ? "PROCESSING..." : "CONFIRM PAGE"}
                            </Button>
                            <Button variant="ghost" onClick={() => setStage('adjust')} className="w-full font-black text-[10px] uppercase opacity-40 hover:opacity-100">Back to Cropping</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {/* STAGE: STACK (MULTI-PAGE VIEW) */}
        {stage === 'stack' && (
            <div className="flex flex-col items-center gap-10 animate-in fade-in duration-500">
                <div className="w-full max-w-4xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                            <FileDigit className="size-7" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Document <span className="text-primary">Ready</span></h2>
                            <p className="text-sm font-bold text-muted-foreground uppercase opacity-60">Bundle of {scannedPages.length} high-definition scans.</p>
                        </div>
                    </div>
                    <Button onClick={() => setStage('viewfinder')} variant="outline" className="h-14 px-8 border-2 font-black text-xs uppercase rounded-2xl hover:border-primary transition-all">
                        <Plus className="mr-2 size-5" /> Add Next Page
                    </Button>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                     {scannedPages.map((page, idx) => (
                        <Card key={page.id} className="group overflow-hidden rounded-[2.5rem] border-2 shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all transform hover:-translate-y-2">
                            <div className="aspect-[3/4] relative bg-white flex items-center justify-center p-3">
                                <img src={page.processedSrc} className="size-full object-contain rounded-xl shadow-inner" alt="scan" />
                                <div className="absolute top-5 left-5 bg-black/80 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-black">PAGE {idx + 1}</div>
                                <div className="absolute bottom-5 inset-x-5 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Button size="sm" variant="destructive" className="h-10 px-6 font-black rounded-xl" onClick={() => setScannedPages(prev => prev.filter(p => p.id !== page.id))}>
                                        <Trash2 className="mr-2 size-4" /> Remove
                                     </Button>
                                </div>
                            </div>
                        </Card>
                     ))}
                     <button 
                        onClick={() => setStage('viewfinder')}
                        className="aspect-[3/4] rounded-[2.5rem] border-4 border-dashed border-primary/20 flex flex-col items-center justify-center gap-4 hover:bg-primary/5 hover:border-primary transition-all group"
                     >
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Plus className="size-8" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest text-primary/40 group-hover:text-primary">Add More Pages</span>
                     </button>
                </div>

                <Card className="w-full max-w-2xl bg-slate-900 text-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-t border-white/10">
                     <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="space-y-3 text-center md:text-left">
                            <h3 className="text-3xl font-black uppercase tracking-tighter">Final Bundle</h3>
                            <p className="text-slate-400 text-sm font-medium">Ready to export {scannedPages.length} pages as high-quality PDF.</p>
                            <div className="flex items-center gap-6 pt-4 opacity-40 text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-500" /> SECURE</div>
                                <div className="flex items-center gap-1.5"><Zap className="size-3.5 text-yellow-500" /> LOCAL</div>
                            </div>
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

// STYLING SUB-COMPONENTS

function ScanTip({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
    return (
        <Card className="bg-card/50 border shadow-sm p-4 flex gap-3 items-center hover:shadow-lg transition-all">
            <div className={cn("size-8 rounded-lg bg-muted flex items-center justify-center shrink-0", color)}>
                <Icon className="size-4" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-tight leading-none mb-0.5">{title}</p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60 leading-none">{desc}</p>
            </div>
        </Card>
    );
}

function FilterButton({ active, onClick, icon: Icon, title, sub }: { active: boolean, onClick: () => void, icon: any, title: string, sub: string }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2",
                active ? "border-primary bg-primary/5 shadow-inner" : "border-muted hover:border-primary/40 bg-white dark:bg-slate-900"
            )}
        >
            <div className={cn("size-8 rounded-lg flex items-center justify-center", active ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                <Icon className="size-4" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-tight">{title}</p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">{sub}</p>
            </div>
        </button>
    );
}

// RENDERING PREVIEW WITH FILTERS (Using temporary canvas logic)
function ScannedImagePreview({ originalSrc, filter, points, solvePerspective }: { originalSrc: string, filter: ScanFilter, points: Point[], solvePerspective: any }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        const img = new window.Image();
        img.src = originalSrc;
        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const image = img;
            const w1 = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
            const w2 = Math.hypot(points[2].x - points[3].x, points[2].y - points[3].y);
            const h1 = Math.hypot(points[3].x - points[0].x, points[3].y - points[0].y);
            const h2 = Math.hypot(points[2].x - points[1].x, points[2].y - points[1].y);
            
            const targetWidth = Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100));
            const targetHeight = Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100));
            
            // Constrain display size for preview
            const displayScale = Math.min(800 / targetWidth, 1000 / targetHeight, 1);
            canvas.width = targetWidth * displayScale;
            canvas.height = targetHeight * displayScale;

            const srcPoints = points.map(p => ({ x: p.x * (image.naturalWidth / 100), y: p.y * (image.naturalHeight / 100) }));
            const dstPoints = [{ x: 0, y: 0 }, { x: canvas.width, y: 0 }, { x: canvas.width, y: canvas.height }, { x: 0, y: canvas.height }];
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
                
                // Filter logic
                if (filter !== 'original') {
                    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const d = pixels.data;
                    for (let i = 0; i < d.length; i += 4) {
                        let r = d[i], g = d[i+1], b = d[i+2];
                        if (filter === 'magic') {
                            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
                            const f = luma < 128 ? 1.1 : 1.25;
                            r = Math.min(255, r * f); g = Math.min(255, g * f); b = Math.min(255, b * f);
                        } else if (filter === 'bw') {
                            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
                            const v = luma > 140 ? 255 : 0;
                            r = g = b = v;
                        } else if (filter === 'grayscale') {
                            const v = 0.299 * r + 0.587 * g + 0.114 * b;
                            r = g = b = v;
                        }
                        d[i] = r; d[i+1] = g; d[i+2] = b;
                    }
                    ctx.putImageData(pixels, 0, 0);
                }
            }
        };
    }, [originalSrc, filter, points, solvePerspective]);

    return <canvas ref={canvasRef} className="max-w-full h-auto object-contain block" />;
}
