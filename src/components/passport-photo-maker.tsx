"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { 
    UploadCloud, 
    Download, 
    Crop as CropIcon, 
    RefreshCcw, 
    Eraser, 
    Loader2, 
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
    Image as ImageIcon,
    Sun,
    Contrast,
    Droplets,
    Layout,
    Printer,
    Monitor,
    Maximize,
    Undo2,
    Redo2,
    History,
    Save,
    Camera,
    Globe,
    Frame,
    Wand2,
    ChevronRight as ChevronRightIcon,
    MousePointer2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
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
 * ZUSTAND STATE MANAGEMENT
 */
interface EditorState {
    history: string[];
    historyIndex: number;
    addToHistory: (url: string) => void;
    undo: () => string | null;
    redo: () => string | null;
    resetHistory: () => void;
}

const useEditorStore = create<EditorState>((set, get) => ({
    history: [],
    historyIndex: -1,
    addToHistory: (url) => {
        const { history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(url);
        if (newHistory.length > 20) newHistory.shift();
        set({ history: newHistory, historyIndex: newHistory.length - 1 });
    },
    undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            set({ historyIndex: newIndex });
            return history[newIndex];
        }
        return null;
    },
    redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            set({ historyIndex: newIndex });
            return history[newIndex];
        }
        return null;
    },
    resetHistory: () => set({ history: [], historyIndex: -1 })
}));

/**
 * CONSTANTS & PRESETS
 */
const PRESETS = [
    { id: 'free', label: "Free Hand Crop (Manual)", width: 0, height: 0, unit: 'px' },
    { id: 'in_p', label: "India Passport (35x45mm)", width: 35, height: 45, unit: 'mm' },
    { id: 'aadhaar', label: "Aadhaar Card (86x54mm) - Landscape", width: 86, height: 54, unit: 'mm' },
    { id: 'pan', label: "PAN Card (85x55mm) - Landscape", width: 85, height: 55, unit: 'mm' },
    { id: 'us_v', label: "USA Visa / Passport (2x2in)", width: 2, height: 2, unit: 'inch' },
    { id: 'uk_p', label: "UK Passport (35x45mm)", width: 35, height: 45, unit: 'mm' },
    { id: 'ca_p', label: "Canada Passport (5x7cm)", width: 50, height: 70, unit: 'mm' },
    { id: 'dl', label: "Driving Licence (3.5x4.5cm)", width: 35, height: 45, unit: 'mm' },
    { id: 'custom', label: "Custom Size (Input mm Below)", width: 0, height: 0, unit: 'mm' },
];

const COLORS = [
    { name: "Pure White", value: "#FFFFFF" },
    { name: "Off White", value: "#F5F5F5" },
    { name: "Royal Blue", value: "#003399" },
    { name: "Navy Blue", value: "#000080" },
    { name: "Sky Blue", value: "#ADD8E6" },
    { name: "Light Grey", value: "#D3D3D3" },
    { name: "Black Frame", value: "#000000" },
    { name: "Premium Teal", value: "#5cbdb9" },
];

const PRINT_SHEETS = [
    { name: "4x6 Inch Sheet (8 Photos)", width: 6, height: 4, unit: 'inch', cols: 4, rows: 2 },
    { name: "A4 Paper (Multi-Set)", width: 210, height: 297, unit: 'mm', cols: 5, rows: 6 },
];

const DPI = 300; 

type Stage = 'setup' | 'crop' | 'studio' | 'print';

