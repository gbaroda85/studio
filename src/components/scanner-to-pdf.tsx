
"use client";

import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import * as pdfjs from 'pdfjs-dist';
import { 
    Download, 
    X, 
    Loader2, 
    UploadCloud,
    CheckCircle2,
    Zap, 
    ShieldCheck, 
    ImageIcon,
    FileStack,
    Trash2,
    RotateCw,
    Layout,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyEnd,
    MousePointer2,
    Layers,
    ChevronRight,
    Camera,
    RefreshCcw,
    Plus, 
    Eye,
    FileDigit,
    Monitor,
    Smartphone,
    Sparkles,
    Settings2,
    Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';

const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
}

type VAlign = 'top' | 'center' | 'bottom';

interface ScannedPage {
    id: string;
    src: string;
    name: string;
    vAlign: VAlign;
}

const StarIcons = () => (
    <>
        <div className="star-1 pointer-events-none">
            <svg viewBox="0 0 784.11 815.53" className="fill-white">
                <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-2 pointer-events-none">
            <svg viewBox="0 0 784.11 815.53" className="fill-white">
                <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-3 pointer-events-none">
            <svg viewBox="0 0 784.11 815.53" className="fill-white">
                <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
    </>
);

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function ScannerToPdf() {
  const { toast } = useToast();
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [renderingProgress, setRenderingProgress] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFilesUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    setIsProcessing(true);
    setPreviewImages([]);
    
    // FILTER IMAGES ONLY - PDF logic removed as requested
    const newFilesArray = Array.from(filesList).filter(file => file.type.startsWith('image/'));
    
    if (newFilesArray.length === 0) {
        setIsProcessing(false);
        toast({ variant: "destructive", title: "Invalid Files", description: "Please upload image files (JPG/PNG/WEBP)." });
        return;
    }

    let loadedCount = 0;
    newFilesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const id = Math.random().toString(36).substr(2, 9);
            const base64Src = event.target?.result as string;
            
            setPages(prev => {
                const updated = [...prev, {
                    id,
                    src: base64Src,
                    name: file.name || `Scan-${Date.now()}.jpg`,
                    vAlign: 'center'
                }];
                if (!selectedId) setSelectedId(id);
                return updated;
            });

            loadedCount++;
            if (loadedCount === newFilesArray.length) {
                setIsProcessing(false);
                toast({ title: "Images Added", description: `Successfully loaded ${newFilesArray.length} photos.` });
            }
        };
        reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleRemovePage = (id: string) => {
    setPreviewImages([]);
    setPages(prev => {
        const filtered = prev.filter(p => p.id !== id);
        if (selectedId === id) {
            setSelectedId(filtered.length > 0 ? filtered[filtered.length - 1].id : null);
        }
        return filtered;
    });
    toast({ title: "Page Removed" });
  };

  const handleRotate = (id: string) => {
    setPreviewImages([]);
    const item = pages.find(p => p.id === id);
    if (!item) return;

    setIsProcessing(true);
    const img = new window.Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setIsProcessing(false);
            return;
        }
        
        // Rotate 90 degrees logic
        canvas.width = img.height;
        canvas.height = img.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        const rotatedSrc = canvas.toDataURL('image/jpeg', 0.95);
        setPages(prev => prev.map(p => p.id === id ? { ...p, src: rotatedSrc } : p));
        setIsProcessing(false);
    };
    img.onerror = () => {
        setIsProcessing(false);
        toast({ variant: 'destructive', title: "Rotate Error", description: "Could not process image pixels." });
    };
    img.src = item.src;
  };

  const updateAlignment = (vAlign: VAlign) => {
      setPreviewImages([]);
      if (!selectedId) return;
      setPages(prev => prev.map(p => p.id === selectedId ? { ...p, vAlign } : p));
  };

  const applyAlignmentToAll = () => {
      const selected = pages.find(p => p.id === selectedId);
      if (!selected) return;
      setPreviewImages([]);
      setPages(prev => prev.map(p => ({ ...p, vAlign: selected.vAlign })));
      toast({ title: "Applied to All", description: `Alignment synchronized.` });
  };

  const ensureImageLoaded = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = async () => {
              if (img.decode) {
                  try {
                      await img.decode();
                      resolve(img);
                  } catch (e) {
                      resolve(img); 
                  }
              } else {
                  resolve(img);
              }
          };
          img.onerror = reject;
          img.src = src;
      });
  };

  const generatePDFPreview = async () => {
      if (pages.length === 0) return;
      setIsRenderingPreview(true);
      setRenderingProgress(0);
      try {
          const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgs: string[] = [];

          for (let i = 0; i < pages.length; i++) {
              if (i > 0) pdf.addPage();
              const pData = pages[i];
              
              try {
                  const img = await ensureImageLoaded(pData.src);
                  const margin = 10;
                  const safeW = pageWidth - (margin * 2);
                  const safeH = pageHeight - (margin * 2);
                  const ratio = Math.min(safeW / img.naturalWidth, safeH / img.naturalHeight);
                  const fw = img.naturalWidth * ratio;
                  const fh = img.naturalHeight * ratio;
                  const x = (pageWidth - fw) / 2;
                  let y;
                  if (pData.vAlign === 'top') y = margin;
                  else if (pData.vAlign === 'bottom') y = pageHeight - fh - margin;
                  else y = (pageHeight - fh) / 2;
                  
                  pdf.addImage(img, 'JPEG', x, y, fw, fh, undefined, 'FAST');
              } catch (e) {
                  console.error("Preview page skip:", e);
              }
              
              setRenderingProgress(Math.round(((i + 1) / pages.length) * 100));
          }

          const pdfBytes = pdf.output('arraybuffer');
          const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfBytes) });
          const pdfDoc = await loadingTask.promise;
          
          for (let i = 1; i <= pdfDoc.numPages; i++) {
              const pg = await pdfDoc.getPage(i);
              const vp = pg.getViewport({ scale: 1.2 });
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (ctx) {
                  canvas.height = vp.height; canvas.width = vp.width;
                  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                  await pg.render({ canvasContext: ctx, viewport: vp }).promise;
                  imgs.push(canvas.toDataURL('image/jpeg', 0.85));
              }
          }
          setPreviewImages(imgs);
      } catch (e) {
          toast({ variant: 'destructive', title: "Preview Error" });
      } finally {
          setIsRenderingPreview(false);
      }
  };

  const handleDownloadPdf = async () => {
    if (pages.length === 0) return;
    setIsGenerating(true);
    try {
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < pages.length; i++) {
            if (i > 0) pdf.addPage();
            const pData = pages[i];
            
            try {
                const img = await ensureImageLoaded(pData.src);
                const margin = 10;
                const safeW = pageWidth - (margin * 2);
                const safeH = pageHeight - (margin * 2);
                const ratio = Math.min(safeW / img.naturalWidth, safeH / img.naturalHeight);
                const fw = img.naturalWidth * ratio;
                const fh = img.naturalHeight * ratio;
                const x = (pageWidth - fw) / 2;
                let y;
                if (pData.vAlign === 'top') y = margin;
                else if (pData.vAlign === 'bottom') y = pageHeight - fh - margin;
                else y = (pageHeight - fh) / 2;
                
                pdf.addImage(img, 'JPEG', x, y, fw, fh, undefined, 'FAST');
            } catch (err) {
                console.error("Export page skip:", err);
            }
        }
        pdf.save(`Scan-Bundle-${Date.now()}.pdf`);
        toast({ title: "PDF Exported Successfully" });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Export Failed' });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleShare = async () => {
      if (pages.length === 0 || !navigator.share) return;
      setIsSharing(true);
      try {
          const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          for (let i = 0; i < pages.length; i++) {
              if (i > 0) pdf.addPage();
              const pData = pages[i];
              const img = await ensureImageLoaded(pData.src);
              const margin = 10;
              const ratio = Math.min((pageWidth - 20) / img.naturalWidth, (pageHeight - 20) / img.naturalHeight);
              const fw = img.naturalWidth * ratio;
              const fh = img.naturalHeight * ratio;
              const x = (pageWidth - fw) / 2;
              let y;
              if (pData.vAlign === 'top') y = 10;
              else if (pData.vAlign === 'bottom') y = pageHeight - fh - 10;
              else y = (pageHeight - fh) / 2;
              pdf.addImage(img, 'JPEG', x, y, fw, fh, undefined, 'FAST');
          }
          const blob = pdf.output('blob');
          const file = new File([blob], "Scanned_Document.pdf", { type: "application/pdf" });
          await navigator.share({ 
              files: [file], 
              title: "Scanned Document", 
              text: "Sent via GR7 Tools - https://www.gr7imagepdf.com/" 
          });
      } catch (e) { console.error(e); } finally { setIsSharing(false); }
  };

  const handleReset = () => {
      setPages([]);
      setPreviewImages([]);
      setSelectedId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-7xl flex flex-col gap-6 animate-in fade-in duration-700 pb-20 px-4 mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-start mt-8">
            
            {/* LEFT: WORKSPACE */}
            <div className="lg:col-span-8 space-y-6">
                <Card className="border-2 shadow-2xl overflow-hidden rounded-[2.5rem] bg-card/50 border-primary/10">
                    <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                         <div className="space-y-1 text-left">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 text-primary">
                                <FileStack className="size-6" /> BUNDLE STUDIO
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase opacity-60">High-fidelity local RAM processing.</CardDescription>
                         </div>
                         <div className="flex gap-2">
                             {pages.length > 0 && (
                                <Button variant="outline" size="sm" onClick={() => setPages([])} className="h-8 text-[9px] font-black uppercase border-2 rounded-lg text-rose-600 border-rose-100 hover:bg-rose-50 hover:text-rose-700">
                                    <Trash2 className="size-3 mr-1" /> Clear All
                                </Button>
                             )}
                         </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 relative">
                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/70 dark:bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-50 rounded-b-[2rem]">
                                <Loader2 className="animate-spin size-10 text-primary stroke-[3]" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Processing Pixels...</p>
                            </div>
                        )}

                        {pages.length === 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div 
                                    className="border-4 border-dashed border-primary/20 rounded-3xl p-10 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-primary/5 transition-all group"
                                    onClick={() => cameraInputRef.current?.click()}
                                >
                                    <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg">
                                        <Camera className="size-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-black uppercase tracking-tighter text-slate-800 dark:text-slate-200">Native Camera</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Full screen capture</p>
                                    </div>
                                </div>

                                <div 
                                    className="border-4 border-dashed border-primary/20 rounded-3xl p-10 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/5 transition-all group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        <UploadCloud className="size-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-black uppercase tracking-tighter text-slate-800 dark:text-slate-200">Photo Gallery</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Select multiple images</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <ScrollArea className="h-[450px] pr-2 custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-4 p-1">
                                        {pages.map((p, i) => (
                                            <div 
                                                key={p.id} 
                                                onClick={() => setSelectedId(p.id)}
                                                className={cn(
                                                    "group relative aspect-[1/1.414] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer transform active:scale-95 bg-white shadow-lg",
                                                    selectedId === p.id ? "border-primary ring-4 ring-primary/20 scale-105 z-10 shadow-primary/30" : "hover:border-primary/40 border-transparent"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute inset-0 flex flex-col w-full h-full p-1 transition-all duration-300",
                                                    p.vAlign === 'top' ? 'justify-start' : p.vAlign === 'bottom' ? 'justify-end' : 'justify-center'
                                                )}>
                                                    <img src={p.src} className="max-w-full max-h-[90%] object-contain mx-auto block" alt="thumb" />
                                                </div>
                                                <div className="absolute top-2 left-2 size-7 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white z-20 border border-white/10">P{i + 1}</div>
                                                
                                                <div className="absolute bottom-2 right-2 z-20 flex gap-1 animate-in fade-in duration-300">
                                                    <Button type="button" size="icon" variant="secondary" className="h-7 w-7 rounded-lg shadow-lg bg-white/95 hover:bg-primary hover:text-white text-primary border-2 border-primary/20 transition-all" onClick={(e) => { e.stopPropagation(); handleRotate(p.id); }}>
                                                        <RotateCw className="size-3.5" />
                                                    </Button>
                                                    <Button type="button" size="icon" variant="destructive" className="h-7 w-7 rounded-lg shadow-lg border-2 border-white/20" onClick={(e) => { e.stopPropagation(); handleRemovePage(p.id); }}>
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            className="aspect-[1/1.414] border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-all text-primary font-black uppercase text-[10px] group shadow-inner"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Plus className="size-5" />
                                            </div>
                                            <span>Add Image</span>
                                        </button>
                                    </div>
                                    <ScrollBar />
                                </ScrollArea>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-muted/10 border-t p-4 flex justify-center gap-8">
                         <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                            <ShieldCheck className="size-4 text-green-500" /> SECURE RAM
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                            <Zap className="size-4 text-yellow-500" /> 100% PRIVATE
                        </div>
                    </CardFooter>
                </Card>

                <AnimatePresence>
                    {previewImages.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-full">
                            <Card className="border-2 border-green-500/20 shadow-3xl overflow-hidden bg-card/50 rounded-[2.5rem]">
                                <CardHeader className="bg-green-500/5 py-4 border-b border-green-500/20 flex flex-row items-center justify-center gap-3">
                                    <Eye className="size-4 text-green-600" />
                                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-green-800">Visual Render View</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 bg-slate-200 dark:bg-slate-900/50">
                                    <ScrollArea className="h-[450px] w-full p-8 md:p-12">
                                        <div className="flex flex-col items-center gap-10 pb-10">
                                            {previewImages.map((img, i) => (
                                                <div key={i} className="shadow-3xl border-[8px] border-white rounded-sm overflow-hidden bg-white max-w-[450px] animate-in slide-in-from-bottom-4 duration-500">
                                                    <img src={img} alt="p" className="w-full h-auto block" />
                                                    <div className="bg-muted text-[8px] font-black py-2 text-center uppercase tracking-widest text-muted-foreground border-t">A4 Optimized Page {i+1}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <ScrollBar />
                                    </ScrollArea>
                                </CardContent>
                                <CardFooter className="bg-green-500/10 p-8 flex justify-center border-t border-green-500/20 gap-4">
                                    <Button 
                                        variant="outline"
                                        size="lg"
                                        className="h-16 px-10 border-2 border-emerald-600 text-emerald-700 font-black rounded-full hover:bg-emerald-50"
                                        onClick={handleShare}
                                    >
                                        {isSharing ? <Loader2 className="size-5 animate-spin mr-2" /> : <Share2 className="size-5 mr-2" />}
                                        SHARE PDF
                                    </Button>
                                    <Button 
                                        size="lg" 
                                        className="magic-button magic-button-success w-full md:w-auto h-16 px-12 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 font-black rounded-full transition-all active:scale-95 group flex items-center gap-4 shadow-3xl" 
                                        onClick={handleDownloadPdf}
                                    >
                                        <StarIcons />
                                        <Download className="size-7 md:size-8 group-hover:translate-y-1 transition-transform" />
                                        <span className="uppercase tracking-tighter text-lg md:text-xl">DOWNLOAD PDF BUNDLE</span>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* RIGHT: POSITIONING PANEL */}
            <div className="lg:col-span-4 space-y-6 no-print">
                <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100">
                            <Layout className="size-6 text-primary" /> POSITIONING
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-8">
                        {!selectedId ? (
                            <div className="py-12 text-center space-y-4 opacity-40 flex flex-col items-center">
                                 <MousePointer2 className="size-12 text-muted-foreground animate-bounce" />
                                 <p className="text-xs font-black uppercase tracking-widest leading-relaxed max-w-[200px] text-slate-800 dark:text-slate-100">Select an image to<br/>unlock alignment</p>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2 mb-3">
                                        <AlignVerticalJustifyCenter className="size-3" /> Vertical Alignment
                                    </Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        <button 
                                            className={cn(
                                                "btn-pos-uiverse h-14 relative", 
                                                selectedPage?.vAlign === 'top' && "active-uiverse"
                                            )} 
                                            data-label="      Top"
                                            onClick={() => updateAlignment('top')}
                                        >
                                            <AlignVerticalJustifyStart className="absolute left-4 top-1/2 -translate-y-1/2 size-5 z-30 text-slate-900 group-hover:text-white" />
                                        </button>
                                        <button 
                                            className={cn(
                                                "btn-pos-uiverse h-14 relative", 
                                                selectedPage?.vAlign === 'center' && "active-uiverse"
                                            )} 
                                            data-label="      Center"
                                            onClick={() => updateAlignment('center')}
                                        >
                                            <AlignVerticalJustifyCenter className="absolute left-4 top-1/2 -translate-y-1/2 size-5 z-30 text-slate-900 group-hover:text-white" />
                                        </button>
                                        <button 
                                            className={cn(
                                                "btn-pos-uiverse h-14 relative", 
                                                selectedPage?.vAlign === 'bottom' && "active-uiverse"
                                            )} 
                                            data-label="      Bottom"
                                            onClick={() => updateAlignment('bottom')}
                                        >
                                            <AlignVerticalJustifyEnd className="absolute left-4 top-1/2 -translate-y-1/2 size-5 z-30 text-slate-900 group-hover:text-white" />
                                        </button>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full h-11 border-2 font-black text-[9px] uppercase tracking-widest text-primary hover:bg-primary hover:text-white border-primary/20 rounded-xl transition-all" onClick={applyAlignmentToAll}>
                                    <Layers className="size-3 mr-2" /> Apply to All Images
                                </Button>
                            </div>
                        )}

                        <div className="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10 flex gap-4 shadow-inner">
                            <Zap className="size-6 text-yellow-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase text-left">
                                <span className="font-black block mb-1 text-primary">A4 SYNC:</span>
                                Final PDF is generated at 300DPI with deep buffer decoding to prevent quality loss.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-6 border-t flex flex-col gap-4">
                        <Button 
                            className="w-full h-14 bg-primary text-white hover:bg-transparent border-4 border-primary hover:text-primary font-black text-base rounded-2xl shadow-xl transition-all active:scale-95 group flex items-center justify-center gap-3"
                            onClick={generatePDFPreview}
                            disabled={pages.length === 0 || isRenderingPreview}
                        >
                            {isRenderingPreview ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="size-4 animate-spin" />
                                    <span className="text-[10px] font-black uppercase">{renderingProgress}% MAPPING...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Eye className="size-5" />
                                    <span>BUILD HD PREVIEW</span>
                                </div>
                            )}
                        </Button>
                        <p className="text-[8px] font-black text-center text-muted-foreground/40 uppercase tracking-widest">Local RAM Processing Active</p>
                    </CardFooter>
                </Card>
            </div>
        </div>
        
        <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFilesUpload} />
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleFilesUpload} />
    </div>
  );
}
