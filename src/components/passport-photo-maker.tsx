"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    Crop as CropIcon, 
    RefreshCcw, 
    Eraser, 
    ZoomIn, 
    ZoomOut, 
    ChevronUp, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight, 
    UserCircle, 
    X, 
    ShieldCheck, 
    Zap,
    RotateCw,
    Settings2,
    Sparkles,
    CheckCircle2,
    Palette,
    Square,
    ImageIcon,
    Sun,
    Contrast,
    Droplets,
    Layout,
    Printer,
    Monitor,
    Maximize,
    Undo2,
    Redo2,
    Save,
    Camera,
    Globe,
    Frame,
    Wand2,
    ChevronRight as ChevronRightIcon,
    MousePointer2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

/**
 * CONSTANTS & PRESETS
 */
const PRESETS = [
    { id: 'free', label: "Free Hand Crop (Manual)", width: 0, height: 0, unit: 'px' },
    { id: 'in_p', label: "India Passport (35x45mm)", width: 35, height: 45, unit: 'mm' },
    { id: 'aadhaar', label: "Aadhaar Card (86x54mm)", width: 86, height: 54, unit: 'mm' },
    { id: 'pan', label: "PAN Card (25x35mm)", width: 25, height: 35, unit: 'mm' },
    { id: 'us_v', label: "USA Visa / Passport (2x2in)", width: 2, height: 2, unit: 'inch' },
    { id: 'uk_p', label: "UK Passport (35x45mm)", width: 35, height: 45, unit: 'mm' },
    { id: 'ca_p', label: "Canada Passport (5x7cm)", width: 50, height: 70, unit: 'mm' },
    { id: 'dl', label: "Driving Licence (3.5x4.5cm)", width: 35, height: 45, unit: 'mm' },
    { id: 'custom', label: "Custom Size (Input mm)", width: 0, height: 0, unit: 'mm' },
];

const COLORS = [
    { name: "Pure White", value: "#FFFFFF" },
    { name: "Off White", value: "#F5F5F5" },
    { name: "Royal Blue", value: "#003399" },
    { name: "Navy Blue", value: "#000080" },
    { name: "Sky Blue", value: "#ADD8E6" },
    { name: "Light Grey", value: "#D3D3D3" },
    { name: "Black Frame", value: "#000000" },
];

const PRINT_SHEETS = [
    { name: "4x6 Inch Glossy Sheet", width: 6, height: 4, unit: 'inch' },
    { name: "A4 Photo Paper", width: 210, height: 297, unit: 'mm' },
];

const DPI = 300; 

type Stage = 'setup' | 'crop' | 'studio' | 'print';

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

