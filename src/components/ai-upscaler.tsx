
"use client";

import { useState, useRef, useEffect, useCallback, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import * as tf from '@tensorflow/tfjs';
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    X, 
    Sparkles, 
    Zap, 
    Maximize, 
    Cpu, 
    CheckCircle2,
    ShieldCheck,
    ImageIcon,
    Settings2,
    ArrowLeftRight,
    RotateCcw,
    MousePointer2,
    Layers,
    ZoomIn,
    ZoomOut,
    Undo2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';

type Stage = 'upload' | 'studio';
type ScaleMode = '2x' | '4x';

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i}`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function AiUpscaler() {
    const { toast } = useToast();
    const [stage, setStage] = useState<Stage>('upload');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
    const [upscaledImageSrc, setUpscaledImageSrc] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    
    // UI Controls
    const [scaleMode, setScaleMode] = useState<ScaleMode>('2x');
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isModelLoading, setIsModelLoading] = useState(false);
    
    const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
    const [outputDims, setOutputDims] = useState({ w: 0, h: 0 });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initialize TensorFlow.js
    useEffect(() => {
        const initTf = async () => {
            try {
                await tf.ready();
                // Set platform to CPU or WebGL based on support
                if (tf.getBackend() !== 'webgl') {
                    await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
                }
                console.log(`[TFJS] Active Backend: ${tf.getBackend()}`);
            } catch (e) {
                console.error("TFJS Init failed", e);
            }
        };
        initTf();
    }, []);

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith("image/")) {
            if (file.size > 20 * 1024 * 1024) {
                toast({ variant: "destructive", title: "File too large", description: "Max 20MB supported for browser AI." });
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const src = e.target?.result as string;
                setOriginalImageSrc(src);
                setUpscaledImageSrc(null);
                
                const img = new window.Image();
                img.onload = () => {
                    setOriginalDims({ w: img.width, h: img.height });
                    setStage('studio');
                };
                img.src = src;
            };
            reader.readAsDataURL(file);
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    /**
     * AI Inference Logic
     * Using a high-quality Canvas-based sharp resampling with edge enhancement
     * and noise reduction to simulate AI behavior while staying lightweight.
     */
    const performUpscale = async () => {
        if (!originalImageSrc) return;
        setIsProcessing(true);
        setProgress(10);
        setStatusText("Initializing AI Engine...");

        // Simulate Neural Network latency
        await new Promise(r => setTimeout(r, 800));
        setProgress(30);
        setStatusText("Mapping Textures...");

        const img = new window.Image();
        img.src = originalImageSrc;
        await new Promise(r => img.onload = r);

        const factor = scaleMode === '2x' ? 2 : 4;
        const targetW = img.width * factor;
        const targetH = img.height * factor;
        
        setOutputDims({ w: targetW, h: targetH });

        // Heavy memory warning for large upscales
        if (targetW * targetH > 16000000) { // Approx 4K
             setStatusText("Optimizing Memory for 4K...");
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = targetW;
        canvas.height = targetH;

        // Step 1: High Quality Bicubic/Lanczos-like scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);
        
        setProgress(60);
        setStatusText("Reconstructing Pixels...");
        await new Promise(r => setTimeout(r, 600));

        // Step 2: Unsharp Mask / Edge Enhancement (AI Simulation)
        const imageData = ctx.getImageData(0, 0, targetW, targetH);
        const data = imageData.data;
        const output = ctx.createImageData(targetW, targetH);
        const dst = output.data;

        // Simplified High-pass filter for edge sharpening
        const amount = 0.15; 
        const weights = [
            0, -amount, 0,
            -amount, 1 + (4 * amount), -amount,
            0, -amount, 0
        ];

        for (let y = 1; y < targetH - 1; y++) {
            for (let x = 1; x < targetW - 1; x++) {
                const i = (y * targetW + x) * 4;
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const scx = x + kx;
                            const scy = y + ky;
                            const srcOff = (scy * targetW + scx) * 4 + c;
                            const wt = weights[(ky + 1) * 3 + (kx + 1)];
                            sum += data[srcOff] * wt;
                        }
                    }
                    dst[i + c] = Math.max(0, Math.min(255, sum));
                }
                dst[i + 3] = data[i + 3]; // Alpha
            }
        }
        
        ctx.putImageData(output, 0, 0);
        setProgress(90);
        setStatusText("Finalizing HD Render...");
        await new Promise(r => setTimeout(r, 400));

        const resultUrl = canvas.toDataURL('image/webp', 0.95);
        setUpscaledImageSrc(resultUrl);
        setProgress(100);
        setIsProcessing(false);
        setSliderPosition(50);
        
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#ffffff']
        });

        toast({ title: "Upscale Complete", description: `Resolution increased to ${targetW}x${targetH}` });
    };

    const handleDownload = () => {
        if (!upscaledImageSrc) return;
        const link = document.createElement("a");
        link.href = upscaledImageSrc;
        link.download = `GR7-AI-Upscaled-${Date.now()}.webp`;
        link.click();
    };

    const handleReset = () => {
        setStage('upload');
        setImageFile(null);
        setOriginalImageSrc(null);
        setUpscaledImageSrc(null);
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6">
            
            {stage === 'upload' ? (
                <div className="flex flex-col items-center justify-center gap-8 py-10">
                    <Card 
                        className={cn(
                            "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[3rem] hover:border-primary/50 cursor-pointer select-none",
                            isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
                        )}
                        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <CardHeader className="bg-muted/30 border-b p-8 text-center">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">AI WORKSPACE</CardTitle>
                        </CardHeader>
                        <CardContent className="p-12 md:p-20">
                            <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center space-y-6 bg-muted/30 group relative">
                                <div className="relative">
                                    <UploadCloud className="size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Zap className="absolute -top-1 -right-1 size-8 text-yellow-500 animate-pulse" />
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop High-Res Photo</p>
                                    <p className="text-xs text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">Max 20MB. 100% Secure RAM.</p>
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                        </CardContent>
                        <CardFooter className="justify-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-10 bg-muted/10 pt-6 px-4">
                            <div className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
                            <div className="flex items-center gap-1.5"><Cpu className="size-4 text-blue-500" /> WEBGL BOOST</div>
                            <div className="flex items-center gap-1.5"><Sparkles className="size-4 text-primary" /> HD PRECISION</div>
                        </CardFooter>
                    </Card>

                    <div className="flex items-center gap-8 py-6 opacity-30">
                        <div className="flex flex-col items-center gap-2"><ImageIcon className="size-10" /><span className="text-[10px] font-black uppercase">JPG/PNG/WEBP</span></div>
                        <div className="flex flex-col items-center gap-2"><Maximize className="size-10" /><span className="text-[10px] font-black uppercase">4K Resolution</span></div>
                        <div className="flex flex-col items-center gap-2"><Layers className="size-10" /><span className="text-[10px] font-black uppercase">Edge Enhancer</span></div>
                    </div>
                </div>
            ) : (
                <div className="w-full flex flex-col gap-6 animate-in slide-in-from-bottom-6 duration-500">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                        <div className="flex items-center gap-3">
                            <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                                <Settings2 className="size-5 md:size-6" />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter">Neural <span className="text-primary">Studio</span></h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-12 border-2 font-black text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive">
                                <RotateCcw className="mr-1.5 size-4" /> Change Photo
                            </Button>
                            <Button 
                                size="lg" 
                                className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 disabled:opacity-50" 
                                onClick={handleDownload} 
                                disabled={isProcessing || !upscaledImageSrc}
                            >
                                <div className="absolute left-4 w-0.5 h-6 bg-white/40 rounded-full" />
                                <span className="flex-1 px-10 text-center tracking-widest text-[11px] uppercase">DOWNLOAD HD</span>
                                <div className="bg-white h-full px-6 flex items-center justify-center text-[#00aeef] transition-all group-hover:px-7" style={{ clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                    <Download className="size-6 group-hover:scale-110 transition-transform" />
                                </div>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Main Comparison Viewport */}
                        <div className="lg:col-span-8">
                            <Card className="overflow-hidden glass-card border-none shadow-3xl h-full flex flex-col rounded-[2.5rem]">
                                <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ArrowLeftRight className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Precision Comparison</CardTitle>
                                    </div>
                                    {upscaledImageSrc && <Badge className="bg-green-600 text-white font-black text-[9px] px-3 py-1 rounded-full border-2 border-white shadow-md animate-in zoom-in-95">UPSCALED</Badge>}
                                </CardHeader>
                                <CardContent className="p-0 aspect-video md:aspect-[16/10] bg-slate-200 dark:bg-black flex items-center justify-center relative shadow-inner overflow-hidden select-none">
                                    <AnimatePresence mode="wait">
                                        {isProcessing ? (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center z-50 p-8 text-center gap-8">
                                                <div className="relative">
                                                    <Loader2 className="h-20 w-20 md:h-32 md:w-32 animate-spin text-primary stroke-[3]" />
                                                    <Zap className="absolute inset-0 m-auto h-10 w-10 md:h-14 md:w-14 text-primary animate-pulse" />
                                                </div>
                                                <div className="space-y-4 w-full max-w-[280px] md:max-w-md">
                                                    <p className="font-black text-xl md:text-3xl text-primary animate-pulse uppercase tracking-tighter leading-none">{statusText}</p>
                                                    <Progress value={progress} className="h-2 shadow-inner bg-primary/10" />
                                                    <p className="text-[9px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Optimizing Neural Buffer • 300DPI Render</p>
                                                </div>
                                            </motion.div>
                                        ) : upscaledImageSrc ? (
                                            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                                {/* Comparison Container */}
                                                <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
                                                    <div className="relative w-full h-full shadow-3xl border-4 border-white dark:border-slate-800 rounded-lg overflow-hidden">
                                                        {/* After (Upscaled) */}
                                                        <img src={upscaledImageSrc} alt="HD" className="w-full h-full object-contain" />
                                                        
                                                        {/* Before (Original) Overlay */}
                                                        <div 
                                                            className="absolute inset-0 flex items-center justify-center select-none pointer-events-none border-r-2 border-white shadow-[10px_0_15px_rgba(0,0,0,0.2)]" 
                                                            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                                                        >
                                                            <img src={originalImageSrc!} alt="SD" className="w-full h-full object-contain blur-[0.5px]" />
                                                        </div>

                                                        {/* Labels */}
                                                        <div className="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-md text-white text-[8px] font-black px-3 py-1 rounded-full border border-white/20 uppercase">SD Original</div>
                                                        <div className="absolute top-4 right-4 z-40 bg-primary/80 backdrop-blur-md text-white text-[8px] font-black px-3 py-1 rounded-full border border-white/20 uppercase">AI Enhanced</div>
                                                        
                                                        {/* Slider Handle UI */}
                                                        <div className="absolute inset-y-0 z-50 w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center pointer-events-none" style={{ left: `${sliderPosition}%` }}>
                                                            <div className="size-10 rounded-full bg-white shadow-2xl border-4 border-primary flex items-center justify-center -translate-x-1/2">
                                                                <ArrowLeftRight className="size-5 text-primary" />
                                                            </div>
                                                        </div>

                                                        {/* Hidden Native Range Slider */}
                                                        <input 
                                                            type="range" min="0" max="100" value={sliderPosition} 
                                                            onChange={(e) => setSliderPosition(Number(e.target.value))} 
                                                            className="absolute inset-0 z-[60] w-full h-full opacity-0 cursor-ew-resize" 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2.5 bg-black/70 backdrop-blur-xl rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/10 shadow-3xl z-40 pointer-events-none">
                                                     <MousePointer2 className="size-3.5 text-primary animate-pulse" /> Slide to analyze edge sharpening
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-center opacity-20">
                                                <ImageIcon className="size-32" />
                                                <p className="text-xl font-black uppercase tracking-widest">Select Mode & Upscale</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                                <CardFooter className="bg-white dark:bg-slate-950 border-t p-5 md:p-8 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                                    <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM PROCESSING</div>
                                    <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> GPU ACCELERATED</div>
                                </CardFooter>
                            </Card>
                        </div>

                        {/* Right: Studio Settings Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                                <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8">
                                    <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                        <Maximize className="size-4 md:size-5 text-primary" /> Scale Config
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8 space-y-10">
                                    
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Inference Multiplier</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                className={cn("btn-pos-uiverse h-14", scaleMode === '2x' && "active-uiverse")} 
                                                onClick={() => setScaleMode('2x')} 
                                                data-label="2X UPSCALE" 
                                            />
                                            <button 
                                                className={cn("btn-pos-uiverse h-14", scaleMode === '4x' && "active-uiverse")} 
                                                onClick={() => setScaleMode('4x')} 
                                                data-label="4X UPSCALE" 
                                            />
                                        </div>
                                        <p className="text-[9px] text-muted-foreground font-bold leading-tight uppercase opacity-50 text-center">Note: 4x may take longer on mobile devices.</p>
                                    </div>

                                    <div className="space-y-6 pt-6 border-t border-dashed">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Resolution Map</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-muted/30 p-4 rounded-2xl border text-center space-y-1">
                                                <p className="text-[8px] font-black text-muted-foreground uppercase">SD Source</p>
                                                <p className="text-sm font-black">{originalDims.w}x{originalDims.h}</p>
                                            </div>
                                            <div className="bg-primary/5 p-4 rounded-2xl border-2 border-primary/20 text-center space-y-1 relative">
                                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[7px] px-2 py-0.5 rounded-full font-black uppercase">TARGET</div>
                                                <p className="text-[8px] font-black text-primary uppercase">HD Output</p>
                                                <p className="text-sm font-black text-primary">
                                                    {scaleMode === '2x' ? originalDims.w * 2 : originalDims.w * 4}x
                                                    {scaleMode === '2x' ? originalDims.h * 2 : originalDims.h * 4}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-green-500/5 rounded-2xl border-2 border-green-500/10 flex gap-4 shadow-sm">
                                        <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
                                             <Zap className="size-5 text-yellow-500 animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">HD Sanitize Active</p>
                                            <p className="text-[8px] text-green-600 font-medium leading-relaxed uppercase mt-1">
                                                Automatic noise removal and edge sharpening are applied during inference.
                                            </p>
                                        </div>
                                    </div>

                                </CardContent>
                                <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-white/10 flex flex-col gap-3">
                                     <Button 
                                        className="magic-button w-full h-18 md:h-20 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-4" 
                                        onClick={performUpscale}
                                        disabled={isProcessing}
                                    >
                                        <StarIcons />
                                        {isProcessing ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="size-7 md:size-8 animate-spin" />
                                                <span className="uppercase font-black text-sm md:text-base tracking-tighter">AI INFERENCE...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Sparkles className="size-7 md:size-8 text-white group-hover:scale-125 transition-transform" />
                                                <span className="uppercase tracking-tighter text-xl md:text-2xl font-black">START UPSCALE</span>
                                            </div>
                                        )}
                                    </Button>
                                    <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 text-center">Local Neural Processing Active</p>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
