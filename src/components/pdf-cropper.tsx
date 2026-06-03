
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

  useEffect(() => {
    if (pageStates[currentPage]) {
        const s = pageStates[currentPage];
        setCropMode(s.mode); setCrop(s.crop); setCompletedCrop(s.completedCrop); setPoints(s.points);
    } else {
        setCropMode('rectangular'); setCrop(undefined); setCompletedCrop(undefined);
        setPoints([{ x: 15, y: 15 }, { x: 50, y: 15 }, { x: 85, y: 15 }, { x: 85, y: 50 }, { x: 85, y: 85 }, { x: 50, y: 85 }, { x: 15, y: 85 }, { x: 15, y: 50 }]);
    }
  }, [currentPage, pageStates]);

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
        const srcPoints = [points[0], points[2], points[4], points[6]].map(p => ({ x: p.x * (image.naturalWidth / 100), y: p.y * (image.naturalHeight / 100) }));
        const dstPoints = [{ x: 0, y: 0 }, { x: targetWidth, y: 0 }, { x: targetWidth, y: targetHeight }, { x: 0, y: targetHeight }];
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
                        const dstIdx = (y * targetWidth + x) * 4; const srcIdx = (sy * image.naturalWidth + sx) * 4;
                        imgData.data[dstIdx] = srcPixels[srcIdx]; imgData.data[dstIdx+1] = srcPixels[srcIdx+1]; imgData.data[dstIdx+2] = srcPixels[srcIdx+2]; imgData.data[dstIdx+3] = srcPixels[srcIdx+3];
                    }
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }
        processedImage = canvas.toDataURL('image/jpeg', 0.95);
    } else {
        if (!completedCrop) return;
        const scaleX = image.naturalWidth / image.width; const scaleY = image.naturalHeight / image.height;
        canvas.width = Math.max(10, completedCrop.width * scaleX); canvas.height = Math.max(10, completedCrop.height * scaleY);
        ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
        processedImage = canvas.toDataURL('image/jpeg', 0.95);
    }
    setPageStates(prev => ({ ...prev, [currentPage]: { mode: cropMode, crop, completedCrop, points, result: processedImage } }));
    setIsProcessing(false);
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
        if ([0, 2, 4, 6].includes(draggingPoint)) next[draggingPoint] = { x, y };
        else {
            if (draggingPoint === 1) { next[0].y = y; next[2].y = y; } 
            else if (draggingPoint === 3) { next[2].x = x; next[4].x = x; } 
            else if (draggingPoint === 5) { next[6].y = y; next[4].y = y; } 
            else if (draggingPoint === 7) { next[0].x = x; next[6].x = x; } 
        }
        next[1] = { x: (next[0].x + next[2].x) / 2, y: (next[0].y + next[2].y) / 2 };
        next[3] = { x: (next[2].x + next[4].x) / 2, y: (next[2].y + next[4].y) / 2 };
        next[5] = { x: (next[4].x + next[6].x) / 2, y: (next[4].y + next[6].y) / 2 };
        next[7] = { x: (next[6].x + next[0].x) / 2, y: (next[6].y + next[0].y) / 2 };
        return next;
    });
  }, [draggingPoint, points]);

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-500 flex flex-col gap-8">
        {!pdfFile ? (
            <Card className={cn("w-full max-w-2xl text-center border-2 border-dashed mx-auto", isDragOver && "border-primary ring-4 ring-primary/20")} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if(e.dataTransfer.files[0]) setPdfFile(e.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()}>
                <CardContent className="p-20"><UploadCloud className="size-20 mx-auto text-muted-foreground mb-6" /><p className="text-2xl font-black uppercase">Drop PDF to Studio</p><input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={(e) => e.target.files?.[0] && setPdfFile(e.target.files[0])} /></CardContent>
            </Card>
        ) : (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-2 shadow-3xl overflow-hidden rounded-[2.5rem] bg-card/50">
                        <CardHeader className="bg-muted/30 border-b flex items-center justify-between p-6">
                            <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as CropMode)} className="bg-background/50 p-1 rounded-lg border"><TabsList className="h-9"><TabsTrigger value="rectangular" className="text-[10px] font-black uppercase px-4">RECT</TabsTrigger><TabsTrigger value="perspective" className="text-[10px] font-black uppercase px-4">SCAN</TabsTrigger></TabsList></Tabs>
                            <div className="flex items-center gap-2"><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p-1))}><ChevronLeft /></Button><Badge className="bg-primary/10 text-primary font-black uppercase px-3 py-1">P{currentPage}/{numPages || '?'}</Badge><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(numPages, p+1))}><ChevronRight /></Button></div>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-center min-h-[500px] bg-black/5 relative overflow-hidden select-none" onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                            {pageImage && (
                                <div ref={containerRef} className="relative shadow-2xl border-4 border-white transform-gpu bg-white">
                                    {cropMode === 'rectangular' ? (
                                        <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={c => setCompletedCrop(c)}><img ref={imgRef} src={pageImage} alt="pdf" className="max-h-[70vh] w-auto" onLoad={onImageLoad} /></ReactCrop>
                                    ) : (
                                        <div className="relative">
                                            <img ref={imgRef} src={pageImage} alt="pdf" className="max-h-[70vh] w-auto pointer-events-none" onLoad={onImageLoad} />
                                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points={`${points[0].x},${points[0].y} ${points[2].x},${points[2].y} ${points[4].x},${points[4].y} ${points[6].x},${points[6].y}`} className="fill-primary/20 stroke-primary stroke-[0.5]" /></svg>
                                            {points.map((p, i) => (
                                                <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-xl cursor-grab", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/90")}
                                                    style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }} onMouseDown={(e) => { setDraggingPoint(i); const r=containerRef.current?.getBoundingClientRect(); if(r) { let cx,cy; if('touches' in e){cx=e.touches[0].clientX;cy=e.touches[0].clientY;}else{cx=(e as any).clientX;cy=(e as any).clientY;} setMagnifierPos({x:((cx-r.left)/r.width)*100,y:((cy-r.top)/r.height)*100}); } }} onTouchStart={(e) => { setDraggingPoint(i); const r=containerRef.current?.getBoundingClientRect(); if(r) { let cx,cy; if('touches' in e){cx=e.touches[0].clientX;cy=e.touches[0].clientY;}else{cx=(e as any).clientX;cy=(e as any).clientY;} setMagnifierPos({x:((cx-r.left)/r.width)*100,y:((cy-r.top)/r.height)*100}); } }}><div className="size-2.5 bg-white rounded-full" /></div>
                                            ))}
                                            {draggingPoint !== null && (
                                                <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 rounded-full border-4 border-green-500 shadow-2xl bg-white ring-4 ring-white/50 animate-in zoom-in-50">
                                                    <img src={pageImage} alt="mag" className="absolute max-w-none origin-top-left" style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} /><div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-0.5 bg-green-500/50 absolute" /><div className="h-full w-0.5 bg-green-500/50 absolute" /></div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="border-2 shadow-2xl overflow-hidden rounded-[2.5rem] bg-card/50">
                        <CardHeader className="bg-primary/5 border-b p-6"><CardTitle className="text-xl font-black uppercase">Studio Panel</CardTitle></CardHeader>
                        <CardFooter className="p-6 flex flex-col gap-4">
                            <Button className="w-full h-16 text-lg font-black bg-primary shadow-xl rounded-2xl" onClick={handleApplyCrop} disabled={isProcessing}>APPLY CROP</Button>
                            <Button disabled={Object.values(pageStates).filter(s=>!!s.result).length === 0} className="w-full h-14 bg-green-600 font-black text-sm rounded-xl shadow-xl uppercase" onClick={async () => {
                                const entries = Object.entries(pageStates).filter(([_,s])=>!!s.result).sort((a,b)=>Number(a[0])-Number(b[0]));
                                const finalPdf = await PDFDocument.create();
                                for(const [_,s] of entries){
                                    const b = await fetch(s.result!).then(r=>r.arrayBuffer());
                                    const ei = await finalPdf.embedJpg(b);
                                    const p = finalPdf.addPage([ei.width*0.75, ei.height*0.75]);
                                    p.drawImage(ei, {x:0,y:0,width:p.getWidth(),height:p.getHeight()});
                                }
                                const bytes = await finalPdf.save();
                                const l = document.createElement('a'); l.href = URL.createObjectURL(new Blob([bytes], {type:'application/pdf'})); l.download=`bundle-${Date.now()}.pdf`; l.click();
                            }}>DOWNLOAD BUNDLE</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}
    </div>
  );
}
