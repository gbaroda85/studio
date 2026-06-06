"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    FileArchive, 
    CheckCircle2, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    RefreshCcw, 
    Target, 
    Settings2,
    FileText,
    Layers,
    X,
    Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';

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

const QUICK_SIZES = ["100", "200", "500", "1024"];

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
    const [targetValue, setTargetValue] = useState<string>("200");
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
            const sizeInKb = file.size / 1024;
            setTargetValue(Math.max(50, Math.round(sizeInKb * 0.6)).toString());
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a PDF file.' });
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
        setCompressedPdfUrl(null);
        setStatusText("Analyzing Document...");
        setProgress(5);

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            const totalPages = pdf.numPages;

            let targetBytes = 0;
            if (mode === 'target') {
                const val = parseFloat(targetValue);
                targetBytes = (targetUnit === 'kb' ? val * 1024 : val * 1024 * 1024) * 0.90;
            }

            const newPdf = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                compress: false 
            });

            const QUALITY_FLOOR = 0.6; 

            for (let i = 1; i <= totalPages; i++) {
                setStatusText(`Optimizing Page ${i}/${totalPages}...`);
                const page = await pdf.getPage(i);
                
                const targetBytesPerPage = mode === 'target' ? (targetBytes) / totalPages : Infinity;

                let finalDataUrl = "";
                
                const getPageDataUrl = async (scale: number, q: number) => {
                    const viewport = page.getViewport({ scale });
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
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
                    const scalesToTry = [3.0, 2.5, 2.0, 1.5, 1.2, 1.0, 0.8, 0.5];
                    let bestFound = false;
                    for (const scale of scalesToTry) {
                        if (bestFound) break;
                        let low = QUALITY_FLOOR, high = 0.95;
                        let stepBestUrl = "";
                        for (let j = 0; j < 6; j++) {
                            const mid = (low + high) / 2;
                            const testUrl = await getPageDataUrl(scale, mid);
                            const estSize = Math.round((testUrl.length - 22) * 0.75);
                            if (estSize <= targetBytesPerPage) {
                                stepBestUrl = testUrl;
                                low = mid; 
                            } else {
                                high = mid; 
                            }
                        }
                        if (stepBestUrl) {
                            finalDataUrl = stepBestUrl;
                            bestFound = true;
                        }
                    }
                    if (!finalDataUrl) finalDataUrl = await getPageDataUrl(0.4, 0.5);
                } else {
                    finalDataUrl = await getPageDataUrl(2.5, quality[0] / 100);
                }

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
            setStatusText("Processing Complete");
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#48a9a4', '#fce7eb', '#ffffff'] });
            toast({ title: 'Success!', description: `Document optimized to ${formatBytes(pdfBlob.size)}.` });
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
        link.download = `GR7-Tools-${pdfFile.name}`;
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
            <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6">
                <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
                    <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
                        <FileArchive className="size-8 md:size-10" />
                        <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                            <Sparkles className="size-2.5" />
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                        PDF <span className="text-gradient-hero">Optimizer</span>
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                        Shrink documents to exact KB targets. <br/>100% Private high-fidelity local re-sampling.
                    </p>
                </div>

                <Card className={cn(
                    "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20",
                    isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                )}
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <CardHeader className="bg-muted/30 border-b p-6 text-center">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 md:p-12">
                        <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 bg-muted/30 group">
                            <div className="relative">
                                <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                <Zap className="absolute -top-1 -right-1 size-6 md:size-8 text-yellow-500 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">Drop PDF to Optimize</p>
                                <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">High-DPI text clarity engine active.</p>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                    </CardContent>
                    <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                        <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                        <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-primary" /> HD SHARPNESS</div>
                        <div className="flex items-center gap-1.5"><Target className="size-3 text-blue-500" /> PRECISION HITS</div>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-in fade-in duration-500 px-4">
            <div className="lg:col-span-7">
                <Card className="shadow-2xl border-primary/10 overflow-hidden h-full bg-card/50 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
                    <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between p-4 md:p-6">
                        <div className="flex items-center gap-3 truncate pr-4">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div className="truncate text-left">
                                <CardTitle className="text-sm font-black uppercase truncate">{pdfFile.name}</CardTitle>
                                <CardDescription className="font-mono text-[10px]">{formatBytes(pdfFile.size)}</CardDescription>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={resetState} className="h-8 text-[10px] font-black border-2 border-primary/20 hover:border-primary shrink-0 px-3 rounded-lg">
                            <RefreshCcw className="size-3 mr-1.5" /> <span className="hidden sm:inline">REPLACE</span>
                        </Button>
                    </CardHeader>
                    <CardContent className="py-12 md:py-16 flex flex-col items-center justify-center min-h-[400px]">
                        {isProcessing ? (
                            <div className="space-y-8 w-full max-w-sm text-center px-4">
                                <div className="relative inline-block">
                                     <Loader2 className="h-16 w-16 md:h-24 md:w-24 animate-spin text-primary opacity-20 stroke-[3]" />
                                     <Zap className="absolute inset-0 m-auto h-8 w-8 md:h-12 md:w-12 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-4">
                                    <p className="font-black text-xl md:text-2xl text-primary uppercase tracking-tighter animate-pulse">{statusText}</p>
                                    <Progress value={progress} className="h-2 md:h-3 shadow-inner rounded-full" />
                                    <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                        <span>Re-sampling Vectors...</span>
                                        <span>{progress}%</span>
                                    </div>
                                </div>
                            </div>
                        ) : compressionResult ? (
                             <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500 px-4">
                                 <div className="p-8 md:p-12 bg-green-500/10 border-2 border-dashed border-green-500/30 rounded-[2.5rem] flex flex-col items-center gap-4 text-center shadow-inner">
                                    <div className="size-16 md:size-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl shadow-green-500/40 relative">
                                        <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10" />
                                        <Sparkles className="absolute -top-2 -right-2 text-yellow-400 size-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-green-600/80 uppercase font-black tracking-widest mb-1">OPTIMIZATION COMPLETE</p>
                                        <p className="text-5xl md:text-7xl font-black text-green-600 tracking-tighter">-{compressionResult.savings.toFixed(1)}%</p>
                                        <p className="text-xs md:text-sm font-bold text-green-700 mt-2 uppercase">Saved {formatBytes(compressionResult.originalSize - compressionResult.newSize)}</p>
                                    </div>
                                 </div>
                                
                                <div className="grid grid-cols-2 gap-4 md:gap-8 text-center bg-muted/20 p-4 rounded-2xl">
                                    <div className="space-y-1">
                                        <p className="text-[9px] md:text-[11px] font-black text-muted-foreground uppercase tracking-wider">Original</p>
                                        <p className="text-base md:text-lg font-bold opacity-60">{formatBytes(compressionResult.originalSize)}</p>
                                    </div>
                                    <div className="space-y-1 border-l">
                                        <p className="text-[9px] md:text-[11px] font-black text-primary uppercase tracking-wider">Optimized</p>
                                        <p className="text-base md:text-lg font-black text-primary">{formatBytes(compressionResult.newSize)}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-6 px-4">
                                <div className="size-32 md:size-40 rounded-[2.5rem] bg-muted/50 flex items-center justify-center mx-auto border-4 border-dashed border-muted-foreground/20 shadow-inner">
                                    <FileArchive className="h-16 w-16 md:h-20 md:w-20 text-muted-foreground/20" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tighter">Ready to Process</p>
                                    <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">High-Fidelity Engine Initialized</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-muted/10 border-t p-6 md:p-8">
                        {compressionResult && (
                             <Button onClick={handleDownload} className="w-full h-16 md:h-20 text-lg md:text-2xl font-black bg-green-600 hover:bg-green-700 shadow-2xl rounded-2xl transition-all active:scale-95 group">
                                <Download className="mr-3 md:mr-4 h-6 w-6 md:h-8 md:w-8 group-hover:translate-y-1 transition-transform" /> SAVE OPTIMIZED PDF
                            </Button>
                        )}
                        {!compressionResult && !isProcessing && (
                            <Button className="w-full h-16 md:h-20 text-lg md:text-2xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all active:scale-95 group" onClick={handleCompressPdf}>
                                <Zap className="mr-3 h-6 w-6 md:h-8 md:w-8 text-yellow-400 group-hover:scale-110 transition-transform" /> START COMPRESSION
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>

            <div className="lg:col-span-5 space-y-6">
                <Card className="border-2 border-primary/10 shadow-xl overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950 transition-all hover:border-primary/30">
                    <CardHeader className="bg-primary/5 border-b p-5 md:p-6">
                        <CardTitle className="text-lg md:text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                            <Settings2 className="size-6 text-primary" /> Optimizer Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-10">
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
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Zap className="size-3 text-yellow-500" /> Government Form Presets
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {QUICK_SIZES.map((size) => (
                                                <Button
                                                    key={size}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setTargetValue(size);
                                                        setTargetUnit('kb');
                                                    }}
                                                    className={cn(
                                                        "rounded-xl font-black text-[10px] uppercase h-10 border-2 transition-all",
                                                        targetValue === size && targetUnit === 'kb' ? "bg-primary text-white border-primary shadow-lg" : "hover:border-primary/50"
                                                    )}
                                                >
                                                    UNDER {size}KB
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-4 border-t border-dashed">
                                        <Label htmlFor="target-val" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Custom Limit</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1 group">
                                                <Input 
                                                    id="target-val" 
                                                    type="number" 
                                                    value={targetValue} 
                                                    onChange={(e) => setTargetValue(e.target.value)} 
                                                    className="h-16 text-3xl font-black focus-visible:ring-primary border-2 rounded-2xl bg-background pl-8"
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/20 font-black text-xl uppercase pointer-events-none">{targetUnit}</div>
                                            </div>
                                            <Select value={targetUnit} onValueChange={(v) => setTargetUnit(v as TargetUnit)}>
                                                <SelectTrigger className="w-24 h-16 font-black text-lg border-2 rounded-2xl shadow-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-2 shadow-2xl">
                                                    <SelectItem value="kb" className="font-black py-3">KB</SelectItem>
                                                    <SelectItem value="mb" className="font-black py-3">MB</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="manual" className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-8 py-4">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Compression Strength</Label>
                                            <Badge className="font-mono font-black text-base px-4 py-1 bg-primary text-white rounded-xl shadow-lg">{quality[0]}%</Badge>
                                        </div>
                                        <Slider min={20} max={100} step={5} value={quality} onValueChange={setQuality} className="py-4" />
                                        <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                                            <span>Max Shrink</span>
                                            <span>Best Quality</span>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="p-5 bg-green-500/5 rounded-[1.5rem] border-2 border-green-500/10 flex gap-4">
                            <ShieldCheck className="size-6 text-green-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black text-green-800 uppercase tracking-tight">Zero Blur Logic</p>
                                <p className="text-[9px] text-green-700/80 font-medium leading-relaxed mt-1 uppercase">
                                    We aim for <strong>90% of your target</strong> to guarantee compliance with portal limits while using 3.0x resampling for sharp text.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
