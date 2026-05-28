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
    MousePointer2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

// Bundle-safe worker URL
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
                const pagesToRender = Math.min(pdf.numPages, 50);
                
                for (let i = 1; i <= pagesToRender; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 0.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    if (context) {
                        context.fillStyle = '#FFFFFF';
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        await page.render({ canvasContext: context, viewport: viewport }).promise;
                        newPreviews.push(canvas.toDataURL('image/jpeg', 0.7));
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
        link.download = `split-${pdfFile.name}`;
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
            <Card
                className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                <CardHeader>
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <Scissors className="h-8 w-8" />
                    </div>
                    <CardTitle>Visual PDF Splitter</CardTitle>
                    <CardDescription>Select pages visually to extract them into a new document.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div>
                            <p className="text-xl font-bold">Drop PDF here to Split</p>
                            <p className="text-sm text-muted-foreground mt-2">Pages will be rendered for visual selection.</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 space-y-6">
                    <Card className="shadow-xl border-primary/10">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Scissors className="text-primary h-5 w-5" />
                                Extraction Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Source Info</span>
                                    <Badge variant="outline" className="font-mono">{totalPages} Pages</Badge>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pages" className="text-xs font-black uppercase text-primary">Pages to extract</Label>
                                    <Input 
                                        id="pages" 
                                        type="text" 
                                        value={pageRanges} 
                                        onChange={(e) => handleRangeInputChange(e.target.value)}
                                        placeholder="e.g., 1-3, 5, 8"
                                        className="h-12 text-lg font-bold border-2 focus-visible:ring-primary"
                                    />
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Type page numbers or ranges, or <strong>click pages</strong> on the right to select them.
                                    </p>
                                </div>
                            </div>

                            {selectedPages.length > 0 && (
                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 animate-in slide-in-from-top-2">
                                    <p className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3 w-3" /> Selection Active
                                    </p>
                                    <p className="text-sm font-bold">
                                        {selectedPages.length} {selectedPages.length === 1 ? 'page' : 'pages'} will be extracted.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 border-t bg-muted/10 p-6">
                            {!splitPdfUrl ? (
                                <Button 
                                    onClick={handleSplitPdf} 
                                    disabled={isProcessing || !pageRanges} 
                                    className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-lg"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Scissors className="mr-2 h-5 w-5"/>}
                                    {isProcessing ? "SPLITTING..." : "EXTRACT PAGES"}
                                </Button>
                            ) : (
                                <Button onClick={handleDownload} className="w-full h-14 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl">
                                    <Download className="mr-2 h-6 w-6" /> DOWNLOAD PDF
                                </Button>
                            )}
                            <Button variant="ghost" onClick={resetState} className="w-full text-xs font-bold text-muted-foreground h-10">
                                <RefreshCcw className="h-3 w-3 mr-1.5" /> Start Over / Change File
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-8">
                    <Card className="border-2 border-foreground/5 shadow-2xl overflow-hidden h-[calc(100vh-200px)] flex flex-col">
                        <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Pages Visually</CardTitle>
                            </div>
                            <div className="flex items-center gap-4">
                                {isRendering && (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                        <span className="text-[10px] font-bold text-primary uppercase animate-pulse">Rendering Previews...</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground/60">
                                    <MousePointer2 className="h-3 w-3" /> Click to toggle
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-6 overflow-hidden">
                            <ScrollArea className="h-full pr-4">
                                {isRendering && previews.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-tighter">Preparing Visual Grid...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {Array.from({ length: totalPages }).map((_, i) => {
                                            const pageNum = i + 1;
                                            const isSelected = selectedPages.includes(pageNum);
                                            const hasPreview = previews[i];

                                            return (
                                                <div 
                                                    key={pageNum}
                                                    onClick={() => togglePageSelection(pageNum)}
                                                    className={cn(
                                                        "group relative cursor-pointer transition-all duration-300 transform active:scale-95",
                                                        "rounded-xl border-2 overflow-hidden bg-white shadow-md",
                                                        isSelected ? "border-primary ring-4 ring-primary/20 scale-105 z-10 shadow-primary/20" : "border-transparent hover:border-muted-foreground/30 hover:shadow-xl"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-2 left-2 z-20 size-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors",
                                                        isSelected ? "bg-primary text-white" : "bg-black/10 text-black/60 backdrop-blur-md"
                                                    )}>
                                                        {pageNum}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute inset-0 z-10 bg-primary/10 flex items-center justify-center animate-in fade-in zoom-in-50 duration-200">
                                                            <div className="size-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white">
                                                                <CheckCircle2 className="h-6 w-6" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="aspect-[3/4] relative bg-muted/20 flex items-center justify-center">
                                                        {hasPreview ? (
                                                            <img 
                                                                src={hasPreview} 
                                                                alt={`Page ${pageNum}`} 
                                                                className={cn(
                                                                    "w-full h-full object-contain p-2 transition-transform group-hover:scale-105",
                                                                    !isSelected && "opacity-80 group-hover:opacity-100"
                                                                )}
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                                                                <Eye className="h-8 w-8" />
                                                                <span className="text-[10px] font-bold">PAGE {pageNum}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
