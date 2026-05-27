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
    FileText,
    Image as ImageIcon
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
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let maxLuma = 0;
            for (let i = 0; i < data.length; i += 4) {
                const luma = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
                if (luma > maxLuma) maxLuma = luma;
            }

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i+1], b = data[i+2];
                let gray = 0.299 * r + 0.587 * g + 0.114 * b;
                if (gray > 128) gray = Math.min(255, gray * 1.1);
                else gray = Math.max(0, gray * 0.8);
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
    setStatusText("Cleaning image...");

    try {
      const processedSrc = await preProcessImage(originalImageSrc);
      setProgress(15);
      setStatusText("Starting AI Engine...");

      const worker = await createWorker('eng+hin', 1, {
        logger: m => {
            if (m.status === 'recognizing text') {
                setProgress(20 + Math.round(m.progress * 80));
                setStatusText(`Extracting... ${Math.round(m.progress * 100)}%`);
            } else if (m.status === 'loading tesseract core') {
                setStatusText("Loading Core...");
            }
        }
      });

      const { data: { text } } = await worker.recognize(processedSrc);
      await worker.terminate();

      const cleanedText = text.replace(/\n\s*\n/g, '\n').trim();
      if (!cleanedText) throw new Error("No text detected");

      setExtractedText(cleanedText);
      setProgress(100);
      setStatusText("Complete");
      toast({ title: "Extraction Complete", description: "Text extracted locally." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: "Could not read text. Use a clearer photo." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setHasCopied(true);
    toast({ title: 'Copied!' });
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
        className={cn("w-full max-w-2xl text-center transition-all duration-300 bg-card/50 hover:border-primary/80 hover:shadow-2xl border-2 border-dashed mx-auto", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <CardHeader>
          <div className="mx-auto mb-4 grid size-16 md:size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
            <FileScan className="h-8 md:h-10 w-8 md:w-10" />
          </div>
          <CardTitle className="text-xl md:text-3xl font-black uppercase tracking-tight">Local OCR Studio</CardTitle>
          <CardDescription className="text-[10px] md:text-sm uppercase font-bold opacity-60">High-fidelity text extraction without server uploads.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div
            className="border-3 border-dashed border-muted-foreground/30 rounded-2xl md:rounded-3xl p-8 md:p-20 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="relative">
                <UploadCloud className="h-12 md:h-16 w-12 md:w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                <Zap className="absolute -top-2 -right-2 h-6 md:h-8 w-6 md:w-8 text-yellow-500 animate-pulse" />
            </div>
            <div>
                <p className="text-lg md:text-xl font-bold uppercase tracking-tighter">Drop photo or Click to scan</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-2 font-medium">Best for clear documents and screenshots.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center gap-4 md:gap-8 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6">
            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
            <div className="flex items-center gap-1.5"><SearchCode className="size-3 text-primary" /> AUTO-CLEAN</div>
            <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-purple-500" /> MULTI-LANG</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
        
        <div className="lg:col-span-5 flex flex-col gap-4">
            <Card className="overflow-hidden border-2 shadow-lg flex flex-col bg-card/50">
              <CardHeader className="bg-muted/30 border-b py-3 md:py-4 flex flex-row items-center justify-between p-4 md:px-6">
                <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="h-3.5 md:h-4 w-3.5 md:w-4" /> Source Document
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-[8px] md:text-[10px] font-black border-2 uppercase">
                    <RefreshCcw className="mr-1.5 size-3" /> Change
                </Button>
              </CardHeader>
              <CardContent className="p-4 md:p-0 flex-1 aspect-[3/4] relative bg-white flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                <Image src={originalImageSrc} alt="Original" fill className="object-contain p-4 md:p-6" />
              </CardContent>
            </Card>
            <div className="p-4 bg-primary/5 border-2 border-primary/10 rounded-2xl flex gap-3 items-center">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-[10px] md:text-[11px] font-black text-primary uppercase tracking-tight">Privacy Guard Active</p>
                    <p className="text-[8px] md:text-[10px] text-muted-foreground font-medium leading-tight">Extraction is 100% local. No data is sent to servers.</p>
                </div>
            </div>
        </div>

        <div className="lg:col-span-7 flex flex-col">
            <Card className="overflow-hidden border-2 shadow-2xl flex flex-col relative border-primary/20 bg-background h-full min-h-[450px]">
              <CardHeader className="bg-primary/5 border-b py-3 md:py-4 flex flex-row items-center justify-between p-4 md:px-6">
                <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <FileText className="h-3.5 md:h-4 w-3.5 md:w-4" /> Editable Output
                </CardTitle>
                {extractedText && (
                    <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle2 className="size-3 md:size-4" />
                        <span className="text-[8px] md:text-[10px] font-black uppercase">Complete</span>
                    </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 p-0 relative flex flex-col bg-background">
                 {isProcessing && (
                    <div className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center gap-8">
                        <div className="relative">
                            <Loader2 className="h-16 w-16 md:h-20 md:w-20 animate-spin text-primary stroke-[3]" />
                            <FileScan className="absolute inset-0 m-auto h-7 w-7 md:h-8 md:w-8 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-4 w-full max-w-[280px] md:max-w-sm">
                            <p className="font-black text-xl md:text-2xl text-primary uppercase tracking-tighter animate-pulse">{statusText}</p>
                            <Progress value={progress} className="h-2 shadow-inner" />
                            <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Local neural threads active...</p>
                        </div>
                    </div>
                 )}
                <Textarea
                  className="flex-1 text-sm md:text-lg resize-none border-0 focus-visible:ring-0 rounded-none p-4 md:p-8 font-mono leading-relaxed bg-transparent selection:bg-primary/20 min-h-[350px]"
                  placeholder={isProcessing ? "" : "Text result will appear here after scanning..."}
                  value={extractedText || ""}
                  onChange={(e) => setExtractedText(e.target.value)}
                  readOnly={isProcessing}
                />
              </CardContent>
              <CardFooter className="p-4 md:p-6 bg-muted/10 border-t flex flex-col sm:flex-row gap-3">
                {!extractedText ? (
                    <Button className="w-full h-14 md:h-16 font-black bg-primary hover:bg-primary/90 shadow-xl text-lg md:text-xl rounded-xl md:rounded-2xl transition-all active:scale-95 group" 
                            onClick={handleExtractText} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="mr-2 md:mr-3 size-5 md:size-7 animate-spin" /> : <Zap className="mr-2 md:mr-3 size-5 md:size-7 text-yellow-400 group-hover:scale-125 transition-transform" />}
                        {isProcessing ? "SCANNING..." : "START EXTRACTION"}
                    </Button>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button variant="outline" className="w-full sm:w-auto h-12 md:h-14 border-2 font-black px-6 rounded-xl text-[10px] md:text-xs uppercase" onClick={() => setExtractedText(null)}>
                            <RefreshCcw className="h-4 w-4 mr-2" /> RE-SCAN
                        </Button>
                        <Button className="flex-1 h-12 md:h-14 font-black bg-green-600 hover:bg-green-700 shadow-xl text-xs md:text-lg rounded-xl transition-all active:scale-95" 
                                onClick={handleCopyToClipboard} disabled={hasCopied}>
                            {hasCopied ? <CheckCircle2 className="mr-2 size-4 md:size-6" /> : <Clipboard className="mr-2 size-4 md:size-6" />}
                            {hasCopied ? "COPIED TO CLIPBOARD!" : "COPY ALL TEXT"}
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
