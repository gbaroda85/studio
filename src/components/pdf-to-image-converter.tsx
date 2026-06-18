
"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect, useCallback } from 'react';
import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UploadCloud, 
  Download, 
  ImageIcon, 
  X, 
  RefreshCcw, 
  ShieldCheck, 
  Zap, 
  CheckCircle2,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  Maximize,
  MousePointer2,
  Layout,
  Loader2,
  Layers,
  RotateCw,
  Settings2,
  Sparkles,
  Eye,
  FileDigit,
  Monitor,
  Plus,
  Trash2,
  ListFilter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

// Initialize PDF.js worker with stable CDN
const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
}

type OutputFormat = 'png' | 'jpeg';
type VAlign = 'top' | 'center' | 'bottom';
type FitMode = 'fit' | 'original';

interface PageItem {
    id: string;
    originalSrc: string; 
    finalSrc: string;    
    vAlign: VAlign;
    fitMode: FitMode;
    index: number;
}

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

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function parsePageRanges(ranges: string, maxPage: number): number[] {
    const result = new Set<number>();
    if (!ranges) return [];

    const parts = ranges.split(',');
    for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.includes('-')) {
            const [startStr, endStr] = trimmedPart.split('-');
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            if (!isNaN(start) && !isNaN(end) && start <= end && start > 0 && end <= maxPage) {
                for (let i = start; i <= end; i++) {
                    result.add(i);
                }
            }
        } else {
            const page = parseInt(trimmedPart, 10);
            if (!isNaN(page) && page > 0 && page <= maxPage) {
                result.add(page);
            }
        }
    }
    return Array.from(result).sort((a, b) => a - b);
}

