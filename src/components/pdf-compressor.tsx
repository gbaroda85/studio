
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
import confetti from 'canvas-confetti';
import { useFileStore } from '@/lib/file-store';
import { motion, AnimatePresence } from "framer-motion";

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
}

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i}`}>
                <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                    <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
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
        setStatusText("Optimizing Engine...");
        setProgress(2);

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            const totalPages = pdf.numPages;

            let targetBytes = 0;
            if (mode === 'target') {
                const val = parseFloat(targetValue);
                // We target 95% of requested size to account for PDF metadata overhead
                targetBytes = (targetUnit === 'kb' ? val * 1024 : val * 1024 * 1024) * 0.95;
            }

            const newPdf = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                compress: false 
            });

            for (let i = 1; i <= totalPages; i++) {
                setStatusText(`Scanning P${i}...`);
                const page = await pdf.getPage(i);
                // Budget per page for iterative search
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
                    // Start with high resolution and iterate down
                    const scalesToTry = [2.5, 2.0, 1.5, 1.0, 0.75, 0.5];
                    let bestUrlFound = "";
                    
                    for (const s of scalesToTry) {
                        if (bestUrlFound) break;
                        
                        let low = 0.1, high = 0.98;
                        // Binary search for highest quality that fits per-page budget
                        for (let j = 0; j < 6; j++) {
                            const mid = (low + high) / 2;
                            const testUrl = await getPageDataUrl(s, mid);
                            const testSize = Math.round((testUrl.length - 22) * 0.75); // base64 to binary estimate
                            
                            if (testSize <= targetBytesPerPage) {
                                bestUrlFound = testUrl;
                                low = mid; // Try higher quality
                            } else {
                                high = mid; // Try lower quality
                            }
                        }
                    }
                    finalDataUrl = bestUrlFound || await getPageDataUrl(0.5, 0.1); 
                } else {
                    finalDataUrl = await getPageDataUrl(2.5, quality[0] / 100);
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
            setStatusText("Success");
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: 'PDF Optimized!' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error' });
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
            <div className="w-full max-w-2xl py-4 flex flex-col items-center justify-center gap-6 px-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center space-y-2 mb-4">
                    <div className="mx-auto mb-2 grid size-14 md:size-16 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-xl relative">
                        <FileArchive className="size-7 md:size-8" />
                        <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                            <Sparkles className="size-2.5" />
                        </div>
                    </div>
                    <h1 className="text-xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none text-slate-800 dark:text-white">
                        PDF <span className="text-gradient-hero">Optimizer</span>
                    </h1>
                    <p className="text-[10px] md:text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                        100% Private local RAM processing.
                    </p>
                </motion.div>

                <Card className={cn(
                    "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2rem] md:rounded-[2.5rem] hover:border-primary/50 cursor-pointer select-none",
                    isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
                )}
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <CardHeader className="bg-muted/30 border-b p-4 md:p-6 text-center">
                        <CardTitle className="text-[10px] md:text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-12">
                        <div className="border-4 border-dashed border-muted-foreground/20 rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center space-y-4 bg-muted/30 group">
                            <div className="relative">
                                <UploadCloud className="size-12 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                            </div>
                            <div className="text-center px-4">
                                <p className="text-base md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop PDF to Shrink</p>
                                <p className="text-[9px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">Local Secure Render</p>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                    </CardContent>
                    <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-6 md:pb-8 bg-muted/10 pt-4 md:pt-6 px-4">
                        <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                        <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT CROP</div>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-2 md:px-4 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                        <Settings2 className="size-5 md:size-6" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-none">Studio <span className="text-primary">Engine</span></h2>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                <div className="lg:col-span-7 h-full">
                    <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2rem] md:rounded-[2.5rem]">
                        <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between p-4 md:p-6">
                            <div className="flex items-center gap-2 md:gap-3 truncate pr-4 text-left">
                                <FileText className="size-4 md:size-5 text-primary shrink-0" />
                                <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-widest truncate">{pdfFile.name}</CardTitle>
                            </div>
                            <Badge className="font-mono text-[8px] md:text-[9px] bg-white border-primary/10 text-primary">{formatBytes(pdfFile.size)}</Badge>
                        </CardHeader>
                        <CardContent className="p-6 md:p-12 flex-1 bg-slate-50 dark:bg-slate-900/50 shadow-inner min-h-[400px] flex flex-col items-center justify-center relative">
                            {isChecking ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">SCANNING...</p>
                                </div>
                            ) : isProtected ? (
                                <div className="w-full max-w-sm space-y-6 text-center animate-in zoom-in-95">
                                    <div className="size-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto border-2 border-rose-200"><Lock className="size-6" /></div>
                                    <p className="text-xs font-bold text-rose-800 uppercase leading-relaxed">Protected Document. <br/>Unlock it first.</p>
                                    <Button asChild variant="outline" className="h-10 border-2 rounded-xl text-[9px] font-black uppercase"><Link href="/unlock-pdf">GO TO UNLOCKER</Link></Button>
                                </div>
                            ) : isProcessing ? (
                                <div className="space-y-8 w-full max-w-sm text-center">
                                    <div className="relative inline-block">
                                        <Loader2 className="h-14 w-14 animate-spin text-primary opacity-20 stroke-[3]" />
                                        <Zap className="absolute inset-0 m-auto h-7 w-7 text-primary animate-pulse" />
                                    </div>
                                    <div className="space-y-3">
                                        <p className="font-black text-sm md:text-xl text-primary uppercase tracking-tighter animate-pulse leading-none">{statusText}</p>
                                        <Progress value={progress} className="h-1" />
                                    </div>
                                </div>
                            ) : compressionResult ? (
                                <div className="w-full max-w-sm space-y-6 animate-in zoom-in-95 text-center">
                                    <div className="p-10 bg-green-500/10 border-2 border-dashed border-green-500/30 rounded-[3rem] flex flex-col items-center gap-2 shadow-inner">
                                        <div className="size-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl relative">
                                            <CheckCircle2 className="size-8" />
                                            <div className="absolute -top-1 -right-1 text-yellow-400"><Sparkles className="size-5" /></div>
                                        </div>
                                        <p className="text-5xl font-black text-green-600 tracking-tighter">-{compressionResult.savings.toFixed(0)}%</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-center bg-muted/20 p-5 rounded-2xl border">
                                        <div><p className="text-[9px] font-black text-muted-foreground uppercase opacity-60">Original</p><p className="text-xs font-bold opacity-40">{formatBytes(compressionResult.originalSize)}</p></div>
                                        <div className="border-l border-white/20">
                                            <p className="text-[9px] font-black text-primary uppercase">Optimized</p>
                                            <p className="text-sm font-black text-primary">{formatBytes(compressionResult.newSize)}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6 text-center opacity-30">
                                     <div className="size-24 rounded-[2rem] bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center border-2 border-dashed border-primary/20"><FileArchive className="size-12" /></div>
                                     <div className="space-y-1">
                                        <p className="text-lg font-black uppercase tracking-tighter text-slate-800 dark:text-white">Ready for Optimize</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Local buffer initialized.</p>
                                     </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="bg-white dark:bg-slate-950 border-t p-5 md:p-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                <Button 
                                    variant="outline" 
                                    onClick={resetState} 
                                    className="w-full sm:w-auto h-12 px-6 border-2 font-black text-[11px] md:text-xs uppercase rounded-xl bg-white dark:bg-slate-900 !text-slate-900 dark:!text-white border-slate-300 dark:border-white/20 hover:bg-destructive/5 hover:!text-destructive transition-all duration-300 shadow-sm"
                                >
                                    <RefreshCcw className="mr-1.5 size-4" /> Start Over
                                </Button>
                                
                                {!compressionResult ? (
                                    <Button 
                                        className="magic-button w-full sm:w-auto h-16 md:h-18 text-sm md:text-lg font-black bg-primary hover:bg-primary/90 border-none transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 px-10 rounded-full text-white shadow-xl" 
                                        onClick={handleCompressPdf} 
                                        disabled={isProcessing || isProtected === true}
                                    >
                                        <StarIcons />
                                        {isProcessing ? "PROCESSING..." : "OPTIMIZE NOW"}
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={handleDownload} 
                                        className="magic-button magic-button-success w-full sm:w-auto h-16 md:h-18 text-sm md:text-lg font-black bg-green-600 hover:bg-green-700 text-white rounded-full transition-all active:scale-95 flex items-center justify-center gap-4 px-10 border-none shadow-2xl"
                                    >
                                        <StarIcons />
                                        <Download className="mr-2 md:mr-3 size-6" /> SAVE PDF
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2rem] md:rounded-[2.5rem]">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-5 md:p-8">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary text-left">
                                <Settings2 className="size-4 md:size-5 text-primary" /> Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-8">
                            <Tabs value={mode} onValueChange={(v) => setMode(v as CompressionMode)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-background p-1.5 rounded-xl border-2">
                                    <TabsTrigger value="target" className="font-black text-[9px] uppercase tracking-widest">Strict Limit</TabsTrigger>
                                    <TabsTrigger value="manual" className="font-black text-[9px] uppercase tracking-widest">Quality Control</TabsTrigger>
                                </TabsList>
                                <TabsContent value="target" className="space-y-6 animate-in fade-in duration-300">
                                    <div className="space-y-4 text-left">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Zap className="size-3 text-yellow-500" /> Form Presets
                                        </Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {QUICK_SIZES.map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => { setTargetValue(size); setTargetUnit('kb'); }}
                                                    className={cn(
                                                        "btn-pos-uiverse h-10 transition-all !ring-[3px] !ring-slate-950 dark:!ring-white", 
                                                        targetValue === size && targetUnit === 'kb' && "active-uiverse"
                                                    )}
                                                    data-label={size === "1024" ? "1MB" : `${size}K`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-4 border-t border-dashed text-left">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Custom Limit</Label>
                                        <div className="flex gap-2">
                                            <Input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className="h-12 text-lg font-black border-2 rounded-xl bg-background shadow-inner flex-1" />
                                            <Select value={targetUnit} onValueChange={(v) => setTargetUnit(v as TargetUnit)}>
                                                <SelectTrigger className="w-24 h-12 font-black border-2 rounded-xl"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl font-black"><SelectItem value="kb">KB</SelectItem><SelectItem value="mb">MB</SelectItem></SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="manual" className="space-y-8 animate-in fade-in duration-300 text-left">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1"><Label className="text-[10px] font-black uppercase">Compression</Label><Badge variant="secondary" className="font-black text-[11px] px-3 py-1 bg-primary text-white rounded-lg shadow-md">{100 - quality[0]}%</Badge></div>
                                        <Slider min={10} max={95} step={5} value={quality} onValueChange={setQuality} className="py-2" />
                                        <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase opacity-40"><span>MAX SPEED</span><span>BEST QUALITY</span></div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="p-4 md:p-5 bg-green-500/5 rounded-2xl border-2 border-green-500/10 flex gap-4 text-left">
                                <AlertCircle className="size-5 md:size-6 text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] md:text-[11px] font-black text-green-700 uppercase tracking-tight">Iterative Search Engine</p>
                                    <p className="text-[8px] md:text-[10px] text-green-700/60 font-medium leading-relaxed uppercase mt-1">
                                        New Binary-Search logic accurately targets your requested size limit.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
