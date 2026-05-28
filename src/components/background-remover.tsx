
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
    CheckCircle2
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
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';

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

const DPI = 300; 

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
  
  // Customization States
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [borderWidth, setBorderWidth] = useState([0]);
  const [borderColor, setBorderColor] = useState("#000000");

  // Crop & Size States
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<string>("0");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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
        setOriginalImageSrc(e.target?.result as string);
        setStage('preview');
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please select an image file." });
    }
  };

  const handleRotateOriginal = () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    const img = new window.Image();
    img.src = originalImageSrc;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setIsProcessing(false);
            return;
        }
        canvas.width = img.height;
        canvas.height = img.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        const rotatedSrc = canvas.toDataURL('image/png');
        setOriginalImageSrc(rotatedSrc);
        setIsProcessing(false);
        toast({ title: "Rotated", description: "Photo orientation changed." });
    };
  };

  const updateCropFromSettings = useCallback(() => {
    if (!imgRef.current) return;
    
    const { width: imgW, height: imgH } = imgRef.current;
    let aspect = 1;

    if (selectedSizeIndex === '0') {
        aspect = imgRef.current.naturalWidth / imgRef.current.naturalHeight;
    } else {
        const preset = SIZE_PRESETS[parseInt(selectedSizeIndex)];
        aspect = preset.width / preset.height;
    }

    const newCrop = centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, imgW, imgH),
        imgW,
        imgH
    );
    setCrop(newCrop);
  }, [selectedSizeIndex]);

  useEffect(() => {
    if (stage === 'crop' && imgRef.current) {
        updateCropFromSettings();
    }
  }, [selectedSizeIndex, stage, updateCropFromSettings]);

  const handleApplyCrop = () => {
    if (!imgRef.current || !completedCrop) return;
    
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const croppedData = canvas.toDataURL('image/png');
    setCroppedImageSrc(croppedData);
    setStage('process');
    
    setTimeout(() => {
      handleRemoveBackgroundLocal(croppedData);
    }, 300);
  };

  const handleRemoveBackgroundLocal = async (source: string) => {
    setIsProcessing(true);
    setSubjectImageSrc(null);
    setProgress(5);
    setStatusText("Initializing Engine...");

    try {
      const imglyModule = await import("@imgly/background-removal");
      const removeBackgroundFunc = imglyModule.removeBackground || (imglyModule as any).default;
      
      const blob = await removeBackgroundFunc(source, {
        progress: (item: string, index: number, total: number) => {
            const p = Math.round((index / total) * 100);
            setProgress(p);
            if (item.includes("model")) setStatusText("Loading Core System...");
            else setStatusText("Extracting Subject...");
        },
        output: { format: "image/png", quality: 1.0 }
      });

      const url = URL.createObjectURL(blob);
      setSubjectImageSrc(url);
      setStage('studio');
      toast({ title: "Precision Success", description: "Background isolated with zero artifacts." });
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Processing Error", description: "Operation failed. Using original." });
      setSubjectImageSrc(source);
      setStage('studio');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateComposite = useCallback(async () => {
    if (!subjectImageSrc) return;

    const canvas = compositeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
    if (!ctx) return;

    let targetW_px, targetH_px;
    
    if (selectedSizeIndex === '0') {
        const img = new window.Image();
        img.src = subjectImageSrc;
        await new Promise(r => img.onload = r);
        targetW_px = img.width;
        targetH_px = img.height;
    } else {
        const preset = SIZE_PRESETS[parseInt(selectedSizeIndex)];
        if (preset.unit === 'mm') {
            targetW_px = Math.round((preset.width / 25.4) * DPI);
            targetH_px = Math.round((preset.height / 25.4) * DPI);
        } else if (preset.unit === 'inch') {
            targetW_px = Math.round(preset.width * DPI);
            targetH_px = Math.round(preset.height * DPI);
        } else {
            targetW_px = preset.width;
            targetH_px = preset.height;
        }
    }

    canvas.width = targetW_px;
    canvas.height = targetH_px;

    const img = new window.Image();
    img.src = subjectImageSrc;
    img.onload = () => {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (bgColor !== 'transparent') {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (canvas.width - dw) / 2;
        const dy = (canvas.height - dh) / 2;
        
        ctx.drawImage(img, dx, dy, dw, dh);
        
        if (borderWidth[0] > 0) {
            ctx.strokeStyle = borderColor;
            const strokePx = (borderWidth[0] / 100) * canvas.width;
            ctx.lineWidth = strokePx; 
            ctx.strokeRect(strokePx/2, strokePx/2, canvas.width - strokePx, canvas.height - strokePx);
        }

        setPreviewImageSrc(canvas.toDataURL("image/png", 1.0));
    };
  }, [subjectImageSrc, bgColor, borderWidth, borderColor, selectedSizeIndex]);

  useEffect(() => {
    updateComposite();
  }, [updateComposite]);

  const handleDownload = () => {
    if (!previewImageSrc) return;
    const link = document.createElement("a");
    link.href = previewImageSrc;
    link.download = `GR7-HD-Clean-${Date.now()}.png`;
    link.click();
  };

  const handleReset = () => {
    setStage('upload');
    setImageFile(null);
    setOriginalImageSrc(null);
    setCroppedImageSrc(null);
    setSubjectImageSrc(null);
    setPreviewImageSrc(null);
    setBgColor("transparent");
    setBorderWidth([0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (stage === 'upload') {
    return (
      <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
            <div className="mx-auto mb-2 grid size-16 md:size-20 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-xl relative">
                <Eraser className="size-8 md:size-10" />
                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 md:size-6 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <Sparkles className="size-2.5 md:size-3" />
                </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                Smart <span className="text-gradient-hero">Background</span> Remover
            </h1>
            <p className="text-[10px] md:text-sm text-muted-foreground font-semibold max-w-xl mx-auto">
                Isolate subjects with pixel-level precision. <br/>100% Private local processing.
            </p>
        </motion.div>

        <Card
            className={cn("w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 neon-border cursor-pointer", isDragOver && "ring-4 ring-primary/20 scale-[1.02]")}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); }}
            onClick={() => fileInputRef.current?.click()}
        >
            <CardContent className="p-10 md:p-20 flex flex-col items-center justify-center space-y-6">
                <UploadCloud className="size-12 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                <div className="text-center">
                    <p className="text-lg md:text-xl font-black uppercase tracking-tighter">Click to Upload Photo</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-2 font-bold opacity-60">No size limits. Native speed processing.</p>
                </div>
            </CardContent>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
        </Card>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-500" /> SECURE RAM</div>
            <div className="flex items-center gap-1.5"><Zap className="size-3.5 text-yellow-500" /> INSTANT PROCESSING</div>
            <div className="flex items-center gap-1.5"><ImageIcon className="size-3.5 text-primary" /> TRANSPARENT PNG</div>
        </div>
      </div>
    );
  }

  if (stage === 'preview') {
      return (
          <Card className="w-full max-w-4xl glass-card overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
              <CardHeader className="glass-panel border-b p-4 md:py-6 md:px-8 flex flex-row items-center justify-between">
                  <div>
                      <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tighter">Step 1: Check Quality</CardTitle>
                      <CardDescription className="font-bold text-[9px] md:text-[10px] uppercase opacity-60">Review your photo before extraction.</CardDescription>
                  </div>
              </CardHeader>
              <CardContent className="p-6 md:p-12 flex justify-center bg-black/5 min-h-[300px] md:min-h-[400px]">
                  <img src={originalImageSrc!} alt="Preview" className="max-h-[50vh] md:max-h-[60vh] object-contain rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-2 md:border-4 border-white" />
              </CardContent>
              <CardFooter className="glass-panel border-t p-4 md:p-6 flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-center">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="ghost" onClick={handleReset} className="flex-1 sm:flex-none font-black text-[9px] md:text-[10px] uppercase h-10 md:h-12 px-4 md:px-6 rounded-xl"><RotateCcw className="mr-2 h-4 w-4" /> Change</Button>
                    <Button variant="outline" onClick={handleRotateOriginal} className="flex-1 sm:flex-none font-black text-[9px] md:text-[10px] uppercase border-2 h-10 md:h-12 rounded-xl">
                        <RotateCw className="mr-1.5 md:mr-2 h-4 w-4 text-primary" /> ROTATE
                    </Button>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                      <Button variant="outline" className="flex-1 sm:flex-none font-black border-2 border-primary text-primary h-10 md:h-12 rounded-xl text-[10px]" onClick={() => setStage('crop')}>
                          <CropIcon className="mr-1.5 md:mr-2 h-4 w-4" /> SET SIZE & CROP
                      </Button>
                      <Button className="flex-1 sm:flex-none px-6 md:px-12 h-10 md:h-12 text-[10px] md:text-base font-black bg-primary rounded-xl shadow-xl" onClick={() => { 
                          setCroppedImageSrc(originalImageSrc); 
                          setStage('process'); 
                          setTimeout(() => handleRemoveBackgroundLocal(originalImageSrc!), 300);
                      }}>
                          REMOVE BG <ChevronRight className="ml-1 md:ml-2 h-5 w-5" />
                      </Button>
                  </div>
              </CardFooter>
          </Card>
      );
  }

  if (stage === 'crop') {
    return (
        <Card className="w-full max-w-5xl glass-card shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
            <CardHeader className="glass-panel border-b p-4 md:py-6 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-center">
                    <div className="space-y-1 text-center md:text-left">
                        <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tighter">Step 1: Size & Alignment</CardTitle>
                        <CardDescription className="font-bold text-[9px] md:text-[10px] uppercase opacity-60">Select a preset or keep original ratio.</CardDescription>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[9px] md:text-[10px] font-black uppercase text-primary tracking-widest">Document Preset</Label>
                        <Select value={selectedSizeIndex} onValueChange={setSelectedSizeIndex}>
                            <SelectTrigger className="h-10 md:h-12 font-black border-2 rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl border-2">
                                {SIZE_PRESETS.map((p, i) => (
                                    <SelectItem key={i} value={String(i)} className="font-bold">{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 md:p-12 flex justify-center bg-black/5 min-h-[350px] md:min-h-[500px]">
                <div className="max-h-[50vh] md:max-h-[60vh] overflow-hidden rounded-2xl shadow-2xl border-4 border-white/50">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={selectedSizeIndex === '0' ? (imgRef.current?.naturalWidth ? imgRef.current.naturalWidth / imgRef.current.naturalHeight : 1) : (SIZE_PRESETS[parseInt(selectedSizeIndex)].width / SIZE_PRESETS[parseInt(selectedSizeIndex)].height)}
                        className="max-h-[50vh] md:max-h-[60vh]"
                    >
                        <img
                            ref={imgRef}
                            alt="Crop source"
                            src={originalImageSrc!}
                            style={{ maxHeight: '60vh', objectFit: 'contain' }}
                            onLoad={updateCropFromSettings}
                        />
                    </ReactCrop>
                </div>
            </CardContent>
            <CardFooter className="glass-panel border-t p-4 md:p-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStage('preview')} className="font-black text-[9px] md:text-[10px] uppercase h-10 md:h-12 rounded-xl"><RotateCcw className="mr-2" /> Back</Button>
                <Button className="px-8 md:px-12 h-10 md:h-12 text-sm md:text-base font-black bg-primary rounded-xl shadow-xl" onClick={handleApplyCrop}>
                    APPLY & EXTRACT <ChevronRight className="ml-1 md:ml-2" />
                </Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6 md:gap-10">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-center md:text-left">
        <div className="flex items-center gap-4">
            <div className="size-12 md:size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                <Settings2 className="size-6 md:size-8" />
            </div>
            <div>
                <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Pro Studio <span className="text-primary">Dashboard</span></h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                    <Badge variant="outline" className="text-[7px] md:text-[8px] font-black uppercase bg-green-500/5 text-green-600 border-green-500/20">HD 300DPI</Badge>
                    <Badge variant="outline" className="text-[7px] md:text-[8px] font-black uppercase bg-primary/5 text-primary border-primary/20">LOCAL PROCESSING</Badge>
                </div>
            </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 w-full md:w-auto">
             <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-10 md:h-12 border-2 font-black text-[9px] md:text-[10px] uppercase px-4 md:px-6 rounded-xl">
                <RotateCcw className="mr-1.5 md:mr-2 size-4" /> Reset
            </Button>
            <Button size="lg" className="flex-1 md:flex-none h-10 md:h-12 px-6 md:px-10 bg-green-600 hover:bg-green-700 font-black text-xs md:text-sm rounded-xl shadow-2xl" onClick={handleDownload} disabled={isProcessing || !previewImageSrc}>
                <Download className="mr-1.5 md:mr-2 size-4 md:size-5" /> DOWNLOAD HD
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* Workspace: Preview Area */}
        <div className="lg:col-span-8">
            <Card className="overflow-hidden glass-card border-none shadow-2xl relative rounded-2xl md:rounded-[3rem]">
                <CardContent className="p-0 aspect-square md:aspect-video relative bg-white flex items-center justify-center min-h-[350px] md:min-h-[500px]" style={bgColor === 'transparent' ? checkerboardStyle : { backgroundColor: bgColor }}>
                    <AnimatePresence mode="wait">
                        {isProcessing ? (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/95 backdrop-blur-xl p-6 md:p-8 text-center gap-6 md:gap-8"
                            >
                                <div className="relative">
                                    <Loader2 className="h-16 w-16 md:h-24 md:w-24 animate-spin text-primary stroke-[3]" />
                                    <Zap className="absolute inset-0 m-auto h-7 w-7 md:h-10 md:w-10 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-4 w-full max-w-[280px] md:max-w-sm">
                                    <p className="font-black text-xl md:text-3xl text-primary animate-pulse uppercase tracking-tighter">{statusText}</p>
                                    <Progress value={progress} className="h-2 shadow-inner bg-primary/10" />
                                    <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Local processing threads active...</p>
                                </div>
                            </motion.div>
                        ) : previewImageSrc ? (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative size-full p-6 md:p-12">
                                <Image src={previewImageSrc} alt="Result" fill className="object-contain p-6 md:p-12 drop-shadow-2xl" />
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>

        {/* Sidebar: Studio Controls */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-2xl md:rounded-[2.5rem]">
                <CardHeader className="bg-primary/5 border-b border-white/10 p-4 md:p-6">
                    <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter">
                        <Palette className="size-5 md:size-6 text-primary" /> STUDIO PANEL
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="background" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-12 md:h-14 bg-muted/20 border-b border-white/10 p-1 md:p-1.5">
                            <TabsTrigger value="background" className="font-bold text-[9px] md:text-[10px] uppercase rounded-lg md:rounded-xl">
                                <Palette className="size-3 mr-1.5 md:mr-2" /> BG Colors
                            </TabsTrigger>
                            <TabsTrigger value="studio" className="font-bold text-[9px] md:text-[10px] uppercase rounded-lg md:rounded-xl">
                                <Maximize className="size-3 mr-1.5 md:mr-2" /> Borders
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="background" className="p-5 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
                             <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
                                       Quick Presets
                                    </Label>
                                    <div className="grid grid-cols-4 gap-2 md:gap-3">
                                        {COLOR_PRESETS.map((preset) => (
                                            <button
                                                key={preset.value}
                                                onClick={() => setBgColor(preset.value)}
                                                className={cn(
                                                    "group h-10 md:h-12 rounded-lg md:rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all shadow-md",
                                                    bgColor === preset.value ? "border-primary ring-4 ring-primary/10 scale-105" : "border-white/10 bg-white/5"
                                                )}
                                                title={preset.name}
                                            >
                                                {preset.icon ? (
                                                    <preset.icon className="size-3.5 md:size-4 text-muted-foreground" />
                                                ) : (
                                                    <div className="size-5 md:size-6 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: preset.value }} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="opacity-10" />

                                <div className="space-y-4">
                                    <Label className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
                                        Manual Selection
                                    </Label>
                                    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/10">
                                        <Input 
                                            type="color" 
                                            value={bgColor === 'transparent' ? '#ffffff' : bgColor} 
                                            onChange={(e) => setBgColor(e.target.value)} 
                                            className="w-10 h-10 md:w-14 md:h-14 p-1 rounded-lg md:rounded-xl cursor-pointer border-none bg-transparent"
                                        />
                                        <div className="flex-1">
                                            <p className="text-[10px] md:text-xs font-black uppercase tracking-tighter">Color Picker</p>
                                            <p className="text-[8px] md:text-[10px] font-mono text-primary font-bold mt-0.5 md:mt-1 uppercase">{bgColor}</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </TabsContent>

                        <TabsContent value="studio" className="p-5 md:p-8 space-y-8 md:space-y-10 animate-in fade-in duration-300">
                             <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
                                            Frame Thickness
                                        </Label>
                                        <Badge variant="secondary" className="font-black text-[8px] md:text-[9px] px-2 py-0.5">{borderWidth[0]}%</Badge>
                                    </div>
                                    <Slider min={0} max={10} step={0.5} value={borderWidth} onValueChange={setBorderWidth} className="py-2 md:py-4" />
                                </div>
                                
                                <Separator className="opacity-10" />

                                <div className="space-y-4">
                                    <Label className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Frame Color</Label>
                                    <div className="flex flex-wrap gap-2 md:gap-3">
                                        {['#FFFFFF', '#000000', '#D3D3D3', '#5cbdb9'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setBorderColor(c)}
                                                className={cn(
                                                    "size-8 md:size-10 rounded-lg md:rounded-xl border-2 transition-all shadow-lg",
                                                    borderColor === c ? "border-primary scale-110" : "border-white/10"
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                             </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="bg-muted/10 p-5 md:p-8 border-t border-white/10 flex flex-col gap-4">
                    <div className="flex items-center justify-center gap-4 md:gap-6 opacity-40 text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-1"><ShieldCheck className="size-3" /> SECURE RAM</div>
                        <div className="flex items-center gap-1"><Zap className="size-3 text-yellow-500" /> HARDWARE BOOST</div>
                    </div>
                </CardFooter>
            </Card>
        </div>
      </div>
      
      <canvas ref={compositeCanvasRef} className="hidden" />
    </div>
  );
}
