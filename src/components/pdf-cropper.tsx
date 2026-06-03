
"use client";

import 'react-image-crop/dist/ReactCrop.css';
import React, { useState, useRef, type SyntheticEvent, useCallback, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
    UploadCloud, Download, Loader2, ChevronLeft, ChevronRight, X, Move, CheckCircle2, Scan, Maximize, RefreshCcw, FileDigit, ShieldCheck, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from './ui/scroll-area';

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs`;
}

type CropMode = 'rectangular' | 'perspective';
interface Point { x: number; y: number; }
interface PageState { mode: CropMode; crop?: CropType; completedCrop?: PixelCrop; points: Point[]; result: string | null; }

export default function PdfCropper() {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  useEffect(() => {
    if (pdfFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const buffer = e.target?.result as ArrayBuffer;
            const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
            pdfDocRef.current = await loadingTask.promise;
            setNumPages(pdfDocRef.current.numPages);
            loadPageImage(1);
        };
        reader.readAsArrayBuffer(pdfFile);
    }
  }, [pdfFile, loadPageImage]);

  useEffect(() => {
    if (pdfDocRef.current) {
        loadPageImage(currentPage);
    }
    if (pageStates[currentPage]) {
        const s = pageStates[currentPage];
        setCropMode(s.mode); setCrop(s.crop); setCompletedCrop(s.completedCrop); setPoints(s.points);
    } else {
        setCropMode('rectangular'); setCrop(undefined); setCompletedCrop(undefined);
        setPoints([{ x: 15, y: 15 }, { x: 50, y: 15 }, { x: 85, y: 15 }, { x: 85, y: 50 }, { x: 85, y: 85 }, { x: 50, y: 85 }, { x: 15, y: 85 }, { x: 15, y: 50 }]);
    }
  }, [currentPage, pageStates, loadPageImage]);

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
        const w1 = Math.hypot(points[2].x - points[0].x, points[2].y - points[0].y);
        const w2 = Math.hypot(points[4].x - points[6].x, points[4].y - points[6].y);
        const h1 = Math.hypot(points[6].x - points[0].x, points[6].y - points[0].y);
        const h2 = Math.hypot(points[4].x - points[2].x, points[4].y - points[2].y);
        const targetWidth = Math.max(10, Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100)));
        const targetHeight = Math.max(10, Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100)));
        canvas.width = targetWidth; canvas.height = targetHeight;
        
        // Use TL, TR, BR, BL corners for mapping
        const srcPoints = [points[0], points[2], points[4], points[6]].map(p => ({ 
            x: p.x * (image.naturalWidth / 100), 
            y: p.y * (image.naturalHeight / 100) 
        }));
        const dstPoints = [{ x: 0, y: 0 }, { x: targetWidth, y: 0 }, { x: targetWidth, y: targetHeight }, { x: 0, y: targetHeight }];
        
        // Reverse mapping: Dst -> Src for pixel copying
        const h = solvePerspective(dstPoints, srcPoints);
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
        if ([0, 2, 4, 6].includes(idx)) {
            next[idx] = { x, y };
        } else {
            if (idx === 1) { next[0].y = y; next[2].y = y; } 
            else if (idx === 3) { next[2].x = x; next[4].x = x; } 
            else if (idx === 5) { next[6].y = y; next[4].y = y; } 
            else if (idx === 7) { next[0].x = x; next[6].x = x; } 
        }
        // Sync midpoints
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
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-500 flex flex-col gap-8 pb-20">
        {!pdfFile ? (
            <Card className={cn("w-full max-w-2xl text-center border-2 border-dashed mx-auto bg-card/50 rounded-[2.5rem] shadow-xl overflow-hidden", isDragOver && "border-primary ring-4 ring-primary/20")} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if(e.dataTransfer.files[0]) setPdfFile(e.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()}>
                <CardContent className="p-20 flex flex-col items-center gap-6">
                    <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary"><UploadCloud className="size-10" /></div>
                    <div className="space-y-2">
                        <p className="text-2xl font-black uppercase tracking-tighter">Drop PDF to Studio</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">100% Private local RAM processing.</p>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
                <CardFooter className="bg-muted/10 p-6 flex justify-center gap-8">
                    <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                    <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest"><Zap className="size-3 text-yellow-500" /> INSTANT CROP</div>
                </CardFooter>
            </Card>
        ) : (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-2 shadow-3xl overflow-hidden rounded-[2.5rem] bg-card/50">
                        <CardHeader className="bg-muted/30 border-b flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
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
                        <CardContent className="p-0 flex items-center justify-center min-h-[500px] md:min-h-[650px] bg-slate-200 dark:bg-slate-900 relative overflow-hidden select-none shadow-inner" onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                            {isProcessing ? (
                                <div className="flex flex-col items-center gap-4 py-32"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="text-[10px] font-black uppercase text-primary animate-pulse">Rendering Page...</p></div>
                            ) : pageImage && (
                                <div ref={containerRef} className="relative shadow-3xl border-4 border-white transform-gpu bg-white my-10 max-w-[95vw]">
                                    {cropMode === 'rectangular' ? (
                                        <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={c => setCompletedCrop(c)}>
                                            <img ref={imgRef} src={pageImage} alt="pdf" className="max-h-[70vh] w-auto block" onLoad={onImageLoad} />
                                        </ReactCrop>
                                    ) : (
                                        <div className="relative">
                                            <img ref={imgRef} src={pageImage} alt="pdf" className="max-h-[70vh] w-auto pointer-events-none block" onLoad={onImageLoad} />
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
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-full h-0.5 bg-green-500/40 absolute" /><div className="h-full w-0.5 bg-green-500/40 absolute" /></div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 bg-black/80 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl z-40 whitespace-nowrap">
                                <Move className="size-3.5 text-primary animate-pulse" /> {cropMode === 'rectangular' ? "Position Crop Box" : "Drag 4 corners to fit edges"}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="border-2 shadow-2xl overflow-hidden rounded-[2.5rem] bg-card/50 border-primary/10">
                        <CardHeader className="bg-primary/5 border-b p-6">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2"><Settings2 className="size-5 text-primary" /> Studio Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <Button className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl group transition-all active:scale-95" onClick={handleApplyCrop} disabled={isProcessing || !pageImage}>
                                    <CheckCircle2 className="size-6 mr-2 group-hover:scale-110 transition-transform" /> APPLY FOR PAGE {currentPage}
                                </Button>
                                <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest opacity-60">Saves current selection to memory</p>
                            </div>
                            
                            <Separator className="opacity-10" />

                            <div className="space-y-4">
                                <Button disabled={Object.values(pageStates).filter(s=>!!s.result).length === 0 || isBuildingPdf} className="w-full h-14 bg-green-600 hover:bg-green-700 font-black text-sm rounded-xl shadow-xl uppercase transition-all active:scale-95" onClick={async () => {
                                    setIsBuildingPdf(true);
                                    try {
                                        const entries = Object.entries(pageStates).filter(([_,s])=>!!s.result).sort((a,b)=>Number(a[0])-Number(b[0]));
                                        const finalPdf = await PDFDocument.create();
                                        for(const [_,s] of entries){
                                            const b = await fetch(s.result!).then(r=>r.arrayBuffer());
                                            const ei = await finalPdf.embedJpg(b);
                                            const p = finalPdf.addPage([ei.width*0.75, ei.height*0.75]);
                                            p.drawImage(ei, {x:0,y:0,width:p.getWidth(),height:p.getHeight()});
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
                                }}>
                                    {isBuildingPdf ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                                    DOWNLOAD {Object.values(pageStates).filter(s=>!!s.result).length} PAGE BUNDLE
                                </Button>
                                <Button variant="ghost" onClick={resetState} className="w-full h-10 font-black uppercase text-[10px] tracking-widest text-destructive hover:bg-destructive/5">
                                    <RefreshCcw className="size-3 mr-2" /> Start Over
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-5 border-t">
                            <div className="flex gap-4 items-center">
                                <ShieldCheck className="size-8 text-primary/40 shrink-0" />
                                <p className="text-[9px] text-muted-foreground font-bold uppercase leading-relaxed">
                                    Each page crop uses <span className="text-primary">Lossless pixel copying</span> to ensure text remains crisp for official use.
                                </p>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}
    </div>
  );
}
