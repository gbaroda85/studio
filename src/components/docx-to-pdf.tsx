
"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { 
    UploadCloud, 
    FileText, 
    FileOutput, 
    Download, 
    Loader2, 
    CheckCircle2, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    RefreshCcw,
    X,
    FileDigit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { convertDocxToPdf } from "@/lib/docx-utils";
import confetti from 'canvas-confetti';

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

export default function DocxToPdf() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (incomingFile: File | null) => {
    if (incomingFile && (incomingFile.name.endsWith(".docx") || incomingFile.name.endsWith(".doc"))) {
      setFile(incomingFile);
      setIsSuccess(false);
      setProgress(0);
    } else if (incomingFile) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please upload a valid Word document (.docx)." });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(20);
    
    try {
        const interval = setInterval(() => {
            setProgress(p => p < 90 ? p + 5 : p);
        }, 300);

        await convertDocxToPdf(file);
        
        clearInterval(interval);
        setProgress(100);
        setIsSuccess(true);
        
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#5cbdb9', '#fbe3e8', '#ffffff']
        });

        toast({ title: "Conversion Successful!", description: "Your PDF has been generated and downloaded." });
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Conversion Error", description: "Failed to convert document. Try a simpler Word file." });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setIsSuccess(false);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!file) {
    return (
      <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6">
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="mx-auto mb-2 grid size-20 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-xl relative">
                <FileText className="size-10" />
                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-6 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <Sparkles className="size-3" />
                </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase leading-none">
                Word to <span className="text-gradient-hero">PDF Pro</span>
            </h1>
            <p className="text-sm text-muted-foreground font-semibold max-w-xl mx-auto">
                Convert Word (.docx) documents to professional PDF files instantly. <br/>100% Private local browser engine.
            </p>
        </div>

        <Card
            className={cn("w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed cursor-pointer hover:border-primary/50", isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]")}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <CardContent className="p-16 md:p-24 flex flex-col items-center justify-center space-y-6">
                <div className="relative group">
                    <UploadCloud className="size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Zap className="absolute -top-2 -right-2 size-8 text-yellow-500 animate-pulse" />
                </div>
                <div className="text-center">
                    <p className="text-2xl font-black uppercase tracking-tighter">Drop Word File here</p>
                    <p className="text-sm text-muted-foreground mt-2 font-bold opacity-60">Supports .docx files. No uploads needed.</p>
                </div>
            </CardContent>
            <input ref={fileInputRef} type="file" className="hidden" accept=".docx,.doc" onChange={onFileChange} />
        </Card>

        <div className="flex flex-wrap justify-center gap-8 text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-4">
            <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> LOCAL PROCESSING</div>
            <div className="flex items-center gap-2"><FileDigit className="size-4 text-primary" /> HD RENDERING</div>
            <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> INSTANT CONVERSION</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-10">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                <FileOutput className="size-8" />
            </div>
            <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Studio <span className="text-primary">Converter</span></h2>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[8px] font-black uppercase bg-green-500/5 text-green-600 border-green-500/20">A4 Ready</Badge>
                    <Badge variant="outline" className="text-[8px] font-black uppercase bg-primary/5 text-primary border-primary/20">Local RAM</Badge>
                </div>
            </div>
        </div>
        <Button variant="outline" onClick={handleReset} className="h-12 border-2 font-black text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive">
            <RefreshCcw className="mr-2 size-4" /> Change File
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Workspace: File Info */}
        <div className="lg:col-span-7">
            <Card className="overflow-hidden glass-card border-none shadow-2xl relative rounded-[3rem]">
                <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="size-5 text-primary" />
                        <CardTitle className="text-sm font-black uppercase tracking-widest truncate max-w-[200px]">{file.name}</CardTitle>
                    </div>
                    <Badge className="font-mono text-[10px]">{formatBytes(file.size)}</Badge>
                </CardHeader>
                <CardContent className="p-12 flex flex-col items-center justify-center min-h-[400px] bg-slate-50 dark:bg-slate-900/50">
                    {isSuccess ? (
                        <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                             <div className="size-24 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-green-500/40 relative">
                                <CheckCircle2 className="size-12" />
                                <Sparkles className="absolute -top-2 -right-2 text-yellow-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black uppercase tracking-tighter text-green-700">Converted!</h3>
                                <p className="text-sm text-muted-foreground font-bold">Your professional PDF has been saved.</p>
                            </div>
                            <Button size="lg" className="h-16 px-12 bg-green-600 hover:bg-green-700 text-xl font-black rounded-[1.5rem] shadow-2xl active:scale-95 transition-all w-full" onClick={handleReset}>
                                CONVERT ANOTHER FILE
                            </Button>
                        </div>
                    ) : isProcessing ? (
                        <div className="w-full max-w-sm space-y-8 text-center">
                            <div className="relative inline-block">
                                <Loader2 className="h-24 w-24 animate-spin text-primary opacity-20 stroke-[3]" />
                                <FileText className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                <p className="font-black text-2xl text-primary uppercase tracking-tighter animate-pulse">Rendering PDF...</p>
                                <Progress value={progress} className="h-2 shadow-inner bg-primary/10" />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">Mapping Word Styles to PDF Canvas...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-6 text-center opacity-40">
                             <div className="size-32 rounded-[2.5rem] bg-muted/50 border-4 border-dashed flex items-center justify-center">
                                <FileText className="size-16 text-muted-foreground" />
                             </div>
                             <div className="space-y-1">
                                <p className="text-xl font-black uppercase tracking-tighter">Ready to Transform</p>
                                <p className="text-xs font-bold uppercase tracking-widest">Click below to start local conversion.</p>
                             </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-primary/5 border-b border-white/10 p-8">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <ShieldCheck className="size-7 text-primary" /> PRIVATE CONVERSION
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <FileDigit className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-tight">HD Quality</p>
                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">Uses Mammoth.js for semantic HTML mapping followed by high-DPI canvas rendering.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-tight">Zero Cloud</p>
                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">Conversion happens 100% in your device memory. Your documents never reach a server.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-8 border-t border-white/10">
                    <Button 
                        className="w-full h-20 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl group transition-all active:scale-95 disabled:opacity-50"
                        onClick={handleConvert}
                        disabled={isProcessing || isSuccess}
                    >
                        {isProcessing ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="size-8 animate-spin" />
                                <span className="uppercase tracking-tighter">CONVERTING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Zap className="size-8 text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform" />
                                <span className="uppercase tracking-tighter text-2xl">CONVERT TO PDF</span>
                            </div>
                        )}
                    </Button>
                </CardFooter>
            </Card>
            
            <div className="p-6 bg-green-500/5 rounded-[2rem] border-2 border-green-500/10 flex gap-4 items-center shadow-sm">
                <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-6 text-green-600" />
                </div>
                <div>
                    <p className="text-[11px] font-black text-green-700 uppercase tracking-tight">Security Lock Active</p>
                    <p className="text-[10px] text-green-600/80 font-medium leading-tight">ISO-Standard compliant local mapping. Guaranteed data privacy.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
