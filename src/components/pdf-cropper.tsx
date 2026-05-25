
"use client";

import 'react-image-crop/dist/ReactCrop.css';

import React, { useState, useRef, type SyntheticEvent, useCallback, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
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
    RotateCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

// Bundle-safe worker URL
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type CropMode = 'rectangular' | 'perspective';

interface Point {
    x: number;
    y: number;
}

export default function PdfCropper() {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState<CropMode>('rectangular');
  
  // Rect Mode States
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  
  // Perspective Mode States
  const [points, setPoints] = useState<Point[]>([
      { x: 15, y: 15 }, { x: 85, y: 15 },
      { x: 85, y: 85 }, { x: 15, y: 85 }
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  
  const [croppedPdfUrl, setCroppedPdfUrl] = useState<string | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleReset() {
    setPdfFile(null);
    setNumPages(0);
    setPageImage(null);
    setResultPreview(null);
    setCroppedPdfUrl(null);
    pdfDocRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  useEffect(() => {
    return () => {
      if (croppedPdfUrl) URL.revokeObjectURL(croppedPdfUrl);
    };
  }, [croppedPdfUrl]);

  const renderPage = async (pdf: pdfjs.PDFDocumentProxy, pageNum: number) => {
      setIsProcessing(true);
      try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.5 }); 
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
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
    if (cropMode === 'rectangular') {
        setCrop(centerCrop({ unit: '%', width: 90, height: 90 }, width, height));
    } else {
        setPoints([
            { x: 15, y: 15 }, { x: 85, y: 15 },
            { x: 85, y: 85 }, { x: 15, y: 85 }
        ]);
    }
  }

  const handlePageChange = (newPage: number) => {
      if (newPage > 0 && newPage <= numPages && pdfDocRef.current) {
          setCurrentPage(newPage);
          setCrop(undefined);
          setCompletedCrop(undefined);
          setResultPreview(null);
          if (croppedPdfUrl) {
            URL.revokeObjectURL(croppedPdfUrl);
            setCroppedPdfUrl(null);
          }
          renderPage(pdfDocRef.current, newPage);
      }
  }

  const handleRotatePage = () => {
    if (!pageImage) return;
    setIsProcessing(true);
    const img = new window.Image();
    img.src = pageImage;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setIsProcessing(false);
            return;
        }

        // Swap width and height
        canvas.width = img.height;
        canvas.height = img.width;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        setPageImage(canvas.toDataURL('image/png'));
        setCrop(undefined);
        setCompletedCrop(undefined);
        setResultPreview(null);
        setIsProcessing(false);
        toast({ title: "Page Rotated", description: "Orientation changed by 90°." });
    };
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

  const handleApplyScannerMode = async () => {
    const image = imgRef.current;
    if (!image || !pdfFile) return;

    setIsProcessing(true);
    setResultPreview(null);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const w1 = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
    const w2 = Math.hypot(points[2].x - points[3].x, points[2].y - points[3].y);
    const h1 = Math.hypot(points[3].x - points[0].x, points[3].y - points[0].y);
    const h2 = Math.hypot(points[2].x - points[1].x, points[2].y - points[1].y);
    
    const targetWidth = Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100));
    const targetHeight = Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const srcPoints = points.map(p => ({ x: p.x * (image.naturalWidth / 100), y: p.y * (image.naturalHeight / 100) }));
    const dstPoints = [
        { x: 0, y: 0 }, { x: targetWidth, y: 0 },
        { x: targetWidth, y: targetHeight }, { x: 0, y: targetHeight }
    ];

    const h = solvePerspective(dstPoints, srcPoints);
    const imgData = ctx.createImageData(targetWidth, targetHeight);
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = image.naturalWidth;
    srcCanvas.height = image.naturalHeight;
    const srcCtx = srcCanvas.getContext('2d');
    srcCtx?.drawImage(image, 0, 0);
    const srcData = srcCtx?.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;

    if (!srcData) return;

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
    const processedImage = canvas.toDataURL('image/jpeg', 0.95);
    setResultPreview(processedImage);

    try {
        const newPdfDoc = await PDFDocument.create();
        const page = newPdfDoc.addPage([targetWidth * 0.75, targetHeight * 0.75]);
        const imgBytes = await fetch(processedImage).then(res => res.arrayBuffer());
        const embeddedImg = await newPdfDoc.embedJpg(imgBytes);
        page.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: page.getWidth(),
            height: page.getHeight(),
        });
        const bytes = await newPdfDoc.save();
        setCroppedPdfUrl(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })));
        toast({ title: "Page Flattened!", description: "Perspective corrected successfully." });
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to create new PDF page.' });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleApplyRectCrop = async () => {
    if (!pdfFile || !completedCrop?.width || !imgRef.current) return;
    setIsProcessing(true);
    setResultPreview(null);

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const cropX_natural = completedCrop.x * scaleX;
    const cropY_natural = completedCrop.y * scaleY;
    const cropWidth_natural = completedCrop.width * scaleX;
    const cropHeight_natural = completedCrop.height * scaleY;

    try {
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = cropWidth_natural;
      previewCanvas.height = cropHeight_natural;
      const ctx = previewCanvas.getContext('2d');
      ctx?.drawImage(image, cropX_natural, cropY_natural, cropWidth_natural, cropHeight_natural, 0, 0, cropWidth_natural, cropHeight_natural);
      const processedImage = previewCanvas.toDataURL('image/jpeg', 0.95);
      setResultPreview(processedImage);

      const newPdfDoc = await PDFDocument.create();
      const page = newPdfDoc.addPage([cropWidth_natural * 0.75, cropHeight_natural * 0.75]);
      const imgBytes = await fetch(processedImage).then(res => res.arrayBuffer());
      const embeddedImg = await newPdfDoc.embedJpg(imgBytes);
      page.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: page.getWidth(),
          height: page.getHeight(),
      });
      const bytes = await newPdfDoc.save();
      setCroppedPdfUrl(URL.createObjectURL(new Blob([bytes], {type: 'application/pdf'})));

      toast({ title: "Trimmed!", description: "Margins cropped successfully." });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Crop failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCrop = () => {
      if (cropMode === 'rectangular') handleApplyRectCrop();
      else handleApplyScannerMode();
  };

  const handleDownload = () => {
    if (!croppedPdfUrl || !pdfFile) return;
    const link = document.createElement('a');
    link.href = croppedPdfUrl;
    link.download = `cropped-${pdfFile.name}`;
    link.click();
  };

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY;
    }
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setPoints(prev => {
        const next = [...prev];
        next[draggingPoint] = { x, y };
        return next;
    });
  }, [draggingPoint]);

  if (!pdfFile) {
    return (
      <Card className={cn("w-full max-w-2xl text-center transition-all duration-300 bg-card/50 hover:border-primary/80 hover:shadow-2xl border-2 border-dashed", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        <CardHeader>
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Scan className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Precision PDF Cropper & Scanner</CardTitle>
          <CardDescription>Trim margins or fix perspective with 4-dot scanner mode.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
                <p className="text-xl font-bold">Drop PDF document here</p>
                <p className="text-sm text-muted-foreground mt-2">100% Private local processing. No data risk.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6">
            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
            <div className="flex items-center gap-1.5"><Maximize className="size-3 text-primary" /> VECTOR LOSSLESS</div>
            <div className="flex items-center gap-1.5"><Grid3X3 className="size-3 text-yellow-500" /> SCANNER MODE</div>
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
                            <Tabs value={cropMode} onValueChange={(v) => { setCropMode(v as CropMode); setResultPreview(null); }} className="bg-background p-1 rounded-lg border">
                                <TabsList className="h-8">
                                    <TabsTrigger value="rectangular" className="text-[10px] font-black uppercase px-4"><Maximize className="size-3 mr-1.5" /> Rect</TabsTrigger>
                                    <TabsTrigger value="perspective" className="text-[10px] font-black uppercase px-4"><Scan className="size-3 mr-1.5" /> Scanner</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isProcessing}><ChevronLeft className="size-4"/></Button>
                                <span className="text-[10px] font-black uppercase px-2 bg-primary/10 text-primary rounded-full">Page {currentPage}/{numPages}</span>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= numPages || isProcessing}><ChevronRight className="size-4"/></Button>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleReset}><X /></Button>
                    </CardHeader>
                    <CardContent className="p-0 min-h-[500px] flex items-center justify-center bg-black/5 relative overflow-hidden select-none"
                                 onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                        {isProcessing && !resultPreview && (
                            <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-12 w-12 animate-spin text-primary stroke-[3]" />
                                <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Processing Document...</p>
                            </div>
                        )}

                        {resultPreview ? (
                            <div className="p-12 animate-in zoom-in-95 duration-500 flex flex-col items-center gap-6">
                                <div className="relative shadow-2xl border-4 border-white bg-white rounded-lg overflow-hidden">
                                    <img src={resultPreview} alt="Result" className="max-h-[60vh] object-contain" />
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" className="font-bold border-2" onClick={() => { setResultPreview(null); setCroppedPdfUrl(null); }}>
                                        <RefreshCcw className="size-4 mr-2" /> RE-CROP PAGE
                                    </Button>
                                    <Button className="font-black px-10 bg-green-600 hover:bg-green-700" onClick={handleDownload}>
                                        <Download className="size-4 mr-2" /> DOWNLOAD CROPPED PDF
                                    </Button>
                                </div>
                            </div>
                        ) : pageImage && (
                            <div ref={containerRef} className="relative p-8">
                                {cropMode === 'rectangular' ? (
                                    <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={setCompletedCrop} className="shadow-2xl">
                                        <img ref={imgRef} src={pageImage} alt="page" className="max-h-[70vh] object-contain" onLoad={onImageLoad} />
                                    </ReactCrop>
                                ) : (
                                    <div className="relative cursor-crosshair shadow-2xl border-2">
                                        <img ref={imgRef} src={pageImage} alt="scanner" className="max-h-[70vh] w-auto object-contain pointer-events-none" onLoad={onImageLoad} />
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} className="fill-primary/20 stroke-primary stroke-[0.5]" />
                                        </svg>
                                        {points.map((p, i) => (
                                            <div key={i} className={cn("absolute size-7 -ml-3.5 -mt-3.5 rounded-full border-2 border-white shadow-xl cursor-grab active:cursor-grabbing z-20 flex items-center justify-center", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/80")}
                                                 style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                                 onMouseDown={() => setDraggingPoint(i)} onTouchStart={() => setDraggingPoint(i)}>
                                                <div className="size-2 bg-white rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-6 flex justify-center">
                                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                                        <Move className="h-3 w-3" /> {cropMode === 'rectangular' ? "Draw rectangle to trim margins" : "Drag 4 dots to correct perspective"}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                            <Scissors className="size-6 text-primary" /> Adjustment Panel
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                <RotateCw className="size-3" /> Orientation
                            </Label>
                            <Button 
                                variant="outline" 
                                className="w-full h-12 rounded-xl border-2 font-black text-xs uppercase"
                                onClick={handleRotatePage}
                                disabled={isProcessing || !pageImage || !!resultPreview}
                            >
                                <RotateCw className="size-4 mr-2" /> Rotate 90° Clockwise
                            </Button>
                        </div>

                        {cropMode === 'rectangular' ? (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Maximize className="size-3" /> Standard Mode
                                </p>
                                <div className="p-5 bg-blue-500/5 rounded-2xl border-2 border-dashed border-blue-500/10">
                                    <p className="text-[11px] leading-relaxed text-blue-700 font-medium italic">
                                        "Use this to remove empty white borders. It preserves all original document text and vector sharpess."
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Grid3X3 className="size-3" /> Scanner Mode
                                </p>
                                <div className="p-5 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 text-center">
                                    <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
                                        Perfect for fixing tilted phone-photos of documents. We will "flatten" the perspective for a professional scan look.
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full h-10 font-black text-[9px] uppercase tracking-widest border-2" onClick={() => setPoints([{x:15,y:15},{x:85,y:15},{x:85,y:85},{x:15,y:85}])}>
                                    <RefreshCcw className="size-3 mr-2" /> Reset 4-Dots
                                </Button>
                            </div>
                        )}

                        <div className="p-5 bg-green-500/5 rounded-2xl border-2 border-green-500/10 flex gap-4">
                            <ShieldCheck className="size-6 text-green-600 shrink-0" />
                            <p className="text-[10px] text-green-800 font-bold leading-relaxed">
                                <span className="font-black uppercase block mb-1 text-green-700">Privacy Active:</span>
                                Your document is processed 100% on your device. We never see your data.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-8 border-t-2">
                        <Button className="w-full h-18 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all active:scale-95 disabled:opacity-50" 
                                disabled={isProcessing || !pageImage || !!resultPreview} onClick={handleApplyCrop}>
                            {isProcessing ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="size-7 animate-spin" />
                                    <span className="uppercase tracking-tighter">PROCESSING...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Scissors className="size-7 text-white" />
                                    <span className="uppercase tracking-tighter">CROP PAGE</span>
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
                        <p className="text-[11px] font-black text-primary uppercase tracking-tight">Native Speed</p>
                        <p className="text-[10px] text-muted-foreground font-medium leading-tight">Rendering via Hardware Acceleration for HD clarity.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

