"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { 
    UploadCloud, 
    Lock, 
    ShieldCheck, 
    Zap, 
    Download, 
    RefreshCcw, 
    Eye, 
    EyeOff, 
    Loader2, 
    CheckCircle2, 
    ShieldAlert, 
    AlertCircle,
    X,
    FileText,
    Sparkles,
    FileDigit,
    Settings2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { lockPdf } from "@/lib/pdf-utils";
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from "framer-motion";

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

export default function PdfLocker() {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [protectedBlob, setProtectedBlob] = useState<Blob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setProtectedBlob(null);
      setProgress(0);
    } else if (file) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please upload a valid PDF document." });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const handleProtect = async () => {
    if (!pdfFile || !password) return;
    
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Password Mismatch", description: "The passwords entered do not match." });
      return;
    }

    if (password.length < 4) {
        toast({ variant: "destructive", title: "Weak Password", description: "Password should be at least 4 characters long." });
        return;
    }

    setIsProcessing(true);
    setProgress(10);
    
    try {
        const interval = setInterval(() => {
            setProgress(p => p < 80 ? p + 10 : p);
        }, 150);

        const blob = await lockPdf(pdfFile, password);
        
        clearInterval(interval);
        setProtectedBlob(blob);
        setProgress(100);
        
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#5cbdb9', '#fbe3e8', '#ffffff']
        });

        toast({ title: "Document Locked!", description: "AES encryption applied with HD sanitization." });
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Encryption Error", description: "Failed to protect document. Check if the original PDF is corrupted." });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!protectedBlob || !pdfFile) return;
    const url = URL.createObjectURL(protectedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GR7-Tools-${pdfFile.name}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setPdfFile(null);
    setPassword("");
    setConfirmPassword("");
    setProtectedBlob(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!pdfFile) {
    return (
      <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 mb-4">
            <div className="mx-auto mb-2 grid size-16 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-xl relative">
                <Lock className="size-8 md:size-10" />
                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <Sparkles className="size-2.5 md:size-3" />
                </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                Vault <span className="text-gradient-hero">PDF Locker</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                Secure your bank statements and IDs with standard AES encryption. <br/>100% Private local engine.
            </p>
        </motion.div>

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
                        <UploadCloud className="size-12 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Zap className="absolute -top-2 -right-2 size-5 md:size-6 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="text-center px-4">
                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop PDF here</p>
                        <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">High-fidelity sanitization active.</p>
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
            </CardContent>
            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> AES-128 ENCRYPTION</div>
                <div className="flex items-center gap-1.5"><FileDigit className="size-3 text-primary" /> HD SANITIZATION</div>
                <div className="flex items-center gap-1.5"><ShieldAlert className="size-3 text-rose-500" /> ZERO SERVER LOGS</div>
            </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-4">
            <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                <Lock className="size-5 md:size-6" />
            </div>
            <div>
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter">Studio <span className="text-primary">Panel</span></h2>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* Left: File Preview & Info */}
        <div className="lg:col-span-7">
            <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                <CardHeader className="bg-muted/30 border-b p-4 md:p-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3 truncate pr-4">
                        <FileText className="size-4 text-primary shrink-0" />
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest truncate">{pdfFile.name}</CardTitle>
                    </div>
                    <Badge className="font-mono text-[9px]">{formatBytes(pdfFile.size)}</Badge>
                </CardHeader>
                <CardContent className="p-6 md:p-12 flex-1 flex flex-col items-center justify-center min-h-[450px] bg-slate-50 dark:bg-slate-900/50 shadow-inner">
                    {protectedBlob ? (
                        <div className="text-center space-y-6 md:space-y-8 animate-in zoom-in-95 duration-500 w-full">
                             <div className="size-20 md:size-24 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-green-500/40 relative">
                                <CheckCircle2 className="size-10 md:size-12" />
                                <Sparkles className="absolute -top-2 -right-2 text-yellow-400 size-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-green-700">Protected!</h3>
                                <p className="text-[10px] md:text-sm text-muted-foreground font-bold uppercase">Your document is sanitized and sealed.</p>
                            </div>
                        </div>
                    ) : isProcessing ? (
                        <div className="w-full max-w-sm space-y-6 md:space-y-8 text-center">
                            <div className="relative inline-block">
                                <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20 stroke-[3]" />
                                <Lock className="absolute inset-0 m-auto h-8 w-8 md:h-12 md:w-12 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-3 md:space-y-4">
                                <p className="font-black text-xl md:text-2xl text-primary uppercase tracking-tighter animate-pulse">Encoding AES...</p>
                                <Progress value={progress} className="h-1.5 md:h-2 shadow-inner bg-primary/10" />
                                <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">Cleaning buffer and applying AES lock...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 md:gap-6 text-center opacity-40">
                             <ShieldCheck className="size-24 md:size-32 text-primary/20" />
                             <div className="space-y-1">
                                <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Ready for Protection</p>
                                <p className="text-[10px] md:text-xs font-bold uppercase">Enter a secure password to seal this document.</p>
                             </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto h-12 md:h-14 px-6 border-2 font-black text-[11px] md:text-xs uppercase rounded-xl hover:bg-destructive/5 hover:text-destructive transition-all">
                            <RefreshCcw className="mr-2 size-4" /> Change File
                        </Button>
                        
                        {protectedBlob && (
                            <Button 
                                size="lg" 
                                className="magic-button magic-button-success w-full sm:w-auto h-12 md:h-14 px-10 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 font-black rounded-xl transition-all active:scale-95 group flex items-center justify-center gap-3" 
                                onClick={handleDownload}
                            >
                                <StarIcons />
                                <Download className="mr-1.5 size-5 group-hover:translate-y-1 transition-transform" /> 
                                <span className="uppercase tracking-tighter text-[11px] md:text-xs font-black">SAVE SECURE PDF</span>
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>

        {/* Right: Security Panel */}
        <div className="lg:col-span-5 space-y-6">
            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-2xl md:rounded-[2.5rem]">
                <CardHeader className="bg-primary/5 border-b border-white/10 p-5 md:p-8">
                    <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter">
                        <Settings2 className="size-4 md:size-5 text-primary" /> Security Panel
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-6 md:space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Set Document Password</Label>
                            <div className="relative group">
                                <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Enter password..." 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 md:h-14 font-black text-base md:text-lg border-2 rounded-xl pl-4 md:pl-6 pr-12 md:pr-14 focus-visible:ring-primary/20 bg-background/50 shadow-inner"
                                    disabled={!!protectedBlob || isProcessing}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="size-4 md:size-5" /> : <Eye className="size-4 md:size-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Confirm Password</Label>
                            <div className="relative group">
                                <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Repeat password..." 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="h-12 md:h-14 font-black text-base md:text-lg border-2 rounded-xl pl-4 md:pl-6 pr-12 md:pr-14 focus-visible:ring-primary/20 bg-background/50 shadow-inner"
                                    disabled={!!protectedBlob || isProcessing}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="size-4 md:size-5" /> : <Eye className="size-4 md:size-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-5 bg-blue-500/5 rounded-xl md:rounded-2xl border-2 border-blue-500/10 flex gap-3 md:gap-4 shadow-sm">
                        <AlertCircle className="size-4 md:size-6 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] md:text-[11px] font-black text-blue-700 uppercase tracking-tight">Sanitization Protocol</p>
                            <p className="text-[8px] md:text-[10px] text-blue-600/80 font-medium leading-tight mt-1 uppercase">
                                We automatically rebuild the PDF structure to ensure encryption is applied deeply.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-5 md:p-8 border-t border-white/10">
                    <Button 
                        className="magic-button w-full h-16 md:h-18 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 px-10"
                        onClick={handleProtect}
                        disabled={!password || !confirmPassword || isProcessing || !!protectedBlob}
                    >
                        <StarIcons />
                        {isProcessing ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="size-6 md:size-7 animate-spin" />
                                <span className="uppercase text-sm md:text-base tracking-tighter">ENCRYPTING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Lock className="size-6 md:size-7 text-white group-hover:scale-125 transition-transform" />
                                <span className="uppercase tracking-tighter text-lg md:text-2xl">{protectedBlob ? "DOCUMENT SEALED" : "LOCK DOCUMENT"}</span>
                            </div>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
