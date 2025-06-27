"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { UploadCloud, Loader2, X, FileScan, Clipboard, ClipboardCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { imageToText } from "@/ai/flows/image-to-text-flow";

export default function ImageToTextConverter() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setOriginalImageSrc(e.target?.result as string);
      reader.readAsDataURL(file);
      setExtractedText(null);
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

  const handleExtractText = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setExtractedText(null);
    try {
      const result = await imageToText({ photoDataUri: originalImageSrc });
      setExtractedText(result.text);
      toast({ title: "Success!", description: "Text extracted from the image." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "AI Error", description: "Failed to extract text. Please try a clearer image." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setHasCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setHasCopied(false), 2000);
  }

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setExtractedText(null);
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
          <CardTitle>Image to Text (OCR)</CardTitle>
          <CardDescription>Upload an image to extract text using AI.</CardDescription>
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
            <p className="text-xs text-muted-foreground">Supports screenshots, documents, and more.</p>
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
            <Image src={originalImageSrc} alt="Original" fill className="object-contain" data-ai-hint="text document" />
          </CardContent>
        </Card>
        <Card className="overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Extracted Text</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
             {isProcessing && <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/50"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}
            <Textarea
              className="flex-1 text-base resize-none"
              placeholder={isProcessing ? "Extracting text..." : "Extracted text will appear here."}
              value={extractedText || ""}
              readOnly={isProcessing}
            />
            <Button onClick={handleCopyToClipboard} disabled={!extractedText || hasCopied}>
              {hasCopied ? <ClipboardCheck className="mr-2" /> : <Clipboard className="mr-2" />}
              {hasCopied ? "Copied!" : "Copy Text"}
            </Button>
          </CardContent>
        </Card>
      </div>
      <CardFooter className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button variant="outline" onClick={handleReset}><X className="mr-2 h-4 w-4" />Start Over</Button>
        <Button className="w-full sm:w-auto" onClick={handleExtractText} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileScan className="mr-2 h-4 w-4" />}
            {isProcessing ? "Processing..." : "Extract Text"}
        </Button>
      </CardFooter>
    </div>
  );
}
