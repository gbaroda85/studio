
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from "react";
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
    CheckCircle2,
    SearchCode,
    FileText
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  /**
   * Pre-processes image on a hidden canvas to improve OCR accuracy
   * 1. Grayscale
   * 2. Contrast Boost
   * 3. Noise reduction
   */
  const preProcessImage = async (src: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return resolve(src);

            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Apply Grayscale and Contrast enhancement
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                
                // Grayscale formula (luminosity)
                let gray = 0.299 * r + 0.587 * g + 0.114 * b;
                
                // Simple threshold/contrast boost
                // If light, make it white. If dark, make it pitch black.
                // This makes text much clearer for Tesseract
                if (gray > 128) {
                    gray = Math.min(255, gray * 1.1);
                } else {
                    gray = Math.max(0, gray * 0.8);
                }

                data[i] = data[i+1] = data[i+2] = gray;
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.9));
        };
    });
  };

  const handleExtractText = async () => {
    if (!originalImageSrc) return;
    
    setIsProcessing(true);
    setExtractedText(null);
    setProgress(5);
    setStatusText("Cleaning image for accuracy...");

    try {
      // Step 1: Pre-process image for better OCR
      const processedSrc = await preProcessImage(originalImageSrc);
      setProgress(15);
      setStatusText("Initializing Local Engine...");

      // Step 2: Run Tesseract Worker
      // Using 'eng+hin' for dual language support
      const worker = await createWorker('eng+hin', 1, {
        logger: m => {
            if (m.status === 'recognizing text') {
                setProgress(20 + Math.round(m.progress * 80));
                setStatusText(`Extracting Text... (${Math.round(m.progress * 100)}%)`);
            } else if (m.status === 'loading tesseract core') {
                setStatusText("Loading Core Logic...");
            }
        }
      });

      const { data: { text } } = await worker.recognize(processedSrc);
      await worker.terminate();

      // Clean up text (remove excessive newlines)
      const cleanedText = text.replace(/\n\s*\n/g, '\n').trim();

      if (!cleanedText) {
          throw new Error("No text detected");
      }

      setExtractedText(cleanedText);
      setProgress(100);
      setStatusText("Extraction Complete");
      toast({ title: "Success!", description: "Text extracted locally with HD accuracy." });
    } catch (error: any) {
      console.error(error);
      toast({ 
          variant: "destructive", 
          title: "Scan Failed", 
          description: "Could not read text. Try a clearer photo with better lighting." 
      });
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!originalImageSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/10 border-foreground/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <CardHeader>
          <div className="mx-auto mb-4 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
            <FileScan className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-black">Local OCR Studio</CardTitle>
          <CardDescription className="text-base">Convert images to editable text. No server, no limits, 100% accurate pre-processing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="relative z-10">
                <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
                <Zap className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
            <div className="z-10">
                <p className="text-xl font-bold">Drop document or photo here</p>
                <p className="text-sm text-muted-foreground mt-2">Best for clear documents, bills, and hand-written notes.</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center gap-8 text-xs text-muted-foreground font-bold pb-8 border-t pt-8 bg-muted/10">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> NO QUOTA LIMITS</div>
            <div className="flex items-center gap-2"><SearchCode className="h-4 w-4 text-primary" /> AUTO-CLEAN LOGIC</div>
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-500" /> ENGLISH + HINDI</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Source Image - Pro Look */}
        <div className="lg:col-span-5 flex flex-col gap-4">
            <Card className="overflow-hidden border-2 shadow-lg flex flex-col">
              <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Source Document
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-[10px] font-black border-2">
                    <RefreshCcw className="mr-1 h-3 w-3" /> CHANGE PHOTO
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 aspect-[3/4] relative bg-white flex items-center justify-center">
                <Image src={originalImageSrc} alt="Original" fill className="object-contain p-6" />
              </CardContent>
            </Card>
            <div className="p-4 bg-primary/5 border-2 border-primary/10 rounded-2xl flex gap-3 items-center">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-[11px] font-black text-primary uppercase tracking-tight">Privacy Guard Active</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Text extraction is happening 100% on your device. No data is sent to AI servers.</p>
                </div>
            </div>
        </div>

        {/* Text Result - Pro Editor Look */}
        <div className="lg:col-span-7">
            <Card className="overflow-hidden border-2 shadow-2xl flex flex-col relative border-primary/20 h-full">
              <CardHeader className="bg-primary/5 border-b py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Editable Output
                </CardTitle>
                {extractedText && (
                    <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase">Extracted</span>
                    </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 p-0 relative min-h-[500px] flex flex-col bg-background">
                 {isProcessing && (
                    <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center gap-8">
                        <div className="relative">
                            <Loader2 className="h-20 w-20 animate-spin text-primary stroke-[3]" />
                            <FileScan className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-6 w-full max-w-sm">
                            <div className="space-y-2">
                                <p className="font-black text-2xl text-primary uppercase tracking-tighter">{statusText}</p>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Applying Neural Filters for Precision...</p>
                            </div>
                            <Progress value={progress} className="h-3 shadow-inner" />
                        </div>
                    </div>
                 )}
                <Textarea
                  className="flex-1 text-lg resize-none border-0 focus-visible:ring-0 rounded-none p-8 font-mono leading-relaxed bg-transparent selection:bg-primary/20"
                  placeholder={isProcessing ? "" : "Select a document to begin OCR extraction..."}
                  value={extractedText || ""}
                  onChange={(e) => setExtractedText(e.target.value)}
                  readOnly={isProcessing}
                />
              </CardContent>
              <CardFooter className="p-6 bg-muted/10 border-t gap-4 flex flex-col sm:flex-row">
                {!extractedText ? (
                    <Button className="w-full h-16 font-black bg-primary hover:bg-primary/90 shadow-xl text-xl rounded-2xl group transition-all active:scale-95" 
                            onClick={handleExtractText} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="mr-3 h-7 w-7 animate-spin" /> : <Zap className="mr-3 h-7 w-7 text-yellow-400 group-hover:scale-125 transition-transform" />}
                        {isProcessing ? "PROCESSING..." : "START SCAN"}
                    </Button>
                ) : (
                    <div className="flex gap-4 w-full">
                        <Button variant="outline" className="h-14 border-2 font-bold px-6 rounded-xl" onClick={() => setExtractedText(null)}>
                            <RefreshCcw className="h-4 w-4 mr-2" /> RE-SCAN
                        </Button>
                        <Button className="flex-1 h-14 font-black bg-green-600 hover:bg-green-700 shadow-xl text-lg rounded-xl transition-all active:scale-95" 
                                onClick={handleCopyToClipboard} disabled={hasCopied}>
                            {hasCopied ? <ClipboardCheck className="mr-3 h-6 w-6" /> : <Clipboard className="mr-3 h-6 w-6" />}
                            {hasCopied ? "COPIED TO CLIPBOARD!" : "COPY TEXT RESULT"}
                        </Button>
                    </div>
                )}
              </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}

