
"use client";

import React, { useState, useRef, type ChangeEvent, type DragEvent, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    UploadCloud, 
    Download, 
    Crop as CropIcon, 
    RotateCw, 
    RefreshCcw, 
    FlipHorizontal, 
    FlipVertical,
    Move,
    Scan,
    Grid3X3,
    Maximize,
    X,
    Loader2,
    ShieldCheck,
    Zap,
    ArrowLeftRight,
    Search,
    ChevronRight,
    Undo2,
    Palette,
    Settings2,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

type OutputFormat = 'jpeg' | 'png' | 'webp';
type CropMode = 'rectangular' | 'perspective';

interface Point {
    x: number;
    y: number;
}

const ASPECT_RATIOS = [
    { label: 'Original', value: 0 },
    { label: 'Square (1:1)', value: 1 },
    { label: 'Portrait (2:3)', value: 2/3 },
    { label: 'Standard (4:3)', value: 4/3 },
    { label: 'Widescreen (16:9)', value: 16/9 },
];

export default function ImageCropper() {
  const { toast } = useToast();
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [croppedImageSrc, setCroppedImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropMode, setCropMode] = useState<CropMode>('rectangular');
  
  // Rectangular Mode States
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [rotate, setRotate] = useState(0); 
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Perspective Mode States (8-Dot Magnet Logic)
  const [points, setPoints] = useState<Point[]>([
    { x: 15, y: 15 }, { x: 50, y: 15 }, { x: 85, y: 15 }, 
    { x: 85, y: 50 }, { x: 85, y: 85 },                   
    { x: 50, y: 85 }, { x: 15, y: 85 },                   
    { x: 15, y: 50 }                                      
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setCrop(undefined);
      setCroppedImageSrc(null);
      setRotate(0); setFlipH(false); setFlipV(false);
      setImgSrc(null);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || null));
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select an image file.' });
    }
  };
  
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const handleAspectChange = (value: number) => {
      setAspect(value === 0 ? undefined : value);
      if (imgRef.current) {
          const { width, height } = imgRef.current;
          const newCrop = value === 0 
            ? centerCrop({ unit: '%', width: 90, height: 90 }, width, height)
            : centerCrop(makeAspectCrop({ unit: '%', width: 90 }, value, width, height), width, height);
          setCrop(newCrop);
      }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    if (cropMode === 'rectangular') {
        const initialCrop = aspect 
            ? centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height)
            : centerCrop({ unit: '%', width: 90, height: 90 }, width, height);
        setCrop(initialCrop);
    } else {
        setPoints([
            { x: 15, y: 15 }, { x: 50, y: 15 }, { x: 85, y: 15 },
            { x: 85, y: 50 }, { x: 85, y: 85 },
            { x: 50, y: 85 }, { x: 15, y: 85 },
            { x: 15, y: 50 }
        ]);
    }
  }

  const solvePerspective = (src: Point[], dst: Point[]) => {
    const p = [];
    for (let i = 0; i < 4; i++) {
        p.push([src[i].x, src[i].y, 1, 0, 0, 0, -src[i].x * dst[i].x, -src[i].y * dst[i].x, dst[i].x]);
        p.push([0, 0, 0, src[i].x, src[i].y, 1, -src[i].x * dst[i].y, -src[i].y * dst[i].y, dst[i].y]);
    }
    const n = 8;
    for (let i = 0; i < n; i++) {
        let max = i;
        for (let j = i + 1; j < n; j++) if (Math.abs(p[j][i]) > Math.abs(p[max][i])) max = j;
        const temp = p[i]; p[i] = p[max]; p[max] = temp;
        for (let j = i + 1; j < n; j++) {
            const f = p[j][i] / p[i][i];
            for (let k = i; k <= n; k++) p[j][k] -= f * p[i][k];
        }
    }
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        let s = 0;
        for (let j = i + 1; j < n; j++) s += p[i][j] * x[j];
        x[i] = (p[i][n] - s) / p[i][i];
    }
    return x;
  };

  const handleApplyCrop = async () => {
    const image = imgRef.current;
    if (!image || !image.naturalWidth) return;
    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (cropMode === 'perspective') {
        const w1 = Math.hypot(points[2].x - points[0].x, points[2].y - points[0].y);
        const w2 = Math.hypot(points[4].x - points[6].x, points[4].y - points[6].y);
        const h1 = Math.hypot(points[6].x - points[0].x, points[6].y - points[0].y);
        const h2 = Math.hypot(points[4].x - points[2].x, points[4].y - points[2].y);
        
        const targetWidth = Math.max(10, Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100)));
        let targetHeight = Math.max(10, Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100)));

        if (aspect) {
            targetHeight = targetWidth / aspect;
        }

        canvas.width = targetWidth; canvas.height = targetHeight;

        const srcPoints = [points[0], points[2], points[4], points[6]].map(p => ({ 
            x: p.x * (image.naturalWidth / 100), 
            y: p.y * (image.naturalHeight / 100) 
        }));
        const dstPoints = [{ x: 0, y: 0 }, { x: targetWidth, y: 0 }, { x: targetWidth, y: targetHeight }, { x: 0, y: targetHeight }];
        
        const h = solvePerspective(dstPoints, srcPoints);
        const imgData = ctx.createImageData(targetWidth, targetHeight);
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = image.naturalWidth; srcCanvas.height = image.naturalHeight;
        const srcCtx = srcCanvas.getContext('2d');
        if (srcCtx) {
            srcCtx.save();
            srcCtx.translate(srcCanvas.width / 2, srcCanvas.height / 2);
            srcCtx.rotate((rotate * Math.PI) / 180);
            srcCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
            srcCtx.translate(-srcCanvas.width / 2, -srcCanvas.height / 2);
            srcCtx.drawImage(image, 0, 0);
            srcCtx.restore();
        }
        
        const srcPixels = srcCtx?.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;

        if (srcPixels) {
            for (let y = 0; y < targetHeight; y++) {
                for (let x = 0; x < targetWidth; x++) {
                    const z = h[6] * x + h[7] * y + 1;
                    const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
                    const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
                    if (sx >= 0 && sx < image.naturalWidth && sy >= 0 && sy < image.naturalHeight) {
                        const dstIdx = (y * targetWidth + x) * 4;
                        const srcIdx = (sy * image.naturalWidth + sx) * 4;
                        imgData.data[dstIdx] = srcPixels[srcIdx];
                        imgData.data[dstIdx+1] = srcPixels[srcIdx+1];
                        imgData.data[dstIdx+2] = srcPixels[srcIdx+2];
                        imgData.data[dstIdx+3] = srcPixels[srcIdx+3];
                    }
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }
    } else {
        if (!completedCrop) return;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
        
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        
        ctx.drawImage(
            image, 
            completedCrop.x * scaleX, 
            completedCrop.y * scaleY, 
            completedCrop.width * scaleX, 
            completedCrop.height * scaleY, 
            0, 0, canvas.width, canvas.height
        );
        ctx.restore();
    }
    setCroppedImageSrc(canvas.toDataURL(`image/${outputFormat}`, 0.95));
    setIsProcessing(false);
    toast({ title: "Crop Successful" });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current || !points[draggingPoint]) return;
    if (e.cancelable) e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    let cx, cy;
    if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }

    const x = Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((cy - rect.top) / rect.height) * 100));

    setMagnifierPos({ x, y });
    setPoints(prev => {
        const next = [...prev];
        const idx = draggingPoint;
        if (idx === null || !next[idx]) return prev;

        if ([0, 2, 4, 6].includes(idx)) next[idx] = { x, y };
        else {
            if (idx === 1) { next[0].y = y; next[2].y = y; } 
            else if (idx === 3) { next[2].x = x; next[4].x = x; } 
            else if (idx === 5) { next[6].y = y; next[4].y = y; } 
            else if (idx === 7) { next[0].x = x; next[6].x = x; } 
        }
        next[1] = { x: (next[0].x + next[2].x) / 2, y: (next[0].y + next[2].y) / 2 };
        next[3] = { x: (next[2].x + next[4].x) / 2, y: (next[2].y + next[4].y) / 2 };
        next[5] = { x: (next[4].x + next[6].x) / 2, y: (next[4].y + next[6].y) / 2 };
        next[7] = { x: (next[6].x + next[0].x) / 2, y: (next[6].y + next[0].y) / 2 };
        return next;
    });
  }, [draggingPoint, points]);

  const handlePointDown = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
      setDraggingPoint(idx);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      let cx, cy;
      if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
      else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }
      setMagnifierPos({ x: ((cx - rect.left) / rect.width) * 100, y: ((cy - rect.top) / rect.height) * 100 });
  };

  if (!imgSrc) {
    return (
      <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
            <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
                <Maximize className="size-8" />
                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <Sparkles className="size-2.5" />
                </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                Image <span className="text-gradient-hero">Cropper Studio</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                Precision cropping with 8-dot smart scanner. <br/>100% Private local mapping.
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
                <div className="flex items-center gap-1.5"><Eye className="size-3 text-primary" /> VISUAL EDIT</div>
                <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT CROP</div>
            </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-7xl shadow-2xl border-foreground/10 overflow-hidden bg-card/50">
      <CardHeader className="bg-muted/30 border-b flex flex-col md:flex-row items-center justify-between p-4 md:p-6 gap-4">
        <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg"><Settings2 className="size-5" /></div>
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Studio Panel</CardTitle>
        </div>
        <div className="flex items-center gap-3 bg-background/50 p-1 rounded-xl border-2">
            <Tabs value={cropMode} onValueChange={(v) => { setCropMode(v as CropMode); setCroppedImageSrc(null); }} className="p-0">
                <TabsList className="h-9 bg-transparent"><TabsTrigger value="rectangular" className="text-[10px] font-black px-4"><Maximize className="size-3.5 mr-1.5" /> RECT</TabsTrigger><TabsTrigger value="perspective" className="text-[10px] font-black px-4"><Scan className="size-3.5 mr-1.5" /> SCAN</TabsTrigger></TabsList>
            </Tabs>
            <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-destructive/5 text-destructive" onClick={() => setImgSrc(null)}><X className="size-4"/></Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-12">
            {/* Sidebar: Controls */}
            <div className="lg:col-span-3 border-r bg-muted/20 p-6 space-y-8 no-print">
                <div className="space-y-6 animate-in slide-in-from-left duration-300">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Grid3X3 className="size-3" /> Aspect Ratio
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            {ASPECT_RATIOS.map((r) => (
                                <Button 
                                    key={r.label} 
                                    variant="outline" 
                                    className={cn("h-10 text-[9px] font-black border-2 rounded-xl", (aspect === r.value || (r.value === 0 && aspect === undefined)) ? "border-primary bg-primary/5" : "")}
                                    onClick={() => handleAspectChange(r.value)}
                                >
                                    {r.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-dashed">
                         <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Rotation</Label>
                            <Badge variant="secondary" className="font-mono text-[10px]">{rotate}°</Badge>
                         </div>
                         <Slider min={-180} max={180} step={1} value={[rotate]} onValueChange={(v) => setRotate(v[0])} className="py-2" />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" className={cn("flex-1 h-10 border-2 rounded-xl", flipH && "bg-primary/10 border-primary")} onClick={() => setFlipH(!flipH)}>
                            <FlipHorizontal className="size-4 mr-2" /> <span className="text-[9px] font-black uppercase">Flip H</span>
                        </Button>
                        <Button variant="outline" className={cn("flex-1 h-10 border-2 rounded-xl", flipV && "bg-primary/10 border-primary")} onClick={() => setFlipV(!flipV)}>
                            <FlipVertical className="size-4 mr-2" /> <span className="text-[9px] font-black uppercase">Flip V</span>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-dashed">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Target Format</Label>
                    <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                        <SelectTrigger className="h-12 font-bold border-2 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="font-bold border-2">
                            <SelectItem value="jpeg">JPG (Universal)</SelectItem>
                            <SelectItem value="png">PNG (Lossless)</SelectItem>
                            <SelectItem value="webp">WEBP (Modern)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="pt-4">
                    <Button className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all active:scale-95 group" onClick={handleApplyCrop} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <CropIcon className="mr-2 group-hover:scale-125 transition-transform" />} 
                        CROP & SAVE
                    </Button>
                </div>
                
                <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 flex gap-4">
                    <ShieldCheck className="size-5 text-primary shrink-0" />
                    <p className="text-[9px] text-primary/80 font-bold leading-relaxed uppercase">
                        All work happens in your device memory. Zero server uploads.
                    </p>
                </div>
            </div>

            {/* Main Viewport */}
            <div className="lg:col-span-9 bg-slate-200 dark:bg-slate-900 flex items-center justify-center p-4 md:p-12 relative min-h-[500px] md:min-h-[700px]"
                 onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                
                {croppedImageSrc ? (
                    <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
                        <div className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[8px] border-white rounded-lg bg-white overflow-hidden max-w-[90vw]">
                            <img src={croppedImageSrc} alt="result" className="max-h-[60vh] w-auto block" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <Button variant="outline" className="h-14 px-8 border-2 font-black uppercase text-xs rounded-xl hover:bg-destructive/5 hover:text-destructive" onClick={() => setCroppedImageSrc(null)}>
                                <RefreshCcw className="mr-2 size-4" /> Start Over
                            </Button>
                            <Button className="h-14 px-12 bg-green-600 hover:bg-green-700 font-black text-lg shadow-xl rounded-xl flex-1" onClick={() => { const l=document.createElement('a'); l.href=croppedImageSrc; l.download=`crop-${Date.now()}.${outputFormat}`; l.click(); }}>
                                <Download className="mr-2 size-6" /> DOWNLOAD HD
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div ref={containerRef} className="relative shadow-2xl border-4 border-white transform-gpu bg-white max-w-[95vw]">
                        {cropMode === 'rectangular' ? (
                            <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={c => setCompletedCrop(c)} aspect={aspect}>
                                <img ref={imgRef} src={imgSrc} alt="rect" className="max-h-[75vh] w-auto block" onLoad={onImageLoad} 
                                     style={{ transform: `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`, transition: 'transform 0.2s ease-out' }} />
                            </ReactCrop>
                        ) : (
                            <div className="relative">
                                <img ref={imgRef} src={imgSrc} alt="scan" className="max-h-[75vh] w-auto pointer-events-none block" onLoad={onImageLoad} 
                                     style={{ transform: `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`, transition: 'transform 0.2s ease-out' }} />
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <polygon points={`${points[0].x},${points[0].y} ${points[2].x},${points[2].y} ${points[4].x},${points[4].y} ${points[6].x},${points[6].y}`} className="fill-primary/20 stroke-primary stroke-[0.6] dash-array-[5,5]" />
                                </svg>
                                {points.map((p, i) => (
                                    <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-2xl cursor-grab transition-transform z-20 flex items-center justify-center", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/90")}
                                        style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }} onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}>
                                        <div className="size-2.5 bg-white rounded-full" />
                                    </div>
                                ))}
                                {draggingPoint !== null && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 md:size-48 rounded-full border-4 border-green-500 shadow-3xl bg-white ring-4 ring-white/50 animate-in zoom-in-50">
                                        <img src={imgSrc} alt="mag" className="absolute max-w-none origin-top-left" style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)`, transform: `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})` }} />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-full h-0.5 bg-green-500/40 absolute" />
                                            <div className="h-full w-0.5 bg-green-500/40 absolute" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 bg-black/80 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl whitespace-nowrap">
                            <Move className="size-3.5 text-primary animate-pulse" /> {cropMode === 'rectangular' ? "Position Crop Box" : "Drag 4 corners to fit edges"}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
