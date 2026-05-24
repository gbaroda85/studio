
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
  FileArchive,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  Maximize,
  MousePointer2,
  Layout,
  Loader2,
  Layers
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
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

    const renderProcessedImage = useCallback((originalSrc: string, vAlign: VAlign, fitMode: FitMode): Promise<string> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.src = originalSrc;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { alpha: true });
                if (!ctx) return resolve(originalSrc);

                if (fitMode === 'original') {
                    // Standard A4 Ratio Coordinate System
                    const targetW = img.width;
                    const targetH = Math.round(targetW * 1.414); 
                    canvas.width = targetW;
                    canvas.height = targetH;
                    
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Scale to 90% for visible movement
                    const scale = 0.9;
                    const dw = img.width * scale;
                    const dh = img.height * scale;
                    const dx = (canvas.width - dw) / 2;
                    
                    let dy;
                    if (vAlign === 'top') dy = 0; // Literal Top Edge
                    else if (vAlign === 'bottom') dy = canvas.height - dh; // Literal Bottom Edge
                    else dy = (canvas.height - dh) / 2; // Center
                    
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
            const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            const newPages: PageItem[] = [];
            const totalPages = pdf.numPages;

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.5 }); 
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = Math.floor(viewport.height);
                canvas.width = Math.floor(viewport.width);
                
                if (context) {
                    context.fillStyle = '#FFFFFF';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    const src = canvas.toDataURL(`image/${outputFormat === 'jpeg' ? 'jpeg' : 'png'}`, 1.0);
                    const id = Math.random().toString(36).substr(2, 9);
                    newPages.push({
                        id,
                        originalSrc: src,
                        finalSrc: src,
                        vAlign: 'center',
                        fitMode: 'fit',
                        index: i
                    });
                }
                setProgress(Math.round((i / totalPages) * 100));
            }
            setPages(newPages);
            if (newPages.length > 0) setSelectedId(newPages[0].id);
            toast({ title: 'Extraction Success', description: `Rendered ${newPages.length} pages in HD.` });
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

    const applyToAll = async () => {
        const selected = pages.find(p => p.id === selectedId);
        if (!selected) return;
        
        setIsProcessing(true);
        const updatedPages = await Promise.all(pages.map(async (p) => {
            const final = await renderProcessedImage(p.originalSrc, selected.vAlign, selected.fitMode);
            return { ...p, vAlign: selected.vAlign, fitMode: selected.fitMode, finalSrc: final };
        }));
        
        setPages(updatedPages);
        setIsProcessing(false);
        toast({ title: "Strict Layout Sync", description: "Literal extraction applied to all pages." });
    };

    const handleDownloadSingle = (url: string, index: number) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `strictly-aligned-page-${index + 1}.${outputFormat === 'jpeg' ? 'jpg' : 'png'}`;
        link.click();
    }

    const handleDownloadAll = async () => {
        if (pages.length === 0 || !pdfFile) return;
        setIsZipping(true);
        try {
            const zip = new JSZip();
            const ext = outputFormat === 'jpeg' ? 'jpg' : 'png';
            pages.forEach((p) => {
                const base64Data = p.finalSrc.split(',')[1];
                zip.file(`strictly-aligned-page-${p.index}.${ext}`, base64Data, { base64: true });
            });
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `hd-extracted-docs.zip`;
            link.click();
            toast({ title: 'Extraction Bundle Ready', description: 'All pages strictly aligned and zipped.' });
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
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const selectedPage = pages.find(p => p.id === selectedId);

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-2 shadow-2xl overflow-hidden bg-card/50">
                        <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">Extraction Studio</CardTitle>
                                <CardDescription className="truncate max-w-md font-mono text-[10px] mt-1">{pdfFile.name}</CardDescription>
                            </div>
                            {pages.length > 0 && <Badge className="bg-primary">{pages.length} PAGES</Badge>}
                        </CardHeader>
                        <CardContent className="p-6">
                            {isProcessing && pages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-8 text-center">
                                    <Loader2 className="h-20 w-20 animate-spin text-primary stroke-[3]" />
                                    <div className="space-y-4 w-full max-w-sm">
                                        <p className="font-black text-2xl text-primary animate-pulse uppercase tracking-tighter">Rendering PDF Layers...</p>
                                        <Progress value={progress} className="h-2" />
                                    </div>
                                </div>
                            ) : (
                                <ScrollArea className="h-[550px] pr-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
                                        {pages.map((p) => (
                                            <div key={p.id} onClick={() => setSelectedId(p.id)}
                                                className={cn(
                                                    "group relative aspect-[1/1.414] rounded-xl overflow-hidden border-2 transition-all cursor-pointer transform active:scale-95 flex flex-col p-0 bg-white",
                                                    selectedId === p.id ? "border-primary ring-4 ring-primary/20 scale-105 z-10 shadow-xl" : "hover:border-primary/30"
                                                )}>
                                                
                                                {/* Literal Absolute Clamping Wrapper */}
                                                <div className="flex-1 relative w-full h-full bg-white overflow-hidden p-0">
                                                    <div className={cn(
                                                        "absolute w-full h-full flex flex-col transition-all duration-300",
                                                        p.vAlign === 'top' ? 'justify-start' : p.vAlign === 'bottom' ? 'justify-end' : 'justify-center'
                                                    )}>
                                                        <img 
                                                            src={p.finalSrc} 
                                                            alt={`page-${p.index}`} 
                                                            className="max-w-full max-h-[90%] object-contain pointer-events-none mx-auto"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="absolute top-2 left-2 size-7 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white z-20">{p.index}</div>
                                                
                                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                    <Button size="icon" className="h-8 w-8 rounded-lg bg-green-600 shadow-lg" onClick={(e) => { e.stopPropagation(); handleDownloadSingle(p.finalSrc, p.index-1); }}>
                                                        <Download className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                        <CardFooter className="bg-muted/10 border-t p-4 flex justify-between items-center">
                            <Button variant="ghost" onClick={handleReset} className="text-xs font-black uppercase text-destructive hover:bg-destructive/10"><RefreshCcw className="mr-2 h-4 w-4" /> Start Over</Button>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                                <ShieldCheck className="h-4 w-4 text-green-500" /> SECURE LOCAL RENDERING
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-2 shadow-xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950">
                        <CardHeader className="bg-primary/5 border-b p-6">
                            <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                                <Layout className="size-6 text-primary" /> Extraction Panel
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {!selectedId ? (
                                <div className="py-12 text-center space-y-4 opacity-40">
                                     <MousePointer2 className="size-12 mx-auto text-muted-foreground" />
                                     <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Select a page thumbnail<br/>to strictly align</p>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                <Maximize className="size-3" /> Canvas Strategy
                                            </Label>
                                            <Badge variant="secondary" className="font-black text-[8px] uppercase">A4 Standard</Badge>
                                        </div>
                                        <Tabs value={selectedPage?.fitMode} onValueChange={(v) => updateSelectedPage({ fitMode: v as FitMode })} className="w-full">
                                            <TabsList className="grid grid-cols-2 h-12 bg-muted p-1 rounded-xl">
                                                <TabsTrigger value="fit" className="font-bold text-[10px] uppercase">Page Data Only</TabsTrigger>
                                                <TabsTrigger value="original" className="font-bold text-[10px] uppercase">A4 Canvas</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t-2 border-dashed">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <AlignVerticalJustifyCenter className="size-3" /> Absolute Position
                                        </Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button variant={selectedPage?.vAlign === 'top' ? 'default' : 'outline'} className="h-16 flex-col gap-1 rounded-xl border-2" onClick={() => updateSelectedPage({ vAlign: 'top' })}>
                                                <AlignVerticalJustifyStart className="size-5" />
                                                <span className="text-[8px] font-black uppercase">Literal Top</span>
                                            </Button>
                                            <Button variant={selectedPage?.vAlign === 'center' ? 'default' : 'outline'} className="h-16 flex-col gap-1 rounded-xl border-2" onClick={() => updateSelectedPage({ vAlign: 'center' })}>
                                                <AlignVerticalJustifyCenter className="size-5" />
                                                <span className="text-[8px] font-black uppercase">Center</span>
                                            </Button>
                                            <Button variant={selectedPage?.vAlign === 'bottom' ? 'default' : 'outline'} className="h-16 flex-col gap-1 rounded-xl border-2" onClick={() => updateSelectedPage({ vAlign: 'bottom' })}>
                                                <AlignVerticalJustifyEnd className="size-5" />
                                                <span className="text-[8px] font-black uppercase">Literal Bottom</span>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t-2 border-dashed">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Image Format</Label>
                                        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                                            <SelectTrigger className="h-12 font-bold rounded-xl border-2"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="png">PNG (Lossless)</SelectItem>
                                                <SelectItem value="jpeg">JPEG (Optimized)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button variant="outline" className="w-full h-10 border-2 font-black text-[9px] uppercase tracking-widest text-primary hover:bg-primary/5" onClick={applyToAll}>
                                        <Layers className="size-3 mr-2" /> Global Sync Alignment
                                    </Button>
                                </div>
                            )}

                            <div className="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10 flex gap-4">
                                <Zap className="size-6 text-yellow-500 shrink-0" />
                                <p className="text-[10px] text-primary/80 font-bold leading-relaxed">
                                    <span className="font-black uppercase block mb-1 text-primary">STRICT EXTRACTION:</span>
                                    Pages are pushed to the literal boundary of the canvas. 0-pixel gap logic enabled.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-8 border-t-2">
                            <Button className="w-full h-20 text-xl font-black bg-green-600 hover:bg-green-700 shadow-2xl rounded-2xl transition-all active:scale-95 disabled:opacity-50" 
                                    onClick={handleDownloadAll} disabled={pages.length === 0 || isZipping}>
                                {isZipping ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="size-8 animate-spin" />
                                        <span className="uppercase tracking-tighter">ZIPPING...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <FileArchive className="size-9" />
                                        <div className="text-left">
                                            <span className="block uppercase tracking-tighter leading-none">EXTRACT ALL</span>
                                            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">ZIP ARCHIVE ({pages.length})</span>
                                        </div>
                                    </div>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
