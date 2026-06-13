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
    Square
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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

export default function PassportDateNameMaker() {
    const { toast } = useToast();
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [name, setName] = useState("YOUR NAME HERE");
    const [date, setDate] = useState(new Date().toLocaleDateString('en-GB').split('/').join('-')); // DD-MM-YYYY
    
    // Adjustment States
    const [nameSize, setNameSize] = useState([32]);
    const [dateSize, setDateSize] = useState([28]);
    const [stripHeightFactor, setStripHeightFactor] = useState([14]); // % of total height
    const [borderWidth, setBorderWidth] = useState([0]); // Border thickness in px
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const renderPhoto = useCallback(() => {
        if (!imageSrc) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new window.Image();
        img.src = imageSrc;
        img.onload = () => {
            // Standard Passport Ratio: 3.5cm x 4.5cm (approx 350x450 pixels @ 250DPI)
            const targetW = 350 * 2; // High DPI render
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

            // 3. Draw White Strip at bottom (Dynamic height)
            const stripHeight = (stripHeightFactor[0] / 100) * targetH;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, targetH - stripHeight, targetW, stripHeight);
            
            // Thin black border for the strip for clarity
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, targetH - stripHeight, targetW, stripHeight);

            // 4. Draw Text (Name & Date)
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            
            // Name Rendering
            const finalNameSize = nameSize[0];
            ctx.font = `bold ${finalNameSize}px Arial`;
            // Position name slightly above the center of the strip
            ctx.fillText(name.toUpperCase(), targetW / 2, targetH - stripHeight + (stripHeight * 0.45));

            // Date Rendering
            const finalDateSize = dateSize[0];
            ctx.font = `bold ${finalDateSize}px Arial`;
            // Position date slightly below the center of the strip
            ctx.fillText(`D.O.P: ${date}`, targetW / 2, targetH - stripHeight + (stripHeight * 0.85));

            // 5. Draw External Border if enabled
            if (borderWidth[0] > 0) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = borderWidth[0] * 2; // Multiplied for high DPI
                ctx.strokeRect(0, 0, targetW, targetH);
            }

            setResultUrl(canvas.toDataURL('image/jpeg', 0.95));
        };
    }, [imageSrc, name, date, nameSize, dateSize, stripHeightFactor, borderWidth]);

    useEffect(() => {
        renderPhoto();
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
        link.download = `Passport-Photo-${name.replace(/\s+/g, '-')}.jpg`;
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
        setNameSize([32]);
        setDateSize([28]);
        setStripHeightFactor([14]);
        setBorderWidth([0]);
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
                                <Input 
                                    value={date} 
                                    onChange={(e) => setDate(e.target.value)} 
                                    placeholder="DD-MM-YYYY"
                                    className="h-12 border-2 rounded-xl font-bold"
                                />
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
                                        <Label className="text-[9px] font-black uppercase opacity-60 flex items-center gap-1.5"><Square className="size-3"/> All Border Width</Label>
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
                             <div className="p-4 bg-muted/20 rounded-2xl border-2 border-dashed flex items-center justify-between animate-in zoom-in-95">
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
                            <span className="uppercase tracking-tighter">DOWNLOAD PASSPORT</span>
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
                                        <canvas ref={canvasRef} className="max-w-full h-auto object-contain block transition-transform group-hover:scale-105 duration-500" style={{ maxWidth: '350px' }} />
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                    <div className="flex items-center gap-4 bg-black/80 backdrop-blur-xl px-6 py-2.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-3xl">
                                        <Sparkles className="size-4 text-primary animate-pulse" /> 3.5cm x 4.5cm High-Density Render
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
