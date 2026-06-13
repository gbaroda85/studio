
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
    const [unit, setUnit] = useState<Unit>('px'); // Default to Pixels for 140x60
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

        // Responsive delay
        await new Promise(r => setTimeout(r, 400));

        try {
            const img = new window.Image();
            img.src = imageSrc;
            await new Promise((resolve) => (img.onload = resolve));

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) throw new Error("Canvas init failed");

            // 1. Calculate Target Pixels
            let targetW = parseFloat(width) || 140;
            let targetH = parseFloat(height) || 60;
            const d = parseFloat(dpi) || 200;

            if (unit === 'cm') {
                targetW = (targetW / 2.54) * d;
                targetH = (targetH / 2.54) * d;
            }

            canvas.width = Math.round(targetW);
            canvas.height = Math.round(targetH);

            // 2. Render with HQ Smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = '#FFFFFF'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 3. Strict KB Binary Search Compression
            const targetBytes = parseFloat(targetSize) * 1024;
            let bestBlob: Blob | null = null;
            let low = 0.01, high = 1.0;
            
            // Maximum 8 iterations for precision
            for(let i=0; i < 8; i++) {
                const mid = (low + high) / 2;
                const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', mid));
                
                if (blob.size <= targetBytes) {
                    bestBlob = blob;
                    low = mid; // Try higher quality
                } else {
                    high = mid; // Need more compression
                }
            }

            // Fallback if target is extremely small
            if (!bestBlob) {
                bestBlob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.1));
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
            toast({ title: "Resize Success", description: `Optimized to ${formatBytes(bestBlob!.size)}.` });
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
        link.download = `GR7-Sign-${baseName || Date.now()}.jpg`;
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
            {/* Left: Input Dashboard */}
            <div className="lg:col-span-5 space-y-6">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
                    <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-inner">
                                <PenTool className="size-7" />
                            </div>
                            <div>
                                <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Sign Studio</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest">Pixel-Perfect Resizing</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-8 space-y-8">
                        {/* Unit Toggle */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">1. Select Unit</Label>
                            <RadioGroup value={unit} onValueChange={(v) => {
                                setUnit(v as Unit);
                                if (v === 'cm') { setWidth("4.5"); setHeight("2.0"); }
                                else { setWidth("140"); setHeight("60"); }
                                setResultUrl(null);
                            }} className="flex gap-4">
                                <div className={cn("flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer", unit === 'px' ? "border-primary bg-primary/5" : "border-muted")} onClick={() => setUnit('px')}>
                                    <RadioGroupItem value="px" id="px" className="sr-only" />
                                    <Label htmlFor="px" className="font-bold text-sm cursor-pointer">Pixel (px)</Label>
                                </div>
                                <div className={cn("flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer", unit === 'cm' ? "border-primary bg-primary/5" : "border-muted")} onClick={() => setUnit('cm')}>
                                    <RadioGroupItem value="cm" id="cm" className="sr-only" />
                                    <Label htmlFor="cm" className="font-bold text-sm cursor-pointer">Centimeter</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Dimensions & DPI */}
                        <div className="space-y-6 pt-4 border-t border-dashed">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase opacity-60">Width ({unit})</Label>
                                    <Input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className="h-12 border-2 rounded-xl font-black text-lg text-center" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase opacity-60">Height ({unit})</Label>
                                    <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-12 border-2 rounded-xl font-black text-lg text-center" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60">Target DPI</Label>
                                <Input type="number" value={dpi} onChange={(e) => setDpi(e.target.value)} className="h-12 border-2 rounded-xl font-bold text-center bg-muted/20" />
                            </div>
                        </div>

                        {/* KB Target */}
                        <div className="space-y-3 pt-4 border-t border-dashed">
                            <Label className="text-[10px] font-black uppercase opacity-60 flex items-center gap-2">
                                <Maximize className="size-3" /> Max File Size (KB)
                            </Label>
                            <Input type="number" value={targetSize} onChange={(e) => setTargetSize(e.target.value)} className="h-12 border-2 rounded-xl font-black text-2xl text-center text-primary bg-primary/5" placeholder="20" />
                            <p className="text-[9px] text-center font-bold text-muted-foreground uppercase">Commonly 20KB to 50KB for Govt Forms</p>
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
                                <UploadCloud className="size-12 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest">Click to Import sign</p>
                                    <p className="text-[8px] font-bold text-muted-foreground/40 mt-1 uppercase">JPG or PNG</p>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                            </div>
                        ) : (
                             <div className="p-4 bg-muted/20 rounded-2xl border-2 border-dashed flex items-center justify-between">
                                <div className="flex items-center gap-3 truncate">
                                    <div className="size-10 rounded-xl overflow-hidden border shrink-0 bg-white relative">
                                        <img src={imageSrc} className="size-full object-contain p-1" alt="thumb" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase truncate max-w-[120px]">{fileName}</p>
                                </div>
                                <Button size="icon" variant="ghost" className="rounded-full text-destructive" onClick={handleReset}><X className="size-4" /></Button>
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
                            {isProcessing ? <Loader2 className="size-6 animate-spin mr-2" /> : <Scaling className="size-6 mr-2 group-hover:scale-110 transition-transform" />}
                            <span className="uppercase tracking-tighter">RESIZE & OPTIMIZE</span>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Right: Studio Viewport */}
            <div className="lg:col-span-7 space-y-6">
                <Card className="border-2 shadow-2xl rounded-[3rem] overflow-hidden bg-slate-100 dark:bg-slate-950 border-primary/10 h-full flex flex-col min-h-[500px]">
                    <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <Eye className="size-5" />
                            </div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Studio Viewport</CardTitle>
                        </div>
                        {resultUrl && <Badge className="bg-green-600 text-white font-black text-[9px] px-3 py-1 rounded-full border-2 border-white shadow-lg animate-pulse uppercase">RENDER READY</Badge>}
                    </CardHeader>
                    <CardContent className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-900 shadow-inner relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {resultUrl ? (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-10 w-full">
                                    {/* The result is displayed at its actual CSS scale to let user see how 'big' it is */}
                                    <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl border-2 border-white flex items-center justify-center relative group overflow-hidden">
                                        <img src={resultUrl} alt="result" className="max-w-full h-auto block shadow-md" style={{ width: unit === 'px' ? `${width}px` : 'auto' }} />
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                        <div className="p-5 bg-white dark:bg-slate-950 rounded-3xl border-2 text-center shadow-lg">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 mb-1">Final Size</p>
                                            <p className="text-xl font-black text-green-600 tracking-tight">{formatBytes(resultSize)}</p>
                                        </div>
                                        <div className="p-5 bg-white dark:bg-slate-950 rounded-3xl border-2 text-center shadow-lg">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 mb-1">Dimensions</p>
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
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Click 'Resize' to render final output</p>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-6 opacity-10 py-20">
                                    <FileImage className="size-32" />
                                    <p className="text-xl font-black uppercase tracking-widest">Workspace Empty</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                    <CardFooter className="p-8 border-t bg-white dark:bg-slate-950 flex flex-col sm:flex-row gap-6 justify-between items-center shrink-0">
                        <div className="flex items-center gap-6 text-muted-foreground/40 text-[9px] font-black uppercase tracking-[0.3em]">
                            <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> Secure Local Math</div>
                            <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> Strict KB Target</div>
                        </div>
                        {resultUrl && (
                            <Button size="lg" className="magic-button magic-button-success w-full sm:w-auto h-16 md:h-18 px-12 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 font-black rounded-full transition-all active:scale-95 group flex items-center justify-center gap-4 shadow-3xl" onClick={handleDownload}>
                                <StarIcons />
                                <Download className="size-8 group-hover:translate-y-1 transition-transform" />
                                <span className="uppercase tracking-tighter text-lg md:text-xl">DOWNLOAD JPG</span>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

