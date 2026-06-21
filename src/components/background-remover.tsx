
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
    ImageIcon,
    Settings2,
    RefreshCcw, 
    RotateCcw,
    CheckCircle2, 
    ArrowLeftRight,
    Cpu,
    MousePointer2,
    Palette,
    Layers,
    Crop as CropIcon,
    ChevronRight,
    ArrowLeft
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
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
    { name: 'Free Hand (Manual)', width: 0, height: 0, unit: 'px' },
    { name: 'Aadhaar Card (Landscape)', width: 85.6, height: 54, unit: 'mm' },
    { name: 'Driving Licence (Landscape)', width: 85.6, height: 54, unit: 'mm' },
    { name: 'PAN Card (Landscape)', width: 85.6, height: 35, unit: 'mm' }, 
    { name: 'Passport Size (Portrait)', width: 35, height: 45, unit: 'mm' },
    { name: 'US Visa (Square)', width: 2, height: 2, unit: 'inch' },
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

  const checkerboardStyle: React.CSSProperties = {
    backgroundImage:
      "linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.05) 75%)",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
    backgroundColor: "#ffffff"
  };

  const getAspectRatio = useCallback(() => {
    const p = SIZE_PRESETS[parseInt(selectedSizeIndex)];
    return p.width > 0 ? p.width / p.height : undefined;
  }, [selectedSizeIndex]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const aspect = getAspectRatio();
    
    const initialCrop = aspect 
        ? centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height)
        : centerCrop({ unit: '%', width: 90, height: 90 }, width, height);
        
    setCrop(initialCrop);
    
    setCompletedCrop({
        unit: 'px',
        x: (initialCrop.x / 100) * width,
        y: (initialCrop.y / 100) * height,
        width: (initialCrop.width / 100) * width,
        height: (initialCrop.height / 100) * height
    });
  };

  useEffect(() => {
    if (stage === 'crop' && imgRef.current) {
        const { width, height } = imgRef.current;
        const aspect = getAspectRatio();
        
        const newCrop = aspect 
            ? centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height)
            : centerCrop({ unit: '%', width: 90, height: 90 }, width, height);
            
        setCrop(newCrop);
        setCompletedCrop({
            unit: 'px',
            x: (newCrop.x / 100) * width,
            y: (newCrop.y / 100) * height,
            width: (newCrop.width / 100) * width,
            height: (newCrop.height / 100) * height
        });
    }
  }, [selectedSizeIndex, stage, getAspectRatio]);

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
          rgbaData[j] = 0;       
          rgbaData[j + 1] = 0;   
          rgbaData[j + 2] = 0;   
          rgbaData[j + 3] = alpha; 
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
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#22c55e', '#ffffff'] });
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
    link.download = `GR7-BG-Cleaned-${Date.now()}.png`;
    link.click();
  };

  const handleReset = () => {
    setStage('upload'); setImageFile(null); setOriginalImageSrc(null); setCroppedImageSrc(null); setSubjectImageSrc(null); setPreviewImageSrc(null); setBgColor("transparent"); setBorderWidth([0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 px-4 pb-20 mx-auto">
      
      {/* 1. UPLOAD STAGE */}
      {stage === 'upload' && (
        <div className="w-full max-w-4xl py-10 flex flex-col items-center justify-center gap-6 text-center">
          <Card className={cn(
            "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[3rem] hover:border-primary/50 cursor-pointer",
            isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
          )} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}>
              <CardHeader className="bg-muted/30 border-b p-8 text-center"><CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">AI WORKSPACE</CardTitle></CardHeader>
              <CardContent className="p-12 md:p-20">
                  <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center space-y-6 bg-muted/30 group relative">
                      <div className="relative"><UploadCloud className="size-20 text-muted-foreground group-hover:text-primary transition-colors" /><Zap className="absolute -top-1 -right-1 size-8 text-yellow-500 animate-pulse" /></div>
                      <div className="text-center">
                          <p className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Photo here</p>
                          <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">100% Private local RAM processing.</p>
                      </div>
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
              </CardContent>
          </Card>
        </div>
      )}

      {/* 2. PREVIEW STAGE */}
      {stage === 'preview' && originalImageSrc && (
          <Card className="w-full max-w-3xl glass-card overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 rounded-[2.5rem] mx-auto">
              <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-black uppercase tracking-tighter">Confirm Selection</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleReset} className="text-destructive h-8 w-8"><X /></Button>
              </CardHeader>
              <CardContent className="p-6 md:p-10 flex flex-col items-center justify-center bg-black/5 min-h-[300px]">
                <div className="max-w-full max-h-[50vh] overflow-hidden rounded-xl shadow-2xl border-4 border-white bg-white mx-auto flex items-center justify-center">
                  <img src={originalImageSrc} alt="Preview" className="max-w-full max-h-full object-contain block" />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t p-6 flex flex-col sm:flex-row justify-between gap-4">
                    <Button variant="outline" className="font-black border-2 border-primary/20 text-primary h-12 rounded-xl text-[10px] uppercase px-6 w-full sm:w-auto" onClick={() => setStage('crop')}><CropIcon className="mr-2 size-4" /> Define Area</Button>
                    <Button 
                        className="magic-button h-12 px-10 rounded-full bg-primary hover:bg-primary/90 text-white font-black transition-all active:scale-95 group flex items-center gap-3 border-none w-full sm:w-auto" 
                        onClick={() => { setCroppedImageSrc(originalImageSrc); setStage('process'); setTimeout(() => handleRemoveBackgroundAI(originalImageSrc), 300); }}
                    >
                        <StarIcons />
                        <Eraser className="size-5" />
                        <span className="text-xs uppercase tracking-widest">REMOVE BACKGROUND</span>
                    </Button>
              </CardFooter>
          </Card>
      )}

      {/* 3. CROP STAGE */}
      {stage === 'crop' && originalImageSrc && (
        <Card className="w-full max-w-5xl glass-card shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden rounded-[2.5rem] mx-auto">
            <CardHeader className="bg-muted/30 border-b p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-left w-full md:w-auto">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter">Define Subject Area</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase opacity-50">Select preset or adjust manually.</CardDescription>
                </div>
                <Select value={selectedSizeIndex} onValueChange={(v) => setSelectedSizeIndex(v)}>
                    <SelectTrigger className="h-10 w-full md:w-64 font-black border-2 rounded-xl text-[10px] uppercase bg-background shadow-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-2 shadow-2xl z-[1000]">
                        {SIZE_PRESETS.map((p, i) => (
                            <SelectItem key={i} value={String(i)} className="font-bold text-[10px] uppercase py-3 cursor-pointer">
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="p-0 flex flex-col bg-slate-200/50 h-[60vh] md:h-[70vh] relative overflow-hidden items-center justify-center">
                <ScrollArea className="w-full h-full p-4 md:p-12">
                    <div className="flex justify-center min-h-full items-center p-4 w-full">
                        <div className="max-w-full w-fit mx-auto rounded-xl border-4 border-white shadow-2xl bg-white overflow-hidden transform-gpu">
                            <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={getAspectRatio()}>
                                <img 
                                  ref={imgRef} 
                                  src={originalImageSrc} 
                                  alt="Crop source" 
                                  className="max-w-full h-auto block object-contain mx-auto" 
                                  onLoad={onImageLoad} 
                                />
                            </ReactCrop>
                        </div>
                    </div>
                    <ScrollBar orientation="vertical" />
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/10 shadow-2xl pointer-events-none z-20">
                     <MousePointer2 className="size-3 text-primary animate-pulse" /> Drag handles or scroll to see more
                </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t p-6 flex flex-col sm:flex-row justify-between gap-4">
                <Button variant="ghost" onClick={() => setStage('preview')} className="font-black text-[10px] uppercase h-12 px-6 rounded-xl transition-colors hover:bg-destructive/5 w-full sm:w-auto"><ArrowLeft className="mr-2 size-4" /> Back</Button>
                <Button className="h-14 px-12 rounded-xl bg-primary text-white font-black transition-all active:scale-95 text-lg shadow-xl w-full sm:w-auto" onClick={handleApplyCrop}>
                    CONFIRM & PROCESS <ChevronRight className="ml-2 size-6" />
                </Button>
            </CardFooter>
        </Card>
      )}

      {/* 4. PROCESSING STAGE */}
      {stage === 'process' && (
          <div className="w-full max-w-2xl py-20 flex flex-col items-center justify-center gap-10 animate-in zoom-in-95 duration-500 text-center mx-auto">
              <div className="relative">
                  <div className="size-32 md:size-48 rounded-full border-[8px] border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                       <Cpu className="size-12 md:size-20 text-primary animate-pulse" />
                  </div>
              </div>
              <div className="text-center space-y-4 w-full px-10">
                  <p className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tighter animate-pulse">{statusText}</p>
                  <Progress value={progress} className="h-2 shadow-inner" />
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] opacity-40">Local GPU Engine • No Cloud Upload</p>
              </div>
          </div>
      )}

      {/* 5. STUDIO STAGE */}
      {stage === 'studio' && previewImageSrc && (
        <div className="w-full flex flex-col gap-6 animate-in slide-in-from-bottom-6 duration-500 text-left mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20"><Settings2 className="size-6" /></div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Studio <span className="text-primary">Panel</span></h2>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-12 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive"><RotateCcw className="mr-2 size-4" /> Change Photo</Button>
                    <Button 
                        size="lg" 
                        className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-12 flex-[2] md:flex-none shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] border-none" 
                        onClick={handleDownload} 
                    >
                        <div className="absolute left-4 w-0.5 h-6 bg-white/40 rounded-full" />
                        <span className="flex-1 px-10 text-center tracking-widest text-xs uppercase">DOWNLOAD HD</span>
                        <div className="bg-white h-full px-6 flex items-center justify-center text-[#00aeef] transition-all group-hover:px-7" style={{ clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                            <Download className="size-7 group-hover:scale-110 transition-transform" />
                        </div>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[3rem] relative">
                        <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2 text-left">
                                <ArrowLeftRight className="h-4 w-4 text-primary" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Side-by-Side Verification</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[500px] flex items-center justify-center relative overflow-hidden select-none">
                            <div className="relative w-full h-full max-w-4xl aspect-[16/10] overflow-hidden rounded-3xl border-4 border-white dark:border-slate-800 shadow-2xl bg-white mx-auto flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 mx-auto" style={bgColor === 'transparent' ? checkerboardStyle : { backgroundColor: bgColor }}>
                                    <img src={previewImageSrc} alt="Result" className="max-w-full max-h-full object-contain drop-shadow-2xl mx-auto block" />
                                </div>
                                <div 
                                    className="absolute inset-0 flex items-center justify-center p-4 md:p-8 border-r-2 border-white pointer-events-none select-none overflow-hidden bg-slate-200 mx-auto" 
                                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                                >
                                    <img src={croppedImageSrc || originalImageSrc!} alt="Original" className="max-w-full max-h-full object-contain mx-auto block" />
                                </div>
                                <div className="absolute inset-y-0 z-40 w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center pointer-events-none" style={{ left: `${sliderPosition}%` }}>
                                    <div className="size-10 rounded-full bg-white shadow-2xl border-4 border-primary flex items-center justify-center -translate-x-1/2 group">
                                        <ArrowLeftRight className="size-5 text-primary" />
                                    </div>
                                </div>
                                <input 
                                    type="range" min="0" max="100" value={sliderPosition} 
                                    onChange={(e) => setSliderPosition(Number(e.target.value))} 
                                    className="absolute inset-0 z-50 w-full h-full opacity-0 cursor-ew-resize" 
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-6 h-full flex flex-col">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem] flex-1">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8 text-left">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                <Palette className="size-4 md:size-5 text-primary" /> Finish Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-10">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Background Presets</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {COLOR_PRESETS.map((p) => (
                                            <button 
                                                key={p.value} 
                                                onClick={() => setBgColor(p.value)} 
                                                className={cn(
                                                    "h-10 rounded-xl border-2 flex items-center justify-center transition-all shadow-sm", 
                                                    bgColor === p.value ? "border-primary ring-4 ring-primary/10 scale-105" : "border-white/10 bg-white/5"
                                                )}
                                                title={p.name}
                                            >
                                                {p.icon ? <p.icon className="size-4 text-muted-foreground" /> : <div className="size-5 rounded-full border border-black/10" style={{ backgroundColor: p.value }} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4 pt-6 border-t border-white/10 text-left">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-black uppercase opacity-60 flex items-center gap-1.5"><Layers className="size-3" /> External Border</Label>
                                        <Badge variant="secondary" className="font-black text-[9px]">{borderWidth[0]}%</Badge>
                                    </div>
                                    <Slider min={0} max={10} step={0.5} value={borderWidth} onValueChange={setBorderWidth} className="py-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      )}

      <canvas ref={compositeCanvasRef} className="hidden" />
    </div>
  );
}

