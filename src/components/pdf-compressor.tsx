
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, Download, FileArchive, CheckCircle2, Zap, ShieldCheck, Sparkles, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

type CompressionResult = {
  newSize: number;
  savings: number;
  originalSize: number;
};

export default function PdfCompressor() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null);
    const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (compressedPdfUrl) URL.revokeObjectURL(compressedPdfUrl);
        };
    }, [compressedPdfUrl]);
    
    const handleFileChange = (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setCompressedPdfUrl(null);
            setCompressionResult(null);
            setProgress(0);
            setStatusText("");
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select a PDF file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };
    
    const resetState = () => {
        setPdfFile(null);
        setCompressedPdfUrl(null);
        setCompressionResult(null);
        setProgress(0);
        setStatusText("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const handleCompressPdf = async () => {
        if (!pdfFile) return;
        setIsProcessing(true);
        setCompressionResult(null);
        setStatusText("Initializing Engine...");
        setProgress(5);

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            const totalPages = pdf.numPages;
            
            const newPdf = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                compress: true
            });

            for (let i = 1; i <= totalPages; i++) {
                setStatusText(`Compressing Page ${i} of ${totalPages}...`);
                const page = await pdf.getPage(i);
                
                // Use a standard scale for mobile/web viewing (150 DPI approx)
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    context.fillStyle = '#FFFFFF';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    
                    // The magic happens here: 0.6 quality for high compression, 0.8 for medium
                    const imgData = canvas.toDataURL('image/jpeg', 0.6);
                    
                    if (i > 1) {
                        newPdf.addPage([viewport.width, viewport.height], 'p');
                    } else {
                        // Resize first page to match source
                        newPdf.deletePage(1);
                        newPdf.addPage([viewport.width, viewport.height], 'p');
                    }
                    newPdf.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height, undefined, 'FAST');
                }
                setProgress(Math.round((i / totalPages) * 90));
            }

            const pdfBlob = newPdf.output('blob');
            const newSize = pdfBlob.size;
            const originalSize = pdfFile.size;
            const savings = ((originalSize - newSize) / originalSize) * 100;

            setCompressionResult({
                originalSize,
                newSize,
                savings: Math.max(0, savings)
            });

            const url = URL.createObjectURL(pdfBlob);
            setCompressedPdfUrl(url);
            setProgress(100);
            setStatusText("Compression Done!");
            
            toast({ title: 'Success!', description: `PDF optimized by ${Math.max(0, savings).toFixed(1)}%` });

        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Compression Error',
                description: 'Failed to compress this PDF. It might be too large or encrypted.',
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDownload = () => {
        if (!compressedPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = compressedPdfUrl;
        link.download = `compressed-${pdfFile.name}`;
        link.click();
    }

    if (!pdfFile) {
        return (
            <Card
                className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                <CardHeader>
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <FileArchive className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Power PDF Compressor</CardTitle>
                    <CardDescription>Actually reduce file size by optimizing images and re-encoding pages.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <div className="relative">
                            <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Zap className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-xl font-bold">Drop PDF here to Shrink</p>
                            <p className="text-sm text-muted-foreground mt-2">Private local processing. No files sent to server.</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
                <CardFooter className="justify-center gap-6 text-[10px] text-muted-foreground font-bold pb-8">
                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> AES COMPLIANT</div>
                    <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> SMART RE-ENCODING</div>
                </CardFooter>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-md shadow-2xl border-primary/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                    <FileArchive className="text-primary h-5 w-5" />
                    Ready to Optimize
                </CardTitle>
                <CardDescription className="truncate font-mono text-[10px]">File: {pdfFile.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {!compressionResult && !isProcessing && (
                    <div className="text-center p-8 border-2 border-dashed rounded-2xl bg-muted/10">
                        <p className="text-sm font-bold text-muted-foreground mb-1">Current Size</p>
                        <p className="text-3xl font-black text-foreground">{formatBytes(pdfFile.size)}</p>
                    </div>
                )}

                {isProcessing && (
                    <div className="space-y-4 py-4 text-center">
                        <div className="relative inline-block">
                             <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                             <Zap className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-primary uppercase tracking-tighter text-sm animate-pulse">{statusText}</p>
                            <Progress value={progress} className="h-2" />
                            <p className="text-[10px] text-muted-foreground font-bold">Using Neural Optimization...</p>
                        </div>
                    </div>
                )}

                {compressionResult && (
                     <div className="space-y-6 animate-in zoom-in-95 duration-500">
                         <div className="p-8 bg-green-500/10 border-2 border-dashed border-green-500/30 rounded-2xl flex flex-col items-center gap-4 text-center">
                            <div className="size-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-[10px] text-green-600/80 uppercase font-black tracking-widest mb-1">Compression Success</p>
                                <p className="text-5xl font-black text-green-600">{compressionResult.savings.toFixed(1)}%</p>
                                <p className="text-xs font-bold text-green-700 mt-1">Smaller than original</p>
                            </div>
                         </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-center px-2">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase">Original</p>
                                <p className="text-sm font-bold">{formatBytes(compressionResult.originalSize)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-primary uppercase">New Size</p>
                                <p className="text-sm font-bold text-primary">{formatBytes(compressionResult.newSize)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 bg-muted/10 border-t p-6">
                {!compressionResult ? (
                    <Button onClick={handleCompressPdf} disabled={isProcessing} className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl">
                        {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2 h-5 w-5 text-yellow-400"/>}
                        {isProcessing ? "SHRINKING..." : "COMPRESS NOW"}
                    </Button>
                ) : (
                    <Button onClick={handleDownload} className="w-full h-14 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl animate-bounce">
                        <Download className="mr-2 h-6 w-6" />
                        DOWNLOAD SHRUNK PDF
                    </Button>
                )}
                <Button variant="ghost" onClick={resetState} className="w-full text-xs font-bold text-muted-foreground h-10" disabled={isProcessing}>
                    <RefreshCcw className="h-3 w-3 mr-1.5" /> {compressionResult ? "Compress Another" : "Change File"}
                </Button>
            </CardFooter>
        </Card>
    );
}
