
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    X, 
    Eraser, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    Image as ImageIcon,
    Palette,
    Layers,
    Paintbrush,
    RotateCcw,
    CheckCircle2,
    MousePointer2,
    Undo2,
    Square,
    Maximize
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const COLOR_PRESETS = [
    { name: 'Transparent', value: 'transparent', icon: X },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Light Blue', value: '#ADD8E6' },
    { name: 'Passport Blue', value: '#000080' },
    { name: 'Green Screen', value: '#00FF00' },
    { name: 'Light Grey', value: '#F5F5F5' },
];

const BORDER_COLOR_PRESETS = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Grey', value: '#808080' },
    { name: 'Gold', value: '#FFD700' },
];

export default function BackgroundRemover() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [subjectImageSrc, setSubjectImageSrc] = useState<string | null>(null); // Just the cut subject
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null); // Composited result
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  
  // Customization States
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [isRefining, setIsRefining] = useState(false);
  const [brushMode, setBrushMode] = useState<"restore" | "erase">("restore");
  const [brushSize, setBrushSize] = useState([20]);
  
  // Border States
  const [borderWidth, setBorderWidth] = useState([0]);
  const [borderColor, setBorderColor] = useState("#FFFFFF");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const refineCanvasRef = useRef<HTMLCanvasElement>(null);

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
      reader.onload = (e) => setOriginalImageSrc(e.target?.result as string);
      reader.readAsDataURL(file);
      setSubjectImageSrc(null);
      setPreviewImageSrc(null);
      setBgColor("transparent");
      setBorderWidth([0]);
      setProgress(0);
      setIsRefining(false);
    } else if (file) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please select an image file." });
    }
  };

  const handleRemoveBackgroundLocal = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setSubjectImageSrc(null);
    setProgress(5);
    setStatusText("Initializing Engine...");

    try {
      const imglyModule = await import("@imgly/background-removal");
      const removeBackgroundFunc = imglyModule.removeBackground || (imglyModule as any).default;
      
      const blob = await removeBackgroundFunc(originalImageSrc, {
        progress: (item: string, index: number, total: number) => {
            const p = Math.round((index / total) * 100);
            setProgress(p);
            if (item.includes("model")) setStatusText("Loading Local AI...");
            else setStatusText("Scanning Image...");
        },
        output: { format: "image/png", quality: 0.95 }
      });

      const url = URL.createObjectURL(blob);
      setSubjectImageSrc(url);
      setProgress(100);
      setStatusText("Done!");
      toast({ title: "Background Removed", description: "You can now change colors, add borders or refine the edges." });
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Could not remove background locally." });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Compositing Logic (Subject + BG Color + Border) ---
  const updateComposite = useCallback(async () => {
    if (!subjectImageSrc) return;

    const canvas = compositeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.src = subjectImageSrc;
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // 1. Draw Background
        if (bgColor !== 'transparent') {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Draw Subject
        ctx.drawImage(img, 0, 0);
        
        // 3. Draw Border (Frame around entire image)
        if (borderWidth[0] > 0) {
            ctx.strokeStyle = borderColor;
            // Since stroke is centered on edge, we use double width for inner effect
            ctx.lineWidth = borderWidth[0] * 2; 
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
        }

        setPreviewImageSrc(canvas.toDataURL("image/png"));
    };
  }, [subjectImageSrc, bgColor, borderWidth, borderColor]);

  useEffect(() => {
    updateComposite();
  }, [updateComposite]);

  // --- Manual Refinement Logic ---
  const startRefining = () => {
      if (!subjectImageSrc || !originalImageSrc) return;
      setIsRefining(true);
      
      const canvas = refineCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new window.Image();
      img.src = subjectImageSrc;
      img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
      };
  };

  const handleRefineMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isRefining) return;
      const canvas = refineCanvasRef.current;
      if (!canvas || (e.buttons !== 1 && !('touches' in e))) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      let x, y;
      if ('touches' in e) {
          x = (e.touches[0].clientX - rect.left) * scaleX;
          y = (e.touches[0].clientY - rect.top) * scaleY;
      } else {
          x = (e.clientX - rect.left) * scaleX;
          y = (e.clientY - rect.top) * scaleY;
      }

      ctx.globalCompositeOperation = brushMode === 'restore' ? 'source-over' : 'destination-out';
      
      if (brushMode === 'restore') {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tCtx = tempCanvas.getContext('2d');
          if (tCtx) {
              const origImg = new window.Image();
              origImg.src = originalImageSrc!;
              tCtx.drawImage(origImg, 0, 0, canvas.width, canvas.height);
              
              ctx.save();
              ctx.beginPath();
              ctx.arc(x, y, brushSize[0], 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(tempCanvas, 0, 0);
              ctx.restore();
          }
      } else {
          ctx.beginPath();
          ctx.arc(x, y, brushSize[0], 0, Math.PI * 2);
          ctx.fill();
      }
      
      const refinedUrl = canvas.toDataURL("image/png");
      setSubjectImageSrc(refinedUrl);
  };

  const handleDownload = () => {
    if (!previewImageSrc) return;
    const link = document.createElement("a");
    link.href = previewImageSrc;
    link.download = `bg-changed-${Date.now()}.png`;
    link.click();
  };

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setSubjectImageSrc(null);
    setPreviewImageSrc(null);
    setBgColor("transparent");
    setBorderWidth([0]);
    setIsRefining(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!originalImageSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0]); }}
      >
        <CardHeader>
          <div className="mx-auto mb-4 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
            <Eraser className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-black">Background Studio</CardTitle>
          <CardDescription>Remove background with AI and change to any solid color or add border instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
                <p className="text-xl font-bold">Drop photo here to begin</p>
                <p className="text-sm text-muted-foreground mt-2">No file uploads. 100% Private local processing.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
        </CardContent>
        <CardFooter className="justify-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 border-t pt-8">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> SECURE</div>
            <div className="flex items-center gap-1.5"><Palette className="h-4 w-4 text-primary" /> COLOR CHANGE</div>
            <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-yellow-500" /> AI POWERED</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Preview Area */}
        <div className="lg:col-span-8 space-y-6">
            <Card className="overflow-hidden border-2 shadow-2xl relative">
                <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        {isRefining ? <Paintbrush className="h-3 w-3 text-primary animate-pulse" /> : <ImageIcon className="h-3 w-3" />}
                        {isRefining ? "Refinement Studio" : subjectImageSrc ? "Result Preview" : "Source Preview"}
                    </CardTitle>
                    {subjectImageSrc && <Badge className={cn("text-[9px] font-black", bgColor === 'transparent' ? "bg-amber-500/10 text-amber-600" : "bg-green-500/10 text-green-600")}>
                        {bgColor === 'transparent' ? 'TRANSPARENT' : 'COLOR APPLIED'}
                    </Badge>}
                </CardHeader>
                <CardContent className="p-0 aspect-square md:aspect-video relative bg-white flex items-center justify-center min-h-[450px]" style={bgColor === 'transparent' ? checkerboardStyle : { backgroundColor: bgColor }}>
                    {isProcessing ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/95 backdrop-blur-md p-8 text-center gap-8">
                            <div className="relative">
                                <Loader2 className="h-20 w-20 animate-spin text-primary stroke-[3]" />
                                <Zap className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-4 w-full max-w-sm">
                                <p className="font-black text-2xl text-primary animate-pulse uppercase tracking-tighter">{statusText}</p>
                                <Progress value={progress} className="h-2 shadow-inner" />
                            </div>
                        </div>
                    ) : isRefining ? (
                        <canvas 
                            ref={refineCanvasRef} 
                            className="max-w-full h-auto cursor-crosshair shadow-2xl border-4 border-primary/20 rounded-lg"
                            onMouseMove={handleRefineMove}
                            onTouchMove={handleRefineMove}
                        />
                    ) : previewImageSrc ? (
                        <Image src={previewImageSrc} alt="Result" fill className="object-contain p-8 animate-in zoom-in-95 duration-500" />
                    ) : (
                        <Image src={originalImageSrc} alt="Original" fill className="object-contain p-8" />
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button variant="outline" size="lg" onClick={handleReset} disabled={isProcessing} className="w-full sm:w-auto h-14 px-8 border-2 font-black uppercase text-xs">
                    <RotateCcw className="mr-2 h-4 w-4" /> Start Over
                </Button>
                {!subjectImageSrc ? (
                    <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl" onClick={handleRemoveBackgroundLocal} disabled={isProcessing}>
                        <Zap className="mr-3 h-6 w-6 text-yellow-400" /> START AI REMOVAL
                    </Button>
                ) : isRefining ? (
                    <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl" onClick={() => setIsRefining(false)}>
                        <CheckCircle2 className="mr-3 h-6 w-6" /> SAVE EDITS
                    </Button>
                ) : (
                    <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl" onClick={handleDownload}>
                        <Download className="mr-3 h-6 w-6" /> DOWNLOAD RESULT
                    </Button>
                )}
            </div>
        </div>

        {/* Controls Area */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 shadow-xl border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2 font-black uppercase tracking-tighter">
                        <Palette className="h-5 w-5 text-primary" /> CUSTOMIZE RESULT
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="colors" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/20 border-b">
                            <TabsTrigger value="colors" className="font-bold text-[10px] uppercase">
                                <Palette className="size-3 mr-2" /> BG & Border
                            </TabsTrigger>
                            <TabsTrigger value="refine" className="font-bold text-[10px] uppercase">
                                <Paintbrush className="size-3 mr-2" /> Refine Edges
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="colors" className="p-6 space-y-8 animate-in fade-in duration-300">
                             {!subjectImageSrc ? (
                                <p className="text-xs text-center text-muted-foreground py-8">Remove background first to enable design options.</p>
                             ) : (
                                <div className="space-y-8">
                                    {/* BACKGROUND SECTION */}
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                           <Palette className="size-3" /> 1. Background Color
                                        </Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {COLOR_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.value}
                                                    onClick={() => setBgColor(preset.value)}
                                                    className={cn(
                                                        "group h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                                                        bgColor === preset.value ? "border-primary ring-2 ring-primary/10 shadow-lg scale-105" : "border-transparent bg-muted/20 hover:bg-muted/40"
                                                    )}
                                                >
                                                    {preset.icon ? (
                                                        <preset.icon className="size-4 text-muted-foreground" />
                                                    ) : (
                                                        <div className="size-4 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: preset.value }} />
                                                    )}
                                                    <span className="text-[8px] font-black uppercase truncate px-1">{preset.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 items-center bg-muted/10 p-2 rounded-lg">
                                            <input type="color" value={bgColor !== 'transparent' ? bgColor : '#FFFFFF'} onChange={(e) => setBgColor(e.target.value)} className="size-8 rounded cursor-pointer" />
                                            <span className="text-[9px] font-mono font-bold uppercase">{bgColor}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* BORDER SECTION */}
                                    <div className="space-y-6">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                            <Square className="size-3" /> 2. Photo Border (Frame)
                                        </Label>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-bold">Border Width</span>
                                                <Badge variant="secondary" className="text-[9px] font-mono">{borderWidth[0]}px</Badge>
                                            </div>
                                            <Slider min={0} max={50} step={1} value={borderWidth} onValueChange={setBorderWidth} />
                                        </div>

                                        <div className="space-y-3">
                                            <span className="text-[10px] font-bold block">Border Color</span>
                                            <div className="flex flex-wrap gap-2">
                                                {BORDER_COLOR_PRESETS.map((p) => (
                                                    <button
                                                        key={p.value}
                                                        onClick={() => setBorderColor(p.value)}
                                                        className={cn(
                                                            "size-8 rounded-full border-2 transition-all",
                                                            borderColor === p.value ? "border-primary scale-110 shadow-md" : "border-transparent"
                                                        )}
                                                        style={{ backgroundColor: p.value }}
                                                        title={p.name}
                                                    />
                                                ))}
                                                <input 
                                                    type="color" 
                                                    value={borderColor} 
                                                    onChange={(e) => setBorderColor(e.target.value)}
                                                    className="size-8 rounded-full cursor-pointer border-2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             )}
                        </TabsContent>

                        <TabsContent value="refine" className="p-6 space-y-6 animate-in fade-in duration-300">
                            {!subjectImageSrc ? (
                                <p className="text-xs text-center text-muted-foreground py-8">Remove background first to enable refinement brush.</p>
                            ) : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button 
                                            variant={brushMode === 'restore' ? "default" : "outline"}
                                            className="h-14 flex-col gap-1 rounded-2xl border-2"
                                            onClick={() => setBrushMode('restore')}
                                            disabled={!isRefining}
                                        >
                                            <Undo2 className="size-5" />
                                            <span className="text-[8px] font-black uppercase">Restore</span>
                                        </Button>
                                        <Button 
                                            variant={brushMode === 'erase' ? "default" : "outline"}
                                            className="h-14 flex-col gap-1 rounded-2xl border-2"
                                            onClick={() => setBrushMode('erase')}
                                            disabled={!isRefining}
                                        >
                                            <Eraser className="size-5" />
                                            <span className="text-[8px] font-black uppercase">Erase</span>
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Brush Size</Label>
                                            <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{brushSize[0]}px</span>
                                        </div>
                                        <Slider min={5} max={100} step={1} value={brushSize} onValueChange={setBrushSize} disabled={!isRefining} />
                                    </div>

                                    {!isRefining ? (
                                        <Button variant="secondary" className="w-full h-12 font-black border-2" onClick={startRefining}>
                                            ACTIVATE REFINE BRUSH
                                        </Button>
                                    ) : (
                                        <Button className="w-full h-12 bg-green-600 font-black" onClick={() => setIsRefining(false)}>STOP REFINING</Button>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="bg-muted/5 border-t py-4 text-center">
                    <p className="text-[9px] text-muted-foreground w-full font-medium italic">
                        Everything happens locally. Privacy guaranteed.
                    </p>
                </CardFooter>
            </Card>
        </div>
      </div>
      
      {/* Hidden processing canvas */}
      <canvas ref={compositeCanvasRef} className="hidden" />
    </div>
  );
}

