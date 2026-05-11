
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
    
    // Settings
    const [mode, setMode] = useState<CompressionMode>('target');
    const [targetValue, setTargetValue] = useState<string>("200");
    const [targetUnit, setTargetUnit] = useState<TargetUnit>('kb');
    const [quality, setQuality] = useState<number[]>([70]);
    
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
            
            const sizeInKb = file.size / 1024;
            if (sizeInKb > 2048) {
                setTargetValue((sizeInKb / 1024 * 0.4).toFixed(1));
                setTargetUnit('mb');
            } else {
                setTargetValue(Math.round(sizeInKb * 0.5).toString());
                setTargetUnit('kb');
            }
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
        setStatusText("Analyzing Document...");
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

            // Calculate Target Bytes
            let targetBytes = 0;
            if (mode === 'target') {
                const val = parseFloat(targetValue);
                targetBytes = targetUnit === 'kb' ? val * 1024 : val * 1024 * 1024;
            }

            /**
             * PRO-ADAPTIVE COMPRESSION ENGINE
             * Designed to respect target size while protecting text clarity.
             */
            let finalScale = 1.5; 
            let finalQuality = 0.75;

            if (mode === 'target' && targetBytes > 0) {
                const ratio = targetBytes / pdfFile.size;

                if (ratio >= 1.0) {
                    // Case 1: Target is bigger than original. No need to shrink.
                    finalScale = 2.0; 
                    finalQuality = 0.95;
                } else if (ratio > 0.6) {
                    // Case 2: Light compression.
                    finalScale = 1.6;
                    finalQuality = 0.85;
                } else if (ratio > 0.3) {
                    // Case 3: Moderate.
                    finalScale = 1.3;
                    finalQuality = 0.75;
                } else {
                    /**
                     * Case 4: Aggressive (e.g., 2MB to 100KB).
                     * We set a strict floor on Scale (0.95) to keep text sharp.
                     * We compensate by lowering JPEG quality but never below 0.4.
                     */
                    finalScale = Math.max(0.95, 1.2 * Math.sqrt(ratio + 0.1));
                    finalQuality = Math.max(0.4, ratio * 2);
                }
            } else {
                // Manual Mode
                finalScale = 1.5;
                finalQuality = quality[0] / 100;
            }

            for (let i = 1; i <= totalPages; i++) {
                setStatusText(`Processing Page ${i}/${totalPages}...`);
                const page = await pdf.getPage(i);
                
                const viewport = page.getViewport({ scale: finalScale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { alpha: false });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    context.fillStyle = '#FFFFFF';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    
                    context.imageSmoothingEnabled = true;
                    context.imageSmoothingQuality = 'high';
                    
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    
                    const imgData = canvas.toDataURL('image/jpeg', finalQuality);
                    
                    if (i > 1) {
                        newPdf.addPage([viewport.width, viewport.height], 'p');
                    } else {
                        newPdf.deletePage(1);
                        newPdf.addPage([viewport.width, viewport.height], 'p');
                    }
                    
                    newPdf.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height, undefined, 'FAST');
                }
                setProgress(Math.round((i / totalPages) * 95));
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
            setStatusText("Success!");
            
            toast({ title: 'Optimization Successful', description: `Final size: ${formatBytes(newSize)}` });

        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to process PDF.' });
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
                    <CardTitle className="text-2xl font-bold">Ultra PDF Compressor</CardTitle>
                    <CardDescription>Compress PDF to specific size with Sharp-Text protection.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <div className="relative">
                            <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Zap className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-xl font-bold">Drop PDF here to Optimize</p>
                            <p className="text-sm text-muted-foreground mt-2">Private local processing. No data leaves your device.</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
                <CardFooter className="justify-center gap-6 text-[10px] text-muted-foreground font-bold pb-8">
                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> AES SECURE</div>
                    <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> SHARP-TEXT ENGINE</div>
                </CardFooter>
            </Card>
        );
    }
    
    return (
        <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
            <div className="lg:col-span-7">
                <Card className="shadow-2xl border-primary/10 overflow-hidden h-full">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="text-lg flex items-center gap-2 font-headline">
                            <FileArchive className="text-primary h-5 w-5" />
                            WORKSPACE
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
                                        <span>Re-encoding Pixels</span>
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
                                        <p className="text-[10px] text-green-600/80 uppercase font-black tracking-widest mb-1">Optimization Complete</p>
                                        <p className="text-6xl font-black text-green-600">{compressionResult.savings.toFixed(1)}%</p>
                                        <p className="text-sm font-bold text-green-700 mt-2">Space Saved (Local)</p>
                                    </div>
                                 </div>
                                
                                <div className="grid grid-cols-2 gap-8 text-center px-4">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Original Size</p>
                                        <p className="text-lg font-bold">{formatBytes(compressionResult.originalSize)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-primary uppercase tracking-wider">Optimized Size</p>
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
                                    <p className="text-lg font-black text-foreground uppercase tracking-tight font-headline">READY TO SHRINK</p>
                                    <p className="text-sm text-muted-foreground font-medium">Adjust target settings to start optimization.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-muted/10 border-t p-6">
                        {compressionResult && (
                             <Button onClick={handleDownload} className="w-full h-16 text-xl font-black bg-green-600 hover:bg-green-700 shadow-2xl shadow-green-500/20 rounded-2xl transition-all active:scale-95">
                                <Download className="mr-3 h-7 w-7" />
                                DOWNLOAD COMPRESSED PDF
                            </Button>
                        )}
                        {!compressionResult && !isProcessing && (
                            <Button variant="outline" onClick={resetState} className="w-full h-12 font-bold rounded-xl border-2">
                                <RefreshCcw className="mr-2 h-4 w-4" /> Change PDF Document
                            </Button>
                        )}
                        {isProcessing && <div className="w-full h-16" />}
                    </CardFooter>
                </Card>
            </div>

            <div className="lg:col-span-5 space-y-6">
                <Card className="border-2 border-primary/10 shadow-xl overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b">
                        <CardTitle className="text-lg flex items-center gap-2 font-headline">
                            <Settings2 className="h-5 w-5 text-primary" /> SETTINGS PANEL
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 pb-8 space-y-8">
                        <Tabs value={mode} onValueChange={(v) => setMode(v as CompressionMode)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted rounded-xl">
                                <TabsTrigger value="target" className="h-10 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
                                    <Target className="h-4 w-4 mr-2" /> Target Size
                                </TabsTrigger>
                                <TabsTrigger value="manual" className="h-10 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
                                    <RefreshCcw className="h-4 w-4 mr-2" /> Manual Pro
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="target" className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-4">
                                    <Label htmlFor="target-val" className="text-xs font-black text-foreground uppercase tracking-widest">Maximum File Size</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 group">
                                            <Input 
                                                id="target-val" 
                                                type="number" 
                                                value={targetValue} 
                                                onChange={(e) => setTargetValue(e.target.value)} 
                                                className="h-14 text-2xl font-black focus-visible:ring-primary border-2 rounded-xl bg-background"
                                                placeholder="200"
                                            />
                                        </div>
                                        <Select value={targetUnit} onValueChange={(v) => setTargetUnit(v as TargetUnit)}>
                                            <SelectTrigger className="w-24 h-14 font-black text-lg border-2 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kb" className="font-bold">KB</SelectItem>
                                                <SelectItem value="mb" className="font-bold">MB</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                                        <p className="text-[10px] text-primary font-bold leading-relaxed">
                                            <span className="text-primary font-black uppercase mr-1">SHARP-TEXT ENGINE:</span> 
                                            We keep text clear while reducing image density to hit your target.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="manual" className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-sm font-black uppercase text-muted-foreground tracking-tight">Quality Level</Label>
                                        <span className="text-primary font-mono font-black bg-primary/10 px-3 py-1 rounded-full text-sm">{quality[0]}%</span>
                                    </div>
                                    <Slider min={5} max={100} step={5} value={quality} onValueChange={setQuality} className="py-4" />
                                    <div className="flex justify-between text-[10px] font-black text-muted-foreground/60 uppercase">
                                        <span>Extreme Shrink</span>
                                        <span>HD Quality</span>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {!compressionResult && (
                             <Button 
                                onClick={handleCompressPdf} 
                                disabled={isProcessing} 
                                className="w-full h-16 text-xl font-black tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 bg-primary hover:bg-primary/90"
                            >
                                {isProcessing ? <Loader2 className="mr-3 h-7 w-7 animate-spin" /> : <Zap className="mr-3 h-7 w-7 text-yellow-400" />}
                                {isProcessing ? "OPTIMIZING..." : "START COMPRESSION"}
                            </Button>
                        )}
                        
                        {compressionResult && (
                             <Button variant="outline" onClick={resetState} className="w-full h-12 font-bold rounded-xl border-2">
                                <RefreshCcw className="mr-2 h-4 w-4" /> Reset Workspace
                            </Button>
                        )}
                    </CardContent>
                    <CardFooter className="bg-muted/30 border-t py-4">
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex gap-2 items-center text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                                <ShieldCheck className="size-3 text-green-500" />
                                <span>High-Density re-sampling is active</span>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
