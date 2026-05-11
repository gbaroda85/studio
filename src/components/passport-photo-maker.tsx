
"use client";

import React, { useState, useRef, type ChangeEvent, type DragEvent, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
    UploadCloud, 
    Download, 
    Crop as CropIcon, 
    RefreshCcw, 
    Contact, 
    Maximize, 
    Settings2, 
    CheckCircle2, 
    ShieldCheck,
    Printer,
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

type Unit = 'cm' | 'mm' | 'inch' | 'px';

interface PhotoSize {
    label: string;
    width: number;
    height: number;
    unit: Unit;
    description: string;
}

const PRESETS: PhotoSize[] = [
    { label: "India, Europe, UK", width: 3.5, height: 4.5, unit: 'cm', description: "3.5 CM x 4.5 CM" },
    { label: "USA, Philippines", width: 2, height: 2, unit: 'inch', description: "2 Inch x 2 Inch" },
    { label: "Canada", width: 5, height: 7, unit: 'cm', description: "5 CM x 7 CM" },
];

export default function PassportPhotoMaker() {
  const { toast } = useToast();
  const [imgSrc, setImgSrc] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Settings
  const [dpi, setDPI] = useState(300);
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(0);
  const [customWidth, setCustomWidth] = useState("3.5");
  const [customHeight, setCustomHeight] = useState("4.5");
  const [customUnit, setCustomUnit] = useState<Unit>('cm');

  // Crop States
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate Aspect Ratio based on settings
  const getAspectRatio = () => {
      let w, h;
      if (selectedPreset === 'custom') {
          w = parseFloat(customWidth);
          h = parseFloat(customHeight);
      } else {
          w = PRESETS[selectedPreset].width;
          h = PRESETS[selectedPreset].height;
      }
      return w / h;
  };

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setResultImage(null);
      const reader = new FileReader();
      reader.onload = () => setImgSrc(reader.result?.toString() || '');
      reader.readAsDataURL(file);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const aspect = getAspectRatio();
    const initialCrop = centerCrop(
        makeAspectCrop({ unit: '%', width: 80 }, aspect, width, height),
        width,
        height
    );
    setCrop(initialCrop);
  }

  // Update crop when aspect ratio settings change
  useEffect(() => {
    if (imgRef.current && imgSrc) {
        const { width, height } = imgRef.current;
        const aspect = getAspectRatio();
        const newCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 80 }, aspect, width, height),
            width,
            height
        );
        setCrop(newCrop);
    }
  }, [selectedPreset, customWidth, customHeight, customUnit, imgSrc]);

  const unitToInches = (val: number, unit: Unit): number => {
      if (unit === 'cm') return val / 2.54;
      if (unit === 'mm') return val / 25.4;
      if (unit === 'px') return val / dpi;
      return val;
  };

  const handleGenerate = async () => {
    if (!imgRef.current || !completedCrop) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Target dimensions in pixels based on DPI
    let targetW, targetH;
    if (selectedPreset === 'custom') {
        targetW = unitToInches(parseFloat(customWidth), customUnit) * dpi;
        targetH = unitToInches(parseFloat(customHeight), customUnit) * dpi;
    } else {
        const p = PRESETS[selectedPreset];
        targetW = unitToInches(p.width, p.unit) * dpi;
        targetH = unitToInches(p.height, p.unit) * dpi;
    }

    canvas.width = targetW;
    canvas.height = targetH;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      targetW,
      targetH
    );

    setResultImage(canvas.toDataURL('image/jpeg', 0.95));
    setIsProcessing(false);
    toast({ title: "Photo Generated!", description: "Check the preview and download." });
  };

  const handleDownload = () => {
      if (!resultImage) return;
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `passport-photo-${Date.now()}.jpg`;
      link.click();
  };

  if (!imgSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0]); }}
      >
        <CardHeader>
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Contact className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-black">Passport Photo Maker</CardTitle>
          <CardDescription>Create official passport size photos with country presets and custom DPI.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
                <p className="text-xl font-bold">Drop photo or Click to start</p>
                <p className="text-sm text-muted-foreground mt-2">Privacy-first local processing.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
        </CardContent>
        <CardFooter className="justify-center gap-6 text-[10px] text-muted-foreground font-black pb-8">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> 100% PRIVATE</div>
            <div className="flex items-center gap-2"><Printer className="h-4 w-4 text-primary" /> PRINT READY</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-500">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Editor Area */}
        <div className="lg:col-span-8 space-y-6">
            <Card className="overflow-hidden border-2 shadow-2xl">
                <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <CropIcon className="h-4 w-4" /> 
                        {resultImage ? "Final Result" : "Adjust Face Area"}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => { setImgSrc(''); setResultImage(null); }} className="h-8 text-[10px] font-black border-2">
                        <RefreshCcw className="mr-1 h-3 w-3" /> CHANGE PHOTO
                    </Button>
                </CardHeader>
                <CardContent className="p-8 bg-slate-50 flex items-center justify-center min-h-[500px]">
                    {resultImage ? (
                        <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-300">
                             <div className="p-4 bg-white shadow-2xl rounded-lg ring-1 ring-black/5">
                                <img src={resultImage} alt="Passport Result" className="shadow-lg border" />
                             </div>
                             <div className="flex gap-4">
                                <Button variant="outline" size="lg" onClick={() => setResultImage(null)} className="h-14 px-8 border-2 font-black">
                                    <RefreshCcw className="mr-2 h-4 w-4" /> RE-ADJUST
                                </Button>
                                <Button size="lg" onClick={handleDownload} className="h-14 px-12 bg-green-600 hover:bg-green-700 text-white font-black shadow-xl">
                                    <Download className="mr-2 h-5 w-5" /> DOWNLOAD JPG
                                </Button>
                             </div>
                        </div>
                    ) : (
                        <div className="max-w-full overflow-hidden">
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={getAspectRatio()}
                                circularCrop={false}
                                keepSelection
                            >
                                <img
                                    ref={imgRef}
                                    src={imgSrc}
                                    alt="Source"
                                    onLoad={onImageLoad}
                                    className="max-h-[65vh] w-auto object-contain"
                                />
                            </ReactCrop>
                        </div>
                    )}
                </CardContent>
                {!resultImage && (
                    <CardFooter className="bg-primary/5 border-t p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground max-w-[300px]">
                                Drag the crop box to center the head and shoulders. The ratio is locked for your selected size.
                            </p>
                        </div>
                        <Button size="lg" onClick={handleGenerate} disabled={!completedCrop || isProcessing} className="w-full sm:w-auto h-14 px-12 font-black bg-primary hover:bg-primary/90 shadow-xl">
                            {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <CheckCircle2 className="mr-2" />}
                            GENERATE PHOTO
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>

        {/* Configuration Panel */}
        <div className={cn("lg:col-span-4 space-y-6 transition-all", resultImage && "opacity-30 pointer-events-none")}>
            <Card className="border-2 shadow-xl border-primary/10">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-primary" /> Size Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Select Size Preset</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {PRESETS.map((p, idx) => (
                                <button
                                    key={p.label}
                                    onClick={() => setSelectedPreset(idx)}
                                    className={cn(
                                        "flex flex-col p-4 rounded-xl border-2 transition-all text-left",
                                        selectedPreset === idx ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-transparent bg-muted/50 hover:bg-muted"
                                    )}
                                >
                                    <span className="font-bold text-sm">{p.label}</span>
                                    <span className="text-[10px] font-black text-primary uppercase mt-1">{p.description}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => setSelectedPreset('custom')}
                                className={cn(
                                    "flex flex-col p-4 rounded-xl border-2 transition-all text-left",
                                    selectedPreset === 'custom' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-transparent bg-muted/50 hover:bg-muted"
                                )}
                            >
                                <span className="font-bold text-sm">Custom Size</span>
                                <span className="text-[10px] font-black text-muted-foreground uppercase mt-1">Manual dimensions</span>
                            </button>
                        </div>
                    </div>

                    {selectedPreset === 'custom' && (
                        <div className="p-4 bg-muted/30 rounded-xl space-y-4 animate-in slide-in-from-top-2">
                             <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold">Width</Label>
                                    <Input value={customWidth} onChange={(e) => setCustomWidth(e.target.value)} type="number" className="h-10 font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold">Height</Label>
                                    <Input value={customHeight} onChange={(e) => setCustomHeight(e.target.value)} type="number" className="h-10 font-bold" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[10px] font-bold">Unit</Label>
                                <Select value={customUnit} onValueChange={(v) => setCustomUnit(v as Unit)}>
                                    <SelectTrigger className="h-10 font-bold"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cm" className="font-bold">Centimeters (CM)</SelectItem>
                                        <SelectItem value="mm" className="font-bold">Millimeters (MM)</SelectItem>
                                        <SelectItem value="inch" className="font-bold">Inches (IN)</SelectItem>
                                        <SelectItem value="px" className="font-bold">Pixels (PX)</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>
                    )}

                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                             <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
                                <Maximize className="size-3" /> Output Resolution
                            </Label>
                            <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-primary">{dpi} DPI</span>
                        </div>
                        <Select value={String(dpi)} onValueChange={(v) => setDPI(Number(v))}>
                            <SelectTrigger className="h-12 font-bold border-2"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="300" className="font-bold">300 DPI (Standard Print)</SelectItem>
                                <SelectItem value="600" className="font-bold">600 DPI (Ultra Clear)</SelectItem>
                                <SelectItem value="150" className="font-bold">150 DPI (Fast Load)</SelectItem>
                                <SelectItem value="72" className="font-bold">72 DPI (Web Only)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[9px] text-muted-foreground leading-relaxed">
                            <span className="text-primary font-bold">Tip:</span> Use 300 DPI for high-quality official document prints.
                        </p>
                    </div>

                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
