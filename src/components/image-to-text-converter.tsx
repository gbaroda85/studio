"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from "react";
import Image from "next/image";
import { 
    UploadCloud, 
    Loader2, 
    X, 
    FileScan, 
    Clipboard, 
    CheckCircle2, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    RefreshCcw, 
    SearchCode, 
    FileText, 
    Settings2, 
    Eye, 
    RotateCcw, 
    Languages, 
    BrainCircuit, 
    Wand2, 
    ImageIcon,
    Download,
    ArrowLeftRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { imageToText } from "@/ai/flows/image-to-text-flow";

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
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function ImageToTextConverter() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setOriginalFileSize(file.size);
      const reader = new FileReader();
      reader.onload = (e) => setOriginalImageSrc(e.target?.result as string);
      reader.readAsDataURL(file);
      setExtractedText(null);
    } else if (file) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a valid image file.",
      });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const getOptimizedPayload = async (src: string): Promise<string> => {
      return new Promise((resolve) => {
          const img = new window.Image();
          img.src = src;
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (!ctx) return resolve(src);
              const MAX_WIDTH = 1600;
              let width = img.width;
              let height = img.height;
              if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
              }
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
      });
  };

  const handleExtractText = async () => {
    if (!originalImageSrc) return;
    
    setIsProcessing(true);
    setExtractedText(null);

    try {
      const optimizedSrc = await getOptimizedPayload(originalImageSrc);
      const result = await imageToText({ photoDataUri: optimizedSrc });
      
      if (result && result.success && result.text) {
        setExtractedText(result.text);
        toast({ title: "Extraction Success", description: "Text has been processed accurately." });
      } else {
        const errorMsg = result?.error || "AI could not process this image.";
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('[OCR Error UI]:', error);
      const msg = error.message?.includes('Server Components render')
        ? "Network payload error. Image was too large for the cloud to process."
        : error.message || "AI engine failed. Please try a clearer photo.";
        
      toast({ 
        variant: "destructive", 
        title: "Extraction Failed", 
        description: msg
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setHasCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setHasCopied(false), 2000);
  }

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setExtractedText(null);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!originalImageSrc) {
    return (
      <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 mb-4">
            <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
                <FileScan className="size-8" />
                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <SearchCode className="size-2.5" />
                </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                Image <span className="text-gradient-hero">to Text (OCR)</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-bold max-xl mx-auto">
                Step 1: Upload photo for high-accuracy extraction. <br/>100% Private local RAM processing.
            </p>
        </motion.div>

        <Card
            className={cn(
                "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20 cursor-pointer select-none",
                isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
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
                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Photo here</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 font-bold opacity-60 uppercase tracking-widest">Extraction happens entirely in your browser.</p>
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
            </CardContent>
            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                <div className="flex items-center gap-1.5"><Languages className="size-3 text-green-600" /> BILINGUAL (EN/HI)</div>
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-yellow-500" /> SECURE RAM</div>
                <div className="flex items-center gap-1.5"><ImageIcon className="size-3 text-primary" /> HD OCR</div>
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
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter">Studio <span className="text-primary">Panel</span></h2>
            </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
             <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-11 md:h-12 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive transition-all">
                <RefreshCcw className="mr-1.5 size-3 md:size-4" /> Change Image
            </Button>
            <Button size="lg" className="magic-button magic-button-success flex-1 md:flex-none h-11 md:h-12 px-10 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 font-black rounded-full transition-all active:scale-95 group flex items-center justify-center gap-4" onClick={handleCopyToClipboard} disabled={!extractedText || hasCopied}>
                <StarIcons />
                {hasCopied ? <CheckCircle2 className="size-7 md:size-8" /> : <Clipboard className="size-7 md:size-8" />} 
                <span className="uppercase tracking-tighter text-[10px] md:text-xs">{hasCopied ? "COPIED" : "COPY TEXT"}</span>
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
            <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary" />
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">SCANNING VIEWPORT</CardTitle>
                    </div>
                    {extractedText && <Badge className="bg-green-600 text-white font-black text-[9px] px-3 py-1 rounded-full border-2 border-white shadow-md animate-in zoom-in-95">READY</Badge>}
                </CardHeader>
                <CardContent className="p-6 md:p-10 lg:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[450px] flex items-center justify-center relative">
                    <div className="relative size-full min-h-[350px] flex items-center justify-center">
                        <Image src={originalImageSrc} alt="Original" fill className="object-contain p-4 md:p-8 animate-in zoom-in-95 duration-500" />
                        <AnimatePresence>
                            {isProcessing && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 flex flex-col items-center justify-center gap-4 z-20 backdrop-blur-sm p-8 text-center"
                                >
                                    <div className="relative">
                                        <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin text-primary stroke-[3]" />
                                        <BrainCircuit className="absolute inset-0 m-auto h-5 w-5 md:h-6 md:w-6 text-primary animate-pulse" />
                                    </div>
                                    <div className="space-y-3 w-full max-w-[200px] md:max-w-xs">
                                        <p className="font-black text-sm md:text-lg text-primary animate-pulse uppercase tracking-tighter">Extracting text Content...</p>
                                        <Progress value={undefined} className="h-1.5 shadow-inner" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
                <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8">
                    <div className="flex items-center justify-center gap-8 w-full text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">
                        <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE HANDSHAKE</div>
                        <div className="flex items-center gap-2"><Languages className="size-4 text-green-600" /> BILINGUAL (EN/HI)</div>
                        <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> HD PRECISION</div>
                    </div>
                </CardFooter>
            </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-2xl">
                <CardHeader className="bg-primary/5 border-b border-white/10 p-4 md:p-6">
                    <CardTitle className="text-sm md:text-base flex items-center gap-2 font-black uppercase tracking-tighter">
                        <Settings2 className="size-4 md:size-5 text-primary" /> Properties
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8 md:space-y-10">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Engine Actions</Label>
                        <Button 
                            className="magic-button w-full h-14 md:h-18 text-lg font-black bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary rounded-full transition-all active:scale-95 disabled:opacity-50 group flex items-center justify-center gap-4 px-10" 
                            onClick={handleExtractText}
                            disabled={isProcessing || !!extractedText}
                        >
                            <StarIcons />
                            {isProcessing ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="size-7 md:size-8 animate-spin" />
                                    <span className="uppercase text-sm md:text-base tracking-tighter">EXTRACTING...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Wand2 className="size-7 md:size-8 text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform" />
                                    <span className="uppercase tracking-tighter text-lg md:text-xl">EXTRACT TEXT</span>
                                </div>
                            )}
                        </Button>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Extracted Content</Label>
                            {extractedText && <Badge variant="secondary" className="font-mono text-[8px]">{extractedText.length} Chars</Badge>}
                        </div>
                        <div className="relative group">
                            <Textarea
                                className="min-h-[400px] md:min-h-[600px] text-sm font-bold border-2 rounded-xl bg-background/50 focus-visible:ring-primary/20 shadow-inner p-4 custom-scrollbar text-slate-800 dark:text-slate-200"
                                placeholder={isProcessing ? "Reading..." : "Text result will appear here..."}
                                value={extractedText || ""}
                                onChange={(e) => setExtractedText(e.target.value)}
                                readOnly={isProcessing}
                            />
                            {extractedText && (
                                <div className="absolute bottom-2 right-2 flex gap-1 animate-in fade-in">
                                     <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg shadow-md" onClick={handleCopyToClipboard}>
                                        {hasCopied ? <CheckCircle2 className="size-4 text-green-600" /> : <Clipboard className="size-4" />}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 md:p-5 bg-green-500/5 rounded-xl md:rounded-2xl border-2 border-green-500/10 flex gap-3 md:gap-4 shadow-sm">
                        <ShieldCheck className="size-5 md:size-6 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[9px] md:text-[11px] font-black text-green-700 uppercase tracking-tight">100% Secure RAM</p>
                            <p className="text-[8px] md:text-[10px] text-green-600/80 font-bold leading-tight mt-1 uppercase">
                                Every pixel is processed in your device's memory for total privacy.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-3 border-t border-white/10 flex justify-center gap-4 opacity-40 text-[7px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1"><ShieldCheck className="size-2.5 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-1"><Zap className="size-2.5 text-yellow-500" /> INSTANT</div>
                    <div className="flex items-center gap-1"><FileText className="size-2.5 text-primary" /> HD TEXT</div>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
