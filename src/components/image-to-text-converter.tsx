"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { 
    UploadCloud, 
    Loader2, 
    X, 
    FileScan, 
    Clipboard, 
    ClipboardCheck, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    RefreshCcw,
    CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { createWorker } from "tesseract.js";

export default function ImageToTextConverter() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
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

  const handleExtractText = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setExtractedText(null);
    setProgress(0);
    setStatusText("Initializing Local OCR...");

    try {
      // 100% Local Engine - No Quota Limits
      const worker = await createWorker('eng+hin', 1, {
        logger: m => {
            if (m.status === 'recognizing text') {
                setProgress(Math.round(m.progress * 100));
                setStatusText("Scanning Document...");
            } else if (m.status === 'loading tesseract core') {
                setStatusText("Loading Core Engine...");
            }
        }
      });

      const { data: { text } } = await worker.recognize(originalImageSrc);
      await worker.terminate();

      setExtractedText(text);
      setProgress(100);
      setStatusText("Extraction Complete");
      toast({ title: "Success!", description: "Text extracted locally without cloud limits." });
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Scan Error", description: "Could not read text. Ensure image is clear." });
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
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <FileScan className="h-10 w-10" />
          </div>
          <CardTitle>AI Image to Text (OCR)</CardTitle>
          <CardDescription>Upload any image to extract text instantly. Works for English and Hindi.</CardDescription>
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
                <p className="text-xl font-bold">Drop image here or Click to select</p>
                <p className="text-sm text-muted-foreground mt-2">Screenshots, Documents, and Hand-written notes supported.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center gap-6 text-xs text-muted-foreground font-medium pb-8 border-t pt-6 bg-muted/20">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> 100% Zero-Quota Logic</div>
            <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-yellow-500" /> Unlimited Daily Scans</div>
            <div className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-primary" /> Multi-Language OCR</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl animate-in fade-in duration-500 px-4">
      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Source Image */}
        <Card className="overflow-hidden border-2 shadow-xl flex flex-col">
          <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Original Document</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-[10px] font-bold">
                <RefreshCcw className="mr-1 h-3 w-3" /> CHANGE
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 aspect-square relative bg-white flex items-center justify-center">
            <Image src={originalImageSrc} alt="Original" fill className="object-contain p-6" />
          </CardContent>
        </Card>

        {/* Text Result */}
        <Card className="overflow-hidden border-2 shadow-2xl flex flex-col relative border-primary/10">
          <CardHeader className="bg-primary/5 border-b py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Extracted Text
            </CardTitle>
            {extractedText && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </CardHeader>
          <CardContent className="flex-1 p-0 relative min-h-[400px] flex flex-col">
             {isProcessing && (
                <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center gap-6">
                    <div className="relative">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <FileScan className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4 w-full max-w-xs">
                        <p className="font-black text-xl text-primary animate-pulse uppercase tracking-tight">{statusText}</p>
                        <Progress value={progress} className="h-2" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Processing locally on your device</p>
                    </div>
                </div>
             )}
            <Textarea
              className="flex-1 text-base resize-none border-0 focus-visible:ring-0 rounded-none p-6 font-mono leading-relaxed"
              placeholder={isProcessing ? "Processing locally..." : "Extracted text will appear here."}
              value={extractedText || ""}
              onChange={(e) => setExtractedText(e.target.value)}
              readOnly={isProcessing}
            />
          </CardContent>
          <CardFooter className="p-4 bg-muted/10 border-t gap-3 flex flex-col sm:flex-row">
            <Button variant="outline" className="flex-1 border-2 font-bold" onClick={handleReset} disabled={isProcessing}>
                <X className="mr-2 h-4 w-4" /> Clear All
            </Button>
            {!extractedText ? (
                <Button className="flex-[2] h-12 font-black bg-primary hover:bg-primary/90 shadow-lg text-lg" 
                        onClick={handleExtractText} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Zap className="mr-2 h-6 w-6 text-yellow-400" />}
                    START LOCAL SCAN
                </Button>
            ) : (
                <Button className="flex-[2] h-12 font-black bg-green-600 hover:bg-green-700 shadow-lg text-lg" 
                        onClick={handleCopyToClipboard} disabled={hasCopied}>
                    {hasCopied ? <ClipboardCheck className="mr-2 h-6 w-6" /> : <Clipboard className="mr-2 h-6 w-6" />}
                    {hasCopied ? "COPIED TO CLIPBOARD!" : "COPY TEXT RESULT"}
                </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {extractedText && !isProcessing && (
         <div className="mt-8 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg max-w-2xl mx-auto flex gap-3 items-center animate-in slide-in-from-bottom-4">
            <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-400 font-bold">
                Scan successful! You can now edit the text above or copy it. No cloud quota was used.
            </p>
         </div>
      )}
    </div>
  );
}
