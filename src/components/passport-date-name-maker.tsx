
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    Camera, 
    Download, 
    X, 
    User, 
    Calendar, 
    Type, 
    Sparkles, 
    ShieldCheck, 
    Zap, 
    RefreshCcw, 
    Settings2, 
    Eye, 
    CheckCircle2, 
    UploadCloud,
    ImageIcon,
    RotateCw,
    Maximize,
    Loader2,
    Baseline,
    MoveVertical,
    Square,
    Target,
    Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';

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

export default function PassportDateNameMaker() {
    const { toast } = useToast();
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [name, setName] = useState("YOUR NAME HERE");
    const [date, setDate] = useState(new Date().toLocaleDateString('en-GB').split('/').join('-')); // DD-MM-YYYY
    const [showDopPrefix, setShowDopPrefix] = useState(true);
    
    // Adjustment States
    const [nameSize, setNameSize] = useState([32]);
    const [dateSize, setDateSize] = useState([28]);
    const [stripHeightFactor, setStripHeightFactor] = useState([14]); // % of total height
    const [borderWidth, setBorderWidth] = useState([0]); // Border thickness in px
    const [targetKB, setTargetKB] = useState<string>("50"); // Target file size in KB
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [resultSize, setResultSize] = useState<number>(0);
    const [isDragOver, setIsDragOver] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const renderPhoto = useCallback(async () => {
        if (!imageSrc) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const img = new window.Image();
        img.src = imageSrc;
        img.onload = async () => {
            // Standard Passport Ratio: 3.5cm x 4.5cm
            const targetW = 350 * 2; // High DPI render for sharp text
            const targetH = 450 * 2;
            canvas.width = targetW;
            canvas.height = targetH;

            // 1. Draw Background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetW, targetH);

            // 2. Draw Main Image (Centered and Cropped to fill)
            const scale = Math.max(targetW / img.width, targetH / img.height);
            const x = (targetW - img.width * scale) / 2;
            const y = (targetH - img.height * scale) / 2;
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // 3. Draw White Strip at bottom
            const stripHeight = (stripHeightFactor[0] / 100) * targetH;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, targetH - stripHeight, targetW, stripHeight);
            
            // Thin black border for the strip
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, targetH - stripHeight, targetW, stripHeight);

            // 4. Draw Text (Name & Date)
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            
            ctx.font = `bold ${nameSize[0]}px Arial`;
            ctx.fillText(name.toUpperCase(), targetW / 2, targetH - stripHeight + (stripHeight * 0.45));

            ctx.font = `bold ${dateSize[0]}px Arial`;
            const dateText = showDopPrefix ? `D.O.P: ${date}` : date;
            ctx.fillText(dateText, targetW / 2, targetH - stripHeight + (stripHeight * 0.85));

            // 5. Draw External Border
            if (borderWidth[0] > 0) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = borderWidth[0] * 2; 
                ctx.strokeRect(0, 0, targetW, targetH);
            }

            // 6. STRICT KB TARGET OPTIMIZATION LOOP
            const targetBytes = (parseFloat(targetKB) || 50) * 1024 * 0.98; // 2% safety buffer
            let low = 0.1, high = 1.0;
            let bestBlob: Blob | null = null;

            // Binary search for optimal quality
            for (let i = 0; i < 15; i++) {
                const mid = (low + high) / 2;
                const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', mid));
                if (blob.size <= targetBytes) {
                    bestBlob = blob;
                    low = mid;
                } else {
                    high = mid;
                }
            }

            let finalBlob: Blob = bestBlob || await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.1));
            
            if (resultUrl) URL.revokeObjectURL(resultUrl);
            const url = URL.createObjectURL(finalBlob);
            setResultUrl(url);
            setResultSize(finalBlob.size);
        };
    }, [imageSrc, name, date, nameSize, dateSize, stripHeightFactor, borderWidth, targetKB, showDopPrefix]);

    useEffect(() => {
        const timer = setTimeout(renderPhoto, 300);
        return () => clearTimeout(timer);
    }, [renderPhoto]);

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target?.result as string);
                setResultUrl(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        handleFileChange(file);
    };

    const handleDownload = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        link.download = `Passport-${name.replace(/\s+/g, '-')}.jpg`;
        link.click();
        
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#ffffff']
        });
    };

    const handleReset = () => {
        setImageSrc(null);
        setResultUrl(null);
        setName("YOUR NAME HERE");
        setDate(new Date().toLocaleDateString('en-GB').split('/').join('-'));
        setShowDopPrefix(true);
        setNameSize([32]);
        setDateSize([28]);
        setStripHeightFactor([14]);
        setBorderWidth([0]);
        setTargetKB("50");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 animate-in fade-in duration-700 mx-auto">
            {/* Left: Input Panel */}
            <div className="lg:col-span-5 space-y-6">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
                    <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                                <Camera className="size-7" />
                            </div>
                            <div>
                                <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">Job Photo Studio</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest mt-1">SSC, UPSC & IBPS Compliant</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 md:p-8 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Type className="size-3" /> Candidate Name
                                </Label>
                                <Input 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="Enter your full name..."
                                    className="h-12 border-2 rounded-xl font-bold uppercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Calendar className="size-3" /> Date of Photo (DOP)
                                </Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={date} 
                                        onChange={(e) => setDate(e.target.value)} 
                                        placeholder="DD-MM-YYYY"
                                        className="h-12 border-2 rounded-xl font-bold flex-1"
                                    />
                                    <div className="flex flex-col items-center justify-center gap-1 px-3 bg-muted/30 rounded-xl border-2">
                                        <span className="text-[7px] font-black uppercase opacity-40">Prefix</span>
                                        <Switch checked={showDopPrefix} onCheckedChange={setShowDopPrefix} size="sm" />
                                    </div>
                                </div>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40 px-1">Tip: Toggle switch to hide "D.O.P:" label.</p>
                            </div>
                        </div>

                        {/* STUDIO CONTROLS */}
                        <div className="space-y-6 pt-6 border-t border-dashed">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-2">
                                <Settings2 className="size-3" /> Studio Refinement
                            </Label>
                            
                            <div className="space-y-5">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-[9px] font-black uppercase opacity-60 flex items-center gap-1.5"><Square className="size-3"/> Border Width</Label>
                                        <Badge variant="secondary" className="font-mono text-[9px]">{borderWidth[0]}px</Badge>
                                    </div>
                                    <Slider min={0} max={10} step={1} value={borderWidth} onValueChange={setBorderWidth} />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-[9px] font-black uppercase opacity-60 flex items-center gap-1.5"><MoveVertical className="size-3"/> Strip Height</Label>
                                        <Badge variant="secondary" className="font-mono text-[9px]">{stripHeightFactor[0]}%</Badge>
                                    </div>
                                    <Slider min={10} max={25} step={1} value={stripHeightFactor} onValueChange={setStripHeightFactor} />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-[9px] font-black uppercase opacity-60 flex items-center gap-1.5"><Baseline className="size-3"/> Name Font Size</Label>
                                        <Badge variant="secondary" className="font-mono text-[9px]">{nameSize[0]}px</Badge>
                                    </div>
                                    <Slider min={20} max={60} step={1} value={nameSize} onValueChange={setNameSize} />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-[9px] font-black uppercase opacity-60 flex items-center gap-1.5"><Baseline className="size-3"/> Date Font Size</Label>
                                        <Badge variant="secondary" className="font-mono text-[9px]">{dateSize[0]}px</Badge>
                                    </div>
                                    <Slider min={15} max={50} step={1} value={dateSize} onValueChange={setDateSize} />
                                </div>

                                <div className="space-y-3 pt-2 border-t border-dashed">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-2">
                                        <Target className="size-3" /> Target Size Limit (KB)
                                    </Label>
                                    <div className="relative group">
                                        <Input 
                                            type="number" 
                                            value={targetKB} 
                                            onChange={(e) => setTargetKB(e.target.value)} 
                                            className="h-14 border-2 rounded-2xl font-black text-3xl text-center text-primary bg-primary/5 shadow-inner"
                                        />
                                        <Badge className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white font-black text-[10px] py-1 shadow-lg uppercase">KB Limit</Badge>
                                    </div>
                                    <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40 text-center">Engine will strictly optimize for this limit.</p>
                                </div>
                            </div>
                        </div>

                        {!imageSrc ? (
                            <div 
                                className={cn(
                                    "border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-10 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-primary/5 transition-all group",
                                    isDragOver && "border-primary bg-primary/5"
                                )}
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className="size-14 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                                <div className="text-center">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Upload Your Photo</p>
                                    <p className="text-[9px] font-bold text-muted-foreground/40 mt-1 uppercase">JPG or PNG supported</p>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                            </div>
                        ) : (
                             <div className="p-4 bg-muted/20 rounded-2xl border-2 border-dashed flex items-center justify-between animate-in zoom-in-95 shadow-sm">
                                <div className="flex items-center gap-4 truncate">
                                    <div className="size-12 rounded-xl overflow-hidden border-2 border-white shrink-0 bg-white relative shadow-md">
                                        <img src={imageSrc} className="size-full object-cover" alt="thumb" />
                                    </div>
                                    <div className="truncate text-left">
                                        <p className="text-[10px] font-black uppercase truncate">IMAGE LOADED</p>
                                        <Badge variant="outline" className="text-[8px] font-black">LOCAL BUFFER</Badge>
                                    </div>
                                </div>
                                <Button size="icon" variant="ghost" className="rounded-full text-destructive hover:bg-destructive/10 h-8 w-8" onClick={handleReset}><X className="size-4" /></Button>
                             </div>
                        )}
                    </CardContent>
                    
                    <CardFooter className="p-6 md:p-8 bg-muted/10 border-t flex flex-col gap-3">
                        <Button 
                            className="magic-button w-full h-18 bg-primary text-primary-foreground font-black text-xl rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all group border-4 border-primary hover:bg-transparent hover:text-primary"
                            onClick={handleDownload}
                            disabled={!imageSrc || isProcessing}
                        >
                            <StarIcons />
                            {isProcessing ? <Loader2 className="size-7 animate-spin mr-2" /> : <Download className="size-7 mr-2 group-hover:translate-y-1 transition-transform" />}
                            <span className="uppercase tracking-tighter">DOWNLOAD PHOTO</span>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Right: Results Dashboard */}
            <div className="lg:col-span-7 space-y-6">
                <Card className="border-2 shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border-primary/10 h-full flex flex-col min-h-[600px]">
                    <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <Eye className="size-5" />
                            </div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Live Studio View</CardTitle>
                        </div>
                        {resultUrl && <Badge className="bg-green-600 text-white font-black text-[9px] px-4 py-2 rounded-full border-2 border-white shadow-lg animate-pulse uppercase tracking-wider">RENDER READY</Badge>}
                    </CardHeader>
                    <CardContent className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-900 shadow-inner relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {imageSrc ? (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-8 w-full">
                                    <div className="relative group overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[12px] border-white bg-white">
                                        {/* Result preview uses a canvas behind the scenes for optimization search */}
                                        <canvas ref={canvasRef} className="hidden" />
                                        {resultUrl ? (
                                            <img src={resultUrl} alt="Passport result" className="max-w-full h-auto object-contain block transition-transform group-hover:scale-105 duration-500 shadow-inner" style={{ maxWidth: '350px' }} />
                                        ) : (
                                            <div className="size-[350px] flex items-center justify-center bg-muted/20 animate-pulse"><Loader2 className="size-10 animate-spin text-primary opacity-20" /></div>
                                        )}
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 text-center shadow-lg">
                                            <p className="text-[8px] font-black text-muted-foreground uppercase opacity-40 mb-1">Optimized Size</p>
                                            <p className="text-lg font-black text-green-600">{formatBytes(resultSize)}</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 text-center shadow-lg">
                                            <p className="text-[8px] font-black text-muted-foreground uppercase opacity-40 mb-1">Resolution</p>
                                            <p className="text-lg font-black text-primary">3.5 x 4.5 CM</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-black/80 backdrop-blur-xl px-6 py-2.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-3xl">
                                        <Sparkles className="size-4 text-primary animate-pulse" /> High-Density 300DPI Render
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-8 opacity-10 py-20">
                                    <Maximize className="size-40" />
                                    <div className="space-y-1 text-center">
                                        <p className="text-2xl font-black uppercase tracking-widest">Workspace Empty</p>
                                        <p className="text-sm font-bold uppercase">Upload a photo to start the studio</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                    <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 shrink-0">
                        <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE LOCAL RENDERING</div>
                        <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> INSTANT SYNC</div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