export default function PassportPhotoMaker() {
    const { toast } = useToast();
    const store = useEditorStore();

    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [stage, setStage] = useState<Stage>('setup');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    // Core Settings
    const [selectedPreset, setSelectedPreset] = useState<number>(1); // Default to India Passport
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
    const [crop, setCrop] = useState<Crop>();
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
            store.addToHistory(url);
            
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

        // Use actual crop ratio if available
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
            colors: ['#5cbdb9', '#fbe3e8', '#ffffff']
        });

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 1.0);
        link.download = `GR7-Studio-Document-${Date.now()}.jpg`;
        link.click();
    };

    const handleUndo = () => {
        const prev = store.undo();
        if (prev) {
            setSubjectImageSrc(prev);
            const img = new window.Image();
            img.src = prev;
            img.onload = () => {
                faceImgRef.current = img;
                renderPhoto();
            };
        }
    };

    const handleRedo = () => {
        const next = store.redo();
        if (next) {
            setSubjectImageSrc(next);
            const img = new window.Image();
            img.src = next;
            img.onload = () => {
                faceImgRef.current = img;
                renderPhoto();
            };
        }
    };

    const handleReset = () => {
        setStage('setup');
        setImgSrc(null);
        setOriginalCroppedData(null);
        setSubjectImageSrc(null);
        faceImgRef.current = null;
        setPrintSheetSrc(null);
        store.resetHistory();
        resetToDefaults();
    };

    const renderPrintSheet = (sheetIndex: number) => {
        const sheet = PRINT_SHEETS[sheetIndex];
        const sourceCanvas = mainCanvasRef.current;
        if (!sourceCanvas) return;

        const offScreenCanvas = document.createElement('canvas');
        const ctx = offScreenCanvas.getContext('2d');
        if (!ctx) return;

        const targetW = sheet.unit === 'inch' ? sheet.width * DPI : (sheet.width / 25.4) * DPI;
        const targetH = sheet.unit === 'inch' ? sheet.height * DPI : (sheet.height / 25.4) * DPI;
        
        offScreenCanvas.width = targetW;
        offScreenCanvas.height = targetH;
        
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, targetW, targetH);

        // Get actual dimensions of the cropped photo
        const currentPreset = PRESETS[selectedPreset];
        let pw_mm, ph_mm;

        if (currentPreset.id === 'free') {
            pw_mm = 35; ph_mm = 45; // Default if free
        } else if (currentPreset.id === 'custom') {
            pw_mm = parseFloat(customWidth); ph_mm = parseFloat(customHeight);
        } else {
            pw_mm = currentPreset.width; ph_mm = currentPreset.height;
        }

        const photoW = (pw_mm / 25.4) * DPI;
        const photoH = (ph_mm / 25.4) * DPI;
        
        const marginX = (targetW - (photoW * sheet.cols)) / (sheet.cols + 1);
        const marginY = (targetH - (photoH * sheet.rows)) / (sheet.rows + 1);

        for (let r = 0; r < sheet.rows; r++) {
            for (let c = 0; c < sheet.cols; c++) {
                const x = marginX + c * (photoW + marginX);
                const y = marginY + r * (photoH + marginY);
                ctx.drawImage(sourceCanvas, x, y, photoW, photoH);
            }
        }
        
        setPrintSheetSrc(offScreenCanvas.toDataURL('image/jpeg', 1.0));
        setStage('print');
    };

    return (
        <div className="w-full max-w-[1800px] min-h-[90vh] mx-auto p-4 md:p-8 flex flex-col gap-6 animate-in fade-in duration-700">
            
            {/* 1. SETUP: JUST UPLOAD */}
            {stage === 'setup' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-12 py-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
                        <div className="mx-auto mb-6 grid size-24 place-items-center rounded-[2.5rem] bg-primary/10 text-primary shadow-2xl relative">
                            <UserCircle className="size-12" />
                            <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground size-8 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                <Sparkles className="size-4" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase leading-none">
                            Premium <span className="text-gradient-hero">AI Studio</span>
                        </h1>
                        <p className="text-lg text-muted-foreground font-semibold max-w-xl mx-auto">
                            Step 1: Upload your photo or document to begin. <br/>100% Private local processing.
                        </p>
                    </motion.div>

                    <Card className="w-full max-w-2xl glass-card overflow-hidden neon-border">
                        <CardContent className="p-10">
                            <div 
                                className="border-4 border-dashed border-primary/20 rounded-[3rem] p-24 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-primary/5 transition-all group relative"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="relative">
                                    <UploadCloud className="size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Zap className="absolute -top-2 -right-2 size-8 text-yellow-500 animate-pulse" />
                                </motion.div>
                                <div className="text-center">
                                    <p className="text-2xl font-black uppercase tracking-tighter">Click to Upload Image</p>
                                    <p className="text-sm text-muted-foreground mt-2 font-bold opacity-60">High-fidelity local re-sampling active.</p>
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                        </CardContent>
                    </Card>

                    <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
                        <div className="flex items-center gap-2"><Maximize className="size-4 text-primary" /> PORTRAIT & LANDSCAPE</div>
                        <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> GPU BOOST</div>
                    </div>
                </div>
            )}

            {/* 2. CROP STAGE: SIZE SELECT + CROP */}
            {stage === 'crop' && imgSrc && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-4">
                    <Card className="w-full max-w-5xl glass-card shadow-2xl overflow-hidden">
                        <CardHeader className="border-b glass-panel py-6 px-8">
                            <div className="grid lg:grid-cols-2 gap-8 items-center">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                        <CropIcon className="size-5 text-primary" /> Step 2: Size & Alignment
                                    </CardTitle>
                                    <CardDescription className="font-bold text-[10px] uppercase opacity-60">Select 'Free Hand' to drag handles anywhere.</CardDescription>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Target Document Standard</Label>
                                        <Select value={String(selectedPreset)} onValueChange={(v) => setSelectedPreset(Number(v))}>
                                            <SelectTrigger className="h-12 font-black border-2 rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl border-2 shadow-2xl">
                                                {PRESETS.map((p, i) => (
                                                    <SelectItem key={i} value={String(i)} className="font-bold py-3">
                                                        {p.id === 'free' ? <MousePointer2 className="size-3 mr-2 inline" /> : null}
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
                                                <Input type="number" value={customWidth} onChange={(e) => setCustomWidth(e.target.value)} className="h-10 font-bold border-2 rounded-lg" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Height (mm)</Label>
                                                <Input type="number" value={customHeight} onChange={(e) => setCustomHeight(e.target.value)} className="h-10 font-bold border-2 rounded-lg" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-8 md:p-12 flex items-center justify-center bg-black/5 min-h-[500px]">
                            <div className="max-h-[55vh] overflow-hidden rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-white/50">
                                <ReactCrop 
                                    crop={crop} 
                                    onChange={setCrop} 
                                    onComplete={setCompletedCrop} 
                                    aspect={getAspectRatio()} 
                                    className="max-h-[55vh]"
                                >
                                    <img 
                                        ref={imgRef} 
                                        src={imgSrc} 
                                        alt="source" 
                                        className="max-h-[55vh] w-auto object-contain block" 
                                        onLoad={updateCropHandles} 
                                    />
                                </ReactCrop>
                            </div>
                        </CardContent>

                        <CardFooter className="glass-panel border-t p-6 flex justify-between">
                            <Button variant="ghost" onClick={handleReset} className="font-black text-[10px] uppercase tracking-widest h-12 px-6 rounded-xl">
                                <RefreshCcw className="mr-2 size-4" /> Start Over
                            </Button>
                            <Button className="h-14 px-12 text-base font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-xl group" onClick={handleInitialCrop}>
                                CONFIRM CROP <ChevronRightIcon className="ml-2 size-5" />
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            )}

            {/* 3. STUDIO STAGE */}
            {stage === 'studio' && (
                <div className="flex-1 grid lg:grid-cols-12 gap-8 items-start h-full">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="lg:col-span-3 space-y-6">
                        <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                            <CardHeader className="border-b border-white/10 p-6 bg-primary/5">
                                <div className="flex items-center justify-between mb-4">
                                     <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                        <Settings2 className="size-5 text-primary" /> Adjustments
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={handleUndo}><Undo2 className="size-4"/></Button>
                                        <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={handleRedo}><Redo2 className="size-4"/></Button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Button 
                                        className="w-full h-12 font-black bg-primary group relative overflow-hidden shadow-xl rounded-xl"
                                        onClick={handleRemoveBackground}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? <Loader2 className="size-5 animate-spin mr-2" /> : <Zap className="size-5 text-yellow-400 fill-yellow-400 mr-2 group-hover:scale-125 transition-transform" />}
                                        AI REMOVE BACKGROUND
                                    </Button>
                                    <Button variant="outline" className="w-full h-12 font-black border-2 border-primary/20 text-primary rounded-xl" onClick={handleAutoEnhance}>
                                        <Wand2 className="size-4 mr-2" /> AUTO STUDIO FIX
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Tabs defaultValue="filters" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/40 p-1.5 border-b border-white/10">
                                        <TabsTrigger value="filters" className="font-bold text-[10px] uppercase rounded-xl">Filters</TabsTrigger>
                                        <TabsTrigger value="studio" className="font-bold text-[10px] uppercase rounded-xl">Studio</TabsTrigger>
                                    </TabsList>
                                    <ScrollArea className="h-[450px]">
                                        <TabsContent value="filters" className="p-8 space-y-8">
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Brightness</Label><span className="text-[10px] font-mono font-bold">{brightness}%</span></div>
                                                    <Slider min={50} max={150} value={[brightness]} onValueChange={(v) => setBrightness(v[0])} />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Contrast</Label><span className="text-[10px] font-mono font-bold">{contrast}%</span></div>
                                                    <Slider min={50} max={150} value={[contrast]} onValueChange={(v) => setContrast(v[0])} />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Saturation</Label><span className="text-[10px] font-mono font-bold">{saturation}%</span></div>
                                                    <Slider min={0} max={200} value={[saturation]} onValueChange={(v) => setSaturation(v[0])} />
                                                </div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="studio" className="p-8 space-y-10">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Background Color</Label>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {COLORS.map(c => (
                                                        <button key={c.value} onClick={() => setBgColor(c.value)} className={cn("size-10 rounded-xl border-2 transition-all shadow-lg hover:scale-110", bgColor === c.value ? "border-primary ring-4 ring-primary/20" : "border-white/10")} style={{ backgroundColor: c.value }} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Border (Frame)</Label><span className="text-[10px] font-mono font-bold">{borderWidth}%</span></div>
                                                <Slider min={0} max={5} step={0.1} value={[borderWidth]} onValueChange={(v) => setBorderWidth(v[0])} />
                                                <div className="flex gap-2">
                                                    {['#000', '#fff', '#e2e8f0', '#5cbdb9'].map(c => (
                                                        <button key={c} onClick={() => setBorderColor(c)} className={cn("size-8 rounded-lg border-2", borderColor === c ? "border-primary" : "border-transparent")} style={{ backgroundColor: c }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </ScrollArea>
                                </Tabs>
                            </CardContent>
                        </Card>
                        <div className="glass-panel p-6 rounded-[2rem] flex gap-4 items-center shadow-xl">
                            <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0"><ShieldCheck className="size-6 text-green-600" /></div>
                            <div>
                                <p className="text-[11px] font-black text-green-700 uppercase tracking-tight">Enterprise Privacy</p>
                                <p className="text-[9px] text-muted-foreground font-medium leading-tight">ISO-27001 standard compliant local re-encoding. Zero cloud footprint.</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="lg:col-span-6 flex flex-col items-center gap-8">
                        <div className="relative group max-w-[600px] w-full">
                            <Card className="relative bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[12px] border-white rounded-[3.5rem] overflow-hidden flex items-center justify-center">
                                <canvas ref={mainCanvasRef} className="max-w-full h-auto object-contain" />
                                {isProcessing && (
                                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 gap-8 z-20">
                                        <Loader2 className="size-20 animate-spin text-primary stroke-[3]" />
                                        <Progress value={progress} className="h-2 w-full max-w-[280px]" />
                                    </div>
                                )}
                            </Card>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-2.5 rounded-[2rem] shadow-2xl border-2 border-white/20 z-10">
                                <Button variant="outline" size="icon" className="size-10 rounded-full" onClick={() => setScale(s => s + 5)}><ZoomIn className="size-4"/></Button>
                                <Button variant="outline" size="icon" className="size-10 rounded-full" onClick={() => setScale(s => s - 5)}><ZoomOut className="size-4"/></Button>
                                <Separator orientation="vertical" className="h-6 mx-1" />
                                <div className="grid grid-cols-2 gap-1">
                                    <Button variant="outline" size="icon" className="size-7 rounded" onClick={() => setPosX(p => p - 1)}><ChevronLeft className="size-3"/></Button>
                                    <Button variant="outline" size="icon" className="size-7 rounded" onClick={() => setPosX(p => p + 1)}><ChevronRight className="size-3"/></Button>
                                    <Button variant="outline" size="icon" className="size-7 rounded" onClick={() => setPosY(p => p - 1)}><ChevronUp className="size-3"/></Button>
                                    <Button variant="outline" size="icon" className="size-7 rounded" onClick={() => setPosY(p => p + 1)}><ChevronDown className="size-3"/></Button>
                                </div>
                                <Separator orientation="vertical" className="h-6 mx-1" />
                                <Button variant="outline" size="icon" className="size-10 rounded-full text-primary" onClick={() => setRotation(r => (r + 90) % 360)}><RotateCw className="size-4"/></Button>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full max-w-[500px] mt-10">
                             <Button variant="outline" onClick={handleReset} className="flex-1 h-16 rounded-[1.5rem] border-2 font-black uppercase text-xs tracking-widest">Start Over</Button>
                            <Button className="flex-[2] h-16 rounded-[1.5rem] bg-primary text-lg font-black shadow-2xl" onClick={handleDownload}><Download className="mr-3 size-6" /> DOWNLOAD JPG</Button>
                        </div>
                    </motion.div>

                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="lg:col-span-3 space-y-6">
                        <Card className="glass-panel border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="bg-primary/5 p-6 border-b border-white/10">
                                <CardTitle className="text-lg font-black uppercase flex items-center gap-2"><Printer className="size-5 text-primary" /> Print Sheets</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {PRINT_SHEETS.map((sheet, i) => (
                                    <Button key={i} variant="outline" className="h-20 w-full justify-start gap-4 rounded-2xl border-2 hover:border-primary" onClick={() => renderPrintSheet(i)}>
                                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Layout className="size-5" /></div>
                                        <div className="text-left"><p className="text-xs font-black uppercase">{sheet.name}</p><p className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">300 DPI Rendering</p></div>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* 4. PRINT PREVIEW MODAL */}
            <AnimatePresence>
                {stage === 'print' && printSheetSrc && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl p-8 flex items-center justify-center overflow-y-auto">
                        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1 space-y-8 text-white text-center md:text-left">
                                <h2 className="text-5xl font-black font-headline uppercase tracking-tighter leading-none">Print-Ready <span className="text-primary">Master Sheet</span></h2>
                                <p className="text-slate-400 text-lg">Industrial 300 DPI standards for ultra-sharp glossy prints.</p>
                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={() => setStage('studio')} className="h-16 flex-1 rounded-2xl border-white/30 text-white font-black uppercase bg-transparent">CANCEL</Button>
                                    <Button className="h-16 flex-[2] rounded-2xl bg-green-600 hover:bg-green-700 shadow-2xl font-black text-lg" onClick={() => {
                                        const link = document.createElement('a'); link.href = printSheetSrc; link.download = `Print-Sheet-${Date.now()}.jpg`; link.click();
                                    }}>DOWNLOAD SHEET</Button>
                                </div>
                            </div>
                            <div className="flex-[1.2] relative flex justify-center animate-in zoom-in-95 duration-500">
                                <div className="shadow-2xl border-[12px] border-white rounded-sm overflow-hidden bg-white max-w-full">
                                    <img src={printSheetSrc} alt="Master Print Sheet" className="max-w-full h-auto max-h-[70vh] block" />
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="absolute top-8 right-8 size-12 text-white" onClick={() => setStage('studio')}><X className="size-8" /></Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <canvas ref={mainCanvasRef} className="hidden" />
        </div>
    );
}
