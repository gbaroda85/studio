"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { UploadCloud, Loader2, Download, X, Wand2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
    } else if (file) {
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
    } catch (error: any) {
      console.error(error);
      const isQuotaError = error.message?.includes("429") || error.message?.includes("quota");
      toast({ 
        variant: "destructive", 
        title: isQuotaError ? "AI Quota Exceeded" : "AI Error", 
        description: isQuotaError 
          ? "You've reached the free limit for this AI tool. Please try again later." 
          : "Failed to enhance the photo. Please try again." 
      });
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
    link.download = `${name}-enhanced.png`;
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
        <Card className="overflow-hidden border-2">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Original Photo</CardTitle>
          </CardHeader>
          <CardContent className="aspect-square relative bg-white">
            <Image src={originalImageSrc} alt="Original" fill className="object-contain p-4" />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-primary/20 shadow-xl">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Enhanced Result
            </CardTitle>
          </CardHeader>
          <CardContent className="aspect-square relative flex items-center justify-center bg-muted/30">
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/50 backdrop-blur-sm">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="font-bold text-primary animate-pulse">Enhancing Quality...</p>
              </div>
            ) : resultImageSrc ? (
              <Image 
                src={resultImageSrc} 
                alt="Enhanced photo" 
                fill 
                className="object-contain p-4 animate-in zoom-in-95 duration-500" 
              />
            ) : (
              <div className="flex flex-col items-center gap-4 opacity-20">
                <Wand2 className="h-16 w-16" />
                <p className="font-bold">READY TO ENHANCE</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button variant="outline" size="lg" onClick={handleReset} disabled={isProcessing} className="w-full sm:w-auto px-8 border-2 font-bold">
          <X className="mr-2 h-5 w-5" /> Start Over
        </Button>
        {!resultImageSrc ? (
          <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-primary hover:bg-primary/90 shadow-lg" onClick={handleEnhancePhoto} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Wand2 className="mr-3 h-6 w-6" />}
            {isProcessing ? "PROCESSING..." : "ENHANCE PHOTO"}
          </Button>
        ) : (
          <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-green-600 hover:bg-green-700 shadow-lg" onClick={handleDownload}>
            <Download className="mr-3 h-6 w-6" /> DOWNLOAD IMAGE
          </Button>
        )}
      </div>
    </div>
  );
}