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
    Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * ZUSTAND STATE MANAGEMENT FOR PREMIUM EDITOR
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
    { id: 'in_p', label: "India Passport (3.5x4.5cm)", width: 35, height: 45, unit: 'mm' },
    { id: 'us_v', label: "USA Visa / Passport (2x2in)", width: 2, height: 2, unit: 'inch' },
    { id: 'uk_p', label: "UK Passport (3.5x4.5cm)", width: 35, height: 45, unit: 'mm' },
    { id: 'ca_p', label: "Canada Passport (5x7cm)", width: 50, height: 70, unit: 'mm' },
    { id: 'pan', label: "Indian PAN Card (2.5x3.5cm)", width: 25, height: 35, unit: 'mm' },
    { id: 'aadhaar', label: "Aadhaar Card Photo (2.3x3.3cm)", width: 23, height: 33, unit: 'mm' },
    { id: 'dl', label: "Driving Licence (3.5x4.5cm)", width: 35, height: 45, unit: 'mm' },
];

const COLORS = [
    { name: "Pure White", value: "#FFFFFF" },
    { name: "Off White", value: "#F5F5F5" },
    { name: "Royal Blue", value: "#003399" },
    { name: "Navy Blue", value: "#000080" },
    { name: "Sky Blue", value: "#ADD8E6" },
    { name: "Light Grey", value: "#D3D3D3" },
    { name: "Dark Red", value: "#8B0000" },
    { name: "Premium Teal", value: "#5cbdb9" },
];

