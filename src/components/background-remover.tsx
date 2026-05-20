
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
    Scaling
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
    { name: 'India Passport (35x45mm)', width: 35, height: 45, unit: 'mm' },
    { name: 'USA Passport (2x2in)', width: 2, height: 2, unit: 'inch' },
    { name: 'PAN Card (25x35mm)', width: 25, height: 35, unit: 'mm' },
    { name: 'SSC Photo (200x230px)', width: 200, height: 230, unit: 'px' },
    { name: 'Custom Size', width: 0, height: 0, unit: 'mm' },
];

const DPI = 300; // Professional print quality

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
  const [borderColor, setBorderColor] = useState("#FFFFFF");

  // Crop & Size States
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<string>("0");
  const [customWidth, setCustomWidth] = useState<string>("35");
  const [customHeight, setCustomHeight] = useState<string>("45");
  const [customUnit, setCustomUnit] = useState<string>("mm");

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

  // Logic to update crop box immediately when preset or values change
  const updateCropFromSettings = useCallback(() => {
    if (!imgRef.current) return;
    
    const { width: imgW, height: imgH } = imgRef.current;
    let aspect = 1;

    if (selectedSizeIndex === '4') { // Custom
        const w = parseFloat(customWidth);
        const h = parseFloat(customHeight);
        if (w > 0 && h > 0) aspect = w / h;
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
  }, [selectedSizeIndex, customWidth, customHeight]);

  useEffect(() => {
    if (stage === 'crop' && imgRef.current) {
        updateCropFromSettings();
    }
  }, [selectedSizeIndex, customWidth, customHeight, stage, updateCropFromSettings]);

  const handleApplyCrop = () => {
    if (!imgRef.current || !completedCrop) return;
    
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');
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

    const croppedData = canvas.toDataURL('image/png'); // Use PNG for quality
    setCroppedImageSrc(croppedData);
    setStage('process');
    handleRemoveBackgroundLocal(croppedData);
  };

  const handleRemoveBackgroundLocal = async (source: string) => {
    setIsProcessing(true);
    setSubjectImageSrc(null);
    setProgress(5);
    setStatusText("Loading Local Engine...");

    try {
      const imglyModule = await import("@imgly/background-removal");
      const removeBackgroundFunc = imglyModule.removeBackground || (imglyModule as any).default;
      
      const blob = await removeBackgroundFunc(source, {
        progress: (item: string, index: number, total: number) => {
            const p = Math.round((index / total) * 100);
            setProgress(p);
            if (item.includes("model")) setStatusText("Loading AI Model...");
            else setStatusText("Removing Background...");
        },
        output: { format: "image/png", quality: 1.0 } // 1.0 for zero blur
      });

      const url = URL.createObjectURL(blob);
      setSubjectImageSrc(url);
      setStage('studio');
      toast({ title: "Done!", description: "Background removed with high precision." });
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "AI Error", description: "Could not remove background locally." });
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
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Calculate dimensions based on 300 DPI for sharp output
    let w, h, u;
    if (selectedSizeIndex === '4') {
        w = parseFloat(customWidth) || 35;
        h = parseFloat(customHeight) || 45;
        u = customUnit;
    } else {
        const preset = SIZE_PRESETS[parseInt(selectedSizeIndex)];
        w = preset.width;
        h = preset.height;
        u = preset.unit;
    }

    let targetW_px, targetH_px;
    if (u === 'mm') {
        targetW_px = Math.round((w / 25.4) * DPI);
        targetH_px = Math.round((h / 25.4) * DPI);
    } else if (u === 'inch') {
        targetW_px = Math.round(w * DPI);
        targetH_px = Math.round(h * DPI);
    } else {
        targetW_px = w || 600;
        targetH_px = h || 800;
    }

    canvas.width = targetW_px;
    canvas.height = targetH_px;

    const img = new window.Image();
    img.src = subjectImageSrc;
    img.onload = () => {
        // High quality drawing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (bgColor !== 'transparent') {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Draw subject fitting the height (typical for passport)
        const scale = canvas.height / img.height;
        const dw = img.width * scale;
        const dh = canvas.height;
        const dx = (canvas.width - dw) / 2;
        ctx.drawImage(img, dx, 0, dw, dh);
        
        // Draw Border if any
        if (borderWidth[0] > 0) {
            ctx.strokeStyle = borderColor;
            const strokePx = (borderWidth[0] / 100) * canvas.width;
            ctx.lineWidth = strokePx; 
            ctx.strokeRect(strokePx/2, strokePx/2, canvas.width - strokePx, canvas.height - strokePx);
        }

        setPreviewImageSrc(canvas.toDataURL("image/png", 1.0));
    };
  }, [subjectImageSrc, bgColor, borderWidth, borderColor, selectedSizeIndex, customWidth, customHeight, customUnit]);

  useEffect(() => {
    updateComposite();
  }, [updateComposite]);

  const handleDownload = () => {
    if (!previewImageSrc) return;
    const link = document.createElement("a");
    link.href = previewImageSrc;
    link.download = `hd-photo-${Date.now()}.png`;
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
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0]); }}
      >
        <CardHeader>
          <div className="mx-auto mb-4 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
            <Layers className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-black">Professional ID Photo Maker</CardTitle>
          <CardDescription>High-Definition background removal & physical size control.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
                <p className="text-xl font-bold">Drop photo here to begin</p>
                <p className="text-sm text-muted-foreground mt-2">100% Secure local AI processing at 300 DPI.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
        </CardContent>
      </Card>
    );
  }

  if (stage === 'preview') {
      return (
          <Card className="w-full max-w-4xl shadow-2xl">
              <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                  <div>
                      <CardTitle className="text-xl font-black">Photo Preview</CardTitle>
                      <CardDescription>Choose to crop for specific size or remove background directly.</CardDescription>
                  </div>
              </CardHeader>
              <CardContent className="p-8 flex justify-center bg-black/5">
                  <img src={originalImageSrc!} alt="Preview" className="max-h-[60vh] object-contain rounded-lg shadow-xl" />
              </CardContent>
              <CardFooter className="bg-muted/10 border-t p-6 flex flex-col sm:flex-row gap-4 justify-between">
                  <Button variant="ghost" onClick={handleReset} className="font-bold"><RotateCcw className="mr-2" /> Change Photo</Button>
                  <div className="flex gap-3">
                      <Button variant="outline" className="font-black border-2 border-primary text-primary" onClick={() => setStage('crop')}>
                          <CropIcon className="mr-2" /> SET SIZE & CROP
                      </Button>
                      <Button className="px-10 h-12 text-lg font-black bg-primary" onClick={() => { setCroppedImageSrc(originalImageSrc); setStage('process'); handleRemoveBackgroundLocal(originalImageSrc!); }}>
                          REMOVE BACKGROUND <ChevronRight className="ml-2" />
                      </Button>
                  </div>
              </CardFooter>
          </Card>
      );
  }

  if (stage === 'crop') {
    return (
        <Card className="w-full max-w-5xl shadow-2xl animate-in fade-in duration-500">
            <CardHeader className="bg-muted/30 border-b">
                <div className="grid lg:grid-cols-2 gap-6 items-end">
                    <div className="space-y-4">
                        <CardTitle className="text-xl font-black">Step 1: Alignment & Size</CardTitle>
                        <Label className="text-xs font-black uppercase text-primary tracking-widest">Select ID Preset</Label>
                        <Select value={selectedSizeIndex} onValueChange={setSelectedSizeIndex}>
                            <SelectTrigger className="h-12 font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {SIZE_PRESETS.map((p, i) => (
                                    <SelectItem key={i} value={String(i)}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedSizeIndex === '4' && (
                        <div className="grid grid-cols-3 gap-3 animate-in slide-in-from-top-2">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold">Width</Label>
                                <Input type="number" value={customWidth} onChange={(e) => setCustomWidth(e.target.value)} className="h-10 font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold">Height</Label>
                                <Input type="number" value={customHeight} onChange={(e) => setCustomHeight(e.target.value)} className="h-10 font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold">Unit</Label>
                                <Select value={customUnit} onValueChange={setCustomUnit}>
                                    <SelectTrigger className="h-10 font-bold"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mm">MM</SelectItem>
                                        <SelectItem value="inch">Inch</SelectItem>
                                        <SelectItem value="px">PX</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-8 flex justify-center bg-black/5">
                <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={selectedSizeIndex === '4' ? (parseFloat(customWidth)/parseFloat(customHeight)) : (SIZE_PRESETS[parseInt(selectedSizeIndex)].width / SIZE_PRESETS[parseInt(selectedSizeIndex)].height)}
                    className="max-h-[60vh]"
                >
                    <img
                        ref={imgRef}
                        alt="Crop source"
                        src={originalImageSrc!}
                        style={{ maxHeight: '60vh', objectFit: 'contain' }}
                        onLoad={updateCropFromSettings}
                    />
                </ReactCrop>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t p-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStage('preview')} className="font-bold"><RotateCcw className="mr-2" /> Back</Button>
                <Button className="px-10 h-12 text-lg font-black bg-primary" onClick={handleApplyCrop}>
                    APPLY & REMOVE BG <ChevronRight className="ml-2" />
                </Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Preview Area */}
        <div className="lg:col-span-8 space-y-6">
            <Card className="overflow-hidden border-2 shadow-2xl relative">
                <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ImageIcon className="h-3 w-3" /> Result Preview (300 DPI)
                    </CardTitle>
                    {stage === 'studio' && <Badge className="text-[9px] font-black bg-green-500/10 text-green-600">HD QUALITY READY</Badge>}
                </CardHeader>
                <CardContent className="p-0 aspect-square md:aspect-video relative bg-white flex items-center justify-center min-h-[500px]" style={bgColor === 'transparent' ? checkerboardStyle : { backgroundColor: bgColor }}>
                    {isProcessing ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/95 backdrop-blur-md p-8 text-center gap-8">
                            <div className="relative">
                                <Loader2 className="h-20 w-20 animate-spin text-primary stroke-[3]" />
                                <Zap className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-4 w-full max-w-sm">
                                <p className="font-black text-2xl text-primary animate-pulse uppercase tracking-tighter">{statusText}</p>
                                <Progress value={progress} className="h-2 shadow-inner" />
                            </div>
                        </div>
                    ) : previewImageSrc ? (
                        <Image src={previewImageSrc} alt="Result" fill className="object-contain p-8 animate-in zoom-in-95 duration-500" />
                    ) : null}
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button variant="outline" size="lg" onClick={handleReset} disabled={isProcessing} className="w-full sm:w-auto h-14 px-8 border-2 font-black uppercase text-xs">
                    <RotateCcw className="mr-2 h-4 w-4" /> Start Over
                </Button>
                {stage === 'studio' && (
                    <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl" onClick={handleDownload}>
                        <Download className="mr-3 h-6 w-6" /> DOWNLOAD HD PHOTO
                    </Button>
                )}
            </div>
        </div>

        {/* Studio Panel */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 shadow-xl border-primary/10 overflow-hidden bg-card/50">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2 font-black uppercase tracking-tighter">
                        <Settings2 className="h-5 w-5 text-primary" /> STUDIO CONTROLS
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="colors" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/20 border-b">
                            <TabsTrigger value="colors" className="font-bold text-[10px] uppercase">
                                <Palette className="size-3 mr-2" /> BG Color
                            </TabsTrigger>
                            <TabsTrigger value="border" className="font-bold text-[10px] uppercase">
                                <Maximize className="size-3 mr-2" /> Frame & Border
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="colors" className="p-6 space-y-8 animate-in fade-in duration-300">
                             <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                       Standard Backgrounds
                                    </Label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {COLOR_PRESETS.map((preset) => (
                                            <button
                                                key={preset.value}
                                                onClick={() => setBgColor(preset.value)}
                                                className={cn(
                                                    "group h-12 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                                                    bgColor === preset.value ? "border-primary ring-2 ring-primary/10 shadow-lg scale-105" : "border-transparent bg-muted/20 hover:bg-muted/40"
                                                )}
                                                title={preset.name}
                                            >
                                                {preset.icon ? (
                                                    <preset.icon className="size-4 text-muted-foreground" />
                                                ) : (
                                                    <div className="size-6 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: preset.value }} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                        Pick Custom Color
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <Input 
                                            type="color" 
                                            value={bgColor === 'transparent' ? '#ffffff' : bgColor} 
                                            onChange={(e) => setBgColor(e.target.value)} 
                                            className="w-12 h-12 p-1 rounded-lg cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold">Manual Color Selector</p>
                                            <p className="text-[9px] text-muted-foreground uppercase font-mono">{bgColor}</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </TabsContent>

                        <TabsContent value="border" className="p-6 space-y-8 animate-in fade-in duration-300">
                             <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                        Border Thickness
                                    </Label>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <span>Thickness</span>
                                            <Badge variant="secondary">{borderWidth[0]}%</Badge>
                                        </div>
                                        <Slider min={0} max={10} step={0.5} value={borderWidth} onValueChange={setBorderWidth} />
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {['#FFFFFF', '#000000', '#D3D3D3'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setBorderColor(c)}
                                                className={cn(
                                                    "size-10 rounded-xl border-2 transition-all flex items-center justify-center shadow-sm",
                                                    borderColor === c ? "border-primary scale-110 shadow-md ring-2 ring-primary/10" : "border-muted"
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                    <p className="text-[10px] font-black text-primary uppercase flex items-center gap-1.5 mb-1.5">
                                        <ShieldCheck className="size-3" /> PRINT QUALITY ACTIVE
                                    </p>
                                    <p className="text-[9px] text-muted-foreground leading-relaxed">
                                        Output is rendered at <strong>300 DPI</strong>. Perfect for physical printing on 4x6 photo paper.
                                    </p>
                                </div>
                             </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
      </div>
      
      <canvas ref={compositeCanvasRef} className="hidden" />
    </div>
  );
}
