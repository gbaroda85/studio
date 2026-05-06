
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    ArrowUpToLine,
    ArrowDownToLine,
    ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
        clearMergedFile();
        
        const newFiles = Array.from(files || [])
            .filter(file => file.type === 'application/pdf');

        if (newFiles.length === 0 && files && files.length > 0) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select only PDF files.' });
            return;
        }

        // We don't auto-sort here anymore to respect the browser/user's initial selection
        setPdfFiles(prev => [...prev, ...newFiles]);
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFilesChange(e.target.files);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFilesChange(e.dataTransfer.files); };

    const handleRemoveFile = (index: number) => {
        clearMergedFile();
        setPdfFiles(files => files.filter((_, i) => i !== index));
    };

    const moveFile = (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
        const newFiles = [...pdfFiles];
        const file = newFiles.splice(index, 1)[0];
        
        if (direction === 'up') newFiles.splice(Math.max(0, index - 1), 0, file);
        else if (direction === 'down') newFiles.splice(Math.min(pdfFiles.length - 1, index + 1), 0, file);
        else if (direction === 'top') newFiles.unshift(file);
        else if (direction === 'bottom') newFiles.push(file);
        
        setPdfFiles(newFiles);
        clearMergedFile();
    };

    const sortFiles = (order: 'asc' | 'desc' | 'reverse') => {
        let sorted = [...pdfFiles];
        if (order === 'reverse') {
            sorted.reverse();
        } else {
            sorted.sort((a, b) => {
                const cmp = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
                return order === 'asc' ? cmp : -cmp;
            });
        }
        setPdfFiles(sorted);
        clearMergedFile();
        toast({ title: order === 'reverse' ? "Order Reversed" : order === 'asc' ? "Sorted A-Z" : "Sorted Z-A" });
    }
    
    const handleReset = () => {
        setPdfFiles([]);
        clearMergedFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleMergePdfs = async () => {
        if (pdfFiles.length < 2) {
            toast({ variant: 'destructive', title: 'Not enough files', description: 'Please upload at least two PDFs to merge.' });
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
            const url = URL.createObjectURL(blob);
            setMergedPdfUrl(url);
            
            toast({title: 'Success!', description: 'Your PDFs have been merged and are ready to download.'});

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error Merging', description: 'Could not merge the PDFs. One or more files might be corrupt or password-protected.' });
        } finally {
            setIsMerging(false);
        }
    };
    
    const handleDownload = () => {
        if (!mergedPdfUrl) return;
        const link = document.createElement('a');
        link.href = mergedPdfUrl;
        link.download = 'merged.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    return (
        <Card className={cn("w-full max-w-4xl transition-all duration-300 ease-in-out hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 dark:hover:shadow-primary/10 border-foreground/20", isDragOver && "border-primary ring-4 ring-primary/20")}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
            <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold">Merge PDFs</CardTitle>
                        <CardDescription>Combine multiple PDF files into a single document.</CardDescription>
                    </div>
                    {pdfFiles.length > 1 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => sortFiles('reverse')} title="Reverse List">
                                <ArrowUpDown className="h-4 w-4 mr-1" /> Reverse
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => sortFiles('asc')} title="Sort A-Z">
                                <SortAsc className="h-4 w-4 mr-1" /> A-Z
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => sortFiles('desc')} title="Sort Z-A">
                                <SortDesc className="h-4 w-4 mr-1" /> Z-A
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleReset} className="text-destructive hover:text-destructive" title="Clear All">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {pdfFiles.length === 0 ? (
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <UploadCloud className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-foreground">Click to upload or drag and drop PDFs</p>
                            <p className="text-sm text-muted-foreground">Select multiple files to merge them</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {pdfFiles.map((file, index) => (
                             <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2 rounded-lg border border-foreground/10 bg-card hover:bg-accent/50 transition-colors group">
                                 <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-7 w-7" 
                                            onClick={() => moveFile(index, 'top')}
                                            disabled={index === 0}
                                            title="Move to top"
                                        >
                                            <ArrowUpToLine className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-7 w-7" 
                                            onClick={() => moveFile(index, 'up')}
                                            disabled={index === 0}
                                            title="Move up"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-7 w-7" 
                                            onClick={() => moveFile(index, 'down')}
                                            disabled={index === pdfFiles.length - 1}
                                            title="Move down"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-7 w-7" 
                                            onClick={() => moveFile(index, 'bottom')}
                                            disabled={index === pdfFiles.length - 1}
                                            title="Move to bottom"
                                        >
                                            <ArrowDownToLine className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2 truncate">
                                        <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                            {index + 1}
                                        </div>
                                        <FileText className="h-5 w-5 text-red-500 shrink-0" />
                                        <span className="text-sm font-medium truncate max-w-[200px] md:max-w-md" title={file.name}>{file.name}</span>
                                    </div>
                                 </div>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveFile(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                             </div>
                        ))}
                        <div className="pt-2">
                            <Button variant="ghost" className="w-full border-2 border-dashed border-muted-foreground/20 h-12 hover:border-primary/50 hover:bg-primary/5" onClick={() => fileInputRef.current?.click()}>
                                <UploadCloud className="h-5 w-5 text-muted-foreground mr-2" />
                                <span className="text-sm font-medium">Add more files...</span>
                            </Button>
                        </div>
                    </div>
                )}
                <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" multiple onChange={onFileChange} />
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-6 bg-muted/20 rounded-b-lg">
                <div className="text-sm text-muted-foreground">
                    {pdfFiles.length} {pdfFiles.length === 1 ? 'file' : 'files'} selected
                </div>
                <div className="flex gap-3">
                    {!mergedPdfUrl ? (
                        <Button onClick={handleMergePdfs} disabled={isMerging || pdfFiles.length < 2} size="lg" className="font-bold">
                            {isMerging ? <Loader2 className="mr-2 animate-spin" /> : <Merge className="mr-2" />}
                            {isMerging ? 'Merging...' : 'Merge PDFs'}
                        </Button>
                    ) : (
                        <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold animate-bounce">
                            <Download className="mr-2" />
                            Download Merged PDF
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}
