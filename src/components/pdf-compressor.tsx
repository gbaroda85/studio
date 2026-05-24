
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, Download, FileArchive, CheckCircle2, Zap, ShieldCheck, Sparkles, RefreshCcw, Target, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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

type CompressionResult = {
  newSize: number;
  savings: number;
  originalSize: number;
};

type CompressionMode = 'manual' | 'target';
type TargetUnit = 'kb' | 'mb';

export default function PdfCompressor() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null);
    const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
    
    const [mode, setMode] = useState<CompressionMode>('target');
    const [targetValue, setTargetValue] = useState<string>("300");
    const [targetUnit, setTargetUnit] = useState<TargetUnit>('kb');
    const [quality, setQuality] = useState<number[]>([85]);
    
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
            
            // Suggest a target size (approx 60% of original)
            const sizeInKb = file.size / 1024;
            setTargetValue(Math.max(100, Math.round(sizeInKb * 0.6)).toString());
            setTargetUnit('kb');
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select a PDF file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };
    
    const handleCompressPdf = async () => {
        if (!pdfFile) return;
        setIsProcessing(true);
        setCompressionResult(null);
        setStatusText("Analyzing Document...");
        setProgress(5);

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            const totalPages = pdf.numPages;

            let targetBytes = 0;
            if (mode === 'target') {
                const val = parseFloat(targetValue);
                targetBytes = (targetUnit === 'kb' ? val * 1024 : val * 1024 * 1024);
            }

            const newPdf = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                compress: false 
            });

            // Iterate through each page
            for (let i = 1; i <= totalPages; i++) {
                setStatusText(`Processing Page ${i}/${totalPages}...`);
                const page = await pdf.getPage(i);
                
                // IMAGE COMPRESSOR STYLE LOGIC: Iterative Scaling + Binary Quality Search
                const MAX_RENDER_SCALE = 4.0; // High resolution for sharpness
                const QUALITY_FLOOR = 0.7; // Strict readable floor
                const targetBytesPerPage = mode === 'target' ? (targetBytes * 0.95) / totalPages : Infinity;

                let finalScale = MAX_RENDER_SCALE;
                let finalQuality = 0.9;
                let finalDataUrl = "";

                // Rendering logic for one page to find best fit
                const getPageDataUrl = async (scale: number, q: number) => {
                    const viewport = page.getViewport({ scale });
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d', { alpha: false });
                    if (!ctx) return "";
                    canvas.width = Math.floor(viewport.width);
                    canvas.height = Math.floor(viewport.height);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                    return canvas.toDataURL('image/jpeg', q);
                };

                if (mode === 'target') {
                    // Try different scales like the Image tool
                    const scalesToTry = [4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.2, 1.0];
                    let bestFoundForPage = false;

                    for (const scale of scalesToTry) {
                        if (bestFoundForPage) break;

                        // Binary search quality for this scale
                        let low = QUALITY_FLOOR, high = 0.98;
                        let stepBestUrl = "";
                        let stepBestFits = false;

                        for (let j = 0; j < 10; j++) {
                            const mid = (low + high) / 2;
                            const testUrl = await getPageDataUrl(scale, mid);
                            const estSize = Math.round((testUrl.length - 22) * 0.75);

                            if (estSize <= targetBytesPerPage) {
                                stepBestUrl = testUrl;
                                stepBestFits = true;
                                low = mid; // Try higher quality
                            } else {
                                high = mid; // Must lower quality
                            }
                        }

                        if (stepBestFits) {
                            finalDataUrl = stepBestUrl;
                            finalScale = scale;
                            bestFoundForPage = true;
                        }
                    }

                    // Fallback if target is too aggressive
                    if (!finalDataUrl) {
                        finalDataUrl = await getPageDataUrl(1.0, QUALITY_FLOOR);
                    }
                } else {
                    // Manual mode
                    finalDataUrl = await getPageDataUrl(MAX_RENDER_SCALE, quality[0] / 100);
                }

                // Add to PDF
                const viewport = page.getViewport({ scale: 1.0 });
                const orientation = viewport.width > viewport.height ? 'l' : 'p';
                
                if (i === 1) newPdf.deletePage(1);
                newPdf.addPage([viewport.width, viewport.height], orientation);
                newPdf.addImage(finalDataUrl, 'JPEG', 0, 0, viewport.width, viewport.height, undefined, 'FAST');
                
                setProgress(10 + Math.round((i / totalPages) * 90));
            }

            const pdfBlob = newPdf.output('blob');
            setCompressionResult({
                originalSize: pdfFile.size,
                newSize: pdfBlob.size,
                savings: Math.max(0, ((pdfFile.size - pdfBlob.size) / pdfFile.size) * 100)
            });

            setCompressedPdfUrl(URL.createObjectURL(pdfBlob));
            setStatusText("Ready to Download");
            toast({ title: 'Success', description: `Compressed to ${formatBytes(pdfBlob.size)}.` });

        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to process document.' });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDownload = () => {
        if (!compressedPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = compressedPdfUrl;
        link.download = `optimized-${pdfFile.name}`;
        link.click();
    }

    const resetState = () => {
        setPdfFile(null);
        setCompressedPdfUrl(null);
        setCompressionResult(null);
        setProgress(0);
        setStatusText("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    if (!pdfFile) {
        return (
            <Card className={cn("w-full max-w-2xl text-center transition-all duration-300 hover:border-primary/80 border-2 border-dashed mx-auto", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                <CardHeader>
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <FileArchive className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Pro HD PDF Optimizer</CardTitle>
                    <CardDescription>Exactly hit target sizes with high-fidelity sharpness logic.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <div className="relative">
                            <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Zap className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-xl font-bold">Drop PDF here to Optimize</p>
                            <p className="text-sm text-muted-foreground mt-2">Maximum Readability Engine Active (300 DPI Equivalent).</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
                <CardFooter className="justify-center gap-6 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> 100% PRIVATE</div>
                    <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-primary" /> HD SHARPNESS</div>
                    <div className="flex items-center gap-1.5"><Target className="size-3 text-blue-500" /> PRECISION HITS</div>
                </CardFooter>
            </Card>
        );
    }
    
    return (
        <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
            <div className="lg:col-span-7">
                <Card className="shadow-2xl border-primary/10 overflow-hidden h-full bg-card/50">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="text-lg flex items-center gap-2 font-black uppercase tracking-tighter text-primary">
                            <FileArchive className="h-5 w-5" /> OPTIMIZER WORKSPACE
                        </CardTitle>
                        <CardDescription className="truncate font-mono text-[10px]">{pdfFile.name} ({formatBytes(pdfFile.size)})</CardDescription>
                    </CardHeader>
                    <CardContent className="py-12 flex flex-col items-center justify-center min-h-[400px]">
                        {isProcessing ? (
                            <div className="space-y-8 w-full max-w-sm text-center">
                                <div className="relative inline-block">
                                     <Loader2 className="h-24 w-24 animate-spin text-primary opacity-20 stroke-[3]" />
                                     <Zap className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-3">
                                    <p className="font-black text-2xl text-primary uppercase tracking-tighter animate-pulse">{statusText}</p>
                                    <Progress value={progress} className="h-3 shadow-inner rounded-full" />
                                    <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        <span>Re-sampling HD Pixels...</span>
                                        <span>{progress}%</span>
                                    </div>
                                </div>
                            </div>
                        ) : compressionResult ? (
                             <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500">
                                 <div className="p-10 bg-green-500/10 border-2 border-dashed border-green-500/30 rounded-3xl flex flex-col items-center gap-4 text-center">
                                    <div className="size-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl shadow-green-500/40">
                                        <CheckCircle2 className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-green-600/80 uppercase font-black tracking-widest mb-1">HD OPTIMIZED</p>
                                        <p className="text-6xl font-black text-green-600">-{compressionResult.savings.toFixed(1)}%</p>
                                        <p className="text-sm font-bold text-green-700 mt-2">Final Size: {formatBytes(compressionResult.newSize)}</p>
                                    </div>
                                 </div>
                                
                                <div className="grid grid-cols-2 gap-8 text-center px-4">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Original</p>
                                        <p className="text-lg font-bold">{formatBytes(compressionResult.originalSize)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-primary uppercase tracking-wider">Compressed</p>
                                        <p className="text-lg font-bold text-primary">{formatBytes(compressionResult.newSize)}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="size-32 rounded-full bg-muted flex items-center justify-center mx-auto border-4 border-dashed border-muted-foreground/20">
                                    <FileArchive className="h-16 w-16 text-muted-foreground/30" />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-foreground uppercase tracking-tight">READY TO ENCODE</p>
                                    <p className="text-sm text-muted-foreground font-medium italic">Strict Scaling Engine Active.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-muted/10 border-t p-6">
                        {compressionResult && (
                             <Button onClick={handleDownload} className="w-full h-16 text-xl font-black bg-green-600 hover:bg-green-700 shadow-2xl rounded-2xl transition-all active:scale-95">
                                <Download className="mr-3 h-7 w-7" /> DOWNLOAD HD PDF
                            </Button>
                        )}
                        {!compressionResult && !isProcessing && (
                            <Button variant="outline" onClick={resetState} className="w-full h-12 font-black border-2 uppercase text-xs tracking-widest">
                                <RefreshCcw className="mr-2 h-4 w-4" /> Change PDF Document
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>

            <div className="lg:col-span-5 space-y-6">
                <Card className="border-2 border-primary/10 shadow-xl overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                            <Settings2 className="h-5 w-5 text-primary" /> Optimizer Panel
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 pb-8 space-y-8">
                        <Tabs value={mode} onValueChange={(v) => setMode(v as CompressionMode)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8 h-14 p-1.5 bg-muted rounded-2xl border-2">
                                <TabsTrigger value="target" className="font-black text-[10px] uppercase rounded-xl transition-all">
                                    <Target className="h-4 w-4 mr-2" /> Target Size
                                </TabsTrigger>
                                <TabsTrigger value="manual" className="font-black text-[10px] uppercase rounded-xl transition-all">
                                    <Settings2 className="h-4 w-4 mr-2" /> Manual Mode
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="target" className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-4">
                                    <Label htmlFor="target-val" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Maximum File Limit</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 group">
                                            <Input 
                                                id="target-val" 
                                                type="number" 
                                                value={targetValue} 
                                                onChange={(e) => setTargetValue(e.target.value)} 
                                                className="h-16 text-3xl font-black focus-visible:ring-primary border-2 rounded-2xl bg-background pl-8"
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/30 font-black text-xl uppercase">{targetUnit}</div>
                                        </div>
                                        <Select value={targetUnit} onValueChange={(v) => setTargetUnit(v as TargetUnit)}>
                                            <SelectTrigger className="w-24 h-16 font-black text-lg border-2 rounded-2xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-2 shadow-2xl">
                                                <SelectItem value="kb" className="font-bold py-3">KB</SelectItem>
                                                <SelectItem value="mb" className="font-bold py-3">MB</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="manual" className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Image Quality</Label>
                                        <Badge className="font-mono font-black text-base px-4 py-1 bg-primary text-white rounded-lg">{quality[0]}%</Badge>
                                    </div>
                                    <Slider min={40} max={100} step={5} value={quality} onValueChange={setQuality} className="py-4" />
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="p-5 bg-green-500/5 rounded-2xl border-2 border-green-500/10 flex gap-4">
                            <ShieldCheck className="size-6 text-green-600 shrink-0" />
                            <p className="text-[10px] text-green-800 font-bold leading-relaxed">
                                <span className="font-black uppercase block mb-1">SMART-ADAPTIVE SCALING:</span>
                                We render at up to 4.0x resolution. If target is small, we intelligently reduce scale while keeping quality high. Text remains readable!
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-8 border-t-2">
                        <Button 
                            onClick={handleCompressPdf} 
                            disabled={isProcessing} 
                            className="w-full h-18 text-xl font-black uppercase bg-primary hover:bg-primary/90 rounded-2xl shadow-xl transition-all active:scale-95"
                        >
                            {isProcessing ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>ENCODING...</span>
                                </div>
                            ) : "START COMPRESSION"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
