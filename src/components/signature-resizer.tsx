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
    X
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
    const [width, setWidth] = useState<string>("140");
    const [height, setHeight] = useState<string>("60");
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

        // UI responsiveness delay
        await new Promise(r => setTimeout(r, 300));

        try {
            const img = new window.Image();
            img.src = imageSrc;
            await new Promise((resolve) => (img.onload = resolve));

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) throw new Error("Canvas not supported");

            // Calculate dimensions in pixels
            let targetW = parseFloat(width) || 140;
            let targetH = parseFloat(height) || 60;
            const d = parseFloat(dpi) || 200;

            if (unit === 'cm') {
                // Formula: px = (cm / 2.54) * DPI
                targetW = (targetW / 2.54) * d;
                targetH = (targetH / 2.54) * d;
            }

            canvas.width = Math.round(targetW);
            canvas.height = Math.round(targetH);

            // High quality drawing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = '#FFFFFF'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Iterative compression to hit target size
            const targetBytes = parseFloat(targetSize) * 1024;
            let quality = 0.95;
            let currentUrl = canvas.toDataURL('image/jpeg', quality);
            let blob = await (await fetch(currentUrl)).blob();

            // Loop to reach KB target if necessary
            while (blob.size > targetBytes && quality > 0.1) {
                quality -= 0.05;
                currentUrl = canvas.toDataURL('image/jpeg', quality);
                blob = await (await fetch(currentUrl)).blob();
            }

            setResultUrl(currentUrl);
            setResultSize(blob.size);
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f97316', '#ffffff']
            });
            toast({ title: "Resize Success", description: `Signature optimized to ${Math.round(blob.size / 1024)} KB.` });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Failed to process image." });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        const baseName = fileName.includes('.') ? fileName.split('.').slice(0, -1).join('.') : fileName;
        link.download = `resized-sign-${baseName || Date.now()}.jpg`;
        link.click();
    };

    const handleReset = () => {
        setImageSrc(null);
        setResultUrl(null);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 animate-in fade-in duration-700">
            {/* Left: Controls */}
            <div className="lg:col-span-5 space-y-6">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
                    <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-inner">
                                <PenTool className="size-7" />
                            </div>
                            <div>
                                <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Signature Resizer</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest">Optimize for Official Portals</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-8 space-y-8">
                        {/* Unit Selector */}
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Measurement Unit</Label>
                            <RadioGroup value={unit} onValueChange={(v) => setUnit(v as Unit)} className="flex gap-4">
                                <div className={cn("flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer", unit === 'cm' ? "border-primary bg-primary/5" : "border-muted")} onClick={() => setUnit('cm')}>
                                    <RadioGroupItem value="cm" id="cm" className="sr-only" />
                                    <Label htmlFor="cm" className="font-bold text-sm cursor-pointer">Centimeter</Label>
                                </div>
                                <div className={cn("flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer", unit === 'px' ? "border-primary bg-primary/5" : "border-muted")} onClick={() => setUnit('px')}>
                                    <RadioGroupItem value="px" id="px" className="sr-only" />
                                    <Label htmlFor="px" className="font-bold text-sm cursor-pointer">Pixel</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* DPI Setting */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase opacity-60">DPI Setting</Label>
                                <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-widest">Recommended: 200</Badge>
                            </div>
                            <Input type="number" value={dpi} onChange={(e) => setDpi(e.target.value)} className="h-12 border-2 rounded-xl font-black text-lg text-center bg-muted/20 shadow-inner" placeholder="200" />
                        </div>

                        {/* Dimensions */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60">Width ({unit})</Label>
                                <Input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className="h-12 border-2 rounded-xl font-black text-lg text-center bg-muted/20 shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60">Height ({unit})</Label>
                                <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-12 border-2 rounded-xl font-black text-lg text-center bg-muted/20 shadow-inner" />
                            </div>
                        </div>

                        {/* Target Size */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase opacity-60">Max File Size (KB)</Label>
                                <Badge className="bg-orange-500 text-white font-black text-[9px] px-2 py-0.5 rounded">SSC/UPSC: 20KB</Badge>
                            </div>
                            <Input type="number" value={targetSize} onChange={(e) => setTargetSize(e.target.value)} className="h-12 border-2 rounded-xl font-black text-lg text-center bg-muted/20 shadow-inner" placeholder="20" />
                        </div>

                        {/* Upload Trigger if no image */}
                        {!imageSrc ? (
                            <div 
                                className={cn(
                                    "border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-10 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-orange-500/5 transition-all group",
                                    isDragOver && "border-orange-500 bg-orange-500/5"
                                )}
                                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className="size-12 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-orange-600 transition-colors">Click or Drop Photo</p>
                                    <p className="text-[8px] font-bold text-muted-foreground/40 mt-1 uppercase">JPG, PNG OR WEBP</p>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                            </div>
                        ) : (
                             <div className="p-4 bg-muted/20 rounded-2xl border-2 border-dashed flex items-center justify-between">
                                <div className="flex items-center gap-3 truncate">
                                    <div className="size-10 rounded-xl overflow-hidden border shrink-0 bg-white relative">
                                        <img src={imageSrc} className="size-full object-contain p-1" alt="prev" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase truncate max-w-[150px]">{fileName}</p>
                                </div>
                                <Button size="icon" variant="ghost" className="rounded-full text-destructive hover:bg-destructive/5" onClick={handleReset}><X className="size-4" /></Button>
                             </div>
                        )}
                    </CardContent>
                    <CardFooter className="p-6 md:p-8 bg-muted/10 border-t flex flex-col gap-3">
                        <Button 
                            className="magic-button w-full h-18 bg-primary text-primary-foreground font-black text-xl rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all group h-16"
                            onClick={processResize}
                            disabled={!imageSrc || isProcessing}
                        >
                            <StarIcons />
                            {isProcessing ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="size-6 animate-spin" />
                                    <span className="uppercase text-sm tracking-tighter">PROCESSING...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Maximize className="size-6 group-hover:scale-110 transition-transform" />
                                    <span className="uppercase tracking-tighter">RESIZE SIGNATURE</span>
                                </div>
                            )}
                        </Button>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 text-center">Local Hardware Processing Active</p>
                    </CardFooter>
                </Card>

                <div className="p-4 bg-primary/5 rounded-[1.5rem] border-2 border-primary/10 flex gap-4">
                    <ShieldCheck className="size-6 text-primary shrink-0 mt-0.5" />
                    <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase">
                        <span className="font-black block mb-0.5 text-primary">PORTAL COMPLIANCE:</span>
                        Our algorithm uses multi-pass compression to stay under the KB limit while keeping the ink sharp.
                    </p>
                </div>
            </div>

            {/* Right: Preview */}
            <div className="lg:col-span-7 flex flex-col gap-6">
                <Card className="border-2 shadow-2xl rounded-[3rem] overflow-hidden bg-slate-100 dark:bg-slate-950 border-primary/10 h-full flex flex-col min-h-[500px]">
                    <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <Eye className="size-5" />
                            </div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Studio Viewport</CardTitle>
                        </div>
                        {resultUrl && <Badge className="bg-green-600 text-white font-black text-[10px] px-4 py-1.5 rounded-full border-2 border-white shadow-lg animate-pulse uppercase">RENDER COMPLETE</Badge>}
                    </CardHeader>
                    <CardContent className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-900 shadow-inner relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {resultUrl ? (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-10 w-full">
                                    <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-[0_35px_80px_-15px_rgba(0,0,0,0.3)] border-8 border-white max-w-full group relative overflow-hidden">
                                        <img src={resultUrl} alt="result" className="max-w-full h-auto object-contain block transition-transform group-hover:scale-105 duration-500" />
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                        <div className="p-6 bg-white dark:bg-slate-950 rounded-3xl border-2 text-center shadow-lg transform transition-transform hover:-translate-y-1">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 mb-1">Target Size</p>
                                            <p className="text-xl font-black text-green-600 tracking-tight">{formatBytes(resultSize)}</p>
                                        </div>
                                        <div className="p-6 bg-white dark:bg-slate-950 rounded-3xl border-2 text-center shadow-lg transform transition-transform hover:-translate-y-1">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 mb-1">Canvas Grid</p>
                                            <p className="text-xl font-black text-primary tracking-tight">{width}x{height} {unit}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : imageSrc ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 text-center">
                                    <div className="relative">
                                        <img src={imageSrc} alt="raw" className="max-w-[280px] max-h-[280px] object-contain rounded-2xl shadow-2xl border-4 border-white grayscale opacity-20" />
                                        <div className="absolute inset-0 flex items-center justify-center"><MousePointer2 className="size-16 text-primary animate-bounce" /></div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Settings Configured</p>
                                        <p className="text-[10px] font-bold text-slate-400/60 uppercase">Click 'Resize Signature' to render final HD output</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-8 opacity-10 py-20">
                                    <Scaling className="size-40" />
                                    <div className="space-y-1 text-center">
                                        <p className="text-2xl font-black uppercase tracking-widest">Workspace Empty</p>
                                        <p className="text-sm font-bold uppercase">Import a signature photo on the left</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                    <CardFooter className="p-8 border-t bg-white dark:bg-slate-950 flex flex-col sm:flex-row gap-6 justify-between items-center shrink-0">
                        <div className="flex items-center gap-6 text-muted-foreground/40 text-[9px] font-black uppercase tracking-[0.3em]">
                            <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> Secure Local Math</div>
                            <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> 300DPI Precision</div>
                        </div>
                        {resultUrl && (
                            <Button size="lg" className="magic-button magic-button-success w-full sm:w-auto h-16 md:h-18 px-12 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 font-black rounded-full transition-all active:scale-95 group flex items-center justify-center gap-4 shadow-3xl" onClick={handleDownload}>
                                <StarIcons />
                                <Download className="size-8 group-hover:translate-y-1 transition-transform" />
                                <span className="uppercase tracking-tighter text-lg md:text-xl">SAVE OPTIMIZED JPG</span>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
