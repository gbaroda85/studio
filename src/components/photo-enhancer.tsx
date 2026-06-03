
"use client";

import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    X, 
    Wand2, 
    Sparkles, 
    Zap, 
    CheckCircle2,
    ShieldCheck,
    Image as ImageIcon,
    Settings2,
    Sun,
    Contrast,
    Droplets,
    RefreshCcw,
    Eye,
    ArrowLeftRight,
    RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function PhotoEnhancer() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resultImageSrc, setResultImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [enhancedFileSize, setEnhancedFileSize] = useState<number>(0);
  
  // Manual Adjustment States
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [sharpness, setSharpness] = useState([0]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setOriginalFileSize(file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setOriginalImageSrc(src);
        setResultImageSrc(src);
        resetAdjustments();
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a valid image file.",
      });
    }
  };

  const resetAdjustments = () => {
    setBrightness([100]);
    setContrast([100]);
    setSaturation([100]);
    setSharpness([0]);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const applyAdjustments = async () => {
    if (!originalImageSrc) return;

    const img = new window.Image();
    img.src = originalImageSrc;
    img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`;
        ctx.drawImage(img, 0, 0);
        ctx.filter = 'none';

        if (sharpness[0] > 0) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const w = canvas.width;
            const h = canvas.height;
            const factor = sharpness[0] / 10; 
            
            const kernel = [
                0, -factor, 0,
                -factor, 1 + (4 * factor), -factor,
                0, -factor, 0
            ];
            
            const output = ctx.createImageData(w, h);
            const dst = output.data;

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const i = (y * w + x) * 4;
                    let r = 0, g = 0, b = 0;
                    
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const scy = Math.min(h - 1, Math.max(0, y + ky));
                            const scx = Math.min(w - 1, Math.max(0, x + kx));
                            const srcOff = (scy * w + scx) * 4;
                            const wt = kernel[(ky + 1) * 3 + (kx + 1)];
                            r += data[srcOff] * wt;
                            g += data[srcOff + 1] * wt;
                            b += data[srcOff + 2] * wt;
                        }
                    }
                    dst[i] = r;
                    dst[i + 1] = g;
                    dst[i + 2] = b;
                    dst[i + 3] = data[i + 3];
                }
            }
            ctx.putImageData(output, 0, 0);
        }

        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        setResultImageSrc(dataUrl);
        setEnhancedFileSize(Math.round((dataUrl.length - 23) * 0.75));
    };
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        applyAdjustments();
    }, 50);
    return () => clearTimeout(timer);
  }, [brightness, contrast, saturation, sharpness, originalImageSrc]);

  const handleAutoEnhance = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setProgress(15);

    const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 15 : prev));
    }, 100);

    setTimeout(() => {
        setBrightness([105]);
        setContrast([115]);
        setSaturation([120]);
        setSharpness([2]);
        
        clearInterval(interval);
        setProgress(100);
        setIsProcessing(false);
        toast({ title: "Auto-Enhance Applied", description: "Visuals balanced for maximum quality." });
    }, 500);
  };

  const handleDownload = () => {
    if (!resultImageSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = resultImageSrc;
    const nameParts = imageFile.name.split(".");
    const name = nameParts.slice(0, -1).join(".");
    link.download = `${name}-enhanced.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setResultImageSrc(null);
    setIsProcessing(false);
    setProgress(0);
    resetAdjustments();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!originalImageSrc) {
    return (
      <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 mb-4">
            <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
                <Wand2 className="size-8" />
                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <Sparkles className="size-2.5" />
                </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                AI PHOTO <span className="text-gradient-hero">ENHANCER</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                Step 1: Upload photo to restore quality. <br/>100% Private local RAM processing.
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
                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter">Drop Photo here</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 font-bold opacity-60 uppercase">Processing happens 100% locally.</p>
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
            </CardContent>
            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE LOCAL</div>
                <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT RENDER</div>
                <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-primary" /> HD OUTPUT</div>
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
                <Download className="mr-1.5 size-3.5" /> DOWNLOAD HD
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Viewport: Before/After Comparison */}
        <div className="lg:col-span-8">
            <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4 text-primary" />
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Before & After Comparison</CardTitle>
                    </div>
                    {resultImageSrc && <Badge className="bg-green-600 text-white font-black text-[9px] px-3 py-1 rounded-full border-2 border-white shadow-md animate-in zoom-in-95">ENHANCED</Badge>}
                </CardHeader>
                <CardContent className="p-6 md:p-10 lg:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[400px]">
                    <div className="grid md:grid-cols-2 gap-6 md:gap-8 h-full items-center">
                        <div className="space-y-3 flex flex-col h-full justify-center">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Original Photo</span>
                                <span className="text-[9px] font-mono opacity-40">{formatBytes(originalFileSize)}</span>
                            </div>
                            <div className="relative aspect-square bg-white rounded-[2rem] border-2 shadow-inner flex items-center justify-center overflow-hidden group">
                                <Image src={originalImageSrc!} alt="Original" fill className="object-contain p-4 md:p-6 transition-all group-hover:scale-105" />
                                <div className="absolute top-4 left-4"><Badge variant="outline" className="text-[8px] bg-white/80 border-slate-200 text-slate-800">BEFORE</Badge></div>
                            </div>
                        </div>

                        <div className="space-y-3 flex flex-col h-full justify-center">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5"><Sparkles className="size-3"/> Target Render</span>
                                {resultImageSrc && <span className="text-[9px] font-mono font-black text-primary">{formatBytes(enhancedFileSize)}</span>}
                            </div>
                            <div className="relative aspect-square bg-white rounded-[2rem] border-4 border-primary/20 shadow-2xl flex items-center justify-center overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {isProcessing ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 text-center p-12">
                                            <Loader2 className="size-12 animate-spin text-primary stroke-[3]" />
                                            <Progress value={progress} className="h-1 w-32" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Rendering...</p>
                                        </motion.div>
                                    ) : resultImageSrc ? (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative size-full p-2">
                                            <Image src={resultImageSrc} alt="Result" fill className="object-contain p-4 md:p-6 drop-shadow-2xl" />
                                            <div className="absolute top-4 right-4"><div className="bg-green-500 text-white rounded-full p-1.5 shadow-xl ring-4 ring-white"><CheckCircle2 className="size-5" /></div></div>
                                        </motion.div>
                                    ) : null}
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
                        <div className="flex items-center gap-2"><Sparkles className="size-4" /> HD RE-SAMPLING</div>
                    </div>
                </CardFooter>
            </Card>
        </div>

        {/* Sidebar: Controls */}
        <div className="lg:col-span-4 space-y-4">
            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-2xl">
                <CardHeader className="bg-primary/5 border-b border-white/10 p-4">
                    <CardTitle className="text-sm flex items-center gap-2 font-black uppercase tracking-tighter">
                        <Settings2 className="size-4 text-primary" /> Adjustment Panel
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8 md:space-y-10">
                    <Button className="w-full h-12 md:h-14 font-black bg-primary hover:bg-primary/90 shadow-xl rounded-xl md:rounded-2xl group relative overflow-hidden text-[10px] md:text-xs" onClick={handleAutoEnhance} disabled={isProcessing}>
                        <Zap className="mr-2 h-5 md:h-6 w-5 md:w-6 text-yellow-400 group-hover:scale-125 transition-transform" />
                        SMART AUTO-ENHANCE PRESET
                    </Button>

                    <div className="space-y-6 md:space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-1.5 text-muted-foreground">
                                    <Sun className="size-3 text-yellow-500" /> Exposure
                                </Label>
                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{brightness[0]}%</span>
                            </div>
                            <Slider min={50} max={150} step={1} value={brightness} onValueChange={setBrightness} className="py-2" />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-1.5 text-muted-foreground">
                                    <Contrast className="size-3 text-orange-500" /> Definition
                                </Label>
                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{contrast[0]}%</span>
                            </div>
                            <Slider min={50} max={150} step={1} value={contrast} onValueChange={setContrast} className="py-2" />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-1.5 text-muted-foreground">
                                    <Droplets className="size-3 text-blue-500" /> Vibrance
                                </Label>
                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{saturation[0]}%</span>
                            </div>
                            <Slider min={0} max={200} step={1} value={saturation} onValueChange={setSaturation} className="py-2" />
                        </div>
                        
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-1.5 text-primary">
                                    <Zap className="size-3" /> Sharpness Level
                                </Label>
                                <Badge className="font-mono font-black text-xs px-2 bg-primary">{sharpness[0]}</Badge>
                            </div>
                            <Slider min={0} max={5} step={0.1} value={sharpness} onValueChange={setSharpness} className="py-2" />
                        </div>
                    </div>

                    <div className="p-4 md:p-5 bg-green-500/5 rounded-xl md:rounded-2xl border-2 border-green-500/10 flex gap-3 md:gap-4">
                        <CheckCircle2 className="size-5 md:size-6 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[9px] md:text-[11px] font-black text-green-700 uppercase tracking-tight">Studio Quality</p>
                            <p className="text-[8px] md:text-[10px] text-green-600/80 font-medium leading-tight mt-1 uppercase">
                                Restore blurry or dark photos using local kernel sharpening and exposure balance.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-3 border-t border-white/10 flex justify-center gap-4 opacity-40 text-[7px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1"><ShieldCheck className="size-2.5 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-1"><Zap className="size-2.5 text-yellow-500" /> INSTANT RENDER</div>
                </CardFooter>
            </Card>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
