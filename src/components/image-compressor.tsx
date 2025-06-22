"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
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
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type CompressionResult = {
  newSize: number;
  savings: number;
};

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function ImageCompressor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [quality, setQuality] = useState<number[]>([80]);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionResult, setCompressionResult] =
    useState<CompressionResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } else {
      // TODO: Add toast notification for invalid file type
      console.error("Please select an image file.");
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
    if (!imageFile || !originalSize) return;

    setIsCompressing(true);
    setCompressionResult(null);

    // Simulate compression process
    setTimeout(() => {
      const qualityValue = quality[0];
      const compressionRatio = qualityValue / 100;
      const newSize = originalSize * (compressionRatio * 0.7 + 0.2); // Simulate plausible compression
      const savings = ((originalSize - newSize) / originalSize) * 100;

      setCompressionResult({
        newSize: Math.max(100, newSize), // Ensure it's not zero
        savings: Math.min(99, savings), // Cap savings
      });
      setIsCompressing(false);
    }, 1500);
  };

  const handleDownload = () => {
    if (!originalImageSrc || !compressionResult || !imageFile) return;
    // In a real app, this would use a canvas to draw the image with new quality and get a blob.
    // Here, we just download the original for demonstration.
    const link = document.createElement("a");
    link.href = originalImageSrc;
    const nameParts = imageFile.name.split(".");
    const extension = nameParts.pop();
    const name = nameParts.join(".");
    link.download = `${name}-shrunk.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setOriginalSize(null);
    setCompressionResult(null);
    setIsCompressing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!originalImageSrc) {
    return (
      <Card
        className={cn(
          "w-full max-w-2xl text-center transition-all duration-300 ease-in-out",
          isDragOver && "border-primary ring-4 ring-primary/20"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <CardHeader>
          <CardTitle>Upload Your Image</CardTitle>
          <CardDescription>
            Drag & drop an image file here or click to select a file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">
              <span className="text-primary font-semibold">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PNG, JPG, WEBP, etc.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onFileChange}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl animate-in fade-in duration-500">
      <div className="flex justify-end mb-4">
        <Button variant="ghost" onClick={handleReset}>
          <X className="mr-2 h-4 w-4" />
          Compress Another Image
        </Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Original</CardTitle>
              {originalSize && (
                <Badge variant="secondary">{formatBytes(originalSize)}</Badge>
              )}
            </CardHeader>
            <CardContent className="aspect-square relative">
              <Image
                src={originalImageSrc}
                alt="Original"
                fill
                className="object-contain"
                data-ai-hint="abstract texture"
              />
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Compressed</CardTitle>
              {compressionResult && (
                <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {formatBytes(compressionResult.newSize)}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="aspect-square relative bg-muted/30">
              {isCompressing && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              )}
              {!isCompressing && compressionResult ? (
                <Image
                  src={originalImageSrc}
                  alt="Compressed"
                  fill
                  className="object-contain transition-opacity duration-500"
                  style={{
                    opacity: compressionResult ? 1 : 0,
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FileImage className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
              <CardDescription>Adjust the settings to compress your image.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="quality" className="flex justify-between">
                  <span>Quality</span>
                  <span className="text-primary font-medium">{quality[0]}%</span>
                </Label>
                <Slider
                  id="quality"
                  min={1}
                  max={100}
                  step={1}
                  value={quality}
                  onValueChange={setQuality}
                  disabled={isCompressing}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleCompress}
                disabled={isCompressing}
              >
                {isCompressing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {isCompressing ? "Compressing..." : "Compress Image"}
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
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium">Savings</p>
                    <p className="text-sm font-bold text-accent-foreground">{compressionResult.savings.toFixed(1)}%</p>
                  </div>
                  <Progress value={compressionResult.savings} className="h-3 [&>div]:bg-accent" />
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                    <p>Original Size: {formatBytes(originalSize || 0)}</p>
                    <p>New Size: {formatBytes(compressionResult.newSize)}</p>
                </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-6">
                  <p>Compress an image to see results here.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
            <Button className="w-full" onClick={handleDownload} disabled={!compressionResult || isCompressing}>
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
