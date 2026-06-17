
"use client";

import 'react-image-crop/dist/ReactCrop.css';
import React, { useState, useRef, type SyntheticEvent, useCallback, useEffect, type ChangeEvent, type DragEvent } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, degrees, PDFName } from 'pdf-lib';
import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
    UploadCloud, 
    Download, 
    ChevronLeft, 
    ChevronRight, 
    X, 
    Move, 
    CheckCircle2, 
    Scan, 
    Maximize, 
    RefreshCcw, 
    FileDigit, 
    ShieldCheck, 
    Zap, 
    Trash2, 
    LayoutGrid, 
    Info,
    Sparkles,
    FileArchive,
    Settings2,
    Crop,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
}

interface Point { x: number; y: number; }
interface PageState { mode: CropMode; crop?: CropType; completedCrop?: PixelCrop; points: Point[]; result: string | null; }

type CropMode = 'rectangular' | 'perspective';
type Stage = 'upload' | 'edit';

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i} pointer-events-none`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

export default function PdfCropper() {
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>('upload');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBuildingPdf, setIsBuildingPdf] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [pageStates, setPageStates] = useState<Record<number, PageState>>({});
  
  const [cropMode, setCropMode] = useState<CropMode>('rectangular');
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [points, setPoints] = useState<Point[]>([
    { x: 15, y: 15 }, { x: 50, y: 15 }, { x: 85, y: 15 }, 
    { x: 85, y: 50 }, { x: 85, y: 85 },                   
    { x: 50, y: 85 }, { x: 15, y: 85 },                   
    { x: 15, y: 50 }                                      
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const renderIdRef = useRef(0);

  const loadPageImage = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current) return;
    setIsProcessing(true);
    try {
        const page = await pdfDocRef.current.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.2 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        setPageImage(canvas.toDataURL('image/jpeg', 0.95));
    } catch (e) {
        toast({ variant: 'destructive', title: 'Render Error' });
    } finally {
        setIsProcessing(false);
    }
  }, [toast]);

  const handleFileChange = async (file: File | null) => {
    if (file && file.type === 'application/pdf') {
        renderIdRef.current++;
        setIsProcessing(true);
        setPdfFile(file);
        setPageStates({});
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const buffer = e.target?.result as ArrayBuffer;
                const loadingTask = pdfjs.getDocument({ 
                    data: new Uint8Array(buffer),
                    cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                    cMapPacked: true
                });
                pdfDocRef.current = await loadingTask.promise;
                setNumPages(pdfDocRef.current.numPages);
                await loadPageImage(1);
                setStage('edit');
            } catch (err) {
                toast({ variant: 'destructive', title: 'File Error', description: 'Could not open PDF.' });
                setPdfFile(null);
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsArrayBuffer(file);
    } else if (file) {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a PDF file.' });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const resetState = () => {
    renderIdRef.current++;
    setPdfFile(null);
    setPageImage(null);
    setPageStates({});
    setNumPages(0);
    setCurrentPage(1);
    setStage('upload');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (pdfDocRef.current && stage === 'edit') {
        loadPageImage(currentPage);
    }
    if (pageStates[currentPage]) {
        const s = pageStates[currentPage];
        setCropMode(s.mode); setCrop(s.crop); setCompletedCrop(s.completedCrop); setPoints(s.points);
    } else {
        setCropMode('rectangular'); setCrop(undefined); setCompletedCrop(undefined);
        setPoints([{ x: 15, y: 15 }, { x: 50, y: 15 }, { x: 85, y: 15 }, { x: 85, y: 50 }, { x: 85, y: 85 }, { x: 50, y: 85 }, { x: 15, y: 85 }, { x: 15, y: 50 }]);
    }
  }, [currentPage, loadPageImage, stage]);

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (!crop && cropMode === 'rectangular') {
        setCrop(centerCrop({ unit: '%', width: 90, height: 90 }, width, height));
    }
  };

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

  const handleApplyCrop = async () => {
    const image = imgRef.current;
    if (!image || !image.naturalWidth) return;
    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let processedImage = "";
    if (cropMode === 'perspective') {
        const corners = [points[0], points[2], points[4], points[6]].map(p => ({ 
            x: p.x * (image.naturalWidth / 100), 
            y: p.y * (image.naturalHeight / 100) 
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
        
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = image.naturalWidth; srcCanvas.height = image.naturalHeight;
        const srcCtx = srcCanvas.getContext('2d');
        srcCtx?.drawImage(image, 0, 0);
        const srcPixels = srcCtx?.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;

        if (srcPixels) {
            for (let y = 0; y < targetHeight; y++) {
                for (let x = 0; x < targetWidth; x++) {
                    const z = h[6] * x + h[7] * y + 1;
                    const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
                    const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
                    if (sx >= 0 && sx < image.naturalWidth && sy >= 0 && sy < image.naturalHeight) {
                        const dstIdx = (y * targetWidth + x) * 4; 
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
        processedImage = canvas.toDataURL('image/jpeg', 0.95);
    } else {
        if (!completedCrop) return;
        const scaleX = image.naturalWidth / image.width; 
        const scaleY = image.naturalHeight / image.height;
        canvas.width = Math.max(10, completedCrop.width * scaleX); 
        canvas.height = Math.max(10, completedCrop.height * scaleY);
        ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
        processedImage = canvas.toDataURL('image/jpeg', 0.95);
    }
    setPageStates(prev => ({ ...prev, [currentPage]: { mode: cropMode, crop, completedCrop, points, result: processedImage } }));
    setIsProcessing(false);
    toast({ title: `Page ${currentPage} Cropped` });
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
        if (idx === null || !next[idx]) return prev;

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

  const croppedEntries = Object.entries(pageStates).filter(([_,s])=>!!s.result).sort((a,b)=>Number(a[0])-Number(b[0]));

  if (stage === 'upload') {
    return (
        <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
            <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
                <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
                    <Maximize className="size-8" />
                    <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                        <Sparkles className="size-2.5" />
                    </div>
                </div>
                <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                    PDF <span className="text-gradient-hero">Cropper Studio</span>
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                    Trim PDF margins or fix perspective with 8-dot scanner. <br/>100% Private local browser mapping.
                </p>
            </div>

            <Card className={cn(
                "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 dark:hover:shadow-primary/20",
                isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
            )}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <CardHeader className="bg-muted/30 border-b p-6 text-center">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-12">
                    <div 
                        className={cn(
                            "border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
                        )}
                    >
                        <div className="relative">
                            <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Zap className="absolute -top-2 -right-2 size-6 md:size-8 text-yellow-500 animate-pulse" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop PDF File here</h3>
                            <p className="text-[10px] md:text-sm text-muted-foreground mt-1 font-bold opacity-60 uppercase">100% Private local RAM processing.</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
                <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                    <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT CROP</div>
                </CardFooter>
            </Card>
        </div>
    );
  }

  return (
    <div className="w-full max-w-7xl px-2 md:px-4 animate-in fade-in duration-500 flex flex-col gap-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
                <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                    <CardHeader className="bg-muted/30 border-b flex flex-col sm:flex-row items-center justify-between p-6 gap-4 shrink-0">
                        <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as CropMode)} className="bg-background/50 p-1 rounded-lg border">
                            <TabsList className="h-9">
                                <TabsTrigger value="rectangular" className="text-[10px] font-black uppercase px-4"><Maximize className="size-3.5 mr-1.5" /> RECT</TabsTrigger>
                                <TabsTrigger value="perspective" className="text-[10px] font-black uppercase px-4"><Scan className="size-3.5 mr-1.5" /> SCAN</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-2" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}><ChevronLeft className="size-5" /></Button>
                            <Badge className="bg-primary text-white font-black uppercase px-4 py-1.5 text-[10px] rounded-lg shadow-md border-2 border-white/20">PAGE {currentPage} / {numPages || '?'}</Badge>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-2" onClick={() => setCurrentPage(p => Math.min(numPages, p+1))} disabled={currentPage === numPages}><ChevronRight className="size-5" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent 
                        className="p-0 flex flex-col items-center justify-center min-h-[600px] bg-slate-200 dark:bg-slate-900 relative overflow-hidden select-none shadow-inner flex-1" 
                        onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}
                    >
                        {isProcessing ? (
                            <div className="flex flex-col items-center gap-4 py-32"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="text-[10px] font-black uppercase text-primary animate-pulse">Rendering Page...</p></div>
                        ) : pageImage && (
                            <div ref={containerRef} className="relative shadow-3xl border-4 border-white transform-gpu bg-white my-10 max-w-[95vw]">
                                {cropMode === 'rectangular' ? (
                                    <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={c => setCompletedCrop(c)}>
                                        <img ref={imgRef} src={pageImage} alt="pdf" className="max-h-[65vh] w-auto block" onLoad={onImageLoad} />
                                    </ReactCrop>
                                ) : (
                                    <div className="relative">
                                        <img ref={imgRef} src={pageImage} alt="pdf" className="max-h-[65vh] w-auto pointer-events-none block" onLoad={onImageLoad} />
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <polygon points={`${points[0].x},${points[0].y} ${points[2].x},${points[2].y} ${points[4].x},${points[4].y} ${points[6].x},${points[6].y}`} className="fill-primary/10 stroke-primary stroke-[0.6] dash-array-[5,5]" />
                                        </svg>
                                        {points.map((p, i) => (
                                            <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-2xl cursor-grab transition-transform z-20 flex items-center justify-center", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/90")}
                                                style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }} onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}>
                                                <div className="size-2.5 bg-white rounded-full" />
                                            </div>
                                        ))}
                                        {draggingPoint !== null && (
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 md:size-48 rounded-full border-4 border-green-500 shadow-3xl bg-white ring-4 ring-white/50 animate-in zoom-in-50">
                                                <img src={pageImage} alt="mag" className="absolute max-w-none origin-top-left" style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-full h-0.5 bg-green-500/50 absolute" /><div className="h-full w-0.5 bg-green-500/50 absolute" /></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 bg-black/80 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-3xl z-40 whitespace-nowrap">
                            <Move className="size-3.5 text-primary animate-pulse" /> {cropMode === 'rectangular' ? "Position Crop Box" : "Drag 4 corners to fit edges"}
                        </div>
                    </CardContent>
                    <CardFooter className="bg-white dark:bg-slate-950 p-4 border-t shrink-0 flex justify-center gap-8 text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">
                         <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                         <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT SYNC</div>
                    </CardFooter>
                </Card>

                {/* CROP PREVIEW STRIP */}
                {croppedEntries.length > 0 && (
                    <Card className="border-2 shadow-xl bg-card/40 rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-4 bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="size-3 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Cropped Pages Bundle</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <ScrollArea className="w-full whitespace-nowrap">
                                <div className="flex gap-4 pb-4 px-1">
                                    {croppedEntries.map(([idx, s]) => (
                                        <div key={idx} className="relative inline-block w-24 md:w-32 aspect-[3/4] rounded-xl overflow-hidden border-2 bg-white shadow-lg group">
                                            <img src={s.result!} className="size-full object-contain" alt={`P${idx}`} />
                                            <div className="absolute top-1 left-1 size-5 rounded-md bg-black/80 backdrop-blur-md flex items-center justify-center text-[8px] font-black text-white">P{idx}</div>
                                            <Button size="icon" variant="destructive" className="absolute top-1 right-1 size-5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setPageStates(prev => {
                                                const next = {...prev};
                                                delete next[Number(idx)];
                                                return next;
                                            })}>
                                                <Trash2 className="size-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
                <Card className="border-2 shadow-2xl overflow-hidden rounded-[2.5rem] bg-card/50 border-primary/10">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2"><Settings2 className="size-5 text-primary" /> Studio Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        <div className="flex flex-col gap-4">
                            <div className="border-2 border-dashed border-primary/20 rounded-[1.5rem] p-4 text-center">
                                <p className="text-[11px] font-bold text-muted-foreground leading-tight">Trim margins for a clean digital doc.</p>
                            </div>

                            <Button className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl group transition-all active:scale-95" onClick={handleApplyCrop} disabled={isProcessing || !pageImage}>
                                <CheckCircle2 className="size-6 mr-2 group-hover:scale-110 transition-transform" /> APPLY FOR PAGE {currentPage}
                            </Button>

                            <div className="bg-green-500/5 border-2 border-green-500/10 rounded-[1.5rem] p-5 flex items-start gap-4 text-left">
                                <div className="size-10 rounded-full bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="size-5 text-green-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black text-green-700 uppercase tracking-tight">INDEPENDENT PAGES</p>
                                    <p className="text-[9px] font-medium text-green-600/80 leading-relaxed uppercase">
                                        Every crop results in a separate new page in the output PDF.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <Separator className="opacity-10" />

                        <div className="space-y-4">
                            <Button 
                                size="lg" 
                                className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#22c55e] hover:bg-[#16a34a] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-18 shadow-[0_8px_20px_-10px_rgba(34,197,94,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(34,197,94,0.6)] hover:-translate-y-1 active:scale-95 border-none w-full" 
                                disabled={croppedEntries.length === 0 || isBuildingPdf}
                                onClick={async () => {
                                    setIsBuildingPdf(true);
                                    try {
                                        const finalPdf = await PDFDocument.create();
                                        for(const [_,s] of croppedEntries){
                                            const b = await fetch(s.result!).then(r=>r.arrayBuffer());
                                            const ei = await finalPdf.embedJpg(b);
                                            const pWidth = ei.width / 2.2;
                                            const pHeight = ei.height / 2.2;
                                            const p = finalPdf.addPage([pWidth, pHeight]);
                                            p.drawImage(ei, { x: 0, y: 0, width: p.getWidth(), height: p.getHeight() });
                                        }
                                        const bytes = await finalPdf.save();
                                        const link = document.createElement('a'); 
                                        link.href = URL.createObjectURL(new Blob([bytes], {type:'application/pdf'})); 
                                        link.download=`GR7-Cropped-Bundle-${Date.now()}.pdf`; 
                                        link.click();
                                        toast({ title: "Bundle Exported", description: "All cropped pages combined." });
                                    } catch (e) {
                                        toast({ variant: 'destructive', title: 'Export Error' });
                                    } finally {
                                        setIsBuildingPdf(false);
                                    }
                                }}
                            >
                                <div className="absolute left-4 w-0.5 h-6 md:h-8 bg-white/40 rounded-full" />
                                <span className="flex-1 px-10 text-center tracking-widest text-[11px] md:text-sm uppercase">SAVE {croppedEntries.length} PAGE BUNDLE</span>
                                <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#22c55e] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                    {isBuildingPdf ? <Loader2 className="size-6 md:size-8 animate-spin" /> : <Download className="size-6 md:size-8 group-hover:scale-110 transition-transform" />}
                                    <div className="absolute right-3 w-0.5 h-6 bg-[#22c55e]/20 rounded-full" />
                                </div>
                            </Button>
                            <Button variant="ghost" onClick={resetState} className="w-full h-10 font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-destructive/5 hover:text-destructive">
                                <RefreshCcw className="size-3 mr-2" /> Start Over
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
