
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
  isResized: boolean;
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
  }, [quality, dimensions, outputFormat, compressionMode, targetSizeKb]);


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
    setCompressedImageSrc(null);
    setCompressionResult(null);

    const img = new window.Image();
    img.src = originalImageSrc;
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast({ variant: "destructive", title: "Error", description: "Could not process image." });
        setIsCompressing(false);
        return;
      }

      const mimeType = `image/${outputFormat}`;

      if (compressionMode === 'manual') {
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
        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const qualityValue = quality[0] / 100;
        const compressedDataUrl = canvas.toDataURL(mimeType, (outputFormat === 'jpeg' || outputFormat === 'webp') ? qualityValue : undefined);
        
        const blob = await (await fetch(compressedDataUrl)).blob();
        const newSize = blob.size;
        const savings = ((originalSize - newSize) / originalSize) * 100;
        
        setCompressedImageSrc(compressedDataUrl);
        setCompressionResult({ newSize, savings: Math.max(0, savings), finalQuality: quality[0], isResized: targetWidth !== img.width });
        setIsCompressing(false);
        toast({ title: "Success!", description: "Image compressed successfully." });
      } else {
        // --- Smart Target Size Compression Engine ---
        const targetBytes = parseInt(targetSizeKb, 10) * 1024;
        
        if (outputFormat === 'png') {
            toast({ variant: 'destructive', title: 'Format Warning', description: 'PNG is lossless. For exact KB targets, switching to JPEG is recommended.' });
        }

        let bestBlob: Blob | null = null;
        let currentScale = 1.0;
        let bestQuality = 0.8;
        let finalWidth = img.width;
        
        // Loop through scales if quality reduction isn't enough (Intelligent Auto-Scale)
        // We try at most 4 scale reductions (100%, 80%, 60%, 40%)
        for (let s = 0; s < 4; s++) {
            const scale = 1.0 - (s * 0.2);
            const w = Math.floor(img.width * scale);
            const h = Math.floor(img.height * scale);
            canvas.width = w;
            canvas.height = h;
            
            if (outputFormat === 'jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, w, h);
            }
            ctx.drawImage(img, 0, 0, w, h);

            // Binary search for the best quality at this scale
            let low = 0.1; // Minimum quality floor to prevent "kharaab" results
            let high = 1.0;
            let currentBestAtThisScale: Blob | null = null;
            let currentBestQualAtThisScale = 0.5;

            for (let i = 0; i < 7; i++) {
                const q = (low + high) / 2;
                const tempUrl = canvas.toDataURL(mimeType, q);
                const tempBlob = await (await fetch(tempUrl)).blob();

                if (tempBlob.size <= targetBytes) {
                    currentBestAtThisScale = tempBlob;
                    currentBestQualAtThisScale = q;
                    low = q; // Try higher quality
                } else {
                    high = q; // Go lower
                }
            }

            if (currentBestAtThisScale) {
                bestBlob = currentBestAtThisScale;
                bestQuality = currentBestQualAtThisScale;
                finalWidth = w;
                // If we found a good fit at this scale with quality > 0.5, we stop.
                if (bestQuality > 0.5) break;
            }
            
            // If even at 0.1 quality it's too big, the outer loop will reduce scale.
        }

        if (!bestBlob) {
            // Absolute fallback: smallest scale, lowest quality
            const w = Math.floor(img.width * 0.3);
            const h = Math.floor(img.height * 0.3);
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            const fallbackUrl = canvas.toDataURL(mimeType, 0.1);
            bestBlob = await (await fetch(fallbackUrl)).blob();
            bestQuality = 0.1;
            finalWidth = w;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setCompressedImageSrc(reader.result as string);
            const savings = ((originalSize - bestBlob!.size) / originalSize) * 100;
            setCompressionResult({ 
                newSize: bestBlob!.size, 
                savings: Math.max(0, savings), 
                finalQuality: Math.round(bestQuality * 100),
                isResized: finalWidth !== img.width
            });
            setIsCompressing(false);
            toast({ title: "Done!", description: `Photo optimized to ${formatBytes(bestBlob!.size)}.` });
        };
        reader.readAsDataURL(bestBlob);
      }
    };
  };

  const handleDownload = () => {
    if (!compressedImageSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = compressedImageSrc;
    const nameParts = imageFile.name.split(".");
    const name = nameParts.slice(0, -1).join(".");
    link.download = `${name}-compressed.${outputFormat}`;
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
            <p className="text-xs text-muted-foreground">Best for PDF forms, IDs, and Passport photos</p>
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
            Advanced Compressor
        </h2>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-destructive">
            <X className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-foreground/10">
                <CardHeader className="p-4 border-b bg-muted/30">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Original File</span>
                </CardHeader>
                <CardContent className="p-0 aspect-square relative">
                    <Image src={originalImageSrc} alt="Original" fill className="object-contain p-4" />
                    <div className="absolute bottom-4 left-4">
                        <Badge variant="secondary" className="font-mono">{formatBytes(originalSize || 0)}</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-foreground/10 bg-card/50">
                <CardHeader className="p-4 border-b bg-muted/30">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Optimized Result</span>
                </CardHeader>
                <CardContent className="p-0 aspect-square relative flex items-center justify-center">
                    {isCompressing ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-xs font-bold text-muted-foreground animate-pulse">Calculating Best Quality...</p>
                        </div>
                    ) : compressedImageSrc ? (
                        <>
                            <Image src={compressedImageSrc} alt="Compressed" fill className="object-contain p-4" />
                            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                                <Badge className="bg-green-500 text-white font-mono">{formatBytes(compressionResult?.newSize || 0)}</Badge>
                                {compressionResult?.isResized && <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Dimensions Auto-Adjusted</Badge>}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 opacity-20">
                            <FileImage className="h-16 w-16" />
                            <p className="text-xs font-medium">Ready</p>
                        </div>
                    )}
                </CardContent>
            </Card>
          </div>
          
          {compressionResult && (
             <Card className="border-green-500/30 bg-green-50/30 dark:bg-green-950/10">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-green-700 flex items-center gap-1.5">
                                    <Target className="h-4 w-4" /> Perfect Fit Found
                                </span>
                                <span className="text-2xl font-black text-green-600">{compressionResult.savings.toFixed(1)}% Saved</span>
                            </div>
                            <Progress value={compressionResult.savings} className="h-3 [&>div]:bg-green-500" />
                        </div>
                        <Button size="lg" className="w-full md:w-auto px-10 h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-xl shadow-green-500/20" onClick={handleDownload}>
                            <Download className="mr-2 h-6 w-6" /> Download Now
                        </Button>
                    </div>
                </CardContent>
             </Card>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="border-foreground/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6 border-b">
              <CardTitle className="text-lg">Compression Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <Tabs value={compressionMode} onValueChange={(v) => setCompressionMode(v as CompressionMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1">
                    <TabsTrigger value="manual" className="h-10 text-sm font-bold">
                        Manual Quality
                    </TabsTrigger>
                    <TabsTrigger value="target" className="h-10 text-sm font-bold">
                        Fixed KB Size
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-6">
                    <div className={cn("space-y-4", outputFormat === 'png' && "opacity-50")}>
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Quality Level</Label>
                            <span className="text-primary font-mono font-bold bg-primary/10 px-3 py-1 rounded-full text-sm">{quality[0]}%</span>
                        </div>
                        <Slider min={5} max={100} step={1} value={quality} onValueChange={setQuality} disabled={isCompressing || outputFormat === 'png'} className="py-4" />
                    </div>
                </TabsContent>

                <TabsContent value="target" className="space-y-6">
                    <div className="space-y-4">
                        <Label htmlFor="target-kb" className="text-sm font-bold text-foreground">Required File Size (Max KB)</Label>
                        <div className="relative group">
                            <Input 
                                id="target-kb" 
                                type="number" 
                                value={targetSizeKb} 
                                onChange={(e) => setTargetSizeKb(e.target.value)} 
                                className="pl-6 pr-16 h-14 text-xl font-black focus-visible:ring-primary border-2"
                                placeholder="100"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">KB</div>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                            <span className="text-primary font-bold">Pro Tip:</span> If quality looks bad, we will automatically resize the image slightly to keep it looking sharp within your KB limit.
                        </p>
                    </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-1 gap-4 pt-6 border-t">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Output Format</Label>
                   <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)} disabled={isCompressing}>
                      <SelectTrigger className="h-12 font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="jpeg" className="font-bold">JPEG (Recommended)</SelectItem>
                          <SelectItem value="webp" className="font-bold">WEBP (Best size)</SelectItem>
                          <SelectItem value="png" className="font-bold">PNG (Lossless)</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t p-6">
              <Button className="w-full h-16 text-xl font-black tracking-widest rounded-xl shadow-lg transition-all active:scale-95 bg-primary hover:bg-primary/90" onClick={handleCompress} disabled={isCompressing}>
                {isCompressing ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <ArrowRight className="mr-3 h-6 w-6" />}
                {isCompressing ? "OPTIMIZING..." : "COMPRESS NOW"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
