"use client";

import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { 
  UploadCloud, 
  Loader2, 
  Download, 
  X, 
  Sparkles, 
  Zap,
  PenLine,
  CheckCircle2,
  FileType,
  Settings2,
  Eraser,
  RefreshCcw,
  ShieldCheck,
  ImageIcon,
  Eye,
  ArrowLeftRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

export default function SignatureRemover() {
  const { toast } = useToast();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resultImageSrc, setResultImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Controls for better cleaning
  const [sensitivity, setSensitivity] = useState([40]);
  const [boostInk, setBoostInk] = useState([20]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        setResultImageSrc(null);
        setProgress(0);
        setSensitivity([40]);
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

  const processLocally = async () => {
    if (!originalImageSrc) return;
    
    const img = new window.Image();
    img.src = originalImageSrc;
    
    img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let maxLuma = 0;
        for (let i = 0; i < data.length; i += 4) {
            const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            if (luma > maxLuma) maxLuma = luma;
        }

        const threshValue = sensitivity[0];
        const inkBoostFactor = 1 + (boostInk[0] / 100);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const diffFromWhite = maxLuma - luma;

          if (diffFromWhite > threshValue) {
            data[i + 3] = 255; 
            data[i] = Math.max(0, r / inkBoostFactor);
            data[i+1] = Math.max(0, g / inkBoostFactor);
            data[i+2] = Math.max(0, b / inkBoostFactor);
          } else {
            data[i + 3] = 0; 
          }
        }

        ctx.putImageData(imageData, 0, 0);
        setResultImageSrc(canvas.toDataURL("image/png"));
    };
  };

  useEffect(() => {
    if (originalImageSrc) {
        const timer = setTimeout(() => {
            processLocally();
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [sensitivity, boostInk, originalImageSrc]);

  const handleStartExtraction = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setProgress(20);
    
    setTimeout(() => {
        setProgress(100);
        processLocally();
        setIsProcessing(false);
        toast({ title: "Extraction Active", description: "Use sliders to fine-tune the result." });
    }, 600);
  };

  const handleDownload = () => {
    if (!resultImageSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = resultImageSrc;
    const nameParts = imageFile.name.split(".");
    const name = nameParts.slice(0, -1).join(".");
    link.download = `${name}-clean-signature.png`;
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
    setSensitivity([40]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!originalImageSrc) {
    return (
      <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 mb-4">
            <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
                <PenLine className="size-8" />
                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <Sparkles className="size-2.5" />
                </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                Signature <span className="text-gradient-hero">BG Remover</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                Step 1: Upload signature photo to extract ink. <br/>100% Private local RAM processing.
            </p>
        </motion.div>

        <Card
            className={cn("w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20", isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]")}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <CardHeader className="bg-muted/30 border-b p-6 text-center">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-10">
                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/30 transition-all group relative">
                    <div className="relative">
                        <UploadCloud className="size-12 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="text-center px-4">
                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter">Drop Signature here</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 font-bold opacity-60 uppercase">Extraction happens 100% locally.</p>
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
            </CardContent>
            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT</div>
                <div className="flex items-center gap-1.5"><ImageIcon className="size-3 text-primary" /> TRANSPARENT</div>
            </CardFooter>
        </Card>

        <div className="flex flex-wrap justify-center gap-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mt-2">
            <span>PRIVATE & SECURE</span>
            <span>NO SERVER UPLOADS</span>
            <span>HD PNG EXPORT</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-3">
            <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                <Settings2 className="size-5 md:size-6" />
            </div>
            <div>
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter">Studio <span className="text-primary">Panel</span></h2>
            </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
             <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-9 md:h-10 border-2 font-black text-[8px] md:text-[9px] uppercase px-4 rounded-lg">
                <RotateCcw className="mr-1.5 size-3" /> Reset
            </Button>
            <Button size="lg" className="flex-1 md:flex-none h-9 md:h-10 px-6 bg-green-600 hover:bg-green-700 font-black text-[9px] md:text-xs rounded-lg shadow-xl" onClick={handleDownload} disabled={isProcessing || !resultImageSrc}>
                <Download className="mr-1.5 size-3.5" /> DOWNLOAD PNG
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
            <Card className="overflow-hidden glass-card border-none shadow-2xl relative rounded-2xl md:rounded-[2rem]">
                <CardContent className="p-0 aspect-video relative bg-white flex items-center justify-center min-h-[300px] md:min-h-[450px]" style={checkerboardStyle}>
                    <AnimatePresence mode="wait">
                        {isProcessing ? (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/95 backdrop-blur-xl p-6 text-center gap-6"
                            >
                                <div className="relative">
                                    <Loader2 className="h-14 w-14 md:h-20 md:w-20 animate-spin text-primary stroke-[3]" />
                                    <Eraser className="absolute inset-0 m-auto h-6 w-6 md:h-9 md:w-9 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-3 w-full max-w-[250px] md:max-w-xs">
                                    <p className="font-black text-lg md:text-xl text-primary animate-pulse uppercase tracking-tighter">Cleaning Ink...</p>
                                    <Progress value={progress} className="h-1.5 shadow-inner" />
                                </div>
                            </motion.div>
                        ) : resultImageSrc ? (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative size-full p-4 md:p-8">
                                <Image src={resultImageSrc} alt="Result" fill className="object-contain p-4 md:p-8 drop-shadow-2xl" />
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative size-full p-4 md:p-8">
                                <Image src={originalImageSrc} alt="Original" fill className="object-contain p-4 md:p-8 opacity-40 grayscale" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-2xl">
                <CardHeader className="bg-primary/5 border-b border-white/10 p-4">
                    <CardTitle className="text-sm flex items-center gap-2 font-black uppercase tracking-tighter">
                        <Settings2 className="size-4 text-primary" /> Adjustment Studio
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8 md:space-y-10">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-1.5 text-muted-foreground">
                                    <Eraser className="size-3" /> Sensitivity
                                </Label>
                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{sensitivity[0]}</span>
                            </div>
                            <Slider min={5} max={150} step={1} value={sensitivity} onValueChange={setSensitivity} className="py-2" />
                            <p className="text-[9px] text-muted-foreground italic leading-tight uppercase opacity-60">Remove paper shadows and background grit.</p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-1.5 text-muted-foreground">
                                    <FileType className="size-3" /> Ink Darkness
                                </Label>
                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">+{boostInk[0]}%</span>
                            </div>
                            <Slider min={0} max={100} step={1} value={boostInk} onValueChange={setBoostInk} className="py-2" />
                            <p className="text-[9px] text-muted-foreground italic leading-tight uppercase opacity-60">Makes the signature strokes darker and clearer.</p>
                        </div>
                    </div>

                    <div className="p-4 md:p-5 bg-green-500/5 rounded-xl md:rounded-2xl border-2 border-green-500/10 flex gap-3 md:gap-4">
                        <CheckCircle2 className="size-5 md:size-6 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[9px] md:text-[11px] font-black text-green-700 uppercase tracking-tight">Pro Extraction Tip</p>
                            <p className="text-[8px] md:text-[10px] text-green-600/80 font-medium leading-tight mt-1">
                                This tool isolates the ink from the paper. Use it to get a clean signature that you can overlay on any digital form or PDF.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-3 border-t border-white/10 flex justify-center gap-4 opacity-40 text-[7px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1"><ShieldCheck className="size-2.5 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-1"><Zap className="size-2.5 text-yellow-500" /> INSTANT RENDER</div>
                </CardFooter>
            </Card>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
