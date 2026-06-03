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
import { Switch } from "@/components/ui/switch";
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
            if (item.includes("model")) setStatusText("Loading Core...");
            else setStatusText("Extracting...");
        },
        output: { format: "image/png", quality: 1.0 }
      });

      const url = URL.createObjectURL(blob);
      setSubjectImageSrc(url);
      setStage('studio');
      toast({ title: "Precision Success", description: "Background isolated." });
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Processing Error", description: "Operation failed." });
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
        const dh = (faceImg.height * (dw / faceImg.width));
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
      <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 mb-4">
            <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
                <Eraser className="size-8" />
                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <Sparkles className="size-2.5" />
                </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                Smart <span className="text-gradient-hero">BG Remover</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                Step 1: Upload photo to extract subjects. <br/>100% Private local RAM processing.
            </p>
        </motion.div>

        <Card
            className={cn("w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20", isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]")}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); }}
            onClick={() => fileInputRef.current?.click()}
        >
            <CardHeader className="bg-muted/30 border-b p-6 text-center">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/30 transition-all group relative">
                    <div className="relative">
                        <UploadCloud className="size-12 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="text-center px-4">
                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter">Drop Photo here</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 font-bold opacity-60 uppercase">Extraction happens 100% locally.</p>
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
            </CardContent>
            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT</div>
                <div className="flex items-center gap-1.5"><ImageIcon className="size-3 text-primary" /> TRANSPARENT</div>
            </CardFooter>
        </Card>

        <div className="flex flex-wrap justify-center gap-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mt-2">
            <span>PRIVATE & SECURE</span>
            <span>NO SERVER UPLOADS</span>
            <span>HD EXPORT READY</span>
        </div>
      </div>
    );
  }

  if (stage === 'preview') {
      return (
          <Card className="w-full max-w-3xl glass-card overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
              <CardHeader className="glass-panel border-b p-3 md:p-4 flex flex-row items-center justify-between">
                  <div>
                      <CardTitle className="text-sm md:text-base font-black uppercase tracking-tighter">Quality Check</CardTitle>
                  </div>
              </CardHeader>
              <CardContent className="p-4 md:p-8 flex justify-center bg-black/5 min-h-[250px] md:min-h-[350px]">
                  <img src={originalImageSrc!} alt="Preview" className="max-h-[40vh] md:max-h-[50vh] object-contain rounded-xl shadow-2xl border-2 border-white" />
              </CardContent>
              <CardFooter className="glass-panel border-t p-3 md:p-4 flex justify-between items-center gap-2">
                    <Button variant="ghost" onClick={handleReset} className="font-black text-[8px] md:text-[10px] uppercase h-9 px-3 rounded-lg"><RotateCcw className="mr-1.5 h-3 w-3" /> Change</Button>
                    <div className="flex gap-2">
                        <Button variant="outline" className="font-black border-2 border-primary text-primary h-9 rounded-lg text-[8px] md:text-[9px] uppercase px-3" onClick={() => setStage('crop')}>
                            <CropIcon className="mr-1.5 size-3" /> Set Size
                        </Button>
                        <Button className="px-6 h-9 text-[9px] md:text-[10px] font-black bg-primary rounded-lg shadow-lg uppercase" onClick={() => { 
                            setCroppedImageSrc(originalImageSrc); 
                            setStage('process'); 
                            setTimeout(() => handleRemoveBackgroundLocal(originalImageSrc!), 300);
                        }}>
                            Remove Background <ChevronRight className="ml-1 size-3.5" />
                        </Button>
                    </div>
              </CardFooter>
          </Card>
      );
  }

  if (stage === 'crop') {
    return (
        <Card className="w-full max-w-4xl glass-card shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
            <CardHeader className="glass-panel border-b p-3 md:p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-0.5">
                        <CardTitle className="text-sm md:text-base font-black uppercase tracking-tighter">Adjust Frame</CardTitle>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-[8px] font-black uppercase text-primary tracking-widest">Document Preset</Label>
                        <Select value={selectedSizeIndex} onValueChange={setSelectedSizeIndex}>
                            <SelectTrigger className="h-8 md:h-9 font-black border-2 rounded-lg text-[10px]"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-lg border-2">
                                {SIZE_PRESETS.map((p, i) => (
                                    <SelectItem key={i} value={String(i)} className="font-bold text-[10px] uppercase">{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 md:p-8 flex justify-center bg-black/5 min-h-[300px] md:min-h-[450px]">
                <div className="max-h-[45vh] md:max-h-[55vh] overflow-hidden rounded-xl shadow-2xl border-4 border-white/50">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={selectedSizeIndex === '0' ? (imgRef.current?.naturalWidth ? imgRef.current.naturalWidth / imgRef.current.naturalHeight : 1) : (SIZE_PRESETS[parseInt(selectedSizeIndex)].width / SIZE_PRESETS[parseInt(selectedSizeIndex)].height)}
                        className="max-h-[45vh] md:max-h-[55vh]"
                    >
                        <img
                            ref={imgRef}
                            alt="Crop source"
                            src={originalImageSrc!}
                            style={{ maxHeight: '55vh', objectFit: 'contain' }}
                            onLoad={updateCropFromSettings}
                        />
                    </ReactCrop>
                </div>
            </CardContent>
            <CardFooter className="glass-panel border-t p-3 md:p-4 flex justify-between">
                <Button variant="ghost" onClick={() => setStage('preview')} className="font-black text-[9px] uppercase h-9 rounded-lg"><RotateCcw className="mr-1.5 size-3" /> Back</Button>
                <Button className="px-6 h-9 text-[10px] font-black bg-primary rounded-lg shadow-lg uppercase" onClick={handleApplyCrop}>
                    Confirm & Extract <ChevronRight className="ml-1 size-3.5" />
                </Button>
            </CardFooter>
        </Card>
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
            <Button size="lg" className="flex-1 md:flex-none h-9 md:h-10 px-6 bg-green-600 hover:bg-green-700 font-black text-[9px] md:text-xs rounded-lg shadow-xl" onClick={handleDownload} disabled={isProcessing || !previewImageSrc}>
                <Download className="mr-1.5 size-3.5" /> DOWNLOAD HD
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-8">
            <Card className="overflow-hidden glass-card border-none shadow-2xl relative rounded-2xl md:rounded-[2rem]">
                <CardContent className="p-0 aspect-video relative bg-white flex items-center justify-center min-h-[300px] md:min-h-[450px]" style={bgColor === 'transparent' ? checkerboardStyle : { backgroundColor: bgColor }}>
                    <AnimatePresence mode="wait">
                        {isProcessing ? (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/95 backdrop-blur-xl p-6 text-center gap-6"
                            >
                                <div className="relative">
                                    <Loader2 className="h-14 w-14 md:h-20 md:w-20 animate-spin text-primary stroke-[3]" />
                                    <Zap className="absolute inset-0 m-auto h-6 w-6 md:h-9 md:w-9 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-3 w-full max-w-[250px] md:max-w-xs">
                                    <p className="font-black text-lg md:text-xl text-primary animate-pulse uppercase tracking-tighter">{statusText}</p>
                                    <Progress value={progress} className="h-1.5 shadow-inner" />
                                </div>
                            </motion.div>
                        ) : previewImageSrc ? (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative size-full p-4 md:p-8">
                                <Image src={previewImageSrc} alt="Result" fill className="object-contain p-4 md:p-8 drop-shadow-2xl" />
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-2xl">
                <CardHeader className="bg-primary/5 border-b border-white/10 p-4">
                    <CardTitle className="text-sm flex items-center gap-2 font-black uppercase tracking-tighter">
                        <Palette className="size-4 text-primary" /> Studio Panel
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="background" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-10 bg-muted/20 border-b border-white/10 p-1">
                            <TabsTrigger value="background" className="font-bold text-[8px] md:text-[9px] uppercase rounded-md">Colors</TabsTrigger>
                            <TabsTrigger value="studio" className="font-bold text-[8px] md:text-[9px] uppercase rounded-md">Borders</TabsTrigger>
                        </TabsList>

                        <TabsContent value="background" className="p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
                             <div className="space-y-4">
                                <div className="space-y-3">
                                    <Label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Presets</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {COLOR_PRESETS.map((preset) => (
                                            <button
                                                key={preset.value}
                                                onClick={() => setBgColor(preset.value)}
                                                className={cn(
                                                    "group h-9 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm",
                                                    bgColor === preset.value ? "border-primary ring-2 ring-primary/10 scale-105" : "border-white/10 bg-white/5"
                                                )}
                                                title={preset.name}
                                            >
                                                {preset.icon ? (
                                                    <preset.icon className="size-3 text-muted-foreground" />
                                                ) : (
                                                    <div className="size-4 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: preset.value }} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-white/5">
                                    <Label className="text-[8px] md:text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Manual Color</Label>
                                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10">
                                        <Input 
                                            type="color" 
                                            value={bgColor === 'transparent' ? '#ffffff' : bgColor} 
                                            onChange={(e) => setBgColor(e.target.value)} 
                                            className="w-8 h-8 p-1 rounded-md cursor-pointer border-none bg-transparent"
                                        />
                                        <p className="text-[8px] font-mono text-primary font-bold uppercase">{bgColor}</p>
                                    </div>
                                </div>
                             </div>
                        </TabsContent>

                        <TabsContent value="studio" className="p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
                             <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[8px] md:text-[9px] font-black uppercase opacity-60">Frame Size</Label>
                                        <Badge variant="secondary" className="font-black text-[8px] px-1.5 py-0">{borderWidth[0]}%</Badge>
                                    </div>
                                    <Slider min={0} max={10} step={0.5} value={borderWidth} onValueChange={setBorderWidth} className="py-2" />
                                </div>
                                
                                <div className="space-y-2 pt-2 border-t border-white/5">
                                    <Label className="text-[8px] md:text-[9px] font-black uppercase opacity-60">Frame Color</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {['#FFFFFF', '#000000', '#D3D3D3', '#5cbdb9'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setBorderColor(c)}
                                                className={cn(
                                                    "size-7 rounded-lg border transition-all",
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
                <CardFooter className="bg-muted/10 p-3 border-t border-white/10 flex justify-center gap-4 opacity-40 text-[7px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1"><ShieldCheck className="size-2.5 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-1"><Zap className="size-2.5 text-yellow-500" /> HARDWARE BOOST</div>
                </CardFooter>
            </Card>
        </div>
      </div>
      
      <canvas ref={compositeCanvasRef} className="hidden" />
    </div>
  );
}
