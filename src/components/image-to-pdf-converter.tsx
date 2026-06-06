"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect } from "react";
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

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

  const handleFilesChange = (files: FileList | null) => {
    if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
        setConvertedPdfUrl(null);
        setPreviewImages([]);
    }
    const newFilesList = Array.from(files || []).filter(file => file.type.startsWith('image/'));
    
    const newItems: ImageItem[] = [];
    let processedCount = 0;

    if (newFilesList.length === 0) return;

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
        if (selectedId === id) setSelectedId(filtered.length > 0 ? filtered[0].id : null);
        return filtered;
    });
  }
  
  const clearPreviews = () => {
    if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
        setConvertedPdfUrl(null);
    }
    setPreviewImages([]);
  }

  const handleReset = () => {
    setImages([]);
    setSelectedId(null);
    clearPreviews();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const updateSelectedImage = (updates: Partial<Pick<ImageItem, 'vAlign'>>) => {
      if (!selectedId) return;
      setImages(prev => prev.map(img => img.id === selectedId ? { ...img, ...updates } : img));
      clearPreviews();
  };

  const rotateSelectedImage = () => {
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

        // Swap width/height for 90 degree rotation
        canvas.width = img.height;
        canvas.height = img.width;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const rotatedSrc = canvas.toDataURL('image/png');
        setImages(prev => prev.map(i => i.id === selectedId ? { ...i, src: rotatedSrc } : i));
        clearPreviews();
        setIsConverting(false);
        toast({ title: "Image Rotated", description: "Turned 90° clockwise." });
    };
  };

  const applyToAll = () => {
      const selected = images.find(img => img.id === selectedId);
      if (!selected) return;
      setImages(prev => prev.map(img => ({ ...img, vAlign: selected.vAlign })));
      toast({ title: "Global Sync Complete", description: "Alignment applied to all pages." });
  };

  const generateVisualPreviews = async (pdfBlob: Blob) => {
    setIsGeneratingPreview(true);
    setRenderingProgress(0);
    try {
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
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
                await page.render({ canvasContext: context, viewport }).promise;
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

        const imgData = images[i];
        const img = new window.Image();
        img.src = imgData.src;

        await new Promise((resolve) => {
            img.onload = () => {
                const imgProps = pdf.getImageProperties(img);
                // 90% Scaling for room to align
                const scaleFactor = 0.9;
                const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height) * scaleFactor;
                const finalWidth = imgProps.width * ratio;
                const finalHeight = imgProps.height * ratio;

                const x = (pageWidth - finalWidth) / 2;
                let y;

                // ABSOLUTE LITERAL COORDINATES
                if (imgData.vAlign === 'top') {
                    y = 0; 
                } else if (imgData.vAlign === 'bottom') {
                    y = pageHeight - finalHeight; 
                } else {
                    y = (pageHeight - finalHeight) / 2; 
                }

                pdf.addImage(imgData.src, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');
                resolve(null);
            };
        });
    }

    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setConvertedPdfUrl(url);
    await generateVisualPreviews(pdfBlob);

    setIsConverting(false);
    toast({ title: "PDF Created", description: "Strict alignment logic applied." });
  };
  
  const handleDownload = () => {
      if (!convertedPdfUrl) return;
      const link = document.createElement('a');
      link.href = convertedPdfUrl;
      link.download = `strictly-aligned-docs.pdf`;
      link.click();
  }

  const selectedImage = images.find(img => img.id === selectedId);

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-8 space-y-6">
            <Card className={cn("border-2 transition-all duration-300 overflow-hidden bg-card/50 shadow-xl rounded-[2.5rem]", isDragOver && "border-primary ring-4 ring-primary/20")}
                  onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                <CardHeader className="bg-muted/30 border-b p-6">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter">IMAGE TO PDF STUDIO</CardTitle>
                    <CardDescription className="font-bold text-[10px] uppercase opacity-50">Absolute zero-gap alignment enabled.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    {images.length === 0 ? (
                        <div className="border-4 border-dashed border-muted-foreground/30 rounded-3xl p-8 md:p-20 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                            <div className="size-16 md:size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <UploadCloud className="size-8 md:size-10" />
                            </div>
                            <div className="text-center px-4">
                                <p className="text-lg font-black uppercase tracking-tighter">Drop images or Click to upload</p>
                                <p className="text-xs text-muted-foreground mt-1 font-bold opacity-60">100% Private local RAM processing.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar p-1">
                            {images.map((img, index) => (
                            <div 
                                key={img.id} 
                                onClick={() => setSelectedId(img.id)}
                                className={cn(
                                    "relative aspect-[1/1.414] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer transform active:scale-95 bg-white flex flex-col p-0 shadow-md",
                                    selectedId === img.id ? "border-primary ring-4 ring-primary/20 scale-105 z-10 shadow-xl" : "hover:border-primary/30"
                                )}
                            >
                                <div className={cn(
                                    "absolute inset-0 flex flex-col w-full h-full p-0 transition-all duration-300",
                                    img.vAlign === 'top' ? 'justify-start' : img.vAlign === 'bottom' ? 'justify-end' : 'justify-center'
                                )}>
                                    <img 
                                        src={img.src} 
                                        alt="thumb"
                                        className="max-w-full max-h-[90%] object-contain pointer-events-none mx-auto block" 
                                    />
                                </div>
                                
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <Button size="icon" variant="destructive" className="h-7 w-7 rounded-lg shadow-lg" onClick={(e) => { e.stopPropagation(); handleRemoveImage(img.id); }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute top-2 left-2 z-20">
                                    <div className="bg-black/60 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase backdrop-blur-md">P{index + 1}</div>
                                </div>
                            </div>
                            ))}
                            <button className="border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all aspect-[1/1.414] shadow-inner group" onClick={() => fileInputRef.current?.click()}>
                                <UploadCloud className="h-8 w-8 text-primary/40 group-hover:text-primary" />
                                <span className="text-[10px] font-black uppercase text-primary/60">Add More</span>
                            </button>
                        </div>
                    )}
                </CardContent>
                {images.length > 0 && (
                    <CardFooter className="bg-muted/10 border-t p-4 flex justify-between items-center">
                        <Button variant="ghost" onClick={handleReset} className="text-[10px] font-black uppercase text-destructive hover:bg-destructive/10 tracking-widest"><RefreshCcw className="mr-2 h-3.5 w-3.5" /> Start Over</Button>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground opacity-40">
                            <ShieldCheck className="h-4 w-4 text-green-500" /> Secure Processing
                        </div>
                    </CardFooter>
                )}
            </Card>

            {convertedPdfUrl && (
                <Card className="border-2 border-green-500/20 shadow-3xl animate-in zoom-in-95 duration-500 overflow-hidden bg-card/50 rounded-[2.5rem] hover:-translate-y-1 transition-all">
                    <CardHeader className="bg-green-500/5 py-3 border-b border-green-500/20 text-center">
                        <CardTitle className="text-[10px] font-black uppercase flex items-center justify-center gap-2 text-green-700 tracking-[0.2em]">
                            <Eye className="size-3 text-green-600" /> VISUAL PREVIEW CONFIRMATION
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 bg-slate-200 dark:bg-slate-900/50">
                        <ScrollArea className="h-[550px] w-full p-6 md:p-12 lg:p-16">
                            <div className="flex flex-col items-center gap-8 pb-10">
                                {isGeneratingPreview ? (
                                    <div className="flex flex-col items-center gap-4 py-20 w-full max-w-xs text-center">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20 mx-auto stroke-[3]" />
                                        <div className="space-y-3 w-full">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Generating HD Preview...</p>
                                            <Progress value={renderingProgress} className="h-1" />
                                        </div>
                                    </div>
                                ) : (
                                    previewImages.map((img, i) => (
                                        <div key={i} className="shadow-3xl border-4 md:border-8 border-white rounded-sm overflow-hidden bg-white max-w-full animate-in slide-in-from-bottom-4 duration-500">
                                            <img src={img} alt={`Page ${i+1}`} className="max-w-full h-auto block" />
                                            <div className="bg-muted text-[8px] font-black py-1.5 text-center uppercase tracking-widest text-muted-foreground border-t">A4 Page {i+1}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <ScrollBar />
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="bg-green-500/10 p-8 flex flex-col sm:flex-row justify-between items-center gap-8 border-t border-green-500/20">
                        <div className="flex items-center gap-5 text-center sm:text-left">
                            <div className="size-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl shrink-0">
                                <CheckCircle2 className="size-9" />
                            </div>
                            <div>
                                <p className="text-xl font-black text-green-800 uppercase tracking-tighter leading-none">PDF READY!</p>
                                <p className="text-[10px] text-green-700 font-bold mt-1.5 uppercase tracking-widest opacity-60">Bundle sanitized and complete</p>
                            </div>
                        </div>
                        {/* PREMIUM DOWNLOAD BUTTON */}
                        <Button 
                            size="lg" 
                            className="w-full sm:w-auto h-20 px-12 bg-gradient-to-r from-green-600 to-emerald-800 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_15px_30px_-10px_rgba(34,197,94,0.4)] text-xl font-black rounded-3xl transition-all active:scale-95 group flex items-center gap-5 border-none" 
                            onClick={handleDownload}
                        >
                            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner group-hover:translate-y-1 transition-transform">
                                <Download className="size-6 text-white" />
                            </div>
                            <span className="uppercase tracking-tighter">DOWNLOAD PDF</span>
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>

        <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2.5rem] bg-white dark:bg-slate-950 transition-all hover:border-primary/30">
                <CardHeader className="bg-primary/5 border-b p-6">
                    <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                        <Layout className="size-6 text-primary" /> POSITIONING
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8">
                    {!selectedId ? (
                        <div className="py-20 text-center space-y-4 opacity-30 flex flex-col items-center">
                             <MousePointer2 className="size-14 text-muted-foreground" />
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">Select a page thumbnail<br/>to strictly align</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <AlignVerticalJustifyCenter className="size-3" /> Absolute Alignment
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button 
                                        variant={selectedImage?.vAlign === 'top' ? 'default' : 'outline'} 
                                        className={cn("h-16 flex-col gap-1 rounded-xl border-2 transition-all", selectedImage?.vAlign === 'top' && "border-primary bg-primary shadow-lg scale-105")} 
                                        onClick={() => updateSelectedImage({ vAlign: 'top' })}
                                    >
                                        <AlignVerticalJustifyStart className="size-5" />
                                        <span className="text-[8px] font-black uppercase">Literal Top</span>
                                    </Button>
                                    <Button 
                                        variant={selectedImage?.vAlign === 'center' ? 'default' : 'outline'} 
                                        className={cn("h-16 flex-col gap-1 rounded-xl border-2 transition-all", selectedImage?.vAlign === 'center' && "border-primary bg-primary shadow-lg scale-105")} 
                                        onClick={() => updateSelectedImage({ vAlign: 'center' })}
                                    >
                                        <AlignVerticalJustifyCenter className="size-5" />
                                        <span className="text-[8px] font-black uppercase">Center</span>
                                    </Button>
                                    <Button 
                                        variant={selectedImage?.vAlign === 'bottom' ? 'default' : 'outline'} 
                                        className={cn("h-16 flex-col gap-1 rounded-xl border-2 transition-all", selectedImage?.vAlign === 'bottom' && "border-primary bg-primary shadow-lg scale-105")} 
                                        onClick={() => updateSelectedImage({ vAlign: 'bottom' })}
                                    >
                                        <AlignVerticalJustifyEnd className="size-5" />
                                        <span className="text-[8px] font-black uppercase">Literal Bottom</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t-2 border-dashed border-primary/5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <RotateCw className="size-3" /> Orientation
                                </Label>
                                <Button 
                                    variant="outline" 
                                    className="w-full h-12 rounded-xl border-2 font-black text-xs uppercase shadow-sm hover:border-primary/40 transition-all"
                                    onClick={rotateSelectedImage}
                                >
                                    <RotateCw className="size-4 mr-2" /> Rotate 90°
                                </Button>
                            </div>

                            <Button variant="outline" className="w-full h-10 border-2 font-black text-[9px] uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl transition-all" onClick={applyToAll}>
                                <Layers className="size-3.5 mr-2" /> Global Sync Alignment
                            </Button>
                        </div>
                    )}

                    <div className="p-5 bg-primary/5 rounded-[1.5rem] border-2 border-primary/10 flex gap-4 shadow-inner">
                        <Zap className="size-6 text-yellow-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase">
                            <span className="font-black block mb-1 text-primary">STRICT CLAMPING:</span>
                            "Bottom" logic pushes the image to the absolute last pixel of the page. Zero padding active.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-6 md:p-8 border-t-2 border-dashed">
                    {/* PREMIUM BUILD BUTTON */}
                    <Button 
                        className="w-full h-20 rounded-[1.8rem] bg-gradient-to-r from-primary to-blue-700 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_15px_30px_-10px_rgba(var(--primary),0.4)] text-white hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 group px-8 border-none" 
                        disabled={images.length === 0 || isConverting}
                        onClick={handleConvertToPdf}
                    >
                        {isConverting ? (
                            <div className="flex items-center gap-4">
                                <Loader2 className="size-8 animate-spin" />
                                <span className="uppercase tracking-tighter font-black text-xl">CONSTRUCTING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                                        <FileDigit className="size-7 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block uppercase tracking-tighter leading-none font-black text-xl">BUILD PDF</span>
                                        <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{images.length} FILES STACKED</span>
                                    </div>
                                </div>
                                <ChevronRight className="size-6 opacity-30 group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} />
    </div>
  );
}
