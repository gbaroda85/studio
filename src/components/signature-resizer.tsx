
"use client";

import { useState, useRef, type ChangeEvent, useCallback, useEffect } from "react";
import { 
    UploadCloud, 
    Download, 
    Loader2, 
    RefreshCcw, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    Sparkles, 
    Settings2,
    Maximize,
    Scaling,
    ArrowLeftRight,
    Type,
    PenTool,
    Eye,
    MousePointer2,
    X,
    FileImage
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';

type Unit = 'px' | 'cm';

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

export default function SignatureResizer() {
    const { toast } = useToast();
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [unit, setUnit] = useState<Unit>('cm'); 
    const [dpi, setDpi] = useState<string>("200");
    const [width, setWidth] = useState<string>("14"); // Adjusted default to 14cm (realistic)
    const [height, setHeight] = useState<string>("6"); // Adjusted default to 6cm (realistic)
    const [targetSize, setTargetSize] = useState<string>("20");
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [resultSize, setResultSize] = useState<number>(0);
    const [isDragOver, setIsDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith("image/")) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImageSrc(ev.target?.result as string);
                setResultUrl(null);
            };
            reader.readAsDataURL(file);
        } else if (file) {
            toast({ variant: 'destructive', title: "Invalid File", description: "Please upload an image." });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const processResize = async () => {
        if (!imageSrc) return;
        setIsProcessing(true);
        setResultUrl(null);

        // Visual buffer
        await new Promise(r => setTimeout(r, 600));

        try {
            const img = new window.Image();
            img.src = imageSrc;
            await new Promise((resolve) => (img.onload = resolve));

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) throw new Error("Canvas init failed");

            // 1. Calculate Pixels based on DPI and Unit
            let targetW = parseFloat(width) || 140;
            let targetH = parseFloat(height) || 60;
            const d = parseFloat(dpi) || 200;

            if (unit === 'cm') {
                targetW = (targetW / 2.54) * d;
                targetH = (targetH / 2.54) * d;
            }

            // Safety check to prevent browser crash
            if (targetW > 10000 || targetH > 10000) {
                throw new Error("Dimensions are too large. Please check your inputs.");
            }

            canvas.width = Math.round(targetW);
            canvas.height = Math.round(targetH);

            // 2. High Quality Rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = '#FFFFFF'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 3. Ultra-Precision KB Optimization (20-step search for 19-20KB result)
            const limitKB = parseFloat(targetSize) || 20;
            const targetBytes = limitKB * 1024;
            // Aim for 98% of target for maximum efficiency
            const idealBytes = targetBytes * 0.98; 
            
            let bestBlob: Blob | null = null;
            let low = 0.001, high = 1.0;
            
            for(let i=0; i < 20; i++) {
                const mid = (low + high) / 2;
                const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', mid));
                
                if (blob.size <= targetBytes) {
                    bestBlob = blob;
                    // If we are close to ideal (within 1KB), we can stop earlier but 20 steps is fast anyway
                    low = mid; 
                } else {
                    high = mid; 
                }
            }

            // Final fallback check
            if (!bestBlob) {
                bestBlob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.01));
            }

            const finalUrl = URL.createObjectURL(bestBlob!);
            setResultUrl(finalUrl);
            setResultSize(bestBlob!.size);
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f97316', '#ffffff']
            });
            toast({ title: "Precision Resize Success", description: `Result: ${formatBytes(bestBlob!.size)} (Target: ${limitKB}KB)` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message || "Failed to process." });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        const baseName = fileName.includes('.') ? fileName.split('.').slice(0, -1).join('.') : fileName;
        link.download = `GR7-Sign-${baseName || 'optimized'}.jpg`;
        link.click();
    };

    const handleReset = () => {
        setImageSrc(null);
        setResultUrl(null);
        setFileName("");
        setResultSize(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 animate-in fade-in duration-700">
            {/* Left: Settings Panel */}
            <div className="lg:col-span-5 space-y-6">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
                    <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-inner border border-orange-500/20">
                                <PenTool className="size-7" />
                            </div>
                            <div>
                                <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">Sign Studio Pro</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest mt-1">20-Pass KB Extraction</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-8 space-y-8">
                        {/* System Toggle */}
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">1. Dimension System</Label>
                            <RadioGroup value={unit} onValueChange={(v) => setUnit(v as Unit)} className="flex gap-4">
                                <div className={cn("flex-1 flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm", unit === 'cm' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted bg-muted/5")} onClick={() => setUnit('cm')}>
                                    <RadioGroupItem value="cm" id="cm" className="sr-only" />
                                    <Label htmlFor="cm" className="font-black text-xs cursor-pointer uppercase tracking-widest">Centimeter</Label>
                                </div>
                                <div className={cn("flex-1 flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm", unit === 'px' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted bg-muted/5")} onClick={() => setUnit('px')}>
                                    <RadioGroupItem value="px" id="px" className="sr-only" />
                                    <Label htmlFor="px" className="font-black text-xs cursor-pointer uppercase tracking-widest">Pixel (px)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Controls Grid */}
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-dashed">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60">Width ({unit})</Label>
                                <Input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className="h-12 border-2 rounded-xl font-black text-lg text-center bg-muted/10 shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60">Height ({unit})</Label>
                                <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-12 border-2 rounded-xl font-black text-lg text-center bg-muted/10 shadow-inner" />
                            </div>
                            <div className="col-span-full space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60">Resolution Density (DPI)</Label>
                                <Input type="number" value={dpi} onChange={(e) => setDpi(e.target.value)} className="h-12 border-2 rounded-xl font-black text-center bg-muted/30 shadow-inner text-primary" />
                                <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40 px-1 text-center">Standard: 200 DPI for Govt Forms</p>
                            </div>
                        </div>

                        {/* File Size Target */}
                        <div className="space-y-3 pt-6 border-t border-dashed">
                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                <Maximize className="size-3" /> Target Size Limit (KB)
                            </Label>
                            <div className="relative group">
                                <Input type="number" value={targetSize} onChange={(e) => setTargetSize(e.target.value)} className="h-16 border-2 rounded-2xl font-black text-4xl text-center text-primary bg-primary/5 shadow-inner focus:ring-4 focus:ring-primary/20 transition-all" />
                                <Badge className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white font-black text-[10px] py-1 shadow-lg">STRICT KB</Badge>
                            </div>
                            <p className="text-[9px] text-center font-bold text-green-600 uppercase">Aims for ~{(parseFloat(targetSize) * 0.98).toFixed(1)} KB result</p>
                        </div>

                        {/* Upload Zone */}
                        {!imageSrc ? (
                            <div 
                                className={cn(
                                    "border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-10 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-orange-500/5 transition-all group",
                                    isDragOver && "border-orange-500 bg-orange-500/5"
                                )}
                                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className="size-14 text-muted-foreground group-hover:text-orange-500 transition-colors group-hover:scale-110 duration-300" />
                                <div className="text-center">
                                    <p className="text-[11px] font-black uppercase tracking-widest">Upload Original Sign</p>
                                    <p className="text-[9px] font-bold text-muted-foreground/40 mt-1 uppercase">Instant 100% Private local process</p>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                            </div>
                        ) : (
                             <div className="p-4 bg-muted/20 rounded-2xl border-2 border-dashed flex items-center justify-between animate-in zoom-in-95 shadow-sm">
                                <div className="flex items-center gap-4 truncate">
                                    <div className="size-12 rounded-xl overflow-hidden border-2 border-white shrink-0 bg-white relative shadow-md">
                                        <img src={imageSrc} className="size-full object-contain p-1" alt="thumb" />
                                    </div>
                                    <div className="truncate text-left">
                                        <p className="text-[10px] font-black uppercase truncate max-w-[150px]">{fileName}</p>
                                        <p className="text-[8px] font-mono opacity-40">{formatBytes(originalFileSize)}</p>
                                    </div>
                                </div>
                                <Button size="icon" variant="ghost" className="rounded-full text-destructive hover:bg-destructive/10 h-8 w-8" onClick={handleReset}><X className="size-4" /></Button>
                             </div>
                        )}
                    </CardContent>
                    
                    <CardFooter className="p-6 md:p-8 bg-muted/10 border-t flex flex-col gap-3">
                        <Button 
                            className="magic-button w-full h-18 bg-primary text-primary-foreground font-black text-xl rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all group border-4 border-primary hover:bg-transparent hover:text-primary"
                            onClick={processResize}
                            disabled={!imageSrc || isProcessing}
                        >
                            <StarIcons />
                            {isProcessing ? <Loader2 className="size-7 animate-spin mr-2" /> : <Scaling className="size-7 mr-2 group-hover:scale-110 transition-transform" />}
                            <span className="uppercase tracking-tighter">RESIZE SIGNATURE</span>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Right: Studio Dashboard */}
            <div className="lg:col-span-7 space-y-6">
                <Card className="border-2 shadow-2xl rounded-[3rem] overflow-hidden bg-slate-100 dark:bg-slate-950 border-primary/10 h-full flex flex-col min-h-[500px]">
                    <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                                <Eye className="size-5" />
                            </div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Studio Viewport</CardTitle>
                        </div>
                        {resultUrl && <Badge className="bg-green-600 text-white font-black text-[9px] px-4 py-2 rounded-full border-2 border-white shadow-lg animate-pulse uppercase tracking-wider">RENDER READY</Badge>}
                    </CardHeader>
                    <CardContent className="flex-1 p-8 md:p-12 lg:p-20 flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-900 shadow-inner relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {resultUrl ? (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-12 w-full">
                                    <div className="bg-white p-12 md:p-24 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[12px] border-white max-w-full group relative overflow-hidden flex items-center justify-center">
                                        <img src={resultUrl} alt="result" className="max-w-full h-auto object-contain block transition-transform group-hover:scale-105 duration-700 shadow-sm" />
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                                        <div className="p-6 bg-white dark:bg-slate-950 rounded-[2rem] border-2 text-center shadow-xl transform transition-transform hover:-translate-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mb-1 tracking-widest">Optimized Size</p>
                                            <p className="text-2xl font-black text-green-600 tracking-tighter">{formatBytes(resultSize)}</p>
                                        </div>
                                        <div className="p-6 bg-white dark:bg-slate-950 rounded-[2rem] border-2 text-center shadow-xl transform transition-transform hover:-translate-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mb-1 tracking-widest">Final Dimensions</p>
                                            <p className="text-2xl font-black text-primary tracking-tighter">{width}x{height} {unit.toUpperCase()}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : imageSrc ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-10 text-center">
                                    <div className="relative">
                                        <img src={imageSrc} alt="raw" className="max-w-[300px] max-h-[300px] object-contain rounded-3xl shadow-3xl border-8 border-white grayscale opacity-30 brightness-110" />
                                        <div className="absolute inset-0 flex items-center justify-center"><MousePointer2 className="size-20 text-primary animate-bounce opacity-80" /></div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-black uppercase tracking-[0.2em] text-slate-400">Settings Configured</p>
                                        <p className="text-[11px] font-bold text-slate-400/60 uppercase tracking-widest">Click 'Resize Signature' to apply 20-pass logic</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-8 opacity-10 py-32">
                                    <Scaling className="size-48" />
                                    <div className="space-y-1 text-center">
                                        <p className="text-3xl font-black uppercase tracking-[0.4em]">Studio Empty</p>
                                        <p className="text-sm font-bold uppercase tracking-widest">Import your signature photo to begin</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                    <CardFooter className="p-8 border-t bg-white dark:bg-slate-950 flex flex-col sm:flex-row gap-8 justify-between items-center shrink-0">
                        <div className="flex items-center gap-10 text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.3em]">
                            <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
                            <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> 200DPI PRECISION</div>
                        </div>
                        {resultUrl && (
                            <Button size="lg" className="magic-button magic-button-success w-full sm:w-auto h-16 md:h-18 px-12 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 font-black rounded-full transition-all active:scale-95 group flex items-center justify-center gap-4 shadow-3xl" onClick={handleDownload}>
                                <StarIcons />
                                <Download className="size-8 group-hover:translate-y-1 transition-transform" />
                                <span className="uppercase tracking-tighter text-xl font-black">SAVE OPTIMIZED SIGN</span>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
