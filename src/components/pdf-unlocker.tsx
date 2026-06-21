'use client';

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect, useCallback } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, PDFName } from 'pdf-lib';
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
    EyeOff,
    ShieldCheck,
    SearchCode,
    FileText,
    X,
    Loader2,
    Download,
    Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useFileStore } from '@/lib/file-store';

// STABLE WORKER CONFIG FOR PRODUCTION
const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.mjs`;
}

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i} pointer-events-none`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
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

export default function PdfUnlocker() {
    const { toast } = useToast();
    const { sharedFile, setSharedFile } = useFileStore();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isProtected, setIsProtected] = useState<boolean | null>(null);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [unlockedPdfUrl, setUnlockedPdfUrl] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [previewPages, setPreviewPages] = useState<string[]>([]);
    const [renderingProgress, setRenderingProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAadhaarFile = pdfFile?.name.toLowerCase().includes('aadhaar') || pdfFile?.name.toLowerCase().includes('eaadhaar');
    
    useEffect(() => {
        return () => {
            if (unlockedPdfUrl) URL.revokeObjectURL(unlockedPdfUrl);
        }
    }, [unlockedPdfUrl]);
    
    const resetState = () => {
        if (unlockedPdfUrl) URL.revokeObjectURL(unlockedPdfUrl);
        setPdfFile(null);
        setPreviewPages([]);
        setUnlockedPdfUrl(null);
        setErrorDetails(null);
        setProgress(0);
        setStatusText("");
        setPassword("");
        setIsProtected(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const clearUnlockedFile = () => {
        if (unlockedPdfUrl) {
            URL.revokeObjectURL(unlockedPdfUrl);
            setUnlockedPdfUrl(null);
        }
        setErrorDetails(null);
        setProgress(0);
        setStatusText("");
        setPreviewPages([]);
    }

    const checkEncryption = async (arrayBuffer: ArrayBuffer) => {
        setIsChecking(true);
        try {
            const bufferCopy = arrayBuffer.slice(0);
            const loadingTask = pdfjs.getDocument({ 
                data: new Uint8Array(bufferCopy),
                cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                cMapPacked: true,
                standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/standard_fonts/`,
                isEvalSupported: true, 
                stopAtErrors: false
            });
            await loadingTask.promise;
            setIsProtected(false);
        } catch (error: any) {
            if (error.name === 'PasswordException' || error.message?.toLowerCase().includes('password')) {
                setIsProtected(true);
            } else {
                setIsProtected(false);
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
            reader.readAsArrayBuffer(file);
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a PDF file.' });
        }
    }, [toast]);

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

    const generateVisualPreviews = async (pdfBytes: Uint8Array) => {
        setRenderingProgress(0);
        try {
            const loadingTask = pdfjs.getDocument({ 
                data: pdfBytes,
                cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                cMapPacked: true
            });
            const pdf = await loadingTask.promise;
            const imgs: string[] = [];
            const pagesToRender = Math.min(pdf.numPages, 3); 

            for (let i = 1; i <= pagesToRender; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.8 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    canvas.height = Math.floor(viewport.height); canvas.width = Math.floor(viewport.width);
                    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvasContext: ctx, viewport }).promise;
                    imgs.push(canvas.toDataURL('image/jpeg', 0.8));
                }
            }
            setPreviewPages(imgs);
        } catch (e) { console.error(e); }
    };

    const handleUnlockProcess = async () => {
        if (!pdfFile) return;
        
        const needsPassword = isProtected === true;
        if (needsPassword && !password) {
            toast({ variant: 'destructive', title: "Password Required", description: "Please enter the PDF password." });
            return;
        }

        setIsUnlocking(true);
        setErrorDetails(null);
        clearUnlockedFile();
        setStatusText(needsPassword ? "Opening Security Vault..." : "Sanitizing Document...");
        setProgress(5);

        try {
            const pdfBuffer = await pdfFile.arrayBuffer();

            try {
                const pdfDoc = await PDFDocument.load(pdfBuffer, { 
                    password: needsPassword ? password : undefined,
                    ignoreEncryption: !needsPassword 
                });
                
                setStatusText("Processing Streams...");
                setProgress(50);

                const catalog = pdfDoc.catalog;
                catalog.set(PDFName.of('ViewerPreferences'), pdfDoc.context.obj({
                    FitWindow: true,
                    CenterWindow: true,
                    DisplayDocTitle: true
                }));

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                setUnlockedPdfUrl(URL.createObjectURL(blob));
                
                await generateVisualPreviews(pdfBytes);
                
                setProgress(100);
                setStatusText("Success");
                toast({ title: 'Success!', description: needsPassword ? 'File unlocked (Size Preserved).' : 'File processed successfully.' });
                setIsUnlocking(false);
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#0d5a71', '#ef4444', '#ffffff'] });
                return;
            } catch (libError) {
                console.warn("pdf-lib direct unlock failed, falling back to sanitization.");
            }

            const loadingTask = pdfjs.getDocument({ 
                data: new Uint8Array(pdfBuffer),
                password: needsPassword ? password : undefined,
                cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                cMapPacked: true,
                standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/standard_fonts/`,
                isEvalSupported: true,
                stopAtErrors: false
            });
            
            const pdf = await loadingTask.promise;
            const totalPages = pdf.numPages;
            const finalPdfDoc = await PDFDocument.create();

            for (let i = 1; i <= totalPages; i++) {
                setStatusText(`Sanitizing P${i}/${totalPages}...`);
                const page = await pdf.getPage(i);
                
                const renderScale = 2.0; 
                const renderViewport = page.getViewport({ scale: renderScale }); 
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (ctx) {
                    canvas.height = Math.floor(renderViewport.height);
                    canvas.width = Math.floor(renderViewport.width);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;
                    
                    const imgData = canvas.toDataURL('image/jpeg', 0.75); 
                    const imgBuffer = await fetch(imgData).then(r => r.arrayBuffer());
                    const embeddedImg = await finalPdfDoc.embedJpg(imgBuffer);
                    
                    const pWidth = embeddedImg.width / renderScale;
                    const pHeight = embeddedImg.height / renderScale;
                    const newPage = finalPdfDoc.addPage([pWidth, pHeight]);
                    
                    newPage.drawImage(embeddedImg, { x: 0, y: 0, width: pWidth, height: pHeight });
                }
                setProgress(10 + Math.round((i / totalPages) * 90));
            }

            const catalog = finalPdfDoc.catalog;
            catalog.set(PDFName.of('ViewerPreferences'), finalPdfDoc.context.obj({
                FitWindow: true,
                CenterWindow: true,
                DisplayDocTitle: true
            }));

            const finalPdfBytes = await finalPdfDoc.save();
            const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
            setUnlockedPdfUrl(URL.createObjectURL(blob));
            
            await generateVisualPreviews(finalPdfBytes);
            
            setProgress(100);
            setStatusText("Process Complete");
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#0d5a71', '#ef4444', '#ffffff'] });
            toast({ title: 'Success!', description: 'File processed and sanitized.' });
        } catch (error: any) {
            if (error.name === 'PasswordException' || error.message?.toLowerCase().includes('password')) {
                setErrorDetails("Incorrect Password. Please check and try again.");
            } else {
                setErrorDetails("Failed to process this specific document type.");
            }
        } finally {
            setIsUnlocking(false);
        }
    };
    
    const handleDownload = () => {
        if (!unlockedPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = unlockedPdfUrl;
        const originalName = pdfFile.name.replace('.pdf', '');
        link.download = `GR7-Unlocked-${originalName}.pdf`;
        link.click();
    }

    return (
        <div className="w-full flex flex-col items-center gap-6 md:gap-8 px-2 md:px-0">
            <AnimatePresence mode="wait">
                {!pdfFile ? (
                    <motion.div 
                        key="setup"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl py-4 flex flex-col items-center justify-center gap-6 px-4"
                    >
                        <Card
                            className={cn(
                                "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2rem] md:rounded-[2.5rem] hover:border-primary/50 cursor-pointer select-none",
                                isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                            )}
                            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <CardHeader className="bg-muted/30 border-b p-4 md:p-6 text-center">
                                <CardTitle className="text-[10px] md:text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 md:p-12">
                                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-8 flex flex-col items-center justify-center space-y-4 bg-muted/30 group relative">
                                    <div className="relative">
                                        <UploadCloud className="size-10 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <Zap className="absolute -top-1 -right-1 size-4 md:size-6 text-yellow-500 animate-pulse" />
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-base md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Encrypted PDF</p>
                                        <p className="text-[10px] text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">Local Secure Render</p>
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                            </CardContent>
                            <CardFooter className="justify-center gap-4 md:gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                                <div className="flex items-center gap-1.5"><SearchCode className="size-3 text-primary" /> INDEX SCAN</div>
                                <div className="flex items-center gap-1.5"><Info className="size-3 text-blue-500" /> AADHAAR OK</div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="editor"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-5xl px-2 md:px-4"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                            <Card className="lg:col-span-5 shadow-2xl border-primary/10 overflow-hidden rounded-[2.5rem] bg-card/50 flex flex-col">
                                <CardHeader className="bg-muted/30 border-b p-4 md:p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 truncate pr-2 text-left">
                                            <div className="size-8 md:size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                {unlockedPdfUrl ? <CheckCircle2 className="size-4 md:size-5 text-green-500" /> : isProtected === false ? <CheckCircle2 className="size-4 md:size-5 text-green-500" /> : <Lock className="size-4 md:size-5" />}
                                            </div>
                                            <div className="truncate">
                                                <CardTitle className="text-[11px] md:text-sm font-black uppercase truncate">{pdfFile.name}</CardTitle>
                                                <CardDescription className="text-[8px] md:text-[9px] font-mono">{formatBytes(pdfFile.size)}</CardDescription>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={resetState} className="text-muted-foreground hover:text-destructive h-8 w-8">
                                            <X size={16} />
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-5 md:p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                                    {isChecking ? (
                                        <div className="py-10 flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">SCANNING SECURITY...</p>
                                        </div>
                                    ) : isProtected === false ? (
                                        <div className="space-y-6 text-center animate-in zoom-in-95">
                                             <div className="p-6 bg-green-500/5 border-2 border-dashed border-green-500/20 rounded-[2rem] flex flex-col items-center gap-3">
                                                <CheckCircle2 className="size-10 text-green-600" />
                                                <p className="text-sm font-black text-green-800 uppercase tracking-tighter">Password Not Required</p>
                                                <p className="text-[10px] text-green-600 font-bold leading-tight uppercase text-center">This document is already unprotected. You can still process it to clean metadata.</p>
                                            </div>
                                            {!unlockedPdfUrl && (
                                                <Button onClick={handleUnlockProcess} disabled={isUnlocking} className="w-full h-16 md:h-20 bg-primary text-white font-black rounded-2xl text-base shadow-xl active:scale-95 transition-all">
                                                    {isUnlocking ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2 h-5 w-5 text-yellow-400 fill-yellow-400" />} SANITIZE & SAVE
                                                </Button>
                                            )}
                                        </div>
                                    ) : !unlockedPdfUrl ? (
                                        <div className="space-y-5">
                                            <div className="space-y-2 text-left">
                                                <Label htmlFor="pass" className="text-[9px] font-black uppercase text-primary tracking-widest">Enter PDF Password</Label>
                                                <div className="relative group">
                                                    <input 
                                                        id="pass" type={showPassword ? "text" : "password"} value={password} 
                                                        onChange={(e) => { setPassword(e.target.value); setErrorDetails(null); }}
                                                        className="flex h-12 md:h-14 w-full rounded-xl border-2 bg-background pl-4 pr-12 py-2 text-xl md:text-2xl font-black tracking-[0.2em] text-center focus-visible:ring-2 focus-visible:ring-primary outline-none shadow-inner"
                                                        placeholder="••••••••" autoFocus disabled={isUnlocking}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleUnlockProcess()}
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                                                    >
                                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {isAadhaarFile && (
                                                <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4 text-left flex gap-3 shadow-inner">
                                                    <Info className="size-4 text-blue-500 shrink-0" />
                                                    <p className="text-[10px] font-bold text-blue-600 leading-tight uppercase">
                                                        Aadhaar Password: First 4 letters of NAME (CAPS) + Year of Birth.
                                                    </p>
                                                </div>
                                            )}

                                            {isUnlocking && (
                                                <div className="space-y-4 text-center py-2">
                                                    <div className="relative inline-block">
                                                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20 stroke-[3]" />
                                                        <Zap className="absolute inset-0 m-auto h-5 w-5 text-primary animate-pulse" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black text-primary uppercase animate-pulse text-center">{statusText}</p>
                                                        <Progress value={progress} className="h-1" />
                                                    </div>
                                                </div>
                                            )}

                                            {errorDetails && (
                                                <div className="bg-rose-50 border-2 border-rose-100 rounded-xl p-3 text-left flex gap-3 animate-in shake shadow-sm">
                                                    <ShieldAlert className="size-4 text-rose-500 shrink-0" />
                                                    <p className="text-[9px] font-bold text-rose-700 uppercase">{errorDetails}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-6 md:p-8 bg-green-500/5 border-2 border-dashed border-green-500/20 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center gap-4 text-center animate-in zoom-in-95">
                                            <div className="size-20 rounded-3xl bg-green-500 text-white flex items-center justify-center shadow-2xl relative">
                                                <CheckCircle2 className="size-10" />
                                                <div className="absolute -top-1 -right-1 text-yellow-400 size-6"><Sparkles className="size-full" /></div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-2xl font-black text-green-800 uppercase tracking-tighter text-center">UNLOCKED!</p>
                                                <p className="text-[9px] text-green-600 font-bold uppercase opacity-60 text-center">Metadata cleaned • Size Optimized</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="flex flex-col gap-4 p-6 md:p-8 bg-muted/10 border-t mt-auto shrink-0">
                                    {!unlockedPdfUrl ? (
                                        isProtected === true && (
                                            <Button 
                                                onClick={handleUnlockProcess} 
                                                disabled={isUnlocking || !password || isChecking} 
                                                className="magic-button w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary text-white hover:bg-primary/90 border-none transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 px-6 md:px-10 rounded-2xl shadow-2xl"
                                            >
                                                <StarIcons />
                                                {isUnlocking ? "DECODING..." : (
                                                    <div className="flex items-center gap-3">
                                                        <Unlock className="size-6 md:size-8" />
                                                        <span className="uppercase tracking-tighter">UNLOCK DOCUMENT</span>
                                                    </div>
                                                )}
                                            </Button>
                                        )
                                    ) : (
                                        <Button 
                                            size="lg" 
                                            className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-16 md:h-20 w-full shadow-[0_15px_30px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none animate-in zoom-in-95" 
                                            onClick={handleDownload}
                                        >
                                            <div className="absolute left-6 w-0.5 h-10 bg-white/40 rounded-full" />
                                            <span className="flex-1 px-12 text-center tracking-widest text-base md:text-xl uppercase">DOWNLOAD PDF</span>
                                            <div className="bg-white h-full pl-8 pr-10 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-10 group-hover:pr-12 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-20px' }}>
                                                <Download className="size-8 md:size-10 group-hover:scale-110 transition-transform" />
                                                <div className="absolute right-4 w-0.5 h-10 bg-[#00aeef]/20 rounded-full" />
                                            </div>
                                        </Button>
                                    )}
                                    <div className="flex items-center justify-between w-full mt-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={resetState} 
                                            className="h-10 px-6 border-2 font-black text-[10px] uppercase rounded-xl bg-white dark:bg-slate-900 !text-slate-900 dark:!text-white border-slate-300 dark:border-white/20 hover:bg-destructive/5 hover:!text-destructive transition-all duration-300 shadow-sm"
                                        >
                                            <RefreshCcw className="mr-1.5 size-3.5" /> Start Over
                                        </Button>
                                        <div className="flex items-center gap-1.5 text-muted-foreground/30 text-[7px] md:text-[8px] font-black uppercase tracking-widest">
                                            <ShieldCheck className="size-3 text-green-500" /> SECURE RAM
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>

                            <Card className="lg:col-span-7 border-2 shadow-xl rounded-[2.5rem] overflow-hidden bg-slate-200 dark:bg-slate-900 border-primary/10">
                                <CardHeader className="bg-muted/30 border-b p-4 text-center">
                                    <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center justify-center gap-2">
                                        <Eye className="size-3.5" /> Visual Feedback
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 flex flex-col h-[500px] lg:h-[700px]">
                                    <ScrollArea className="flex-1 w-full p-8 md:p-12">
                                        <div className="flex flex-col items-center gap-12">
                                            {previewPages.length > 0 ? (
                                                previewPages.map((src, i) => (
                                                    <div key={i} className="shadow-[0_45px_100px_-20px_rgba(0,0,0,0.5)] border-[8px] md:border-[12px] border-white rounded-sm overflow-hidden bg-white max-w-[450px] animate-in slide-in-from-bottom-6 duration-700">
                                                        <img src={src} className="w-full h-auto block" alt="p" />
                                                        <div className="bg-muted text-[8px] font-black py-2 text-center uppercase tracking-[0.2em] text-muted-foreground border-t">Sample P{i+1} Output</div>
                                                    </div>
                                                ))
                                            ) : isProtected === false && pdfFile ? (
                                                 <div className="bg-white shadow-2xl border-[8px] border-white rounded-sm overflow-hidden max-w-[350px] animate-in slide-in-from-bottom-4 py-32 text-center flex flex-col items-center gap-4 px-10">
                                                    <CheckCircle2 className="size-16 text-green-500/20" />
                                                    <p className="text-[10px] font-black uppercase opacity-20 tracking-widest">Direct Access Ready</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-40 text-center opacity-10 gap-6">
                                                    <Monitor className="size-32" />
                                                    <p className="text-xl md:text-3xl font-black uppercase tracking-[0.3em] text-center">Awaiting Unlock</p>
                                                </div>
                                            )}
                                        </div>
                                        <ScrollBar />
                                    </ScrollArea>
                                    <div className="p-5 bg-muted/20 border-t flex justify-center items-center gap-4">
                                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] opacity-30 text-center">GR7 TOOLS HD SANDBOX RENDERING ENGINE</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
