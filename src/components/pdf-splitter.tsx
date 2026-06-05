"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    Scissors, 
    X, 
    CheckCircle2, 
    Eye, 
    LayoutGrid, 
    RefreshCcw,
    MousePointer2,
    Zap,
    ShieldCheck,
    Settings2,
    Sparkles,
    SearchCode,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

// Bundle-safe worker URL
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs`;
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

function generateRangeString(selectedPages: number[]): string {
    if (selectedPages.length === 0) return '';
    const sorted = [...selectedPages].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];

    for (let i = 1; i <= sorted.length; i++) {
        if (i < sorted.length && sorted[i] === end + 1) {
            end = sorted[i];
        } else {
            if (start === end) {
                ranges.push(`${start}`);
            } else {
                ranges.push(`${start}-${end}`);
            }
            if (i < sorted.length) {
                start = sorted[i];
                end = sorted[i];
            }
        }
    }
    return ranges.join(', ');
}

export default function PdfSplitter() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [pageRanges, setPageRanges] = useState('');
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [splitPdfUrl, setSplitPdfUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        return () => {
            if (splitPdfUrl) URL.revokeObjectURL(splitPdfUrl);
        }
    }, [splitPdfUrl]);

    const handleRangeInputChange = (value: string) => {
        setPageRanges(value);
        if (splitPdfUrl) {
            URL.revokeObjectURL(splitPdfUrl);
            setSplitPdfUrl(null);
        }
        const parsed = parsePageRanges(value, totalPages);
        setSelectedPages(parsed);
    };

    const togglePageSelection = (pageNum: number) => {
        if (splitPdfUrl) {
            URL.revokeObjectURL(splitPdfUrl);
            setSplitPdfUrl(null);
        }
        setSelectedPages(prev => {
            const next = prev.includes(pageNum) 
                ? prev.filter(p => p !== pageNum) 
                : [...prev, pageNum];
            setPageRanges(generateRangeString(next));
            return next;
        });
    };

    const handleFileChange = async (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setPageRanges('');
            setSelectedPages([]);
            setPreviews([]);
            setSplitPdfUrl(null);
            setIsRendering(true);

            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                setTotalPages(pdf.numPages);

                const newPreviews: string[] = [];
                const pagesToRender = Math.min(pdf.numPages, 100); 
                
                for (let i = 1; i <= pagesToRender; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 0.6 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    if (context) {
                        context.fillStyle = '#FFFFFF';
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        await page.render({ canvasContext: context, viewport: viewport }).promise;
                        newPreviews.push(canvas.toDataURL('image/jpeg', 0.8));
                    }
                }
                setPreviews(newPreviews);
            } catch (e) {
                console.error(e);
                toast({ variant: 'destructive', title: 'Error Reading PDF', description: 'Could not render previews.' });
            } finally {
                setIsRendering(false);
            }
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a PDF file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const handleSplitPdf = async () => {
        if (!pdfFile) return;
        
        const pagesToExtract = parsePageRanges(pageRanges, totalPages);
        if (pagesToExtract.length === 0) {
            toast({ variant: 'destructive', title: 'Invalid Pages', description: 'Please select or enter valid page numbers.' });
            return;
        }
        
        setIsProcessing(true);

        try {
            const pdfBytes = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const newPdfDoc = await PDFDocument.create();

            const pageIndices = pagesToExtract.map(p => p - 1);
            const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach(page => newPdfDoc.addPage(page));

            const newPdfBytes = await newPdfDoc.save();
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setSplitPdfUrl(url);
            
            toast({title: 'Success!', description: `Created a new PDF with ${pagesToExtract.length} pages.`});

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error Splitting PDF', description: 'Check file permissions.' });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDownload = () => {
        if (!splitPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = splitPdfUrl;
        link.download = `GR7-Tools-split-${pdfFile.name}`;
        link.click();
    }
    
    const resetState = () => {
        setPdfFile(null);
        setTotalPages(0);
        setPreviews([]);
        setPageRanges('');
        setSelectedPages([]);
        if (splitPdfUrl) URL.revokeObjectURL(splitPdfUrl);
        setSplitPdfUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
    
    if (!pdfFile) {
        return (
            <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
                <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
                    <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
                        <Scissors className="size-8" />
                        <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                            <Sparkles className="size-2.5" />
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                        PDF <span className="text-gradient-hero">Split Studio</span>
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                        Extract specific pages visually. <br/>100% Private local RAM processing.
                    </p>
                </div>

                <Card className={cn(
                    "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20",
                    isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                )}
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <CardHeader className="bg-muted/30 border-b p-6 text-center">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12">
                        <div 
                        className={cn(
                            "border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                        >
                        <div className="relative">
                            <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Zap className="absolute -top-1 -right-1 size-6 md:size-8 text-yellow-500 animate-pulse" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">Drop PDF to Split</p>
                            <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">Visual Selection Enabled</p>
                        </div>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                    </CardContent>
                    <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                        <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                        <div className="flex items-center gap-1.5"><SearchCode className="size-3 text-primary" /> INDEX SCAN</div>
                        <div className="flex items-center gap-1.5"><Eye className="size-3 text-rose-500" /> VISUAL CROP</div>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    return (
        <Card className="w-full max-w-7xl shadow-3xl border-foreground/10 overflow-hidden bg-card/50 rounded-[2.5rem]">
            <CardHeader className="bg-muted/30 border-b flex flex-col md:flex-row items-center justify-between p-4 md:p-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20"><Settings2 className="size-5" /></div>
                    <CardTitle className="text-xl font-black uppercase tracking-tighter">Split Panel</CardTitle>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {isRendering && <Loader2 className="size-4 animate-spin text-primary" />}
                        <Badge className="bg-primary text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-md">{totalPages} PAGES DETECTED</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-destructive/5 text-destructive" onClick={resetState}><X className="size-4"/></Button>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="grid lg:grid-cols-12">
                    {/* LEFT SIDEBAR: CONTROLS */}
                    <div className="lg:col-span-4 border-r bg-muted/20 p-6 space-y-8 no-print">
                        <div className="space-y-8 animate-in slide-in-from-left duration-300">
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <LayoutGrid className="size-3" /> Page Range Entry
                                </Label>
                                <Input 
                                    value={pageRanges} 
                                    onChange={(e) => handleRangeInputChange(e.target.value)}
                                    placeholder="e.g. 1-3, 5, 8"
                                    className="h-14 text-xl font-black border-2 rounded-2xl bg-background shadow-inner text-center focus-visible:ring-primary/20"
                                />
                                <p className="text-[9px] text-muted-foreground font-bold uppercase opacity-60 leading-relaxed">
                                    Type ranges or click thumbnails on the right to select.
                                </p>
                             </div>

                             <AnimatePresence>
                                {selectedPages.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-5 bg-green-500/5 rounded-[1.5rem] border-2 border-green-500/10 flex gap-4">
                                        <CheckCircle2 className="size-6 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">Selection Active</p>
                                            <p className="text-[9px] text-green-600/80 font-medium leading-tight mt-1 uppercase">
                                                {selectedPages.length} {selectedPages.length === 1 ? 'page' : 'pages'} ready for extraction.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                             </AnimatePresence>
                        </div>

                        <div className="pt-6 border-t-2 border-dashed">
                             {!splitPdfUrl ? (
                                <Button 
                                    className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all active:scale-95 disabled:opacity-50 group" 
                                    onClick={handleSplitPdf} 
                                    disabled={selectedPages.length === 0 || isProcessing}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="size-6 md:size-8 animate-spin" />
                                            <span className="uppercase text-sm tracking-tighter">EXTRACTING...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Scissors className="size-6 md:size-8 text-white/50 group-hover:scale-125 transition-transform" />
                                            <span className="uppercase tracking-tighter">EXTRACT PAGES</span>
                                        </div>
                                    )}
                                </Button>
                             ) : (
                                <Button onClick={handleDownload} className="w-full h-16 text-lg font-black bg-green-600 hover:bg-green-700 shadow-2xl rounded-2xl transition-all active:scale-95 group">
                                    <Download className="mr-3 size-6 group-hover:translate-y-1 transition-transform" /> SAVE NEW PDF
                                </Button>
                             )}
                        </div>
                        
                        <Button variant="ghost" onClick={resetState} className="w-full h-10 border-2 font-black text-[9px] uppercase tracking-widest text-muted-foreground/60 hover:text-destructive hover:bg-destructive/5 rounded-xl">
                            <RefreshCcw className="size-3.5 mr-2" /> Start New Split
                        </Button>

                        <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 flex gap-4">
                            <ShieldCheck className="size-5 text-primary shrink-0" />
                            <p className="text-[9px] text-primary/80 font-bold leading-relaxed uppercase">
                                <span className="font-black block mb-0.5 text-primary">SECURE RAM:</span>
                                Your document is rendered and split entirely on your device.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT VIEWPORT: GRID OF PAGES */}
                    <div className="lg:col-span-8 bg-slate-200 dark:bg-slate-900 flex flex-col h-[700px] md:h-[850px] relative shadow-inner">
                        <ScrollArea className="flex-1 p-6 md:p-10">
                            {isRendering && previews.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-40 gap-6">
                                    <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20 stroke-[3]" />
                                    <p className="text-sm font-black text-primary uppercase tracking-[0.3em] animate-pulse">Scanning Document Index...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                    {Array.from({ length: totalPages }).map((_, i) => {
                                        const pageNum = i + 1;
                                        const isSelected = selectedPages.includes(pageNum);
                                        const hasPreview = previews[i];

                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                                key={pageNum}
                                                onClick={() => togglePageSelection(pageNum)}
                                                className={cn(
                                                    "group relative aspect-[1/1.414] rounded-xl overflow-hidden border-2 transition-all cursor-pointer transform active:scale-95 bg-white shadow-xl",
                                                    isSelected ? "border-primary ring-4 ring-primary/20 scale-105 z-10 shadow-primary/30" : "hover:border-primary/40 border-transparent"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-2 left-2 size-7 rounded-lg flex items-center justify-center text-[10px] font-black z-20 border transition-colors",
                                                    isSelected ? "bg-primary text-white border-white/20" : "bg-black/60 text-white backdrop-blur-md border-white/10"
                                                )}>
                                                    {pageNum}
                                                </div>

                                                <div className="size-full flex items-center justify-center p-1 bg-white">
                                                    {hasPreview ? (
                                                        <img 
                                                            src={hasPreview} 
                                                            alt={`P${pageNum}`} 
                                                            className={cn("w-full h-full object-contain transition-all duration-500", !isSelected && "opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0")} 
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-muted-foreground/20">
                                                            <Loader2 className="size-6 animate-spin" />
                                                        </div>
                                                    )}
                                                </div>

                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-primary/5 pointer-events-none z-10 animate-in fade-in" />
                                                )}
                                                
                                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all z-20 translate-y-2 group-hover:translate-y-0">
                                                     <div className={cn("size-7 rounded-lg flex items-center justify-center shadow-2xl border-2 border-white", isSelected ? "bg-red-500 text-white" : "bg-primary text-white")}>
                                                        {isSelected ? <X className="size-4" /> : <Plus className="size-4" />}
                                                     </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                            <ScrollBar />
                        </ScrollArea>
                        
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-3 bg-black/80 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 shadow-3xl z-40">
                             <MousePointer2 className="size-3.5 text-primary animate-pulse" /> Click pages to bundle
                        </div>
                    </div>
                </div>
            </CardContent>
            
            <CardFooter className="bg-white dark:bg-slate-950 border-t p-5 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM PROCESSING</div>
                <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> NATIVE WASM SPEED</div>
                <div className="flex items-center gap-2"><Eye className="size-4 text-primary" /> VISUAL SELECTION</div>
            </CardFooter>
        </Card>
    );
}
