"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

// Initializing worker path
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

export default function PdfUnlocker() {
    const { toast } = useToast();
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

    const isAadhaar = pdfFile?.name.toLowerCase().includes('aadhaar') || pdfFile?.name.toLowerCase().includes('eaadhaar');
    
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
            // Try loading without password
            const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
            await loadingTask.promise;
            setIsProtected(false);
        } catch (error: any) {
            if (error.name === 'PasswordException') {
                setIsProtected(true);
            } else {
                console.error("Encryption check error:", error);
                setIsProtected(null);
            }
        } finally {
            setIsChecking(false);
        }
    };

    const handleFileChange = async (file: File | null) => {
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
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a PDF file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const resetState = () => {
        setPdfFile(null);
        setPassword('');
        setIsProtected(null);
        clearUnlockedFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handlePowerUnlock = async (arrayBuffer: ArrayBuffer) => {
        setStatusText("Universal Decoding Active...");
        setProgress(10);

        try {
            const loadingTask = pdfjs.getDocument({ 
                data: new Uint8Array(arrayBuffer),
                password: password
            });
            const pdf = await loadingTask.promise;

            const totalPages = pdf.numPages;
            const newPdf = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                compress: true
            });

            for (let i = 1; i <= totalPages; i++) {
                setStatusText(`Decrypting Page ${i} of ${totalPages}...`);
                const page = await pdf.getPage(i);
                
                // 1. Original dimensions in PDF points
                const viewport = page.getViewport({ scale: 1.0 });
                
                // 2. High-res dimensions for rendering sharpness
                const renderViewport = page.getViewport({ scale: 2.2 }); 
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { willReadFrequently: true });
                
                canvas.height = Math.floor(renderViewport.height);
                canvas.width = Math.floor(renderViewport.width);

                if (context) {
                    context.fillStyle = '#FFFFFF';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Render page at high scale
                    await page.render({ canvasContext: context, viewport: renderViewport }).promise;
                    const imgData = canvas.toDataURL('image/jpeg', 0.85);
                    
                    // Determine orientation for current page
                    const orientation = viewport.width > viewport.height ? 'l' : 'p';
                    
                    // Add fresh page with exact original dimensions
                    if (i === 1) {
                        newPdf.deletePage(1);
                    }
                    
                    newPdf.addPage([viewport.width, viewport.height], orientation);
                    
                    // Draw high-res image exactly into the original bounds
                    newPdf.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height, undefined, 'FAST');
                }
                setProgress(10 + Math.round((i / totalPages) * 85));
            }

            const pdfBlob = newPdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setUnlockedPdfUrl(url);
            setProgress(100);
            setStatusText("Unlocked Successfully!");
            toast({ title: 'Success!', description: 'File Unlocked with full dimensions preserved.' });

        } catch (error: any) {
            console.error("Unlock error:", error);
            if (error.name === 'PasswordException' || error.message?.toLowerCase().includes('password')) {
                setErrorDetails("Incorrect Password. Please double check.");
            } else {
                setErrorDetails("Decryption failed. The document might be corrupted or too complex.");
            }
        }
    };

    const handleUnlockPdf = async () => {
        if (!pdfFile || !password) return;
        
        setIsUnlocking(true);
        setErrorDetails(null);
        clearUnlockedFile();
        setStatusText("Initializing Decryption...");
        setProgress(5);

        try {
            const pdfBytes = await pdfFile.arrayBuffer();
            await handlePowerUnlock(pdfBytes);
        } catch (error: any) {
            setErrorDetails("Could not read the PDF file.");
        } finally {
            setIsUnlocking(false);
        }
    };
    
    const handleDownload = () => {
        if (!unlockedPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = unlockedPdfUrl;
        link.download = `unlocked-${pdfFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (!pdfFile) {
        return (
            <div className="w-full max-w-4xl py-2 flex flex-col items-center justify-center gap-4">
                <div className="text-center space-y-1 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="mx-auto mb-1 grid size-12 md:size-14 place-items-center rounded-2xl bg-primary/10 text-primary shadow-lg relative">
                        <Unlock className="size-6 md:size-7" />
                        <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
                            <Sparkles className="size-2" />
                        </div>
                    </div>
                    <h1 className="text-xl md:text-3xl font-black font-headline tracking-tighter uppercase leading-none">
                        <span className="text-gradient-hero">PDF Unlocker</span>
                    </h1>
                    <p className="text-[9px] md:text-xs text-muted-foreground font-semibold max-xl mx-auto uppercase tracking-widest opacity-60">
                        Unlock Aadhaar & Bank PDFs locally.
                    </p>
                </div>

                <Card
                    className={cn("w-full max-w-xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed cursor-pointer hover:border-primary/50", isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]")}
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <CardContent className="p-6 md:p-10 flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                            <UploadCloud className="size-10 md:size-14 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Zap className="absolute -top-1 -right-1 size-4 md:size-6 text-yellow-500 animate-pulse" />
                        </div>
                        <div className="text-center px-4">
                            <p className="text-base md:text-lg font-black uppercase tracking-tighter">Drop Encrypted PDF</p>
                            <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1 font-bold opacity-60 uppercase">Works for Aadhaar & Bank Bills.</p>
                        </div>
                    </CardContent>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </Card>

                <div className="flex flex-wrap justify-center gap-4 text-[7px] md:text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-2">
                    <div className="flex items-center gap-1.5"><ShieldAlert className="size-3 text-green-500" /> 100% PRIVATE</div>
                    <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-primary" /> HD RE-ENCODING</div>
                    <div className="flex items-center gap-1.5"><Info className="size-3 text-blue-500" /> SUPPORTS AADHAAR</div>
                </div>
            </div>
        );
    }
    
    return (
        <Card className="w-full max-w-md shadow-2xl border-primary/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 mx-4">
            <CardHeader className="bg-muted/30 border-b p-4">
                <CardTitle className="text-base flex items-center gap-2">
                    {isChecking ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : isProtected ? <Lock className="text-primary h-4 w-4" /> : <CheckCircle2 className="text-green-500 h-4 w-4" />}
                    {isChecking ? "Checking..." : isProtected ? "Locked Document" : "Unlocked"}
                </CardTitle>
                <CardDescription className="truncate font-mono text-[9px]">{pdfFile.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 px-4 pb-4">
                {isChecking ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Analyzing security...</p>
                    </div>
                ) : isProtected === false ? (
                    <div className="p-6 bg-blue-500/10 border-2 border-dashed border-blue-500/30 rounded-xl flex flex-col items-center gap-3 text-center">
                        <div className="size-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg">
                            <Info className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-blue-700 text-xs uppercase">No Password Required</p>
                        </div>
                    </div>
                ) : isProtected === true && !unlockedPdfUrl && (
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase opacity-50">Document Password</Label>
                            <input 
                                id="password" 
                                type="password" 
                                value={password} 
                                onChange={(e) => { setPassword(e.target.value); setErrorDetails(null); }}
                                placeholder="••••••••"
                                disabled={isUnlocking}
                                className="flex h-11 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-xl font-black tracking-widest ring-offset-background placeholder:text-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-inner disabled:opacity-50"
                            />
                        </div>
                        
                        {isAadhaar && !errorDetails && !isUnlocking && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 flex gap-2 animate-in slide-in-from-left duration-500">
                                <Info className="h-4 w-4 text-blue-500 shrink-0" />
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black text-blue-700 dark:text-blue-300 uppercase">Aadhaar Tip</p>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-tight">
                                        FIRST 4 LETTERS (CAPS) + Birth Year.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {isUnlocking && (
                    <div className="space-y-3 py-2 text-center">
                        <div className="relative inline-block">
                             <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20 stroke-[3]" />
                             <Zap className="absolute inset-0 m-auto h-5 w-5 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-primary uppercase tracking-tighter text-xs">{statusText}</p>
                            <Progress value={progress} className="h-1.5" />
                        </div>
                    </div>
                )}

                {errorDetails && (
                    <Alert variant="destructive" className="bg-destructive/10 p-3">
                        <AlertTitle className="text-[10px] font-bold uppercase">Unlock Failed</AlertTitle>
                        <AlertDescription className="text-[9px] font-medium leading-relaxed">
                            {errorDetails}
                        </AlertDescription>
                    </Alert>
                )}

                {unlockedPdfUrl && (
                    <div className="p-6 bg-green-500/10 border-2 border-dashed border-green-500/30 rounded-xl flex flex-col items-center gap-3 animate-in zoom-in-95">
                        <div className="size-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg">
                            <Download className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-green-700 text-xs uppercase">Decryption Success!</p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 bg-muted/10 border-t p-4">
                {isProtected === false ? (
                    <Button variant="outline" onClick={resetState} className="w-full text-xs font-bold uppercase">
                        Select Different File
                    </Button>
                ) : !unlockedPdfUrl ? (
                    <Button onClick={handleUnlockPdf} disabled={isUnlocking || !password || isChecking} className="w-full h-11 text-sm font-black bg-primary hover:bg-primary/90 shadow-lg">
                        {isUnlocking ? "DECODING..." : "UNLOCK PDF"}
                    </Button>
                ) : (
                    <Button onClick={handleDownload} className="w-full h-12 text-sm font-black bg-green-600 hover:bg-green-700 shadow-lg">
                        DOWNLOAD UNLOCKED PDF
                    </Button>
                )}
                <Button variant="ghost" onClick={resetState} className="w-full h-8 text-[9px] font-black uppercase opacity-40 hover:opacity-100" disabled={isUnlocking || isChecking}>
                    <RefreshCcw className="h-2.5 w-2.5 mr-1" /> Reset
                </Button>
            </CardFooter>
        </Card>
    );
}
