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
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

type OutputFormat = 'jpeg' | 'png' | 'webp';
type CropMode = 'rectangular' | 'perspective';

interface Point {
    x: number;
    y: number;
}

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

  // Perspective Mode States
  const [points, setPoints] = useState<Point[]>([
      { x: 15, y: 15 }, { x: 85, y: 15 },
      { x: 85, y: 85 }, { x: 15, y: 85 }
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
      setRotate(0);
      setFlipH(false);
      setFlipV(false);
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

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    if (cropMode === 'rectangular') {
        const initialCrop = aspect 
            ? centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height)
            : centerCrop({ unit: '%', width: 90, height: 90 }, width, height);
        setCrop(initialCrop);
    } else {
        setPoints([
            { x: 15, y: 15 }, { x: 85, y: 15 },
            { x: 85, y: 85 }, { x: 15, y: 85 }
        ]);
    }
  }

  const handleAspectChange = (val: string) => {
    const newAspect = val === 'free' ? undefined : parseFloat(val);
    setAspect(newAspect);
    
    if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = newAspect 
            ? centerCrop(makeAspectCrop({ unit: '%', width: 90 }, newAspect, width, height), width, height)
            : centerCrop({ unit: '%', width: 90, height: 90 }, width, height);
        setCrop(newCrop);
    }
  };

  const handleHardRotate = () => {
    if (!imgSrc) return;
    setIsProcessing(true);
    const img = new window.Image();
    img.src = imgSrc;
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
        const newSrc = canvas.toDataURL('image/png');
        setImgSrc(newSrc);
        setCrop(undefined); 
        setIsProcessing(false);
        toast({ title: "Rotated 90°", description: "Source image orientation changed." });
    };
  };

  const handleRotateResult = () => {
    if (!croppedImageSrc) return;
    setIsProcessing(true);
    const img = new window.Image();
    img.src = croppedImageSrc;
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
        const newSrc = canvas.toDataURL(`image/${outputFormat}`, 0.95);
        setCroppedImageSrc(newSrc);
        setIsProcessing(false);
        toast({ title: "Result Rotated", description: "Cropped image turned 90°." });
    };
  };

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

  const applyPerspective = async () => {
    const image = imgRef.current;
    if (!image) return;
    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w1 = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
    const w2 = Math.hypot(points[2].x - points[3].x, points[2].y - points[3].y);
    const h1 = Math.hypot(points[3].x - points[0].x, points[3].y - points[0].y);
    const h2 = Math.hypot(points[2].x - points[1].x, points[2].y - points[1].y);
    const targetWidth = Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100));
    const targetHeight = Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100));
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const srcPoints = points.map(p => ({ x: p.x * (image.naturalWidth / 100), y: p.y * (image.naturalHeight / 100) }));
    const dstPoints = [{ x: 0, y: 0 }, { x: targetWidth, y: 0 }, { x: targetWidth, y: targetHeight }, { x: 0, y: targetHeight }];
    const h = solvePerspective(dstPoints, srcPoints);
    const imgData = ctx.createImageData(targetWidth, targetHeight);
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = image.naturalWidth;
    srcCanvas.height = image.naturalHeight;
    const srcCtx = srcCanvas.getContext('2d');
    srcCtx?.drawImage(image, 0, 0);
    const srcData = srcCtx?.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;
    if (!srcData) return;
    for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
            const z = h[6] * x + h[7] * y + 1;
            const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
            const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
            if (sx >= 0 && sx < image.naturalWidth && sy >= 0 && sy < image.naturalHeight) {
                const dstIdx = (y * targetWidth + x) * 4;
                const srcIdx = (sy * image.naturalWidth + sx) * 4;
                imgData.data[dstIdx] = srcData[srcIdx];
                imgData.data[dstIdx+1] = srcData[srcIdx+1];
                imgData.data[dstIdx+2] = srcData[srcIdx+2];
                imgData.data[dstIdx+3] = srcData[srcIdx+3];
            }
        }
    }
    ctx.putImageData(imgData, 0, 0);
    const result = canvas.toDataURL(`image/${outputFormat}`, 0.95);
    setCroppedImageSrc(result);
    setIsProcessing(false);
  };

  async function handleRectCrop() {
    const image = imgRef.current;
    if (!image || !completedCrop?.width) return;
    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        setIsProcessing(false);
        return;
    }
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotate * (Math.PI / 180));
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    const centerX = (completedCrop.x + completedCrop.width / 2) * scaleX;
    const centerY = (completedCrop.y + completedCrop.height / 2) * scaleY;
    ctx.drawImage(image, -centerX, -centerY, image.naturalWidth, image.naturalHeight);
    setCroppedImageSrc(canvas.toDataURL(`image/${outputFormat}`, 0.95));
    setIsProcessing(false);
  }

  const handleApplyCrop = () => {
      if (cropMode === 'rectangular') handleRectCrop();
      else applyPerspective();
  }

  const handleDownload = () => {
    if (!croppedImageSrc) return;
    const link = document.createElement('a');
    link.href = croppedImageSrc;
    link.download = `cropped-image.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const updateMagnifier = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setMagnifierPos({ x, y });
    return { x, y };
  }, []);

  const handlePointMouseDown = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    setDraggingPoint(index);
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY;
    }
    updateMagnifier(clientX, clientY);
  };
  
  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current) return;
    if (e.cancelable) e.preventDefault();
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY;
    }
    
    const pos = updateMagnifier(clientX, clientY);
    if (pos) {
        setPoints(prev => {
            const next = [...prev];
            next[draggingPoint] = { x: pos.x, y: pos.y };
            return next;
        });
    }
  }, [draggingPoint, updateMagnifier]);

  const handleMouseUp = () => setDraggingPoint(null);

  if (!imgSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <CardHeader>
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Maximize className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-black uppercase">Smart Image Cropper</CardTitle>
          <CardDescription>Drag dots to corners to fix tilted photos or use standard crop.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-8 md:p-10 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
                <p className="text-xl font-bold">Drop photo here to begin</p>
                <p className="text-sm text-muted-foreground mt-2">Perfect for scanning IDs, Bills, and crooked documents.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6">
            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE LOCAL</div>
            <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT CROP</div>
            <div className="flex items-center gap-1.5"><Grid3X3 className="size-3 text-primary" /> SCANNER MODE</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl shadow-2xl border-foreground/10 overflow-hidden bg-card/50">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <CardTitle className="flex items-center gap-2 font-black uppercase tracking-tighter">
                    <CropIcon className="text-primary" /> Edit & Crop Studio
                </CardTitle>
                <CardDescription>Select mode and adjust points for a perfect result.</CardDescription>
            </div>
            <div className="flex items-center gap-3">
                <Tabs value={cropMode} onValueChange={(v) => { setCropMode(v as CropMode); setCroppedImageSrc(null); }} className="bg-background/50 p-1 rounded-lg border">
                    <TabsList className="h-9">
                        <TabsTrigger value="rectangular" className="text-[10px] font-black uppercase px-4">
                            <Maximize className="h-3 w-3 mr-1.5" /> Rect
                        </TabsTrigger>
                        <TabsTrigger value="perspective" className="text-[10px] font-black uppercase px-4">
                            <Scan className="h-3 w-3 mr-1.5" /> Scanner
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant="ghost" size="icon" onClick={() => setImgSrc(null)} className="text-destructive hover:bg-destructive/10"><X /></Button>
            </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid lg:grid-cols-4 min-h-[500px]">
            {/* Control Sidebar */}
            <div className="lg:col-span-1 border-r bg-muted/20 p-6 space-y-8 order-2 lg:order-1">
                {cropMode === 'rectangular' ? (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aspect Ratio</Label>
                            <Select value={aspect === undefined ? "free" : aspect.toString()} onValueChange={handleAspectChange}>
                                <SelectTrigger className="h-12 font-bold border-2"><SelectValue placeholder="Free" /></SelectTrigger>
                                <SelectContent className="font-bold">
                                    <SelectItem value="free">Free Form</SelectItem>
                                    <SelectItem value="1">Square (1:1)</SelectItem>
                                    <SelectItem value="1.333">Classic (4:3)</SelectItem>
                                    <SelectItem value="1.777">Widescreen (16:9)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Orientation Control</Label>
                            <Button variant="outline" className="w-full h-14 border-2 font-black text-xs uppercase bg-white dark:bg-slate-900" onClick={handleHardRotate} disabled={isProcessing}>
                                <RotateCw className="size-5 mr-3 text-primary" /> ROTATE 90°
                            </Button>
                        </div>
                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground">Straighten Fine-tune</Label>
                                <span className="text-[10px] font-mono font-bold text-primary">{rotate}°</span>
                            </div>
                            <Slider min={-45} max={45} step={0.1} value={[rotate]} onValueChange={(v) => setRotate(v[0])} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" className="h-10 border-2 font-bold text-[10px]" onClick={() => setFlipH(!flipH)}><FlipHorizontal className="h-4 w-4 mr-2" /> FLIP H</Button>
                            <Button variant="outline" size="sm" className="h-10 border-2 font-bold text-[10px]" onClick={() => setFlipV(!flipV)}><FlipVertical className="h-4 w-4 mr-2" /> FLIP V</Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                            <p className="text-[10px] font-black text-primary flex items-center gap-2 mb-2 uppercase tracking-widest"><Grid3X3 className="h-4 w-4" /> SCANNER MODE</p>
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">Drag the 4 corner dots to the edges of your document. Use the magnifier circle for precision.</p>
                        </div>
                        <Button variant="outline" className="w-full h-12 border-2 font-black text-[10px] uppercase" onClick={() => setPoints([{x:20, y:20}, {x:80, y:20}, {x:80, y:80}, {x:20, y:80}])}>
                            <RefreshCcw className="size-3 mr-2" /> Reset 4-Dots
                        </Button>
                    </div>
                )}
                <div className="space-y-3 pt-6 border-t border-dashed">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Save as format</Label>
                    <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                        <SelectTrigger className="h-12 font-bold border-2"><SelectValue /></SelectTrigger>
                        <SelectContent className="font-bold">
                            <SelectItem value="jpeg">JPG (High Quality)</SelectItem>
                            <SelectItem value="png">PNG (Lossless)</SelectItem>
                            <SelectItem value="webp">WEBP (Optimized)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button className="w-full h-16 text-lg font-black bg-primary shadow-2xl rounded-2xl active:scale-95" onClick={handleApplyCrop} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <CropIcon className="mr-3 h-6 w-6" />}
                    {isProcessing ? "PROCESSING..." : "CROP & SAVE"}
                </Button>
            </div>

            {/* Preview Workspace */}
            <div className="lg:col-span-3 bg-slate-200 dark:bg-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden select-none min-h-[600px] order-1 lg:order-2">
                {croppedImageSrc ? (
                     <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500 w-full">
                        <div className="relative shadow-2xl ring-8 ring-white rounded-lg overflow-hidden max-h-[65vh] bg-white transform-gpu hover:scale-[1.02] transition-transform">
                            <img src={croppedImageSrc} alt="Result" className="object-contain max-w-full max-h-[65vh] w-auto h-auto" />
                        </div>
                        <div className="flex flex-col gap-4 w-full max-w-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="h-12 border-2 font-black text-[10px] uppercase" onClick={() => setCroppedImageSrc(null)}><RefreshCcw className="mr-2 h-4 w-4" /> Try Again</Button>
                                <Button variant="outline" className="h-12 border-2 font-black text-[10px] uppercase border-primary text-primary" onClick={handleRotateResult}><RotateCw className="mr-2 h-4 w-4" /> ROTATE 90°</Button>
                            </div>
                            <Button size="lg" className="h-14 bg-green-600 hover:bg-green-700 font-black text-lg shadow-xl" onClick={handleDownload}><Download className="mr-2 h-6 w-6" /> DOWNLOAD</Button>
                        </div>
                    </div>
                ) : imgSrc && (
                    <div 
                        className="relative max-w-full max-h-full flex items-center justify-center"
                        style={{ touchAction: 'none' }}
                        onMouseMove={handleMouseMove}
                        onTouchMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onTouchEnd={handleMouseUp}
                    >
                        {cropMode === 'rectangular' ? (
                            <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect} className="max-h-[75vh] shadow-2xl">
                                <img ref={imgRef} alt="Source" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '75vh', objectFit: 'contain', transform: `rotate(${rotate}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})` }} />
                            </ReactCrop>
                        ) : (
                            <div 
                                ref={containerRef}
                                className="relative cursor-crosshair shadow-2xl border-4 border-white transform-gpu"
                            >
                                <img ref={imgRef} alt="Scanner Source" src={imgSrc} onLoad={onImageLoad} className="max-h-[75vh] w-auto object-contain pointer-events-none" />
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} className="fill-primary/20 stroke-primary stroke-[0.5]" />
                                </svg>
                                {points.map((p, i) => (
                                    <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-2xl cursor-grab active:cursor-grabbing z-20 flex items-center justify-center", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/90")}
                                         style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                                         onMouseDown={(e) => handlePointMouseDown(i, e)} onTouchStart={(e) => handlePointMouseDown(i, e)}>
                                        <div className="size-2.5 bg-white rounded-full shadow-inner" />
                                    </div>
                                ))}

                                {/* Precision Fixed Magnifier Circle - Top Center */}
                                {draggingPoint !== null && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 rounded-full border-4 border-green-500 shadow-2xl bg-white animate-in zoom-in-50 ring-4 ring-white/50">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {/* Precision Crosshair UI */}
                                            <div className="absolute size-full flex items-center justify-center pointer-events-none z-10">
                                                <div className="w-full h-0.5 bg-green-500/50 absolute" />
                                                <div className="h-full w-0.5 bg-green-500/50 absolute" />
                                                <div className="size-3 border-2 border-red-500 rounded-full bg-white/50 shadow-sm" />
                                            </div>
                                            <div className="absolute size-full opacity-30 bg-black/5" />
                                        </div>
                                        <img 
                                            src={imgSrc} 
                                            alt="magnify" 
                                            className="absolute max-w-none origin-top-left"
                                            style={{ 
                                                width: `${(imgRef.current?.width || 0) * 4}px`,
                                                height: `${(imgRef.current?.height || 0) * 4}px`,
                                                left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`,
                                                top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)`
                                            }} 
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Floating Instructions outside image bounds */}
                {!croppedImageSrc && imgSrc && (
                    <div className="mt-8 flex items-center gap-3 px-6 py-3 bg-black/70 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl z-40">
                        <Move className="h-4 w-4 text-primary animate-pulse" /> 
                        {cropMode === 'rectangular' ? "Drag corners to crop" : "Drag 4 dots to corners of object"}
                    </div>
                )}

                {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-[60] flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-16 w-16 animate-spin text-primary stroke-[3]" />
                        <p className="text-sm font-black text-primary uppercase tracking-widest animate-pulse">Processing Pixels...</p>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
