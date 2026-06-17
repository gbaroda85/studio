
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
    Settings2,
    Key
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
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i}`}>
                <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
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

export default function PdfLocker() {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
      setPassword("");
      setConfirmPassword("");
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
            colors: ['#0d5a71', '#ef4444', '#ffffff']
        });

        toast({ title: "Document Locked!", description: "AES encryption applied securely." });
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Encryption Error", description: "Failed to protect document." });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!protectedBlob || !pdfFile) return;
    const url = URL.createObjectURL(protectedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Locked-${pdfFile.name}`;
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

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col items-center gap-6 pb-20 mx-auto">
        <AnimatePresence mode="wait">
            {!pdfFile ? (
                <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl py-10 flex flex-col items-center">
                    <div className="text-center space-y-2 mb-8">
                        <div className="mx-auto mb-4 grid size-20 place-items-center rounded-[2.5rem] bg-primary/10 text-primary shadow-xl relative border-2 border-primary/20">
                            <Lock className="size-10" />
                            <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-6 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                <Sparkles className="size-3" />
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase leading-none">
                            Vault <span className="text-gradient-hero">PDF Locker</span>
                        </h1>
                        <p className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                            Secure IDs with standard AES-128 encryption.
                        </p>
                    </div>

                    <Card
                        className={cn(
                            "w-full glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[3rem] hover:border-primary/50 cursor-pointer",
                            isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
                        )}
                        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <CardContent className="p-12 md:p-20">
                            <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center space-y-6 bg-muted/30 group">
                                <div className="relative">
                                    <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Zap className="absolute -top-1 -right-1 size-6 md:size-8 text-yellow-500 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop PDF to Seal</p>
                                    <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">100% Private local RAM processing.</p>
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <motion.div key="editor" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                        <div className="flex items-center gap-3">
                            <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                                <Settings2 className="size-5 md:size-6" />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-none text-left">Studio <span className="text-primary">Config</span></h2>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        <div className="lg:col-span-7">
                            <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                                <CardHeader className="bg-muted/30 border-b p-4 md:p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 truncate pr-4 text-left">
                                            <FileText className="size-5 text-primary shrink-0" />
                                            <CardTitle className="text-xs md:text-sm font-black uppercase tracking-widest truncate">{pdfFile.name}</CardTitle>
                                        </div>
                                        <Badge className="font-mono text-[9px] bg-white border-primary/10 text-primary">{formatBytes(pdfFile.size)}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 md:p-12 flex-1 flex flex-col items-center justify-center min-h-[400px] bg-slate-100 dark:bg-slate-900/50 shadow-inner">
                                    {protectedBlob ? (
                                        <div className="text-center space-y-8 animate-in zoom-in-95 duration-500 w-full">
                                            <div className="size-24 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-2xl relative">
                                                <CheckCircle2 className="size-12" />
                                                <div className="absolute -top-2 -right-2 text-yellow-400 size-8"><Sparkles className="size-full" /></div>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-green-700">Protected!</h3>
                                                <p className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-60 text-center">Your document is sealed with AES encryption.</p>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl mx-auto">
                                                <Button 
                                                    variant="outline" 
                                                    onClick={handleReset} 
                                                    className="w-full sm:w-auto h-16 md:h-18 px-8 border-2 font-black text-[11px] md:text-xs uppercase rounded-full bg-white dark:bg-slate-900 !text-slate-900 dark:!text-white border-slate-300 dark:border-white/20 hover:bg-destructive/5 hover:!text-destructive transition-all duration-300 shadow-sm"
                                                >
                                                    <RefreshCcw className="mr-1.5 size-5" /> Start Over
                                                </Button>
                                                
                                                <Button 
                                                    size="lg" 
                                                    className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-16 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none flex-[2]" 
                                                    onClick={handleDownload}
                                                >
                                                    <div className="absolute left-4 w-0.5 h-6 md:h-8 bg-white/40 rounded-full" />
                                                    <span className="flex-1 px-10 text-center tracking-widest text-[11px] md:text-xs uppercase">SAVE PDF</span>
                                                    <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                                        <Download className="size-6 md:size-8 group-hover:scale-110 transition-transform" />
                                                        <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                                                    </div>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : isProcessing ? (
                                        <div className="w-full space-y-8 text-center">
                                            <div className="relative inline-block">
                                                <Loader2 className="h-16 w-16 md:h-20 md:h-20 animate-spin text-primary opacity-20 stroke-[3]" />
                                                <Lock className="absolute inset-0 m-auto h-8 w-8 md:h-10 md:w-10 text-primary animate-pulse" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="font-black text-lg md:text-2xl text-primary uppercase tracking-tighter animate-pulse text-center">Encoding AES...</p>
                                                <Progress value={progress} className="h-1.5 shadow-inner" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-6 text-center opacity-30">
                                            <ShieldCheck className="size-24 md:size-32 text-primary/20" />
                                            <div className="space-y-1 text-center">
                                                <p className="text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Ready for Locking</p>
                                                <p className="text-[10px] md:text-sm font-bold uppercase">Enter passwords on the right to seal.</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-5 space-y-6">
                            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                                <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8">
                                    <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary text-left">
                                        <Key className="size-4 md:size-5 text-primary" /> Security Credentials
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8 space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-3 text-left">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Set Password</Label>
                                            <div className="relative group">
                                                <input 
                                                    type={showPassword ? "text" : "password"} 
                                                    placeholder="Create password..." 
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="flex h-12 md:h-14 w-full rounded-xl border-2 bg-background pl-4 pr-12 py-2 text-xl md:text-2xl font-black text-center focus-visible:ring-2 focus-visible:ring-primary outline-none shadow-inner"
                                                    disabled={!!protectedBlob || isProcessing}
                                                    autoFocus
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-left">
                                            <Label className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Repeat Password</Label>
                                            <div className="relative group">
                                                <input 
                                                    type={showConfirmPassword ? "text" : "password"} 
                                                    placeholder="Confirm password..." 
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="flex h-12 md:h-14 w-full rounded-xl border-2 bg-background pl-4 pr-12 py-2 text-xl md:text-2xl font-black text-center focus-visible:ring-2 focus-visible:ring-primary outline-none shadow-inner"
                                                    disabled={!!protectedBlob || isProcessing}
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 md:p-5 bg-blue-500/5 rounded-2xl border-2 border-blue-500/10 flex gap-4 text-left">
                                        <AlertCircle className="size-5 md:size-6 text-blue-600 shrink-0 mt-0.5" />
                                        <p className="text-[9px] md:text-[10px] text-blue-600/80 font-medium leading-tight uppercase">
                                            AES-128 Protocol. Your passwords are processed 100% locally in your device RAM.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-white/10">
                                    <div className="flex flex-col gap-4 w-full">
                                        <Button 
                                            className="magic-button w-full h-16 md:h-20 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 px-6 md:px-10"
                                            onClick={handleProtect}
                                            disabled={!password || !confirmPassword || isProcessing || !!protectedBlob}
                                        >
                                            <StarIcons />
                                            {isProcessing ? "ENCRYPTING..." : (
                                                <div className="flex items-center gap-3">
                                                    <Lock className="size-6 md:size-8" />
                                                    <span className="uppercase tracking-tighter text-xl font-black">{protectedBlob ? "SEALED" : "LOCK PDF"}</span>
                                                </div>
                                            )}
                                        </Button>

                                        {!protectedBlob && (
                                            <Button 
                                                variant="outline" 
                                                onClick={handleReset} 
                                                className="w-full h-11 border-2 font-black text-[10px] md:text-[11px] uppercase rounded-xl bg-white dark:bg-slate-900 !text-slate-900 dark:!text-white border-slate-300 dark:border-white/20 hover:bg-destructive/5 hover:!text-destructive transition-all duration-300 shadow-sm"
                                            >
                                                <RefreshCcw className="mr-1.5 size-3.5" /> Start Over
                                            </Button>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
