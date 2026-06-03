
"use client";

import { useState, useRef, useEffect, type DragEvent, type ChangeEvent, useCallback } from "react";
import Image from "next/image";
import { 
  UploadCloud, 
  Loader2, 
  Download, 
  X, 
  Sparkles, 
  Zap,
  PenLine,
  CheckCircle2,
  FileType,
  Settings2,
  Eraser,
  RefreshCcw,
  ShieldCheck,
  ImageIcon,
  Eye,
  ArrowLeftRight,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export default function SignatureRemover() {
  const { toast } = useToast();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resultImageSrc, setResultImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [resultFileSize, setResultFileSize] = useState<number>(0);
  
  // Controls
  const [sensitivity, setSensitivity] = useState([40]);
  const [boostInk, setBoostInk] = useState([20]);

  // Reference for the original pixel data to prevent any scaling glitches
  const sourceDataRef = useRef<{ data: Uint8ClampedArray; width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Light Checkerboard for consistent visibility across themes
  const checkerboardStyle: React.CSSProperties = {
    backgroundImage:
      "linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.05) 75%)",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
    backgroundColor: "#ffffff"
  };

  const processFromBuffer = useCallback(() => {
    if (!sourceDataRef.current) return;

    const { data: sourcePixels, width, height } = sourceDataRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const output = ctx.createImageData(width, height);
    const dst = output.data;
    
    // Threshold calculation
    const thresh = sensitivity[0];
    const inkFactor = 1 + (boostInk[0] / 100);

    // Find max brightness reference (paper color)
    let maxLuma = 0;
    for (let i = 0; i < sourcePixels.length; i += 4) {
        const luma = 0.299 * sourcePixels[i] + 0.587 * sourcePixels[i+1] + 0.114 * sourcePixels[i+2];
        if (luma > maxLuma) maxLuma = luma;
    }

    for (let i = 0; i < sourcePixels.length; i += 4) {
        const r = sourcePixels[i], g = sourcePixels[i+1], b = sourcePixels[i+2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        const diff = maxLuma - luma;

        if (diff > thresh) {
            // Keep ink, apply darkening
            dst[i] = Math.max(0, r / inkFactor);
            dst[i+1] = Math.max(0, g / inkFactor);
            dst[i+2] = Math.max(0, b / inkFactor);
            dst[i+3] = 255;
        } else {
            // Transparent background
            dst[i+3] = 0;
        }
    }

    ctx.putImageData(output, 0, 0);
    const outUrl = canvas.toDataURL("image/png", 1.0);
    setResultImageSrc(outUrl);
    setResultFileSize(Math.round((outUrl.length - 22) * 0.75));
  }, [sensitivity, boostInk]);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setOriginalFileSize(file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setOriginalImageSrc(src);
        
        const img = new window.Image();
        img.src = src;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                sourceDataRef.current = {
                    data: new Uint8ClampedArray(originalPixels),
                    width: canvas.width,
                    height: canvas.height
                };
                processFromBuffer();
            }
        };
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please upload an image." });
    }
  };

  useEffect(() => {
    if (sourceDataRef.current) {
        const timer = setTimeout(processFromBuffer, 20);
        return () => clearTimeout(timer);
    }
  }, [sensitivity, boostInk, processFromBuffer]);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const handleDownload = () => {
    if (!resultImageSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = resultImageSrc;
    // Updated filename logic
    const name = imageFile.name.includes('.') ? imageFile.name.split(".").slice(0, -1).join(".") : imageFile.name;
    link.download = `GR7-Tools-Signature-${name}.png`;
    link.click();
  };

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setResultImageSrc(null);
    sourceDataRef.current = null;
    setSensitivity([40]);
    setBoostInk([20]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!originalImageSrc) {
    return (
      <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 mb-4">
            <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
                <PenLine className="size-8" />
                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <Sparkles className="size-2.5" />
                </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                Signature <span className="text-gradient-hero">BG Remover</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                Step 1: Upload signature photo to extract ink. <br/>100% Private local RAM processing.
            </p>
        </motion.div>

        <Card
            className={cn("w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20", isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]")}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <CardHeader className="bg-muted/30 border-b p-6 text-center">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-10">
                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/30 transition-all group relative">
                    <div className="relative">
                        <UploadCloud className="size-12 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="text-center px-4">
                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter">Drop Signature here</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 font-bold opacity-60 uppercase">Extraction happens 100% locally.</p>
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
            </CardContent>
            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT</div>
                <div className="flex items-center gap-1.5"><FileType className="size-3 text-primary" /> TRANSPARENT</div>
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
        <div className="flex gap-2 w-full md:w-auto">
             <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-9 md:h-10 border-2 font-black text-[8px] md:text-[9px] uppercase px-4 rounded-lg">
                <RotateCcw className="mr-1.5 size-3" /> Reset
            </Button>
            <Button size="lg" className="flex-1 md:flex-none h-9 md:h-10 px-6 bg-green-600 hover:bg-green-700 font-black text-[9px] md:text-xs rounded-lg shadow-xl" onClick={handleDownload} disabled={isProcessing || !resultImageSrc}>
                <Download className="mr-1.5 size-3.5" /> DOWNLOAD PNG
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
            <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4 text-primary" />
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Before & After Comparison</CardTitle>
                    </div>
                    {resultImageSrc && <Badge className="bg-green-600 text-white font-black text-[9px] px-3 py-1 rounded-full border-2 border-white shadow-md animate-in zoom-in-95">CLEANED</Badge>}
                </CardHeader>
                <CardContent className="p-6 md:p-10 lg:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[400px]">
                    <div className="grid md:grid-cols-2 gap-6 md:gap-8 h-full items-center">
                        <div className="space-y-3 flex flex-col h-full justify-center">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Original Photo</span>
                                <span className="text-[9px] font-mono opacity-40">{(originalFileSize / 1024).toFixed(1)} KB</span>
                            </div>
                            <div className="relative aspect-square bg-white rounded-[2rem] border-2 shadow-inner flex items-center justify-center overflow-hidden group">
                                <Image src={originalImageSrc!} alt="Original" fill className="object-contain p-4 md:p-6 transition-all group-hover:scale-105" />
                                <div className="absolute top-4 left-4"><Badge variant="outline" className="text-[8px] bg-white/80 border-slate-200 text-slate-800">BEFORE</Badge></div>
                            </div>
                        </div>

                        <div className="space-y-3 flex flex-col h-full justify-center">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5"><Sparkles className="size-3"/> Cleaned Ink</span>
                                {resultImageSrc && <span className="text-[9px] font-mono font-black text-primary">{(resultFileSize / 1024).toFixed(1)} KB</span>}
                            </div>
                            <div className="relative aspect-square rounded-[2rem] border-4 border-primary/20 shadow-2xl flex items-center justify-center overflow-hidden" style={checkerboardStyle}>
                                <AnimatePresence mode="wait">
                                    {resultImageSrc ? (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative size-full p-2">
                                            <Image src={resultImageSrc} alt="Result" fill className="object-contain p-4 md:p-6 drop-shadow-2xl" />
                                            <div className="absolute top-4 right-4"><div className="bg-green-500 text-white rounded-full p-1.5 shadow-xl ring-4 ring-white"><CheckCircle2 className="size-5" /></div></div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-3 opacity-10 p-12 text-center">
                                            <Loader2 className="size-12 animate-spin text-muted-foreground" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Processing...</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                                <div className="absolute top-4 left-4"><Badge className="text-[8px] bg-primary text-primary-foreground uppercase border-none">AFTER</Badge></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8">
                    <div className="flex items-center justify-center gap-8 w-full text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">
                        <div className="flex items-center gap-2"><ShieldCheck className="size-4" /> SECURE LOCAL RAM</div>
                        <div className="flex items-center gap-2"><Zap className="size-4" /> INSTANT PREVIEW</div>
                        <div className="flex items-center gap-2"><FileType className="size-4" /> TRANSPARENT PNG</div>
                    </div>
                </CardFooter>
            </Card>
        </div>

        {/* Sidebar: Controls */}
        <div className="lg:col-span-4 space-y-4">
            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-2xl">
                <CardHeader className="bg-primary/5 border-b border-white/10 p-4">
                    <CardTitle className="text-sm flex items-center gap-2 font-black uppercase tracking-tighter">
                        <Settings2 className="size-4 text-primary" /> Adjustment Studio
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8 md:space-y-10">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-1.5 text-muted-foreground">
                                    <Eraser className="size-3" /> Sensitivity
                                </Label>
                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{sensitivity[0]}</span>
                            </div>
                            <Slider min={5} max={150} step={1} value={sensitivity} onValueChange={setSensitivity} className="py-2" />
                            <p className="text-[9px] text-muted-foreground italic leading-tight uppercase opacity-60">Adjust to remove paper color and shadows.</p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-1.5 text-muted-foreground">
                                    <FileType className="size-3" /> Ink Darkness
                                </Label>
                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">+{boostInk[0]}%</span>
                            </div>
                            <Slider min={0} max={100} step={1} value={boostInk} onValueChange={setBoostInk} className="py-2" />
                            <p className="text-[9px] text-muted-foreground italic leading-tight uppercase opacity-60">Makes the extracted ink darker and sharper.</p>
                        </div>
                    </div>

                    <div className="p-4 md:p-5 bg-green-500/5 rounded-xl md:rounded-2xl border-2 border-green-500/10 flex gap-3 md:gap-4">
                        <CheckCircle2 className="size-5 md:size-6 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[9px] md:text-[11px] font-black text-green-700 uppercase tracking-tight">Pixel-Lock Logic</p>
                            <p className="text-[8px] md:text-[10px] text-green-600/80 font-medium leading-tight mt-1">
                                Strict memory binding active. No artifacts even during zoom or theme switching.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-3 border-t border-white/10 flex justify-center gap-4 opacity-40 text-[7px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1"><ShieldCheck className="size-2.5 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-1"><Zap className="size-2.5 text-yellow-500" /> GLITCH-PROOF</div>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
