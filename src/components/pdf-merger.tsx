
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    Merge, 
    FileText, 
    X, 
    ChevronUp, 
    ChevronDown, 
    Trash2,
    ArrowUpDown,
    Eye,
    CheckCircle2,
    ShieldCheck,
    Zap,
    FileStack,
    RefreshCcw,
    LayoutList,
    ArrowDownAz,
    ArrowUpAz,
    Repeat,
    Sparkles,
    Plus,
    Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from './ui/scroll-area';
import confetti from 'canvas-confetti';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function PdfMerger() {
    const { toast } = useToast();
    const [pdfFiles, setPdfFiles] = useState<File[]>([]);
    const [isMerging, setIsMerging] = useState(false);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (mergedPdfUrl) {
                URL.revokeObjectURL(mergedPdfUrl);
            }
        };
    }, [mergedPdfUrl]);
    
    const clearMergedFile = () => {
        if (mergedPdfUrl) {
            URL.revokeObjectURL(mergedPdfUrl);
            setMergedPdfUrl(null);
        }
        setPreviewImages([]);
    }

    const handleFilesChange = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        clearMergedFile();
        const newFiles = Array.from(files).filter(file => file.type === 'application/pdf');
        if (newFiles.length === 0) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select only PDF files.' });
            return;
        }
        setPdfFiles(prev => [...prev, ...newFiles]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFilesChange(e.target.files);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFilesChange(e.dataTransfer.files); };

    const handleRemoveFile = (index: number) => {
        clearMergedFile();
        setPdfFiles(files => files.filter((_, i) => i !== index));
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        const newFiles = [...pdfFiles];
        const file = newFiles.splice(index, 1)[0];
        if (direction === 'up') newFiles.splice(Math.max(0, index - 1), 0, file);
        else newFiles.splice(Math.min(pdfFiles.length - 1, index + 1), 0, file);
        setPdfFiles(newFiles);
        clearMergedFile();
    };

    const sortFiles = (order: 'asc' | 'desc' | 'reverse') => {
        let sorted = [...pdfFiles];
        if (order === 'reverse') {
            sorted.reverse();
        } else {
            sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
            if (order === 'desc') sorted.reverse();
        }
        setPdfFiles(sorted);
        clearMergedFile();
        toast({ title: 'List Updated', description: `Files re-ordered.` });
    }
    
    const handleReset = () => {
        setPdfFiles([]);
        clearMergedFile();
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const generateVisualPreviews = async (pdfBytes: Uint8Array) => {
        setIsGeneratingPreview(true);
        try {
            const loadingTask = pdfjs.getDocument({ data: pdfBytes });
            const pdf = await loadingTask.promise;
            const imgs: string[] = [];
            const pagesToRender = Math.min(pdf.numPages, 10); 

            for (let i = 1; i <= pagesToRender; i++) {
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
                    imgs.push(canvas.toDataURL('image/jpeg', 0.85));
                }
            }
            setPreviewImages(imgs);
        } catch (e) {
            console.error("Preview generation failed", e);
        } finally {
            setIsGeneratingPreview(false);
        }
    };

    const handleMergePdfs = async () => {
        if (pdfFiles.length < 2) {
            toast({ variant: 'destructive', title: 'Need 2+ Files', description: 'Please upload at least two PDFs to merge.' });
            return;
        }
        setIsMerging(true);
        try {
            const mergedPdf = await PDFDocument.create();
            for (const file of pdfFiles) {
                const pdfBytes = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            
            if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
            const url = URL.createObjectURL(blob);
            setMergedPdfUrl(url);
            
            await generateVisualPreviews(mergedPdfBytes);
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#48a9a4', '#fce7eb', '#ffffff']
            });

            toast({title: 'Merge Success!', description: 'Your PDFs have been combined locally.'});
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Merge Error', description: 'Failed to combine documents.' });
        } finally {
            setIsMerging(false);
        }
    };
    
    const handleDownload = () => {
        if (!mergedPdfUrl) return;
        const link = document.createElement('a');
        link.href = mergedPdfUrl;
        link.download = `merged-document-${Date.now()}.pdf`;
        link.click();
    }
    
    return (
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 px-4 animate-in fade-in duration-500">
            {/* Left Column: Stack & Selection */}
            <div className="lg:col-span-7 space-y-4">
                <Card className={cn(
                    "w-full glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20",
                    isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                )}
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                >
                    <CardHeader className="bg-muted/30 border-b p-6 text-center">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                            {pdfFiles.length > 0 && <Badge className="bg-primary text-white font-black text-[10px] uppercase px-3 py-1 rounded-full">{pdfFiles.length} DOCUMENTS</Badge>}
                        </div>
                    </CardHeader>
                    <CardContent className={cn("p-6 md:p-8", pdfFiles.length === 0 ? "py-20 md:py-32" : "py-6")}>
                        {pdfFiles.length === 0 ? (
                            <div 
                                className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="relative">
                                    <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Zap className="absolute -top-2 -right-2 size-6 md:size-8 text-yellow-500 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">Drop PDFs to Merge</p>
                                    <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60">High-fidelity bundling engine active.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Current Stack Order</p>
                                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-destructive font-black h-7 text-[9px] uppercase">
                                        <Trash2 className="size-3 mr-1"/> Clear All
                                    </Button>
                                </div>
                                <ScrollArea className="h-[300px] md:h-[450px] pr-2 custom-scrollbar">
                                    <div className="space-y-2">
                                        {pdfFiles.map((file, index) => (
                                             <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 rounded-2xl border-2 border-transparent bg-white dark:bg-slate-900 hover:border-primary/40 transition-all group shadow-md animate-in slide-in-from-bottom-2">
                                                 <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                                    <div className="flex flex-col gap-1 opacity-40 group-hover:opacity-100 transition-opacity shrink-0">
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md bg-muted/50 hover:bg-primary/10" onClick={() => moveFile(index, 'up')} disabled={index === 0}><ChevronUp className="h-4 w-4" /></Button>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md bg-muted/50 hover:bg-primary/10" onClick={() => moveFile(index, 'down')} disabled={index === pdfFiles.length - 1}><ChevronDown className="h-4 w-4" /></Button>
                                                    </div>
                                                    <div className="flex items-center gap-3 truncate">
                                                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 border border-primary/20 shadow-inner">{index + 1}</div>
                                                        <div className="truncate">
                                                            <p className="text-xs md:text-sm font-black truncate max-w-[150px] md:max-w-[300px] uppercase tracking-tight" title={file.name}>{file.name}</p>
                                                            <p className="text-[8px] md:text-[9px] font-mono text-muted-foreground/60 uppercase">{formatBytes(file.size)}</p>
                                                        </div>
                                                    </div>
                                                 </div>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/5" onClick={() => handleRemoveFile(index)}><X className="h-4 w-4" /></Button>
                                             </div>
                                        ))}
                                        <Button variant="outline" className="w-full border-2 border-dashed h-12 rounded-xl mt-4 font-black text-[10px] uppercase text-primary border-primary/20 hover:bg-primary/5 transition-all group" onClick={() => fileInputRef.current?.click()}>
                                            <Plus className="size-4 mr-2 group-hover:scale-125 transition-transform" /> ADD MORE DOCUMENTS
                                        </Button>
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" multiple onChange={(e) => handleFilesChange(e.target.files)} />
                    </CardContent>
                    <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                        <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                        <div className="flex items-center gap-1.5"><Eye className="size-3 text-primary" /> LIVE PREVIEW</div>
                        <div className="flex items-center gap-1.5"><FileStack className="size-3 text-purple-500" /> PRO BUNDLING</div>
                    </CardFooter>
                </Card>

                {mergedPdfUrl && (
                    <Card className="border-2 border-green-500/20 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden bg-card/50 rounded-[2.5rem] hover:-translate-y-1 transition-all">
                        <CardHeader className="bg-green-500/5 py-3 border-b border-green-500/20">
                            <CardTitle className="text-[10px] font-black uppercase flex items-center justify-center gap-2 text-green-700 tracking-[0.2em]">
                                <Eye className="size-3 text-green-600" /> VISUAL PREVIEW CONFIRMATION
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 bg-slate-200 dark:bg-slate-900/50">
                            <ScrollArea className="h-[400px] w-full p-6 md:p-10">
                                <div className="flex flex-col items-center gap-6">
                                    {isGeneratingPreview ? (
                                        <div className="flex flex-col items-center gap-4 py-20 text-center">
                                            <div className="relative">
                                                <Loader2 className="h-12 w-12 animate-spin text-primary stroke-[3]" />
                                                <Monitor className="absolute inset-0 m-auto h-5 w-5 text-primary/20" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase text-primary animate-pulse tracking-widest">Rendering Combined View...</p>
                                        </div>
                                    ) : previewImages.map((img, i) => (
                                        <div key={i} className="shadow-2xl border-[6px] border-white rounded-sm overflow-hidden bg-white max-w-full md:max-w-[400px] animate-in slide-in-from-bottom-4 duration-500">
                                            <img src={img} alt={`Page ${i+1}`} className="max-w-full h-auto block" />
                                            <div className="bg-muted text-[8px] font-black py-1.5 text-center uppercase text-muted-foreground border-t">A4 Page {i+1}</div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <CardFooter className="bg-green-500/10 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-green-500/20">
                            <div className="flex items-center gap-5">
                                <div className="size-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl relative shrink-0">
                                    <CheckCircle2 className="size-9" />
                                    <Sparkles className="absolute -top-2 -right-2 text-yellow-400 size-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xl font-black text-green-800 uppercase tracking-tighter leading-none">MERGE READY!</p>
                                    <p className="text-[10px] text-green-700 font-bold mt-1.5 uppercase tracking-widest opacity-60">Bundle sanitized and complete</p>
                                </div>
                            </div>
                            <Button size="lg" className="w-full sm:w-auto h-16 px-12 bg-green-600 hover:bg-green-700 text-lg font-black shadow-2xl rounded-2xl transition-all active:scale-95 group" onClick={handleDownload}>
                                <Download className="mr-3 size-6 group-hover:translate-y-1 transition-transform" /> SAVE COMBINED PDF
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>

            {/* Right Column: Settings & Actions */}
            <div className="lg:col-span-5 space-y-6">
                <Card className="border-2 shadow-xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950 transition-all hover:border-primary/30">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <LayoutList className="size-6 text-primary" /> Stack Control
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-10">
                        
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2 mb-2">
                                <ArrowUpDown className="size-3" /> Quick Sorting Tools
                            </Label>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <Button 
                                    variant="outline" 
                                    className="h-16 flex-col gap-1.5 border-2 rounded-2xl bg-white dark:bg-slate-900 hover:border-primary/50 transition-all group"
                                    onClick={() => sortFiles('asc')}
                                    disabled={pdfFiles.length < 2}
                                >
                                    <div className="size-7 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10">
                                        <ArrowDownAz className="size-4 text-primary" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest">A → Z</span>
                                </Button>

                                <Button 
                                    variant="outline" 
                                    className="h-16 flex-col gap-1.5 border-2 rounded-2xl bg-white dark:bg-slate-900 hover:border-primary/50 transition-all group"
                                    onClick={() => sortFiles('desc')}
                                    disabled={pdfFiles.length < 2}
                                >
                                    <div className="size-7 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10">
                                        <ArrowUpAz className="size-4 text-primary" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest">Z → A</span>
                                </Button>

                                <Button 
                                    variant="outline" 
                                    className="h-16 flex-col gap-1.5 border-2 rounded-2xl bg-white dark:bg-slate-900 hover:border-primary/50 transition-all group"
                                    onClick={() => sortFiles('reverse')}
                                    disabled={pdfFiles.length < 2}
                                >
                                    <div className="size-7 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10">
                                        <Repeat className="size-4 text-primary" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest">FLIP</span>
                                </Button>
                            </div>
                        </div>

                        <div className="p-5 bg-primary/5 rounded-[1.5rem] border-2 border-primary/10 flex gap-4 shadow-sm">
                            <Zap className="size-6 text-yellow-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-tight">Pro Bundling Note</p>
                                <p className="text-[9px] text-primary/80 font-medium leading-relaxed mt-1 uppercase">
                                    Our local engine merges documents without rasterizing pages. This ensures that original text stays <strong>selectable and crisp</strong> in the final output.
                                </p>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/10 p-6 md:p-8 border-t-2 border-dashed">
                        <Button 
                            className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl md:rounded-[1.5rem] transition-all active:scale-95 disabled:opacity-50 group" 
                            onClick={handleMergePdfs} 
                            disabled={pdfFiles.length < 2 || isMerging}
                        >
                            {isMerging ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="size-6 md:size-8 animate-spin" />
                                    <span className="uppercase text-sm md:text-base tracking-tighter">COMBINING...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Merge className="size-6 md:size-8 text-white/50 group-hover:scale-125 transition-transform" />
                                    <span className="uppercase tracking-tighter">MERGE DOCUMENTS</span>
                                </div>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
                
                <div className="p-4 md:p-6 bg-green-500/5 rounded-xl md:rounded-[2rem] border-2 border-green-500/10 flex gap-4 items-center shadow-sm">
                    <div className="size-10 md:size-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="size-5 md:size-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-[11px] font-black text-green-700 uppercase tracking-tight">100% Secure Local Merge</p>
                        <p className="text-[8px] md:text-[10px] text-muted-foreground font-medium leading-tight">Combine bank statements or sensitive docs without any cloud risk.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
