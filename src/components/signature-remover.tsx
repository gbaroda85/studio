"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { UploadCloud, Loader2, Download, X, Eraser, FileImage, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { removeSignature } from "@/ai/flows/remove-signature-flow";
import { useLanguage } from "@/contexts/language-context";

export default function SignatureRemover() {
  const { toast } = useToast();
  const { t } = useLanguage();
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

  const handleRemoveSignature = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setResultImageSrc(null);
    try {
      const result = await removeSignature({ photoDataUri: originalImageSrc });
      setResultImageSrc(result.imageDataUri);
      toast({ title: "Success!", description: "Signature removed successfully." });
    } catch (error: any) {
      console.error(error);
      const isQuotaError = error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("limit");
      toast({ 
        variant: "destructive", 
        title: isQuotaError ? "AI Quota Exceeded" : "AI Error", 
        description: isQuotaError 
          ? "You've reached the free limit for this experimental tool. Google limits requests to 2-3 per day. Please try again after 24 hours." 
          : "Failed to remove signature. Please try again with a clearer image." 
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
    const ext = nameParts.pop();
    const name = nameParts.join(".");
    link.download = `${name}-no-signature.${ext || 'png'}`;
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
          <CardTitle>{t('remove_signature_label')}</CardTitle>
          <CardDescription>{t('remove_signature_description')}</CardDescription>
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
            <p className="text-xs text-muted-foreground">Supports documents, IDs, and handwritten signatures</p>
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
            <CardTitle>Original Image</CardTitle>
          </CardHeader>
          <CardContent className="aspect-square relative">
            <Image src={originalImageSrc} alt="Original" fill className="object-contain" />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Cleaned Result</CardTitle>
          </CardHeader>
          <CardContent className="aspect-square relative bg-muted/30">
            {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/50 gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-xs font-bold animate-pulse text-foreground">Removing signature...</p>
                </div>
            )}
            {!isProcessing && resultImageSrc ? (
              <Image src={resultImageSrc} alt="Result without signature" fill className="object-contain transition-opacity duration-500" />
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                        <Sparkles className="h-16 w-16" />
                        <p className="text-xs font-medium">Ready</p>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button variant="outline" onClick={handleReset}><X className="mr-2 h-4 w-4" />Start Over</Button>
        <Button className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 font-bold" onClick={handleRemoveSignature} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eraser className="mr-2 h-4 w-4" />}
            {isProcessing ? "Processing..." : "Remove Signature"}
        </Button>
        <Button className="w-full sm:w-auto h-12 px-8 font-bold" variant="secondary" onClick={handleDownload} disabled={!resultImageSrc || isProcessing}><Download className="mr-2 h-4 w-4" />Download Image</Button>
      </div>
    </div>
  );
}