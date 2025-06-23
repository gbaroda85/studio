
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, Download, Image as ImageIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Set up the worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

type OutputFormat = 'png' | 'jpeg';

export default function PdfToImageConverter() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setImageUrls([]);
            handlePdfToImage(file);
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a PDF file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const handlePdfToImage = async (file: File) => {
        setIsProcessing(true);
        setImageUrls([]);
        const fileReader = new FileReader();

        fileReader.onload = async (e) => {
            const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
            try {
                const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
                const urls: string[] = [];
                const mimeType = `image/${outputFormat}`;

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 }); // Increased scale for better quality
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    if (context) {
                        if (outputFormat === 'jpeg') {
                            context.fillStyle = '#FFFFFF';
                            context.fillRect(0, 0, canvas.width, canvas.height);
                        }
                        await page.render({ canvasContext: context, viewport: viewport }).promise;
                        urls.push(canvas.toDataURL(mimeType, 0.95));
                    }
                }
                setImageUrls(urls);
                toast({ title: 'Success', description: `Extracted ${urls.length} pages from the PDF.` });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not process the PDF file.' });
            } finally {
                setIsProcessing(false);
            }
        };

        fileReader.readAsArrayBuffer(file);
    };
    
    const handleDownload = (url: string, index: number) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `page-${index + 1}.${outputFormat}`;
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
                    <CardTitle>PDF to Image</CardTitle>
                    <CardDescription>Upload a PDF to extract all its pages as images.</CardDescription>
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
        <Card className="w-full max-w-6xl">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <CardTitle>PDF to Image Results</CardTitle>
                        <CardDescription>Found {imageUrls.length || '...'} pages in <span className="font-semibold">{pdfFile.name}</span>.</CardDescription>
                    </div>
                    <div className="w-full sm:w-48 space-y-2">
                        <Label htmlFor="format">Output Format</Label>
                        <Select value={outputFormat} onValueChange={(v) => {setOutputFormat(v as OutputFormat); handlePdfToImage(pdfFile)}} disabled={isProcessing}>
                            <SelectTrigger id="format"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="png">PNG</SelectItem>
                                <SelectItem value="jpeg">JPEG</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isProcessing ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-16">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">Processing your PDF...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imageUrls.map((url, index) => (
                             <div key={index} className="group relative border rounded-md overflow-hidden aspect-[_0.707]">
                                <Image src={url} width={300} height={424} alt={`Page ${index + 1}`} className="w-full h-full object-contain bg-white" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button onClick={() => handleDownload(url, index)}>
                                        <Download className="mr-2 h-4 w-4"/>
                                        Download
                                    </Button>
                                </div>
                             </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={() => { setPdfFile(null); setImageUrls([]); }}>Process Another PDF</Button>
            </CardFooter>
        </Card>
    )
}
