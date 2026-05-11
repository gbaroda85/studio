
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
    ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ScrollArea } from '@/components/ui/scroll-area';

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
        { id: 'm1', label: 'Black Suit Red Tie', url: 'https://pi7.org/assets/img/clothes/men/m1.png' },
        { id: 'm2', label: 'Navy Suit Blue Tie', url: 'https://pi7.org/assets/img/clothes/men/m2.png' },
        { id: 'm3', label: 'Grey Suit Stripe Tie', url: 'https://pi7.org/assets/img/clothes/men/m3.png' },
        { id: 'm4', label: 'Formal Blue Shirt', url: 'https://pi7.org/assets/img/clothes/men/m4.png' },
        { id: 'm5', label: 'Black Formal Shirt', url: 'https://pi7.org/assets/img/clothes/men/m5.png' },
        { id: 'm6', label: 'Suit with Bow', url: 'https://pi7.org/assets/img/clothes/men/m6.png' },
    ],
    women: [
        { id: 'w1', label: 'Black Blazer', url: 'https://pi7.org/assets/img/clothes/women/w1.png' },
        { id: 'w2', label: 'Navy Blue Suit', url: 'https://pi7.org/assets/img/clothes/women/w2.png' },
        { id: 'w3', label: 'Formal White Shirt', url: 'https://pi7.org/assets/img/clothes/women/w3.png' },
    ],
    kids: [
        { id: 'k1', label: 'Tiny Suit', url: 'https://pi7.org/assets/img/clothes/kids/k1.png' },
        { id: 'k2', label: 'School Uniform', url: 'https://pi7.org/assets/img/clothes/kids/k2.png' },
    ]
};

type Stage = 'size' | 'crop' | 'background' | 'cloth' | 'download';

