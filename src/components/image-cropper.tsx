
"use client";

import 'react-image-crop/dist/ReactCrop.css';

import React, { useState, useRef, type ChangeEvent, type DragEvent, type SyntheticEvent } from 'react';
import Image from 'next/image';
import ReactCrop, { type Crop, type PixelCrop, centerCrop } from 'react-image-crop';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UploadCloud, Download, Crop as CropIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type OutputFormat = 'jpeg' | 'png' | 'webp';

export default function ImageCropper() {
  const [imgSrc, setImgSrc] = useState('');
  const [croppedImageSrc, setCroppedImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setCrop(undefined); // Clear crop on new image
      setCroppedImageSrc(null); // Clear previous cropped image
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
    } else {
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
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop({ unit: '%', width: 90, height: 90 }, width, height);
    setCrop(initialCrop);
    setCompletedCrop({
      unit: 'px',
      x: (width * initialCrop.x) / 100,
      y: (height * initialCrop.y) / 100,
      width: (width * initialCrop.width) / 100,
      height: (height * initialCrop.height) / 100
    });
  }

  function handleCropImage() {
    const image = imgRef.current;
    if (!image || !completedCrop?.width) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not crop image. Please ensure you have selected a crop area.',
      });
      return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not process the image for cropping.',
      });
      return;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    
    const mimeType = `image/${outputFormat}`;
    const base64Image = canvas.toDataURL(mimeType, outputFormat === 'jpeg' ? 0.9 : undefined);
    setCroppedImageSrc(base64Image);
    toast({
        title: "Image Cropped",
        description: "Preview is shown below. You can now download the image."
    });
  }

  function handleDownload() {
    if (!croppedImageSrc) return;
    const link = document.createElement('a');
    link.href = croppedImageSrc;
    link.download = `cropped-image.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleReset = () => {
      setImgSrc('');
      setCroppedImageSrc(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
  }

  const handleRecrop = () => {
      setCroppedImageSrc(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
  }

  if (!imgSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <CardHeader>
          <CardTitle>Crop Your Image</CardTitle>
          <CardDescription>Drag & drop an image here or click to select one.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground"><span className="text-primary font-semibold">Click to upload</span> or drag and drop</p>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Crop Image</CardTitle>
        <CardDescription>
          {croppedImageSrc ? "Preview your cropped image below." : "Select the area you want to crop."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {croppedImageSrc ? (
             <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-green-600">Cropped Preview</p>
                <div className="flex justify-center bg-muted/30 p-4 rounded-md">
                    <Image
                        src={croppedImageSrc}
                        alt="Cropped image preview"
                        width={500}
                        height={500}
                        style={{ maxHeight: '60vh', objectFit: 'contain', width: 'auto' }}
                    />
                </div>
            </div>
        ) : (
            <div className="flex justify-center bg-muted/30 p-4 rounded-md">
            <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
            >
                <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: '70vh', objectFit: 'contain' }}
                />
            </ReactCrop>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end sm:items-center">
        <div className="w-full sm:w-auto grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="format" className="text-right sm:text-left">Format:</Label>
            <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                <SelectTrigger id="format"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WEBP</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
            <Button variant="outline" onClick={handleReset} className="flex-1 sm:flex-initial">Upload Another</Button>
            {croppedImageSrc ? (
                <>
                    <Button variant="outline" onClick={handleRecrop} className="flex-1 sm:flex-initial">Crop Again</Button>
                    <Button onClick={handleDownload} className="flex-1 sm:flex-initial">
                        <Download className="mr-2" />
                        Download
                    </Button>
                </>
            ) : (
                <Button onClick={handleCropImage} disabled={!completedCrop?.width || !completedCrop?.height} className="flex-1 sm:flex-initial">
                    <CropIcon className="mr-2" />
                    Crop Image
                </Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
