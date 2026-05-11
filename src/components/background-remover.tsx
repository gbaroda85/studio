"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from "react";
import Image from "next/image";
import { UploadCloud, Loader2, Download, X, Eraser, PictureInPicture, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function BackgroundRemover() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resultImageSrc, setResultImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkerboardStyle: React.CSSProperties = {
    backgroundImage:
      "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
  };

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setResultImageSrc(null);
      setProgress(0);
    setStatusText("");
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

  const handleRemoveBackground = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setResultImageSrc(null);
    setProgress(5);
    setStatusText("Initializing Smart Engine...");

    try {
      // Dynamic import to keep initial bundle small and avoid SSR issues
      const imglyRemoveBackground = (await import("@imgly/background-removal")).default;
      
      setStatusText("Processing Image locally...");
      
      const blob = await imglyRemoveBackground(originalImageSrc, {
        progress: (item, index, total) => {
            const p = Math.round((index / total) * 100);
            setProgress(p);
            if (item.includes("model")) setStatusText("Loading AI Model (one-time)...");
            else setStatusText("Removing Background...");
        },
        output: {
            format: "image/png",
            quality: 0.95
        }
      });

      const url = URL.createObjectURL(blob);
      setResultImageSrc(url);
      setProgress(100);
      setStatusText("Done!");
      toast({ title: "Success!", description: "Background removed with professional precision." });
    } catch (error: any) {
      console.error(error);
      toast({ 
        variant: "destructive", 
        title: "Processing Error", 
        description: "Failed to remove background. Please try a clearer image." 
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
    link.download = `${name}-no-bg.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setImageFile(null);
    if (resultImageSrc) URL.revokeObjectURL(resultImageSrc);
    setOriginalImageSrc(null);
    setResultImageSrc(null);
    setIsProcessing(false);
    setProgress(0);
    setStatusText("");
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
          <CardTitle className="text-2xl font-black flex items-center justify-center gap-2">
            <Eraser className="text-primary h-8 w-8" /> 
            PRO Background Remover
          </CardTitle>
          <CardDescription>Professional-grade removal. Private, unlimited, and 100% automatic.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/50 rounded-2xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/50 transition-all group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="relative">
                <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
                <Zap className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
            <div>
                <p className="text-xl font-bold">Drop photo here or Click to select</p>
                <p className="text-sm text-muted-foreground mt-2">Works best for people, pets, and products</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center gap-6 text-xs text-muted-foreground font-medium pb-8">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> 100% Private</div>
            <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-yellow-500" /> No AI Limits</div>
            <div className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-purple-500" /> HD Quality</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl animate-in fade-in duration-500">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="overflow-hidden border-2">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Original Image</CardTitle>
          </CardHeader>
          <CardContent className="aspect-square relative bg-white">
            <Image src={originalImageSrc} alt="Original" fill className="object-contain p-4" data-ai-hint="portrait person" />
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-2 border-primary/20 shadow-xl">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Professional Result
            </CardTitle>
          </CardHeader>
          <CardContent className="aspect-square relative flex items-center justify-center bg-white" style={checkerboardStyle}>
            {isProcessing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 backdrop-blur-sm p-8 text-center">
                    <div className="relative mb-6">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4 w-full max-w-xs">
                        <p className="font-black text-xl text-primary animate-pulse uppercase tracking-tight">{statusText}</p>
                        <Progress value={progress} className="h-2" />
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Processing in browser... No data uploads.</p>
                    </div>
                </div>
            ) : resultImageSrc ? (
              <Image src={resultImageSrc} alt="Result" fill className="object-contain p-4 animate-in zoom-in-95 duration-500" />
            ) : (
              <div className="flex flex-col items-center gap-4 opacity-10">
                <PictureInPicture className="h-24 w-24" />
                <p className="font-black text-xl">READY TO REMOVE</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button variant="outline" size="lg" onClick={handleReset} disabled={isProcessing} className="w-full sm:w-auto h-14 px-8 border-2 font-bold">
            <X className="mr-2 h-5 w-5" /> Start Over
        </Button>
        {!resultImageSrc ? (
            <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleRemoveBackground} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Eraser className="mr-3 h-6 w-6" />}
                {isProcessing ? "PROCESSING..." : "REMOVE BACKGROUND"}
            </Button>
        ) : (
            <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20" onClick={handleDownload}>
                <Download className="mr-3 h-6 w-6" /> DOWNLOAD IMAGE
            </Button>
        )}
      </div>
    </div>
  );
}
