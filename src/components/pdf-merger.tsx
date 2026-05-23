
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
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
    RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function PdfMerger() {
    const { toast } = useToast();
    const [pdfFiles, setPdfFiles] = useState<File[]>([]);
    const [isMerging, setIsMerging] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
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
        if (order === 'reverse') sorted.reverse();
        else {
            sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
            if (order === 'desc') sorted.reverse();
        }
        setPdfFiles(sorted);
        clearMergedFile();
    }
    
    const handleReset = () => {
        setPdfFiles([]);
        clearMergedFile();
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

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
            setMergedPdfUrl(URL.createObjectURL(blob));
            toast({title: 'Merge Success!', description: 'Your PDFs have been combined. Preview below.'});
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
            <div className="lg:col-span-7 space-y-6">
                <Card className={cn(
                    "border-2 transition-all duration-300 bg-card/50 shadow-xl overflow-hidden",
                    isDragOver && "border-primary ring-4 ring-primary/20",
                    pdfFiles.length === 0 && "hover:border-primary/50"
                )} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                    <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-tighter">Merge Workspace</CardTitle>
                            <CardDescription>Arrange files before merging. 100% Secure.</CardDescription>
                        </div>
                        {pdfFiles.length > 0 && <Badge className="bg-primary">{pdfFiles.length} FILES</Badge>}
                    </CardHeader>
                    <CardContent className="p-6">
                        {pdfFiles.length === 0 ? (
                            <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                                <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <UploadCloud className="size-10" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold">Drop PDFs here to Combine</p>
                                    <p className="text-sm text-muted-foreground mt-1">Select multiple files to merge them instantly.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 p-1">
                                {pdfFiles.map((file, index) => (
                                     <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 rounded-2xl border-2 border-transparent bg-white dark:bg-slate-900 hover:border-primary/40 transition-all group shadow-sm">
                                         <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md" onClick={() => moveFile(index, 'up')} disabled={index === 0}><ChevronUp className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md" onClick={() => moveFile(index, 'down')} disabled={index === pdfFiles.length - 1}><ChevronDown className="h-4 w-4" /></Button>
                                            </div>
                                            <div className="flex items-center gap-3 truncate">
                                                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0">{index + 1}</div>
                                                <FileText className="h-5 w-5 text-red-500 shrink-0" />
                                                <span className="text-xs font-bold truncate max-w-[200px]" title={file.name}>{file.name}</span>
                                            </div>
                                         </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveFile(index)}><X className="h-4 w-4" /></Button>
                                     </div>
                                ))}
                                <Button variant="outline" className="w-full border-2 border-dashed h-12 rounded-xl mt-4 font-bold text-xs" onClick={() => fileInputRef.current?.click()}>
                                    <UploadCloud className="size-4 mr-2" /> ADD MORE FILES
                                </Button>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" multiple onChange={onFileChange} />
                    </CardContent>
                    {pdfFiles.length > 0 && (
                        <CardFooter className="bg-muted/10 border-t p-4 flex justify-between items-center">
                            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs font-black uppercase text-destructive hover:bg-destructive/10">
                                <Trash2 className="size-3 mr-1.5"/> CLEAR ALL
                            </Button>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                                <ShieldCheck className="h-4 w-4 text-green-500" /> SECURE LOCAL ENGINE
                            </div>
                        </CardFooter>
                    )}
                </Card>

                {mergedPdfUrl && (
                    <Card className="border-2 border-green-500/20 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
                        <CardHeader className="bg-green-500/5 py-4 border-b border-green-500/20">
                            <CardTitle className="text-xs font-black uppercase flex items-center gap-2 text-green-700">
                                <Eye className="size-4" /> Merged Document Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 bg-white">
                            <iframe src={mergedPdfUrl} className="w-full h-[500px]" title="PDF Preview" />
                        </CardContent>
                        <CardFooter className="bg-green-500/10 p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4 text-center sm:text-left">
                                <div className="size-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl"><CheckCircle2 className="size-8" /></div>
                                <div>
                                    <p className="text-lg font-black text-green-800 uppercase tracking-tighter leading-none">MERGE SUCCESS!</p>
                                    <p className="text-[10px] text-green-700 font-bold mt-1 uppercase tracking-widest">Combined PDF is ready</p>
                                </div>
                            </div>
                            <Button size="lg" className="h-16 px-12 bg-green-600 hover:bg-green-700 text-xl font-black shadow-2xl rounded-2xl transition-all active:scale-95" onClick={handleDownload}>
                                <Download className="mr-3 size-7" /> DOWNLOAD PDF
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>

            <div className="lg:col-span-5 space-y-6">
                <Card className="border-2 shadow-xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                            <FileStack className="size-6 text-primary" /> Organize & Merge
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                <ArrowUpDown className="size-3" /> Sorting Options
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button variant="outline" className="h-12 flex-col rounded-xl border-2" onClick={() => sortFiles('asc')}>
                                    <SortAsc className="size-4 mb-0.5" />
                                    <span className="text-[8px] font-black uppercase">A-Z</span>
                                </Button>
                                <Button variant="outline" className="h-12 flex-col rounded-xl border-2" onClick={() => sortFiles('desc')}>
                                    <SortDesc className="size-4 mb-0.5" />
                                    <span className="text-[8px] font-black uppercase">Z-A</span>
                                </Button>
                                <Button variant="outline" className="h-12 flex-col rounded-xl border-2" onClick={() => sortFiles('reverse')}>
                                    <RefreshCcw className="size-4 mb-0.5" />
                                    <span className="text-[8px] font-black uppercase">REVERSE</span>
                                </Button>
                            </div>
                        </div>

                        <div className="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10 flex gap-4">
                            <Zap className="size-6 text-yellow-500 shrink-0" />
                            <p className="text-[10px] text-primary/80 font-bold leading-relaxed">
                                <span className="font-black uppercase block mb-1">PRO BUNDLING:</span>
                                Combining files happens entirely in RAM. This tool preserves original vectors and quality.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-8 border-t-2">
                        <Button className="w-full h-20 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all active:scale-95 disabled:opacity-50" 
                                onClick={handleMergePdfs} disabled={pdfFiles.length < 2 || isMerging}>
                            {isMerging ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="size-8 animate-spin" />
                                    <span className="uppercase tracking-tighter">COMBINING...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Merge className="size-9" />
                                    <div className="text-left">
                                        <span className="block uppercase tracking-tighter leading-none">MERGE PDFS</span>
                                        <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Process {pdfFiles.length} docs</span>
                                    </div>
                                </div>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
