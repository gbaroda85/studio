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
    Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const PRESET_COLORS = [
    "#ffffff", "#000000", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#f3f4f6"
];

const PRESET_GRADIENTS = [
    "linear-gradient(to right, #ff7e5f, #feb47b)",
    "linear-gradient(to right, #6a11cb, #2575fc)",
    "linear-gradient(to right, #00b09b, #96c93d)",
    "linear-gradient(to right, #f83600, #f9d423)",
    "linear-gradient(to right, #ee0979, #ff6a00)",
    "linear-gradient(to right, #4facfe, #00f2fe)",
];

export default function BackgroundRemover() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [subjectImageSrc, setSubjectImageSrc] = useState<string | null>(null); // Only the transparent subject
  const [finalImageSrc, setFinalImageSrc] = useState<string | null>(null); // Subject + New Background
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  
  // Background Options State
  const [bgType, setBgType] = useState<"none" | "color" | "gradient" | "image">("none");
  const [bgValue, setBgValue] = useState<string>("");
  const [customBgSrc, setCustomBgSrc] = useState<string | null>(null);
  
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
    } else if (file) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please select an image file." });
    }
  };

  const handleRemoveBackground = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setSubjectImageSrc(null);
    setProgress(5);
    setStatusText("Initializing Smart Engine...");

    try {
      const imglyModule = await import("@imgly/background-removal");
      const removeBackgroundFunc = imglyModule.removeBackground || imglyModule.default;
      
      const blob = await removeBackgroundFunc(originalImageSrc, {
        progress: (item, index, total) => {
            const p = Math.round((index / total) * 100);
            setProgress(p);
            if (item.includes("model")) setStatusText("Loading AI Model...");
            else setStatusText("Removing Background...");
        },
        output: { format: "image/png", quality: 0.95 }
      });

      const url = URL.createObjectURL(blob);
      setSubjectImageSrc(url);
      setFinalImageSrc(url); 
      setProgress(100);
      setStatusText("Done!");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Processing Error", description: "Could not remove background. Try another photo." });
    } finally {
      setIsProcessing(false);
    }
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
                const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                if (bgValue.includes("#")) {
                    const colors = bgValue.match(/#[a-fA-F0-0]{6}/g) || ["#ffffff", "#000000"];
                    grd.addColorStop(0, colors[0]);
                    grd.addColorStop(1, colors[1] || colors[0]);
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
                    ctx.drawImage(subjectImg, 0, 0);
                    setFinalImageSrc(canvas.toDataURL("image/png"));
                };
                return;
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(subjectImg, 0, 0);
            setFinalImageSrc(canvas.toDataURL("image/png"));
        };
    };

    composite();
  }, [subjectImageSrc, bgType, bgValue, customBgSrc]);

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
    link.download = `edited-${imageFile?.name || "photo"}.png`;
    link.click();
  };

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setSubjectImageSrc(null);
    setFinalImageSrc(null);
    setCustomBgSrc(null);
    setBgType("none");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!originalImageSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0]); }}
      >
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center justify-center gap-2">
            <Eraser className="text-primary h-8 w-8" /> PRO Background Studio
          </CardTitle>
          <CardDescription>Remove & Replace backgrounds instantly. 100% Private.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/50 rounded-2xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/50 transition-all group" onClick={() => fileInputRef.current?.click()}>
            <div className="relative">
                <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
                <Zap className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
            <div>
                <p className="text-xl font-bold">Drop photo here or Click to select</p>
                <p className="text-sm text-muted-foreground mt-2">Works best for people, pets, and products</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
        </CardContent>
        <CardFooter className="justify-center gap-6 text-xs text-muted-foreground font-medium pb-8">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> 100% Private</div>
            <div className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-primary" /> Multi-Layer Editing</div>
            <div className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-purple-500" /> HD Output</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-8 space-y-6">
            <Card className="overflow-hidden border-2 shadow-2xl">
                <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        {subjectImageSrc ? <Layers className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                        {subjectImageSrc ? "Studio Preview" : "Original Image"}
                    </CardTitle>
                    {subjectImageSrc && <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">HD Render Ready</Badge>}
                </CardHeader>
                <CardContent className="p-0 aspect-square md:aspect-video relative bg-white flex items-center justify-center" style={!finalImageSrc || bgType === 'none' ? checkerboardStyle : {}}>
                    {isProcessing ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 backdrop-blur-sm p-8 text-center">
                            <div className="relative mb-6">
                                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-4 w-full max-w-xs">
                                <p className="font-black text-xl text-primary animate-pulse uppercase tracking-tight">{statusText}</p>
                                <Progress value={progress} className="h-2" />
                            </div>
                        </div>
                    ) : finalImageSrc ? (
                        <Image src={finalImageSrc} alt="Result" fill className="object-contain p-4 animate-in zoom-in-95 duration-500" />
                    ) : (
                        <Image src={originalImageSrc} alt="Original" fill className="object-contain p-4" />
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button variant="outline" size="lg" onClick={handleReset} disabled={isProcessing} className="w-full sm:w-auto h-14 px-8 border-2 font-bold">
                    <X className="mr-2 h-5 w-5" /> Start Over
                </Button>
                {!subjectImageSrc ? (
                    <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleRemoveBackground} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Eraser className="mr-3 h-6 w-6" />}
                        PROCESS IMAGE
                    </Button>
                ) : (
                    <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20" onClick={handleDownload}>
                        <Download className="mr-3 h-6 w-6" /> DOWNLOAD STUDIO RESULT
                    </Button>
                )}
            </div>
        </div>

        <div className={cn("lg:col-span-4 space-y-6 transition-all duration-500", !subjectImageSrc && "opacity-20 pointer-events-none grayscale")}>
            <Card className="border-2 shadow-xl border-primary/10">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" /> Background Studio
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <Tabs defaultValue="colors" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="colors">Solid</TabsTrigger>
                            <TabsTrigger value="gradients">Gradients</TabsTrigger>
                            <TabsTrigger value="upload">Upload</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="colors" className="space-y-4">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Select Color</Label>
                            <div className="grid grid-cols-5 gap-3">
                                <button 
                                    className={cn("size-10 rounded-lg border-2", bgType === 'none' && "border-primary ring-2 ring-primary/20")}
                                    style={checkerboardStyle}
                                    onClick={() => setBgType("none")}
                                />
                                {PRESET_COLORS.map(color => (
                                    <button 
                                        key={color}
                                        className={cn("size-10 rounded-lg border-2 transition-transform active:scale-90", bgType === 'color' && bgValue === color && "border-primary ring-2 ring-primary/20")}
                                        style={{ backgroundColor: color }}
                                        onClick={() => { setBgType("color"); setBgValue(color); }}
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="gradients" className="space-y-4">
                             <Label className="text-xs font-bold uppercase text-muted-foreground">Select Gradient</Label>
                             <div className="grid grid-cols-2 gap-3">
                                {PRESET_GRADIENTS.map((grad, i) => (
                                    <button 
                                        key={i}
                                        className={cn("h-12 rounded-lg border-2 transition-all hover:scale-[1.02]", bgType === 'gradient' && bgValue === grad && "border-primary ring-2 ring-primary/20")}
                                        style={{ backgroundImage: grad }}
                                        onClick={() => { setBgType("gradient"); setBgValue(grad); }}
                                    />
                                ))}
                             </div>
                        </TabsContent>

                        <TabsContent value="upload" className="space-y-4">
                             <Label className="text-xs font-bold uppercase text-muted-foreground">Custom Backdrop</Label>
                             <div 
                                className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 transition-colors"
                                onClick={() => bgInputRef.current?.click()}
                             >
                                 <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                 <p className="text-[10px] font-bold text-center">Click to upload custom background</p>
                             </div>
                             <input ref={bgInputRef} type="file" className="hidden" accept="image/*" onChange={handleCustomBgUpload} />
                             {customBgSrc && (
                                 <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                                     <div className="size-10 relative rounded overflow-hidden">
                                         <Image src={customBgSrc} alt="custom" fill className="object-cover" />
                                     </div>
                                     <span className="text-[10px] font-bold truncate flex-1">Custom Image Active</span>
                                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setCustomBgSrc(null); setBgType("none"); }}>
                                         <X className="h-3 w-3" />
                                     </Button>
                                 </div>
                             )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t py-4">
                    <p className="text-[10px] text-muted-foreground text-center w-full italic">
                        Tip: Use white or blue backgrounds for official document photos.
                    </p>
                </CardFooter>
            </Card>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
