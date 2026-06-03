
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

  // Perspective Mode States (8-Dot Magnet Logic: TL:0, TC:1, TR:2, RC:3, BR:4, BC:5, BL:6, LC:7)
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
        const targetHeight = Math.max(10, Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100)));
        canvas.width = targetWidth; canvas.height = targetHeight;

        // TL:0, TR:2, BR:4, BL:6 for Matrix mapping
        const srcPoints = [points[0], points[2], points[4], points[6]].map(p => ({ x: p.x * (image.naturalWidth / 100), y: p.y * (image.naturalHeight / 100) }));
        const dstPoints = [{ x: 0, y: 0 }, { x: targetWidth, y: 0 }, { x: targetWidth, y: targetHeight }, { x: 0, y: targetHeight }];
        
        const h = solvePerspective(dstPoints, srcPoints);
        const imgData = ctx.createImageData(targetWidth, targetHeight);
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = image.naturalWidth; srcCanvas.height = image.naturalHeight;
        const srcCtx = srcCanvas.getContext('2d');
        srcCtx?.drawImage(image, 0, 0);
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
        ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
    }
    setCroppedImageSrc(canvas.toDataURL(`image/${outputFormat}`, 0.95));
    setIsProcessing(false);
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
      <Card className={cn("w-full max-w-2xl text-center transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1", isDragOver && "border-primary bg-primary/5")}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}>
        <CardHeader className="pt-20">
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-2xl bg-primary/10 text-primary"><Maximize className="size-10" /></div>
          <CardTitle className="text-4xl font-black uppercase tracking-tighter">Smart Image Cropper</CardTitle>
        </CardHeader>
        <CardContent className="pb-20 pt-10"><UploadCloud className="size-16 mx-auto text-muted-foreground mb-4" /><p className="text-xl font-bold">Drop photo to Begin</p><input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl shadow-2xl border-foreground/10 overflow-hidden bg-card/50">
      <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between p-6">
        <div><CardTitle className="text-xl font-black uppercase tracking-tighter">Adjustment Studio</CardTitle></div>
        <div className="flex items-center gap-3">
            <Tabs value={cropMode} onValueChange={(v) => { setCropMode(v as CropMode); setCroppedImageSrc(null); }} className="bg-background/50 p-1 rounded-lg border">
                <TabsList className="h-9"><TabsTrigger value="rectangular" className="text-[10px] font-black px-4">RECT</TabsTrigger><TabsTrigger value="perspective" className="text-[10px] font-black px-4">SCAN</TabsTrigger></TabsList>
            </Tabs>
            <Button variant="ghost" size="icon" onClick={() => setImgSrc(null)}><X /></Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-4">
            <div className="lg:col-span-1 border-r bg-muted/20 p-6 space-y-8">
                <div className="space-y-4 pt-6"><Label className="text-[10px] font-black uppercase text-muted-foreground">Output Format</Label><Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}><SelectTrigger className="h-12 font-bold border-2"><SelectValue /></SelectTrigger><SelectContent className="font-bold"><SelectItem value="jpeg">JPG</SelectItem><SelectItem value="png">PNG</SelectItem><SelectItem value="webp">WEBP</SelectItem></SelectContent></Select></div>
                <Button className="w-full h-16 text-lg font-black bg-primary shadow-2xl rounded-2xl" onClick={handleApplyCrop} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin mr-2" /> : <CropIcon className="mr-2" />} CROP & SAVE</Button>
            </div>
            <div className="lg:col-span-3 bg-slate-200 dark:bg-slate-900 flex items-center justify-center p-8 relative min-h-[600px]"
                 onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                {croppedImageSrc ? (
                    <div className="flex flex-col items-center gap-8 animate-in zoom-in-95">
                        <img src={croppedImageSrc} alt="result" className="max-h-[65vh] shadow-3xl border-8 border-white rounded-lg" />
                        <div className="flex gap-4"><Button variant="outline" className="h-14 px-8 border-2 font-black" onClick={() => setCroppedImageSrc(null)}><RefreshCcw className="mr-2" /> Redo</Button><Button className="h-14 px-12 bg-green-600 font-black text-lg shadow-xl" onClick={() => { const l=document.createElement('a'); l.href=croppedImageSrc; l.download=`crop.${outputFormat}`; l.click(); }}><Download className="mr-2" /> DOWNLOAD</Button></div>
                    </div>
                ) : (
                    <div ref={containerRef} className="relative shadow-2xl border-4 border-white transform-gpu bg-white">
                        {cropMode === 'rectangular' ? (
                            <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={c => setCompletedCrop(c)}><img ref={imgRef} src={imgSrc} alt="rect" className="max-h-[75vh] w-auto" onLoad={onImageLoad} /></ReactCrop>
                        ) : (
                            <div className="relative">
                                <img ref={imgRef} src={imgSrc} alt="scan" className="max-h-[75vh] w-auto pointer-events-none" onLoad={onImageLoad} />
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points={`${points[0].x},${points[0].y} ${points[2].x},${points[2].y} ${points[4].x},${points[4].y} ${points[6].x},${points[6].y}`} className="fill-primary/20 stroke-primary stroke-[0.5]" /></svg>
                                {points.map((p, i) => (
                                    <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-xl cursor-grab", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/90")}
                                        style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }} onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}><div className="size-2.5 bg-white rounded-full" /></div>
                                ))}
                                {draggingPoint !== null && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 rounded-full border-4 border-green-500 shadow-2xl bg-white ring-4 ring-white/50 animate-in zoom-in-50">
                                        <img src={imgSrc} alt="mag" className="absolute max-w-none origin-top-left" style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} /><div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-0.5 bg-green-500/50 absolute" /><div className="h-full w-0.5 bg-green-500/50 absolute" /></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
