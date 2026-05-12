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
    Move,
    Maximize,
    RotateCcw,
    Paintbrush,
    Undo2,
    CheckCircle2,
    MousePointer2,
    Eye
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
  
  // Refinement States
  const [isRefining, setIsRefining] = useState(false);
  const [brushMode, setBrushMode] = useState<"restore" | "erase">("restore");
  const [brushSize, setBrushSize] = useState([20]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
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
      setFinalImageSrc(null);
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
            else setStatusText("Scanning Anatomy...");
        },
        output: { format: "image/png", quality: 0.95 }
      });

      const url = URL.createObjectURL(blob);
      setSubjectImageSrc(url);
      setFinalImageSrc(url); 
      setProgress(100);
      setStatusText("Done!");
      toast({ title: "Extraction Complete", description: "If limbs are cut, use 'Refine Brush' to fix." });
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Processing Error", description: "Could not remove background locally." });
    } finally {
      setIsProcessing(false);
    }
  };

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
      if (!canvas || e.buttons !== 1 && !('touches' in e)) return;
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
          // To restore, we need to draw from original photo but masked by brush
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
      
      setFinalImageSrc(canvas.toDataURL("image/png"));
  };

  const saveRefinement = () => {
      setSubjectImageSrc(finalImageSrc);
      setIsRefining(false);
      toast({ title: "Changes Saved" });
  };

  const handleDownload = () => {
    if (!finalImageSrc) return;
    const link = document.createElement("a");
    link.href = finalImageSrc;
    link.download = `bg-removed-${Date.now()}.png`;
    link.click();
  };

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setSubjectImageSrc(null);
    setFinalImageSrc(null);
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
          <CardTitle className="text-3xl font-black">Pro Background Remover</CardTitle>
          <CardDescription>Privacy-first local AI extraction with Manual Refinement Brush to fix cut limbs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
                <p className="text-xl font-bold">Drop photo here to begin</p>
                <p className="text-sm text-muted-foreground mt-2">No API Limits. 100% Free & Secure.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
        </CardContent>
        <CardFooter className="justify-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 border-t pt-8">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> No Data Uploads</div>
            <div className="flex items-center gap-1.5"><Paintbrush className="h-4 w-4 text-primary" /> Manual Fix Tool</div>
            <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-yellow-500" /> Unlimited Uses</div>
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
                        {isRefining ? "Refinement Studio (Paint to Restore)" : subjectImageSrc ? "AI Render Result" : "Source Preview"}
                    </CardTitle>
                    {subjectImageSrc && !isRefining && <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[9px] font-black">AI EXTRACTED</Badge>}
                </CardHeader>
                <CardContent className="p-0 aspect-square md:aspect-video relative bg-white flex items-center justify-center min-h-[450px]" style={subjectImageSrc ? checkerboardStyle : {}}>
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
                    ) : finalImageSrc ? (
                        <Image src={finalImageSrc} alt="Result" fill className="object-contain p-8 animate-in zoom-in-95 duration-500" />
                    ) : (
                        <Image src={originalImageSrc} alt="Original" fill className="object-contain p-8" />
                    )}
                    
                    {!isProcessing && isRefining && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-primary/90 text-white rounded-full text-xs font-black uppercase shadow-xl">
                            <MousePointer2 className="size-3" /> Painting to {brushMode}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button variant="outline" size="lg" onClick={handleReset} disabled={isProcessing} className="w-full sm:w-auto h-14 px-8 border-2 font-black uppercase text-xs">
                    <RotateCcw className="mr-2 h-4 w-4" /> Start Over
                </Button>
                {!subjectImageSrc ? (
                    <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20" onClick={handleRemoveBackgroundLocal} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Zap className="mr-3 h-6 w-6 text-yellow-400" />}
                        START LOCAL AI REMOVAL
                    </Button>
                ) : isRefining ? (
                    <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl" onClick={saveRefinement}>
                        <CheckCircle2 className="mr-3 h-6 w-6" /> SAVE REFINEMENT
                    </Button>
                ) : (
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button variant="secondary" size="lg" className="flex-1 h-14 px-8 font-black uppercase text-xs border-2 border-primary/20" onClick={startRefining}>
                            <Paintbrush className="mr-2 h-4 w-4 text-primary" /> Refine Brush (Fix Hand)
                        </Button>
                        <Button size="lg" className="flex-1 h-14 px-12 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl" onClick={handleDownload}>
                            <Download className="mr-3 h-6 w-6" /> DOWNLOAD PNG
                        </Button>
                    </div>
                )}
            </div>
        </div>

        {/* Controls Area */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 shadow-xl border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2 font-black uppercase tracking-tighter">
                        <Paintbrush className="h-5 w-5 text-primary" /> {isRefining ? "BRUSH SETTINGS" : "REFINEMENT PANEL"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-8 space-y-8">
                    {!subjectImageSrc ? (
                        <div className="p-6 bg-muted/20 rounded-2xl border-2 border-dashed flex flex-col items-center gap-4 text-center">
                            <Zap className="size-10 text-primary opacity-20" />
                            <p className="text-xs font-bold text-muted-foreground">Click "START LOCAL AI" to begin processing without any limits.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/20 flex gap-3">
                                <CheckCircle2 className="size-5 text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-green-700 uppercase">AI Pass Complete</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                                        If the AI cut any part (like hands), use the **Refine Brush** to paint it back from the original.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Brush Action</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button 
                                            variant={brushMode === 'restore' ? "default" : "outline"}
                                            className="h-14 flex-col gap-1 rounded-2xl border-2"
                                            onClick={() => setBrushMode('restore')}
                                            disabled={!isRefining}
                                        >
                                            <Undo2 className="size-5" />
                                            <span className="text-[8px] font-black uppercase">Restore (Fix)</span>
                                        </Button>
                                        <Button 
                                            variant={brushMode === 'erase' ? "default" : "outline"}
                                            className="h-14 flex-col gap-1 rounded-2xl border-2"
                                            onClick={() => setBrushMode('erase')}
                                            disabled={!isRefining}
                                        >
                                            <Eraser className="size-5" />
                                            <span className="text-[8px] font-black uppercase">Erase (Cleanup)</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Brush Size</Label>
                                        <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{brushSize[0]}px</span>
                                    </div>
                                    <Slider min={5} max={100} step={1} value={brushSize} onValueChange={setBrushSize} disabled={!isRefining} />
                                </div>
                            </div>
                            
                            {!isRefining ? (
                                <Button variant="secondary" className="w-full h-12 font-black border-2" onClick={startRefining}>
                                    ACTIVATE REFINE BRUSH
                                </Button>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                     <Button className="w-full h-14 bg-green-600 font-black text-lg" onClick={saveRefinement}>APPLY BRUSH FIX</Button>
                                     <Button variant="ghost" className="w-full text-xs font-bold" onClick={() => setIsRefining(false)}>CANCEL</Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-muted/5 border-t py-4 text-center">
                    <p className="text-[9px] text-muted-foreground w-full font-medium italic">
                        All processing is 100% private. No cloud limits. No data sent to servers.
                    </p>
                </CardFooter>
            </Card>
        </div>
      </div>
      
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
