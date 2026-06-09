"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect, useCallback } from 'react';
import * as pdfjs from 'pdfjs-dist';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    Unlock, 
    AlertCircle, 
    ShieldAlert, 
    Info, 
    RefreshCcw, 
    Zap, 
    Sparkles,
    CheckCircle2,
    Lock,
    Eye,
    ShieldCheck,
    SearchCode,
    FileText,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useFileStore } from '@/lib/file-store';

// STABLE WORKER CONFIG
const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
}

const StarIcons = () => (
    <>
        <div className="star-1">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-2">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-3">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-4">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-5">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-6">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
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

export default function PdfUnlocker() {
    const { toast } = useToast();
    const { sharedFile, setSharedFile } = useFileStore();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isProtected, setIsProtected] = useState<boolean | null>(null);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [unlockedPdfUrl, setUnlockedPdfUrl] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAadhaarFile = pdfFile?.name.toLowerCase().includes('aadhaar') || pdfFile?.name.toLowerCase().includes('eaadhaar');
    
    useEffect(() => {
        return () => {
            if (unlockedPdfUrl) URL.revokeObjectURL(unlockedPdfUrl);
        }
    }, [unlockedPdfUrl]);
    
    const clearUnlockedFile = () => {
        if (unlockedPdfUrl) {
            URL.revokeObjectURL(unlockedPdfUrl);
            setUnlockedPdfUrl(null);
        }
        setErrorDetails(null);
        setProgress(0);
        setStatusText("");
    }

    const checkEncryption = async (arrayBuffer: ArrayBuffer) => {
        setIsChecking(true);
        try {
            const bufferCopy = arrayBuffer.slice(0);
            const loadingTask = pdfjs.getDocument({ 
                data: new Uint8Array(bufferCopy),
                cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                cMapPacked: true,
                standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/standard_fonts/`
            });
            await loadingTask.promise;
            setIsProtected(false);
        } catch (error: any) {
            if (error.name === 'PasswordException') {
                setIsProtected(true);
            } else {
                setIsProtected(null);
            }
        } finally {
            setIsChecking(false);
        }
    };

    const handleFileChange = useCallback(async (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setPassword('');
            setIsProtected(null);
            clearUnlockedFile();
            const reader = new FileReader();
            reader.onload = async (e) => {
                if (e.target?.result) {
                    await checkEncryption(e.target.result as ArrayBuffer);
                }
            };
            reader.readAsDataBuffer(file);
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a PDF file.' });
        }
    }, [toast]);

    useEffect(() => {
        if (sharedFile) {
            handleFileChange(sharedFile);
            setSharedFile(null);
            toast({ title: "File Received", description: "Document imported from Optimizer." });
        }
    }, [sharedFile, handleFileChange, setSharedFile, toast]);

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const resetState = () => {
        setPdfFile(null);
        setPassword('');
        setIsProtected(null);
        clearUnlockedFile();
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const handleUnlockProcess = async () => {
        if (!pdfFile || !password) return;
        setIsUnlocking(true);
        setErrorDetails(null);
        clearUnlockedFile();
        setStatusText("Analyzing Security...");
        setProgress(5);
        try {
            const pdfBuffer = await pdfFile.arrayBuffer();
            const loadingTask = pdfjs.getDocument({ 
                data: new Uint8Array(pdfBuffer),
                password: password,
                cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                cMapPacked: true,
                standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/standard_fonts/`
            });
            const pdf = await loadingTask.promise;
            const totalPages = pdf.numPages;
            const newPdf = new jsPDF({ orientation: 'p', unit: 'pt', compress: true });
            for (let i = 1; i <= totalPages; i++) {
                setStatusText(`Decoding Page ${i}/${totalPages}...`);
                const page = await pdf.getPage(i);
                const renderViewport = page.getViewport({ scale: 2.2 }); 
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (ctx) {
                    canvas.height = Math.floor(renderViewport.height);
                    canvas.width = Math.floor(renderViewport.width);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvasContext: ctx, viewport: renderViewport, intent: 'print' }).promise;
                    const imgData = canvas.toDataURL('image/jpeg', 0.85);
                    const orientation = renderViewport.width > renderViewport.height ? 'l' : 'p';
                    if (i === 1) newPdf.deletePage(1);
                    newPdf.addPage([renderViewport.width, renderViewport.height], orientation);
                    newPdf.addImage(imgData, 'JPEG', 0, 0, renderViewport.width, renderViewport.height, undefined, 'FAST');
                }
                setProgress(10 + Math.round((i / totalPages) * 85));
            }
            const pdfBlob = newPdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setUnlockedPdfUrl(url);
            setProgress(100);
            setStatusText("Unlocked Successfully!");
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#48a9a4', '#fce7eb', '#ffffff'] });
            toast({ title: 'Success!', description: 'File unlocked and sanitized.' });
        } catch (error: any) {
            if (error.name === 'PasswordException' || error.message?.toLowerCase().includes('password')) {
                setErrorDetails("Incorrect Password. Please double check.");
            } else {
                setErrorDetails("Unlock failed. The document might be corrupted.");
            }
        } finally {
            setIsUnlocking(false);
        }
    };
    
    const handleDownload = () => {
        if (!unlockedPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = unlockedPdfUrl;
        link.download = `GR7-Tools-unlocked-${pdfFile.name}`;
        link.click();
    }

    return (
        <div className="w-full flex flex-col items-center gap-8">
            <AnimatePresence mode="wait">
                {!pdfFile ? (
                    <motion.div 
                        key="setup"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4"
                    >
                        <div className="text-center space-y-2 mb-4">
                            <div className="mx-auto mb-2 grid size-16 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-xl relative">
                                <Unlock className="size-8" />
                                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                                    <Sparkles className="size-2.5" />
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                                PDF <span className="text-gradient-hero">Unlocker Studio</span>
                            </h1>
                            <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                                Remove password from Aadhaar & Bank PDFs. <br/>100% Private local RAM processing.
                            </p>
                        </div>

                        <Card
                            className={cn(
                                "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20 cursor-pointer select-none",
                                isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                            )}
                            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <CardHeader className="bg-muted/30 border-b p-6 text-center">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 md:p-12">
                                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center space-y-4 bg-muted/30 group relative">
                                    <div className="relative">
                                        <UploadCloud className="size-14 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Encrypted PDF</p>
                                        <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">100% Private local processing.</p>
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                            </CardContent>
                            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                                <div className="flex items-center gap-1.5"><SearchCode className="size-3 text-primary" /> HD DECODE</div>
                                <div className="flex items-center gap-1.5"><Info className="size-3 text-blue-500" /> SUPPORTS AADHAAR</div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="editor"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-lg px-4"
                    >
                        <Card className="shadow-2xl border-primary/10 overflow-hidden rounded-[2.5rem] bg-card/50">
                            <CardHeader className="bg-muted/30 border-b p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 truncate">
                                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            {isProtected ? <Lock className="size-5" /> : <CheckCircle2 className="size-5 text-green-500" />}
                                        </div>
                                        <div className="truncate">
                                            <CardTitle className="text-sm font-black uppercase truncate">{pdfFile.name}</CardTitle>
                                            <CardDescription className="text-[9px] font-mono">{formatBytes(pdfFile.size)}</CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={resetState} className="text-muted-foreground hover:text-destructive">
                                        <X size={18}/>
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 md:p-8 space-y-6">
                                {isChecking ? (
                                    <div className="py-12 flex flex-col items-center justify-center gap-4">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Checking Encryption...</p>
                                    </div>
                                ) : isProtected === false ? (
                                    <div className="p-8 bg-blue-500/5 border-2 border-dashed border-blue-500/20 rounded-3xl text-center space-y-4">
                                        <Info className="size-12 mx-auto text-blue-500 opacity-40" />
                                        <p className="font-bold text-sm text-blue-800 uppercase">No Password Needed</p>
                                        <p className="text-xs text-muted-foreground">This file is already open and accessible.</p>
                                    </div>
                                ) : isProtected === true && !unlockedPdfUrl ? (
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="pass" className="text-[10px] font-black uppercase text-primary tracking-widest">Enter Current Password</Label>
                                            <input 
                                                id="pass" type="password" value={password} 
                                                onChange={(e) => { setPassword(e.target.value); setErrorDetails(null); }}
                                                className="flex h-14 w-full rounded-xl border-2 bg-background px-4 py-2 text-2xl font-black tracking-[0.3em] text-center focus-visible:ring-2 focus-visible:ring-primary outline-none shadow-inner"
                                                placeholder="••••••••" autoFocus disabled={isUnlocking}
                                            />
                                        </div>

                                        {isAadhaarFile && (
                                            <Alert className="bg-blue-50 border-2 border-blue-100 rounded-2xl animate-in slide-in-from-left">
                                                <Info className="size-5 text-blue-500" />
                                                <AlertTitle className="text-[10px] font-black uppercase text-blue-700">Aadhaar Format Tip</AlertTitle>
                                                <AlertDescription className="text-[11px] font-bold text-blue-600 leading-tight">
                                                    First 4 letters of NAME (CAPS) + Year of Birth.
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {isUnlocking && (
                                            <div className="space-y-4 text-center py-4">
                                                <div className="relative inline-block">
                                                    <Loader2 className="h-14 w-14 animate-spin text-primary opacity-20" />
                                                    <Zap className="absolute inset-0 m-auto h-7 w-7 text-primary animate-pulse" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xs font-black text-primary uppercase animate-pulse">{statusText}</p>
                                                    <Progress value={progress} className="h-1.5" />
                                                </div>
                                            </div>
                                        )}

                                        {errorDetails && (
                                            <Alert variant="destructive" className="rounded-xl border-2">
                                                <ShieldAlert className="size-4" />
                                                <AlertTitle className="text-[10px] font-black uppercase">Unlock Failed</AlertTitle>
                                                <AlertDescription className="text-xs font-bold">{errorDetails}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                ) : unlockedPdfUrl ? (
                                    <div className="p-10 bg-green-500/5 border-2 border-dashed border-green-500/20 rounded-[2.5rem] flex flex-col items-center gap-6 text-center animate-in zoom-in-95">
                                        <div className="size-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl relative">
                                            <CheckCircle2 className="size-10" />
                                            <Sparkles className="absolute -top-2 -right-2 text-yellow-400 size-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xl font-black text-green-800 uppercase tracking-tighter">PERMANENTLY UNLOCKED!</p>
                                            <p className="text-[10px] text-green-600 font-bold uppercase opacity-60">Ready for saving</p>
                                        </div>
                                    </div>
                                ) : null}
                            </CardContent>

                            <CardFooter className="flex flex-col gap-3 p-6 bg-muted/10 border-t">
                                {!unlockedPdfUrl ? (
                                    <Button 
                                        onClick={handleUnlockProcess} 
                                        disabled={isUnlocking || !password || isChecking} 
                                        className="magic-button w-full h-16 md:h-18 text-lg font-black bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary rounded-full transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
                                    >
                                        <StarIcons />
                                        {isUnlocking ? "DECODING..." : (
                                            <div className="flex items-center gap-3">
                                                <Unlock className="size-7 group-hover:rotate-12 transition-transform" />
                                                <span className="uppercase tracking-tighter">UNLOCK DOCUMENT</span>
                                            </div>
                                        )}
                                    </Button>
                                ) : (
                                    <Button onClick={handleDownload} className="magic-button magic-button-success w-full h-16 md:h-18 text-lg font-black bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 rounded-full transition-all active:scale-95 flex items-center justify-center gap-4">
                                        <StarIcons />
                                        <Download className="mr-3 size-8 group-hover:translate-y-1 transition-transform" /> 
                                        <span className="uppercase tracking-tighter">SAVE UNLOCKED PDF</span>
                                    </Button>
                                )}
                                <Button variant="ghost" onClick={resetState} className="w-full h-10 text-[10px] font-black uppercase text-muted-foreground/40 hover:text-destructive">
                                    <RefreshCcw className="size-3.5 mr-2" /> Start Over
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
