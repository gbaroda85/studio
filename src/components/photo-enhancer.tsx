"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { UploadCloud, Loader2, Download, X, FileImage, Wand2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { enhancePhoto } from "@/ai/flows/enhance-photo-flow";

export default function PhotoEnhancer() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resultImageSrc, setResultImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setResultImageSrc(null);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a valid image file (PNG, JPG, etc.).",
      });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const handleEnhancePhoto = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setResultImageSrc(null);
    try {
      const result = await enhancePhoto({ photoDataUri: originalImageSrc });
      setResultImageSrc(result.imageDataUri);
      toast({ title: "Success!", description: "Photo enhanced. Check the preview and download." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "AI Error", description: "Failed to enhance the photo. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultImageSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = resultImageSrc;
    const nameParts = imageFile.name.split(".");
    const name = nameParts.slice(0, -1).join(".");
    const ext = nameParts.pop() || 'png';
    link.download = `${name}-enhanced.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setResultImageSrc(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!originalImageSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <CardHeader>
          <CardTitle>AI Photo Enhancer</CardTitle>
          <CardDescription>Upload a photo to automatically improve its quality.</CardDescription>
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
            <p className="text-xs text-muted-foreground">Improve lighting, colors, and sharpness instantly</p>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl animate-in fade-in duration-500">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Original Photo</CardTitle>
          </CardHeader>
          <CardContent className="aspect-square relative">
            <Image src={originalImageSrc} alt="Original" fill className="object-contain" data-ai-hint="landscape nature" />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Enhanced Photo</CardTitle>
          </CardHeader>
          <CardContent className="aspect-square relative bg-muted/30">
            {isProcessing && <div className="absolute inset-0 flex items-center justify-center z-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}
            {!isProcessing && resultImageSrc ? (
              <Image src={resultImageSrc} alt="Enhanced photo" fill className="object-contain transition-opacity duration-500" style={{ opacity: resultImageSrc ? 1 : 0 }} />
            ) : (<div className="flex h-full w-full items-center justify-center"><Sparkles className="h-16 w-16 text-muted-foreground/50" /></div>)}
          </CardContent>
        </Card>
      </div>
       <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button variant="outline" onClick={handleReset}><X className="mr-2 h-4 w-4" />Start Over</Button>
        <Button className="w-full sm:w-auto" onClick={handleEnhancePhoto} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {isProcessing ? "Enhancing..." : "Enhance Photo"}
        </Button>
        <Button className="w-full sm:w-auto" onClick={handleDownload} disabled={!resultImageSrc || isProcessing}><Download className="mr-2 h-4 w-4" />Download Image</Button>
      </div>
    </div>
  );
}
