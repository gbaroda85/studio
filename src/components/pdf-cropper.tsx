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
    UploadCloud, 
    Download, 
    Loader2, 
    ChevronLeft, 
    ChevronRight, 
    Scissors, 
    Scan, 
    Maximize, 
    RefreshCcw, 
    X, 
    Move,
    CheckCircle2,
    Grid3X3,
    ShieldCheck,
    Zap,
    FileText,
    RotateCw,
    Eye,
    FileDigit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from './ui/scroll-area';

// Bundle-safe worker URL
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

type CropMode = 'rectangular' | 'perspective';

interface Point {
    x: number;
    y: number;
}

interface PageState {
    mode: CropMode;
    crop?: CropType;
    completedCrop?: PixelCrop;
    points: Point[];
    result: string | null; // DataURL of the cropped page
}

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
  
  // Persistent State for all pages
  const [pageStates, setPageStates] = useState<Record<number, PageState>>({});
  
  // Current working states
  const [cropMode, setCropMode] = useState<CropMode>('rectangular');
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [points, setPoints] = useState<Point[]>([
      { x: 15, y: 15 }, { x: 85, y: 15 },
      { x: 85, y: 85 }, { x: 15, y: 85 }
  ]);

  // Magnifier States
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync working state when currentPage changes
  useEffect(() => {
    if (pageStates[currentPage]) {
        const s = pageStates[currentPage];
        setCropMode(s.mode);
        setCrop(s.crop);
        setCompletedCrop(s.completedCrop);
        setPoints(s.points);
    } else {
        setCropMode('rectangular');
        setCrop(undefined);
        setCompletedCrop(undefined);
        setPoints([
            { x: 15, y: 15 }, { x: 85, y: 15 },
            { x: 85, y: 85 }, { x: 15, y: 85 }
        ]);
    }
  }, [currentPage, pageStates]);

  function handleReset() {
    setPdfFile(null);
    setNumPages(0);
    setPageImage(null);
    setPageStates({});
    pdfDocRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const renderPage = async (pdf: pdfjs.PDFDocumentProxy, pageNum: number) => {
      setIsProcessing(true);
      try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.5 }); 
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d', { willReadFrequently: true });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            setPageImage(canvas.toDataURL('image/png'));
          }
      } catch (e) {
        toast({variant: 'destructive', title: 'Error', description: 'Could not render PDF page.'});
        setPageImage(null);
      } finally {
        setIsProcessing(false);
      }
  };

  const handleFileChange = async (file: File | null) => {
    if (file && file.type === 'application/pdf') {
      handleReset();
      setPdfFile(file);
      setIsProcessing(true);
      try {
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
            const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
            pdfDocRef.current = pdf;
            setNumPages(pdf.numPages);
            setCurrentPage(1);
            await renderPage(pdf, 1);
        };
        fileReader.readAsArrayBuffer(file);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not process the PDF file.' });
        handleReset();
      } finally {
        setIsProcessing(false);
      }
    } else if (file) {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a PDF file.' });
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };
  
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    if (!pageStates[currentPage]?.crop) {
        setCrop(centerCrop({ unit: '%', width: 90, height: 90 }, width, height));
    }
  }

  const handlePageChange = (newPage: number) => {
      if (newPage > 0 && newPage <= numPages && pdfDocRef.current) {
          saveCurrentPageState();
          setCurrentPage(newPage);
          renderPage(pdfDocRef.current, newPage);
      }
  }

  const saveCurrentPageState = (processedImage: string | null = null) => {
      setPageStates(prev => ({
          ...prev,
          [currentPage]: {
              mode: cropMode,
              crop,
              completedCrop,
              points,
              result: processedImage || prev[currentPage]?.result || null
          }
      }));
  }

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
    if (!image || !pdfFile) return;

    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let processedImage = "";

    if (cropMode === 'perspective') {
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
            processedImage = canvas.toDataURL('image/jpeg', 0.95);
        }
    } else {
        if (!completedCrop) return;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
        ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
        processedImage = canvas.toDataURL('image/jpeg', 0.95);
    }

    if (processedImage) {
        saveCurrentPageState(processedImage);
        toast({ title: `Page ${currentPage} Cropped`, description: "Stored in memory stack." });
    }
    setIsProcessing(false);
  };

  const handleDownloadFullPdf = async () => {
    const croppedEntries = Object.entries(pageStates).filter(([_, s]) => !!s.result);
    if (croppedEntries.length === 0) {
        toast({ variant: 'destructive', title: 'Nothing Cropped', description: 'Please apply crop to at least one page first.' });
        return;
    }

    setIsBuildingPdf(true);
    try {
        const finalPdf = await PDFDocument.create();
        const sortedPages = croppedEntries.sort((a, b) => Number(a[0]) - Number(b[0]));

        for (const [_, state] of sortedPages) {
            const imgBytes = await fetch(state.result!).then(res => res.arrayBuffer());
            const embeddedImg = await finalPdf.embedJpg(imgBytes);
            // Create a new independent page for each image
            const page = finalPdf.addPage([embeddedImg.width * 0.75, embeddedImg.height * 0.75]);
            page.drawImage(embeddedImg, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
        }

        const bytes = await finalPdf.save();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        link.download = `cropped-bundle-${Date.now()}.pdf`;
        link.click();
        toast({ title: "PDF Bundle Created!", description: "Each cropped image is on a separate page." });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to build PDF bundle.' });
    } finally {
        setIsBuildingPdf(false);
    }
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
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX; 
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX; 
        clientY = (e as React.MouseEvent).clientY;
    }
    
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
      let clientX, clientY;
      if ('touches' in e) {
          clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
      } else {
          clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY;
      }
      updateMagnifier(clientX, clientY);
      setDraggingPoint(idx);
  };

  const croppedCount = Object.values(pageStates).filter(s => !!s.result).length;

  if (!pdfFile) {
    return (
      <Card className={cn("w-full max-w-2xl text-center transition-all duration-300 bg-card/50 hover:border-primary/80 hover:shadow-2xl border-2 border-dashed mx-auto", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        <CardHeader>
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <Scan className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Precision PDF Cropper & Scanner</CardTitle>
          <CardDescription>Trim margins or fix perspective. Batch process multiple pages into one PDF.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
                <p className="text-xl font-bold">Drop PDF document here</p>
                <p className="text-sm text-muted-foreground mt-2">100% Private local processing. Separate pages supported.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6">
            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
            <div className="flex items-center gap-1.5"><Maximize className="size-3 text-primary" /> INDEPENDENT PAGES</div>
            <div className="flex items-center gap-1.5"><Grid3X3 className="size-3 text-yellow-500" /> BATCH BUNDLE</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-500">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-8 space-y-6">
                <Card className="border-2 shadow-2xl overflow-hidden bg-card/50">
                    <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as CropMode)} className="bg-background/50 p-1 rounded-lg border">
                                <TabsList className="h-8">
                                    <TabsTrigger value="rectangular" className="text-[10px] font-black uppercase px-4"><Maximize className="size-3 mr-1.5" /> Rect</TabsTrigger>
                                    <TabsTrigger value="perspective" className="text-[10px] font-black uppercase px-4"><Scan className="size-3 mr-1.5" /> Scanner</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isProcessing}><ChevronLeft className="size-4"/></Button>
                                <span className="text-[10px] font-black uppercase px-3 py-1 bg-primary/10 text-primary rounded-full">Page {currentPage}/{numPages}</span>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= numPages || isProcessing}><ChevronRight className="size-4"/></Button>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleReset}><X /></Button>
                    </CardHeader>
                    <CardContent className="p-0 min-h-[550px] flex items-center justify-center bg-black/5 relative overflow-hidden select-none"
                                 onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                        
                        {isProcessing && (
                            <div className="absolute inset-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-12 w-12 animate-spin text-primary stroke-[3]" />
                                <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Processing Document...</p>
                            </div>
                        )}

                        {pageImage && (
                            <div className="relative p-8 w-full h-full flex flex-col items-center" style={{ touchAction: 'none' }}>
                                {cropMode === 'rectangular' ? (
                                    <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={setCompletedCrop} className="shadow-2xl border-4 border-white max-w-full">
                                        <img ref={imgRef} src={pageImage} alt="page" className="max-h-[70vh] object-contain" onLoad={onImageLoad} />
                                    </ReactCrop>
                                ) : (
                                    <div ref={containerRef} className="relative cursor-crosshair shadow-2xl border-4 border-white transform-gpu">
                                        <img ref={imgRef} src={pageImage} alt="scanner" className="max-h-[70vh] w-auto object-contain pointer-events-none" />
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} className="fill-primary/20 stroke-primary stroke-[0.5]" />
                                        </svg>
                                        {points.map((p, i) => (
                                            <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-xl cursor-grab active:cursor-grabbing z-20 flex items-center justify-center", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/90")}
                                                 style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                                                 onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}>
                                                <div className="size-2.5 bg-white rounded-full shadow-inner" />
                                            </div>
                                        ))}

                                        {draggingPoint !== null && (
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 rounded-full border-4 border-green-500 shadow-2xl bg-white animate-in zoom-in-50 ring-4 ring-white/50">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="absolute size-full flex items-center justify-center pointer-events-none z-10">
                                                        <div className="w-full h-0.5 bg-green-500/50 absolute" />
                                                        <div className="h-full w-0.5 bg-green-500/50 absolute" />
                                                        <div className="size-3 border-2 border-red-500 rounded-full bg-white/50 shadow-sm" />
                                                    </div>
                                                </div>
                                                <img 
                                                    src={pageImage} 
                                                    alt="magnify" 
                                                    className="absolute max-w-none origin-top-left"
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
                                <div className="mt-8 flex justify-center">
                                     <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-black/70 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl">
                                        <Move className="h-4 w-4 text-primary animate-pulse" /> 
                                        {cropMode === 'rectangular' ? "Trim page margins" : "Drag 4 dots to corners"}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {croppedCount > 0 && (
                    <Card className="border-2 border-green-500/20 shadow-xl overflow-hidden bg-card/30">
                        <CardHeader className="bg-green-500/5 border-b py-3 px-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase text-green-700 flex items-center gap-2">
                                <CheckCircle2 className="size-4" /> Ready for Multi-Page Bundle ({croppedCount}/{numPages})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <ScrollArea className="w-full whitespace-nowrap">
                                <div className="flex gap-4 p-1">
                                    {Object.entries(pageStates).filter(([_, s]) => !!s.result).map(([pageNum, state]) => (
                                        <div key={pageNum} className="relative group shrink-0 aspect-[3/4] h-28 rounded-lg overflow-hidden border-2 border-green-500/40 bg-white shadow-lg transform transition-transform hover:scale-105">
                                            <img src={state.result!} alt={`P${pageNum}`} className="w-full h-full object-contain" />
                                            <div className="absolute top-1 left-1 bg-green-600 text-white text-[8px] px-1.5 rounded font-black">Page {pageNum}</div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="lg:col-span-4 space-y-6">
                <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-card dark:bg-slate-950">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter">
                            <Scissors className="size-6 text-primary mr-2 inline" /> Bundle Panel
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="p-5 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 text-center">
                            <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
                                {cropMode === 'rectangular' 
                                    ? "Trim margins for a clean digital doc."
                                    : "Correct perspective for document photos."}
                            </p>
                        </div>

                        <div className="p-5 bg-green-500/5 rounded-2xl border-2 border-green-500/10 flex gap-4">
                            <ShieldCheck className="size-6 text-green-600 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-[10px] text-green-800 font-bold uppercase tracking-tight">Independent Pages Active</p>
                                <p className="text-[9px] text-green-700/80 leading-tight">Every crop results in a separate new page in the output PDF.</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 border-t-2 p-8 flex flex-col gap-4">
                        <Button className="w-full h-18 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all active:scale-95 disabled:opacity-50" 
                                onClick={handleApplyCrop} disabled={isProcessing || !pageImage}>
                            {isProcessing ? <Loader2 className="animate-spin mr-3 size-6"/> : <Scissors className="mr-3 size-7" />}
                            APPLY CROP P{currentPage}
                        </Button>
                        
                        <Button 
                            className="w-full h-16 text-base font-black bg-green-600 hover:bg-green-700 shadow-xl rounded-2xl disabled:opacity-30"
                            onClick={handleDownloadFullPdf}
                            disabled={croppedCount === 0 || isBuildingPdf || isProcessing}
                        >
                            {isBuildingPdf ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="size-5 animate-spin" />
                                    <span className="uppercase text-sm">SEPARATING PAGES...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <FileDigit className="size-6" />
                                    <span className="uppercase">DOWNLOAD BUNDLE ({croppedCount})</span>
                                </div>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                <div className="p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10 flex gap-4 items-center shadow-sm">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Zap className="size-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-primary uppercase tracking-tight">HD 300DPI Render</p>
                        <p className="text-[10px] text-muted-foreground font-medium leading-tight">Output pages are rendered in high density for crystal clear text.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
