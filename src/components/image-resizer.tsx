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
  Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type OutputFormat = 'jpeg' | 'png' | 'webp';
type Unit = 'px' | 'mm' | 'inch';

const GOVT_PRESETS = [
  { label: 'Photo (SSC/UPSC)', width: 200, height: 230, format: 'jpeg' as OutputFormat, icon: User },
  { label: 'Signature (SSC)', width: 140, height: 60, format: 'jpeg' as OutputFormat, icon: PenTool },
  { label: 'Photo (IBPS)', width: 212, height: 272, format: 'jpeg' as OutputFormat, icon: User },
  { label: 'Signature (IBPS)', width: 140, height: 60, format: 'jpeg' as OutputFormat, icon: PenTool },
];

const DPI = 96; 

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function ImageResizer() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resizedImageSrc, setResizedImageSrc] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [resizedFileSize, setResizedFileSize] = useState<number>(0);
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
    return px;
  };

  const convertUnitToPx = (val: number, currentUnit: Unit) => {
    if (currentUnit === 'px') return val;
    if (currentUnit === 'inch') return Math.round(val * DPI);
    if (currentUnit === 'mm') return Math.round(val * (DPI / 25.4));
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

      let curCanvas: HTMLCanvasElement | HTMLImageElement = img;
      let stepW = img.width;
      let stepH = img.height;
      
      while (stepW > targetWidth * 2) {
          const nextW = Math.floor(stepW / 2);
          const nextH = Math.floor(stepH / 2);
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

        const amount = 0.08; 
        const weights = [0, -amount, 0, -amount, 4 * amount + 1, -amount, 0, -amount, 0];
        const imageData = finalCtx.getImageData(0, 0, targetWidth, targetHeight);
        const pixels = imageData.data;
        const output = finalCtx.createImageData(targetWidth, targetHeight);
        const dst = output.data;

        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < targetWidth; x++) {
                const sy = y;
                const sx = x;
                const dstOff = (y * targetWidth + x) * 4;
                let r = 0, g = 0, b = 0;
                for (let cy = 0; cy < 3; cy++) {
                    for (let cx = 0; cx < 3; cx++) {
                        const scy = Math.min(targetHeight - 1, Math.max(0, sy + cy - 1));
                        const scx = Math.min(targetWidth - 1, Math.max(0, sx + cx - 1));
                        const srcOff = (scy * targetWidth + scx) * 4;
                        const wt = weights[cy * 3 + cx];
                        r += pixels[srcOff] * wt;
                        g += pixels[srcOff + 1] * wt;
                        b += pixels[srcOff + 2] * wt;
                    }
                }
                dst[dstOff] = r;
                dst[dstOff + 1] = g;
                dst[dstOff + 2] = b;
                dst[dstOff + 3] = pixels[dstOff + 3]; 
            }
        }
        finalCtx.putImageData(output, 0, 0);

        const mimeType = `image/${outputFormat}`;
        const resizedDataUrl = finalCanvas.toDataURL(mimeType, 1.0); 
        
        const blob = await (await fetch(resizedDataUrl)).blob();
        setResizedFileSize(blob.size);
        setResizedImageSrc(resizedDataUrl);
      }
      
      setIsProcessing(false);
      toast({ title: "Resized!", description: "Ultra-sharp HD re-sampling applied." });
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
    const nameParts = imageFile.name.split(".");
    const name = nameParts.slice(0, -1).join(".");
    link.download = `${name}-resized.${outputFormat}`;
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
    setResizedFileSize(0);
    setNewDimensions({ width: '', height: '' });
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!originalImageSrc) {
    return (
      <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
            <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
                <Scaling className="size-8" />
                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <Sparkles className="size-2.5" />
                </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                Image <span className="text-gradient-hero">Resizer Studio</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                Precision dimensions for official documents. <br/>100% Private local HD resampling.
            </p>
        </div>

        <Card className={cn(
            "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20",
            isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
        )}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        >
            <CardHeader className="bg-muted/30 border-b p-6 text-center">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
                <div 
                    className={cn(
                        "border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="relative">
                        <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Zap className="absolute -top-2 -right-2 size-6 md:size-8 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-black uppercase tracking-tighter">Drop Photo here to Begin</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-bold opacity-60">100% Private local RAM processing.</p>
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
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4 pb-20">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-2 shadow-xl border-primary/10 overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-slate-950">
              <CardHeader className="bg-primary/5 border-b p-4">
                  <CardTitle className="text-sm flex items-center gap-2 font-black uppercase tracking-tighter text-primary">
                    <Briefcase className="h-4 w-4" /> GOVT JOB PRESETS
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {GOVT_PRESETS.map((preset) => (
                      <Button key={preset.label} variant="outline" className="h-auto flex-row items-center justify-start p-3 gap-3 hover:border-primary hover:bg-primary/5 border-2 rounded-xl transition-all" onClick={() => applyPreset(preset)}>
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <preset.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left overflow-hidden">
                            <div className="text-[9px] font-black uppercase tracking-tight truncate">{preset.label}</div>
                            <span className="text-[8px] text-muted-foreground font-mono">{preset.width}x{preset.height} px</span>
                        </div>
                      </Button>
                    ))}
                  </div>
              </CardContent>
          </Card>

          <Card className="border-2 shadow-xl overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-slate-950">
              <CardHeader className="bg-muted/30 border-b p-4">
                  <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                    <Settings2 className="h-4 w-4" /> Dimension Settings
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Select Unit</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['px', 'mm', 'inch'] as Unit[]).map((u) => (
                            <Button key={u} variant={unit === u ? "default" : "outline"} className="h-10 text-[10px] font-black rounded-xl border-2" onClick={() => handleUnitChange(u)}>
                                {u.toUpperCase()}
                            </Button>
                        ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 items-center">
                      <div className="space-y-2">
                          <Label htmlFor="width" className="text-[10px] font-black uppercase opacity-60">Width ({unit})</Label>
                          <Input id="width" name="width" type="number" step={unit === 'px' ? '1' : '0.1'} value={newDimensions.width} onChange={handleDimensionChange} disabled={isProcessing} className="h-12 text-lg font-black border-2 rounded-xl bg-muted/20" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="height" className="text-[10px] font-black uppercase opacity-60">Height ({unit})</Label>
                          <Input id="height" name="height" type="number" step={unit === 'px' ? '1' : '0.1'} value={newDimensions.height} onChange={handleDimensionChange} disabled={isProcessing} className="h-12 text-lg font-black border-2 rounded-xl bg-muted/20" />
                      </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-xl border">
                      <Checkbox id="aspect-ratio" checked={maintainAspectRatio} onCheckedChange={(checked) => setMaintainAspectRatio(Boolean(checked))} className="size-4" />
                      <Label htmlFor="aspect-ratio" className="text-[10px] font-black cursor-pointer uppercase opacity-60">Lock Aspect Ratio</Label>
                  </div>
                  <div className="space-y-3 border-t pt-4 border-dashed">
                      <Label htmlFor="format" className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Output Format</Label>
                      <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)} disabled={isProcessing}>
                          <SelectTrigger id="format" className="h-11 font-black text-xs border-2 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl border-2 shadow-2xl">
                              <SelectItem value="jpeg" className="font-bold py-2">JPEG (Universal HD)</SelectItem>
                              <SelectItem value="png" className="font-bold py-2">PNG (Lossless Extraction)</SelectItem>
                              <SelectItem value="webp" className="font-bold py-2">WEBP (Modern Optimization)</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 bg-muted/20 p-6 border-t border-dashed">
                  <Button className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all active:scale-95 disabled:opacity-50" onClick={handleResize} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Maximize className="mr-3 h-6 w-6" />}
                      {isProcessing ? "PROCESSING..." : "RESIZE IMAGE"}
                  </Button>
                  <Button variant="ghost" onClick={handleReset} className="w-full text-[10px] font-black uppercase tracking-widest h-10 hover:bg-destructive/5 hover:text-destructive" disabled={isProcessing}>
                      <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Start Over
                  </Button>
              </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
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
                                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-6 md:p-10">
                                    <DialogHeader><DialogTitle className="uppercase font-black tracking-tighter text-lg md:text-2xl">HD Pixel Proof Analysis</DialogTitle></DialogHeader>
                                    <div className="grid md:grid-cols-2 gap-8 py-8">
                                        <div className="space-y-4">
                                            <Badge variant="outline" className="w-full justify-center py-2 font-black uppercase text-[11px] border-2">ORIGINAL CANVAS</Badge>
                                            <div className="aspect-square relative rounded-2xl overflow-hidden border-2 bg-white flex items-center justify-center shadow-inner">
                                                <Image src={originalImageSrc!} alt="original" fill className="object-contain p-4" />
                                            </div>
                                        </div>
                                        <div className="space-y-4 text-right">
                                            <Badge className="w-full justify-center bg-primary py-2 font-black uppercase text-[11px] border-2 border-white shadow-lg">RESIZED HD RENDER</Badge>
                                            <div className="aspect-square relative rounded-2xl overflow-hidden border-2 border-primary/20 bg-white flex items-center justify-center shadow-2xl">
                                                <Image src={resizedImageSrc!} alt="resized" fill className="object-contain p-4" />
                                            </div>
                                        </div>
                                    </div>
                                    <CardFooter className="p-0 pt-4">
                                        <Button className="w-full h-16 md:h-20 bg-green-600 hover:bg-green-700 font-black text-lg md:text-xl rounded-2xl shadow-2xl" onClick={handleDownload}>
                                            SAVE SHARP IMAGE <Download className="ml-3 size-6 md:size-7" />
                                        </Button>
                                    </CardFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-6 md:p-10 lg:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner">
                    {isProcessing ? (
                        <div className="h-full flex flex-col items-center justify-center gap-8 py-20">
                            <div className="relative">
                                <Loader2 className="h-20 w-20 animate-spin text-primary opacity-20 stroke-[3]" />
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
                                <div className="relative aspect-[3/4] bg-white rounded-[2rem] border-2 shadow-inner flex items-center justify-center overflow-hidden group">
                                    <Image src={originalImageSrc} alt="Before" fill className="object-contain p-6 grayscale opacity-40 transition-all group-hover:grayscale-0 group-hover:opacity-100" />
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-4 py-1 rounded-full font-mono text-[10px]">{originalDimensions?.width}x{originalDimensions?.height}</div>
                                </div>
                            </div>
                            <div className="space-y-4 flex flex-col h-full justify-center">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5"><Sparkles className="size-3"/> Target Render</span>
                                    {resizedImageSrc && <span className="text-[10px] font-mono font-black text-primary">{formatBytes(resizedFileSize)}</span>}
                                </div>
                                <div className="relative aspect-[3/4] bg-white rounded-[2rem] border-4 border-primary/20 shadow-2xl flex items-center justify-center overflow-hidden">
                                    {resizedImageSrc ? (
                                        <div className="relative size-full animate-in zoom-in-95 duration-500 p-2">
                                            <Image src={resizedImageSrc} alt="After" fill className="object-contain p-4" />
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
                <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8">
                    <Button className="w-full h-16 md:h-20 text-lg md:text-2xl font-black bg-green-600 hover:bg-green-700 shadow-2xl rounded-2xl md:rounded-[1.5rem] transition-all active:scale-95 group" onClick={handleDownload} disabled={!resizedImageSrc || isProcessing}>
                        <Download className="mr-4 h-7 w-7 md:h-9 md:w-9 group-hover:translate-y-1 transition-transform" /> SAVE PROFESSIONAL IMAGE
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
      
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

