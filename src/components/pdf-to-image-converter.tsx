
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UploadCloud, 
  Loader2, 
  Download, 
  ImageIcon, 
  X, 
  RefreshCcw, 
  ShieldCheck, 
  Zap, 
  CheckCircle2,
  Layers,
  Settings2,
  FileArchive,
  Search,
  Eye,
  MonitorCheck
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from './ui/scroll-area';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

type OutputFormat = 'png' | 'jpeg';

export default function PdfToImageConverter() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isZipping, setIsZipping] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
    const [isDragOver, setIsDragOver] = useState(false);
    const [progress, setProgress] = useState(0);
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
        setProgress(5);
        const fileReader = new FileReader();

        fileReader.onload = async (e) => {
            const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
            try {
                const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
                const urls: string[] = [];
                const mimeType = `image/${outputFormat}`;
                const totalPages = pdf.numPages;

                for (let i = 1; i <= totalPages; i++) {
                    const page = await pdf.getPage(i);
                    // Higher scale for HD quality extraction
                    const viewport = page.getViewport({ scale: 2.5 }); 
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d', { willReadFrequently: true });
                    canvas.height = Math.floor(viewport.height);
                    canvas.width = Math.floor(viewport.width);
                    
                    if (context) {
                        context.fillStyle = '#FFFFFF';
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        await page.render({ canvasContext: context, viewport: viewport }).promise;
                        urls.push(canvas.toDataURL(mimeType, 1.0));
                    }
                    setProgress(Math.round((i / totalPages) * 100));
                }
                setImageUrls(urls);
                toast({ title: 'Success', description: `Extracted ${urls.length} pages as high-quality images.` });
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not extract images from PDF.' });
            } finally {
                setIsProcessing(false);
            }
        };

        fileReader.readAsArrayBuffer(file);
    };
    
    const handleDownload = (url: string, index: number) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `page-${index + 1}.${outputFormat === 'jpeg' ? 'jpg' : 'png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleDownloadAll = async () => {
        if (imageUrls.length === 0 || !pdfFile) return;

        setIsZipping(true);
        toast({ title: 'Creating Archive...', description: 'Packaging pages into a ZIP file.' });

        try {
            const zip = new JSZip();
            const ext = outputFormat === 'jpeg' ? 'jpg' : 'png';
            
            imageUrls.forEach((url, index) => {
                const base64Data = url.split(',')[1];
                zip.file(`page-${index + 1}.${ext}`, base64Data, { base64: true });
            });

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            const zipName = pdfFile.name.replace(/\.pdf$/i, '') || 'extracted-images';
            link.download = `${zipName}-images.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            toast({ title: 'Download Started', description: 'Your ZIP file is ready.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create ZIP archive.' });
        } finally {
            setIsZipping(false);
        }
    };

    const handleReset = () => {
        setPdfFile(null);
        setImageUrls([]);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    
    if (!pdfFile) {
        return (
            <Card
                className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/10 border-foreground/10", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                <CardHeader>
                    <div className="mx-auto mb-4 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
                        <ImageIcon className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-black uppercase tracking-tight">PDF to Image Studio</CardTitle>
                    <CardDescription>Convert every page of your PDF into high-quality JPG or PNG images instantly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div>
                            <p className="text-xl font-bold uppercase tracking-tight">Drop PDF here to Extract</p>
                            <p className="text-sm text-muted-foreground mt-2 font-medium">100% Private local processing. No server storage.</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
                <CardFooter className="justify-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6">
                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> HD EXTRACTION</div>
                    <div className="flex items-center gap-2"><FileArchive className="h-4 w-4 text-purple-500" /> ZIP SUPPORT</div>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Workspace Area */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-2 shadow-2xl overflow-hidden bg-card/50">
                        <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">Extraction Workspace</CardTitle>
                                <CardDescription className="truncate max-w-[200px] md:max-w-md font-mono text-[10px] mt-1">{pdfFile.name}</CardDescription>
                            </div>
                            {imageUrls.length > 0 && <Badge className="bg-primary text-white font-black uppercase">{imageUrls.length} PAGES FOUND</Badge>}
                        </CardHeader>
                        <CardContent className="p-6">
                            {isProcessing ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-8">
                                    <div className="relative">
                                        <Loader2 className="h-20 w-20 animate-spin text-primary stroke-[3]" />
                                        <Zap className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                                    </div>
                                    <div className="space-y-4 w-full max-w-sm text-center">
                                        <p className="font-black text-2xl text-primary uppercase tracking-tighter animate-pulse">Rendering PDF Pages...</p>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Optimizing memory threads for HD output</p>
                                    </div>
                                </div>
                            ) : (
                                <ScrollArea className="h-[550px] pr-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
                                        {imageUrls.map((url, index) => (
                                            <div key={index} className="group relative rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary transition-all bg-white shadow-md hover:shadow-xl transform active:scale-95">
                                                <div className="aspect-[3/4] relative bg-muted/20">
                                                    <Image src={url} alt={`Page ${index + 1}`} fill className="object-contain p-2" />
                                                    <div className="absolute top-2 left-2 z-20 size-7 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button size="sm" className="h-9 px-4 font-black text-[10px] uppercase shadow-xl" onClick={() => handleDownload(url, index)}>
                                                        <Download className="mr-1.5 h-3.5 w-3.5" /> Save {outputFormat.toUpperCase()}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                        <CardFooter className="bg-muted/10 border-t p-4 flex justify-between items-center">
                            <Button variant="ghost" onClick={handleReset} className="text-xs font-black uppercase text-destructive hover:bg-destructive/5">
                                <RefreshCcw className="mr-2 h-4 w-4" /> Change PDF
                            </Button>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                                <ShieldCheck className="h-4 w-4 text-green-500" /> Secure Offline Studio
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* Settings Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950">
                        <CardHeader className="bg-primary/5 border-b p-6">
                            <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                                <Settings2 className="size-6 text-primary" /> Extraction Studio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                    <MonitorCheck className="size-3" /> Output Format
                                </Label>
                                <Select value={outputFormat} onValueChange={(v) => { setOutputFormat(v as OutputFormat); if(pdfFile) handlePdfToImage(pdfFile); }} disabled={isProcessing}>
                                    <SelectTrigger className="h-14 font-black text-sm border-2 rounded-2xl shadow-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl border-2">
                                        <SelectItem value="png" className="font-bold py-3">Lossless PNG (Crystal Clear)</SelectItem>
                                        <SelectItem value="jpeg" className="font-bold py-3">High-Quality JPEG (Optimized)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground italic font-medium leading-relaxed">
                                    PNG is recommended for documents with text, while JPEG is better for photos.
                                </p>
                            </div>

                            <div className="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10 flex gap-4">
                                <Zap className="size-6 text-yellow-500 shrink-0" />
                                <p className="text-[10px] text-primary/80 font-bold leading-relaxed">
                                    <span className="font-black uppercase block mb-1">HD Engine Active:</span>
                                    Pages are rendered at **2.5x resolution** to ensure fine text remains perfectly readable after extraction.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-8 border-t-2">
                            {imageUrls.length > 0 ? (
                                <Button 
                                    className="w-full h-20 text-xl font-black bg-green-600 hover:bg-green-700 shadow-2xl rounded-2xl transition-all active:scale-95 group" 
                                    onClick={handleDownloadAll}
                                    disabled={isZipping}
                                >
                                    {isZipping ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="size-8 animate-spin" />
                                            <span className="uppercase tracking-tighter">ZIPPING PAGES...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <FileArchive className="size-9 group-hover:scale-110 transition-transform" />
                                            <div className="text-left">
                                                <span className="block uppercase tracking-tighter leading-none">DOWNLOAD ALL</span>
                                                <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Get Secure ZIP Bundle</span>
                                            </div>
                                        </div>
                                    )}
                                </Button>
                            ) : (
                                <Button 
                                    className="w-full h-20 text-xl font-black bg-primary opacity-50 cursor-not-allowed rounded-2xl" 
                                    disabled
                                >
                                    <Search className="mr-3 size-6" /> READY TO PROCESS
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    <div className="p-6 bg-green-500/5 rounded-[2rem] border-2 border-green-500/10 flex gap-4 items-center shadow-sm">
                        <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                            <ShieldCheck className="size-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-green-700 uppercase tracking-tight">Zero Cloud Storage</p>
                            <p className="text-[10px] text-green-600/80 font-medium leading-tight">Extraction happens 100% in browser RAM. Your data stays on your machine.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
