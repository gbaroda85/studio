
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, Download, FileArchive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

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
    const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null);
    const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Clean up blob URL on unmount
        return () => {
            if (compressedPdfUrl) {
                URL.revokeObjectURL(compressedPdfUrl);
            }
        };
    }, [compressedPdfUrl]);
    
    const clearCompressedFile = () => {
        if (compressedPdfUrl) {
            URL.revokeObjectURL(compressedPdfUrl);
            setCompressedPdfUrl(null);
        }
        setCompressionResult(null);
    }

    const handleFileChange = (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            clearCompressedFile();
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a PDF file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };
    
    const resetState = () => {
        setPdfFile(null);
        clearCompressedFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleCompressPdf = async () => {
        if (!pdfFile) {
            toast({ variant: 'destructive', title: 'No file', description: 'Please upload a PDF file first.' });
            return;
        }
        setIsProcessing(true);
        clearCompressedFile();

        try {
            const existingPdfBytes = await pdfFile.arrayBuffer();
            
            const pdfDoc = await PDFDocument.load(existingPdfBytes, {
                ignoreEncryption: true,
            });

            const compressedPdfBytes = await pdfDoc.save();

            const originalSize = existingPdfBytes.byteLength;
            const newSize = compressedPdfBytes.byteLength;
            const savings = ((originalSize - newSize) / originalSize) * 100;

            setCompressionResult({
                originalSize,
                newSize,
                savings: Math.max(0, savings)
            });

            const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setCompressedPdfUrl(url);
            
            toast({ title: 'Success!', description: 'Your PDF has been compressed and is ready to download.' });

        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error Compressing PDF',
                description: 'An unexpected error occurred. The file might be corrupt or encrypted.',
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
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (!pdfFile) {
        return (
            <Card
                className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                <CardHeader>
                    <CardTitle>Compress PDF</CardTitle>
                    <CardDescription>Upload a PDF to reduce its file size.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground"><span className="text-primary font-semibold">Click to upload</span> or drag and drop a PDF</p>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Compress PDF</CardTitle>
                <CardDescription>Reduce the file size of your PDF.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="font-medium text-sm truncate">File: {pdfFile.name}</div>
                {isProcessing && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin h-8 w-8 text-primary"/>
                        <span className="ml-4 text-muted-foreground">Compressing...</span>
                    </div>
                )}
                {compressionResult && (
                     <div className="space-y-4 pt-4">
                         <div className="text-center">
                            <p className="text-sm text-muted-foreground">Compression Complete</p>
                            <p className="text-4xl font-bold text-accent-foreground">{compressionResult.savings.toFixed(1)}%</p>
                            <p className="text-sm font-medium">Smaller</p>
                         </div>
                        <Progress value={compressionResult.savings} className="h-3 [&>div]:bg-accent" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Original: {formatBytes(compressionResult.originalSize)}</span>
                            <span>New: {formatBytes(compressionResult.newSize)}</span>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                {!compressionResult ? (
                    <Button onClick={handleCompressPdf} disabled={isProcessing} className="w-full">
                        {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <FileArchive className="mr-2"/>}
                        Compress PDF
                    </Button>
                ) : (
                    <Button onClick={handleDownload} className="w-full">
                        <Download className="mr-2" />
                        Download Compressed PDF
                    </Button>
                )}
                <Button variant="ghost" onClick={resetState}>Compress another file</Button>
            </CardFooter>
        </Card>
    );
}
