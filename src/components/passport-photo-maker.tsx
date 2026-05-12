
"use client";

import React, { useState, useRef, useEffect, type SyntheticEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    UploadCloud, 
    Download, 
    Crop as CropIcon, 
    RefreshCcw, 
    Contact, 
    Eraser, 
    Palette, 
    Shirt, 
    Loader2, 
    ZoomIn, 
    ZoomOut, 
    ChevronUp, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight, 
    User, 
    UserCircle, 
    Baby, 
    X, 
    LayoutGrid,
    CheckCircle2,
    ShieldCheck,
    ChevronRight as ChevronRightIcon,
    Sparkles,
    AlertCircle,
    Info,
    Settings2,
    Sun,
    Contrast,
    Droplets,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from '@/components/ui/slider';

type Unit = 'cm' | 'mm' | 'inch' | 'px';

interface PhotoSize {
    label: string;
    width: number;
    height: number;
    unit: Unit;
    description: string;
}

const PRESETS: PhotoSize[] = [
    { label: "India (3.5x4.5cm)", width: 3.5, height: 4.5, unit: 'cm', description: "Standard Indian Passport" },
    { label: "USA (2x2in)", width: 2, height: 2, unit: 'inch', description: "US Visa / Passport" },
    { label: "Pan Card (2.5x3.5cm)", width: 2.5, height: 3.5, unit: 'cm', description: "Indian Pan Card" },
    { label: "Europe / UK", width: 3.5, height: 4.5, unit: 'cm', description: "EU Standard" },
];

const BG_COLORS = [
    { name: "White", value: "#FFFFFF" },
    { name: "Light Blue", value: "#ADD8E6" },
    { name: "Off White", value: "#F5F5F5" },
    { name: "Navy Blue", value: "#000080" },
    { name: "Light Grey", value: "#D3D3D3" },
];

const CLOTH_CATEGORIES = [
    { id: 'men', label: 'Men', icon: UserCircle },
    { id: 'women', label: 'Women', icon: User },
    { id: 'kids', label: 'Kids', icon: Baby },
];

const CLOTH_ITEMS: Record<string, { id: string; url: string; label: string }[]> = {
    men: [
        { id: 'm1', label: 'Dark Suit Red Tie', url: 'https://pi7.org/assets/img/clothes/men/m1.png' },
        { id: 'm2', label: 'Navy Blue Suit', url: 'https://pi7.org/assets/img/clothes/men/m2.png' },
        { id: 'm3', label: 'Grey Formal Suit', url: 'https://pi7.org/assets/img/clothes/men/m3.png' },
        { id: 'm4', label: 'Formal Blue Shirt', url: 'https://pi7.org/assets/img/clothes/men/m4.png' },
        { id: 'm5', label: 'Black Formal Shirt', url: 'https://pi7.org/assets/img/clothes/men/m5.png' },
        { id: 'm6', label: 'Suit & Bow Tie', url: 'https://pi7.org/assets/img/clothes/men/m6.png' },
    ],
    women: [
        { id: 'w1', label: 'Black Blazer', url: 'https://pi7.org/assets/img/clothes/women/w1.png' },
        { id: 'w2', label: 'Navy Blue Suit', url: 'https://pi7.org/assets/img/clothes/women/w2.png' },
        { id: 'w3', label: 'Formal White Shirt', url: 'https://pi7.org/assets/img/clothes/women/w3.png' },
    ],
    kids: [
        { id: 'k1', label: 'Small Suit', url: 'https://pi7.org/assets/img/clothes/kids/k1.png' },
        { id: 'k2', label: 'School Uniform', url: 'https://pi7.org/assets/img/clothes/kids/k2.png' },
    ]
};

type Stage = 'size' | 'crop' | 'studio' | 'download';

export default function PassportPhotoMaker() {
    const { toast } = useToast();
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [stage, setStage] = useState<Stage>('size');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");

    // Settings
    const [dpi, setDPI] = useState(300);
    const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(0);
    const [customWidth, setCustomWidth] = useState("3.5");
    const [customHeight, setCustomHeight] = useState("4.5");

    // Studio Canvas States
    const [subjectImageSrc, setSubjectImageSrc] = useState<string | null>(null); 
    const [bgColor, setBgColor] = useState("#FFFFFF");
    const [selectedClothUrl, setSelectedClothUrl] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('men');

    // Fine-tune Alignment & Image Adjustment States
    const [scale, setScale] = useState(100);
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);
    const [brightness, setBrightness] = useState([100]);
    const [contrast, setContrast] = useState([100]);
    const [saturation, setSaturation] = useState([100]);
    const [sharpness, setSharpness] = useState([0]);

    // Cropping States
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [originalCroppedData, setOriginalCroppedData] = useState<string | null>(null);

    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);

    const getAspectRatio = () => {
        let w, h;
        if (selectedPreset === 'custom') {
            w = parseFloat(customWidth);
            h = parseFloat(customHeight);
        } else {
            w = PRESETS[selectedPreset as number].width;
            h = PRESETS[selectedPreset as number].height;
        }
        return (w || 3.5) / (h || 4.5);
    };

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result?.toString() || null;
                setImgSrc(result);
                if (result) setStage('crop');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInitialCrop = async () => {
        if (!imgRef.current || !completedCrop) return;
        setIsProcessing(true);
        setStatusText("Preparing for AI Studio...");

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const targetW = 1000;
        const targetH = targetW / getAspectRatio();
        canvas.width = targetW;
        canvas.height = targetH;

        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0, 0, targetW, targetH
        );

        const data = canvas.toDataURL('image/jpeg', 0.95);
        setOriginalCroppedData(data);
        setSubjectImageSrc(data);
        setStage('studio');
        setIsProcessing(false);
    };

    const handleRemoveBackground = async () => {
        if (!originalCroppedData) return;
        setIsProcessing(true);
        setProgress(5);
        setStatusText("Initializing AI Engine...");

        try {
            const imglyModule = await import("@imgly/background-removal");
            // Safe module access
            const removeBackgroundFunc = (imglyModule as any).removeBackground || (imglyModule as any).default || imglyModule;

            if (typeof removeBackgroundFunc !== 'function') {
                throw new Error("Could not find background removal function.");
            }

            const blob = await removeBackgroundFunc(originalCroppedData, {
                progress: (item: string, index: number, total: number) => {
                    const p = Math.round((index / total) * 100);
                    setProgress(p);
                    if (item.includes("model")) setStatusText(`Loading AI Model... (${p}%)`);
                    else setStatusText(`Removing Background... (${p}%)`);
                },
                output: { format: "image/png", quality: 0.95 }
            });

            const url = URL.createObjectURL(blob);
            setSubjectImageSrc(url);
            toast({ title: "Success!", description: "Background removed successfully." });
        } catch (error: any) {
            console.error("AI BG Removal Error:", error);
            toast({ variant: "destructive", title: "AI Scan Failed", description: "Background removal failed. Try manual adjustment." });
        } finally {
            setIsProcessing(false);
            setProgress(0);
            setStatusText("");
        }
    };

    const applySharpness = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, factor: number) => {
        if (factor <= 0) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const w = canvas.width;
        const h = canvas.height;
        const normalized = factor / 5;
        
        const kernel = [
            0, -normalized, 0,
            -normalized, 1 + (4 * normalized), -normalized,
            0, -normalized, 0
        ];
        
        const output = ctx.createImageData(w, h);
        const dst = output.data;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                let r = 0, g = 0, b = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const scy = Math.min(h - 1, Math.max(0, y + ky));
                        const scx = Math.min(w - 1, Math.max(0, x + kx));
                        const srcOff = (scy * w + scx) * 4;
                        const wt = kernel[(ky + 1) * 3 + (kx + 1)];
                        r += data[srcOff] * wt;
                        g += data[srcOff + 1] * wt;
                        b += data[srcOff + 2] * wt;
                    }
                }
                dst[i] = r; dst[i+1] = g; dst[i+2] = b; dst[i+3] = data[i+3];
            }
        }
        ctx.putImageData(output, 0, 0);
    };

    useEffect(() => {
        const render = async () => {
            const canvas = mainCanvasRef.current;
            if (!canvas || !subjectImageSrc) return;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            const targetW = 800;
            const targetH = targetW / getAspectRatio();
            canvas.width = targetW;
            canvas.height = targetH;

            // 1. Draw Background Color
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Draw Subject (User's face) with transforms and adjustments
            const faceImg = new window.Image();
            faceImg.crossOrigin = "anonymous";
            faceImg.src = subjectImageSrc;
            
            await new Promise((resolve) => {
                faceImg.onload = () => {
                    const s = scale / 100;
                    const dw = canvas.width * s;
                    const dh = (faceImg.height * (canvas.width / faceImg.width)) * s;
                    
                    const dx = (posX / 100) * canvas.width;
                    const dy = (posY / 100) * canvas.height;

                    const x = (canvas.width - dw) / 2 + dx;
                    const y = (canvas.height - dh) / 2 + dy;

                    // Apply Image Adjustments via Filter string
                    ctx.save();
                    ctx.filter = `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`;
                    ctx.drawImage(faceImg, x, y, dw, dh);
                    ctx.restore();

                    // Apply Manual Sharpness
                    if (sharpness[0] > 0) applySharpness(ctx, canvas, sharpness[0]);

                    resolve(null);
                };
                faceImg.onerror = () => resolve(null);
            });

            // 3. Draw Clothing Overlay
            if (selectedClothUrl) {
                const clothImg = new window.Image();
                clothImg.crossOrigin = "anonymous";
                clothImg.referrerPolicy = "no-referrer";
                clothImg.src = selectedClothUrl;
                await new Promise((resolve) => {
                    clothImg.onload = () => {
                        const clothAspect = clothImg.width / clothImg.height;
                        const dw = canvas.width;
                        const dh = dw / clothAspect;
                        ctx.drawImage(clothImg, 0, canvas.height - dh, dw, dh);
                        resolve(null);
                    };
                    clothImg.onerror = () => resolve(null);
                });
            }
        };

        const timer = setTimeout(render, 30);
        return () => clearTimeout(timer);
    }, [subjectImageSrc, bgColor, selectedClothUrl, scale, posX, posY, brightness, contrast, saturation, sharpness, selectedPreset]);

    const handleDownload = () => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.98);
        link.download = `passport-photo-${Date.now()}.jpg`;
        link.click();
    };

    const reset = () => {
        setStage('size');
        setImgSrc(null);
        setSubjectImageSrc(null);
        setSelectedClothUrl(null);
        setScale(100);
        setPosX(0);
        setPosY(0);
        setBrightness([100]);
        setContrast([100]);
        setSaturation([100]);
        setSharpness([0]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const move = (dir: 'up' | 'down' | 'left' | 'right') => {
        if (dir === 'up') setPosY(p => p - 1);
        if (dir === 'down') setPosY(p => p + 1);
        if (dir === 'left') setPosX(p => p - 1);
        if (dir === 'right') setPosX(p => p + 1);
    };

    if (stage === 'size') {
        return (
            <Card className="w-full max-w-2xl transition-all duration-500 hover:shadow-2xl border-foreground/10">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <Contact className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-3xl font-black font-headline">Passport Studio</CardTitle>
                    <CardDescription>Step 1: Choose Photo Size & Dimensions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="font-black text-xs uppercase text-muted-foreground tracking-widest">Select Country Preset</Label>
                            <Select value={String(selectedPreset)} onValueChange={(v) => setSelectedPreset(v === 'custom' ? 'custom' : Number(v))}>
                                <SelectTrigger className="h-14 font-bold text-lg"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {PRESETS.map((p, i) => <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>)}
                                    <SelectItem value="custom">Custom Dimensions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="font-black text-xs uppercase text-muted-foreground tracking-widest">Resolution (DPI)</Label>
                            <Select value={String(dpi)} onValueChange={(v) => setDPI(Number(v))}>
                                <SelectTrigger className="h-14 font-bold text-lg"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="300">300 DPI (Standard)</SelectItem>
                                    <SelectItem value="600">600 DPI (Ultra HD)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-primary/5 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div className="text-center">
                            <p className="text-xl font-bold">Select Photo to Start</p>
                            <p className="text-sm text-muted-foreground mt-2">Works for people, kids, and babies.</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                </CardContent>
                <CardFooter className="justify-center gap-6 text-[10px] text-muted-foreground font-black pb-8 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> 100% Private</div>
                    <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-primary" /> AI Powered</div>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
            <div className="flex justify-center mb-8 overflow-x-auto pb-2">
                <div className="bg-card/80 backdrop-blur-xl border-2 rounded-2xl p-1 flex gap-2 shadow-xl whitespace-nowrap">
                    {[
                        { id: 'size', label: 'Size', icon: LayoutGrid },
                        { id: 'crop', label: 'Face Crop', icon: CropIcon },
                        { id: 'studio', label: 'Professional Studio', icon: Shirt },
                    ].map((t) => (
                        <div
                            key={t.id}
                            className={cn(
                                "flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all",
                                stage === t.id ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground opacity-60"
                            )}
                        >
                            <t.icon className="size-4" /> {t.label}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Card className="overflow-hidden border-2 shadow-2xl relative bg-slate-900/5 min-h-[500px] flex items-center justify-center">
                        {stage === 'crop' && imgSrc ? (
                            <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={getAspectRatio()} keepSelection>
                                <img 
                                    ref={imgRef} 
                                    src={imgSrc} 
                                    alt="source" 
                                    className="max-h-[60vh] w-auto object-contain" 
                                    onLoad={(e) => {
                                        const { width, height } = e.currentTarget;
                                        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 80 }, getAspectRatio(), width, height), width, height));
                                    }} 
                                />
                            </ReactCrop>
                        ) : (
                            <div className="relative p-2 bg-white shadow-inner ring-8 ring-white/50 rounded-lg">
                                <canvas ref={mainCanvasRef} className="max-h-[60vh] w-auto h-auto rounded shadow-2xl" />
                                {isProcessing && (
                                    <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-6 p-8 text-center">
                                        <div className="relative">
                                            <Loader2 className="size-16 animate-spin text-primary stroke-[3]" />
                                            <Sparkles className="absolute inset-0 m-auto size-6 text-primary animate-pulse" />
                                        </div>
                                        <div className="space-y-4 w-full max-w-xs">
                                            <p className="font-black uppercase tracking-tighter text-primary text-xl animate-pulse">{statusText}</p>
                                            <Progress value={progress} className="h-2 shadow-inner" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    <div className="flex justify-center items-center gap-4">
                        <Button variant="outline" size="lg" className="h-14 px-8 border-2 font-black" onClick={reset}>
                            <RefreshCcw className="mr-2" /> START OVER
                        </Button>

                        {stage === 'crop' && (
                            <Button size="lg" className="h-14 px-12 bg-primary font-black shadow-xl" onClick={handleInitialCrop}>
                                NEXT: OPEN STUDIO <ChevronRightIcon className="ml-2" />
                            </Button>
                        )}
                        {stage === 'studio' && (
                            <Button size="lg" className="h-14 px-12 bg-green-600 hover:bg-green-700 font-black shadow-xl group" onClick={handleDownload}>
                                <Download className="mr-2 group-hover:animate-bounce" /> DOWNLOAD PHOTO
                            </Button>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="border-2 shadow-xl border-primary/10 overflow-hidden h-full flex flex-col">
                        <CardHeader className="bg-primary/5 border-b p-4">
                            <CardTitle className="text-lg font-headline flex items-center gap-2">
                                <Settings2 className="size-5 text-primary" /> Studio Controls
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-hidden">
                            <Tabs defaultValue="adjust" className="flex flex-col h-[550px]">
                                <TabsList className="grid w-full grid-cols-4 rounded-none bg-muted/50 h-14">
                                    <TabsTrigger value="adjust" className="font-bold text-[10px] uppercase">Fit</TabsTrigger>
                                    <TabsTrigger value="image" className="font-bold text-[10px] uppercase">Enhance</TabsTrigger>
                                    <TabsTrigger value="bg" className="font-bold text-[10px] uppercase">BG</TabsTrigger>
                                    <TabsTrigger value="cloth" className="font-bold text-[10px] uppercase">Suits</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="adjust" className="p-6 space-y-6 animate-in slide-in-from-right-4">
                                     <div className="grid grid-cols-3 gap-2">
                                         <Button variant="outline" size="icon" className="h-12 w-full rounded-xl" onClick={() => setScale(s => s + 5)}><ZoomIn className="h-5 w-5"/></Button>
                                         <Button variant="outline" size="icon" className="h-12 w-full rounded-xl" onClick={() => setScale(s => s - 5)}><ZoomOut className="h-5 w-5"/></Button>
                                         <Button variant="outline" size="icon" className="h-12 w-full rounded-xl text-destructive" onClick={() => { setPosX(0); setPosY(0); setScale(100); }}><RefreshCcw className="h-5 w-5"/></Button>
                                     </div>
                                     <div className="grid grid-cols-3 gap-2 place-items-center bg-muted/20 p-4 rounded-2xl border-2 border-dashed">
                                         <div /> <Button variant="ghost" size="icon" onClick={() => move('up')}><ChevronUp /></Button> <div />
                                         <Button variant="ghost" size="icon" onClick={() => move('left')}><ChevronLeft /></Button>
                                         <div className="size-4 rounded-full bg-primary/20" />
                                         <Button variant="ghost" size="icon" onClick={() => move('right')}><ChevronRight /></Button>
                                         <div /> <Button variant="ghost" size="icon" onClick={() => move('down')}><ChevronDown /></Button> <div />
                                     </div>
                                     <p className="text-[10px] font-bold text-muted-foreground text-center uppercase tracking-widest italic">Use arrows to fit your face behind the suit</p>
                                </TabsContent>

                                <TabsContent value="image" className="p-6 space-y-8 animate-in slide-in-from-right-4">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><Sun className="size-3" /> Brightness</Label><span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{brightness[0]}%</span></div>
                                        <Slider min={50} max={150} step={1} value={brightness} onValueChange={setBrightness} />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><Contrast className="size-3" /> Contrast</Label><span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{contrast[0]}%</span></div>
                                        <Slider min={50} max={150} step={1} value={contrast} onValueChange={setContrast} />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><Zap className="size-3" /> Sharpness</Label><span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{sharpness[0]}</span></div>
                                        <Slider min={0} max={10} step={0.5} value={sharpness} onValueChange={setSharpness} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="bg" className="p-6 space-y-6 animate-in slide-in-from-right-4">
                                    <Button className="w-full h-14 font-black bg-primary/10 text-primary hover:bg-primary/20 border-2 border-primary/20 rounded-2xl" onClick={handleRemoveBackground} disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="mr-2 animate-spin h-5 w-5" /> : <Eraser className="mr-2 h-5 w-5" />}
                                        AI AUTO-REMOVE BACKGROUND
                                    </Button>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Select Official BG Color</Label>
                                        <div className="grid grid-cols-5 gap-3">
                                            {BG_COLORS.map(c => (
                                                <button key={c.value} onClick={() => setBgColor(c.value)} className={cn("size-10 rounded-xl border-4 transition-all hover:scale-110", bgColor === c.value ? "border-primary ring-4 ring-primary/20" : "border-transparent shadow-md")} style={{ backgroundColor: c.value }} />
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="cloth" className="flex flex-col h-full animate-in slide-in-from-right-4">
                                    <div className="flex bg-muted/30 p-2 gap-2 border-b overflow-x-auto no-scrollbar">
                                        {CLOTH_CATEGORIES.map(cat => (
                                            <Button key={cat.id} variant={activeCategory === cat.id ? "default" : "ghost"} className="flex-1 rounded-xl h-12 font-black text-[11px]" onClick={() => setActiveCategory(cat.id)}><cat.icon className="mr-2 size-4" /> {cat.label}</Button>
                                        ))}
                                    </div>
                                    <ScrollArea className="flex-1 p-4">
                                        <div className="grid grid-cols-2 gap-3 pb-8">
                                            <button className={cn("aspect-[3/4] rounded-2xl border-4 bg-muted/30 flex flex-col items-center justify-center gap-2 transition-all hover:bg-muted/50", !selectedClothUrl ? "border-primary bg-primary/5" : "border-transparent")} onClick={() => setSelectedClothUrl(null)}>
                                                <X className="size-8 text-muted-foreground" /><span className="text-[10px] font-black uppercase">Remove Suit</span>
                                            </button>
                                            {CLOTH_ITEMS[activeCategory].map((item) => (
                                                <button key={item.id} onClick={() => setSelectedClothUrl(item.url)} className={cn("aspect-[3/4] relative rounded-2xl border-4 overflow-hidden transition-all hover:scale-105 active:scale-95 bg-white shadow-xl group", selectedClothUrl === item.url ? "border-primary ring-4 ring-primary/20" : "border-transparent")}>
                                                    <img src={item.url} alt={item.label} className="w-full h-full object-contain p-2" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/300x400?text=${item.label}`; }} />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-[10px] font-black uppercase text-center px-2">{item.label}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="bg-muted/30 border-t p-4 flex gap-3 items-center">
                            <ShieldCheck className="size-8 text-green-600 shrink-0" />
                            <p className="text-[9px] text-green-700 font-bold uppercase leading-tight">All processing happens locally. Suits load with safe bypass logic.</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
