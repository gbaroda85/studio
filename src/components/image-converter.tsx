
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type OutputFormat = 'jpeg' | 'png' | 'webp';

type ImageConverterProps = {
  targetFormat: OutputFormat;
};

export default function ImageConverter({ targetFormat }: ImageConverterProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [convertedSrc, setConvertedSrc] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(targetFormat);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = `Image Converter`;
  const mimeType = `image/${outputFormat}`;

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        setConvertedSrc(null);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select an image file.",
      });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const handleConvert = () => {
    if (!imageSrc) return;
    setIsConverting(true);
    
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // For formats that don't support transparency, fill with white
        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(mimeType);
        setConvertedSrc(dataUrl);
      }
      setIsConverting(false);
    };
    img.onerror = () => {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load image.' });
        setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = convertedSrc;
    const name = imageFile.name.split(".").slice(0, -1).join(".");
    link.download = `${name}.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!imageSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <CardHeader>
          <CardTitle>{title}</CardTitle>
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Select an output format and convert your image.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted/30">
            {convertedSrc ? (
                 <Image src={convertedSrc} alt="Converted" fill className="object-contain" />
            ) : (
                <Image src={imageSrc} alt="Original" fill className="object-contain" />
            )}
        </div>
        <div className="w-full space-y-2">
            <Label htmlFor="format">Output Format</Label>
            <Select value={outputFormat} onValueChange={(v) => { setOutputFormat(v as OutputFormat); setConvertedSrc(null); }} disabled={isConverting}>
                <SelectTrigger id="format"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WEBP</SelectItem>
                </SelectContent>
            </Select>
        </div>
        {convertedSrc && <p className="text-sm font-medium text-green-600">Conversion successful!</p>}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {!convertedSrc ? (
            <Button onClick={handleConvert} disabled={isConverting} className="w-full">
                {isConverting ? <Loader2 className="animate-spin mr-2"/> : <FileOutput className="mr-2"/>}
                Convert to {outputFormat.toUpperCase()}
            </Button>
        ) : (
            <Button onClick={handleDownload} className="w-full">
                <Download className="mr-2"/>
                Download Image
            </Button>
        )}
        <Button variant="ghost" onClick={() => { setImageSrc(null); setConvertedSrc(null); setImageFile(null); }}>Convert another image</Button>
      </CardFooter>
    </Card>
  )
}
