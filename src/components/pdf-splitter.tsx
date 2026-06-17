
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect, useCallback } from 'react';
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
    Plus, 
    Trash2,
    ImageIcon,
    FileText,
    Maximize,
    Monitor,
    FileDigit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

// Bundle-safe worker URL
const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
}

interface PagePreview {
    id: string;
    src: string;
    originalFile: File;
    pageIndex: number; // 0-based for PDFs, always 0 for Images
    type: 'pdf' | 'image';
}

const StarIcons = () => (
    <>
        <div className="star-1">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-2">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-3">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-4">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-5">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-6">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
    </>
);

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

function generateRangeString(selectedIndices: number[]): string {
    if (selectedIndices.length === 0) return '';
    const sorted = [...selectedIndices].map(i => i + 1).sort((a, b) => a - b);
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
    const [pageRanges, setPageRanges] = useState('');
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [previews, setPreviews] = useState<PagePreview[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [splitPdfUrl, setSplitPdfUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Cancellation token for background rendering
    const renderIdRef = useRef(0);

    useEffect(() => {
        return () => {
            if (splitPdfUrl) URL.revokeObjectURL(splitPdfUrl);
        }
    }, [splitPdfUrl]);

    const resetState = useCallback(() => {
        renderIdRef.current++; // Signal abort for any active processFiles loop
        setPreviews([]);
        setPageRanges('');
        setSelectedIndices([]);
        if (splitPdfUrl) URL.revokeObjectURL(splitPdfUrl);
        setSplitPdfUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsRendering(false);
        setIsProcessing(false);
    }, [splitPdfUrl]);

    const handleRangeInputChange = (value: string) => {
        setPageRanges(value);
        if (splitPdfUrl) {
            URL.revokeObjectURL(splitPdfUrl);
            setSplitPdfUrl(null);
        }
        const parsed = parsePageRanges(value, previews.length);
        setSelectedIndices(parsed.map(p => p - 1));
    };

    const togglePageSelection = (index: number) => {
        if (splitPdfUrl) {
            URL.revokeObjectURL(splitPdfUrl);
            setSplitPdfUrl(null);
        }
        setSelectedIndices(prev => {
            const next = prev.includes(index) 
                ? prev.filter(i => i !== index) 
                : [...prev, index];
            setPageRanges(generateRangeString(next));
            return next;
        });
    };

    const processFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsRendering(true);
        setSplitPdfUrl(null);

        const currentRenderId = ++renderIdRef.current;
        const filesArray = Array.from(files);

        for (const file of filesArray) {
            if (currentRenderId !== renderIdRef.current) break;

            if (file.type === 'application/pdf') {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    if (currentRenderId !== renderIdRef.current) break;

                    const pdf = await pdfjs.getDocument({ 
                        data: new Uint8Array(arrayBuffer),
                        cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                        cMapPacked: true
                    }).promise;
                    
                    const totalFilePages = pdf.numPages;

                    for (let i = 1; i <= totalFilePages; i++) {
                        if (currentRenderId !== renderIdRef.current) break;

                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 1.0 });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        
                        if (context) {
                            context.fillStyle = '#FFFFFF';
                            context.fillRect(0, 0, canvas.width, canvas.height);
                            await page.render({ canvasContext: context, viewport: viewport }).promise;
                            
                            if (currentRenderId !== renderIdRef.current) break;

                            const newPage: PagePreview = {
                                id: Math.random().toString(36).substr(2, 9),
                                src: canvas.toDataURL('image/jpeg', 0.75),
                                originalFile: file,
                                pageIndex: i - 1,
                                type: 'pdf'
                            };

                            setPreviews(prev => [...prev, newPage]);
                        }
                    }
                } catch (e) {
                    toast({ variant: 'destructive', title: 'Error Reading PDF', description: file.name });
                }
            } else if (file.type.startsWith('image/')) {
                try {
                    const reader = new FileReader();
                    const dataUrl = await new Promise<string>((resolve) => {
                        reader.onload = (e) => resolve(e.target?.result as string);
                        reader.readAsDataURL(file);
                    });
                    if (currentRenderId !== renderIdRef.current) break;
                    const newImage: PagePreview = {
                        id: Math.random().toString(36).substr(2, 9),
                        src: dataUrl,
                        originalFile: file,
                        pageIndex: 0,
                        type: 'image'
                    };
                    setPreviews(prev => [...prev, newImage]);
                } catch (e) {
                    toast({ variant: 'destructive', title: 'Error Reading Image', description: file.name });
                }
            }
        }

        if (currentRenderId === renderIdRef.current) {
            setIsRendering(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => processFiles(e.target.files);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); processFiles(e.dataTransfer.files); };

    const handleSplitPdf = async () => {
        if (selectedIndices.length === 0) {
            toast({ variant: 'destructive', title: 'No Selection', description: 'Please select pages to extract.' });
            return;
        }
        
        setIsProcessing(true);

        try {
            const newPdfDoc = await PDFDocument.create();
            const fileBuffers = new Map<string, ArrayBuffer>();

            for (const index of selectedIndices) {
                const item = previews[index];
                
                if (item.type === 'pdf') {
                    if (!fileBuffers.has(item.originalFile.name)) {
                        fileBuffers.set(item.originalFile.name, await item.originalFile.arrayBuffer());
                    }
                    const sourcePdf = await PDFDocument.load(fileBuffers.get(item.originalFile.name)!);
                    const [copiedPage] = await newPdfDoc.copyPages(sourcePdf, [item.pageIndex]);
                    newPdfDoc.addPage(copiedPage);
                } else {
                    const imgBuffer = await item.originalFile.arrayBuffer();
                    const isPng = item.originalFile.type === 'image/png';
                    const embeddedImg = isPng ? await newPdfDoc.embedPng(imgBuffer) : await newPdfDoc.embedJpg(imgBuffer);
                    
                    const page = newPdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
                    page.drawImage(embeddedImg, { x: 0, y: 0, width: embeddedImg.width, height: embeddedImg.height });
                }
            }

            const newPdfBytes = await newPdfDoc.save();
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setSplitPdfUrl(url);
            toast({ title: 'Extraction Success!', description: `Created a new PDF with ${selectedIndices.length} pages.` });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error Generating PDF', description: 'Check file contents.' });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDownload = () => {
        if (!splitPdfUrl) return;
        const link = document.createElement('a');
        link.href = splitPdfUrl;
        link.download = `GR7-Tools-Bundle-${Date.now()}.pdf`;
        link.click();
    };

    if (previews.length === 0 && !isRendering) {
        return (
            <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4 mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 mb-4">
                    <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
                        <Scissors className="size-8" />
                        <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                            <Sparkles className="size-2.5" />
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                        SPLIT PDF <span className="text-gradient-hero">STUDIO</span>
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                        Extract specific pages or combine multiple documents. <br/>100% Private high-fidelity local mapping.
                    </p>
                </motion.div>

                <Card className={cn(
                    "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 dark:hover:shadow-primary/20 cursor-pointer select-none",
                    isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                )}
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <CardHeader className="bg-muted/30 border-b p-6 text-center">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12">
                        <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center space-y-4 bg-muted/30 group relative">
                            <div className="relative">
                                <UploadCloud className="size-12 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                            </div>
                            <div className="text-center px-4">
                                <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop PDF or Images here</p>
                                <p className="text-[10px] md:text-sm text-muted-foreground mt-1 font-bold opacity-60 uppercase tracking-widest">Local extraction active.</p>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/*" multiple onChange={handleFileChange} />
                    </CardContent>
                    <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                        <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                        <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT CROP</div>
                        <div className="flex items-center gap-1.5"><FileDigit className="size-3 text-primary" /> PRO BUNDLING</div>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    return (
        <Card className="w-full max-w-7xl shadow-3xl border-foreground/10 overflow-hidden bg-card/50 rounded-[2.5rem]">
            <CardHeader className="bg-muted/30 border-b flex flex-col md:flex-row items-center justify-between p-4 md:p-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                        <Settings2 className="size-5" />
                    </div>
                    <CardTitle className="text-xl font-black uppercase tracking-tighter">SPLIT PDF STUDIO</CardTitle>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {isRendering && <Loader2 className="size-4 animate-spin text-primary" />}
                        {previews.length > 0 && <Badge className="bg-primary text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-md">{previews.length} TOTAL PAGES</Badge>}
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-destructive/5 text-destructive" onClick={resetState}><X className="size-4"/></Button>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="grid lg:grid-cols-12">
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
                                <p className="text-[9px] text-muted-foreground font-bold uppercase opacity-60 leading-relaxed text-left">
                                    Type ranges or click thumbnails on the right to select pages.
                                </p>
                             </div>

                             <AnimatePresence>
                                {selectedIndices.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-5 bg-green-500/5 rounded-[1.5rem] border-2 border-green-500/10 flex gap-4 text-left">
                                        <CheckCircle2 className="size-6 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">Bundle Ready</p>
                                            <p className="text-[9px] text-green-600/80 font-medium leading-tight mt-1 uppercase">
                                                {selectedIndices.length} {selectedIndices.length === 1 ? 'page' : 'pages'} selected for extraction.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                             </AnimatePresence>
                        </div>

                        <div className="pt-6 border-t-2 border-dashed flex flex-col gap-3">
                             {!splitPdfUrl ? (
                                <Button 
                                    className="magic-button w-full h-16 md:h-18 text-lg font-black bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group flex items-center justify-center gap-4 px-10 shadow-xl" 
                                    onClick={handleSplitPdf} 
                                    disabled={selectedIndices.length === 0 || isProcessing}
                                >
                                    <StarIcons />
                                    {isProcessing ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="size-6 md:size-8 animate-spin" />
                                            <span className="uppercase text-sm tracking-tighter">PROCESSING...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Scissors className="size-7 md:size-8 text-white/50 group-hover:scale-125 transition-transform" />
                                            <span className="uppercase tracking-tighter">EXTRACT PAGES</span>
                                        </div>
                                    )}
                                </Button>
                             ) : (
                                <Button 
                                    size="lg" 
                                    className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-18 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none animate-in zoom-in-95" 
                                    onClick={handleDownload}
                                >
                                    <div className="absolute left-4 w-0.5 h-6 md:h-8 bg-white/40 rounded-full" />
                                    <span className="flex-1 px-10 text-center tracking-widest text-[11px] md:text-xs uppercase">SAVE NEW PDF</span>
                                    <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                        <Download className="size-6 md:size-8 group-hover:scale-110 transition-transform" />
                                        <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                                    </div>
                                </Button>
                             )}
                             
                             <Button variant="outline" className="w-full border-2 border-dashed h-12 rounded-xl font-black text-[10px] uppercase text-primary border-primary/20 hover:bg-primary/5 transition-all group" onClick={() => fileInputRef.current?.click()}>
                                <Plus className="size-4 mr-2 group-hover:scale-125 transition-transform" /> ADD PDF / IMAGES
                             </Button>
                        </div>
                        
                        <Button variant="ghost" onClick={resetState} className="w-full h-10 border-2 font-black text-[9px] uppercase tracking-widest text-muted-foreground/60 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all">
                            <RefreshCcw className="size-3.5 mr-2" /> Start New Bundle
                        </Button>

                        <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 flex gap-4 text-left">
                            <ShieldCheck className="size-5 text-primary shrink-0" />
                            <p className="text-[9px] text-primary/80 font-bold leading-relaxed uppercase">
                                <span className="font-black block mb-0.5 text-primary">SECURE RAM:</span>
                                All processing happens locally. PDFs and Images never leave your device.
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-slate-200 dark:bg-slate-900 flex flex-col h-[700px] md:h-[850px] relative shadow-inner">
                        <ScrollArea className="flex-1 p-6 md:p-10">
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                {previews.map((p, i) => {
                                    const isSelected = selectedIndices.includes(i);
                                    return (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                            key={p.id}
                                            onClick={() => togglePageSelection(i)}
                                            className={cn(
                                                "group relative aspect-[1/1.414] rounded-xl overflow-hidden border-2 transition-all cursor-pointer transform active:scale-95 bg-white shadow-xl",
                                                isSelected ? "border-primary ring-4 ring-primary/20 scale-105 z-10 shadow-primary/30" : "hover:border-primary/40 border-transparent"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-2 left-2 size-7 rounded-lg flex items-center justify-center text-[10px] font-black z-20 border transition-colors",
                                                isSelected ? "bg-primary text-white border-white/20" : "bg-black/60 text-white backdrop-blur-md border-white/10"
                                            )}>
                                                {i + 1}
                                            </div>
                                            <div className="absolute top-2 right-2 z-20 opacity-40">
                                                {p.type === 'pdf' ? <FileText className="size-3" /> : <ImageIcon className="size-3" />}
                                            </div>
                                            <div className="size-full flex items-center justify-center p-1 bg-white">
                                                <img src={p.src} alt={`P${i+1}`} className={cn("w-full h-full object-contain transition-all duration-500", !isSelected && "opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0")} />
                                            </div>
                                            {isSelected && <div className="absolute inset-0 bg-primary/5 pointer-events-none z-10 animate-in fade-in" />}
                                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all z-20 translate-y-2 group-hover:translate-y-0">
                                                    <div className={cn("size-7 rounded-lg flex items-center justify-center shadow-2xl border-2 border-white", isSelected ? "bg-red-500 text-white" : "bg-primary text-white")}>
                                                    {isSelected ? <X className="size-4" /> : <Plus className="size-4" />}
                                                    </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                
                                {isRendering && (
                                    <div className="aspect-[1/1.414] border-2 border-dashed border-primary/20 rounded-xl flex flex-col items-center justify-center gap-3 bg-white/50">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-40" />
                                        <span className="text-[8px] font-black uppercase text-primary/60">Scanning...</span>
                                    </div>
                                )}

                                <button 
                                    className="aspect-[1/1.414] border-2 border-dashed border-primary/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all aspect-[1/1.414] shadow-inner group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="size-6" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-primary/60">Add More</span>
                                </button>
                            </div>
                            <ScrollBar />
                        </ScrollArea>
                        {previews.length > 0 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-3 bg-black/80 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 shadow-3xl z-40">
                                <MousePointer2 className="size-3.5 text-primary animate-pulse" /> Click pages to select
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
            
            <CardFooter className="bg-white dark:bg-slate-950 border-t p-5 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM PROCESSING</div>
                <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> NATIVE WASM SPEED</div>
                <div className="flex items-center gap-2"><ImageIcon className="size-4 text-primary" /> PDF & IMAGE SUPPORT</div>
            </CardFooter>
            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/*" multiple onChange={handleFileChange} />
        </Card>
    );
}
