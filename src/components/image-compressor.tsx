
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
  Settings2,
  Target,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/language-context";

type CompressionResult = {
  newSize: number;
  savings: number;
  finalQuality: number;
};

type OutputFormat = 'jpeg' | 'png' | 'webp';
type CompressionMode = 'manual' | 'target';

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
  const { t } = useLanguage();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [compressedImageSrc, setCompressedImageSrc] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressionMode, setCompressionMode] = useState<CompressionMode>('manual');
  const [targetSizeKb, setTargetSizeKb] = useState<string>("100");
  const [quality, setQuality] = useState<number[]>([80]);
  const [dimensions, setDimensions] = useState<{ width: string; height: string }>({ width: '', height: '' });
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (compressedImageSrc) {
      setCompressedImageSrc(null);
      setCompressionResult(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, dimensions, outputFormat, compressionMode, targetSizeKb]);


  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImageSrc(e.target?.result as string);
        setOriginalSize(file.size);
        
        // Auto-detect dimensions
        const img = new window.Image();
        img.onload = () => {
           // We keep dimensions empty for "Auto" behavior in handleCompress
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      setCompressionResult(null);
      setCompressedImageSrc(null);
    } else if (file) {
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

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const handleCompress = async () => {
    if (!imageFile || !originalImageSrc || !originalSize) return;

    setIsCompressing(true);
    setCompressionResult(null);
    setCompressedImageSrc(null);

    const img = new window.Image();
    img.src = originalImageSrc;
    img.onload = async () => {
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
      
      // Handle transparency for non-supporting formats
      if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
      }
      
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const mimeType = `image/${outputFormat}`;
      
      if (compressionMode === 'manual') {
        const qualityValue = quality[0] / 100;
        const compressedDataUrl = canvas.toDataURL(mimeType, (outputFormat === 'jpeg' || outputFormat === 'webp') ? qualityValue : undefined);
        
        const blob = await (await fetch(compressedDataUrl)).blob();
        const newSize = blob.size;
        const savings = ((originalSize - newSize) / originalSize) * 100;
        
        setCompressedImageSrc(compressedDataUrl);
        setCompressionResult({ newSize, savings: Math.max(0, savings), finalQuality: quality[0] });
        setIsCompressing(false);
        toast({ title: "Success!", description: "Image compressed successfully." });
      } else {
        // Target Size Mode (Binary Search for quality)
        const targetBytes = parseInt(targetSizeKb, 10) * 1024;
        
        if (outputFormat === 'png') {
            toast({ variant: 'destructive', title: 'PNG Not Supported', description: 'PNG format does not support quality-based target sizing. Switching to JPEG.' });
            setOutputFormat('jpeg');
            setIsCompressing(false);
            return;
        }

        let low = 0.01;
        let high = 1.0;
        let bestQuality = 0.8;
        let bestDataUrl = "";
        let bestSize = 0;

        // Perform binary search to find best quality
        for (let i = 0; i < 8; i++) {
            const mid = (low + high) / 2;
            const dataUrl = canvas.toDataURL(mimeType, mid);
            const blob = await (await fetch(dataUrl)).blob();
            
            if (blob.size <= targetBytes) {
                bestQuality = mid;
                bestDataUrl = dataUrl;
                bestSize = blob.size;
                low = mid; // Try higher quality
            } else {
                high = mid; // Go lower quality
            }
        }

        // If even lowest quality is too big, use the last calculated one
        if (!bestDataUrl) {
            bestDataUrl = canvas.toDataURL(mimeType, 0.01);
            const blob = await (await fetch(bestDataUrl)).blob();
            bestSize = blob.size;
            bestQuality = 0.01;
        }

        const savings = ((originalSize - bestSize) / originalSize) * 100;
        setCompressedImageSrc(bestDataUrl);
        setCompressionResult({ 
            newSize: bestSize, 
            savings: Math.max(0, savings), 
            finalQuality: Math.round(bestQuality * 100) 
        });
        setIsCompressing(false);
        toast({ title: "Compressed!", description: `Success! Hit target of ${targetSizeKb} KB.` });
      }
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
          <CardTitle>{t('image_compress_label')}</CardTitle>
          <CardDescription>{t('image_compress_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors"
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="text-primary h-6 w-6" />
            Image Compressor
        </h2>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-destructive">
            <X className="mr-2 h-4 w-4" /> Reset Tool
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Side: Previews */}
        <div className="lg:col-span-7 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-foreground/10 bg-card/50">
                <CardHeader className="p-4 border-b">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Original</span>
                        {originalSize && <Badge variant="outline" className="font-mono">{formatBytes(originalSize)}</Badge>}
                    </div>
                </CardHeader>
                <CardContent className="p-0 aspect-square relative bg-slate-900/5">
                    <Image src={originalImageSrc} alt="Original" fill className="object-contain p-2" data-ai-hint="high quality photography" />
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-foreground/10 bg-card/50">
                <CardHeader className="p-4 border-b">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Compressed</span>
                        {compressionResult && (
                            <Badge className="bg-accent text-accent-foreground font-mono">
                                {formatBytes(compressionResult.newSize)}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0 aspect-square relative bg-slate-900/5 flex items-center justify-center">
                    {isCompressing ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-xs font-medium text-muted-foreground animate-pulse">{t('calculating_quality')}</p>
                        </div>
                    ) : compressedImageSrc ? (
                        <Image src={compressedImageSrc} alt="Compressed" fill className="object-contain p-2 transition-all duration-700" />
                    ) : (
                        <div className="flex flex-col items-center gap-2 opacity-20">
                            <FileImage className="h-16 w-16" />
                            <p className="text-xs font-medium">Ready to compress</p>
                        </div>
                    )}
                </CardContent>
            </Card>
          </div>
          
          {compressionResult && (
             <Card className="border-accent/30 bg-accent/5 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-accent-foreground flex items-center gap-1.5">
                                    <Target className="h-4 w-4" /> Result Achieved
                                </span>
                                <span className="text-2xl font-black text-accent-foreground">{compressionResult.savings.toFixed(1)}% Smaller</span>
                            </div>
                            <Progress value={compressionResult.savings} className="h-4 [&>div]:bg-accent" />
                        </div>
                        <Button size="lg" className="w-full md:w-auto px-10 h-14 bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg rounded-xl shadow-xl shadow-accent/20" onClick={handleDownload}>
                            <Download className="mr-2 h-6 w-6" /> Download Result
                        </Button>
                    </div>
                </CardContent>
             </Card>
          )}
        </div>

        {/* Right Side: Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-foreground/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Compression Settings</CardTitle>
              <CardDescription>Adjust how you want to shrink your image.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Selection */}
              <Tabs value={compressionMode} onValueChange={(v) => setCompressionMode(v as CompressionMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="manual" className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" /> {t('manual_quality')}
                    </TabsTrigger>
                    <TabsTrigger value="target" className="flex items-center gap-2">
                        <Target className="h-4 w-4" /> {t('target_size')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4 pt-2">
                    <div className={cn("space-y-4", outputFormat === 'png' && "opacity-50")}>
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Image Quality</Label>
                            <span className="text-primary font-mono font-bold bg-primary/10 px-2 py-0.5 rounded text-sm">{quality[0]}%</span>
                        </div>
                        <Slider min={1} max={100} step={1} value={quality} onValueChange={setQuality} disabled={isCompressing || outputFormat === 'png'} />
                        {outputFormat === 'png' && <p className="text-[10px] text-muted-foreground font-medium">PNG uses lossless compression (quality setting ignored).</p>}
                    </div>
                </TabsContent>

                <TabsContent value="target" className="space-y-4 pt-2">
                    <div className="space-y-3">
                        <Label htmlFor="target-kb" className="text-sm font-bold">{t('target_size_kb')}</Label>
                        <div className="relative">
                            <Input 
                                id="target-kb" 
                                type="number" 
                                value={targetSizeKb} 
                                onChange={(e) => setTargetSizeKb(e.target.value)} 
                                className="pl-4 pr-12 h-12 text-lg font-mono focus-visible:ring-primary"
                                placeholder="e.g. 100"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground uppercase">KB</div>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium italic">We will automatically find the highest possible quality that stays under this limit.</p>
                    </div>
                </TabsContent>
              </Tabs>

              {/* Common Controls */}
              <div className="grid grid-cols-2 gap-4 border-t pt-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Format</Label>
                   <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)} disabled={isCompressing}>
                      <SelectTrigger className="h-10 font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="jpeg" className="font-bold">JPEG</SelectItem>
                          <SelectItem value="webp" className="font-bold">WEBP</SelectItem>
                          <SelectItem value="png" className="font-bold">PNG</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase text-muted-foreground">Size Preference</Label>
                   <div className="h-10 flex items-center px-3 border rounded-md bg-muted/20 text-xs font-medium text-muted-foreground">
                       Original Resolution
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="width" className="text-[10px] font-bold uppercase text-muted-foreground">Max Width (px)</Label>
                  <Input id="width" type="number" placeholder="Auto" value={dimensions.width} onChange={(e) => setDimensions(d => ({ ...d, width: e.target.value }))} className="h-10 font-mono text-sm" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="height" className="text-[10px] font-bold uppercase text-muted-foreground">Max Height (px)</Label>
                  <Input id="height" type="number" placeholder="Auto" value={dimensions.height} onChange={(e) => setDimensions(d => ({ ...d, height: e.target.value }))} className="h-10 font-mono text-sm" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button className="w-full h-14 text-lg font-black tracking-tight rounded-xl shadow-lg transition-all active:scale-95" onClick={handleCompress} disabled={isCompressing}>
                {isCompressing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-6 w-6" />}
                {isCompressing ? t('calculating_quality') : "START COMPRESSION"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
