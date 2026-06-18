"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    X, 
    Eraser, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    Image as ImageIcon,
    Palette,
    Layers,
    RotateCcw,
    ChevronRight,
    Settings2,
    Crop as CropIcon,
    Maximize,
    Scaling,
    RotateCw,
    CheckCircle2,
    Eye,
    ArrowLeftRight,
    Cpu,
    MousePointer2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AI MODEL CONFIGURATION
 */
const MODEL_ID = 'Xenova/modnet'; 

type Stage = 'upload' | 'preview' | 'crop' | 'process' | 'studio';

const COLOR_PRESETS = [
    { name: 'Transparent', value: 'transparent', icon: X },
    { name: 'Pure White', value: '#FFFFFF' },
    { name: 'Off White', value: '#F5F5F5' },
    { name: 'Royal Blue', value: '#003399' },
    { name: 'Navy Blue', value: '#000080' },
    { name: 'Sky Blue', value: '#ADD8E6' },
    { name: 'Light Grey', value: '#D3D3D3' },
    { name: 'Red', value: '#FF0000' },
];

const SIZE_PRESETS = [
    { name: 'Original Ratio', width: 0, height: 0, unit: 'px' },
    { name: 'India Passport (35x45mm)', width: 35, height: 45, unit: 'mm' },
    { name: 'USA Passport (2x2in)', width: 2, height: 2, unit: 'inch' },
    { name: 'PAN Card (25x35mm)', width: 25, height: 35, unit: 'mm' },
    { name: 'SSC Photo (200x230px)', width: 200, height: 230, unit: 'px' },
];

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i}`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

export default function BackgroundRemover() {
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [croppedImageSrc, setCroppedImageSrc] = useState<string | null>(null);
  const [subjectImageSrc, setSubjectImageSrc] = useState<string | null>(null); 
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null); 
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  
  // Studio Adjustments
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [borderWidth, setBorderWidth] = useState([0]);
  const [borderColor, setBorderColor] = useState("#000000");

  // Slider State
  const [sliderPosition, setSliderPosition] = useState(50);

  // Crop States
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<string>("0");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  const checkerboardStyle: React.CSSProperties = {
    backgroundImage:
      "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
  };

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setOriginalImageSrc(src);
        setStage('preview');
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please select an image file." });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const handleRemoveBackgroundAI = async (source: string) => {
    setIsProcessing(true);
    setProgress(5);
    setStatusText("Initializing AI Engine...");

    try {
      const { pipeline, env } = await import("@huggingface/transformers");
      
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      setStatusText("Downloading Neural Model (Cached)...");
      const segmenter = await pipeline('image-segmentation', 'Xenova/modnet', {
          progress_callback: (p: any) => {
              if (p.status === 'progress') {
                setProgress(Math.round(p.progress));
              }
          }
      });

      setStatusText("Isolating Subject...");
      const output = await segmenter(source);
      
      const mask = output[0].mask;
      const rgbaData = new Uint8ClampedArray(mask.width * mask.height * 4);
      const maskData = mask.data; 
      
      for (let i = 0; i < maskData.length; ++i) {
          const alpha = maskData[i];
          const j = i * 4;
          rgbaData[j] = 0;       // R
          rgbaData[j + 1] = 0;   // G
          rgbaData[j + 2] = 0;   // B
          rgbaData[j + 3] = alpha; // A 
      }

      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = mask.width;
      maskCanvas.height = mask.height;
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) throw new Error("Canvas mask failed");
      
      const maskImageData = new ImageData(rgbaData, mask.width, mask.height);
      maskCtx.putImageData(maskImageData, 0, 0);

      const sourceImg = new window.Image();
      sourceImg.src = source;
      await new Promise(r => sourceImg.onload = r);

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = sourceImg.width;
      finalCanvas.height = sourceImg.height;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) throw new Error("Final canvas failed");

      finalCtx.drawImage(sourceImg, 0, 0);
      finalCtx.globalCompositeOperation = 'destination-in';
      finalCtx.drawImage(maskCanvas, 0, 0, sourceImg.width, sourceImg.height);
      
      const resultUrl = finalCanvas.toDataURL('image/png');
      setSubjectImageSrc(resultUrl);
      setStage('studio');
      toast({ title: "Precision Success", description: "Background isolated with Neural precision." });
    } catch (error: any) {
        console.error(error);
        toast({ variant: "destructive", title: "Offline Limit", description: "AI failed to process. Document might be too large." });
        setStage('preview');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleApplyCrop = () => {
    if (!imgRef.current || !completedCrop) return;
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imgRef.current, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
    const croppedData = canvas.toDataURL('image/png');
    setCroppedImageSrc(croppedData);
    setStage('process');
    setTimeout(() => handleRemoveBackgroundAI(croppedData), 500);
  };

  const updateComposite = useCallback(async () => {
    if (!subjectImageSrc) return;
    const canvas = compositeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const img = new window.Image();
    img.src = subjectImageSrc;
    await new Promise(r => img.onload = r);
    canvas.width = img.width; canvas.height = img.height;
    if (bgColor !== 'transparent') { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height); } 
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(img, 0, 0);
    if (borderWidth[0] > 0) {
        ctx.strokeStyle = borderColor;
        const strokePx = (borderWidth[0] / 100) * canvas.width;
        ctx.lineWidth = strokePx; ctx.strokeRect(strokePx/2, strokePx/2, canvas.width - strokePx, canvas.height - strokePx);
    }
    setPreviewImageSrc(canvas.toDataURL("image/png", 1.0));
  }, [subjectImageSrc, bgColor, borderWidth, borderColor]);

  useEffect(() => { updateComposite(); }, [updateComposite]);

  const handleDownload = () => {
    if (!previewImageSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = previewImageSrc;
    link.download = `GR7-Tools-BG-Cleaned-${Date.now()}.png`;
    link.click();
  };

  const handleReset = () => {
    setStage('upload'); setImageFile(null); setOriginalImageSrc(null); setCroppedImageSrc(null); setSubjectImageSrc(null); setPreviewImageSrc(null); setBgColor("transparent"); setBorderWidth([0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (stage === 'upload') {
    return (
      <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
        <Card className={cn("w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[3rem] hover:-translate-y-1 hover:border-primary/50", isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]")} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}>
            <CardHeader className="bg-muted/30 border-b p-6 text-center"><CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">AI WORKSPACE</CardTitle></CardHeader>
            <CardContent className="p-8 md:p-12">
                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center space-y-4 bg-muted/30 group relative">
                    <div className="relative"><UploadCloud className="size-12 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" /><Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" /></div>
                    <div className="text-center px-4"><p className="text-lg md:text-xl font-black uppercase tracking-tighter">Drop High-Res Photo</p><p className="text-[10px] md:text-xs text-muted-foreground mt-1 font-bold opacity-60 uppercase tracking-widest">Unlimited local extractions.</p></div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
            </CardContent>
            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                <div className="flex items-center gap-1.5"><Cpu className="size-3 text-blue-500" /> WEBGPU BOOST</div>
                <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-primary" /> HD PRECISION</div>
            </CardFooter>
        </Card>
      </div>
    );
  }

  if (stage === 'preview') {
      return (
          <Card className="w-full max-w-3xl glass-card overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
              <CardHeader className="glass-panel border-b p-4 flex flex-row items-center justify-between"><CardTitle className="text-sm md:base font-black uppercase tracking-tighter">Original Scan</CardTitle></CardHeader>
              <CardContent className="p-4 md:p-8 flex justify-center bg-black/5 min-h-[350px]"><img src={originalImageSrc!} alt="Preview" className="max-h-[50vh] object-contain rounded-xl shadow-2xl border-2 border-white" /></CardContent>
              <CardFooter className="glass-panel border-t p-4 flex justify-between gap-4">
                    <Button variant="ghost" onClick={handleReset} className="font-black text-[9px] uppercase h-11 px-4 rounded-xl border-2 border-transparent hover:border-muted"><RotateCcw className="mr-1.5 size-4" /> Change</Button>
                    <div className="flex gap-3 flex-1 justify-end">
                        <Button variant="outline" className="font-black border-2 border-primary/20 text-primary h-11 rounded-xl text-[10px] uppercase px-4 hover:bg-primary/5" onClick={() => setStage('crop')}><CropIcon className="mr-1.5 size-4" /> Area</Button>
                        <Button 
                            className="magic-button h-11 px-8 rounded-full bg-primary hover:bg-primary/90 border-4 border-primary text-white hover:text-primary font-black transition-all active:scale-95 group flex items-center gap-2" 
                            onClick={() => { setCroppedImageSrc(originalImageSrc); setStage('process'); setTimeout(() => handleRemoveBackgroundAI(originalImageSrc!), 300); }}
                        >
                            <StarIcons />
                            <Eraser className="size-5 group-hover:rotate-12 transition-transform" />
                            <span className="text-[11px] uppercase tracking-widest">REMOVE BACKGROUND</span>
                        </Button>
                    </div>
              </CardFooter>
          </Card>
      );
  }

  if (stage === 'crop') {
    return (
        <Card className="w-full max-w-4xl glass-card shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
            <CardHeader className="glass-panel border-b p-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm md:base font-black uppercase tracking-tighter">Define Subject Area</CardTitle>
                    <Select value={selectedSizeIndex} onValueChange={setSelectedSizeIndex}>
                        <SelectTrigger className="h-9 w-40 font-black border-2 rounded-lg text-[10px] uppercase"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-lg border-2">{SIZE_PRESETS.map((p, i) => (<SelectItem key={i} value={String(i)} className="font-bold text-[10px] uppercase">{p.name}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="p-4 md:p-8 flex justify-center bg-black/5 min-h-[450px]">
                <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={selectedSizeIndex === '0' ? undefined : (SIZE_PRESETS[parseInt(selectedSizeIndex)].width / SIZE_PRESETS[parseInt(selectedSizeIndex)].height)}>
                    <img ref={imgRef} src={originalImageSrc!} alt="Crop source" className="max-h-[55vh] object-contain block" />
                </ReactCrop>
            </CardContent>
            <CardFooter className="glass-panel border-t p-4 flex justify-between gap-4">
                <Button variant="ghost" onClick={() => setStage('preview')} className="font-black text-[9px] uppercase h-11 px-4 rounded-xl border-2 border-transparent hover:border-muted"><RotateCcw className="mr-1.5 size-4" /> Back</Button>
                <Button 
                    className="magic-button h-11 px-10 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary font-black transition-all active:scale-95 group flex items-center gap-2" 
                    onClick={handleApplyCrop}
                >
                    <StarIcons />
                    <Cpu className="size-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] uppercase tracking-widest">PROCESS SUBJECT</span>
                </Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-3">
            <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0"><Settings2 className="size-5 md:size-6" /></div>
            <div><h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter">Studio <span className="text-primary">Panel</span></h2></div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
             <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-12 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive"><RotateCcw className="mr-1.5 size-4" /> Change Image</Button>
            <Button 
                size="lg" 
                className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-12 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 border-none" 
                onClick={handleDownload} 
                disabled={isProcessing || !previewImageSrc}
            >
                <div className="absolute left-4 w-0.5 h-6 bg-white/40 rounded-full" />
                <span className="flex-1 px-10 text-center tracking-widest text-[11px] uppercase">DOWNLOAD PNG</span>
                <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                    <Download className="size-6 group-hover:scale-110 transition-transform" />
                    <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                </div>
            </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
            <Card className="overflow-hidden glass-card border-none shadow-2xl relative rounded-2xl md:rounded-[3rem]">
                <CardContent className="p-0 aspect-video relative bg-white flex items-center justify-center min-h-[450px]" style={bgColor === 'transparent' ? checkerboardStyle : { backgroundColor: bgColor }}>
                    <AnimatePresence mode="wait">
                        {isProcessing ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 backdrop-blur-xl p-8 text-center gap-6">
                                <div className="relative"><Loader2 className="h-16 w-16 md:h-24 md:w-24 animate-spin text-primary stroke-[3]" /><Zap className="absolute inset-0 m-auto h-8 w-8 md:h-10 md:w-10 text-primary animate-pulse" /></div>
                                <div className="space-y-3 w-full max-w-[280px] md:max-w-sm"><p className="font-black text-xl md:text-2xl text-primary animate-pulse uppercase tracking-tighter">{statusText}</p><Progress value={progress} className="h-2 shadow-inner" /><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Optimizing Neural Mask...</p></div>
                            </motion.div>
                        ) : previewImageSrc ? (
                            <div className="relative w-full h-full flex items-center justify-center overflow-hidden" ref={sliderContainerRef}>
                                <div className="absolute inset-0 flex items-center justify-center p-8"><div className="relative w-full h-full"><Image src={previewImageSrc} alt="Result" fill className="object-contain drop-shadow-2xl" /></div></div>
                                <div className="absolute inset-0 flex items-center justify-center p-8 select-none pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}><div className="relative w-full h-full"><Image src={croppedImageSrc || originalImageSrc!} alt="Original" fill className="object-contain" /></div></div>
                                <div className="absolute inset-y-0 z-10 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center" style={{ left: `${sliderPosition}%` }}><div className="size-10 rounded-full bg-white shadow-xl border-2 border-primary flex items-center justify-center -translate-x-1/2"><ArrowLeftRight className="size-5 text-primary" /></div></div>
                                <input type="range" min="0" max="100" value={sliderPosition} onChange={(e) => setSliderPosition(Number(e.target.value))} className="absolute inset-0 z-20 w-full h-full opacity-0 cursor-ew-resize" />
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl z-30 pointer-events-none"><MousePointer2 className="size-3.5 text-primary animate-pulse" /> Slide to compare edges</div>
                            </div>
                        ) : null}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-4 space-y-4">
            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-2xl">
                <CardHeader className="bg-primary/5 border-b border-white/10 p-4"><CardTitle className="text-sm flex items-center gap-2 font-black uppercase tracking-tighter"><Palette className="size-4 text-primary" /> Finish Stage</CardTitle></CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Background Presets</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {COLOR_PRESETS.map((p) => (<button key={p.value} onClick={() => setBgColor(p.value)} className={cn("h-9 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm", bgColor === p.value ? "border-primary ring-2 ring-primary/10 scale-105" : "border-white/10 bg-white/5")} title={p.name}>{p.icon ? <p.icon className="size-3 text-muted-foreground" /> : <div className="size-4 rounded-full border border-black/10" style={{ backgroundColor: p.value }} />}</button>))}
                            </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-white/5"><div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Border Width</Label><Badge variant="secondary" className="font-black text-[8px]">{borderWidth[0]}%</Badge></div><Slider min={0} max={10} step={0.5} value={borderWidth} onValueChange={setBorderWidth} className="py-2" /></div>
                    </div>
                    <div className="p-5 bg-green-500/5 rounded-[1.5rem] border-2 border-green-500/10 flex gap-4">
                        <CheckCircle2 className="size-6 text-green-600 shrink-0 mt-0.5" />
                        <div><p className="text-[10px] font-black text-green-700 uppercase tracking-tight">Pro Result Ready</p><p className="text-[8px] text-green-600/80 font-medium leading-tight mt-1 uppercase">Neural mask has optimized hair details. <br/>Resolution: <strong>HD Original</strong></p></div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-3 border-t border-white/10 flex justify-center gap-4 opacity-40 text-[7px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1"><ShieldCheck className="size-2.5 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-1"><Zap className="size-2.5 text-yellow-500" /> WEBGPU BOOST</div>
                    <div className="flex items-center gap-1"><Sparkles className="size-2.5 text-primary" /> HD PRECISION</div>
                </CardFooter>
            </Card>
        </div>
      </div>
      <canvas ref={compositeCanvasRef} className="hidden" />
    </div>
  );
}
