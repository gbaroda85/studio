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
    SortAsc, 
    SortDesc, 
    Trash2,
    ArrowUpDown,
    Eye,
    CheckCircle2,
    ShieldCheck,
    Zap,
    FileStack,
    RefreshCcw,
    LayoutList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from './ui/scroll-area';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
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
        toast({ title: 'List Updated', description: `Files re-ordered by ${order === 'asc' ? 'name (A-Z)' : order === 'desc' ? 'name (Z-A)' : 'original sequence'}.` });
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
                const viewport = page.getViewport({ scale: 0.8 });
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
            toast({title: 'Merge Success!', description: 'Your PDFs have been combined.'});
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
        <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-8 px-4 animate-in fade-in duration-500">
            {/* Main Content Area */}
            <div className="lg:col-span-7 space-y-6">
                <Card className={cn(
                    "border-2 transition-all duration-300 bg-card/50 dark:bg-slate-900/50 shadow-xl overflow-hidden",
                    isDragOver && "border-primary ring-4 ring-primary/20",
                    pdfFiles.length === 0 && "hover:border-primary/50"
                )} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                    <CardHeader className="bg-muted/30 dark:bg-slate-950/30 border-b flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-tighter">Merge Workspace</CardTitle>
                            <CardDescription>Arrange your files in order. 100% Secure Local Engine.</CardDescription>
                        </div>
                        {pdfFiles.length > 0 && <Badge className="bg-primary font-black uppercase text-[10px] tracking-widest">{pdfFiles.length} FILES</Badge>}
                    </CardHeader>
                    <CardContent className="p-6">
                        {pdfFiles.length === 0 ? (
                            <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                                <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <UploadCloud className="size-10" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold uppercase tracking-tight">Drop PDFs here to Combine</p>
                                    <p className="text-sm text-muted-foreground mt-1">Files never leave your browser RAM.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 p-1 custom-scrollbar">
                                {pdfFiles.map((file, index) => (
                                     <div key={`${file.name}-${index}`} className="flex items-center justify-between p-4 rounded-2xl border-2 border-transparent bg-white dark:bg-slate-950 hover:border-primary/40 transition-all group shadow-sm">
                                         <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="flex flex-col gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md bg-muted/50" onClick={() => moveFile(index, 'up')} disabled={index === 0}><ChevronUp className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md bg-muted/50" onClick={() => moveFile(index, 'down')} disabled={index === pdfFiles.length - 1}><ChevronDown className="h-4 w-4" /></Button>
                                            </div>
                                            <div className="flex items-center gap-4 truncate">
                                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0 border border-primary/20">{index + 1}</div>
                                                <div className="truncate">
                                                    <p className="text-sm font-black truncate max-w-[250px] uppercase tracking-tight" title={file.name}>{file.name}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">PDF Document</p>
                                                </div>
                                            </div>
                                         </div>
                                        <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/5" onClick={() => handleRemoveFile(index)}><X className="h-5 w-5" /></Button>
                                     </div>
                                ))}
                                <Button variant="outline" className="w-full border-2 border-dashed h-16 rounded-2xl mt-4 font-black text-xs uppercase text-primary border-primary/20 hover:bg-primary/5 transition-all" onClick={() => fileInputRef.current?.click()}>
                                    <UploadCloud className="size-5 mr-3" /> <span className="mr-1">Drag or</span> SELECT MORE DOCUMENTS
                                </Button>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" multiple onChange={onFileChange} />
                    </CardContent>
                    {pdfFiles.length > 0 && (
                        <CardFooter className="bg-muted/10 dark:bg-slate-950/10 border-t p-5 flex justify-between items-center">
                            <Button variant="ghost" size="sm" onClick={handleReset} className="text-[10px] font-black uppercase text-destructive hover:bg-destructive/10 h-10 px-4">
                                <Trash2 className="size-4 mr-2"/> REMOVE ALL FILES
                            </Button>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">
                                <ShieldCheck className="h-4 w-4 text-green-500" /> SECURE RAM PROCESSING
                            </div>
                        </CardFooter>
                    )}
                </Card>

                {mergedPdfUrl && (
                    <Card key={mergedPdfUrl} className="border-2 border-green-500/20 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden bg-card/50">
                        <CardHeader className="bg-green-500/5 py-4 border-b border-green-500/20">
                            <CardTitle className="text-xs font-black uppercase flex items-center justify-center gap-2 text-green-700 tracking-widest">
                                <Eye className="size-4" /> Visual Final Confirmation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 bg-muted/20">
                            <ScrollArea className="h-[550px] w-full p-8">
                                <div className="flex flex-col items-center gap-8">
                                    {isGeneratingPreview ? (
                                        <div className="flex flex-col items-center gap-4 py-20 text-center">
                                            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20 stroke-[3]" />
                                            <p className="text-[10px] font-black uppercase text-primary animate-pulse tracking-widest">Rendering Visual Flow...</p>
                                        </div>
                                    ) : previewImages.map((img, i) => (
                                        <div key={i} className="shadow-2xl border-4 border-white dark:border-slate-800 rounded-sm overflow-hidden bg-white max-w-full transform transition-transform hover:scale-[1.02]">
                                            <img src={img} alt={`Page ${i+1}`} className="max-w-full h-auto" />
                                            <div className="bg-muted dark:bg-slate-900 text-[9px] font-black py-2 px-3 text-center uppercase tracking-widest text-muted-foreground border-t">Combined Page {i+1}</div>
                                        </div>
                                    ))}
                                    {previewImages.length >= 10 && (
                                        <p className="text-[10px] font-black text-muted-foreground uppercase py-8 opacity-40">... Previewing first 10 pages for confirmation ...</p>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <CardFooter className="bg-green-500/10 p-8 flex flex-col sm:flex-row justify-between items-center gap-8 border-t border-green-500/20">
                            <div className="flex items-center gap-5 text-center sm:text-left">
                                <div className="size-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl shadow-green-500/40 shrink-0"><CheckCircle2 className="size-9" /></div>
                                <div>
                                    <p className="text-xl font-black text-green-800 dark:text-green-400 uppercase tracking-tighter leading-none">MERGE READY!</p>
                                    <p className="text-[10px] text-green-700 dark:text-green-500 font-bold mt-2 uppercase tracking-widest">All documents successfully bundled</p>
                                </div>
                            </div>
                            <Button size="lg" className="h-18 px-12 bg-green-600 hover:bg-green-700 text-xl font-black shadow-2xl rounded-2xl transition-all active:scale-95 group" onClick={handleDownload}>
                                <Download className="mr-3 h-7 w-7 group-hover:translate-y-1 transition-transform" /> DOWNLOAD PDF
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>

            {/* Sidebar Controls */}
            <div className="lg:col-span-5 space-y-6">
                <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2.5rem] bg-white dark:bg-slate-950 transition-all hover:border-primary/30">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <FileStack className="size-6 text-primary" /> ORGANIZE & SORT
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-10">
                        {/* Sorting Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                                    <LayoutList className="size-3" /> Sorting Options
                                </Label>
                                <Badge variant="outline" className="text-[8px] font-black uppercase opacity-60">Bulk Actions</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                <Button 
                                    variant="outline" 
                                    className="h-14 justify-start gap-4 rounded-2xl border-2 border-primary/5 hover:border-primary/40 hover:bg-primary/5 transition-all group" 
                                    onClick={() => sortFiles('asc')}
                                    disabled={pdfFiles.length < 2}
                                >
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <SortAsc className="size-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase tracking-tight">Sort A to Z</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">Order by File Name</p>
                                    </div>
                                </Button>

                                <Button 
                                    variant="outline" 
                                    className="h-14 justify-start gap-4 rounded-2xl border-2 border-primary/5 hover:border-primary/40 hover:bg-primary/5 transition-all group" 
                                    onClick={() => sortFiles('desc')}
                                    disabled={pdfFiles.length < 2}
                                >
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <SortDesc className="size-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase tracking-tight">Sort Z to A</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">Reverse Alphabetical</p>
                                    </div>
                                </Button>

                                <Button 
                                    variant="outline" 
                                    className="h-14 justify-start gap-4 rounded-2xl border-2 border-primary/5 hover:border-primary/40 hover:bg-primary/5 transition-all group" 
                                    onClick={() => sortFiles('reverse')}
                                    disabled={pdfFiles.length < 2}
                                >
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <RefreshCcw className="size-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase tracking-tight">Manual Reverse</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">Flip current order</p>
                                    </div>
                                </Button>
                            </div>
                        </div>

                        {/* Pro Logic Info */}
                        <div className="p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10 flex gap-5 shadow-sm">
                            <Zap className="size-6 text-yellow-500 shrink-0 animate-pulse" />
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-primary uppercase tracking-widest">PRO BUNDLING ACTIVE</p>
                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                                    Our engine preserves original PDF vectors, ensuring zero quality loss and optimized final file sizes.
                                </p>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/10 dark:bg-slate-950/20 p-8 border-t-2 border-dashed">
                        <Button 
                            className="w-full h-20 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-[1.5rem] transition-all active:scale-95 disabled:opacity-50 group" 
                            onClick={handleMergePdfs} 
                            disabled={pdfFiles.length < 2 || isMerging}
                        >
                            {isMerging ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="size-8 animate-spin" />
                                    <span className="uppercase tracking-tighter">COMBINING...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-5">
                                    <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                        <Merge className="size-7" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block uppercase tracking-tighter leading-none text-2xl">MERGE PDFS</span>
                                        <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Process {pdfFiles.length} Documents</span>
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
                        <p className="text-[11px] font-black text-green-700 uppercase tracking-tight">Private Local Engine</p>
                        <p className="text-[10px] text-green-600/80 font-medium leading-tight">Every byte is processed in your device memory. Your documents never reach our servers.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
