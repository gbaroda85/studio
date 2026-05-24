
"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect, useCallback } from "react";
import Image from "next/image";
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
  Layers, 
  RefreshCcw,
  Layout,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  Maximize,
  Eye,
  CheckCircle2,
  MousePointer2,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Initialize PDF.js worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

type VAlign = 'top' | 'center' | 'bottom';
type FitMode = 'fit' | 'original';

interface ImageItem {
    id: string;
    file: File;
    src: string;
    vAlign: VAlign;
    fitMode: FitMode;
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
      }
    };
  }, [convertedPdfUrl]);

  const handleFilesChange = (files: FileList | null) => {
    if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
        setConvertedPdfUrl(null);
        setPreviewImages([]);
    }
    const newFilesList = Array.from(files || []).filter(file => file.type.startsWith('image/'));
    if (newFilesList.length === 0 && files && files.length > 0) {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select only image files.' });
        return;
    }

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
                vAlign: 'center',
                fitMode: 'fit'
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
    if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
        setConvertedPdfUrl(null);
        setPreviewImages([]);
    }
    setImages(prev => {
        const filtered = prev.filter(img => img.id !== id);
        if (selectedId === id) setSelectedId(filtered.length > 0 ? filtered[0].id : null);
        return filtered;
    });
  }
  
  const handleReset = () => {
    setImages([]);
    setSelectedId(null);
    if (convertedPdfUrl) URL.revokeObjectURL(convertedPdfUrl);
    setConvertedPdfUrl(null);
    setPreviewImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const updateSelectedImage = (updates: Partial<Pick<ImageItem, 'vAlign' | 'fitMode'>>) => {
      if (!selectedId) return;
      setImages(prev => prev.map(img => img.id === selectedId ? { ...img, ...updates } : img));
      if (convertedPdfUrl) {
          URL.revokeObjectURL(convertedPdfUrl);
          setConvertedPdfUrl(null);
          setPreviewImages([]);
      }
  };

  const applyToAll = () => {
      const selected = images.find(img => img.id === selectedId);
      if (!selected) return;
      setImages(prev => prev.map(img => ({ ...img, vAlign: selected.vAlign, fitMode: selected.fitMode })));
      toast({ title: "Settings Applied", description: "Layout copied to all images in the queue." });
  };

  const generateVisualPreviews = async (pdfBlob: Blob) => {
    setIsGeneratingPreview(true);
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
                imgs.push(canvas.toDataURL('image/jpeg', 0.8));
            }
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
    setConvertedPdfUrl(null);
    setPreviewImages([]);

    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 0.5; // Literal edge logic (0.5mm tiny margin)
    const maxWidth = pageWidth - (margin * 2);
    const maxHeight = pageHeight - (margin * 2);

    for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();

        const imgData = images[i];
        const img = new window.Image();
        img.src = imgData.src;

        await new Promise((resolve) => {
            img.onload = () => {
                const imgProps = pdf.getImageProperties(img);
                let finalWidth, finalHeight;

                if (imgData.fitMode === 'fit') {
                    const widthRatio = maxWidth / imgProps.width;
                    const heightRatio = maxHeight / imgProps.height;
                    const ratio = Math.min(widthRatio, heightRatio) * 0.9; // Scale to fit well
                    finalWidth = imgProps.width * ratio;
                    finalHeight = imgProps.height * ratio;
                } else {
                    const pxToMm = 0.264583; 
                    finalWidth = imgProps.width * pxToMm;
                    finalHeight = imgProps.height * pxToMm;

                    if (finalWidth > maxWidth || finalHeight > maxHeight) {
                        const ratio = Math.min(maxWidth / finalWidth, maxHeight / finalHeight);
                        finalWidth *= ratio;
                        finalHeight *= ratio;
                    }
                }

                const x = (pageWidth - finalWidth) / 2;
                let y;

                if (imgData.vAlign === 'top') {
                    y = margin;
                } else if (imgData.vAlign === 'bottom') {
                    y = pageHeight - finalHeight - margin;
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
    toast({ title: "PDF Created!", description: "Strict alignment applied." });
  };
  
  const handleDownload = () => {
      if (!convertedPdfUrl) return;
      const link = document.createElement('a');
      link.href = convertedPdfUrl;
      link.download = `converted-docs-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  const selectedImage = images.find(img => img.id === selectedId);

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-8 space-y-6">
            <Card className={cn("border-2 transition-all duration-300 overflow-hidden bg-card/50 shadow-xl hover:border-primary/40", isDragOver && "border-primary ring-4 ring-primary/20")}
                  onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="text-xl font-black flex items-center justify-between">
                        <span className="uppercase tracking-tighter">IMAGE TO PDF PRO STUDIO</span>
                        {images.length > 0 && <Badge className="bg-primary text-white font-black uppercase">{images.length} PHOTOS</Badge>}
                    </CardTitle>
                    <CardDescription>Click a photo to configure its individual page layout.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {images.length === 0 ? (
                        <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-20 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                            <div className="size-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <UploadCloud className="size-12" />
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold uppercase tracking-tight">Drop images or Click to upload</p>
                                <p className="text-sm text-muted-foreground mt-2 font-medium">100% Secure local conversion (A4 Standard)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar p-1">
                            {images.map((img, index) => (
                            <div 
                                key={img.id} 
                                onClick={() => setSelectedId(img.id)}
                                className={cn(
                                    "relative group aspect-[1/1.414] rounded-xl overflow-hidden border-2 transition-all cursor-pointer transform active:scale-95 bg-white flex flex-col",
                                    selectedId === img.id ? "border-primary ring-4 ring-primary/20 scale-105 z-10 shadow-xl" : "hover:border-primary/30"
                                )}
                            >
                                <div className={cn(
                                    "flex-1 relative flex flex-col",
                                    img.vAlign === 'top' ? 'justify-start' : img.vAlign === 'bottom' ? 'justify-end' : 'justify-center'
                                )}>
                                    <div className="relative w-full h-full">
                                        <Image 
                                            src={img.src} 
                                            alt={`preview-${index}`} 
                                            fill 
                                            className={cn(
                                                "object-contain transition-all duration-300",
                                                img.vAlign === 'top' ? 'object-top' : img.vAlign === 'bottom' ? 'object-bottom' : 'object-center'
                                            )} 
                                            unoptimized 
                                        />
                                    </div>
                                </div>
                                
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="destructive" className="h-7 w-7 rounded-lg shadow-lg" onClick={(e) => { e.stopPropagation(); handleRemoveImage(img.id); }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute bottom-1 left-1 flex gap-1 z-20">
                                    <div className="bg-black/60 text-white text-[6px] px-1.5 py-0.5 rounded-full font-black uppercase backdrop-blur-md">P{index + 1}</div>
                                    <div className="bg-primary/80 text-white text-[6px] px-1.5 py-0.5 rounded-full font-black uppercase backdrop-blur-md">{img.vAlign}</div>
                                </div>
                            </div>
                            ))}
                            <button className="border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all aspect-[1/1.414]" onClick={() => fileInputRef.current?.click()}>
                                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Add More</span>
                            </button>
                        </div>
                    )}
                </CardContent>
                {images.length > 0 && (
                    <CardFooter className="bg-muted/10 border-t p-4 flex justify-between items-center">
                        <Button variant="ghost" onClick={handleReset} className="text-xs font-black uppercase text-destructive hover:bg-destructive/10"><RefreshCcw className="mr-2 h-3.5 w-3.5" /> Clear All</Button>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-green-500" /> Secure RAM Conversion
                        </div>
                    </CardFooter>
                )}
            </Card>

            {convertedPdfUrl && (
                <Card className="border-2 border-green-500/20 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
                    <CardHeader className="bg-green-500/5 py-4 border-b border-green-500/20">
                        <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-green-700">
                            <Eye className="size-4" /> Visual Preview (Verify Layout)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 bg-muted/20">
                        <ScrollArea className="h-[550px] w-full p-8">
                            <div className="flex flex-col items-center gap-8">
                                {isGeneratingPreview ? (
                                    <div className="flex flex-col items-center gap-4 py-20">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                                        <p className="text-[10px] font-black uppercase text-primary animate-pulse">Rendering Document Preview...</p>
                                    </div>
                                ) : (
                                    previewImages.map((img, i) => (
                                        <div key={i} className="shadow-2xl border-4 border-white rounded-sm overflow-hidden bg-white max-w-full">
                                            <img src={img} alt={`Page ${i+1}`} className="max-w-full h-auto" />
                                            <div className="bg-muted text-[8px] font-black py-1 px-2 text-center uppercase tracking-widest text-muted-foreground border-t">Page {i+1} Preview</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="bg-green-500/10 p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 text-center sm:text-left">
                            <div className="size-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl">
                                <CheckCircle2 className="size-8" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-green-800 uppercase tracking-tighter leading-none">PDF READY!</p>
                                <p className="text-xs text-green-700 font-bold mt-1 uppercase tracking-widest">Alignment logic strictly applied</p>
                            </div>
                        </div>
                        <Button size="lg" className="h-16 px-12 bg-green-600 hover:bg-green-700 text-xl font-black shadow-2xl rounded-2xl transition-all active:scale-95" onClick={handleDownload}>
                            <Download className="mr-3 size-7" /> DOWNLOAD PDF
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>

        <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950">
                <CardHeader className="bg-primary/5 border-b p-6">
                    <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                        <Layout className="size-6 text-primary" /> Page Studio
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    {!selectedId ? (
                        <div className="py-12 text-center space-y-4 opacity-40">
                             <MousePointer2 className="size-12 mx-auto text-muted-foreground" />
                             <p className="text-xs font-black uppercase tracking-widest leading-relaxed">
                                Select a photo from<br/>the list to customize
                             </p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Maximize className="size-3" /> Scaling Mode
                                    </Label>
                                    <Badge variant="secondary" className="font-black text-[8px] uppercase">Selected Image</Badge>
                                </div>
                                <Tabs value={selectedImage?.fitMode} onValueChange={(v) => updateSelectedImage({ fitMode: v as FitMode })} className="w-full">
                                    <TabsList className="grid grid-cols-2 h-12 bg-muted/50 border-2 rounded-xl p-1">
                                        <TabsTrigger value="fit" className="font-black text-[10px] uppercase">Fit Page</TabsTrigger>
                                        <TabsTrigger value="original" className="font-black text-[10px] uppercase">Original</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            <div className="space-y-4 pt-4 border-t-2 border-dashed">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <AlignVerticalJustifyCenter className="size-3" /> Strict Position
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button 
                                        variant={selectedImage?.vAlign === 'top' ? 'default' : 'outline'} 
                                        className={cn("h-16 flex-col gap-1 rounded-xl border-2", selectedImage?.vAlign === 'top' && "border-primary")} 
                                        onClick={() => updateSelectedImage({ vAlign: 'top' })}
                                    >
                                        <AlignVerticalJustifyStart className="size-5" />
                                        <span className="text-[8px] font-black uppercase">Top</span>
                                    </Button>
                                    <Button 
                                        variant={selectedImage?.vAlign === 'center' ? 'default' : 'outline'} 
                                        className={cn("h-16 flex-col gap-1 rounded-xl border-2", selectedImage?.vAlign === 'center' && "border-primary")} 
                                        onClick={() => updateSelectedImage({ vAlign: 'center' })}
                                    >
                                        <AlignVerticalJustifyCenter className="size-5" />
                                        <span className="text-[8px] font-black uppercase">Center</span>
                                    </Button>
                                    <Button 
                                        variant={selectedImage?.vAlign === 'bottom' ? 'default' : 'outline'} 
                                        className={cn("h-16 flex-col gap-1 rounded-xl border-2", selectedImage?.vAlign === 'bottom' && "border-primary")} 
                                        onClick={() => updateSelectedImage({ vAlign: 'bottom' })}
                                    >
                                        <AlignVerticalJustifyEnd className="size-5" />
                                        <span className="text-[8px] font-black uppercase">Bottom</span>
                                    </Button>
                                </div>
                                <p className="text-[9px] text-muted-foreground italic font-medium leading-relaxed bg-muted/30 p-2 rounded-lg">
                                    Tip: Use "Fit Page" for the most dramatic alignment effect on A4 paper.
                                </p>
                            </div>

                            <Button variant="outline" className="w-full h-10 border-2 font-black text-[9px] uppercase tracking-widest text-primary hover:bg-primary/5" onClick={applyToAll}>
                                <Layers className="size-3 mr-2" /> Sync Settings to All Pages
                            </Button>
                        </div>
                    )}

                    <div className="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10 flex gap-4">
                        <Zap className="size-6 text-yellow-500 shrink-0" />
                        <p className="text-[10px] text-primary/80 font-bold leading-relaxed">
                            <span className="font-black uppercase block mb-1 text-primary">EXTREME ALIGNMENT:</span>
                            Images are pushed to the literal edges of the page based on your selection. Zero-gap calculation active.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-8 border-t-2">
                    <Button 
                        className="w-full h-20 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all active:scale-95 disabled:opacity-50" 
                        disabled={images.length === 0 || isConverting}
                        onClick={handleConvertToPdf}
                    >
                        {isConverting ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="size-8 animate-spin" />
                                <span className="uppercase tracking-tighter">BUILDING PDF...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <FileDigit className="size-9" />
                                <div className="text-left">
                                    <span className="block uppercase tracking-tighter leading-none">CONVERT TO PDF</span>
                                    <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{images.length} PAGES QUEUED</span>
                                </div>
                            </div>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <div className="p-6 bg-green-500/5 rounded-[2rem] border-2 border-green-500/10 flex gap-4 items-center shadow-sm">
                <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-6 text-green-600" />
                </div>
                <div>
                    <p className="text-[11px] font-black text-green-700 uppercase tracking-tight">Privacy Vault</p>
                    <p className="text-[10px] text-green-600/80 font-medium leading-tight">All layout math happens in RAM. Photos never leave your browser.</p>
                </div>
            </div>
        </div>
      </div>
      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} />
    </div>
  );
}
