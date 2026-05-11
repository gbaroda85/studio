
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
  UploadCloud, 
  Loader2, 
  Download, 
  X, 
  Eraser, 
  Sparkles, 
  Undo2, 
  MousePointer2,
  Trash2,
  Settings2,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { removeSignature } from "@/ai/flows/remove-signature-flow";
import { useLanguage } from "@/contexts/language-context";

export default function SignatureRemover() {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // File States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resultImageSrc, setResultImageSrc] = useState<string | null>(null);
  
  // App States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mode, setMode] = useState<"ai" | "manual">("manual");
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Canvas Eraser States
  const [brushSize, setBrushSize] = useState([20]);
  const [history, setHistory] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Canvas with Image
  useEffect(() => {
    if (originalImageSrc && mode === "manual" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const img = new window.Image();
      img.src = originalImageSrc;
      img.onload = () => {
        // Adjust canvas size to match image aspect ratio while fitting container
        const containerWidth = containerRef.current?.offsetWidth || 800;
        const scale = containerWidth / img.width;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        setHistory([canvas.toDataURL()]);
      };
    }
  }, [originalImageSrc, mode]);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImageSrc(e.target?.result as string);
        setResultImageSrc(null);
        setHistory([]);
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

  // --- AI LOGIC ---
  const handleRemoveSignatureAI = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setResultImageSrc(null);
    try {
      const result = await removeSignature({ photoDataUri: originalImageSrc });
      setResultImageSrc(result.imageDataUri);
      toast({ title: "Success!", description: "AI removed the signature successfully." });
    } catch (error: any) {
      console.error(error);
      const isQuotaError = error.message?.includes("429") || error.message?.includes("quota");
      toast({ 
        variant: "destructive", 
        title: isQuotaError ? "AI Quota Exceeded" : "AI Error", 
        description: isQuotaError 
          ? "AI limit reached. Please use the 'Magic Eraser' mode instead, it works without any limits!" 
          : "AI failed. Switching to manual mode is recommended." 
      });
      setMode("manual");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- MAGIC ERASER LOGIC (LOCAL) ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      const ctx = canvasRef.current.getContext("2d");
      ctx?.beginPath(); // Reset path
      setHistory(prev => [...prev, canvasRef.current!.toDataURL()]);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // "Magic" Part: Sample surrounding pixels to get the document color
    // We pick a pixel slightly outside the brush tip to get the background color
    const sampleDist = brushSize[0] * 1.2;
    const pixelData = ctx.getImageData(x - sampleDist, y - sampleDist, 1, 1).data;
    const bgColor = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;

    ctx.lineWidth = brushSize[0];
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = bgColor;
    
    // Add a slight blur effect to make it seamless
    ctx.shadowBlur = 2;
    ctx.shadowColor = bgColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current
      const lastState = newHistory[newHistory.length - 1];
      
      const img = new window.Image();
      img.src = lastState;
      img.onload = () => {
        const ctx = canvasRef.current?.getContext("2d");
        ctx?.drawImage(img, 0, 0);
      };
      setHistory(newHistory);
    }
  };

  const handleDownload = () => {
    const finalSrc = mode === 'ai' ? resultImageSrc : canvasRef.current?.toDataURL();
    if (!finalSrc || !imageFile) return;
    
    const link = document.createElement("a");
    link.href = finalSrc;
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
    setHistory([]);
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
          <CardDescription>Upload a document to remove signatures using AI or Magic Eraser.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">
              <span className="text-primary font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">Works with receipts, IDs, and handwritten documents</p>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Eraser className="text-primary" /> Signature Remover
            </h2>
            <p className="text-sm text-muted-foreground">Choose between Automatic AI or Manual Magic Eraser.</p>
        </div>
        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="gap-2">
                    <MousePointer2 className="h-4 w-4" /> Magic Eraser
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-2">
                    <Sparkles className="h-4 w-4" /> AI Auto
                </TabsTrigger>
            </TabsList>
        </Tabs>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-8 flex flex-col gap-4">
            <Card className="overflow-hidden bg-muted/20 border-2">
                <CardContent className="p-0 relative flex items-center justify-center min-h-[400px]" ref={containerRef}>
                    {mode === 'ai' ? (
                        <div className="relative w-full aspect-auto flex items-center justify-center p-4">
                            {isProcessing && (
                                <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="font-bold text-primary animate-pulse">AI is cleaning the document...</p>
                                </div>
                            )}
                            <Image 
                                src={resultImageSrc || originalImageSrc} 
                                alt="Document" 
                                width={1200} 
                                height={800} 
                                className="max-w-full h-auto shadow-lg rounded-sm" 
                            />
                        </div>
                    ) : (
                        <div className="relative cursor-crosshair touch-none select-none p-4">
                            <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="max-w-full h-auto shadow-2xl rounded-sm bg-white"
                            />
                            <div className="absolute top-8 left-8 pointer-events-none opacity-50 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                                Paint over signatures to erase them
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <div className="flex justify-between items-center px-2">
                <Button variant="outline" size="sm" onClick={handleReset} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Clear All
                </Button>
                {mode === 'manual' && (
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={handleUndo} disabled={history.length <= 1}>
                            <Undo2 className="h-4 w-4 mr-2" /> Undo
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => {
                             const img = new window.Image();
                             img.src = originalImageSrc!;
                             img.onload = () => canvasRef.current?.getContext('2d')?.drawImage(img, 0, 0);
                             setHistory([originalImageSrc!]);
                        }}>
                            <RotateCcw className="h-4 w-4 mr-2" /> Reset Canvas
                        </Button>
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
            {mode === 'manual' ? (
                <Card className="border-primary/20 shadow-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Settings2 className="h-5 w-5 text-primary" /> Eraser Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="font-bold">Brush Size</Label>
                                <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">{brushSize[0]}px</span>
                            </div>
                            <Slider 
                                value={brushSize} 
                                onValueChange={setBrushSize} 
                                min={5} 
                                max={100} 
                                step={1} 
                            />
                        </div>
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                            <h4 className="text-xs font-bold uppercase text-primary mb-2">How Magic Eraser Works:</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                This tool automatically samples the background color (paper color) around your brush stroke to paint over the signature. It works 100% offline and has no limits.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                        <Button className="w-full h-14 text-lg font-bold" onClick={handleDownload}>
                            <Download className="mr-2 h-5 w-5" /> Download Result
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card className="border-primary/20 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-lg">AI Automation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            AI mode analyzes the whole document and tries to identify signatures automatically to remove them while restoring text underneath.
                        </p>
                        <Button 
                            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-violet-600 hover:opacity-90" 
                            onClick={handleRemoveSignatureAI} 
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                            Start AI Removal
                        </Button>
                    </CardContent>
                    {resultImageSrc && (
                        <CardFooter>
                            <Button variant="outline" className="w-full h-12" onClick={handleDownload}>
                                <Download className="mr-2" /> Download AI Result
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            )}
            
            <div className="text-center">
                <p className="text-[10px] text-muted-foreground px-8">
                    Tip: For best results on documents with complex backgrounds, use the Manual Magic Eraser with a smaller brush size.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
