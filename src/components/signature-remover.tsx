
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { 
  UploadCloud, 
  Loader2, 
  Download, 
  X, 
  Sparkles, 
  FileCheck,
  Zap,
  AlertCircle,
  ScanSearch
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { removeSignature } from "@/ai/flows/remove-signature-flow";
import { useLanguage } from "@/contexts/language-context";

export default function SignatureRemover() {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resultImageSrc, setResultImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImageSrc(e.target?.result as string);
        setResultImageSrc(null);
        setProgress(0);
      };
      reader.readAsDataURL(file);
    } else if (file) {
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

  const handleRemoveSignatureAI = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setResultImageSrc(null);
    setProgress(10);

    // Simulate progress for better UX
    const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + Math.random() * 15 : prev));
    }, 800);

    try {
      const result = await removeSignature({ photoDataUri: originalImageSrc });
      setResultImageSrc(result.imageDataUri);
      setProgress(100);
      toast({ title: "Success!", description: "Signature removed automatically using AI." });
    } catch (error: any) {
      console.error(error);
      const isQuotaError = error.message?.includes("429") || error.message?.includes("quota");
      toast({ 
        variant: "destructive", 
        title: isQuotaError ? "AI Limit Reached" : "Processing Failed", 
        description: isQuotaError 
          ? "The automatic AI model is currently at its free limit. Please try again after some time." 
          : "Could not process this document. Please ensure the signature is clearly visible." 
      });
    } finally {
      setIsProcessing(false);
      clearInterval(interval);
    }
  };

  const handleDownload = () => {
    if (!resultImageSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = resultImageSrc;
    const nameParts = imageFile.name.split(".");
    const ext = nameParts.pop();
    const name = nameParts.join(".");
    link.download = `${name}-cleaned.${ext || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setResultImageSrc(null);
    setIsProcessing(false);
    setProgress(0);
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
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ScanSearch className="h-10 w-10" />
          </div>
          <CardTitle>Automatic Signature Remover</CardTitle>
          <CardDescription>Upload any document or photo, and our AI will automatically detect and remove signatures.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/50 transition-all group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="relative">
                <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
                <Zap className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
            <div>
                <p className="text-xl font-bold">Drop document here</p>
                <p className="text-sm text-muted-foreground mt-2">AI will process it instantly</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-green-500" /> Professional AI Auto-Detection enabled
            </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl animate-in fade-in duration-500">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Original */}
        <Card className="overflow-hidden border-2 border-foreground/5">
          <CardHeader className="bg-muted/30 p-4 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                Original Document
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 aspect-[3/4] relative bg-white">
            <Image src={originalImageSrc} alt="Original" fill className="object-contain p-4" />
          </CardContent>
        </Card>

        {/* AI Result */}
        <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl relative">
          <CardHeader className="bg-primary/5 p-4 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-tight text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> AI Cleaned Result
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 aspect-[3/4] relative flex items-center justify-center bg-white">
            {isProcessing ? (
                <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center gap-6">
                    <div className="relative">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4 w-full max-w-xs">
                        <p className="font-black text-xl text-primary animate-pulse">CLEANING DOCUMENT...</p>
                        <p className="text-sm text-muted-foreground font-medium">Our AI is identifying and erasing signatures while preserving text.</p>
                        <Progress value={progress} className="h-2" />
                    </div>
                </div>
            ) : resultImageSrc ? (
                <Image src={resultImageSrc} alt="Cleaned" fill className="object-contain p-4 animate-in zoom-in-95 duration-500" />
            ) : (
                <div className="flex flex-col items-center gap-4 text-muted-foreground opacity-30">
                    <Sparkles className="h-20 w-20" />
                    <p className="font-bold text-lg">Waiting for AI...</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button variant="outline" size="lg" onClick={handleReset} disabled={isProcessing}>
            <X className="mr-2 h-5 w-5" /> Start Over
        </Button>
        
        {!resultImageSrc ? (
            <Button 
                size="lg" 
                className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-gradient-to-r from-primary to-violet-600 hover:opacity-90 shadow-xl shadow-primary/20" 
                onClick={handleRemoveSignatureAI} 
                disabled={isProcessing}
            >
                {isProcessing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Sparkles className="mr-2 h-6 w-6" />}
                AUTO REMOVE SIGNATURE
            </Button>
        ) : (
            <Button 
                size="lg" 
                className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20" 
                onClick={handleDownload}
            >
                <Download className="mr-2 h-6 w-6" /> DOWNLOAD CLEANED DOC
            </Button>
        )}
      </div>

      {isProcessing && (
         <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg max-w-2xl mx-auto flex gap-3 items-start animate-in slide-in-from-bottom-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 dark:text-yellow-400 font-medium leading-relaxed">
                <span className="font-bold">Please Note:</span> Heavy documents might take up to 20-30 seconds. If the free AI quota is busy, you might see an error. This is a cloud-based experimental tool.
            </p>
         </div>
      )}
    </div>
  );
}
