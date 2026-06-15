"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect, useCallback } from 'react';
import { PDFDocument, PDFName, degrees } from 'pdf-lib';
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// HARDCODED STABLE VERSION FOR WORKER
const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
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
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const studioWorkspaceRef = useRef<HTMLDivElement>(null);

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
        setIsPreviewOpen(false);
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
        setIsPreviewOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const generateVisualPreviews = async (pdfBytes: Uint8Array) => {
        setIsGeneratingPreview(true);
        try {
            const loadingTask = pdfjs.getDocument({ 
                data: pdfBytes,
                cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                cMapPacked: true
            });
            const pdf = await loadingTask.promise;
            const imgs: string[] = [];
            const pagesToRender = Math.min(pdf.numPages, 20); 

            for (let i = 1; i <= pagesToRender; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.2 });
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

            // STABLE METADATA: Set Viewer Preferences to prevent "huge" display
            const catalog = mergedPdf.catalog;
            catalog.set(PDFName.of('ViewerPreferences'), mergedPdf.context.obj({
                FitWindow: true,
                CenterWindow: true,
                DisplayDocTitle: true
            }));
            
            // Set PageMode to UseNone (prevents sidebar opening by default)
            catalog.set(PDFName.of('PageMode'), PDFName.of('UseNone'));

            // Force browser to fit to window on open (OpenAction)
            const allPages = mergedPdf.getPages();
            if (allPages.length > 0) {
                const firstPage = allPages[0];
                const dest = mergedPdf.context.obj([firstPage.ref, PDFName.of('Fit')]);
                catalog.set(PDFName.of('OpenAction'), dest);
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            
            if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
            const url = URL.createObjectURL(blob);
            setMergedPdfUrl(url);
            
            // Show preview automatically
            setIsPreviewOpen(true);
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
        link.download = `GR7-Tools-merged-document-${Date.now()}.pdf`;
        link.click();
    }
    
    return (
        <div ref={studioWorkspaceRef} className="w-full max-w-7xl flex flex-col gap-8 px-4 animate-in fade-in duration-500 pb-20 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
                {/* Left Column: List */}
                <div className="lg:col-span-7 flex flex-col">
                    <Card className={cn(
                        "w-full glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 select-none h-full flex flex-col min-h-[500px]",
                        isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
                    )}
                        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    >
                        <CardHeader className="bg-muted/30 border-b p-6 text-center">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                                {pdfFiles.length > 0 && <Badge className="bg-primary text-white font-black text-[10px] px-3 py-1 rounded-full">{pdfFiles.length} DOCUMENTS</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className={cn("p-6 md:p-8 flex-1 flex flex-col min-h-[400px]", pdfFiles.length === 0 ? "justify-center py-20 md:py-32" : "py-6")}>
                            {pdfFiles.length === 0 ? (
                                <div 
                                    className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 bg-muted/30 group cursor-pointer hover:bg-muted/40 transition-all"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="relative">
                                        <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <Zap className="absolute -top-1 -right-1 size-5 md:size-8 text-yellow-500 animate-pulse" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop PDFs to Merge</p>
                                        <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">High-fidelity bundling engine active.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center px-1 shrink-0">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Current Stack Order</p>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-primary font-black h-7 text-[9px] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                                                <Plus className="size-3 mr-1"/> Add Files
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={handleReset} className="text-destructive font-black h-7 text-[9px] uppercase hover:bg-destructive hover:text-white transition-all">
                                                <Trash2 className="size-3 mr-1"/> Clear All
                                            </Button>
                                        </div>
                                    </div>
                                    <ScrollArea className="h-[400px] md:h-[600px] pr-2 custom-scrollbar border rounded-2xl bg-muted/5">
                                        <div className="space-y-2 p-3">
                                            {pdfFiles.map((file, index) => (
                                                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 rounded-2xl border-2 border-transparent bg-white dark:bg-slate-900 hover:border-primary/40 transition-all group shadow-md animate-in slide-in-from-bottom-2">
                                                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                                        <div className="flex flex-col gap-1 opacity-40 group-hover:opacity-100 transition-opacity shrink-0">
                                                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md bg-muted/50 hover:bg-primary/10" onClick={() => moveFile(index, 'up')} disabled={index === 0}><ChevronUp className="h-4 w-4" /></Button>
                                                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md bg-muted/50 hover:bg-primary/10" onClick={() => moveFile(index, 'down')} disabled={index === pdfFiles.length - 1}><ChevronDown className="h-4 w-4" /></Button>
                                                        </div>
                                                        <div className="flex items-center gap-3 truncate">
                                                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 border border-primary/20 shadow-inner">{index + 1}</div>
                                                            <div className="truncate text-left">
                                                                <p className="text-xs md:text-sm font-black truncate max-w-[150px] md:max-w-[300px] uppercase tracking-tight" title={file.name}>{file.name}</p>
                                                                <p className="text-[8px] md:text-[9px] font-mono text-muted-foreground/60 uppercase">{formatBytes(file.size)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/5" onClick={() => handleRemoveFile(index)}><X className="h-4 w-4" /></Button>
                                                </div>
                                            ))}
                                            <Button variant="outline" className="w-full border-2 border-dashed h-12 rounded-xl mt-4 font-black text-[10px] uppercase text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 group" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                                                <Plus className="size-4 mr-2 group-hover:scale-125 transition-transform" /> ADD MORE DOCUMENTS
                                            </Button>
                                        </div>
                                        <ScrollBar />
                                    </ScrollArea>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" multiple onChange={(e) => handleFilesChange(e.target.files)} />
                        </CardContent>
                        <CardFooter className="justify-center gap-8 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4 shrink-0">
                            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                            <div className="flex items-center gap-1.5"><Eye className="size-3 text-primary" /> LIVE PREVIEW</div>
                            <div className="flex items-center gap-1.5"><FileStack className="size-3 text-purple-500" /> PRO BUNDLING</div>
                        </CardFooter>
                    </Card>
                </div>

                {/* Right Column: Actions */}
                <div className="lg:col-span-5 flex flex-col">
                    <Card className="border-2 shadow-xl border-primary/10 overflow-hidden rounded-[2rem] bg-white dark:bg-slate-950 transition-all hover:border-primary/30 h-full flex flex-col min-h-[500px]">
                        <CardHeader className="bg-primary/5 border-b p-6">
                            <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <LayoutList className="size-6 text-primary" /> Stack Control
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-10 flex-1 flex flex-col">
                            <div className="space-y-6">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2 mb-2">
                                    <ArrowUpDown className="size-3" /> Quick Sorting Studio
                                </Label>
                                
                                <div className="flex flex-col gap-4">
                                    <Button 
                                        className="h-16 rounded-full bg-gradient-to-r from-[#1a5f6e] to-[#0d9488] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.3)] text-white hover:brightness-110 transition-all active:scale-95 group justify-start px-6 gap-5"
                                        onClick={() => sortFiles('asc')}
                                        disabled={pdfFiles.length < 2}
                                    >
                                        <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                                            <ArrowDownAz className="size-6 text-white" />
                                        </div>
                                        <span className="text-sm font-black tracking-widest uppercase">Sort Name A → Z</span>
                                    </Button>

                                    <Button 
                                        className="h-16 rounded-full bg-gradient-to-r from-[#1e40af] to-[#312e81] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.3)] text-white hover:brightness-110 transition-all active:scale-95 group justify-start px-6 gap-5"
                                        onClick={() => sortFiles('desc')}
                                        disabled={pdfFiles.length < 2}
                                    >
                                        <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                                            <ArrowUpAz className="size-6 text-white" />
                                        </div>
                                        <span className="text-sm font-black tracking-widest uppercase">Sort Name Z → A</span>
                                    </Button>

                                    <Button 
                                        className="h-16 rounded-full bg-gradient-to-r from-[#065f46] to-[#064e3b] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.3)] text-white hover:brightness-110 transition-all active:scale-95 group justify-start px-6 gap-5"
                                        onClick={() => sortFiles('reverse')}
                                        disabled={pdfFiles.length < 2}
                                    >
                                        <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner group-hover:rotate-180 duration-500 transition-transform">
                                            <Repeat className="size-6 text-white" />
                                        </div>
                                        <span className="text-sm font-black tracking-widest uppercase">Reverse Order</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 space-y-6">
                                <div className="p-5 bg-primary/5 rounded-[1.5rem] border-2 border-primary/10 flex gap-4 shadow-sm">
                                    <Zap className="size-6 text-yellow-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase text-left">
                                        <span className="font-black block mb-1 text-primary">PRO BUNDLING:</span>
                                        Documents are merged without rasterizing. Text remains selectable.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {!mergedPdfUrl ? (
                                        <Button 
                                            className="magic-button w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-4" 
                                            onClick={handleMergePdfs} 
                                            disabled={pdfFiles.length < 2 || isMerging}
                                        >
                                            <StarIcons />
                                            {isMerging ? (
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="size-7 md:size-8 animate-spin" />
                                                    <span className="uppercase text-sm tracking-tighter">COMBINING...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <Merge className="size-7 md:size-8 text-white/50 group-hover:scale-125 transition-transform" />
                                                    <span className="uppercase tracking-tighter">MERGE DOCUMENTS</span>
                                                </div>
                                            )}
                                        </Button>
                                    ) : (
                                        <div className="space-y-4 animate-in zoom-in-95">
                                            <Button 
                                                variant="outline"
                                                className="w-full h-14 rounded-2xl border-2 border-primary font-black uppercase text-[10px] tracking-widest text-primary hover:bg-primary hover:text-white flex items-center justify-center gap-2"
                                                onClick={() => setIsPreviewOpen(true)}
                                            >
                                                <Eye className="size-4" /> VIEW FULL PREVIEW
                                            </Button>

                                            <Button 
                                                className="magic-button magic-button-success w-full h-16 md:h-20 text-lg md:text-xl font-black bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 rounded-full transition-all active:scale-95 group flex items-center justify-center gap-4" 
                                                onClick={handleDownload}
                                            >
                                                <StarIcons />
                                                <Download className="size-7 md:size-8 group-hover:translate-y-1 transition-transform" />
                                                <span className="uppercase tracking-tighter">DOWNLOAD PDF</span>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Visual Preview Dialog (Pop-up) */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-5xl max-h-[82vh] p-0 rounded-[2.5rem] overflow-hidden border-none shadow-3xl bg-white dark:bg-slate-950 flex flex-col z-[150] top-[54%]">
                    <DialogHeader className="bg-green-500/5 py-4 border-b border-green-500/20 flex flex-row items-center justify-center gap-3">
                         <Eye className="size-4 text-green-600" />
                         <DialogTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-green-800">Visual Render Confirmation</DialogTitle>
                    </DialogHeader>
                    
                    <CardContent className="p-0 flex-1 bg-slate-200 dark:bg-slate-900/50 shadow-inner relative flex flex-col overflow-hidden">
                        <div className="flex-1 w-full overflow-y-auto custom-scrollbar p-6 md:p-12">
                            <div className="flex flex-col items-center gap-8 pb-10">
                                {isGeneratingPreview ? (
                                    <div className="flex flex-col items-center gap-4 py-20 text-center">
                                        <div className="relative">
                                            <Loader2 className="h-12 w-12 animate-spin text-primary stroke-[3]" />
                                            <Monitor className="absolute inset-0 m-auto h-5 w-5 text-primary/20" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-primary animate-pulse tracking-widest">Rendering HD Previews...</p>
                                    </div>
                                ) : previewImages.map((img, i) => (
                                    <div key={i} className="shadow-2xl border-[8px] border-white rounded-sm overflow-hidden bg-white w-full max-w-[550px] animate-in slide-in-from-bottom-4 duration-500">
                                        <img src={img} alt={`Page ${i+1}`} className="w-full h-auto block" />
                                        <div className="bg-muted text-[8px] font-black py-2 text-center uppercase text-muted-foreground border-t">A4 Page {i+1}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-green-500/10 p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-green-500/20">
                        <div className="flex items-center gap-5">
                            <div className="size-16 md:size-20 rounded-3xl bg-green-500 text-white flex items-center justify-center shadow-2xl relative shrink-0">
                                <CheckCircle2 className="size-10 md:size-12 z-10" />
                                <StarIcons />
                                <Sparkles className="absolute -top-1 -right-1 text-yellow-400 size-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-xl font-black text-green-800 uppercase tracking-tighter leading-none">MERGE READY!</p>
                                <p className="text-[10px] text-green-700 font-bold mt-1.5 uppercase tracking-widest opacity-60">Bundle sanitized and complete</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="h-14 md:h-16 px-6 border-2 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                                <X className="mr-2 size-4" /> CLOSE PREVIEW
                            </Button>
                            <Button size="lg" className="magic-button magic-button-success h-14 md:h-16 px-12 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 font-black rounded-full transition-all active:scale-95 group flex items-center justify-center gap-4" onClick={handleDownload}>
                                <StarIcons />
                                <Download className="mr-3 size-8 group-hover:translate-y-1 transition-transform" /> 
                                <span className="uppercase tracking-tighter text-lg">SAVE COMBINED PDF</span>
                            </Button>
                        </div>
                    </CardFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
