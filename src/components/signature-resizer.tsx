
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
    const [dpi, setDpi] = useState<string>("300");
    const [width, setWidth] = useState<string>("4.5"); 
    const [height, setHeight] = useState<string>("2.0"); 
    const [targetSize, setTargetSize] = useState<string>("20");
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [originalFileSize, setOriginalFileSize] = useState<number>(0);
    const [resultSize, setResultSize] = useState<number>(0);
    const [isDragOver, setIsDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync perfect defaults when switching units
    const handleUnitChange = (val: Unit) => {
        setUnit(val);
        if (val === 'cm') {
            setWidth("4.5");
            setHeight("2.0");
        } else {
            setWidth("140");
            setHeight("60");
        }
        setResultUrl(null);
    };

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith("image/")) {
            setFileName(file.name);
            setOriginalFileSize(file.size);
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImageSrc(ev.target?.result as string);
                setResultUrl(null);
                setResultSize(0);
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

        // Minimal UI feedback delay
        await new Promise(r => setTimeout(r, 800));

        try {
            const img = new window.Image();
            img.src = imageSrc;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) throw new Error("Canvas context init failed.");

            // 1. Calculate Target Pixels
            let targetW = parseFloat(width) || 140;
            let targetH = parseFloat(height) || 60;
            const d = parseFloat(dpi) || 300;

            if (unit === 'cm') {
                targetW = (targetW / 2.54) * d;
                targetH = (targetH / 2.54) * d;
            }

            canvas.width = Math.round(targetW);
            canvas.height = Math.round(targetH);

            // 2. High Quality Draw
            ctx.fillStyle = '#FFFFFF'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 3. Precision Optimization Loop (20-Pass Binary Search)
            const limitKB = parseFloat(targetSize) || 20;
            const targetBytes = limitKB * 1024 * 0.98; // 2% safety margin
            
            let bestBlob: Blob | null = null;
            let low = 0.1, high = 1.0;
            
            for(let i=0; i < 20; i++) {
                const mid = (low + high) / 2;
                const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', mid));
                
                if (blob.size <= targetBytes) {
                    bestBlob = blob;
                    low = mid; 
                } else {
                    high = mid; 
                }
            }

            // 4. Metadata Padding Logic (FOR PIXEL MODE / TINY IMAGES)
            // If even at 100% quality, the 140x60 image is under 20KB, we bloat the file header
            let finalBlob: Blob = bestBlob || await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 1.0));

            if (finalBlob.size < targetBytes) {
                const paddingNeeded = Math.floor(targetBytes - finalBlob.size);
                const padding = new Uint8Array(paddingNeeded).fill(0);
                finalBlob = new Blob([finalBlob, padding], { type: 'image/jpeg' });
            }

            const finalUrl = URL.createObjectURL(finalBlob);
            setResultUrl(finalUrl);
            setResultSize(finalBlob.size);
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f97316', '#ffffff']
            });
            toast({ title: "Optimized Successfully", description: `Strict Target Hit: ${formatBytes(finalBlob.size)}` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Process Error", description: "Failed to resize image." });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        const baseName = fileName.includes('.') ? fileName.split('.').slice(0, -1).join('.') : fileName;
        link.download = `GR7-Sign-Optimized-${baseName || 'result'}.jpg`;
        link.click();
    };

    const handleReset = () => {
        setImageSrc(null);
        setResultUrl(null);
        setFileName("");
        setOriginalFileSize(0);
        setResultSize(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 animate-in fade-in duration-700">
            {/* Left: Input Panel */}
            <div className="lg:col-span-5 space-y-6">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
                    <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-inner border border-orange-500/20">
                                <PenTool className="size-7" />
                            </div>
                            <div>
                                <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">Signature Studio</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest mt-1">Official Portal Compliance</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">1. Dimension System</Label>
                            <RadioGroup value={unit} onValueChange={(v) => handleUnitChange(v as Unit)} className="flex gap-4">
                                <div className={cn("flex-1 flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm", unit === 'cm' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted bg-muted/5")} onClick={() => handleUnitChange('cm')}>
                                    <RadioGroupItem value="cm" id="cm" className="sr-only" />
                                    <Label htmlFor="cm" className="font-black text-xs cursor-pointer uppercase tracking-widest">Centimeter</Label>
                                </div>
                                <div className={cn("flex-1 flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm", unit === 'px' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted bg-muted/5")} onClick={() => handleUnitChange('px')}>
                                    <RadioGroupItem value="px" id="px" className="sr-only" />
                                    <Label htmlFor="px" className="font-black text-xs cursor-pointer uppercase tracking-widest">Pixel (px)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-dashed">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60">Width ({unit})</Label>
                                <Input type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} className="h-12 border-2 rounded-xl font-black text-lg text-center bg-muted/10 shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60">Height ({unit})</Label>
                                <Input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} className="h-12 border-2 rounded-xl font-black text-lg text-center bg-muted/10 shadow-inner" />
                            </div>
                            <div className="col-span-full space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60">DPI Control</Label>
                                <Input type="number" value={dpi} onChange={(e) => setDpi(e.target.value)} className="h-12 border-2 rounded-xl font-black text-center bg-muted/30 shadow-inner text-primary" />
                                <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40 px-1 text-center">Standard: 200 or 300 DPI</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-dashed">
                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                <Maximize className="size-3" /> Target Size Limit (KB)
                            </Label>
                            <div className="relative group">
                                <Input type="number" value={targetSize} onChange={(e) => setTargetSize(e.target.value)} className="h-16 border-2 rounded-2xl font-black text-4xl text-center text-primary bg-primary/5 shadow-inner focus:ring-4 focus:ring-primary/20 transition-all" />
                                <Badge className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white font-black text-[10px] py-1 shadow-lg uppercase">KB LIMIT</Badge>
                            </div>
                        </div>

                        {!imageSrc ? (
                            <div 
                                className={cn(
                                    "border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-10 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-orange-500/5 transition-all group",
                                    isDragOver && "border-orange-500 bg-orange-500/5"
                                )}
                                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className="size-14 text-muted-foreground group-hover:text-orange-500 transition-colors duration-300" />
                                <div className="text-center">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Upload Signature</p>
                                    <p className="text-[9px] font-bold text-muted-foreground/40 mt-1 uppercase">Local processing</p>
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

                <div className="p-4 bg-primary/5 rounded-[1.5rem] border-2 border-primary/10 flex gap-4">
                    <ShieldCheck className="size-6 text-primary shrink-0 mt-0.5" />
                    <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase">
                        <span className="font-black block mb-0.5 text-primary">PORTAL COMPLIANCE:</span>
                        Our algorithm ensures the file hits 20KB target even for small dimensions using safe metadata padding.
                    </p>
                </div>
            </div>

            {/* Right: Results Dashboard */}
            <div className="lg:col-span-7 space-y-6">
                <Card className="border-2 shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border-primary/10 h-full flex flex-col min-h-[500px]">
                    <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <Eye className="size-5" />
                            </div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Studio Viewport</CardTitle>
                        </div>
                        {resultUrl && <Badge className="bg-green-600 text-white font-black text-[9px] px-4 py-2 rounded-full border-2 border-white shadow-lg animate-pulse uppercase tracking-wider">RENDER READY</Badge>}
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
                                            <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 mb-1">Optimized Size</p>
                                            <p className="text-xl font-black text-green-600 tracking-tight">{formatBytes(resultSize)}</p>
                                        </div>
                                        <div className="p-6 bg-white dark:bg-slate-950 rounded-3xl border-2 text-center shadow-lg transform transition-transform hover:-translate-y-1">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 mb-1">Canvas Grid</p>
                                            <p className="text-xl font-black text-primary tracking-tight">{width}x{height} {unit.toUpperCase()}</p>
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
                                        <p className="text-[10px] font-bold text-slate-400/60 uppercase">Click 'Resize Signature' to apply high-density render</p>
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
                            <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> Strict KB Target</div>
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
