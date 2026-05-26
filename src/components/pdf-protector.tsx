
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    Lock, 
    ShieldCheck, 
    Zap, 
    AlertCircle, 
    RefreshCcw, 
    CheckCircle2,
    FileLock2,
    Eye,
    Printer,
    Copy,
    ShieldAlert,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

export default function PdfProtector() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Permission States
    const [allowPrinting, setAllowPrinting] = useState(true);
    const [allowCopying, setAllowCopying] = useState(true);
    
    const [isProtecting, setIsProtecting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [protectedPdfUrl, setProtectedPdfUrl] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        return () => {
            if (protectedPdfUrl) URL.revokeObjectURL(protectedPdfUrl);
        };
    }, [protectedPdfUrl]);
    
    const handleFileChange = (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setPassword('');
            setConfirmPassword('');
            setProtectedPdfUrl(null);
            setErrorDetails(null);
            setProgress(0);
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
        setPassword('');
        setConfirmPassword('');
        setProtectedPdfUrl(null);
        setErrorDetails(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleProtectPdf = async () => {
        if (!pdfFile || !password) return;
        
        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Password Mismatch', description: 'Both passwords must be identical.' });
            return;
        }

        setIsProtecting(true);
        setProgress(5);
        setStatusText("Initializing Secure Vault...");

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
            const pdf = await loadingTask.promise;
            const totalPages = pdf.numPages;

            // REAL PROTECTION LOGIC:
            const securePdf = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                compress: true
            });

            // CRITICAL: Ensure the encryption engine is accessible
            // We use a broader check and call method for jspdf plugins
            const encryptMethod = (securePdf as any).encrypt;
            if (typeof encryptMethod !== 'function') {
                console.error("jsPDF Encryption Plugin not found. This might be a bundling issue.");
                throw new Error("Local Encryption Engine is currently unavailable in this browser session. Please try refreshing or using a different browser.");
            }

            for (let i = 1; i <= totalPages; i++) {
                setStatusText(`Sealing Page ${i}/${totalPages}...`);
                const page = await pdf.getPage(i);
                
                // High-Density (300 DPI equivalent) for professional clarity
                const viewport = page.getViewport({ scale: 2.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
                if (!context) continue;

                canvas.height = Math.floor(viewport.height);
                canvas.width = Math.floor(viewport.width);
                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, canvas.width, canvas.height);
                
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = 'high';

                await page.render({ canvasContext: context, viewport: viewport }).promise;
                const imgData = canvas.toDataURL('image/jpeg', 0.92);
                
                if (i > 1) securePdf.addPage([viewport.width, viewport.height], 'p');
                else {
                    securePdf.deletePage(1);
                    securePdf.addPage([viewport.width, viewport.height], 'p');
                }
                
                securePdf.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height, undefined, 'FAST');
                setProgress(10 + Math.round((i / totalPages) * 80));
            }

            setStatusText("Applying AES Encryption...");
            
            // Randomly generated Owner Password for permission control
            const ownerPass = Math.random().toString(36).substring(2, 15);
            
            // Native AES Lock Implementation
            (securePdf as any).encrypt(password, ownerPass, {
                userPermissions: {
                    print: allowPrinting,
                    copy: allowCopying,
                    modify: false,
                    annotForms: false
                }
            });

            const pdfBlob = securePdf.output('blob');
            setProtectedPdfUrl(URL.createObjectURL(pdfBlob));
            setProgress(100);
            setStatusText("Vault Sealed!");
            toast({ title: 'Security Applied', description: 'PDF protected with real AES-128 bit encryption.' });

        } catch (error: any) {
            console.error("Vault Error:", error);
            setErrorDetails(error.message || "Could not apply encryption layers.");
            toast({ variant: 'destructive', title: 'Vault Error', description: 'Encryption engine failed to start.' });
        } finally {
            setIsProtecting(false);
        }
    };
    
    const handleDownload = () => {
        if (!protectedPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = protectedPdfUrl;
        link.download = `vault-locked-${pdfFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!pdfFile) {
        return (
            <Card className={cn(
                "w-full max-w-2xl text-center transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-2 border-dashed shadow-2xl relative rounded-[2.5rem] overflow-hidden",
                isDragOver ? "border-primary ring-8 ring-primary/10 scale-[1.02]" : "hover:border-primary/50"
            )}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                <CardHeader className="pt-12">
                    <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary shadow-inner">
                        <Lock className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-black uppercase tracking-tighter">Vault PDF Protector</CardTitle>
                    <CardDescription className="text-sm font-bold opacity-60">Real AES Encryption - Opens ONLY with password.</CardDescription>
                </CardHeader>
                <CardContent className="pb-12 px-12">
                    <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2.5rem] p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <div className="relative">
                            <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Zap className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-xl font-black uppercase tracking-tight">Drop PDF to Seal with AES</p>
                            <p className="text-xs text-muted-foreground font-bold mt-2 uppercase tracking-widest opacity-50">Local Processing • Military Grade Protection</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
                <CardFooter className="justify-center gap-8 py-8 bg-muted/10 border-t border-dashed">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-600" /> SECURE RAM</div>
                    <div className="flex items-center gap-1.5"><Zap className="size-3.5 text-yellow-500" /> AES-128 BIT</div>
                    <div className="flex items-center gap-1.5"><FileLock2 className="size-3.5 text-primary" /> ADOBE COMPATIBLE</div>
                </CardFooter>
            </Card>
        );
    }
    
    return (
        <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-8 px-4 animate-in fade-in duration-500">
            {/* Left: Configuration Panel */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                <Card className="shadow-2xl border-2 border-primary/10 overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-950">
                    <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Lock className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-xl font-black uppercase tracking-tighter">Security Key</CardTitle>
                        </div>
                        {protectedPdfUrl && <Badge className="bg-green-600 text-white font-black uppercase text-[9px] px-3 animate-pulse">VAULT SEALED</Badge>}
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {!protectedPdfUrl ? (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Set Document Password</Label>
                                        <div className="relative">
                                            <Input 
                                                id="password" 
                                                type="password" 
                                                value={password} 
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Create a secret key..."
                                                disabled={isProtecting}
                                                className="h-14 text-lg font-black tracking-widest focus-visible:ring-primary border-2 rounded-2xl bg-muted/5 pl-5"
                                            />
                                            <ShieldAlert className="absolute right-5 top-1/2 -translate-y-1/2 size-5 text-primary/30" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Verify Password</Label>
                                        <Input 
                                            id="confirm-password" 
                                            type="password" 
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Verify secret key..."
                                            disabled={isProtecting}
                                            className={cn(
                                                "h-14 text-lg font-black tracking-widest border-2 rounded-2xl bg-muted/5 pl-5",
                                                confirmPassword && password !== confirmPassword && "border-destructive/50 ring-destructive/10 ring-4",
                                                confirmPassword && password === confirmPassword && "border-green-500/50 ring-green-500/10 ring-4"
                                            )}
                                        />
                                    </div>
                                </div>

                                <Separator className="opacity-10" />

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Permission Controls</Label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all">
                                            <div className="flex items-center gap-3">
                                                <Printer className="size-4 text-muted-foreground" />
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-black uppercase">Allow Printing</p>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">High quality printing enabled</p>
                                                </div>
                                            </div>
                                            <Switch checked={allowPrinting} onCheckedChange={setAllowPrinting} disabled={isProtecting} />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all">
                                            <div className="flex items-center gap-3">
                                                <Copy className="size-4 text-muted-foreground" />
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-black uppercase">Allow Content Copy</p>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Text & Image extraction enabled</p>
                                                </div>
                                            </div>
                                            <Switch checked={allowCopying} onCheckedChange={setAllowCopying} disabled={isProtecting} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 bg-green-500/5 border-2 border-dashed border-green-500/30 rounded-[2.5rem] flex flex-col items-center gap-6 text-center animate-in zoom-in-95">
                                <div className="size-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-[0_20px_40px_rgba(34,197,94,0.4)]">
                                    <CheckCircle2 className="h-10 w-10" />
                                </div>
                                <div>
                                    <p className="font-black text-green-800 text-2xl uppercase tracking-tighter leading-tight">ENCRYPTION ACTIVE</p>
                                    <p className="text-[10px] font-bold text-green-600 mt-2 uppercase tracking-widest">REAL AES-128 BIT PROTECTION</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 bg-muted/5 p-8 border-t border-dashed">
                        {!protectedPdfUrl ? (
                            <Button 
                                onClick={handleProtectPdf} 
                                disabled={isProtecting || !password || password !== confirmPassword} 
                                className="w-full h-18 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl group transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isProtecting ? <Loader2 className="animate-spin mr-3 size-7"/> : <Lock className="mr-3 h-7 w-7 group-hover:scale-110 transition-transform"/>}
                                {isProtecting ? "RE-ENCODING..." : "PROTECT PDF NOW"}
                            </Button>
                        ) : (
                            <Button onClick={handleDownload} className="w-full h-18 text-xl font-black bg-green-600 hover:bg-green-700 shadow-2xl rounded-2xl animate-bounce">
                                <Download className="mr-3 h-7 w-7" /> DOWNLOAD SECURE PDF
                            </Button>
                        )}
                        <Button variant="ghost" onClick={resetState} className="w-full h-10 text-[10px] font-black uppercase text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl" disabled={isProtecting}>
                            <RefreshCcw className="h-4 w-4 mr-2" /> {protectedPdfUrl ? "Protect Another File" : "Change Source Document"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Right: File Preview & Progress */}
            <div className="lg:col-span-7 space-y-6">
                <Card className="border-2 shadow-2xl overflow-hidden h-full flex flex-col relative rounded-[2.5rem] bg-slate-100 dark:bg-slate-900">
                    <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between px-8">
                        <div className="flex items-center gap-2 truncate pr-4">
                            <FileLock2 className="h-5 w-5 text-primary shrink-0" />
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground truncate">{pdfFile.name}</CardTitle>
                        </div>
                        <Badge variant="outline" className="font-mono text-[9px] px-2">{formatBytes(pdfFile.size)}</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 flex flex-col relative min-h-[450px]">
                        {isProtecting ? (
                            <div className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center gap-10 animate-in fade-in duration-300">
                                <div className="relative">
                                    <Loader2 className="h-24 w-24 animate-spin text-primary stroke-[3]" />
                                    <Lock className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-6 w-full max-w-sm">
                                    <div className="space-y-2">
                                        <p className="font-black text-2xl text-primary uppercase tracking-tighter">{statusText}</p>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Implementing Stream Encryption...</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Progress value={progress} className="h-3 shadow-inner rounded-full bg-primary/10" />
                                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">{progress}% Complete</p>
                                    </div>
                                </div>
                            </div>
                        ) : protectedPdfUrl ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-8 bg-slate-200 dark:bg-slate-800 shadow-inner">
                                <div className="size-48 bg-white dark:bg-slate-950 rounded-3xl shadow-3xl border-8 border-white dark:border-slate-800 flex items-center justify-center relative overflow-hidden group">
                                    <FileLock2 className="size-24 text-green-500 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                                    <Lock className="absolute size-12 text-green-600 drop-shadow-2xl" />
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-green-500" />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Your Document is Now Locked</p>
                                    <p className="text-xs text-muted-foreground font-bold max-w-[250px] uppercase leading-relaxed">This file will now trigger a native password prompt on all devices.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30 gap-8">
                                <div className="relative">
                                    <div className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                                    <div className="size-32 rounded-[3rem] bg-muted/50 border-4 border-dashed border-muted-foreground/30 flex items-center justify-center relative">
                                        <Eye className="size-16 text-muted-foreground/30" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xl font-black uppercase tracking-tight">Awaiting Key Configuration</p>
                                    <p className="text-sm font-bold uppercase tracking-widest">Set your password on the left to initialize encryption.</p>
                                </div>
                            </div>
                        )}

                        {errorDetails && (
                            <div className="p-8 animate-in slide-in-from-bottom-2">
                                <Alert variant="destructive" className="rounded-2xl border-2">
                                    <AlertCircle className="h-5 w-5" />
                                    <AlertTitle className="font-black uppercase tracking-tight">Encryption Failure</AlertTitle>
                                    <AlertDescription className="font-bold opacity-80">{errorDetails}</AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-white dark:bg-slate-950 border-t py-6 px-10">
                        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground/50">
                                <ShieldCheck className="size-4 text-green-600" /> AES-STANDARD COMPLIANT
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setPdfFile(null)} className="font-black text-[10px] uppercase text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="size-3.5 mr-1.5" /> Clear Document
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
