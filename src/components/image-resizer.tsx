
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Loader2,
  Download,
  X,
  FileImage,
  Maximize,
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type OutputFormat = 'jpeg' | 'png' | 'webp';

export default function ImageResizer() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resizedImageSrc, setResizedImageSrc] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [newDimensions, setNewDimensions] = useState({ width: '', height: '' });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setOriginalImageSrc(src);
        
        const img = new window.Image();
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height });
          setNewDimensions({ width: String(img.width), height: String(img.height) });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
      setResizedImageSrc(null);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a valid image file.",
      });
    }
  };
  
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };
  
  const handleDimensionChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const numValue = parseInt(value, 10);

      if (!originalDimensions) return;
      
      setNewDimensions(d => ({ ...d, [name]: value }));

      if (maintainAspectRatio) {
          if (name === 'width' && numValue > 0) {
              const newHeight = Math.round((originalDimensions.height / originalDimensions.width) * numValue);
              setNewDimensions({ width: value, height: String(newHeight) });
          } else if (name === 'height' && numValue > 0) {
              const newWidth = Math.round((originalDimensions.width / originalDimensions.height) * numValue);
              setNewDimensions({ width: String(newWidth), height: value });
          }
      }
  }


  const handleResize = () => {
    if (!originalImageSrc || !newDimensions.width || !newDimensions.height) return;

    setIsProcessing(true);
    setResizedImageSrc(null);

    const img = new window.Image();
    img.src = originalImageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = parseInt(newDimensions.width, 10);
      canvas.height = parseInt(newDimensions.height, 10);
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        toast({ variant: "destructive", title: "Error", description: "Could not process image." });
        setIsProcessing(false);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const mimeType = `image/${outputFormat}`;
      const resizedDataUrl = canvas.toDataURL(mimeType, outputFormat === 'jpeg' ? 0.95 : undefined);
      setResizedImageSrc(resizedDataUrl);
      setIsProcessing(false);
    };
    img.onerror = () => {
      toast({ variant: "destructive", title: "Error", description: "Could not load image." });
      setIsProcessing(false);
    };
  };

  const handleDownload = () => {
    if (!resizedImageSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = resizedImageSrc;
    const nameParts = imageFile.name.split(".");
    const name = nameParts.slice(0, -1).join(".");
    link.download = `${name}-resized.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setResizedImageSrc(null);
    setOriginalDimensions(null);
    setNewDimensions({ width: '', height: '' });
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!originalImageSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <CardHeader>
          <CardTitle>Resize Image</CardTitle>
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
            <p className="text-xs text-muted-foreground">Change image dimensions easily</p>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
        <Card>
            <CardHeader>
                <CardTitle>Resize Options</CardTitle>
                <CardDescription>Enter new dimensions and choose format.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {originalDimensions && (
                    <Badge variant="secondary">Original: {originalDimensions.width} x {originalDimensions.height} px</Badge>
                )}
                <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="space-y-2">
                        <Label htmlFor="width">Width (px)</Label>
                        <Input id="width" name="width" type="number" placeholder="e.g., 1920" value={newDimensions.width} onChange={handleDimensionChange} disabled={isProcessing} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="height">Height (px)</Label>
                        <Input id="height" name="height" type="number" placeholder="e.g., 1080" value={newDimensions.height} onChange={handleDimensionChange} disabled={isProcessing} />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="aspect-ratio" checked={maintainAspectRatio} onCheckedChange={(checked) => setMaintainAspectRatio(Boolean(checked))} />
                    <Label htmlFor="aspect-ratio" className="font-normal">Maintain aspect ratio</Label>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="format">Output Format</Label>
                    <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)} disabled={isProcessing}>
                        <SelectTrigger id="format"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="webp">WEBP</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                 <Button className="w-full" onClick={handleResize} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Maximize className="mr-2 h-4 w-4" />}
                    {isProcessing ? "Resizing..." : "Resize Image"}
                </Button>
                 <Button variant="ghost" onClick={handleReset} className="w-full">
                    <X className="mr-2 h-4 w-4" />
                    Reset
                 </Button>
            </CardFooter>
        </Card>
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Your resized image will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="aspect-video relative bg-muted/30 flex items-center justify-center">
                {isProcessing ? (
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                ) : resizedImageSrc ? (
                    <Image src={resizedImageSrc} alt="Resized" fill className="object-contain" />
                ) : originalImageSrc ? (
                    <Image src={originalImageSrc} alt="Original" fill className="object-contain" />
                ) : (
                    <FileImage className="h-16 w-16 text-muted-foreground/50" />
                )}
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleDownload} disabled={!resizedImageSrc || isProcessing}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Resized Image
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
