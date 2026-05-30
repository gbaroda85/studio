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
    LayoutList,
    ArrowDownAz,
    ArrowUpAz,
    Repeat
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from './ui/scroll-area';

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

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFilesChange(e.target.files?.[0] || null);
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
                const viewport = page.getViewport({ scale: 0.8 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                if (context) {
                    context.fillStyle = '#FFFFFF';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
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
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 px-4 animate-in fade-in duration-500">
            <div className="lg:col-span-7 space-y-4">
                <Card className={cn(
                    "border-2 transition-all duration-300 bg-card/50 shadow-xl overflow-hidden",
                    isDragOver && "border-primary ring-4 ring-primary/20",
                    pdfFiles.length === 0 && "hover:border-primary/50"
                )} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                    <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between p-3 md:p-4">
                        <div>
                            <CardTitle className="text-sm md:text-base font-black uppercase tracking-tighter">Merge Stack</CardTitle>
                        </div>
                        {pdfFiles.length > 0 && <Badge className="bg-primary font-black uppercase text-[8px] md:text-[9px] tracking-widest">{pdfFiles.length} FILES</Badge>}
                    </CardHeader>
                    <CardContent className="p-2 md:p-4">
                        {pdfFiles.length === 0 ? (
                            <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                                <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <UploadCloud className="size-5 md:size-6" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm md:text-base font-bold uppercase tracking-tight">Drop PDFs here</p>
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">Private local RAM processing.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <ScrollArea className="h-[300px] md:h-[400px] pr-1">
                                    <div className="space-y-2">
                                        {pdfFiles.map((file, index) => (
                                             <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2 rounded-xl border-2 border-transparent bg-white dark:bg-slate-950 hover:border-primary/40 transition-all group shadow-sm">
                                                 <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                                                    <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0">
                                                        <Button size="icon" variant="ghost" className="h-5 w-5 rounded-md bg-muted/50" onClick={() => moveFile(index, 'up')} disabled={index === 0}><ChevronUp className="h-3 w-3" /></Button>
                                                        <Button size="icon" variant="ghost" className="h-5 w-5 rounded-md bg-muted/50" onClick={() => moveFile(index, 'down')} disabled={index === pdfFiles.length - 1}><ChevronDown className="h-3 w-3" /></Button>
                                                    </div>
                                                    <div className="flex items-center gap-2 truncate">
                                                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 border border-primary/20">{index + 1}</div>
                                                        <div className="truncate">
                                                            <p className="text-[10px] md:text-xs font-black truncate max-w-[100px] md:max-w-[200px] uppercase tracking-tight" title={file.name}>{file.name}</p>
                                                            <p className="text-[7px] md:text-[8px] font-bold text-muted-foreground uppercase">{formatBytes(file.size)}</p>
                                                        </div>
                                                    </div>
                                                 </div>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-full" onClick={() => handleRemoveFile(index)}><X className="h-3 w-3 md:h-4" /></Button>
                                             </div>
                                        ))}
                                        <Button variant="outline" className="w-full border-2 border-dashed h-10 rounded-xl mt-2 font-black text-[9px] uppercase text-primary border-primary/20 hover:bg-primary/5 transition-all" onClick={() => fileInputRef.current?.click()}>
                                            <UploadCloud className="size-3 mr-2" /> ADD DOCUMENTS
                                        </Button>
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" multiple onChange={onFileChange} />
                    </CardContent>
                </Card>

                {mergedPdfUrl && (
                    <Card key={mergedPdfUrl} className="border-2 border-green-500/20 shadow-xl animate-in zoom-in-95 duration-500 overflow-hidden bg-card/50">
                        <CardHeader className="bg-green-500/5 py-2 border-b border-green-500/20">
                            <CardTitle className="text-[8px] md:text-[10px] font-black uppercase flex items-center justify-center gap-2 text-green-700 tracking-widest">
                                <Eye className="size-2.5 md:size-3" /> Visual Confirmation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 bg-muted/20">
                            <ScrollArea className="h-[300px] md:h-[400px] w-full p-4">
                                <div className="flex flex-col items-center gap-4">
                                    {isGeneratingPreview ? (
                                        <div className="flex flex-col items-center gap-2 py-10 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20 stroke-[3]" />
                                            <p className="text-[8px] md:text-[9px] font-black uppercase text-primary animate-pulse tracking-widest">Rendering...</p>
                                        </div>
                                    ) : previewImages.map((img, i) => (
                                        <div key={i} className="shadow-xl border-2 border-white rounded-sm overflow-hidden bg-white max-w-[250px]">
                                            <img src={img} alt={`Page ${i+1}`} className="max-w-full h-auto" />
                                            <div className="bg-muted text-[7px] font-black py-1 text-center uppercase text-muted-foreground border-t">P{i+1}</div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <CardFooter className="bg-green-500/10 p-3 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-green-500/20">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shrink-0"><CheckCircle2 className="size-6" /></div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-green-800 uppercase tracking-tighter leading-none">READY!</p>
                                    <p className="text-[8px] text-green-700 font-bold mt-0.5 uppercase">Bundle is ready</p>
                                </div>
                            </div>
                            <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-green-600 hover:bg-green-700 text-xs md:text-sm font-black shadow-lg rounded-xl transition-all active:scale-95" onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" /> DOWNLOAD PDF
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>

            <div className="lg:col-span-5 space-y-4">
                <Card className="border-2 shadow-xl border-primary/10 overflow-hidden sticky top-24 rounded-2xl bg-white dark:bg-slate-950">
                    <CardHeader className="bg-primary/5 border-b p-3 md:p-4">
                        <CardTitle className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                            <LayoutList className="size-4 text-primary" /> Organize & Sort
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-6">
                        
                        <div className="space-y-3">
                            <Label className="text-[8px] md:text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2 mb-2">
                                <ArrowUpDown className="size-3" /> Sorting Options
                            </Label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <Button 
                                    variant="outline" 
                                    className="h-auto flex-col gap-1 py-2 border rounded-xl bg-white dark:bg-slate-900 hover:border-primary/50 transition-all group"
                                    onClick={() => sortFiles('asc')}
                                    disabled={pdfFiles.length < 2}
                                >
                                    <div className="size-6 rounded-full bg-primary/5 flex items-center justify-center">
                                        <ArrowDownAz className="size-3.5 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[8px] font-black uppercase leading-tight">A TO Z</div>
                                    </div>
                                </Button>

                                <Button 
                                    variant="outline" 
                                    className="h-auto flex-col gap-1 py-2 border rounded-xl bg-white dark:bg-slate-900 hover:border-primary/50 transition-all group"
                                    onClick={() => sortFiles('desc')}
                                    disabled={pdfFiles.length < 2}
                                >
                                    <div className="size-6 rounded-full bg-primary/5 flex items-center justify-center">
                                        <ArrowUpAz className="size-3.5 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[8px] font-black uppercase leading-tight">Z TO A</div>
                                    </div>
                                </Button>

                                <Button 
                                    variant="outline" 
                                    className="h-auto flex-col gap-1 py-2 border rounded-xl bg-white dark:bg-slate-900 hover:border-primary/50 transition-all group"
                                    onClick={() => sortFiles('reverse')}
                                    disabled={pdfFiles.length < 2}
                                >
                                    <div className="size-6 rounded-full bg-primary/5 flex items-center justify-center">
                                        <Repeat className="size-3.5 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[8px] font-black uppercase leading-tight">FLIP</div>
                                    </div>
                                </Button>
                            </div>
                        </div>

                        <div className="p-3 bg-primary/5 rounded-xl border-2 border-primary/10 flex gap-3 shadow-sm">
                            <Zap className="size-4 text-yellow-500 shrink-0" />
                            <p className="text-[8px] md:text-[9px] text-muted-foreground font-medium leading-relaxed uppercase">
                                <span className="font-black text-primary">PRO BUNDLING:</span> Our engine preserves original vectors for zero quality loss.
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/10 p-4 border-t-2 border-dashed">
                        <Button className="w-full h-12 md:h-16 text-sm md:text-lg font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-xl transition-all active:scale-95 disabled:opacity-50 group" onClick={handleMergePdfs} disabled={pdfFiles.length < 2 || isMerging}>
                            {isMerging ? (
                                <div className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /><span className="uppercase text-[10px]">COMBINING...</span></div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Merge className="size-4 md:size-6 text-white/50" />
                                    <span className="uppercase tracking-tighter">MERGE PDFS</span>
                                </div>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
                
                <div className="p-3 bg-green-500/5 rounded-xl border border-green-500/10 flex gap-2 items-center">
                    <ShieldCheck className="size-3.5 text-green-600" />
                    <p className="text-[8px] font-black text-green-700 uppercase">100% PRIVATE LOCAL PROCESSING</p>
                </div>
            </div>
        </div>
    );
}
