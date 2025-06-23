
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Loader2,
  Download,
  ArrowRight,
  X,
  FileImage,
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
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CompressionResult = {
  newSize: number;
  savings: number;
};

type OutputFormat = 'jpeg' | 'png' | 'webp';

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function ImageCompressor() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [compressedImageSrc, setCompressedImageSrc] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [quality, setQuality] = useState<number[]>([80]);
  const [dimensions, setDimensions] = useState<{ width: string; height: string }>({ width: '', height: '' });
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset compressed state if settings change
  useEffect(() => {
    if (compressedImageSrc) {
      setCompressedImageSrc(null);
      setCompressionResult(null);
      toast({ title: 'Settings changed', description: 'Please re-compress the image to apply new settings.'});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, dimensions, outputFormat]);


  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImageSrc(e.target?.result as string);
        setOriginalSize(file.size);
      };
      reader.readAsDataURL(file);
      setCompressionResult(null);
      setCompressedImageSrc(null);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a valid image file (PNG, JPG, etc.).",
      });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files?.[0] || null);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileChange(e.dataTransfer.files?.[0] || null);
  };

  const handleCompress = () => {
    if (!imageFile || !originalImageSrc || !originalSize) return;

    setIsCompressing(true);
    setCompressionResult(null);
    setCompressedImageSrc(null);

    const img = new window.Image();
    img.src = originalImageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let targetWidth = img.width;
      let targetHeight = img.height;
      const inputWidth = dimensions.width ? parseInt(dimensions.width, 10) : 0;
      const inputHeight = dimensions.height ? parseInt(dimensions.height, 10) : 0;

      if (inputWidth > 0 && inputHeight > 0) {
        targetWidth = inputWidth;
        targetHeight = inputHeight;
      } else if (inputWidth > 0) {
        targetWidth = inputWidth;
        targetHeight = (img.height * inputWidth) / img.width;
      } else if (inputHeight > 0) {
        targetHeight = inputHeight;
        targetWidth = (img.width * inputHeight) / img.height;
      }
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        toast({ variant: "destructive", title: "Error", description: "Could not process image." });
        setIsCompressing(false);
        return;
      }
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const mimeType = `image/${outputFormat}`;
      const qualityValue = quality[0] / 100;
      const compressedDataUrl = canvas.toDataURL(mimeType, outputFormat === 'jpeg' ? qualityValue : undefined);
      setCompressedImageSrc(compressedDataUrl);

      fetch(compressedDataUrl)
        .then(res => res.blob())
        .then(blob => {
          const newSize = blob.size;
          const savings = ((originalSize - newSize) / originalSize) * 100;
          setCompressionResult({ newSize, savings: Math.max(0, savings) });
          setIsCompressing(false);
          toast({ title: "Success!", description: "Image compressed. Check the preview and download." });
        });
    };
    img.onerror = () => {
      toast({ variant: "destructive", title: "Error", description: "Could not load image." });
      setIsCompressing(false);
    };
  };

  const handleDownload = () => {
    if (!compressedImageSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = compressedImageSrc;
    const nameParts = imageFile.name.split(".");
    const name = nameParts.slice(0, -1).join(".");
    link.download = `${name}-shrunk.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setCompressedImageSrc(null);
    setOriginalSize(null);
    setCompressionResult(null);
    setIsCompressing(false);
    setDimensions({ width: '', height: '' });
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
          <CardTitle>Upload Your Image</CardTitle>
          <CardDescription>Drag & drop an image file here or click to select a file.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">
              <span className="text-primary font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">Supports PNG, JPG, WEBP, etc.</p>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl animate-in fade-in duration-500">
      <div className="flex justify-end mb-4">
        <Button variant="ghost" onClick={handleReset}><X className="mr-2 h-4 w-4" />Compress Another Image</Button>
      </div>
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Original</CardTitle>
              {originalSize && <Badge variant="secondary">{formatBytes(originalSize)}</Badge>}
            </CardHeader>
            <CardContent className="aspect-square relative">
              <Image src={originalImageSrc} alt="Original" fill className="object-contain" data-ai-hint="abstract texture" />
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Compressed</CardTitle>
              {compressionResult && <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">{formatBytes(compressionResult.newSize)}</Badge>}
            </CardHeader>
            <CardContent className="aspect-square relative bg-muted/30">
              {isCompressing && <div className="absolute inset-0 flex items-center justify-center z-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}
              {!isCompressing && compressedImageSrc ? (
                <Image src={compressedImageSrc} alt="Compressed" fill className="object-contain transition-opacity duration-500" style={{ opacity: compressedImageSrc ? 1 : 0 }} />
              ) : (<div className="flex h-full w-full items-center justify-center"><FileImage className="h-16 w-16 text-muted-foreground/50" /></div>)}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
              <CardDescription>Adjust quality, size, and format.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input id="width" type="number" placeholder="Auto" value={dimensions.width} onChange={(e) => setDimensions(d => ({ ...d, width: e.target.value }))} disabled={isCompressing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input id="height" type="number" placeholder="Auto" value={dimensions.height} onChange={(e) => setDimensions(d => ({ ...d, height: e.target.value }))} disabled={isCompressing} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">Output Format</Label>
                 <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)} disabled={isCompressing}>
                    <SelectTrigger id="format"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="webp">WEBP</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className={cn("space-y-2", outputFormat !== 'jpeg' && "opacity-50")}>
                <Label htmlFor="quality" className="flex justify-between"><span>Quality</span><span className="text-primary font-medium">{quality[0]}%</span></Label>
                <Slider id="quality" min={1} max={100} step={1} value={quality} onValueChange={setQuality} disabled={isCompressing || outputFormat !== 'jpeg'} />
                {outputFormat !== 'jpeg' && <p className="text-xs text-muted-foreground -mt-1">Quality adjustment only applies to JPEG format.</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCompress} disabled={isCompressing}>
                {isCompressing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                {isCompressing ? "Processing..." : "Apply & Compress"}
              </Button>
            </CardFooter>
          </Card>
          <Card className={cn("transition-opacity duration-500", !compressionResult && "opacity-50 pointer-events-none")}>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>Your compression savings report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {compressionResult ? (
                <>
                  <div>
                    <div className="flex justify-between mb-1"><p className="text-sm font-medium">Savings</p><p className="text-sm font-bold text-accent-foreground">{compressionResult.savings.toFixed(1)}%</p></div>
                    <Progress value={compressionResult.savings} className="h-3 [&>div]:bg-accent" />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Original Size: {formatBytes(originalSize || 0)}</p>
                    <p>New Size: {formatBytes(compressionResult.newSize)}</p>
                  </div>
                </>
              ) : (<div className="text-center text-muted-foreground py-6"><p>Compress an image to see results here.</p></div>)}
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleDownload} disabled={!compressionResult || isCompressing}><Download className="mr-2 h-4 w-4" />Download Image</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
