"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Loader2,
  Download,
  X,
  FileImage,
  Maximize,
  Briefcase,
  User,
  PenTool,
  Settings2,
  Scaling,
  ArrowLeftRight,
  Eye,
  RefreshCcw,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Sparkles,
  RotateCw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

type OutputFormat = 'jpeg' | 'png' | 'webp';
type Unit = 'px' | 'cm' | 'mm' | 'inch';

const GOVT_PRESETS = [
  { label: 'Photo (SSC/UPSC)', width: 200, height: 230, format: 'jpeg' as OutputFormat, icon: User, color: 'border-blue-500', bg: 'bg-blue-500/5' },
  { label: 'Signature (SSC)', width: 140, height: 60, format: 'jpeg' as OutputFormat, icon: PenTool, color: 'border-emerald-500', bg: 'bg-emerald-500/5' },
  { label: 'Photo (IBPS)', width: 212, height: 272, format: 'jpeg' as OutputFormat, icon: User, color: 'border-indigo-500', bg: 'bg-indigo-500/5' },
  { label: 'Signature (IBPS)', width: 140, height: 60, format: 'jpeg' as OutputFormat, icon: PenTool, color: 'border-rose-500', bg: 'bg-rose-500/5' },
];

const DPI = 96; 

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

export default function ImageResizer() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resizedImageSrc, setResizedImageSrc] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [enhancedFileSize, setEnhancedFileSize] = useState<number>(0);
  const [newDimensions, setNewDimensions] = useState({ width: '', height: '' });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [unit, setUnit] = useState<Unit>('px');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const convertPxToUnit = (px: number, targetUnit: Unit) => {
    if (targetUnit === 'px') return px;
    if (targetUnit === 'inch') return parseFloat((px / DPI).toFixed(2));
    if (targetUnit === 'mm') return parseFloat((px / (DPI / 25.4)).toFixed(1));
    if (targetUnit === 'cm') return parseFloat((px / (DPI / 2.54)).toFixed(2));
    return px;
  };

  const convertUnitToPx = (val: number, currentUnit: Unit) => {
    if (currentUnit === 'px') return val;
    if (currentUnit === 'inch') return Math.round(val * DPI);
    if (currentUnit === 'mm') return Math.round(val * (DPI / 25.4));
    if (currentUnit === 'cm') return Math.round(val * (DPI / 2.54));
    return val;
  };

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setOriginalFileSize(file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setOriginalImageSrc(src);
        
        const img = new window.Image();
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height });
          setNewDimensions({ 
            width: String(convertPxToUnit(img.width, unit)), 
            height: String(convertPxToUnit(img.height, unit)) 
          });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
      setResizedImageSrc(null);
    } else if (file) {
      toast({ variant: "destructive", title: "Invalid File Type", description: "Please select a valid image file." });
    }
  };
  
  const applyPreset = (preset: typeof GOVT_PRESETS[0]) => {
    setUnit('px'); 
    setNewDimensions({ width: String(preset.width), height: String(preset.height) });
    setOutputFormat(preset.format);
    setMaintainAspectRatio(false);
    toast({ title: "Preset Applied", description: `${preset.label} dimensions set to ${preset.width}x${preset.height} px.` });
  };

  const handleUnitChange = (newUnit: Unit) => {
    if (!originalDimensions) {
        setUnit(newUnit);
        return;
    }
    const currentW_px = convertUnitToPx(parseFloat(newDimensions.width) || 0, unit);
    const currentH_px = convertUnitToPx(parseFloat(newDimensions.height) || 0, unit);
    setUnit(newUnit);
    setNewDimensions({
        width: String(convertPxToUnit(currentW_px, newUnit)),
        height: String(convertPxToUnit(currentH_px, newUnit))
    });
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };
  
  const handleDimensionChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const numValue = parseFloat(value);
      if (!originalDimensions) return;
      setNewDimensions(d => ({ ...d, [name]: value }));
      if (maintainAspectRatio && numValue > 0) {
          const ratio = originalDimensions.height / originalDimensions.width;
          if (name === 'width') {
              const newH = numValue * ratio;
              setNewDimensions({ width: value, height: newH.toFixed(unit === 'px' ? 0 : 2) });
          } else {
              const newW = numValue / ratio;
              setNewDimensions({ width: newW.toFixed(unit === 'px' ? 0 : 2), height: value });
          }
      }
  }

  const handleResize = () => {
    if (!originalImageSrc || !newDimensions.width || !newDimensions.height) return;

    setIsProcessing(true);
    setResizedImageSrc(null);

    const img = new window.Image();
    img.src = originalImageSrc;
    img.onload = async () => {
      const targetWidth = convertUnitToPx(parseFloat(newDimensions.width), unit);
      const targetHeight = convertUnitToPx(parseFloat(newDimensions.height), unit);

      // MULTI-STAGE STEP-DOWN RESAMPLING FOR CRISP TEXT
      // Jumping directly from 4000px to 200px creates blur. We do it in 50% steps.
      let curCanvas: HTMLCanvasElement | HTMLImageElement = img;
      let stepW = img.width;
      let stepH = img.height;
      
      while (stepW > targetWidth * 1.5) {
          const nextW = Math.floor(stepW * 0.7);
          const nextH = Math.floor(stepH * 0.7);
          const stepCanvas = document.createElement('canvas');
          stepCanvas.width = nextW;
          stepCanvas.height = nextH;
          const stepCtx = stepCanvas.getContext('2d');
          if (stepCtx) {
              stepCtx.imageSmoothingEnabled = true;
              stepCtx.imageSmoothingQuality = 'high';
              stepCtx.drawImage(curCanvas, 0, 0, nextW, nextH);
              curCanvas = stepCanvas;
          }
          stepW = nextW;
          stepH = nextH;
      }

      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      const finalCtx = finalCanvas.getContext("2d", { alpha: outputFormat !== 'jpeg', willReadFrequently: true });

      if (finalCtx) {
        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = 'high';
        
        if (outputFormat === 'jpeg') {
          finalCtx.fillStyle = '#FFFFFF';
          finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        }
        
        finalCtx.drawImage(curCanvas, 0, 0, targetWidth, targetHeight);

        // ADVANCED 3X3 SHARPENING KERNEL FOR TEXT FIDELITY
        // Normalizing the kernel to ensure it doesn't shift overall brightness
        const amount = 0.25; 
        const weights = [
            0, -amount, 0,
            -amount, 1 + (4 * amount), -amount,
            0, -amount, 0
        ];
        
        const imageData = finalCtx.getImageData(0, 0, targetWidth, targetHeight);
        const pixels = imageData.data;
        const output = finalCtx.createImageData(targetWidth, targetHeight);
        const dst = output.data;

        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < targetWidth; x++) {
                const dstOff = (y * targetWidth + x) * 4;
                let r = 0, g = 0, b = 0;
                for (let cy = 0; cy < 3; cy++) {
                    for (let cx = 0; cx < 3; cx++) {
                        const scy = Math.min(targetHeight - 1, Math.max(0, y + cy - 1));
                        const scx = Math.min(targetWidth - 1, Math.max(0, x + cx - 1));
                        const srcOff = (scy * targetWidth + scx) * 4;
                        const wt = weights[cy * 3 + cx];
                        r += pixels[srcOff] * wt;
                        g += pixels[srcOff + 1] * wt;
                        b += pixels[srcOff + 2] * wt;
                    }
                }
                dst[dstOff] = Math.max(0, Math.min(255, r));
                dst[dstOff + 1] = Math.max(0, Math.min(255, g));
                dst[dstOff + 2] = Math.max(0, Math.min(255, b));
                dst[dstOff + 3] = pixels[dstOff + 3]; 
            }
        }
        finalCtx.putImageData(output, 0, 0);

        const mimeType = `image/${outputFormat}`;
        // Maximum quality for professional document results
        const resizedDataUrl = finalCanvas.toDataURL(mimeType, 0.98); 
        
        const blob = await (await fetch(resizedDataUrl)).blob();
        setEnhancedFileSize(blob.size);
        setResizedImageSrc(resizedDataUrl);
      }
      
      setIsProcessing(false);
      toast({ title: "Resized!", description: "High-fidelity text preserving render complete." });
    };
    img.onerror = () => {
      toast({ variant: "destructive", title: "Error", description: "Could not load image." });
      setIsProcessing(false);
    };
  };

  const handleDownload = () => {
    if (!resizedImageSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = resizedImageSrc;
    const name = imageFile.name.includes('.') ? imageFile.name.split(".").slice(0, -1).join(".") : imageFile.name;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    link.download = `GR7-Tools-${name}-resized.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setResizedImageSrc(null);
    setOriginalDimensions(null);
    setOriginalFileSize(0);
    setEnhancedFileSize(0);
    setNewDimensions({ width: '', height: '' });
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!originalImageSrc) {
    return (
      <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4 mx-auto">
        <Card className={cn(
            "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 dark:hover:shadow-primary/20 cursor-pointer select-none",
            isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
        )}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <CardHeader className="bg-muted/30 border-b p-6 text-center">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
                <div 
                    className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center space-y-4 bg-muted/30 group"
                >
                    <div className="relative">
                        <UploadCloud className="size-14 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="text-center px-4">
                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Photo here</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 font-bold opacity-60 uppercase tracking-widest">Instant local processing.</p>
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
            </CardContent>
            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> SHARP HD</div>
                <div className="flex items-center gap-1.5"><Scaling className="size-3 text-primary" /> PRIVATE</div>
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
             <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-10 border-2 font-black text-[9px] uppercase px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive">
                <RefreshCcw className="mr-1.5 size-3" /> Change Image
            </Button>
            {resizedImageSrc && (
                <Button 
                    size="lg" 
                    className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-12 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none" 
                    onClick={handleDownload}
                >
                    <div className="absolute left-4 w-0.5 h-6 md:h-8 bg-white/40 rounded-full" />
                    <span className="flex-1 px-10 text-center tracking-widest text-[10px] md:text-xs uppercase">DOWNLOAD HD</span>
                    <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                        <Download className="size-6 group-hover:scale-110 transition-transform" />
                        <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                    </div>
                </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
            <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4 text-primary" />
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">HD Analysis & Comparison</CardTitle>
                    </div>
                    {resizedImageSrc && (
                        <div className="flex items-center gap-2">
                            <Badge className="bg-green-600 text-white font-black text-[9px] px-3 py-1 rounded-full border-2 border-white shadow-md animate-in zoom-in-95">READY</Badge>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-8 font-black text-[9px] border-2 uppercase rounded-lg hover:bg-primary/5">
                                        <Eye className="size-3.5 mr-1.5 text-primary" /> Zoom Check
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl max-h-[85vh] top-[55%] overflow-hidden p-0 rounded-[2.5rem] border-none shadow-3xl bg-white dark:bg-slate-950 flex flex-col">
                                    <DialogHeader className="p-6 md:p-8 border-b bg-muted/30">
                                        <DialogTitle className="uppercase font-black tracking-tighter text-lg md:text-2xl flex items-center gap-3 text-left">
                                             <Eye className="text-primary size-6" /> HD Pixel Proof Analysis
                                        </DialogTitle>
                                    </DialogHeader>
                                    <ScrollArea className="flex-1 w-full">
                                        <div className="p-6 md:p-10 space-y-8">
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <Badge variant="outline" className="w-full justify-center py-2 font-black uppercase text-[11px] border-2">ORIGINAL CANVAS</Badge>
                                                    <div className="aspect-square relative rounded-2xl overflow-hidden border-2 bg-white flex items-center justify-center shadow-inner">
                                                        {originalImageSrc && <img src={originalImageSrc} alt="original" className="w-full h-full object-contain p-4" />}
                                                    </div>
                                                </div>
                                                <div className="space-y-4 text-right">
                                                    <Badge className="w-full justify-center bg-primary py-2 font-black uppercase text-[11px] border-2 border-white shadow-lg">RESIZED HD RENDER</Badge>
                                                    <div className="aspect-square relative rounded-2xl overflow-hidden border-2 border-primary/20 bg-white flex items-center justify-center shadow-2xl">
                                                        {resizedImageSrc && <img src={resizedImageSrc} alt="resized" className="w-full h-full object-contain p-4" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <ScrollBar />
                                    </ScrollArea>
                                    <div className="p-6 md:p-8 border-t bg-muted/10 mt-auto flex justify-center">
                                        <Button 
                                            className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-18 w-full max-w-xl shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none" 
                                            onClick={handleDownload}
                                        >
                                            <div className="absolute left-6 w-0.5 h-10 bg-white/40 rounded-full" />
                                            <span className="flex-1 px-12 text-center tracking-widest text-lg md:text-xl uppercase">SAVE SHARP IMAGE</span>
                                            <div className="bg-white h-full pl-10 pr-12 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-11 group-hover:pr-13 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                                <Download className="size-8 group-hover:scale-110 transition-transform" />
                                                <div className="absolute right-3 w-0.5 h-10 bg-[#00aeef]/20 rounded-full" />
                                            </div>
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-6 md:p-10 lg:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[450px]">
                    {isProcessing ? (
                        <div className="h-full flex flex-col items-center justify-center gap-8 py-20">
                            <div className="relative">
                                <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20 stroke-[3]" />
                                <Zap className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
                            </div>
                            <p className="text-sm font-black text-primary uppercase tracking-[0.3em] animate-pulse">Rendering HD Pixels...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-8 h-full items-center">
                            <div className="space-y-4 flex flex-col h-full justify-center">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original Source</span>
                                    <span className="text-[10px] font-mono font-bold opacity-40">{formatBytes(originalFileSize)}</span>
                                </div>
                                <div className="relative w-full aspect-square bg-white rounded-[2rem] border-2 shadow-inner flex items-center justify-center overflow-hidden group">
                                    {originalImageSrc && <img src={originalImageSrc} alt="Before" className="w-full h-full object-contain p-4 md:p-6 opacity-100" />}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-4 py-1 rounded-full font-mono text-[10px]">{originalDimensions?.width}x{originalDimensions?.height}</div>
                                </div>
                            </div>
                            <div className="space-y-4 flex flex-col h-full justify-center">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5"><Sparkles className="size-3"/> Target Render</span>
                                    {enhancedFileSize > 0 && <span className="text-[10px] font-mono font-black text-primary">{formatBytes(enhancedFileSize)}</span>}
                                </div>
                                <div className="relative w-full aspect-square bg-white rounded-[2rem] border-4 border-primary/20 shadow-2xl flex items-center justify-center overflow-hidden">
                                    {resizedImageSrc ? (
                                        <div className="relative size-full animate-in zoom-in-95 duration-500 p-2">
                                            <img src={resizedImageSrc} alt="After" className="w-full h-full object-contain p-4 md:p-6 drop-shadow-xl" />
                                            <div className="absolute top-4 right-4"><div className="bg-green-500 text-white rounded-full p-1.5 shadow-xl ring-4 ring-white"><CheckCircle2 className="size-5" /></div></div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-4 opacity-10 p-12 text-center">
                                            <FileImage className="size-20" />
                                            <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">Adjust settings<br/>and click resize</p>
                                        </div>
                                    )}
                                    {resizedImageSrc && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full font-black text-[10px] shadow-lg">
                                            {convertUnitToPx(parseFloat(newDimensions.width), unit)}x{convertUnitToPx(parseFloat(newDimensions.height), unit)} PX
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex justify-center gap-8 text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT RENDER</div>
                </CardFooter>
            </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
            {/* Dimension Settings Card */}
            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-2xl">
                <CardHeader className="bg-primary/5 border-b border-white/10 p-4 md:p-6">
                    <CardTitle className="text-sm md:text-base flex items-center gap-2 font-black uppercase tracking-tighter text-primary text-left">
                        <Settings2 className="size-4 md:size-5 text-primary" /> Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4 md:space-y-5">
                    {/* QUICK PRESETS */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-2 text-left">
                            <Briefcase className="size-3" /> Quick Presets
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            {GOVT_PRESETS.map((p) => (
                                <button key={p.label} onClick={() => applyPreset(p)} className="flex items-center gap-2 p-2 rounded-xl border-2 border-transparent bg-white/5 hover:bg-primary/5 hover:border-primary/20 transition-all text-left group">
                                    <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0"><p.icon className="size-3.5" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black uppercase truncate leading-none mb-0.5">{p.label}</p>
                                        <p className="text-[7px] font-bold opacity-50 uppercase">{p.width}x{p.height} PX</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator className="opacity-10" />

                    {/* SELECT UNIT SECTION */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60 text-left block">Select Unit</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {(['px', 'cm', 'mm', 'inch'] as Unit[]).map((u) => (
                                <button
                                    key={u}
                                    onClick={() => handleUnitChange(u)}
                                    className={cn(
                                        "btn-pos-uiverse h-9 !ring-[3px] !ring-slate-950 dark:!ring-white",
                                        unit === u && "active-uiverse"
                                    )}
                                    data-label={u.toUpperCase()}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="space-y-1.5 text-left">
                            <Label htmlFor="width" className="text-[9px] font-black uppercase opacity-60">Width ({unit})</Label>
                            <Input id="width" name="width" type="number" step={unit === 'px' ? '1' : '0.1'} value={newDimensions.width} onChange={handleDimensionChange} disabled={isProcessing} className="h-10 text-base font-black border-2 rounded-xl bg-muted/20" />
                        </div>
                        <div className="space-y-1.5 text-left">
                            <Label htmlFor="height" className="text-[9px] font-black uppercase opacity-60">Height ({unit})</Label>
                            <Input id="height" name="height" type="number" step={unit === 'px' ? '1' : '0.1'} value={newDimensions.height} onChange={handleDimensionChange} disabled={isProcessing} className="h-10 text-base font-black border-2 rounded-xl bg-muted/20" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-muted/30 p-2.5 rounded-xl border border-dashed text-left">
                        <Checkbox id="aspect-ratio" checked={maintainAspectRatio} onCheckedChange={(checked) => setMaintainAspectRatio(Boolean(checked))} className="size-3.5" />
                        <Label htmlFor="aspect-ratio" className="text-[9px] font-black cursor-pointer uppercase opacity-60 tracking-widest">Lock Aspect Ratio</Label>
                    </div>

                    <div className="p-3 md:p-4 bg-green-500/5 rounded-xl md:rounded-2xl border-2 border-green-500/10 flex gap-3 shadow-sm text-left">
                        <ShieldCheck className="size-5 md:size-6 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black text-green-700 uppercase tracking-tight">Step-Down Filter</p>
                            <p className="text-[7px] md:text-[8px] text-green-600/80 font-medium leading-tight mt-0.5 uppercase">
                                Multi-stage resampling enabled for 100% crisp text results.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-5 md:p-6 border-t border-white/10">
                    <Button 
                        className="magic-button w-full h-14 md:h-16 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-3 shadow-xl" 
                        onClick={handleResize}
                        disabled={isProcessing}
                    >
                        <StarIcons />
                        {isProcessing ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="size-5 md:size-6 animate-spin" />
                                <span className="uppercase text-xs md:text-sm font-black tracking-tighter">RESIZING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 md:gap-3">
                                <Maximize className="size-5 md:size-6 text-white group-hover:scale-125 transition-transform" />
                                <span className="uppercase tracking-tighter text-sm md:text-lg font-black">RESIZE NOW</span>
                            </div>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
