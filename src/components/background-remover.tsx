"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from "react";
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
    Move,
    Maximize,
    RotateCcw,
    FlipHorizontal,
    FlipVertical,
    Cpu,
    CloudLightning,
    AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { removeBackground as removeBackgroundAI } from "@/ai/flows/remove-background-flow";

const PRESET_COLORS = [
    "#ffffff", "#000000", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#f3f4f6"
];

const PRESET_GRADIENTS = [
    { label: "Sunset", value: "linear-gradient(to right, #ff7e5f, #feb47b)", colors: ["#ff7e5f", "#feb47b"] },
    { label: "Ocean", value: "linear-gradient(to right, #6a11cb, #2575fc)", colors: ["#6a11cb", "#2575fc"] },
    { label: "Nature", value: "linear-gradient(to right, #00b09b, #96c93d)", colors: ["#00b09b", "#96c93d"] },
    { label: "Fire", value: "linear-gradient(to right, #f83600, #f9d423)", colors: ["#f83600", "#f9d423"] },
    { label: "Love", value: "linear-gradient(to right, #ee0979, #ff6a00)", colors: ["#ee0979", "#ff6a00"] },
    { label: "Sky", value: "linear-gradient(to right, #4facfe, #00f2fe)", colors: ["#4facfe", "#00f2fe"] },
];