const PRINT_SHEETS = [
    { name: "4x6 Inch Sheet (8 Photos)", width: 4, height: 6, unit: 'inch', cols: 4, rows: 2 },
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
    const [selectedPreset, setSelectedPreset] = useState<number>(0);
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

    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const faceImgRef = useRef<HTMLImageElement | null>(null);
    const printCanvasRef = useRef<HTMLCanvasElement>(null);

    const getAspectRatio = () => {
        const p = PRESETS[selectedPreset];
        return p.width / p.height;
    };

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

        // ULTRA HD Resolution
        const targetW = 1200; 
        const targetH = targetW / getAspectRatio();
        canvas.width = targetW;
        canvas.height = targetH;

        // 1. Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Filters Application
        ctx.save();
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
        
        // 3. Transformations
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

        // 4. Border
        if (borderWidth > 0) {
            const bPx = (borderWidth / 100) * canvas.width;
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = bPx;
            ctx.strokeRect(bPx/2, bPx/2, canvas.width - bPx, canvas.height - bPx);
        }
    }, [bgColor, scale, posX, posY, rotation, selectedPreset, borderWidth, borderColor, brightness, contrast, saturation, blur]);

    useEffect(() => {
        if (stage === 'studio') renderPhoto();
    }, [renderPhoto, stage]);

    const handleInitialCrop = async () => {
        if (!imgRef.current || !completedCrop) return;
        setIsProcessing(true);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const targetW = 1600;
        const targetH = targetW / getAspectRatio();
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
        link.download = `GR7-Premium-Passport-${Date.now()}.jpg`;
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

    const renderPrintSheet = (sheetIndex: number) => {
        const sheet = PRINT_SHEETS[sheetIndex];
        const sourceCanvas = mainCanvasRef.current;
        const canvas = printCanvasRef.current;
        if (!canvas || !sourceCanvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // A4 or 4x6 at 300 DPI
        const targetW = sheet.unit === 'inch' ? sheet.width * DPI : (sheet.width / 25.4) * DPI;
        const targetH = sheet.unit === 'inch' ? sheet.height * DPI : (sheet.height / 25.4) * DPI;
        
        canvas.width = targetW;
        canvas.height = targetH;
        
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, targetW, targetH);

        const photoW = (PRESETS[selectedPreset].width / 25.4) * DPI;
        const photoH = (PRESETS[selectedPreset].height / 25.4) * DPI;
        
        const marginX = (targetW - (photoW * sheet.cols)) / (sheet.cols + 1);
        const marginY = (targetH - (photoH * sheet.rows)) / (sheet.rows + 1);

        for (let r = 0; i < sheet.rows; r++) {
            for (let c = 0; j < sheet.cols; c++) {
                const x = marginX + c * (photoW + marginX);
                const y = marginY + r * (photoH + marginY);
                ctx.drawImage(sourceCanvas, x, y, photoW, photoH);
            }
        }
        setStage('print');
    };

    /**
     * MAIN UI RENDER
     */
    return (
        <div className="w-full max-w-[1800px] min-h-[90vh] mx-auto p-4 md:p-8 flex flex-col gap-6 animate-in fade-in duration-700">
            
            {/* 1. SETUP / WELCOME STAGE */}
            {stage === 'setup' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-12 py-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
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
                            Production-ready passport photos with exact global standards. <br/>100% Secure local processing inspired by Adobe Express.
                        </p>
                    </motion.div>

                    <Card className="w-full max-w-2xl glass-card overflow-hidden neon-border">
                        <CardContent className="p-10 space-y-10">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2">
                                    <Globe className="size-3" /> Select Target Standard
                                </Label>
                                <Select value={String(selectedPreset)} onValueChange={(v) => setSelectedPreset(Number(v))}>
                                    <SelectTrigger className="h-16 font-black text-lg border-2 rounded-2xl shadow-xl px-6"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-2xl border-2 shadow-2xl">
                                        {PRESETS.map((p, i) => (
                                            <SelectItem key={i} value={String(i)} className="font-bold py-4">{p.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div 
                                className="border-4 border-dashed border-primary/20 rounded-[3rem] p-20 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-primary/5 transition-all group relative"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="relative">
                                    <UploadCloud className="size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Zap className="absolute -top-2 -right-2 size-8 text-yellow-500 animate-pulse" />
                                </motion.div>
                                <div className="text-center">
                                    <p className="text-2xl font-black uppercase tracking-tighter">Drag & Drop Image</p>
                                    <p className="text-sm text-muted-foreground mt-2 font-bold opacity-60">High-fidelity local re-sampling active.</p>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                        </CardContent>
                    </Card>

                    <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> Vercel Pro Ready</div>
                        <div className="flex items-center gap-2"><Maximize className="size-4 text-primary" /> Multi-Country Support</div>
                        <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> GPU Accelerated AI</div>
                    </div>
                </div>
            )}

            {/* 2. CROP STAGE */}
            {stage === 'crop' && imgSrc && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-8">
                    <Card className="w-full max-w-5xl glass-card overflow-hidden">
                        <CardHeader className="border-b glass-panel py-6 px-10 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                    <CropIcon className="size-6 text-primary" /> Step 1: Smart Alignment
                                </CardTitle>
                                <CardDescription className="font-bold text-xs uppercase opacity-60">Center your face perfectly within the frame.</CardDescription>
                            </div>
                            <Badge className="bg-primary text-white font-black px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest shadow-xl">
                                {PRESETS[selectedPreset].label}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-10 flex justify-center bg-black/5 dark:bg-white/5 shadow-inner">
                            <ReactCrop 
                                crop={crop} 
                                onChange={setCrop} 
                                onComplete={setCompletedCrop} 
                                aspect={getAspectRatio()} 
                                className="shadow-2xl ring-8 ring-white/50 rounded-lg overflow-hidden"
                            >
                                <img ref={imgRef} src={imgSrc} alt="source" className="max-h-[60vh] w-full object-contain" onLoad={(e) => {
                                    const { width, height } = e.currentTarget;
                                    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 80 }, getAspectRatio(), width, height), width, height));
                                }} />
                            </ReactCrop>
                        </CardContent>
                        <CardFooter className="glass-panel border-t p-8 flex justify-between">
                            <Button variant="ghost" onClick={handleReset} className="font-black text-xs uppercase tracking-widest h-14 px-8 rounded-2xl">
                                <ChevronLeft className="mr-2 size-4" /> Go Back
                            </Button>
                            <Button className="h-14 px-12 text-lg font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl group" onClick={handleInitialCrop}>
                                START AI STUDIO <ChevronRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            )}

            {/* 3. STUDIO STAGE (DASHBOARD STYLE) */}
            {stage === 'studio' && (
                <div className="flex-1 grid lg:grid-cols-12 gap-8 items-start h-full">
                    
                    {/* LEFT SIDEBAR: TOOLS */}
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
                                <Button 
                                    className="w-full h-12 font-black bg-primary group relative overflow-hidden shadow-xl rounded-xl"
                                    onClick={handleRemoveBackground}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="size-5 animate-spin mr-2" /> : <Zap className="size-5 text-yellow-400 fill-yellow-400 mr-2 group-hover:scale-125 transition-transform" />}
                                    AI REMOVE BACKGROUND
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 animate-pulse -z-10 transition-opacity" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Tabs defaultValue="filters" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/40 p-1.5 border-b border-white/10">
                                        <TabsTrigger value="filters" className="font-bold text-[10px] uppercase rounded-xl">
                                            <Sun className="size-3 mr-2" /> Filters
                                        </TabsTrigger>
                                        <TabsTrigger value="studio" className="font-bold text-[10px] uppercase rounded-xl">
                                            <Palette className="size-3 mr-2" /> Studio
                                        </TabsTrigger>
                                    </TabsList>

                                    <ScrollArea className="h-[500px]">
                                        <TabsContent value="filters" className="p-8 space-y-8 animate-in fade-in duration-300">
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase flex items-center gap-2 opacity-60"><Sun className="size-3" /> Brightness</Label><span className="text-[10px] font-mono font-bold">{brightness}%</span></div>
                                                    <Slider min={50} max={150} value={[brightness]} onValueChange={(v) => setBrightness(v[0])} />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase flex items-center gap-2 opacity-60"><Contrast className="size-3" /> Contrast</Label><span className="text-[10px] font-mono font-bold">{contrast}%</span></div>
                                                    <Slider min={50} max={150} value={[contrast]} onValueChange={(v) => setContrast(v[0])} />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase flex items-center gap-2 opacity-60"><Droplets className="size-3" /> Saturation</Label><span className="text-[10px] font-mono font-bold">{saturation}%</span></div>
                                                    <Slider min={0} max={200} value={[saturation]} onValueChange={(v) => setSaturation(v[0])} />
                                                </div>
                                                <Separator className="opacity-10" />
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase flex items-center gap-2 opacity-60"><Zap className="size-3" /> Blur Fine-tune</Label><span className="text-[10px] font-mono font-bold">{blur}px</span></div>
                                                    <Slider min={0} max={10} step={0.5} value={[blur]} onValueChange={(v) => setBlur(v[0])} />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="studio" className="p-8 space-y-10 animate-in fade-in duration-300">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Background Color</Label>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {COLORS.map(c => (
                                                        <button 
                                                            key={c.value} 
                                                            onClick={() => setBgColor(c.value)} 
                                                            className={cn("size-10 rounded-xl border-2 transition-all shadow-lg hover:scale-110", bgColor === c.value ? "border-primary ring-4 ring-primary/20" : "border-white/10")} 
                                                            style={{ backgroundColor: c.value }} 
                                                            title={c.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <Separator className="opacity-10" />
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase flex items-center gap-2 opacity-60"><Square className="size-3" /> Border</Label><span className="text-[10px] font-mono font-bold">{borderWidth}%</span></div>
                                                <Slider min={0} max={5} step={0.2} value={[borderWidth]} onValueChange={(v) => setBorderWidth(v[0])} />
                                                <div className="flex gap-2">
                                                    {['#000', '#fff', '#ccc'].map(c => (
                                                        <button key={c} onClick={() => setBorderColor(c)} className={cn("size-6 rounded-md border", borderColor === c && "ring-2 ring-primary")} style={{ backgroundColor: c }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </ScrollArea>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <div className="glass-panel p-6 rounded-[2rem] flex gap-4 items-center shadow-xl">
                            <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                <ShieldCheck className="size-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Enterprise Privacy</p>
                                <p className="text-[9px] text-muted-foreground font-medium leading-tight">ISO-27001 standard compliant local re-encoding. Zero cloud footprint.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* CENTER: PREVIEW AREA */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="lg:col-span-6 flex flex-col items-center gap-8">
                        <div className="relative group max-w-[500px] w-full">
                            <Card className="relative bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[12px] border-white rounded-[3.5rem] overflow-hidden flex items-center justify-center aspect-[1/1.4] transform-gpu transition-all hover:scale-[1.02]">
                                <canvas ref={mainCanvasRef} className="w-full h-full object-contain" />
                                
                                {isProcessing && (
                                    <div className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 gap-8 z-20">
                                        <div className="relative">
                                            <Loader2 className="size-20 animate-spin text-primary stroke-[3]" />
                                            <ImageIcon className="absolute inset-0 m-auto size-8 text-primary/40 animate-pulse" />
                                        </div>
                                        <div className="w-full max-w-[280px] space-y-4">
                                            <div className="space-y-1 text-center">
                                                <p className="font-black text-2xl text-primary uppercase tracking-tighter animate-pulse">Running Neural AI</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{progress}% Finalizing HD Layers</p>
                                            </div>
                                            <Progress value={progress} className="h-2 shadow-inner bg-primary/10" />
                                        </div>
                                    </div>
                                )}
                            </Card>
                            
                            {/* Floating Transformation Bar */}
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-2.5 rounded-[2rem] shadow-2xl border-2 border-white/20 z-10">
                                <Button variant="outline" size="icon" className="size-10 rounded-full" onClick={() => setScale(s => s + 5)}><ZoomIn className="size-4"/></Button>
                                <Button variant="outline" size="icon" className="size-10 rounded-full" onClick={() => setScale(s => s - 5)}><ZoomOut className="size-4"/></Button>
                                <Separator orientation="vertical" className="h-6 mx-1" />
                                <div className="grid grid-cols-2 gap-1.5">
                                    <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => setPosX(p => p - 1)}><ChevronLeft className="size-3"/></Button>
                                    <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => setPosX(p => p + 1)}><ChevronRight className="size-3"/></Button>
                                    <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => setPosY(p => p - 1)}><ChevronUp className="size-3"/></Button>
                                    <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => setPosY(p => p + 1)}><ChevronDown className="size-3"/></Button>
                                </div>
                                <Separator orientation="vertical" className="h-6 mx-1" />
                                <Button variant="outline" size="icon" className="size-10 rounded-full text-primary" onClick={() => setRotation(r => (r + 90) % 360)}><RotateCw className="size-4"/></Button>
                            </div>
                        </div>

                        <div className="flex gap-4 w-full max-w-[500px] mt-10">
                             <Button variant="outline" onClick={handleReset} className="flex-1 h-16 rounded-[1.5rem] border-2 font-black uppercase text-xs tracking-widest hover:bg-destructive/5 hover:text-destructive">
                                <RefreshCcw className="mr-2 size-4" /> Start Over
                            </Button>
                            <Button className="flex-[2] h-16 rounded-[1.5rem] bg-primary text-lg font-black shadow-2xl shadow-primary/30 group overflow-hidden relative" onClick={handleDownload}>
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    <Download className="size-6 group-hover:translate-y-0.5 transition-transform" /> DOWNLOAD HD JPG
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 -z-10 transition-opacity" />
                            </Button>
                        </div>
                    </motion.div>

                    {/* RIGHT SIDEBAR: PRINT & TEMPLATES */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="lg:col-span-3 space-y-6">
                        <Card className="glass-panel border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="bg-primary/5 p-6 border-b border-white/10">
                                <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                                    <Printer className="size-5 text-primary" /> Print Sheets
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase opacity-60">Auto-arrange multiple copies.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-1 gap-3">
                                    {PRINT_SHEETS.map((sheet, i) => (
                                        <Button 
                                            key={i} 
                                            variant="outline" 
                                            className="h-20 justify-start gap-4 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                                            onClick={() => renderPrintSheet(i)}
                                        >
                                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                {i === 0 ? <Layout className="size-5" /> : <Maximize className="size-5" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-tight">{sheet.name}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">300 DPI Rendering</p>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-[2.5rem] border-2 border-white/20 shadow-xl relative overflow-hidden group">
                            <div className="relative z-10 space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <History className="size-4" /> Recent Work
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {store.history.slice(-2).map((h, i) => (
                                        <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-white shadow-lg bg-white">
                                            <img src={h} alt="recent" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                        </div>
                                    ))}
                                    {store.history.length === 0 && (
                                        <div className="col-span-2 py-6 text-center text-[10px] font-bold uppercase opacity-30">No history yet</div>
                                    )}
                                </div>
                            </div>
                            <Sparkles className="absolute -bottom-4 -right-4 size-24 text-primary/5 group-hover:text-primary/10 group-hover:scale-125 transition-all duration-700" />
                        </div>
                    </motion.div>
                </div>
            )}

            {/* 4. PRINT SHEET PREVIEW MODAL */}
            <AnimatePresence>
                {stage === 'print' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl p-4 md:p-12 flex items-center justify-center"
                    >
                        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1 space-y-8 text-white text-center md:text-left">
                                <div className="space-y-4">
                                    <h2 className="text-5xl font-black font-headline uppercase tracking-tighter leading-none">
                                        Print-Ready <span className="text-primary">Master Sheet</span>
                                    </h2>
                                    <p className="text-slate-400 text-lg font-medium">Rendered at industrial 300 DPI standards for ultra-sharp glossy prints.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                        <CheckCircle2 className="size-6 text-primary mb-3 mx-auto md:mx-0" />
                                        <p className="text-[10px] font-black uppercase opacity-60">Layout Logic</p>
                                        <p className="text-sm font-bold mt-1">Symmetrical Clamping</p>
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                        <Printer className="size-6 text-accent mb-3 mx-auto md:mx-0" />
                                        <p className="text-[10px] font-black uppercase opacity-60">Paper Density</p>
                                        <p className="text-sm font-bold mt-1">300 DPI Ultra-HD</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={() => setStage('studio')} className="h-16 flex-1 rounded-2xl border-white/20 text-white hover:bg-white/10 font-black uppercase">
                                        CANCEL
                                    </Button>
                                    <Button className="h-16 flex-[2] rounded-2xl bg-green-600 hover:bg-green-700 shadow-2xl font-black text-lg" onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = printCanvasRef.current!.toDataURL('image/jpeg', 1.0);
                                        link.download = `Print-Sheet-${Date.now()}.jpg`;
                                        link.click();
                                    }}>
                                        DOWNLOAD MASTER SHEET
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-[1.2] relative flex justify-center animate-in zoom-in-95 duration-500">
                                <div className="shadow-[0_0_80px_rgba(92,189,185,0.4)] border-[12px] border-white dark:border-slate-800 rounded-sm overflow-hidden bg-white max-w-full">
                                    <canvas ref={printCanvasRef} className="max-w-full h-auto max-h-[70vh] shadow-2xl" />
                                </div>
                                <div className="absolute -top-6 -right-6 bg-primary text-white font-black text-[10px] px-6 py-2 rounded-full shadow-2xl uppercase tracking-widest animate-pulse">
                                    READY FOR PRINT
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="absolute top-8 right-8 size-12 text-white hover:bg-white/10 rounded-full" onClick={() => setStage('studio')}>
                            <X className="size-8" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <canvas ref={compositeCanvasRef} className="hidden" />
        </div>
    );
}

/**
 * RE-DEFINED COMPOSITE CANVAS REF (for legacy or internal buffers)
 */
const compositeCanvasRef = { current: null as any };
