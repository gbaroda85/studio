
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect, useCallback } from 'react';
import * as pdfjs from 'pdfjs-dist';
import jsPDF from 'jspdf';
import Link from 'next/link';
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
    Eye,
    Lock,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import confetti from 'canvas-confetti';
import { useFileStore } from '@/lib/file-store';
import { motion, AnimatePresence } from "framer-motion";

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs`;
}

const StarIcons = () => (
    <>
        <div className="star-1 pointer-events-none">
            <svg viewBox="0 0 784.11 815.53" className="fill-white">
                <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-2 pointer-events-none">
            <svg viewBox="0 0 784.11 815.53" className="fill-white">
                <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-3 pointer-events-none">
            <svg viewBox="0 0 784.11 815.53" className="fill-white">
                <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
    </>
);

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
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
    const { sharedFile, setSharedFile } = useFileStore();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isProtected, setIsProtected] = useState<boolean | null>(null);
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

    const checkEncryption = async (file: File) => {
        setIsChecking(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjs.getDocument({ 
                data: new Uint8Array(arrayBuffer),
                cMapUrl: 'https://unpkg.com/pdfjs-dist@4.2.67/cmaps/',
                cMapPacked: true
            });
            await loadingTask.promise;
            setIsProtected(false);
        } catch (error: any) {
            if (error.name === 'PasswordException' || error.message?.toLowerCase().includes('password')) {
                setIsProtected(true);
                setSharedFile(file);
            } else {
                setIsProtected(null);
            }
        } finally {
            setIsChecking(false);
        }
    };
    
    const handleFileChange = useCallback((file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setCompressedPdfUrl(null);
            setCompressionResult(null);
            setIsProtected(null);
            setProgress(0);
            setStatusText("");
            const sizeInKb = file.size / 1024;
            setTargetValue(Math.max(50, Math.round(sizeInKb * 0.5)).toString());
            checkEncryption(file);
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a PDF file.' });
        }
    }, [toast, setSharedFile]);

    useEffect(() => {
        if (sharedFile) {
            handleFileChange(sharedFile);
            setSharedFile(null);
        }
    }, [sharedFile, handleFileChange, setSharedFile]);

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };
    
    const handleCompressPdf = async () => {
        if (!pdfFile || isProtected) return;
        setIsProcessing(true);
        setCompressionResult(null);
        setCompressedPdfUrl(null);
        setStatusText("Calibrating Engine...");
        setProgress(2);

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            const totalPages = pdf.numPages;

            let targetBytes = 0;
            if (mode === 'target') {
                const val = parseFloat(targetValue);
                targetBytes = (targetUnit === 'kb' ? val * 1024 : val * 1024 * 1024) * 0.98;
            }

            const newPdf = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                compress: false 
            });

            const QUALITY_FLOOR = 0.55; 

            for (let i = 1; i <= totalPages; i++) {
                setStatusText(`Optimizing P${i}...`);
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

                    const amount = 0.1;
                    const weights = [0, -amount, 0, -amount, 1 + (4 * amount), -amount, 0, -amount, 0];
                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imgData.data;
                    const output = ctx.createImageData(canvas.width, canvas.height);
                    const dst = output.data;
                    const w = canvas.width;
                    const h = canvas.height;

                    for (let y = 1; y < h - 1; y++) {
                        for (let x = 1; x < w - 1; x++) {
                            const dstOff = (y * w + x) * 4;
                            let r = 0, g = 0, b = 0;
                            for (let cy = 0; cy < 3; cy++) {
                                for (let cx = 0; cx < 3; cx++) {
                                    const srcOff = ((y + cy - 1) * w + (x + cx - 1)) * 4;
                                    const wt = weights[cy * 3 + cx];
                                    r += data[srcOff] * wt;
                                    g += data[srcOff + 1] * wt;
                                    b += data[srcOff + 2] * wt;
                                }
                            }
                            dst[dstOff] = r; dst[dstOff + 1] = g; dst[dstOff + 2] = b; dst[dstOff + 3] = data[dstOff + 3];
                        }
                    }
                    ctx.putImageData(output, 0, 0);

                    return canvas.toDataURL('image/jpeg', q);
                };

                if (mode === 'target') {
                    const scalesToTry = [1.5, 1.0];
                    let bestFound = false;

                    for (const scale of scalesToTry) {
                        if (bestFound) break;
                        
                        const midUrl = await getPageDataUrl(scale, 0.75);
                        const midSize = Math.round((midUrl.length - 22) * 0.75);
                        
                        if (midSize <= targetBytesPerPage) {
                            finalDataUrl = midUrl;
                            bestFound = true;
                        } else {
                            const floorUrl = await getPageDataUrl(scale, QUALITY_FLOOR);
                            const floorSize = Math.round((floorUrl.length - 22) * 0.75);
                            if (floorSize <= targetBytesPerPage || scale === 1.0) {
                                finalDataUrl = floorUrl;
                                bestFound = true;
                            }
                        }
                    }
                } else {
                    finalDataUrl = await getPageDataUrl(2.0, quality[0] / 100);
                }

                const viewport = page.getViewport({ scale: 1.0 });
                const orientation = viewport.width > viewport.height ? 'l' : 'p';
                if (i === 1) newPdf.deletePage(1);
                newPdf.addPage([viewport.width, viewport.height], orientation);
                newPdf.addImage(finalDataUrl, 'JPEG', 0, 0, viewport.width, viewport.height, undefined, 'FAST');
                setProgress(Math.round((i / totalPages) * 100));
            }

            const pdfBlob = newPdf.output('blob');
            setCompressionResult({
                originalSize: pdfFile.size,
                newSize: pdfBlob.size,
                savings: Math.max(0, ((pdfFile.size - pdfBlob.size) / pdfFile.size) * 100)
            });
            setCompressedPdfUrl(URL.createObjectURL(pdfBlob));
            setStatusText("Processing Complete");
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#48a9a4', '#fce7eb', '#ffffff'] });
            toast({ title: 'PDF Compressed!', description: `Size reduced to ${formatBytes(pdfBlob.size)}` });
        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Internal processing failed.' });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDownload = () => {
        if (!compressedPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = compressedPdfUrl;
        link.download = `Optimized_${pdfFile.name}`;
        link.click();
    }

    const resetState = () => {
        setPdfFile(null);
        setCompressedPdfUrl(null);
        setCompressionResult(null);
        setIsProtected(null);
        setProgress(0);
        setStatusText("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    if (!pdfFile) {
        return (
            <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 mb-4">
                    <div className="mx-auto mb-2 grid size-16 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-xl relative">
                        <FileArchive className="size-8" />
                        <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                            <Sparkles className="size-2.5" />
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                        PDF <span className="text-gradient-hero">Optimizer Studio</span>
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                        Reduce PDF size while maintaining sharp text. <br/>100% Private local RAM processing.
                    </p>
                </motion.div>

                <Card className={cn(
                    "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 dark:hover:shadow-primary/20 cursor-pointer select-none",
                    isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                )}
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <CardHeader className="bg-muted/30 border-b p-6 text-center">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12">
                        <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 bg-muted/30 group">
                            <div className="relative">
                                <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                <Zap className="absolute -top-2 -right-2 size-6 md:size-8 text-yellow-500 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop PDF File here</h3>
                                <p className="text-[10px] md:text-sm text-muted-foreground mt-1 font-bold opacity-60 uppercase">100% Private local RAM processing.</p>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                    </CardContent>
                    <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                        <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                        <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT CROP</div>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                        <Settings2 className="size-5 md:size-6" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter">Optimizer <span className="text-primary">Studio</span></h2>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                <div className="lg:col-span-7 h-full">
                    <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                        <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between p-4 md:p-6">
                            <div className="flex items-center gap-3 truncate pr-4">
                                <FileText className="size-5 text-primary shrink-0" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest truncate">{pdfFile?.name || 'Document'}</CardTitle>
                            </div>
                            <Badge className="font-mono text-[9px] bg-white border-primary/10 text-primary">{formatBytes(pdfFile?.size || 0)}</Badge>
                        </CardHeader>
                        <CardContent className="p-6 md:p-12 flex-1 bg-slate-50 dark:bg-slate-900/50 shadow-inner min-h-[450px] flex flex-col items-center justify-center relative">
                            {isChecking ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Encryption Scan...</p>
                                </div>
                            ) : isProtected ? (
                                <div className="w-full max-w-sm space-y-6 text-center animate-in zoom-in-95">
                                    <div className="size-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto shadow-inner border-2 border-rose-200"><Lock className="size-8" /></div>
                                    <p className="text-sm font-bold text-rose-800 uppercase leading-relaxed">Protected Document. <br/>Unlock it to enable compression.</p>
                                    <Button asChild variant="outline" className="h-10 border-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all"><Link href="/unlock-pdf">GO TO UNLOCKER</Link></Button>
                                </div>
                            ) : isProcessing ? (
                                <div className="space-y-10 w-full max-w-sm text-center">
                                    <div className="relative inline-block">
                                        <Loader2 className="h-20 w-20 animate-spin text-primary opacity-20 stroke-[3]" />
                                        <Zap className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                                    </div>
                                    <div className="space-y-4">
                                        <p className="font-black text-xl text-primary uppercase tracking-tighter animate-pulse">{statusText}</p>
                                        <Progress value={progress} className="h-2 shadow-inner bg-primary/10" />
                                        <div className="flex justify-between text-[8px] font-black uppercase text-muted-foreground opacity-60"><span>TURBO ENGINE</span><span>{progress}%</span></div>
                                    </div>
                                </div>
                            ) : compressionResult ? (
                                <div className="w-full max-w-sm space-y-8 animate-in zoom-in-95 text-center">
                                    <div className="p-10 bg-green-500/10 border-2 border-dashed border-green-500/30 rounded-[3rem] flex flex-col items-center gap-4 shadow-inner">
                                        <div className="size-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl relative">
                                            <CheckCircle2 className="h-10 w-10" />
                                            <Sparkles className="absolute -top-2 -right-2 text-yellow-400 size-8" />
                                        </div>
                                        <p className="text-6xl font-black text-green-600 tracking-tighter">-{compressionResult.savings.toFixed(1)}%</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-center bg-muted/20 p-6 rounded-2xl border">
                                        <div><p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Original</p><p className="text-sm font-bold opacity-40">{formatBytes(compressionResult.originalSize)}</p></div>
                                        <div className="border-l border-white/20">
                                            <p className="text-[10px] font-black text-primary uppercase">Optimized</p>
                                            <p className="text-lg font-black text-primary">{formatBytes(compressionResult.newSize)}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6 text-center">
                                     <div className="size-32 rounded-[2.5rem] bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center border-2 border-dashed border-primary/20"><FileArchive className="size-16 text-primary/10" /></div>
                                     <div className="space-y-1">
                                        <p className="text-lg font-black uppercase tracking-tighter text-slate-800 dark:text-white">Ready for Optimization</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Local buffer initialized.</p>
                                     </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <Button variant="outline" onClick={resetState} className="flex-1 sm:flex-none h-12 px-6 border-2 font-black text-[10px] uppercase rounded-xl hover:bg-destructive/5 hover:text-destructive transition-all">
                                    <RefreshCcw className="mr-1.5 size-3" /> Start Over
                                </Button>
                                <div className="hidden md:flex items-center gap-2 text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                    <ShieldCheck className="size-4 text-green-500" /> SECURE RAM
                                </div>
                            </div>

                            {!compressionResult ? (
                                <Button 
                                    className="magic-button w-full sm:w-auto h-16 md:h-18 text-lg font-black bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary-foreground transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 px-12" 
                                    onClick={handleCompressPdf} 
                                    disabled={isProcessing || isProtected === true}
                                >
                                    <StarIcons />
                                    {isProcessing ? "PROCESSING..." : "OPTIMIZE NOW"}
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleDownload} 
                                    className="magic-button magic-button-success w-full sm:w-auto h-16 md:h-18 text-lg font-black bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-primary-foreground rounded-full transition-all active:scale-95 flex items-center justify-center gap-4 px-12"
                                >
                                    <StarIcons />
                                    <Download className="mr-3 size-8" /> SAVE PDF
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-5 md:p-8">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                <Settings2 className="size-4 md:size-5 text-primary" /> Optimization Engine
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-10">
                            <Tabs value={mode} onValueChange={(v) => setMode(v as CompressionMode)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-background p-1.5 rounded-xl border-2">
                                    <TabsTrigger value="target" className="font-black text-[9px] uppercase tracking-widest">Strict Limit</TabsTrigger>
                                    <TabsTrigger value="manual" className="font-black text-[9px] uppercase tracking-widest">Manual Mode</TabsTrigger>
                                </TabsList>
                                <TabsContent value="target" className="space-y-6 animate-in fade-in duration-300">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                                            <Zap className="size-3 text-yellow-500" /> Fast Presets
                                        </Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {QUICK_SIZES.map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => { setTargetValue(size); setTargetUnit('kb'); }}
                                                    className={cn("btn-pos-uiverse h-10 transition-all", targetValue === size && targetUnit === 'kb' && "active-uiverse")}
                                                    data-label={size === "1024" ? "1MB" : `${size}K`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-dashed">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Custom Size Limit</Label>
                                        <div className="flex gap-3">
                                            <Input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className="h-12 text-lg font-black border-2 rounded-xl bg-background shadow-inner" />
                                            <Select value={targetUnit} onValueChange={(v) => setTargetUnit(v as TargetUnit)}>
                                                <SelectTrigger className="w-28 h-12 font-black border-2 rounded-xl"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl font-black"><SelectItem value="kb">KB</SelectItem><SelectItem value="mb">MB</SelectItem></SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="manual" className="space-y-8 animate-in fade-in duration-300">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1"><Label className="text-[10px] font-black uppercase">Compression Strength</Label><Badge variant="secondary" className="font-black text-xs px-3 py-1 bg-primary text-white">{100 - quality[0]}%</Badge></div>
                                        <Slider min={10} max={95} step={5} value={quality} onValueChange={setQuality} className="py-2" />
                                        <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase opacity-40"><span>Max Speed</span><span>Best Clarity</span></div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="p-5 bg-green-500/5 rounded-2xl border-2 border-green-500/10 flex gap-4 shadow-sm">
                                <AlertCircle className="size-6 text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">HD Text Enhancement</p>
                                    <p className="text-[9px] text-green-700/60 font-medium leading-relaxed uppercase mt-1">
                                        Our new "Sharp-Edge" kernel is active. Fonts stay readable even at 10% size ratio.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-4 border-t border-white/10 flex justify-center">
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30 text-center">GR7 TURBO COMPRESSION ENGINE</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
