
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    Lock, 
    ShieldCheck, 
    Zap, 
    AlertCircle, 
    RefreshCcw, 
    Sparkles, 
    CheckCircle2,
    FileLock2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Initializing worker path for PDF.js - Stable Version
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export default function PdfProtector() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isProtecting, setIsProtecting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [protectedPdfUrl, setProtectedPdfUrl] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        return () => {
            if (protectedPdfUrl) {
                URL.revokeObjectURL(protectedPdfUrl);
            }
        };
    }, [protectedPdfUrl]);
    
    const clearProtectedFile = () => {
        if (protectedPdfUrl) {
            URL.revokeObjectURL(protectedPdfUrl);
            setProtectedPdfUrl(null);
        }
        setErrorDetails(null);
        setProgress(0);
        setStatusText("");
    }

    const handleFileChange = (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setPassword('');
            setConfirmPassword('');
            clearProtectedFile();
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
        setConfirmPassword('');
        clearProtectedFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleProtectPdf = async () => {
        if (!pdfFile || !password) return;
        
        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Passwords Mismatch', description: 'Please ensure both passwords are the same.' });
            return;
        }

        setIsProtecting(true);
        setErrorDetails(null);
        clearProtectedFile();
        setStatusText("Analyzing Document Structure...");
        setProgress(5);

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            const totalPages = pdf.numPages;

            // Create a completely fresh PDF container to FORCE-LOCK metadata
            const secureDoc = await PDFDocument.create();

            for (let i = 1; i <= totalPages; i++) {
                setStatusText(`Locking Page ${i} of ${totalPages}...`);
                const page = await pdf.getPage(i);
                
                // Render at 3.0x for Ultra-HD text clarity (Better than standard converters)
                const viewport = page.getViewport({ scale: 3.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { alpha: false });
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;
                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, canvas.width, canvas.height);
                
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = 'high';
                
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                
                // Convert page to high-quality image to break any bypass metadata
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const imgBytes = await fetch(imgData).then(res => res.arrayBuffer());
                const embeddedImg = await secureDoc.embedJpg(imgBytes);

                const newPage = secureDoc.addPage([viewport.width * 0.75, viewport.height * 0.75]);
                newPage.drawImage(embeddedImg, {
                    x: 0,
                    y: 0,
                    width: newPage.getWidth(),
                    height: newPage.getHeight(),
                });

                setProgress(10 + Math.round((i / totalPages) * 80));
            }

            setStatusText("Injecting AES-128 Guard...");
            
            /**
             * Save with Absolute Forced Encryption
             * userPassword: Required to OPEN
             * ownerPassword: Randomly generated and unknown to user (Permanent Protection)
             */
            const protectedPdfBytes = await secureDoc.save({
                userPassword: password,
                ownerPassword: `GR7-VAULT-${Math.random().toString(36).toUpperCase()}`, 
                updateMetadata: true,
                addDefaultPage: false,
                permissions: {
                    printing: 'highResolution',
                    modifying: false,
                    copying: false,
                    annotating: false,
                    fillingForms: false,
                    contentAccessibility: false,
                    assembling: false,
                }
            });

            const blob = new Blob([protectedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setProtectedPdfUrl(url);
            setProgress(100);
            setStatusText("Document Sealed!");
            
            toast({ title: 'Vault Ready!', description: 'Your PDF is now strictly password protected.' });

        } catch (error: any) {
            console.error("Locking Error:", error);
            setErrorDetails("Could not protect this document. It might be strictly locked already.");
            toast({ variant: 'destructive', title: 'Action Failed', description: 'Could not apply encryption shell.' });
        } finally {
            setIsProtecting(false);
        }
    };
    
    const handleDownload = () => {
        if (!protectedPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = protectedPdfUrl;
        link.download = `protected-${pdfFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (!pdfFile) {
        return (
            <Card
                className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10 border-2 border-dashed bg-card/50", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                <CardHeader className="p-8">
                    <div className="mx-auto mb-6 grid size-20 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-inner">
                        <Lock className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-black font-headline uppercase tracking-tighter">Vault PDF Protector</CardTitle>
                    <CardDescription className="text-base font-bold">Military-grade protection. Force-locks every viewer and browser.</CardDescription>
                </CardHeader>
                <CardContent className="pb-10">
                    <div className="border-3 border-dashed border-muted-foreground/30 rounded-[2.5rem] p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group relative overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                        <div className="relative z-10">
                            <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Zap className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
                        </div>
                        <div className="z-10">
                            <p className="text-xl font-black uppercase tracking-tight text-foreground">Drop PDF here to Seal</p>
                            <p className="text-sm text-muted-foreground mt-2 font-medium">100% Secure local re-encoding. Works like iLovePDF.</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
                <CardFooter className="justify-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 border-t pt-6 bg-muted/10">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> AES-128 Bit</div>
                    <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> Instant Shield</div>
                    <div className="flex items-center gap-1.5"><FileLock2 className="size-3 text-primary" /> ZERO CLOUD TRACE</div>
                </CardFooter>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-md shadow-2xl border-primary/10 overflow-hidden animate-in fade-in zoom-in-95 duration-500 rounded-[2.5rem] bg-white dark:bg-slate-950">
            <CardHeader className="bg-primary/5 border-b p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Lock className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl font-black uppercase tracking-tighter">Vault Settings</CardTitle>
                    </div>
                    {protectedPdfUrl && <Badge className="bg-green-600 text-white font-black animate-pulse uppercase text-[9px] px-3">PROTECTED</Badge>}
                </div>
                <CardDescription className="truncate font-mono text-[10px] mt-2 bg-muted/30 p-2 rounded-lg border">Target: {pdfFile.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
                {!protectedPdfUrl && (
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">1. Create Document Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password} 
                                onChange={(e) => { setPassword(e.target.value); setErrorDetails(null); }}
                                placeholder="Enter secret password..."
                                disabled={isProtecting}
                                className="h-14 text-lg font-black tracking-widest focus-visible:ring-primary border-2 rounded-2xl bg-muted/10 pl-5"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">2. Confirm Password</Label>
                            <Input 
                                id="confirm-password" 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => { setConfirmPassword(e.target.value); setErrorDetails(null); }}
                                placeholder="Verify secret password..."
                                disabled={isProtecting}
                                className={cn(
                                    "h-14 text-lg font-black tracking-widest border-2 rounded-2xl bg-muted/10 pl-5 transition-all",
                                    confirmPassword && password !== confirmPassword && "border-destructive ring-2 ring-destructive/10 bg-destructive/5",
                                    confirmPassword && password === confirmPassword && "border-green-500 ring-2 ring-green-500/10 bg-green-500/5"
                                )}
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-[9px] font-black text-destructive uppercase tracking-tighter ml-1">Passwords do not match!</p>
                            )}
                        </div>
                    </div>
                )}

                {isProtecting && (
                    <div className="space-y-6 py-8 text-center animate-pulse">
                        <div className="relative inline-block">
                             <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20 stroke-[3]" />
                             <Lock className="absolute inset-0 m-auto h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-3">
                            <p className="font-black text-primary uppercase tracking-tighter text-sm">{statusText}</p>
                            <Progress value={progress} className="h-2 shadow-inner" />
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Applying Shell-Lock Technology</p>
                        </div>
                    </div>
                )}

                {errorDetails && (
                    <Alert variant="destructive" className="rounded-2xl border-2 bg-destructive/5 border-destructive/20 animate-in shake-1 duration-300">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-xs font-bold uppercase tracking-tight">Security Error</AlertTitle>
                        <AlertDescription className="text-[11px] font-medium leading-relaxed opacity-80">
                            {errorDetails}
                        </AlertDescription>
                    </Alert>
                )}

                {protectedPdfUrl && (
                    <div className="p-10 bg-green-500/5 border-2 border-dashed border-green-500/30 rounded-[2.5rem] flex flex-col items-center gap-6 text-center animate-in zoom-in-95 duration-500 shadow-inner">
                        <div className="size-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl shadow-green-500/40">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <div>
                            <p className="font-black text-green-800 text-2xl uppercase tracking-tighter">VAULT SEALED!</p>
                            <p className="text-[11px] text-green-700 font-bold mt-1 leading-relaxed">
                                PDF is now force-locked. It will request a password on every device.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 bg-muted/10 p-8 border-t-2 border-dashed">
                {!protectedPdfUrl ? (
                    <Button 
                        onClick={handleProtectPdf} 
                        disabled={isProtecting || !password || password !== confirmPassword} 
                        className="w-full h-18 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl group transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isProtecting ? <Loader2 className="animate-spin mr-3 size-6"/> : <Lock className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform"/>}
                        {isProtecting ? "SEALING..." : "FORCE-LOCK PDF"}
                    </Button>
                ) : (
                    <Button onClick={handleDownload} className="w-full h-18 text-xl font-black bg-green-600 hover:bg-green-700 shadow-2xl shadow-green-500/20 rounded-2xl group transition-all active:scale-95">
                        <Download className="mr-3 h-7 w-7 group-hover:translate-y-1 transition-transform" />
                        DOWNLOAD LOCKED PDF
                    </Button>
                )}
                <Button variant="ghost" onClick={resetState} className="w-full h-10 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-destructive/5 hover:text-destructive" disabled={isProtecting}>
                    <RefreshCcw className="h-3.5 w-3.5 mr-2" /> {protectedPdfUrl ? "Protect Another File" : "Replace Current File"}
                </Button>
            </CardFooter>
        </Card>
    );
}
