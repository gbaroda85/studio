
"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import * as pdfjs from 'pdfjs-dist';
import { 
  UploadCloud, 
  Download, 
  FileDigit, 
  X, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  RefreshCcw, 
  Layout,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  Eye,
  CheckCircle2,
  MousePointer2,
  Layers,
  RotateCw,
  ChevronRight,
  Plus, 
  Monitor,
  ImageIcon,
  Settings2,
  Trash2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs`;
}

type VAlign = 'top' | 'center' | 'bottom';

interface ImageItem {
    id: string;
    file: File;
    src: string;
    vAlign: VAlign;
}

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i}`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

export default function ImageToPdfConverter() {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [renderingProgress, setRenderingProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (convertedPdfUrl) URL.revokeObjectURL(convertedPdfUrl);
    };
  }, [convertedPdfUrl]);

  const clearPreviews = () => {
    if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
        setConvertedPdfUrl(null);
    }
    setPreviewImages([]);
  };

  const handleFilesChange = (files: FileList | null) => {
    clearPreviews();
    const newFilesList = Array.from(files || []).filter(file => file.type.startsWith('image/'));
    
    if (newFilesList.length === 0) return;

    const newItems: ImageItem[] = [];
    let processedCount = 0;

    newFilesList.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const id = Math.random().toString(36).substr(2, 9);
            newItems.push({
                id,
                file,
                src: e.target?.result as string,
                vAlign: 'center'
            });
            processedCount++;
            if (processedCount === newFilesList.length) {
                setImages(prev => {
                    const updated = [...prev, ...newItems];
                    if (!selectedId && updated.length > 0) setSelectedId(updated[0].id);
                    return updated;
                });
            }
        };
        reader.readAsDataURL(file);
    });
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFilesChange(e.target.files);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFilesChange(e.dataTransfer.files); };

  const handleRemoveImage = (id: string) => {
    clearPreviews();
    setImages(prev => {
        const filtered = prev.filter(img => img.id !== id);
        if (selectedId === id) setSelectedId(filtered.length > 0 ? filtered[filtered.length - 1].id : null);
        return filtered;
    });
  };

  const handleReset = () => {
    setImages([]);
    setSelectedId(null);
    clearPreviews();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateSelectedImage = (updates: Partial<Pick<ImageItem, 'vAlign'>>) => {
      if (!selectedId) return;
      setImages(prev => prev.map(img => img.id === selectedId ? { ...img, ...updates } : img));
      clearPreviews();
  };

  const rotateSelectedImage = (deg: number) => {
    if (!selectedId) return;
    const item = images.find(img => img.id === selectedId);
    if (!item) return;

    setIsConverting(true);
    const img = new window.Image();
    img.src = item.src;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setIsConverting(false);
            return;
        }
        
        // Handle target rotation
        if (deg === 90 || deg === 270) {
            canvas.width = img.height;
            canvas.height = img.width;
        } else {
            canvas.width = img.width;
            canvas.height = img.height;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((deg * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        const rotatedSrc = canvas.toDataURL('image/png');
        setImages(prev => prev.map(i => i.id === selectedId ? { ...i, src: rotatedSrc } : i));
        clearPreviews();
        setIsConverting(false);
        toast({ title: `Rotated ${deg}°` });
    };
  };

  const rotateAllImages = async (deg: number) => {
    if (images.length === 0) return;
    setIsConverting(true);
    clearPreviews();

    const rotatedImages = await Promise.all(images.map(async (item) => {
      return new Promise<ImageItem>((resolve) => {
        const img = new window.Image();
        img.src = item.src;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(item);
            return;
          }
          if (deg === 90 || deg === 270) {
              canvas.width = img.height;
              canvas.height = img.width;
          } else {
              canvas.width = img.width;
              canvas.height = img.height;
          }
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((deg * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          const rotatedSrc = canvas.toDataURL('image/png');
          resolve({ ...item, src: rotatedSrc });
        };
        img.onerror = () => resolve(item);
      });
    }));

    setImages(rotatedImages);
    setIsConverting(false);
    toast({ title: "Global Rotation Complete", description: `Applied ${deg}° to all pages.` });
  };

  const applyToAll = () => {
      if (!selectedId) return;
      
      setImages(prev => {
          const selected = prev.find(img => img.id === selectedId);
          if (!selected) return prev;
          const targetAlign = selected.vAlign;
          return prev.map(img => ({ ...img, vAlign: targetAlign }));
      });
      
      clearPreviews();
      toast({ title: "Global Sync Complete", description: "Alignment applied to all pages." });
  };

  const generateVisualPreviews = async (pdfBlob: Blob) => {
    setIsGeneratingPreview(true);
    setRenderingProgress(0);
    try {
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ 
            data: new Uint8Array(arrayBuffer),
            cMapUrl: 'https://unpkg.com/pdfjs-dist@4.2.67/cmaps/',
            cMapPacked: true
        });
        const pdf = await loadingTask.promise;
        const imgs: string[] = [];
        const pagesToRender = Math.min(pdf.numPages, 10); 

        for (let i = 1; i <= pagesToRender; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            if (context) {
                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, canvas.width, canvas.height);
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                imgs.push(canvas.toDataURL('image/jpeg', 0.9));
            }
            setRenderingProgress(Math.round((i / pagesToRender) * 100));
        }
        setPreviewImages(imgs);
    } catch (e) {
        console.error("Preview generation failed", e);
    } finally {
        setIsGeneratingPreview(false);
    }
  };

  const handleConvertToPdf = async () => {
    if (images.length === 0) return;
    setIsConverting(true);
    clearPreviews();

    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();
        
        const pageData = images[i];
        const img = new window.Image();
        img.src = pageData.src;

        await new Promise((resolve) => {
            img.onload = () => {
                const imgProps = pdf.getImageProperties(img);
                
                const scaleFactor = 0.9;
                const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height) * scaleFactor;
                const finalWidth = imgProps.width * ratio;
                const finalHeight = imgProps.height * ratio;
                
                const x = (pageWidth - finalWidth) / 2;
                let y;

                if (pageData.vAlign === 'top') {
                    y = 0; 
                } else if (pageData.vAlign === 'bottom') {
                    y = pageHeight - finalHeight; 
                } else {
                    y = (pageHeight - finalHeight) / 2; 
                }

                pdf.addImage(pageData.src, 'JPEG', x, y, finalWidth, finalHeight, undefined, 'FAST');
                resolve(null);
            };
            img.onerror = () => resolve(null);
        });
    }

    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setConvertedPdfUrl(url);
    await generateVisualPreviews(pdfBlob);
    setIsConverting(false);
    toast({ title: "Bundle Created!", description: "Professional PDF has been generated." });
  };
  
  const handleDownload = () => {
      if (!convertedPdfUrl) return;
      const link = document.createElement('a');
      link.href = convertedPdfUrl;
      link.download = `GR7-Image-Bundle-${Date.now()}.pdf`;
      link.click();
  };

  const selectedImage = images.find(img => img.id === selectedId);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 flex flex-col gap-6">
      <div className="grid lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        <div className="lg:col-span-8 space-y-6">
            <Card className={cn(
                "border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl transition-all duration-300",
                isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-105 shadow-primary/20"
            )} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                <CardHeader className="bg-primary/5 border-b p-5 md:p-7 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-10 md:size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <FileDigit className="size-6 md:size-7" />
                        </div>
                        <div className="text-left">
                            <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tighter leading-none">PDF Workspace</CardTitle>
                            <CardDescription className="text-[9px] font-bold uppercase opacity-50 tracking-widest mt-1">Bundle up to 50 images into one PDF</CardDescription>
                        </div>
                    </div>
                    {images.length > 0 && <Badge className="bg-primary text-white font-black text-[10px] px-3 py-1 rounded-full">{images.length} FILES</Badge>}
                </CardHeader>
                <CardContent className="p-4 md:p-8">
                    {images.length === 0 ? (
                        <div className="border-4 border-dashed border-primary/20 rounded-[2rem] p-12 md:p-24 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-primary/5 transition-all group bg-muted/20" onClick={() => fileInputRef.current?.click()}>
                            <div className="relative">
                                <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                            </div>
                            <div className="text-center px-4">
                                <p className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-200">Drop Images to Stacking Area</p>
                                <p className="text-[10px] md:text-xs text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">100% Private local RAM processing.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar p-1">
                            {images.map((img, index) => (
                            <div 
                                key={img.id} 
                                onClick={() => setSelectedId(img.id)}
                                className={cn(
                                    "relative aspect-[1/1.414] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer transform active:scale-95 bg-white flex flex-col shadow-lg",
                                    selectedId === img.id ? "border-primary ring-4 ring-primary/20 scale-105 z-10 shadow-primary/30" : "border-slate-100 hover:border-primary/40"
                                )}
                            >
                                <div className={cn(
                                    "absolute inset-0 flex flex-col w-full h-full transition-all duration-300",
                                    img.vAlign === 'top' ? 'justify-start' : img.vAlign === 'bottom' ? 'justify-end' : 'justify-center'
                                )}>
                                    <img src={img.src} alt="thumb" className="max-w-[85%] max-h-[85%] object-contain pointer-events-none mx-auto block" />
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <Button size="icon" variant="destructive" className="h-7 w-7 rounded-lg shadow-xl" onClick={(e) => { e.stopPropagation(); handleRemoveImage(img.id); }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute top-2 left-2 z-20">
                                    <div className="bg-primary text-white text-[8px] px-2 py-0.5 rounded-md font-black shadow-lg">P{index + 1}</div>
                                </div>
                            </div>
                            ))}
                            <button className="border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all aspect-[1/1.414] shadow-inner group" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                                <Plus className="h-8 w-8 text-primary/40 group-hover:scale-125 transition-transform" />
                                <span className="text-[9px] font-black uppercase text-primary/60">ADD MORE</span>
                            </button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-muted/10 p-5 md:p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          onClick={handleReset} 
                          className="text-[10px] font-black uppercase text-destructive h-12 px-6 hover:bg-destructive hover:text-white rounded-full border-2 border-destructive/20 transition-all duration-300 shadow-sm"
                        >
                          <RefreshCcw className="mr-2 h-4 w-4" /> Start Over
                        </Button>
                        <div className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">
                            <ShieldCheck className="h-4 w-4 text-green-500" /> SECURE RAM
                        </div>
                    </div>

                    <Button 
                        className="magic-button w-full sm:w-auto h-16 md:h-18 px-10 bg-primary hover:bg-primary/90 border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group flex items-center justify-center gap-4 rounded-full" 
                        disabled={images.length === 0 || isConverting}
                        onClick={handleConvertToPdf}
                    >
                        <StarIcons />
                        {isConverting ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="size-6 md:size-7 animate-spin" />
                                <span className="uppercase font-black text-sm md:text-base tracking-tighter">BUNDLING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full gap-3">
                                <FileDigit className="size-6 md:size-7" />
                                <span className="uppercase font-black text-sm md:text-base tracking-tighter">GENERATE PDF</span>
                            </div>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <AnimatePresence>
                {convertedPdfUrl && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                        <Card className="border-2 border-green-500/20 shadow-3xl overflow-hidden bg-card/50 rounded-[2.5rem] relative">
                            <CardHeader className="bg-green-500/5 py-4 border-b border-green-500/20 flex flex-row items-center justify-center gap-3">
                                <Eye className="size-4 text-green-600" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-green-800">Visual Render Confirmation</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 bg-slate-200 dark:bg-slate-900/50">
                                <ScrollArea className="h-[450px] w-full p-8 md:p-12">
                                    <div className="flex flex-col items-center gap-10 pb-10">
                                        {isGeneratingPreview ? (
                                            <div className="flex flex-col items-center gap-6 py-20 text-center">
                                                <div className="relative">
                                                    <Loader2 className="size-20 text-primary opacity-20 animate-spin stroke-[3]" />
                                                    <Monitor className="absolute inset-0 m-auto size-8 text-primary/40 animate-pulse" />
                                                </div>
                                                <div className="space-y-3 w-full max-w-[200px]">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Rendering Combined View...</p>
                                                    <Progress value={renderingProgress} className="h-1" />
                                                </div>
                                            </div>
                                        ) : (
                                            previewImages.map((img, i) => (
                                                <div key={i} className="shadow-3xl border-[8px] border-white rounded-sm overflow-hidden bg-white max-w-[400px] animate-in slide-in-from-bottom-4 duration-500">
                                                    <img src={img} alt="p" className="w-full h-auto block" />
                                                    <div className="bg-muted text-[8px] font-black py-2 text-center uppercase tracking-widest text-muted-foreground border-t">A4 Optimized Page {i+1}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="bg-green-500/10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-green-500/20">
                                <div className="flex items-center gap-6">
                                    <div className="size-16 md:size-20 rounded-3xl bg-green-500 text-white flex items-center justify-center shadow-2xl shrink-0 relative overflow-hidden">
                                        <CheckCircle2 className="size-10 md:size-12 z-10" />
                                        <Sparkles className="absolute -top-1 -right-1 text-yellow-300 size-8 opacity-40" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xl font-black text-green-900 uppercase tracking-tighter leading-none">Ready!</p>
                                        <p className="text-[10px] md:text-xs text-green-700 font-bold mt-2 uppercase tracking-widest opacity-60">Bundle sanitized and complete</p>
                                    </div>
                                </div>
                                <Button 
                                    size="lg" 
                                    className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-16 w-full md:w-auto shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none" 
                                    onClick={handleDownload} 
                                >
                                    <div className="absolute left-6 w-0.5 h-10 bg-white/40 rounded-full" />
                                    <span className="flex-1 px-12 text-center tracking-widest text-sm md:text-lg uppercase">SAVE PDF BUNDLE</span>
                                    <div className="bg-white h-full px-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:px-10" style={{ clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-20px' }}>
                                        <Download className="size-8 group-hover:scale-110 transition-transform" />
                                    </div>
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Sidebar: Settings Panel */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all hover:border-primary/30">
                <CardHeader className="bg-primary/5 border-b p-6 md:p-8 text-left">
                    <CardTitle className="text-xl md:text-2xl flex items-center gap-3 font-black uppercase tracking-tighter">
                        <Settings2 className="size-6 text-primary" /> STUDIO CONTROL
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-10">
                    {!selectedId ? (
                        <div className="py-20 text-center space-y-4 opacity-30 flex flex-col items-center">
                             <MousePointer2 className="size-16 text-muted-foreground animate-bounce" />
                             <p className="text-xs font-black uppercase tracking-[0.2em] max-w-[200px]">Select a page to<br/>unlock strict alignment</p>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2 mb-3 text-left">
                                    <AlignVerticalJustifyCenter className="size-3" /> Position Logic
                                </Label>
                                <div className="grid grid-cols-1 gap-2">
                                    <button 
                                        className={cn(
                                            "btn-pos-uiverse h-14 relative group !ring-[3px] !ring-slate-950 dark:!ring-white",
                                            selectedImage?.vAlign === 'top' && "active-uiverse"
                                        )} 
                                        data-label="      Top"
                                        onClick={() => updateSelectedImage({ vAlign: 'top' })}
                                    >
                                        <AlignVerticalJustifyStart className="absolute left-4 top-1/2 -translate-y-1/2 size-5 z-30 text-slate-900 group-hover:text-white transition-colors" />
                                    </button>
                                    <button 
                                        className={cn(
                                            "btn-pos-uiverse h-14 relative group !ring-[3px] !ring-slate-950 dark:!ring-white",
                                            selectedImage?.vAlign === 'center' && "active-uiverse"
                                        )} 
                                        data-label="      Center"
                                        onClick={() => updateSelectedImage({ vAlign: 'center' })}
                                    >
                                        <AlignVerticalJustifyCenter className="absolute left-4 top-1/2 -translate-y-1/2 size-5 z-30 text-slate-900 group-hover:text-white transition-colors" />
                                    </button>
                                    <button 
                                        className={cn(
                                            "btn-pos-uiverse h-14 relative group !ring-[3px] !ring-slate-950 dark:!ring-white",
                                            selectedImage?.vAlign === 'bottom' && "active-uiverse"
                                        )} 
                                        data-label="      Bottom"
                                        onClick={() => updateSelectedImage({ vAlign: 'bottom' })}
                                    >
                                        <AlignVerticalJustifyEnd className="absolute left-4 top-1/2 -translate-y-1/2 size-5 z-30 text-slate-900 group-hover:text-white transition-colors" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t-2 border-dashed border-primary/10 text-left">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2 mb-3">
                                    <RotateCw className="size-3" /> Orientation Control
                                </Label>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[8px] font-black text-muted-foreground uppercase opacity-60">Selected Page</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button variant="outline" className="h-10 text-[9px] font-black" onClick={() => rotateSelectedImage(90)}>90°</Button>
                                            <Button variant="outline" className="h-10 text-[9px] font-black" onClick={() => rotateSelectedImage(180)}>180°</Button>
                                            <Button variant="outline" className="h-10 text-[9px] font-black" onClick={() => rotateSelectedImage(270)}>270°</Button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 pt-2 border-t border-dashed border-primary/5">
                                        <p className="text-[8px] font-black text-muted-foreground uppercase opacity-60">Batch (All Pages)</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button variant="outline" className="h-10 text-[9px] font-black text-primary border-primary/20" onClick={() => rotateAllImages(90)}>90° ALL</Button>
                                            <Button variant="outline" className="h-10 text-[9px] font-black text-primary border-primary/20" onClick={() => rotateAllImages(180)}>180° ALL</Button>
                                            <Button variant="outline" className="h-10 text-[9px] font-black text-primary border-primary/20" onClick={() => rotateAllImages(270)}>270° ALL</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button 
                              variant="outline" 
                              className="w-full h-11 border-2 font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5 rounded-2xl transition-all shadow-sm" 
                              onClick={applyToAll}
                            >
                                <Layers className="size-4 mr-2" /> Global Sync Alignment
                            </Button>
                        </motion.div>
                    )}

                    <div className="p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10 flex gap-5 shadow-inner">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                             <Zap className="size-6 text-yellow-500 animate-pulse" />
                        </div>
                        <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase text-left">
                            <span className="font-black block mb-1 text-primary">STRICT CLAMPING:</span>
                            "Top" logic pushes the image to the absolute first pixel of the page. Zero padding active.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} />
    </div>
  );
}
