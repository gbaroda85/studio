
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { 
    UploadCloud, 
    Download, 
    Loader2, 
    FileOutput, 
    ShieldCheck, 
    Zap, 
    Sparkles, 
    RefreshCcw, 
    Eye, 
    CheckCircle2, 
    ImageIcon, 
    Settings2,
    ArrowLeftRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

type OutputFormat = 'jpeg' | 'png' | 'webp';

type ImageConverterProps = {
  targetFormat: OutputFormat;
};

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

export default function ImageConverter({ targetFormat }: ImageConverterProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [convertedSrc, setConvertedSrc] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(targetFormat);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatTitle = outputFormat === 'jpeg' ? 'JPG' : outputFormat.toUpperCase();
  const mimeType = `image/${outputFormat}`;

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setImageSrc(src);
        setConvertedSrc(null);
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

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const handleConvert = () => {
    if (!imageSrc) return;
    setIsConverting(true);
    
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(mimeType, 0.92);
        setConvertedSrc(dataUrl);
      }
      setIsConverting(false);
      toast({ title: "Success!", description: `Image transformed to ${formatTitle} perfectly.` });
    };
    img.onerror = () => {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load image.' });
        setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = convertedSrc;
    const name = imageFile.name.includes('.') ? imageFile.name.split(".").slice(0, -1).join(".") : imageFile.name;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    link.download = `GR7-Tools-${name}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!imageSrc) {
    return (
      <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 mb-4">
            <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
                <FileOutput className="size-8" />
                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <Sparkles className="size-2.5" />
                </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                Image to <span className="text-gradient-hero">{formatTitle}</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                Transform formats with 100% quality preservation. <br/>Private local RAM conversion logic.
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
                        <UploadCloud className="size-14 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="text-center px-4">
                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Image here</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 font-bold opacity-60 uppercase tracking-widest">Instant local conversion.</p>
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
            </CardContent>
            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> NATIVE SPEED</div>
                <div className="flex items-center gap-1.5"><ImageIcon className="size-3 text-primary" /> HD EXPORT</div>
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
             <Button 
                variant="outline" 
                onClick={() => { setImageSrc(null); setConvertedSrc(null); }} 
                className="flex-1 md:flex-none h-11 md:h-12 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl bg-white dark:bg-slate-900 !text-slate-900 dark:!text-white border-slate-300 dark:border-white/20 hover:bg-destructive/5 hover:!text-destructive transition-all duration-300 shadow-sm"
             >
                <RefreshCcw className="mr-1.5 size-3 md:size-4" /> Start Over
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
            <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4 text-primary" />
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            {convertedSrc ? "Before & After Comparison" : "Preview Viewport"}
                        </CardTitle>
                    </div>
                    {convertedSrc && <Badge className="bg-green-600 text-white font-black text-[9px] px-3 py-1 rounded-full border-2 border-white shadow-md animate-in zoom-in-95">CONVERTED</Badge>}
                </CardHeader>
                <CardContent className="p-6 md:p-10 lg:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[450px] flex items-center justify-center relative">
                    <div className="w-full h-full min-h-[350px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {isConverting ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 flex flex-col items-center justify-center gap-4 z-10">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary stroke-[3]" />
                                    <p className="text-xs font-black text-primary uppercase tracking-widest animate-pulse">Transforming Pixels...</p>
                                </motion.div>
                            ) : convertedSrc ? (
                                <motion.div key="comparison" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-8 w-full h-full items-center">
                                    <div className="space-y-3 flex flex-col h-full justify-center">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Original Source</span>
                                            <Badge variant="outline" className="text-[8px] bg-white/80 border-slate-200 text-slate-800">BEFORE</Badge>
                                        </div>
                                        <div className="relative aspect-square bg-white rounded-[2rem] border-2 shadow-inner flex items-center justify-center overflow-hidden group">
                                            <img src={imageSrc!} alt="Original" className="max-w-[90%] max-h-[90%] object-contain transition-all group-hover:scale-105" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex flex-col h-full justify-center">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5"><Sparkles className="size-3"/> Target Render</span>
                                            <Badge className="text-[8px] bg-primary text-primary-foreground uppercase border-none">AFTER</Badge>
                                        </div>
                                        <div className="relative aspect-square bg-white rounded-[2rem] border-4 border-primary/20 shadow-2xl flex items-center justify-center overflow-hidden">
                                            <img src={convertedSrc} alt="Converted" className="max-w-[90%] max-h-[90%] object-contain drop-shadow-2xl animate-in zoom-in-95 duration-500" />
                                            <div className="absolute top-4 right-4"><div className="bg-green-500 text-white rounded-full p-1.5 shadow-xl ring-4 ring-white"><CheckCircle2 className="size-5" /></div></div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full h-full min-h-[350px] flex items-center justify-center">
                                    <img src={imageSrc!} alt="Original" className="max-w-full max-h-full object-contain p-4 md:p-8 rounded-xl shadow-2xl bg-white" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
                <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex justify-center gap-8">
                    <div className="flex items-center justify-center gap-8 w-full text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">
                        <div className="flex items-center gap-2"><ShieldCheck className="size-4" /> SECURE RAM</div>
                        <div className="flex items-center gap-2"><Eye className="size-4" /> INSTANT PREVIEW</div>
                        <div className="flex items-center gap-2"><Sparkles className="size-4" /> HD EXPORT</div>
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
                        <Label htmlFor="format" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Target Format</Label>
                        <Select value={outputFormat} onValueChange={(v) => { setOutputFormat(v as OutputFormat); setConvertedSrc(null); }} disabled={isConverting}>
                            <SelectTrigger id="format" className="h-12 font-black border-2 rounded-xl bg-background/50 shadow-inner"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl border-2 shadow-2xl">
                                <SelectItem value="jpeg" className="font-bold py-2">JPEG (Universal HD)</SelectItem>
                                <SelectItem value="png" className="font-bold py-2">PNG (Lossless Extraction)</SelectItem>
                                <SelectItem value="webp" className="font-bold py-2">WEBP (Modern Optimization)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-4 md:p-5 bg-green-500/5 rounded-xl md:rounded-2xl border-2 border-green-500/10 flex gap-3 md:gap-4 shadow-sm text-left">
                        <CheckCircle2 className="size-5 md:size-6 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[9px] md:text-[11px] font-black text-green-700 uppercase tracking-tight">HD Conversion</p>
                            <p className="text-[8px] md:text-[10px] text-green-600/80 font-medium leading-tight mt-1 uppercase">
                                Your image is rendered using original pixels for zero quality loss during format shift.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-white/10 flex flex-col gap-3">
                    <Button 
                        size="lg" 
                        className="magic-button w-full h-14 md:h-16 bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary font-black rounded-full transition-all active:scale-95 disabled:opacity-50 group flex items-center justify-center gap-3" 
                        onClick={handleConvert} 
                        disabled={isConverting || !!convertedSrc}
                    >
                        <StarIcons />
                        {isConverting ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="size-6 md:size-7 animate-spin" />
                                <span className="uppercase text-sm md:text-base tracking-tighter">TRANSFORMING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 md:gap-3">
                                <Zap className="size-6 md:size-7 text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform" />
                                <span className="uppercase tracking-tighter text-sm md:text-base">{convertedSrc ? "CONVERTED" : "CONVERT NOW"}</span>
                            </div>
                        )}
                    </Button>

                    {convertedSrc && (
                        <Button 
                            size="lg" 
                            className="magic-button magic-button-success w-full h-14 md:h-16 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 font-black rounded-full transition-all active:scale-95 group flex items-center justify-center gap-3 animate-in zoom-in-95" 
                            onClick={handleDownload}
                        >
                            <StarIcons />
                            <Download className="mr-1.5 size-7 md:size-8 group-hover:translate-y-1 transition-transform" /> 
                            <span className="uppercase tracking-tighter text-[10px] md:text-xs">SAVE {formatTitle}</span>
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