export default function PassportPhotoMaker() {
    const { toast } = useToast();

    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [stage, setStage] = useState<Stage>('setup');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    // Core Settings
    const [selectedPreset, setSelectedPreset] = useState<number>(1); 
    const [customWidth, setCustomWidth] = useState<string>("35");
    const [customHeight, setCustomHeight] = useState<string>("45");
    const [subjectImageSrc, setSubjectImageSrc] = useState<string | null>(null); 
    const [bgColor, setBgColor] = useState("#FFFFFF");
    
    // Transform Settings
    const [scale, setScale] = useState(100);
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);
    const [rotation, setRotation] = useState(0);
    
    // Filter Settings
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [blur, setBlur] = useState(0);
    const [borderWidth, setBorderWidth] = useState(0);
    const [borderColor, setBorderColor] = useState("#000000");

    // Crop Logic
    const [crop, setCrop] = useState<CropType>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [originalCroppedData, setOriginalCroppedData] = useState<string | null>(null);
    const [printSheetSrc, setPrintSheetSrc] = useState<string | null>(null);

    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const faceImgRef = useRef<HTMLImageElement | null>(null);

    const getAspectRatio = useCallback(() => {
        const p = PRESETS[selectedPreset];
        if (p.id === 'free') return undefined;
        if (p.id === 'custom') {
            const w = parseFloat(customWidth);
            const h = parseFloat(customHeight);
            return (w > 0 && h > 0) ? w / h : undefined;
        }
        return p.width / p.height;
    }, [selectedPreset, customWidth, customHeight]);

    const updateCropHandles = useCallback(() => {
        if (!imgRef.current) return;
        const { width, height } = imgRef.current;
        const aspect = getAspectRatio();
        
        const initialCrop = aspect 
            ? centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height)
            : centerCrop({ unit: '%', width: 90, height: 90 }, width, height);
            
        setCrop(initialCrop);
    }, [getAspectRatio]);

    useEffect(() => {
        if (stage === 'crop' && imgRef.current) {
            updateCropHandles();
        }
    }, [selectedPreset, customWidth, customHeight, stage, updateCropHandles]);

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setImgSrc(reader.result?.toString() || null);
                setStage('crop');
                resetToDefaults();
            };
            reader.readAsDataURL(file);
        }
    };

    const resetToDefaults = () => {
        setScale(100);
        setPosX(0);
        setPosY(0);
        setRotation(0);
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setBlur(0);
        setBorderWidth(0);
        setBgColor("#FFFFFF");
        setBorderColor("#000000");
    };

    const handleAutoEnhance = () => {
        setBrightness(105);
        setContrast(115);
        setSaturation(110);
        setBlur(0);
        toast({ title: "Auto-Studio Fix", description: "Brightness and contrast balanced for photo quality." });
    };

    const handleRemoveBackground = async () => {
        if (!originalCroppedData) return;
        setIsProcessing(true);
        setProgress(5);
        
        try {
            const imglyModule = await import("@imgly/background-removal");
            const removeBackgroundFunc = imglyModule.removeBackground || (imglyModule as any).default;

            const blob = await removeBackgroundFunc(originalCroppedData, {
                progress: (item: string, index: number, total: number) => {
                    setProgress(Math.round((index / total) * 100));
                },
                output: { format: "image/png", quality: 1.0 }
            });

            const url = URL.createObjectURL(blob);
            setSubjectImageSrc(url);
            
            const img = new window.Image();
            img.src = url;
            img.onload = () => {
                faceImgRef.current = img;
                renderPhoto();
            };

            toast({ title: "AI Magic Done!", description: "Background isolated locally." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Offline Limit", description: "Using original photo." });
        } finally {
            setIsProcessing(false);
        }
    };

    const renderPhoto = useCallback(() => {
        const canvas = mainCanvasRef.current;
        const faceImg = faceImgRef.current;
        if (!canvas || !faceImg) return;
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const currentAspect = getAspectRatio() || (faceImg.width / faceImg.height);
        const targetW = 1200; 
        const targetH = targetW / currentAspect;
        canvas.width = targetW;
        canvas.height = targetH;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
        
        const s = scale / 100;
        const dw = canvas.width * s;
        const dh = (faceImg.height * (dw / faceImg.width));
        
        const dx = (posX / 100) * canvas.width;
        const dy = (posY / 100) * canvas.height;

        const cx = canvas.width / 2 + dx;
        const cy = canvas.height / 2 + dy;

        ctx.translate(cx, cy);
        ctx.rotate((rotation * Math.PI) / 180);
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(faceImg, -dw / 2, -dh / 2, dw, dh);
        
        ctx.restore();

        if (borderWidth > 0) {
            const bPx = (borderWidth / 100) * canvas.width;
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = bPx;
            ctx.strokeRect(bPx/2, bPx/2, canvas.width - bPx, canvas.height - bPx);
        }
    }, [bgColor, scale, posX, posY, rotation, borderWidth, borderColor, brightness, contrast, saturation, blur, getAspectRatio]);

    useEffect(() => {
        if (stage === 'studio') renderPhoto();
    }, [renderPhoto, stage]);

    const handleInitialCrop = async () => {
        if (!imgRef.current || !completedCrop) return;
        setIsProcessing(true);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const cropRatio = completedCrop.width / completedCrop.height;
        const targetW = 1600;
        const targetH = targetW / cropRatio;
        canvas.width = targetW;
        canvas.height = targetH;

        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        ctx.drawImage(
            imgRef.current, 
            completedCrop.x * scaleX, 
            completedCrop.y * scaleY, 
            completedCrop.width * scaleX, 
            completedCrop.height * scaleY, 
            0, 0, targetW, targetH
        );
        
        const data = canvas.toDataURL('image/jpeg', 1.0);
        setOriginalCroppedData(data);
        setSubjectImageSrc(data);
        
        const img = new window.Image();
        img.src = data;
        img.onload = () => {
            faceImgRef.current = img;
            setStage('studio');
            setIsProcessing(false);
            setTimeout(renderPhoto, 100);
        };
    };

    const handleDownload = () => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#ffffff']
        });

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 1.0);
        link.download = `Passport-Photo-${Date.now()}.jpg`;
        link.click();
    };

    const handleReset = () => {
        setStage('setup');
        setImgSrc(null);
        setOriginalCroppedData(null);
        setSubjectImageSrc(null);
        faceImgRef.current = null;
        setPrintSheetSrc(null);
        resetToDefaults();
    };

    const renderPrintSheet = (sheetIndex: number) => {
        const sheet = PRINT_SHEETS[sheetIndex];
        const sourceCanvas = mainCanvasRef.current;
        if (!sourceCanvas) return;

        const currentPreset = PRESETS[selectedPreset];
        let pw_mm, ph_mm;

        if (currentPreset.id === 'free') {
            pw_mm = 35; ph_mm = 45; 
        } else if (currentPreset.id === 'custom') {
            pw_mm = parseFloat(customWidth); ph_mm = parseFloat(customHeight);
        } else {
            pw_mm = currentPreset.width; ph_mm = currentPreset.height;
        }

        const photoW_px = (pw_mm / 25.4) * DPI;
        const photoH_px = (ph_mm / 25.4) * DPI;

        const pW = sheet.unit === 'inch' ? sheet.width * DPI : (sheet.width / 25.4) * DPI;
        const pH = sheet.unit === 'inch' ? sheet.height * DPI : (sheet.height / 25.4) * DPI;

        const orientations = [
            { w: pW, h: pH },
            { w: pH, h: pW }
        ];

        let bestFit = { w: pW, h: pH, cols: 0, rows: 0, total: -1 };
        const gap = (2 / 25.4) * DPI; 

        orientations.forEach(o => {
            const c = Math.floor((o.w - gap) / (photoW_px + gap));
            const r = Math.floor((o.h - gap) / (photoH_px + gap));
            const total = c * r;
            if (total > bestFit.total) {
                bestFit = { w: o.w, h: o.h, cols: c, rows: r, total };
            }
        });

        if (bestFit.total <= 0) {
            toast({ variant: 'destructive', title: 'Format Error', description: 'Photo size is larger than paper.' });
            return;
        }

        const offScreenCanvas = document.createElement('canvas');
        offScreenCanvas.width = bestFit.w;
        offScreenCanvas.height = bestFit.h;
        const ctx = offScreenCanvas.getContext('2d');
        if (!ctx) return;
        
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, bestFit.w, bestFit.h);

        const gridW = bestFit.cols * photoW_px + (bestFit.cols - 1) * gap;
        const gridH = bestFit.rows * photoH_px + (bestFit.rows - 1) * gap;
        const startX = (bestFit.w - gridW) / 2;
        const startY = (bestFit.h - gridH) / 2;

        for (let r = 0; r < bestFit.rows; r++) {
            for (let c = 0; c < bestFit.cols; c++) {
                const x = startX + c * (photoW_px + gap);
                const y = startY + r * (photoH_px + gap);
                ctx.drawImage(sourceCanvas, x, y, photoW_px, photoH_px);
            }
        }
        
        setPrintSheetSrc(offScreenCanvas.toDataURL('image/jpeg', 1.0));
        setStage('print');
    };

    return (
        <div className="w-full max-w-[1800px] mx-auto p-2 md:p-4 flex flex-col gap-4">
            
            {/* 1. SETUP: JUST UPLOAD */}
            {stage === 'setup' && (
                <div className="flex flex-col items-center justify-start gap-2 pt-2 animate-in fade-in duration-700">
                    <Card className="w-full max-w-3xl glass-card overflow-hidden neon-border">
                        <CardContent className="p-3 md:p-6">
                            <div 
                                className="border-4 border-dashed border-primary/20 rounded-[1.5rem] md:rounded-[2.5rem] p-8 md:p-24 flex flex-col items-center justify-center space-y-6 bg-muted/30 group cursor-pointer hover:bg-primary/5 transition-all group relative"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="relative">
                                    <UploadCloud className="size-12 md:size-16 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                                    <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                                </motion.div>
                                <div className="text-center">
                                    <p className="text-lg md:text-xl font-black uppercase tracking-tighter">Click to Upload Image</p>
                                    <p className="text-[10px] md:text-xs text-muted-foreground mt-2 font-bold opacity-60">High-fidelity local re-sampling active.</p>
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                        </CardContent>
                    </Card>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-8">
                        <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-500" /> SECURE RAM</div>
                        <div className="flex items-center gap-1.5"><Maximize className="size-3.5 text-primary" /> PORTRAIT & LANDSCAPE</div>
                        <div className="flex items-center gap-1.5"><Zap className="size-3.5 text-yellow-500" /> GPU BOOST</div>
                    </div>
                </div>
            )}

            {/* 2. CROP STAGE: SIZE SELECT + CROP */}
            {stage === 'crop' && imgSrc && (
                <div className="flex flex-col items-center justify-start py-2 animate-in fade-in duration-500">
                    <Card className="w-full max-w-5xl glass-card shadow-2xl overflow-hidden">
                        <CardHeader className="border-b glass-panel p-4 md:p-6 md:px-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
                                <div className="space-y-1 text-center md:text-left">
                                    <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tighter flex items-center justify-center md:justify-start gap-3">
                                        <CropIcon className="size-5 text-primary" /> Size & Alignment
                                    </CardTitle>
                                    <CardDescription className="font-bold text-[9px] md:text-[10px] uppercase opacity-60">Select standard or 'Free Hand' crop.</CardDescription>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] md:text-[10px] font-black uppercase text-primary tracking-widest">Document Standard</Label>
                                        <Select value={String(selectedPreset)} onValueChange={(v) => setSelectedPreset(Number(v))}>
                                            <SelectTrigger className="h-10 md:h-12 font-black border-2 rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl border-2 shadow-2xl">
                                                {PRESETS.map((p, i) => (
                                                    <SelectItem key={i} value={String(i)} className="font-bold py-2 md:py-3">
                                                        {p.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {PRESETS[selectedPreset].id === 'custom' && (
                                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Width (mm)</Label>
                                                <Input type="number" value={customWidth} onChange={(e) => setCustomWidth(e.target.value)} className="h-9 md:h-10 font-bold border-2 rounded-lg" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Height (mm)</Label>
                                                <Input type="number" value={customHeight} onChange={(e) => setCustomHeight(e.target.value)} className="h-9 md:h-10 font-bold border-2 rounded-lg" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-4 md:p-12 flex items-center justify-center bg-black/5 min-h-[350px] md:min-h-[400px]">
                            <div className="max-h-[45vh] md:max-h-[50vh] overflow-hidden rounded-xl shadow-2xl border-4 border-white/50">
                                <ReactCrop 
                                    crop={crop} 
                                    onChange={setCrop} 
                                    onComplete={setCompletedCrop} 
                                    aspect={getAspectRatio()} 
                                    className="max-h-[45vh] md:max-h-[50vh]"
                                >
                                    <img 
                                        ref={imgRef} 
                                        src={imgSrc} 
                                        alt="source" 
                                        className="max-h-[45vh] md:max-h-[50vh] w-auto object-contain block" 
                                        onLoad={updateCropHandles} 
                                    />
                                </ReactCrop>
                            </div>
                        </CardContent>

                        <CardFooter className="glass-panel border-t p-4 md:p-6 flex flex-col md:flex-row gap-4 justify-between">
                            <Button variant="ghost" onClick={handleReset} className="w-full md:w-auto font-black text-[9px] md:text-[10px] uppercase tracking-widest h-11 md:h-12 px-6 rounded-xl">
                                <RefreshCcw className="mr-2 size-4" /> Start Over
                            </Button>
                            <Button className="w-full md:w-auto h-12 md:h-14 px-12 text-sm md:text-base font-black bg-primary rounded-xl shadow-2xl" onClick={handleInitialCrop}>
                                CONFIRM CROP <ChevronRightIcon className="ml-2 size-5" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* 3. STUDIO STAGE */}
            {stage === 'studio' && (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start h-full animate-in fade-in duration-500">
                    <div className="lg:col-span-3 space-y-4 md:space-y-6">
                        <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-2xl md:rounded-[2.5rem]">
                            <CardHeader className="border-b border-white/10 p-4 md:p-6 bg-primary/5">
                                <div className="flex items-center justify-between mb-4">
                                     <CardTitle className="text-base md:text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                        <Settings2 className="size-4 md:size-5 text-primary" /> Adjustments
                                    </CardTitle>
                                </div>
                                <div className="space-y-3">
                                    <Button 
                                        className="w-full h-10 md:h-12 font-black bg-primary group relative overflow-hidden shadow-xl rounded-lg md:rounded-xl text-[10px] md:text-xs"
                                        onClick={handleRemoveBackground}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? <Loader2 className="size-4 md:size-5 animate-spin mr-2" /> : <Zap className="size-4 md:size-5 text-yellow-400 fill-yellow-400 mr-2" />}
                                        AI REMOVE BACKGROUND
                                    </Button>
                                    <Button variant="outline" className="w-full h-10 md:h-12 font-black border-2 border-primary/20 text-primary rounded-lg md:rounded-xl text-[10px] md:text-xs" onClick={handleAutoEnhance}>
                                        <Wand2 className="size-3.5 md:size-4 mr-2" /> AUTO STUDIO FIX
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Tabs defaultValue="filters" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 h-12 md:h-14 bg-muted/40 p-1.5 border-b border-white/10">
                                        <TabsTrigger value="filters" className="font-bold text-[9px] md:text-[10px] uppercase rounded-lg md:rounded-xl">Filters</TabsTrigger>
                                        <TabsTrigger value="studio" className="font-bold text-[9px] md:text-[10px] uppercase rounded-lg md:rounded-xl">Studio</TabsTrigger>
                                    </TabsList>
                                    <ScrollArea className="h-[250px] md:h-[450px]">
                                        <TabsContent value="filters" className="p-4 md:p-8 space-y-6 md:space-y-8">
                                            <div className="space-y-4 md:space-y-6">
                                                <div className="space-y-3 md:space-y-4">
                                                    <div className="flex justify-between items-center"><Label className="text-[9px] md:text-[10px] font-black uppercase opacity-60">Brightness</Label><span className="text-[9px] md:text-[10px] font-mono font-bold">{brightness}%</span></div>
                                                    <Slider min={50} max={150} value={[brightness]} onValueChange={(v) => setBrightness(v[0])} />
                                                </div>
                                                <div className="space-y-3 md:space-y-4">
                                                    <div className="flex justify-between items-center"><Label className="text-[9px] md:text-[10px] font-black uppercase opacity-60">Contrast</Label><span className="text-[9px] md:text-[10px] font-mono font-bold">{contrast}%</span></div>
                                                    <Slider min={50} max={150} value={[contrast]} onValueChange={(v) => setContrast(v[0])} />
                                                </div>
                                                <div className="space-y-3 md:space-y-4">
                                                    <div className="flex justify-between items-center"><Label className="text-[9px] md:text-[10px] font-black uppercase opacity-60">Vibrance</Label><span className="text-[9px] md:text-[10px] font-mono font-bold">{saturation}%</span></div>
                                                    <Slider min={0} max={200} value={[saturation]} onValueChange={(v) => setSaturation(v[0])} />
                                                </div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="studio" className="p-4 md:p-8 space-y-8 md:space-y-10">
                                            <div className="space-y-3 md:space-y-4">
                                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary">Background Color</Label>
                                                <div className="grid grid-cols-4 gap-2 md:gap-3">
                                                    {COLORS.map(c => (
                                                        <button key={c.value} onClick={() => setBgColor(c.value)} className={cn("size-8 md:size-10 rounded-lg md:rounded-xl border-2 transition-all", bgColor === c.value ? "border-primary ring-4 ring-primary/20" : "border-white/10")} style={{ backgroundColor: c.value }} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] md:text-[10px] font-black uppercase opacity-60">Border Size</Label><span className="text-[9px] md:text-[10px] font-mono font-bold">{borderWidth}%</span></div>
                                                <Slider min={0} max={5} step={0.1} value={[borderWidth]} onValueChange={(v) => setBorderWidth(v[0])} />
                                            </div>
                                            <div className="space-y-4 pt-2">
                                                <Label className="text-[9px] md:text-[10px] font-black uppercase opacity-60">Border Color</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['#000000', '#FFFFFF', '#D3D3D3', '#FF0000', '#0000FF'].map(c => (
                                                        <button 
                                                            key={c} 
                                                            onClick={() => setBorderColor(c)}
                                                            className={cn(
                                                                "size-7 rounded-lg border-2 transition-all",
                                                                borderColor === c ? "border-primary ring-2 ring-primary/10 scale-110" : "border-white/10"
                                                            )}
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                    <Input 
                                                        type="color" 
                                                        value={borderColor} 
                                                        onChange={(e) => setBorderColor(e.target.value)} 
                                                        className="w-8 h-8 p-1 rounded-md cursor-pointer border-none bg-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </ScrollArea>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-6 flex flex-col items-center gap-6 md:gap-8 text-center">
                        <div className="relative group w-full max-w-[500px]">
                            <Card className="relative bg-white shadow-2xl border-[6px] md:border-[12px] border-white rounded-[1.5rem] md:rounded-[3rem] overflow-hidden flex items-center justify-center">
                                <canvas ref={mainCanvasRef} className="max-w-full h-auto object-contain" />
                                {isProcessing && (
                                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 md:p-12 gap-6 md:gap-8 z-20">
                                        <Loader2 className="size-12 md:size-20 animate-spin text-primary stroke-[3]" />
                                        <Progress value={progress} className="h-1.5 w-full max-w-[200px] md:max-w-[280px]" />
                                    </div>
                                )}
                            </Card>
                            <div className="absolute -bottom-10 md:-bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 md:gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-1 md:p-1.5 rounded-full shadow-2xl border-2 border-white/20 z-10 whitespace-nowrap">
                                <Button variant="outline" size="icon" className="size-6 md:size-8 rounded-full" onClick={() => setScale(s => s + 5)}><ZoomIn className="size-3 md:size-3.5"/></Button>
                                <Button variant="outline" size="icon" className="size-6 md:size-8 rounded-full" onClick={() => setScale(s => s - 5)}><ZoomOut className="size-3 md:size-3.5"/></Button>
                                <Separator orientation="vertical" className="h-3 md:h-5 mx-0.5" />
                                
                                <div className="grid grid-cols-2 gap-0.5">
                                    <Button variant="outline" size="icon" className="size-4 md:size-6 rounded" onClick={() => setPosY(p => p - 1)}><ChevronUp className="size-2 md:size-2.5"/></Button>
                                    <Button variant="outline" size="icon" className="size-4 md:size-6 rounded" onClick={() => setPosY(p => p + 1)}><ChevronDown className="size-2 md:size-2.5"/></Button>
                                    <Button variant="outline" size="icon" className="size-4 md:size-6 rounded" onClick={() => setPosX(p => p - 1)}><ChevronLeft className="size-2 md:size-2.5"/></Button>
                                    <Button variant="outline" size="icon" className="size-4 md:size-6 rounded" onClick={() => setPosX(p => p + 1)}><ChevronRight className="size-2 md:size-2.5"/></Button>
                                </div>

                                <Separator orientation="vertical" className="h-3 md:h-5 mx-0.5" />
                                <Button variant="outline" size="icon" className="size-6 md:size-8 rounded-full text-primary" onClick={() => setRotation(r => (r + 90) % 360)}><RotateCw className="size-3 md:size-3.5"/></Button>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full max-w-[500px] mt-12 md:mt-16">
                             <Button variant="outline" onClick={handleReset} className="flex-1 h-12 md:h-16 rounded-xl md:rounded-[1.5rem] border-2 font-black uppercase text-[10px] md:text-xs tracking-widest">Start Over</Button>
                            <Button 
                                size="lg" 
                                className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-16 flex-[2] shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none" 
                                onClick={handleDownload}
                            >
                                <div className="absolute left-4 w-0.5 h-6 md:h-8 bg-white/40 rounded-full" />
                                <span className="flex-1 px-10 text-center tracking-widest text-sm md:text-lg uppercase">SAVE JPG</span>
                                <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                    <Download className="size-6 md:size-8 group-hover:scale-110 transition-transform" />
                                    <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                                </div>
                            </Button>
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-4 md:space-y-6">
                        <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-2xl md:rounded-[2.5rem]">
                            <CardHeader className="bg-primary/5 p-4 md:p-6 border-b border-white/10 text-left">
                                <CardTitle className="text-base md:text-lg font-black uppercase flex items-center gap-2"><Printer className="size-4 md:size-5 text-primary" /> Print Sheets</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                                {PRINT_SHEETS.map((sheet, i) => (
                                    <Button key={i} variant="outline" className="h-16 md:h-20 w-full justify-start gap-3 md:gap-4 rounded-xl md:rounded-2xl border-2 hover:border-primary" onClick={() => renderPrintSheet(i)}>
                                        <div className="size-8 md:size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Layout className="size-4 md:size-5" /></div>
                                        <div className="text-left"><p className="text-[10px] md:text-xs font-black uppercase">{sheet.name}</p><p className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase opacity-70">HD Auto-Fit Grid</p></div>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* 4. PRINT PREVIEW MODAL */}
            <AnimatePresence>
                {stage === 'print' && printSheetSrc && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-3xl p-4 md:p-12 flex flex-col items-center justify-center overflow-y-auto"
                    >
                        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 md:gap-16 items-center">
                            <div className="flex-1 space-y-6 md:space-y-12 text-white text-center md:text-left">
                                <div className="space-y-3">
                                    <h2 className="text-3xl md:text-6xl font-black font-headline uppercase tracking-tighter leading-none">Print-Ready <br/><span className="text-primary">Master Sheet</span></h2>
                                    <p className="text-slate-400 text-sm md:text-xl font-medium leading-relaxed">Industrial 300 DPI standards for ultra-sharp glossy prints. Perfect for bulk physical printing.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                                    <Button variant="outline" onClick={() => setStage('studio')} className="h-14 md:h-20 flex-1 rounded-2xl md:rounded-[2rem] border-white/20 text-white font-black uppercase bg-white/5 hover:bg-white/10">CANCEL</Button>
                                    <Button 
                                        className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-[2rem] transition-all duration-300 group h-16 md:h-20 flex-[2] shadow-[0_15px_30px_-10px_rgba(0,174,239,0.6)] border-none" 
                                        onClick={() => {
                                            const link = document.createElement('a'); link.href = printSheetSrc; 
                                            link.download = `GR7-Tools-Print-Sheet-${Date.now()}.jpg`; link.click();
                                        }}
                                    >
                                        <div className="absolute left-6 w-0.5 h-10 bg-white/40 rounded-full" />
                                        <span className="flex-1 px-12 text-center tracking-widest text-sm md:text-xl uppercase">DOWNLOAD SHEET</span>
                                        <div className="bg-white h-full pl-10 pr-12 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-11 group-hover:pr-13 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                            <Download className="size-8 group-hover:scale-110 transition-transform" />
                                            <div className="absolute right-4 w-0.5 h-10 bg-[#00aeef]/20 rounded-full" />
                                        </div>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-[1.3] relative flex justify-center animate-in zoom-in-95 duration-500 max-w-full">
                                <div className="shadow-[0_80px_160px_-20px_rgba(0,0,0,0.8)] border-[8px] md:border-[16px] border-white rounded-sm overflow-hidden bg-white max-w-full">
                                    <img src={printSheetSrc} alt="Master Print Sheet" className="max-w-full h-auto max-h-[55vh] md:max-h-[70vh] block" />
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 md:top-10 md:right-10 size-12 md:size-16 text-white/40 hover:text-white hover:bg-white/10 rounded-full" onClick={() => setStage('studio')}><X className="size-8 md:size-10" /></Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <canvas ref={mainCanvasRef} className="hidden" />
        </div>
    );
}
