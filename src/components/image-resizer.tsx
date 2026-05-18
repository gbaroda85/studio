
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from "react";
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

type OutputFormat = 'jpeg' | 'png' | 'webp';
type Unit = 'px' | 'mm' | 'inch';

const GOVT_PRESETS = [
  { label: 'Photo (SSC/UPSC)', width: 200, height: 230, format: 'jpeg' as OutputFormat, icon: User },
  { label: 'Signature (SSC)', width: 140, height: 60, format: 'jpeg' as OutputFormat, icon: PenTool },
  { label: 'Photo (IBPS)', width: 212, height: 272, format: 'jpeg' as OutputFormat, icon: User },
  { label: 'Signature (IBPS)', width: 140, height: 60, format: 'jpeg' as OutputFormat, icon: PenTool },
];

const DPI = 96; // Standard web DPI

export default function ImageResizer() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resizedImageSrc, setResizedImageSrc] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [newDimensions, setNewDimensions] = useState({ width: '', height: '' });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [unit, setUnit] = useState<Unit>('px');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Conversion logic
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
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a valid image file.",
      });
    }
  };
  
  const applyPreset = (preset: typeof GOVT_PRESETS[0]) => {
    setUnit('px'); // Presets are always in pixels
    setNewDimensions({ width: String(preset.width), height: String(preset.height) });
    setOutputFormat(preset.format);
    setMaintainAspectRatio(false);
    toast({
      title: "Preset Applied",
      description: `${preset.label} dimensions set to ${preset.width}x${preset.height} px.`,
    });
  };

  const handleUnitChange = (newUnit: Unit) => {
    if (!originalDimensions) {
        setUnit(newUnit);
        return;
    }
    
    // Convert current values to new unit
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
    img.onload = () => {
      const targetWidthPx = convertUnitToPx(parseFloat(newDimensions.width), unit);
      const targetHeightPx = convertUnitToPx(parseFloat(newDimensions.height), unit);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidthPx;
      canvas.height = targetHeightPx;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        toast({ variant: "destructive", title: "Error", description: "Could not process image." });
        setIsProcessing(false);
        return;
      }
      
      if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const mimeType = `image/${outputFormat}`;
      const resizedDataUrl = canvas.toDataURL(mimeType, outputFormat === 'jpeg' ? 0.95 : undefined);
      setResizedImageSrc(resizedDataUrl);
      setIsProcessing(false);
      toast({ title: "Resized!", description: `Photo adjusted to ${targetWidthPx}x${targetHeightPx} px.` });
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
    setNewDimensions({ width: '', height: '' });
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!originalImageSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <CardHeader>
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Scaling className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-black">Pro Image Resizer</CardTitle>
          <CardDescription>Resize in Pixels, MM, or Inches. Includes one-click Gov Job presets.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
                <p className="text-xl font-bold">Drop photo here to Resize</p>
                <p className="text-sm text-muted-foreground mt-2">No size limits. Privacy guaranteed.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center gap-6 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8">
            <div className="flex items-center gap-1.5">SSC / UPSC PRESETS</div>
            <div className="flex items-center gap-1.5">MM & INCH SUPPORT</div>
            <div className="flex items-center gap-1.5">100% PRIVATE</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-8 animate-in fade-in duration-500 px-4">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-2 shadow-xl border-primary/10 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="text-sm flex items-center gap-2 font-black uppercase tracking-tighter text-primary">
                    <Briefcase className="h-4 w-4" /> GOVT JOB PRESETS
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                  <div className="grid grid-cols-1 gap-2">
                    {GOVT_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        variant="outline"
                        className="h-auto flex-row items-center justify-start p-3 gap-3 hover:border-primary hover:bg-primary/5 border-2 rounded-xl transition-all"
                        onClick={() => applyPreset(preset)}
                      >
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <preset.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-black uppercase tracking-tight">{preset.label}</div>
                            <span className="text-[10px] text-muted-foreground font-mono">{preset.width}x{preset.height} px</span>
                        </div>
                      </Button>
                    ))}
                  </div>
              </CardContent>
          </Card>

          <Card className="border-2 shadow-xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                    <Settings2 className="h-4 w-4" /> Dimension Settings
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                  {originalDimensions && (
                      <Badge variant="secondary" className="font-mono text-[10px]">Original: {originalDimensions.width}x{originalDimensions.height} px</Badge>
                  )}
                  
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Select Unit</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['px', 'mm', 'inch'] as Unit[]).map((u) => (
                            <Button 
                                key={u} 
                                variant={unit === u ? "default" : "outline"}
                                className="h-10 text-xs font-bold rounded-lg border-2"
                                onClick={() => handleUnitChange(u)}
                            >
                                {u.toUpperCase()}
                            </Button>
                        ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                      <div className="space-y-2">
                          <Label htmlFor="width" className="text-xs font-bold">Width ({unit})</Label>
                          <Input id="width" name="width" type="number" step={unit === 'px' ? '1' : '0.1'} value={newDimensions.width} onChange={handleDimensionChange} disabled={isProcessing} className="h-12 text-lg font-bold border-2" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="height" className="text-xs font-bold">Height ({unit})</Label>
                          <Input id="height" name="height" type="number" step={unit === 'px' ? '1' : '0.1'} value={newDimensions.height} onChange={handleDimensionChange} disabled={isProcessing} className="h-12 text-lg font-bold border-2" />
                      </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-xl">
                      <Checkbox id="aspect-ratio" checked={maintainAspectRatio} onCheckedChange={(checked) => setMaintainAspectRatio(Boolean(checked))} />
                      <Label htmlFor="aspect-ratio" className="text-xs font-bold cursor-pointer">Lock Aspect Ratio</Label>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                      <Label htmlFor="format" className="text-[10px] font-black uppercase text-muted-foreground">Output Format</Label>
                      <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)} disabled={isProcessing}>
                          <SelectTrigger id="format" className="h-12 font-bold border-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="jpeg" className="font-bold">JPEG (For Forms)</SelectItem>
                              <SelectItem value="png" className="font-bold">PNG (Lossless)</SelectItem>
                              <SelectItem value="webp" className="font-bold">WEBP (Optimized)</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 bg-muted/20 p-6 border-t">
                  <Button className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl" onClick={handleResize} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Maximize className="mr-2 h-5 w-5" />}
                      {isProcessing ? "RESIZING..." : "RESIZE IMAGE"}
                  </Button>
                  <Button variant="ghost" onClick={handleReset} className="w-full text-xs font-bold uppercase tracking-widest h-10" disabled={isProcessing}>
                      <X className="mr-2 h-3 w-3" /> Start Over
                  </Button>
              </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
            <Card className="overflow-hidden border-2 shadow-2xl h-full flex flex-col">
                <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <FileImage className="h-4 w-4" /> Result Preview
                    </CardTitle>
                    {resizedImageSrc && <Badge className="bg-green-500 text-white font-black animate-pulse">PROCESSED</Badge>}
                </CardHeader>
                <CardContent className="p-0 flex-1 relative bg-white min-h-[500px] flex items-center justify-center">
                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-16 w-16 animate-spin text-primary stroke-[3]" />
                            <p className="text-sm font-black text-primary uppercase tracking-tighter animate-pulse">Re-sampling Pixels...</p>
                        </div>
                    ) : resizedImageSrc ? (
                        <div className="relative w-full h-full p-8 flex items-center justify-center">
                            <img src={resizedImageSrc} alt="Resized" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                        </div>
                    ) : originalImageSrc ? (
                        <div className="relative w-full h-full p-8 flex items-center justify-center opacity-40 grayscale">
                            <img src={originalImageSrc} alt="Original" className="max-w-full max-h-full object-contain" />
                        </div>
                    ) : (
                        <FileImage className="h-20 w-20 text-muted-foreground/20" />
                    )}
                </CardContent>
                <CardFooter className="bg-muted/10 border-t p-6">
                    <Button className="w-full h-16 text-xl font-black bg-green-600 hover:bg-green-700 shadow-2xl shadow-green-500/20 rounded-2xl" onClick={handleDownload} disabled={!resizedImageSrc || isProcessing}>
                        <Download className="mr-3 h-7 w-7" /> DOWNLOAD RESIZED PHOTO
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
