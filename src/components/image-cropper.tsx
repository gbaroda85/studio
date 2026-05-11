
"use client";

import 'react-image-crop/dist/ReactCrop.css';

import React, { useState, useRef, type ChangeEvent, type DragEvent, type SyntheticEvent, useEffect } from 'react';
import Image from 'next/image';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
    UploadCloud, 
    Download, 
    Crop as CropIcon, 
    RotateCw, 
    RefreshCcw, 
    FlipHorizontal, 
    FlipVertical,
    Maximize2,
    Move
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

type OutputFormat = 'jpeg' | 'png' | 'webp';

export default function ImageCropper() {
  const [imgSrc, setImgSrc] = useState('');
  const [croppedImageSrc, setCroppedImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setCrop(undefined);
      setCroppedImageSrc(null);
      setRotate(0);
      setScale(1);
      setFlipH(false);
      setFlipV(false);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
    } else if (file) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please select an image file.',
      });
    }
  };
  
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
        const { width, height } = e.currentTarget;
        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height));
    } else {
        const { width, height } = e.currentTarget;
        setCrop(centerCrop({ unit: '%', width: 90, height: 90 }, width, height));
    }
  }

  async function handleCropImage() {
    const image = imgRef.current;
    if (!image || !completedCrop?.width) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a crop area.' });
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    const rotateRads = rotate * (Math.PI / 180);
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    // 1. Move to canvas center relative to the crop
    ctx.translate(-cropX * pixelRatio, -cropY * pixelRatio);
    // 2. Move to image center
    ctx.translate(centerX * pixelRatio, centerY * pixelRatio);
    // 3. Rotate and Scale
    ctx.rotate(rotateRads);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    // 4. Move back
    ctx.translate(-centerX * pixelRatio, -centerY * pixelRatio);

    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth * pixelRatio,
      image.naturalHeight * pixelRatio,
    );

    ctx.restore();
    
    const mimeType = `image/${outputFormat}`;
    const base64Image = canvas.toDataURL(mimeType, 0.95);
    setCroppedImageSrc(base64Image);
    toast({ title: "Ready!", description: "Preview generated. You can now download." });
  }

  function handleDownload() {
    if (!croppedImageSrc) return;
    const link = document.createElement('a');
    link.href = croppedImageSrc;
    link.download = `cropped-result.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleAspectChange = (val: string) => {
      if (val === 'free') {
          setAspect(undefined);
      } else {
          const newAspect = parseFloat(val);
          setAspect(newAspect);
          if (imgRef.current) {
              const { width, height } = imgRef.current;
              setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, newAspect, width, height), width, height));
          }
      }
  }

  if (!imgSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <CardHeader>
          <CardTitle>Professional Image Cropper</CardTitle>
          <CardDescription>Drag & drop or upload. Straighten and crop with precision.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-16 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground"><span className="text-primary font-semibold">Choose a photo</span> to start editing</p>
            <p className="text-xs text-muted-foreground">Adjust corners and fix crooked photos easily</p>
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
                <CardTitle>Edit & Crop</CardTitle>
                <CardDescription>Adjust the frame and straighten the photo if needed.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setRotate(r => r - 90)} title="Rotate Left"><RotateCw className="h-4 w-4 rotate-180" /></Button>
                <Button variant="outline" size="sm" onClick={() => setRotate(r => r + 90)} title="Rotate Right"><RotateCw className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setFlipH(!flipH)} title="Flip Horizontal"><FlipHorizontal className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setFlipV(!flipV)} title="Flip Vertical"><FlipVertical className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => { setImgSrc(''); setCroppedImageSrc(null); }} className="text-destructive">Reset</Button>
            </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid lg:grid-cols-4 min-h-[500px]">
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 border-r bg-muted/20 p-6 space-y-8">
                <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aspect Ratio</Label>
                    <Select defaultValue="free" onValueChange={handleAspectChange}>
                        <SelectTrigger className="h-10 font-medium">
                            <SelectValue placeholder="Free" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="free">Free Form</SelectItem>
                            <SelectItem value="1">Square (1:1)</SelectItem>
                            <SelectItem value="1.333">Classic (4:3)</SelectItem>
                            <SelectItem value="1.777">Widescreen (16:9)</SelectItem>
                            <SelectItem value="0.75">Portrait (3:4)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Straighten</Label>
                        <span className="text-[10px] font-mono bg-primary/10 px-2 py-0.5 rounded text-primary">{rotate}°</span>
                    </div>
                    <Slider 
                        min={-45} 
                        max={45} 
                        step={0.5} 
                        value={[rotate % 360]} 
                        onValueChange={(v) => setRotate(v[0])} 
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>-45°</span>
                        <span onClick={() => setRotate(0)} className="cursor-pointer hover:text-primary font-bold">Center</span>
                        <span>45°</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Output Format</Label>
                    <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                        <SelectTrigger className="h-10 font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="jpeg">High Quality JPG</SelectItem>
                            <SelectItem value="png">Transparent PNG</SelectItem>
                            <SelectItem value="webp">Web Optimized</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="pt-4">
                    <Button className="w-full h-14 text-lg font-bold shadow-lg" onClick={handleCropImage}>
                        <CropIcon className="mr-2 h-5 w-5" /> Apply Crop
                    </Button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="lg:col-span-3 bg-black/5 flex items-center justify-center p-8 relative overflow-hidden">
                {croppedImageSrc ? (
                     <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
                        <div className="relative shadow-2xl ring-4 ring-white rounded-lg overflow-hidden max-h-[60vh]">
                            <Image
                                src={croppedImageSrc}
                                alt="Cropped preview"
                                width={800}
                                height={800}
                                className="object-contain w-auto h-auto"
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" size="lg" onClick={() => setCroppedImageSrc(null)}>
                                <RefreshCcw className="mr-2 h-4 w-4" /> Recrop
                            </Button>
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8" onClick={handleDownload}>
                                <Download className="mr-2 h-5 w-5" /> Download Result
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-full max-h-full flex items-center justify-center">
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
                                    transition: 'transform 0.1s ease-out'
                                }}
                            />
                        </ReactCrop>
                    </div>
                )}
                
                {/* Guide Text */}
                {!croppedImageSrc && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium">
                        <Move className="h-3 w-3" /> Drag corners to adjust, use slider to straighten
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