export default function PassportPhotoMaker() {
    const { toast } = useToast();
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [stage, setStage] = useState<Stage>('size');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    // Settings
    const [dpi, setDPI] = useState(300);
    const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(0);
    const [customWidth, setCustomWidth] = useState("3.5");
    const [customHeight, setCustomHeight] = useState("4.5");
    const [customUnit, setCustomUnit] = useState<Unit>('cm');

    // Studio Canvas States
    const [subjectImageSrc, setSubjectImageSrc] = useState<string | null>(null); 
    const [bgColor, setBgColor] = useState("#FFFFFF");
    const [selectedClothUrl, setSelectedClothUrl] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('men');

    // Fine-tune Alignment States
    const [scale, setScale] = useState(100);
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);

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
                setImgSrc(reader.result?.toString() || null);
                setStage('crop');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInitialCrop = async () => {
        if (!imgRef.current || !completedCrop) return;
        setIsProcessing(true);

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
        setStage('background');
        setIsProcessing(false);
    };

    const handleRemoveBackground = async () => {
        if (!originalCroppedData) return;
        setIsProcessing(true);
        setProgress(5);

        try {
            const imglyModule = await import("@imgly/background-removal");
            const removeBackgroundFunc = imglyModule.removeBackground || imglyModule.default;

            const blob = await removeBackgroundFunc(originalCroppedData, {
                progress: (item, index, total) => setProgress(Math.round((index / total) * 100)),
                output: { format: "image/png", quality: 0.95 }
            });

            const url = URL.createObjectURL(blob);
            setSubjectImageSrc(url);
            setStage('cloth');
            toast({ title: "Background Cleaned", description: "AI successfully extracted your face." });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "AI Error", description: "Could not remove background automatically." });
            setStage('cloth');
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        const render = async () => {
            const canvas = mainCanvasRef.current;
            if (!canvas || !subjectImageSrc) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const targetW = 800;
            const targetH = targetW / getAspectRatio();
            canvas.width = targetW;
            canvas.height = targetH;

            // 1. Draw Background Color
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Draw Subject (User's face) with transforms
            const faceImg = new window.Image();
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

                    ctx.drawImage(faceImg, x, y, dw, dh);
                    resolve(null);
                };
                faceImg.onerror = () => resolve(null);
            });

            // 3. Draw Clothing Overlay (If selected)
            if (selectedClothUrl) {
                const clothImg = new window.Image();
                clothImg.crossOrigin = "anonymous";
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

        const timer = setTimeout(render, 50);
        return () => clearTimeout(timer);
    }, [subjectImageSrc, bgColor, selectedClothUrl, scale, posX, posY, selectedPreset, customWidth, customHeight]);

    const handleDownload = () => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.95);
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
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const move = (dir: 'up' | 'down' | 'left' | 'right') => {
        if (dir === 'up') setPosY(p => p - 2);
        if (dir === 'down') setPosY(p => p + 2);
        if (dir === 'left') setPosX(p => p - 2);
        if (dir === 'right') setPosX(p => p + 2);
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
            </Card>
        );
    }

    return (
        <div className="w-full max-w-5xl animate-in fade-in duration-500">
            <div className="flex justify-center mb-8 overflow-x-auto">
                <div className="bg-card/80 backdrop-blur-xl border-2 rounded-2xl p-1 flex gap-2 shadow-xl whitespace-nowrap">
                    {[
                        { id: 'size', label: 'Size', icon: LayoutGrid },
                        { id: 'crop', label: 'Crop', icon: CropIcon },
                        { id: 'background', label: 'Background', icon: Eraser },
                        { id: 'cloth', label: 'Cloth', icon: Shirt },
                        { id: 'download', label: 'Download', icon: Download },
                    ].map((t) => (
                        <div
                            key={t.id}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all",
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
                                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
                                        <Loader2 className="size-12 animate-spin text-primary" />
                                        <p className="font-black uppercase tracking-tighter text-primary">{progress}% AI Processing...</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {(stage === 'background' || stage === 'cloth') && !isProcessing && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md rounded-2xl border-2 shadow-2xl z-20">
                                <Button variant="ghost" size="icon" className="size-10 rounded-xl" onClick={() => setScale(s => s + 5)}><ZoomIn /></Button>
                                <Button variant="ghost" size="icon" className="size-10 rounded-xl" onClick={() => setScale(s => s - 5)}><ZoomOut /></Button>
                                <div className="w-px h-6 bg-border mx-2" />
                                <Button variant="ghost" size="icon" className="size-10 rounded-xl" onClick={() => move('left')}><ChevronLeft /></Button>
                                <Button variant="ghost" size="icon" className="size-10 rounded-xl" onClick={() => move('right')}><ChevronRight /></Button>
                                <Button variant="ghost" size="icon" className="size-10 rounded-xl" onClick={() => move('up')}><ChevronUp /></Button>
                                <Button variant="ghost" size="icon" className="size-10 rounded-xl" onClick={() => move('down')}><ChevronDown /></Button>
                                <Button variant="ghost" size="icon" className="size-10 rounded-xl text-destructive" onClick={() => { setPosX(0); setPosY(0); setScale(100); }}><RefreshCcw /></Button>
                            </div>
                        )}
                    </Card>

                    <div className="flex justify-center items-center gap-4">
                        <Button variant="outline" size="lg" className="h-14 px-8 border-2 font-black" onClick={reset}>
                            <RefreshCcw className="mr-2" /> START OVER
                        </Button>

                        {stage === 'crop' && (
                            <Button size="lg" className="h-14 px-12 bg-primary font-black shadow-xl" onClick={handleInitialCrop}>
                                NEXT: BACKGROUND <ChevronRightIcon className="ml-2" />
                            </Button>
                        )}
                        {stage === 'background' && (
                            <Button size="lg" className="h-14 px-12 bg-primary font-black shadow-xl" onClick={handleRemoveBackground} disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <Eraser className="mr-2" />}
                                AUTO-REMOVE BG & NEXT
                            </Button>
                        )}
                        {stage === 'cloth' && (
                            <Button size="lg" className="h-14 px-12 bg-green-600 hover:bg-green-700 font-black shadow-xl" onClick={handleDownload}>
                                <Download className="mr-2" /> DOWNLOAD FINAL
                            </Button>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="border-2 shadow-xl border-primary/10 overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b p-4">
                            <CardTitle className="text-lg font-headline flex items-center gap-2">
                                <Shirt className="size-5 text-primary" /> 
                                {stage === 'background' ? 'Official Background' : 'Change Clothes'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {stage === 'background' && (
                                <div className="p-6 space-y-6">
                                    <div className="p-4 bg-primary/5 rounded-2xl flex gap-3 items-center border border-primary/10">
                                        <Palette className="size-6 text-primary" />
                                        <p className="text-xs font-bold text-primary uppercase">Select Background Color</p>
                                    </div>
                                    <div className="grid grid-cols-5 gap-3">
                                        {BG_COLORS.map(c => (
                                            <button 
                                                key={c.value} 
                                                onClick={() => setBgColor(c.value)}
                                                className={cn(
                                                    "size-12 rounded-2xl border-4 transition-all hover:scale-110",
                                                    bgColor === c.value ? "border-primary ring-4 ring-primary/20 scale-110" : "border-transparent shadow-lg"
                                                )}
                                                style={{ backgroundColor: c.value }}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {stage === 'cloth' && (
                                <div className="flex flex-col h-[500px]">
                                    <div className="flex bg-muted/50 p-2 gap-2 border-b overflow-x-auto">
                                        {CLOTH_CATEGORIES.map(cat => (
                                            <Button 
                                                key={cat.id} 
                                                variant={activeCategory === cat.id ? "default" : "ghost"} 
                                                className="flex-1 rounded-xl h-12 font-black"
                                                onClick={() => setActiveCategory(cat.id)}
                                            >
                                                <cat.icon className="mr-2 size-4" /> {cat.label}
                                            </Button>
                                        ))}
                                    </div>
                                    <ScrollArea className="flex-1 p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                className={cn(
                                                    "aspect-[3/4] rounded-2xl border-4 bg-muted/30 flex flex-col items-center justify-center gap-2 transition-all",
                                                    !selectedClothUrl ? "border-primary bg-primary/5" : "border-transparent"
                                                )}
                                                onClick={() => setSelectedClothUrl(null)}
                                            >
                                                <X className="size-8 text-muted-foreground" />
                                                <span className="text-[10px] font-black uppercase">None</span>
                                            </button>
                                            {CLOTH_ITEMS[activeCategory].map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setSelectedClothUrl(item.url)}
                                                    className={cn(
                                                        "aspect-[3/4] relative rounded-2xl border-4 overflow-hidden transition-all hover:scale-105 active:scale-95 bg-white shadow-md",
                                                        selectedClothUrl === item.url ? "border-primary ring-4 ring-primary/20" : "border-transparent"
                                                    )}
                                                >
                                                    <img 
                                                        src={item.url} 
                                                        alt={item.label} 
                                                        className="w-full h-full object-contain p-2" 
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 py-1">
                                                        <p className="text-[8px] text-white text-center font-bold uppercase truncate px-1">{item.label}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                    <div className="p-4 bg-muted/30 border-t">
                                        <p className="text-[9px] font-bold text-muted-foreground text-center uppercase tracking-widest">
                                            Tip: Use alignment keys to fit chehre to suit
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-green-500/10 bg-green-500/5">
                        <CardContent className="p-4 flex gap-4 items-center">
                            <ShieldCheck className="size-8 text-green-600 shrink-0" />
                            <div>
                                <p className="text-[10px] font-black text-green-700 uppercase">Secure Studio Active</p>
                                <p className="text-[9px] text-green-600/80 font-medium">All AI processing is done 100% locally in your browser.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
