
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
    Loader2
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
      { x: 10, y: 10 }, { x: 90, y: 10 },
      { x: 90, y: 90 }, { x: 10, y: 90 }
  ]);
  const [draggingPoint, setPointIndex] = useState<number | null>(null);
  
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
        if (aspect) {
            setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height));
        } else {
            setCrop(centerCrop({ unit: '%', width: 90, height: 90 }, width, height));
        }
    } else {
        setPoints([
            { x: 15, y: 15 }, { x: 85, y: 15 },
            { x: 85, y: 85 }, { x: 15, y: 85 }
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
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(p[j][i]) > Math.abs(p[max][i])) max = j;
        }
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
    const dstPoints = [
        { x: 0, y: 0 }, { x: targetWidth, y: 0 },
        { x: targetWidth, y: targetHeight }, { x: 0, y: targetHeight }
    ];

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

    // To handle rotation correctly, we move the canvas origin to the center of the CROP box
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply transformations
    ctx.rotate(rotate * (Math.PI / 180));
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Draw the source image offset so that the crop area aligns with the canvas center
    const centerX = (completedCrop.x + completedCrop.width / 2) * scaleX;
    const centerY = (completedCrop.y + completedCrop.height / 2) * scaleY;

    ctx.drawImage(
      image,
      -centerX,
      -centerY,
      image.naturalWidth,
      image.naturalHeight
    );

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

  const handlePointMouseDown = (index: number) => setPointIndex(index);
  
  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    setPoints(prev => {
        const next = [...prev];
        next[draggingPoint] = { x, y };
        return next;
    });
  }, [draggingPoint]);

  const handleMouseUp = () => setPointIndex(null);

  if (!imgSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <CardHeader>
          <CardTitle>Smart Image Cropper</CardTitle>
          <CardDescription>Drag dots to corners to fix tilted photos or use standard crop.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-16 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">Click to select or drag photo here</p>
            <p className="text-xs text-muted-foreground italic">Perfect for scanning IDs, Bills, and crooked documents</p>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-5xl shadow-2xl border-foreground/10 overflow-hidden">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <CropIcon className="text-primary" /> Edit & Crop
                </CardTitle>
                <CardDescription>Select mode and adjust points for a perfect result.</CardDescription>
            </div>
            <div className="flex items-center gap-3">
                <Tabs value={cropMode} onValueChange={(v) => { setCropMode(v as CropMode); setCroppedImageSrc(null); }} className="bg-background/50 p-1 rounded-lg border">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="rectangular" className="flex items-center gap-2">
                            <Maximize className="h-4 w-4" /> Rect
                        </TabsTrigger>
                        <TabsTrigger value="perspective" className="flex items-center gap-2">
                            <Scan className="h-4 w-4" /> Scanner
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant="ghost" size="icon" onClick={() => setImgSrc(null)} className="text-destructive"><X /></Button>
            </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid lg:grid-cols-4 min-h-[500px]">
            <div className="lg:col-span-1 border-r bg-muted/20 p-6 space-y-8">
                {cropMode === 'rectangular' ? (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Aspect Ratio</Label>
                            <Select defaultValue="free" onValueChange={(val) => {
                                if (val === 'free') setAspect(undefined);
                                else setAspect(parseFloat(val));
                            }}>
                                <SelectTrigger className="font-medium">
                                    <SelectValue placeholder="Free" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">Free Form</SelectItem>
                                    <SelectItem value="1">Square (1:1)</SelectItem>
                                    <SelectItem value="1.333">Classic (4:3)</SelectItem>
                                    <SelectItem value="1.777">Widescreen (16:9)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Rotate & Straighten</Label>
                                <span className="text-xs font-mono font-bold text-primary">{rotate}°</span>
                            </div>
                            <Slider min={-180} max={180} step={0.5} value={[rotate]} onValueChange={(v) => setRotate(v[0])} />
                            <Button 
                              variant="outline" 
                              className="w-full h-10 border-2 font-black text-[10px] uppercase tracking-widest"
                              onClick={() => setRotate((r) => (r + 90) % 360)}
                            >
                                <RotateCw className="size-3 mr-2 text-primary" /> Rotate 90°
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" onClick={() => setFlipH(!flipH)}><FlipHorizontal className="h-4 w-4 mr-2" /> Flip H</Button>
                            <Button variant="outline" size="sm" onClick={() => setFlipV(!flipV)}><FlipVertical className="h-4 w-4 mr-2" /> Flip V</Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                            <p className="text-xs font-bold text-primary flex items-center gap-2 mb-2">
                                <Grid3X3 className="h-4 w-4" /> SCANNER MODE
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Drag the 4 corner dots to the edges of your document. The logic will flatten the perspective.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                             <Button variant="outline" size="sm" onClick={() => {
                                 setPoints([{x:20, y:20}, {x:80, y:20}, {x:80, y:80}, {x:20, y:80}]);
                             }}>Reset Points</Button>
                        </div>
                    </div>
                )}

                <div className="space-y-3 pt-4 border-t">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Format</Label>
                    <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                        <SelectTrigger className="font-medium"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="jpeg">JPG (High Quality)</SelectItem>
                            <SelectItem value="png">PNG (Lossless)</SelectItem>
                            <SelectItem value="webp">WEBP (Optimized)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <Button className="w-full h-14 text-lg font-bold shadow-xl" onClick={handleApplyCrop} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CropIcon className="mr-2 h-5 w-5" />}
                    {isProcessing ? "Processing..." : "Crop & Save"}
                </Button>
            </div>

            <div className="lg:col-span-3 bg-black/5 flex items-center justify-center p-8 relative overflow-hidden select-none">
                {croppedImageSrc ? (
                     <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
                        <div className="relative shadow-2xl ring-4 ring-white rounded-lg overflow-hidden max-h-[60vh] bg-white">
                            <img src={croppedImageSrc} alt="Result" className="object-contain max-w-full max-h-[60vh] w-auto h-auto" />
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" size="lg" onClick={() => setCroppedImageSrc(null)}>
                                <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
                            </Button>
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8" onClick={handleDownload}>
                                <Download className="mr-2 h-5 w-5" /> Download
                            </Button>
                        </div>
                    </div>
                ) : imgSrc && (
                    <div 
                        ref={containerRef}
                        className="relative max-w-full max-h-full"
                        onMouseMove={handleMouseMove}
                        onTouchMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onTouchEnd={handleMouseUp}
                    >
                        {cropMode === 'rectangular' ? (
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspect}
                                className="max-h-[70vh]"
                            >
                                <img
                                    ref={imgRef}
                                    alt="Source"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    style={{ 
                                        maxHeight: '70vh', 
                                        objectFit: 'contain',
                                        transform: `rotate(${rotate}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                                    }}
                                />
                            </ReactCrop>
                        ) : (
                            <div className="relative cursor-crosshair">
                                <img
                                    ref={imgRef}
                                    alt="Perspective Source"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    className="max-h-[70vh] w-auto object-contain pointer-events-none"
                                />
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <polygon 
                                        points={points.map(p => `${p.x},${p.y}`).join(' ')} 
                                        className="fill-primary/20 stroke-primary stroke-[0.5]" 
                                    />
                                </svg>
                                {points.map((p, i) => (
                                    <div 
                                        key={i}
                                        className={cn(
                                            "absolute size-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-lg cursor-grab active:cursor-grabbing z-20",
                                            draggingPoint === i ? "bg-primary scale-125" : "bg-primary/80"
                                        )}
                                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                        onMouseDown={() => handlePointMouseDown(i)}
                                        onTouchStart={() => handlePointMouseDown(i)}
                                    >
                                        <div className="absolute inset-0 m-auto size-1.5 bg-white rounded-full" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {!croppedImageSrc && imgSrc && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium">
                        <Move className="h-3 w-3" /> {cropMode === 'rectangular' ? "Drag corners to resize" : "Drag the 4 dots to object corners"}
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