export default function PdfToImageConverter() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isZipping, setIsZipping] = useState(false);
    const [pages, setPages] = useState<PageItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
    const [isDragOver, setIsDragOver] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Range Selection States
    const [pageRangeMode, setPageRangeMode] = useState<'all' | 'custom'>('all');
    const [customRange, setCustomRange] = useState('');

    const selectedPage = pages.find(p => p.id === selectedId);

    const renderProcessedImage = useCallback((originalSrc: string, vAlign: VAlign, fitMode: FitMode): Promise<string> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.src = originalSrc;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { alpha: true });
                if (!ctx) return resolve(originalSrc);

                if (fitMode === 'original') {
                    const targetW = img.width;
                    const targetH = Math.round(targetW * 1.414);
                    canvas.width = targetW;
                    canvas.height = targetH;
                    
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    const scaleFactor = 0.9;
                    const dw = img.width * scaleFactor;
                    const dh = img.height * scaleFactor;
                    const dx = (canvas.width - dw) / 2;
                    
                    let dy;
                    if (vAlign === 'top') dy = 0;
                    else if (vAlign === 'bottom') dy = canvas.height - dh;
                    else dy = (canvas.height - dh) / 2;
                    
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, dx, dy, dw, dh);
                    resolve(canvas.toDataURL(`image/${outputFormat === 'jpeg' ? 'jpeg' : 'png'}`, 1.0));
                } else {
                    resolve(originalSrc);
                }
            };
        });
    }, [outputFormat]);

    const handlePdfToImage = async (file: File) => {
        setIsProcessing(true);
        setPages([]);
        setProgress(0);
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ 
                data: new Uint8Array(arrayBuffer),
                cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                cMapPacked: true,
                standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/standard_fonts/`
            }).promise;
            const totalPages = pdf.numPages;

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.5 }); 
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { willReadFrequently: true });
                canvas.height = Math.floor(viewport.height);
                canvas.width = Math.floor(viewport.width);
                
                if (context) {
                    context.fillStyle = '#FFFFFF';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    const src = canvas.toDataURL(`image/${outputFormat === 'jpeg' ? 'jpeg' : 'png'}`, 1.0);
                    const id = Math.random().toString(36).substr(2, 9);
                    const newItem = {
                        id,
                        originalSrc: src,
                        finalSrc: src,
                        vAlign: 'center' as VAlign,
                        fitMode: 'fit' as FitMode,
                        index: i
                    };
                    setPages(prev => {
                        const updated = [...prev, newItem];
                        if (i === 1) setSelectedId(id);
                        return updated;
                    });
                }
                setProgress(Math.round((i / totalPages) * 100));
            }
            toast({ title: 'Extraction Success', description: `Rendered ${totalPages} pages in HD.` });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to extract images.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            handlePdfToImage(file);
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a PDF file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const updateSelectedPage = async (updates: Partial<Pick<PageItem, 'vAlign' | 'fitMode'>>) => {
        if (!selectedId) return;
        const targetPage = pages.find(p => p.id === selectedId);
        if (!targetPage) return;
        const newVAlign = updates.vAlign ?? targetPage.vAlign;
        const newFitMode = updates.fitMode ?? targetPage.fitMode;
        setIsProcessing(true);
        const newFinalSrc = await renderProcessedImage(targetPage.originalSrc, newVAlign, newFitMode);
        setPages(prev => prev.map(p => p.id === selectedId ? { ...p, ...updates, finalSrc: newFinalSrc } : p));
        setIsProcessing(false);
    };

    const rotateSelectedPage = () => {
        if (!selectedId) return;
        const targetPage = pages.find(p => p.id === selectedId);
        if (!targetPage) return;

        setIsProcessing(true);
        const img = new window.Image();
        img.src = targetPage.originalSrc;
        img.onload = async () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setIsProcessing(false);
                return;
            }
            canvas.width = img.height;
            canvas.height = img.width;
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((90 * Math.PI) / 180);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            const rotatedOriginal = canvas.toDataURL(`image/${outputFormat === 'jpeg' ? 'jpeg' : 'png'}`, 1.0);
            const newFinal = await renderProcessedImage(rotatedOriginal, targetPage.vAlign, targetPage.fitMode);
            setPages(prev => prev.map(p => p.id === selectedId ? { ...p, originalSrc: rotatedOriginal, finalSrc: newFinal } : p));
            setIsProcessing(false);
            toast({ title: "Page Rotated" });
        };
    };

    const rotateAllPages = async () => {
        if (pages.length === 0) return;
        setIsProcessing(true);
        setProgress(0);
        
        await new Promise(r => setTimeout(r, 100));

        const currentPages = [...pages];
        for (let i = 0; i < currentPages.length; i++) {
            const p = currentPages[i];
            const newItem = await new Promise<PageItem>((resolve) => {
                const img = new window.Image();
                img.src = p.originalSrc;
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return resolve(p);
                    canvas.width = img.height;
                    canvas.height = img.width;
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.rotate((90 * Math.PI) / 180);
                    ctx.drawImage(img, -img.width / 2, -img.height / 2);
                    const rotatedOriginal = canvas.toDataURL(`image/${outputFormat === 'jpeg' ? 'jpeg' : 'png'}`, 1.0);
                    const newFinal = await renderProcessedImage(rotatedOriginal, p.vAlign, p.fitMode);
                    resolve({ ...p, originalSrc: rotatedOriginal, finalSrc: newFinal });
                };
            });
            
            setPages(prev => prev.map(prevP => prevP.id === p.id ? newItem : prevP));
            setProgress(Math.round(((i + 1) / currentPages.length) * 100));
            if (i % 2 === 0) await new Promise(r => setTimeout(r, 0));
        }

        setIsProcessing(false);
        toast({ title: "Global Rotation", description: "All pages rotated successfully." });
    };

    const applyToAll = async () => {
        const selected = pages.find(p => p.id === selectedId);
        if (!selected) return;
        setIsProcessing(true);
        setProgress(0);
        
        await new Promise(r => setTimeout(r, 100));

        const currentPages = [...pages];
        for (let i = 0; i < currentPages.length; i++) {
            const p = currentPages[i];
            const final = await renderProcessedImage(p.originalSrc, selected.vAlign, selected.fitMode);
            const newItem = { ...p, vAlign: selected.vAlign, fitMode: selected.fitMode, finalSrc: final };
            
            setPages(prev => prev.map(prevP => prevP.id === p.id ? newItem : prevP));
            setProgress(Math.round(((i + 1) / currentPages.length) * 100));
            if (i % 3 === 0) await new Promise(r => setTimeout(r, 0));
        }

        setIsProcessing(false);
        toast({ title: "Global Sync Complete" });
    };

    const handleDownloadAll = async () => {
        if (pages.length === 0 || !pdfFile) return;
        setIsZipping(true);
        setProgress(0);

        const indicesToDownload = pageRangeMode === 'all' 
            ? pages.map(p => p.index)
            : parsePageRanges(customRange, pages.length);

        if (indicesToDownload.length === 0 && pageRangeMode === 'custom') {
            toast({ variant: 'destructive', title: 'Invalid Range', description: 'Please enter a valid page range.' });
            setIsZipping(false);
            return;
        }

        try {
            const zip = new JSZip();
            const ext = outputFormat === 'jpeg' ? 'jpg' : 'png';
            
            const filteredPages = pages.filter(p => indicesToDownload.includes(p.index));

            for (let i = 0; i < filteredPages.length; i++) {
                const p = filteredPages[i];
                const base64Data = p.finalSrc.split(',')[1];
                zip.file(`extracted-page-${p.index}.${ext}`, base64Data, { base64: true });
                setProgress(Math.round(((i + 1) / filteredPages.length) * 100));
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `GR7-Tools-Extracted-Images.zip`;
            link.click();
            toast({ title: "Bundle Downloaded", description: `Saved ${indicesToDownload.length} images.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to bundle archive.' });
        } finally {
            setIsZipping(false);
        }
    };

    const handleReset = () => {
        setPdfFile(null);
        setPages([]);
        setSelectedId(null);
        setPageRangeMode('all');
        setCustomRange('');
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    if (!pdfFile) {
        return (
            <div className="w-full max-w-2xl py-4 flex flex-col items-center justify-center gap-6 px-4 mx-auto">
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
                        <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-10 md:p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group relative"
                             onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                            <div className="relative">
                                <UploadCloud className="size-14 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                            </div>
                            <div className="text-center px-4">
                                <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop PDF here</p>
                                <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">Extraction happens locally.</p>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                    </CardContent>
                    <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                        <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                        <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> 300 DPI HD</div>
                        <div className="flex items-center gap-1.5"><ImageIcon className="size-3 text-primary" /> PNG/JPG</div>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <Card className="w-full max-w-7xl shadow-3xl border-foreground/10 overflow-hidden bg-card/50 rounded-[2.5rem] mx-auto animate-in fade-in duration-700">
            <CardHeader className="bg-muted/30 border-b flex flex-col md:flex-row items-center justify-between p-4 md:p-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20"><Settings2 className="size-5" /></div>
                    <CardTitle className="text-xl font-black uppercase tracking-tighter">PDF to Image Studio</CardTitle>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {isProcessing && <Loader2 className="size-4 animate-spin text-primary" />}
                        {pages.length > 0 && <Badge className="bg-primary text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-md">{pages.length} PAGES READY</Badge>}
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-destructive/5 text-destructive" onClick={handleReset}><X className="size-4"/></Button>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="grid lg:grid-cols-12">
                    {/* LEFT SIDEBAR: CONTROLS */}
                    <div className="lg:col-span-4 border-r border-border bg-muted/20 p-6 space-y-8 no-print">
                        <div className="space-y-8 animate-in slide-in-from-left duration-300 text-left">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Maximize className="size-3" /> Canvas Mode
                                </Label>
                                <Tabs value={selectedPage?.fitMode || 'fit'} onValueChange={(v) => updateSelectedPage({ fitMode: v as FitMode })} className="w-full">
                                    <TabsList className="grid grid-cols-2 h-11 bg-background p-1 rounded-xl border-2">
                                        <TabsTrigger value="fit" className="font-bold text-[9px] uppercase rounded-lg">Raw Page</TabsTrigger>
                                        <TabsTrigger value="original" className="font-bold text-[9px] uppercase rounded-lg">A4 Frame</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            <div className={cn("space-y-4 pt-4 border-t-2 border-dashed border-border transition-all", selectedPage?.fitMode === 'fit' ? "opacity-20 pointer-events-none grayscale" : "opacity-100")}>
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2 mb-3">
                                    <Layout className="size-3" /> Absolute Alignment
                                </Label>
                                <div className="grid grid-cols-1 gap-2">
                                    <button 
                                        className={cn(
                                            "btn-pos-uiverse h-14 relative group !ring-[3px] !ring-slate-950 dark:!ring-white", 
                                            selectedPage?.vAlign === 'top' && "active-uiverse"
                                        )} 
                                        data-label="      Top"
                                        onClick={() => updateSelectedPage({ vAlign: 'top' })}
                                    >
                                        <AlignVerticalJustifyStart className="absolute left-4 top-1/2 -translate-y-1/2 size-5 z-30 text-slate-900 group-hover:text-white transition-colors" />
                                    </button>
                                    <button 
                                        className={cn(
                                            "btn-pos-uiverse h-14 relative group !ring-[3px] !ring-slate-950 dark:!ring-white", 
                                            selectedPage?.vAlign === 'center' && "active-uiverse"
                                        )} 
                                        data-label="      Center"
                                        onClick={() => updateSelectedPage({ vAlign: 'center' })}
                                    >
                                        <AlignVerticalJustifyCenter className="absolute left-4 top-1/2 -translate-y-1/2 size-5 z-30 text-slate-900 group-hover:text-white transition-colors" />
                                    </button>
                                    <button 
                                        className={cn(
                                            "btn-pos-uiverse h-14 relative group !ring-[3px] !ring-slate-950 dark:!ring-white", 
                                            selectedPage?.vAlign === 'bottom' && "active-uiverse"
                                        )} 
                                        data-label="      Bottom"
                                        onClick={() => updateSelectedPage({ vAlign: 'bottom' })}
                                    >
                                        <AlignVerticalJustifyEnd className="absolute left-4 top-1/2 -translate-y-1/2 size-5 z-30 text-slate-900 group-hover:text-white transition-colors" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t-2 border-dashed border-border">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-3">
                                    <RotateCw className="size-3" /> Orientation
                                </Label>
                                <div className="grid gap-3">
                                    <Button variant="outline" className="w-full h-11 rounded-xl border-2 font-black text-xs uppercase shadow-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300" onClick={rotateSelectedPage} disabled={!selectedId || isProcessing}>
                                        <RotateCw className="size-4 mr-2" /> Rotate Page 90°
                                    </Button>
                                    <Button variant="outline" className="w-full h-11 rounded-xl border-2 font-black text-xs uppercase shadow-sm text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300" onClick={rotateAllPages} disabled={pages.length < 2 || isProcessing}>
                                        <Layers className="size-4 mr-2" /> Rotate All 90°
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t-2 border-dashed border-border">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-3">
                                    <ListFilter className="size-3" /> Number of Pages
                                </Label>
                                <Tabs value={pageRangeMode} onValueChange={(v) => setPageRangeMode(v as any)} className="w-full">
                                    <TabsList className="grid grid-cols-2 h-11 bg-background p-1 rounded-xl border-2">
                                        <TabsTrigger value="all" className="font-bold text-[9px] uppercase">All Pages</TabsTrigger>
                                        <TabsTrigger value="custom" className="font-bold text-[9px] uppercase">Custom Range</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                {pageRangeMode === 'custom' && (
                                    <Input 
                                        value={customRange} 
                                        onChange={(e) => setCustomRange(e.target.value)}
                                        placeholder="e.g. 1-5, 8, 10" 
                                        className="h-11 font-bold border-2 rounded-xl text-center shadow-inner"
                                    />
                                )}
                            </div>

                            <div className="space-y-4 pt-4 border-t-2 border-dashed border-border">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Sync Control</Label>
                                <Button variant="outline" className="w-full h-10 border-2 font-black text-[9px] uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all duration-300" onClick={applyToAll} disabled={pages.length < 2 || isProcessing}>
                                    <RefreshCcw className="size-3.5 mr-2" /> Apply Alignment to All
                                </Button>
                            </div>
                        </div>

                        <div className="pt-6 border-t-2 border-dashed border-border mt-auto">
                            <Button 
                                size="lg" 
                                className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-18 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none w-full" 
                                onClick={handleDownloadAll} 
                                disabled={pages.length === 0 || isZipping || isProcessing}
                            >
                                <div className="absolute left-4 w-0.5 h-6 md:h-8 bg-white/40 rounded-full" />
                                <span className="flex-1 px-10 text-center tracking-widest text-[11px] md:text-sm uppercase">
                                    {isZipping ? "ZIPPING..." : "EXTRACT IMAGES"}
                                </span>
                                <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                    {isZipping ? <Loader2 className="size-6 animate-spin" /> : <Download className="size-6 group-hover:scale-110 transition-transform" />}
                                    <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                                </div>
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT VIEWPORT: GRID OF PAGES */}
                    <div className="lg:col-span-8 bg-slate-200 dark:bg-slate-900 flex flex-col h-[700px] lg:h-[850px] relative shadow-inner">
                        <ScrollArea className="flex-1 w-full h-full p-6 md:p-10">
                            {isProcessing && pages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-40 gap-8">
                                    <div className="relative">
                                        <Loader2 className="h-20 w-20 animate-spin text-primary opacity-20 stroke-[3]" />
                                        <Monitor className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                                    </div>
                                    <div className="space-y-3 w-full max-w-[280px] text-center">
                                        <p className="font-black text-lg text-primary uppercase tracking-widest animate-pulse">Rendering PDF Pages...</p>
                                        <Progress value={progress} className="h-1.5 shadow-inner" />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                    <AnimatePresence>
                                        {pages.map((p) => (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                                key={p.id} 
                                                onClick={() => setSelectedId(p.id)}
                                                className={cn(
                                                    "group relative aspect-[1/1.414] rounded-xl overflow-hidden border-2 transition-all cursor-pointer transform active:scale-95 bg-white flex flex-col p-0 shadow-xl",
                                                    selectedId === p.id ? "border-primary ring-4 ring-primary/20 scale-105 z-10 shadow-primary/30" : "hover:border-primary/40 border-transparent"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute inset-0 flex flex-col w-full h-full p-1 transition-all duration-300 justify-center"
                                                )}>
                                                    <img 
                                                        src={p.finalSrc} 
                                                        alt={`P${p.index}`} 
                                                        className={cn(
                                                            "w-full object-contain pointer-events-none mx-auto block shadow-sm",
                                                            p.fitMode === 'original' ? "max-h-[90%]" : "max-h-full"
                                                        )}
                                                    />
                                                </div>
                                                
                                                <div className="absolute top-2 left-2 size-7 rounded-lg bg-black/70 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white border border-white/10 z-20">
                                                    {p.index}
                                                </div>
                                                
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                                                
                                                <div className="absolute bottom-2 right-2 z-20 transition-all">
                                                    <Button size="icon" className="h-8 w-8 rounded-lg bg-green-600 hover:bg-green-700 shadow-2xl border-2 border-white/20" onClick={(e) => { e.stopPropagation(); const l=document.createElement('a'); l.href=p.finalSrc; l.download=`page-${p.index}.jpg`; l.click(); }}>
                                                        <Download className="size-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    
                                    <button 
                                        className="aspect-[1/1.414] border-2 border-dashed border-primary/20 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all aspect-[1/1.414] shadow-inner group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Plus className="size-6 text-primary" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">Add PDF</span>
                                    </button>
                                </div>
                            )}
                            <ScrollBar />
                        </ScrollArea>
                        
                        {(pages.length > 0 || isProcessing) && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full max-w-sm px-8">
                                {isProcessing && (
                                    <div className="w-full space-y-1.5 animate-in slide-in-from-bottom-4">
                                        <div className="flex justify-between items-center text-[8px] font-black uppercase text-primary">
                                            <span>Processing Queue</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <Progress value={progress} className="h-1.5 shadow-xl border border-white/20" />
                                    </div>
                                )}
                                <div className="flex items-center gap-4 px-8 py-3 bg-black/80 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 shadow-3xl z-40">
                                     <MousePointer2 className="size-3.5 text-primary animate-pulse" /> Click pages to adjust
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
            
            <CardFooter className="bg-white dark:bg-slate-950 border-t p-5 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 shrink-0">
                <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM PROCESSING</div>
                <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> SEQUENTIAL MEMORY LOCK</div>
                <div className="flex items-center gap-2"><ImageIcon className="size-4 text-primary" /> LOSSLESS VECTORS</div>
            </CardFooter>
            <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
        </Card>
    );
}