export default function BackgroundRemover() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [subjectImageSrc, setSubjectImageSrc] = useState<string | null>(null);
  const [finalImageSrc, setFinalImageSrc] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [removalMode, setRemovalMode] = useState<"local" | "cloud">("cloud");
  
  // Background Options State
  const [bgType, setBgType] = useState<"none" | "color" | "gradient" | "image">("none");
  const [bgValue, setBgValue] = useState<string>("");
  const [customBgSrc, setCustomBgSrc] = useState<string | null>(null);

  // Transform States
  const [scale, setScale] = useState([100]);
  const [posX, setPosX] = useState([0]);
  const [posY, setPosY] = useState([0]);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
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
      reader.onload = (e) => setOriginalImageSrc(e.target?.result as string);
      reader.readAsDataURL(file);
      setSubjectImageSrc(null);
      setFinalImageSrc(null);
      setProgress(0);
      setBgType("none");
      resetTransforms();
    } else if (file) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please select an image file." });
    }
  };

  const resetTransforms = () => {
    setScale([100]);
    setPosX([0]);
    setPosY([0]);
    setFlipH(false);
    setFlipV(false);
  };

  const handleRemoveBackgroundLocal = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setSubjectImageSrc(null);
    setProgress(5);
    setStatusText("Initializing Local AI...");

    try {
      const imglyModule = await import("@imgly/background-removal");
      const removeBackgroundFunc = imglyModule.removeBackground || imglyModule.default;
      
      const blob = await removeBackgroundFunc(originalImageSrc, {
        progress: (item, index, total) => {
            const p = Math.round((index / total) * 100);
            setProgress(p);
            if (item.includes("model")) setStatusText("Loading Model...");
            else setStatusText("Extracting Subject...");
        },
        output: { format: "image/png", quality: 0.95 }
      });

      const url = URL.createObjectURL(blob);
      setSubjectImageSrc(url);
      setFinalImageSrc(url); 
      setProgress(100);
      setStatusText("Done!");
      toast({ title: "Success!", description: "Background removed locally." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Local Processing Error", description: "Could not remove background. Try Cloud AI mode." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveBackgroundCloud = async () => {
      if (!originalImageSrc) return;
      setIsProcessing(true);
      setSubjectImageSrc(null);
      setProgress(20);
      setStatusText("Connecting to AI Cloud...");

      try {
          const result = await removeBackgroundAI({ photoDataUri: originalImageSrc });
          if (result.imageDataUri) {
              setSubjectImageSrc(result.imageDataUri);
              setFinalImageSrc(result.imageDataUri);
              setProgress(100);
              setStatusText("Precision Removal Complete");
              toast({ title: "Precision Removal Success!", description: "Hand and limbs preserved perfectly." });
          }
      } catch (error: any) {
          toast({ variant: "destructive", title: "Cloud AI Error", description: error.message || "Failed to process image. Use Local mode as fallback." });
      } finally {
          setIsProcessing(false);
      }
  };

  const handleAction = () => {
      if (removalMode === 'cloud') handleRemoveBackgroundCloud();
      else handleRemoveBackgroundLocal();
  };

  useEffect(() => {
    if (!subjectImageSrc) return;

    const composite = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const subjectImg = new window.Image();
        subjectImg.src = subjectImageSrc;
        
        subjectImg.onload = () => {
            canvas.width = subjectImg.width;
            canvas.height = subjectImg.height;

            if (bgType === "color" && bgValue) {
                ctx.fillStyle = bgValue;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (bgType === "gradient" && bgValue) {
                const preset = PRESET_GRADIENTS.find(g => g.value === bgValue);
                const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                if (preset) {
                    grd.addColorStop(0, preset.colors[0]);
                    grd.addColorStop(1, preset.colors[1]);
                } else {
                    const hexMatches = bgValue.match(/#[a-fA-F0-9]{6}/g);
                    if (hexMatches && hexMatches.length >= 2) {
                        grd.addColorStop(0, hexMatches[0]);
                        grd.addColorStop(1, hexMatches[1]);
                    } else {
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                }
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (bgType === "image" && customBgSrc) {
                const bgImg = new window.Image();
                bgImg.src = customBgSrc;
                bgImg.onload = () => {
                    const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
                    const x = (canvas.width / 2) - (bgImg.width / 2) * scale;
                    const y = (canvas.height / 2) - (bgImg.height / 2) * scale;
                    ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
                    drawSubject(ctx, subjectImg, canvas);
                };
                return;
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            if (bgType !== 'image') {
                drawSubject(ctx, subjectImg, canvas);
            }
        };
    };

    const drawSubject = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvas: HTMLCanvasElement) => {
        const s = scale[0] / 100;
        const dw = img.width * s;
        const dh = img.height * s;
        
        const dx = (posX[0] / 100) * canvas.width;
        const dy = (posY[0] / 100) * canvas.height;

        const x = (canvas.width - dw) / 2 + dx;
        const y = (canvas.height - dh) / 2 + dy;

        ctx.save();
        ctx.translate(x + dw / 2, y + dh / 2);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();

        setFinalImageSrc(canvas.toDataURL("image/png"));
    };

    composite();
  }, [subjectImageSrc, bgType, bgValue, customBgSrc, scale, posX, posY, flipH, flipV]);

  const handleCustomBgUpload = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              setCustomBgSrc(e.target?.result as string);
              setBgType("image");
          };
          reader.readAsDataURL(file);
      }
  };

  const handleDownload = () => {
    if (!finalImageSrc) return;
    const link = document.createElement("a");
    link.href = finalImageSrc;
    link.download = `background-removed-${Date.now()}.png`;
    link.click();
  };

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setSubjectImageSrc(null);
    setFinalImageSrc(null);
    setCustomBgSrc(null);
    setBgType("none");
    resetTransforms();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!originalImageSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0]); }}
      >
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center justify-center gap-2 text-gradient-primary uppercase tracking-tighter">
            <Eraser className="text-primary h-8 w-8" /> Precision AI Remover
          </CardTitle>
          <CardDescription>Advanced background removal that preserves human limbs, hair, and edges.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group relative overflow-hidden" onClick={() => fileInputRef.current?.click()}>
            <div className="relative z-10">
                <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
                <Zap className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
            <div className="z-10">
                <p className="text-xl font-bold">Drop photo here to begin</p>
                <p className="text-sm text-muted-foreground mt-2">Best for complex poses, groups, and detailed fashion photos.</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
        </CardContent>
        <CardFooter className="justify-center gap-6 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 border-t pt-8 bg-muted/5">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> Limb Preservation</div>
            <div className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-primary" /> HD Rendering</div>
            <div className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-purple-500" /> AI Cloud Engine</div>
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
                        {subjectImageSrc ? <Sparkles className="h-3 w-3 text-primary" /> : <Cpu className="h-3 w-3" />}
                        {subjectImageSrc ? "Precision Render Result" : "Source Preview"}
                    </CardTitle>
                    {subjectImageSrc && <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[9px] font-black">AI OPTIMIZED</Badge>}
                </CardHeader>
                <CardContent className="p-0 aspect-square md:aspect-video relative bg-white flex items-center justify-center min-h-[400px]" style={!finalImageSrc || (bgType === 'none') ? checkerboardStyle : {}}>
                    {isProcessing ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/95 backdrop-blur-md p-8 text-center gap-8">
                            <div className="relative">
                                <Loader2 className="h-20 w-20 animate-spin text-primary stroke-[3]" />
                                <CloudLightning className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-4 w-full max-w-sm">
                                <p className="font-black text-2xl text-primary animate-pulse uppercase tracking-tighter">{statusText}</p>
                                <Progress value={progress} className="h-2 shadow-inner" />
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                    {removalMode === 'cloud' ? "Analyzing anatomy to preserve hands and edges..." : "Processing locally on your device..."}
                                </p>
                            </div>
                        </div>
                    ) : finalImageSrc ? (
                        <Image src={finalImageSrc} alt="Result" fill className="object-contain p-8 animate-in zoom-in-95 duration-500" />
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
                    <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20" onClick={handleAction} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : removalMode === 'cloud' ? <CloudLightning className="mr-3 h-6 w-6 text-yellow-400" /> : <Cpu className="mr-3 h-6 w-6" />}
                        {removalMode === 'cloud' ? "PRECISION REMOVAL" : "LOCAL REMOVAL"}
                    </Button>
                ) : (
                    <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20" onClick={handleDownload}>
                        <Download className="mr-3 h-6 w-6" /> DOWNLOAD STUDIO HD
                    </Button>
                )}
            </div>
        </div>

        {/* Controls Area */}
        <div className={cn("lg:col-span-4 space-y-6 transition-all duration-500", !originalImageSrc && "opacity-20 pointer-events-none grayscale")}>
            
            {/* Mode Selector - ONLY if not processed yet */}
            {!subjectImageSrc && (
                <Card className="border-2 shadow-xl border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                            <CloudLightning className="size-4 text-primary" /> Accuracy Level
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={removalMode} onValueChange={(v) => setRemovalMode(v as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-12 p-1">
                                <TabsTrigger value="cloud" className="text-[10px] font-black">PRECISION (AI)</TabsTrigger>
                                <TabsTrigger value="local" className="text-[10px] font-black">STANDARD (FAST)</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="mt-4 flex gap-3 items-start p-3 bg-white/50 rounded-xl border border-primary/10">
                            <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                <strong>Precision AI:</strong> Recommended for humans. Best at preserving fingers, limbs, and hair. No limbs will be cut.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="border-2 shadow-xl border-primary/10">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2 font-headline">
                        <Palette className="h-5 w-5 text-primary" /> STUDIO PANEL
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <Tabs defaultValue="bg" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="bg" className="text-[10px] font-black uppercase">Colors</TabsTrigger>
                            <TabsTrigger value="upload" className="text-[10px] font-black uppercase">Custom</TabsTrigger>
                            <TabsTrigger value="transform" className="text-[10px] font-black uppercase">Adjust</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="bg" className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Solid Canvas</Label>
                                <div className="grid grid-cols-5 gap-2.5">
                                    <button 
                                        className={cn("size-9 rounded-xl border-2 transition-all hover:scale-105", bgType === 'none' && "border-primary ring-2 ring-primary/20")}
                                        style={checkerboardStyle}
                                        onClick={() => setBgType("none")}
                                    />
                                    {PRESET_COLORS.map(color => (
                                        <button 
                                            key={color}
                                            className={cn("size-9 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 shadow-sm", bgType === 'color' && bgValue === color && "border-primary ring-2 ring-primary/20")}
                                            style={{ backgroundColor: color }}
                                            onClick={() => { setBgType("color"); setBgValue(color); }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Gradients</Label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {PRESET_GRADIENTS.map((grad) => (
                                        <button 
                                            key={grad.label}
                                            className={cn("h-11 rounded-xl border-2 transition-all hover:scale-[1.02] flex items-center justify-center text-[8px] font-black text-white shadow-inner uppercase tracking-tighter", bgType === 'gradient' && bgValue === grad.value && "border-primary ring-2 ring-primary/20")}
                                            style={{ backgroundImage: grad.value }}
                                            onClick={() => { setBgType("gradient"); setBgValue(grad.value); }}
                                        >
                                            {grad.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="upload" className="space-y-4">
                             <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Upload Backdrop</Label>
                             <div 
                                className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-primary/5 transition-colors group"
                                onClick={() => bgInputRef.current?.click()}
                             >
                                 <ImageIcon className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                                 <p className="text-[10px] font-black uppercase text-center text-muted-foreground">Select New Background</p>
                             </div>
                             <input ref={bgInputRef} type="file" className="hidden" accept="image/*" onChange={handleCustomBgUpload} />
                             {customBgSrc && (
                                 <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl border border-primary/20">
                                     <div className="size-12 relative rounded-lg overflow-hidden border">
                                         <Image src={customBgSrc} alt="custom" fill className="object-cover" />
                                     </div>
                                     <span className="text-[10px] font-black uppercase truncate flex-1 text-primary tracking-tighter">Custom Scene Active</span>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setCustomBgSrc(null); setBgType("none"); }}>
                                         <X className="h-4 w-4" />
                                     </Button>
                                 </div>
                             )}
                        </TabsContent>

                        <TabsContent value="transform" className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-black uppercase flex items-center gap-1.5 text-muted-foreground"><Maximize className="size-3" /> Zoom Subject</Label>
                                    <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-primary">{scale[0]}%</span>
                                </div>
                                <Slider min={10} max={200} step={1} value={scale} onValueChange={setScale} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-black uppercase flex items-center gap-1.5 text-muted-foreground"><Move className="size-3" /> Horizontal</Label>
                                    <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-primary">{posX[0]}%</span>
                                </div>
                                <Slider min={-100} max={100} step={1} value={posX} onValueChange={setPosX} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-black uppercase flex items-center gap-1.5 text-muted-foreground"><Move className="size-3" /> Vertical</Label>
                                    <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-primary">{posY[0]}%</span>
                                </div>
                                <Slider min={-100} max={100} step={1} value={posY} onValueChange={setPosY} />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button 
                                    variant={flipH ? "default" : "outline"} 
                                    size="sm" 
                                    className="text-[10px] h-10 font-black uppercase rounded-xl border-2" 
                                    onClick={() => setFlipH(!flipH)}
                                >
                                    <FlipHorizontal className="size-3 mr-1.5" /> Flip H
                                </Button>
                                <Button 
                                    variant={flipV ? "default" : "outline"} 
                                    size="sm" 
                                    className="text-[10px] h-10 font-black uppercase rounded-xl border-2" 
                                    onClick={() => setFlipV(!flipV)}
                                >
                                    <FlipVertical className="size-3 mr-1.5" /> Flip V
                                </Button>
                            </div>

                            <Button variant="outline" size="sm" className="w-full text-[10px] h-10 font-black uppercase mt-2 rounded-xl border-2" onClick={resetTransforms}>
                                <RotateCcw className="size-3 mr-1.5" /> Reset Transforms
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="bg-muted/5 border-t py-4">
                    <p className="text-[9px] text-muted-foreground text-center w-full font-medium leading-relaxed italic">
                        All cloud processing is secure. Use Precision mode for official documents and portfolio shots.
                    </p>
                </CardFooter>
            </Card>
        </div>
      </div>
      
      {/* Offscreen rendering canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
