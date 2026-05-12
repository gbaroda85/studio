
"use client";

import React, { useState, useRef, useEffect, type SyntheticEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    UploadCloud, 
    Download, 
    Crop as CropIcon, 
    RefreshCcw, 
    Contact, 
    Eraser, 
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
    Sparkles,
    Settings2,
    Sun,
    Contrast,
    Zap,
    Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

type Unit = 'cm' | 'mm' | 'inch' | 'px';

interface PhotoSize {
    label: string;
    width: number;
    height: number;
    unit: Unit;
}

const PRESETS: PhotoSize[] = [
    { label: "India (3.5x4.5cm)", width: 3.5, height: 4.5, unit: 'cm' },
    { label: "USA (2x2in)", width: 2, height: 2, unit: 'inch' },
    { label: "Pan Card (2.5x3.5cm)", width: 2.5, height: 3.5, unit: 'cm' },
    { label: "Europe / UK", width: 3.5, height: 4.5, unit: 'cm' },
];

const CLOTH_CATEGORIES = [
    { id: 'men', icon: UserCircle },
    { id: 'women', icon: User },
    { id: 'kids', icon: Baby },
];

const CLOTH_ITEMS: Record<string, { id: string; url: string; label: string }[]> = {
    men: [
        { id: 'm1', label: 'Grey Blazer', url: 'https://pi7.org/assets/img/clothes/men/m1.png' },
        { id: 'm2', label: 'Navy Suit', url: 'https://pi7.org/assets/img/clothes/men/m2.png' },
        { id: 'm3', label: 'Blue Shirt', url: 'https://pi7.org/assets/img/clothes/men/m3.png' },
        { id: 'm4', label: 'Black Shirt', url: 'https://pi7.org/assets/img/clothes/men/m4.png' },
        { id: 'm5', label: 'Formal Suit', url: 'https://pi7.org/assets/img/clothes/men/m5.png' },
        { id: 'm6', label: 'White Shirt', url: 'https://pi7.org/assets/img/clothes/men/m6.png' },
    ],
    women: [
        { id: 'w1', label: 'Black Blazer', url: 'https://pi7.org/assets/img/clothes/women/w1.png' },
        { id: 'w2', label: 'Blue Suit', url: 'https://pi7.org/assets/img/clothes/women/w2.png' },
        { id: 'w3', label: 'White Shirt', url: 'https://pi7.org/assets/img/clothes/women/w3.png' },
    ],
    kids: [
        { id: 'k1', label: 'Small Suit', url: 'https://pi7.org/assets/img/clothes/kids/k1.png' },
        { id: 'k2', label: 'School Uniform', url: 'https://pi7.org/assets/img/clothes/kids/k2.png' },
    ]
};

type Stage = 'size' | 'crop' | 'background' | 'cloth' | 'download';

export default function PassportPhotoMaker() {
    const { toast } = useToast();
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [stage, setStage] = useState<Stage>('size');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    // Size Settings
    const [selectedPreset, setSelectedPreset] = useState<number>(0);

    // Studio Canvas States
    const [subjectImageSrc, setSubjectImageSrc] = useState<string | null>(null); 
    const [bgColor, setBgColor] = useState("#FFFFFF");
    const [selectedClothUrl, setSelectedClothUrl] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('men');

    // Fine-tune Alignment
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
        const p = PRESETS[selectedPreset];
        return p.width / p.height;
    };

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setImgSrc(reader.result?.toString() || null);
                setStage('crop');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveBackground = async () => {
        if (!originalCroppedData) return;
        setIsProcessing(true);
        setProgress(0);

        try {
            const imglyModule = await import("@imgly/background-removal");
            const removeBackgroundFunc = imglyModule.removeBackground || (imglyModule as any).default;

            const blob = await removeBackgroundFunc(originalCroppedData, {
                progress: (item: string, index: number, total: number) => {
                    setProgress(Math.round((index / total) * 100));
                },
                output: { format: "image/png" }
            });

            const url = URL.createObjectURL(blob);
            setSubjectImageSrc(url);
            toast({ title: "Background Removed!" });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "AI Error", description: "Could not remove background. Using original." });
            setSubjectImageSrc(originalCroppedData);
        } finally {
            setIsProcessing(false);
        }
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

            // 1. Background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Face (Subject)
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
                    ctx.drawImage(faceImg, x, y, dw, dh);
                    resolve(null);
                };
                faceImg.onerror = () => resolve(null);
            });

            // 3. Cloth (Suit)
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
    }, [subjectImageSrc, bgColor, selectedClothUrl, scale, posX, posY, selectedPreset]);

    const handleInitialCrop = async () => {
        if (!imgRef.current || !completedCrop) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const targetW = 1000;
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

        const data = canvas.toDataURL('image/jpeg', 0.95);
        setOriginalCroppedData(data);
        setSubjectImageSrc(data);
        setStage('background');
    };

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
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // PI7 Style Stage Header
    const StageHeader = () => (
        <div className="flex justify-center items-center gap-2 mb-8 bg-muted/30 p-1 rounded-lg border">
            {(['size', 'crop', 'background', 'cloth', 'download'] as Stage[]).map((s) => (
                <button
                    key={s}
                    disabled={stage === 'size' && s !== 'size'}
                    onClick={() => setStage(s)}
                    className={cn(
                        "px-4 py-2 rounded-md text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                        stage === s ? "bg-primary text-white shadow-lg" : "bg-transparent text-muted-foreground hover:bg-muted"
                    )}
                >
                    {s === 'size' && <LayoutGrid className="size-4" />}
                    {s === 'crop' && <CropIcon className="size-4" />}
                    {s === 'background' && <Eraser className="size-4" />}
                    {s === 'cloth' && <Shirt className="size-4" />}
                    {s === 'download' && <Download className="size-4" />}
                    {s}
                </button>
            ))}
        </div>
    );

    if (!imgSrc) {
        return (
            <Card className="w-full max-w-2xl border-foreground/10 shadow-2xl">
                <CardContent className="p-12 text-center space-y-8">
                    <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
                        <Contact className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black">Passport Studio</h2>
                        <p className="text-muted-foreground">Select Photo Size & Upload your formal picture.</p>
                    </div>
                    <div className="max-w-xs mx-auto">
                        <Select value={String(selectedPreset)} onValueChange={(v) => setSelectedPreset(Number(v))}>
                            <SelectTrigger className="h-12 font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {PRESETS.map((p, i) => <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-primary/5 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="size-12 text-muted-foreground group-hover:text-primary transition-colors" />
                        <p className="font-bold">Drop photo or Click to upload</p>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-4xl px-4 py-8 animate-in fade-in duration-500">
            <StageHeader />

            <div className="flex flex-col items-center">
                {stage === 'cloth' && <h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-tighter">Change Person's Clothes</h2>}

                <div className={cn(
                    "relative bg-white shadow-2xl border-4 border-white rounded-lg overflow-hidden flex items-center justify-center min-h-[400px] mb-6",
                    stage === 'crop' ? "w-full" : "w-[400px] aspect-[3.5/4.5]"
                )}>
                    {stage === 'crop' ? (
                        <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={getAspectRatio()}>
                            <img 
                                ref={imgRef} src={imgSrc} alt="source" className="max-h-[60vh] object-contain" 
                                onLoad={(e) => {
                                    const { width, height } = e.currentTarget;
                                    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 80 }, getAspectRatio(), width, height), width, height));
                                }}
                            />
                        </ReactCrop>
                    ) : (
                        <div className="relative">
                            <canvas ref={mainCanvasRef} className="max-w-full h-auto" />
                            {isProcessing && (
                                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-8 gap-4">
                                    <Loader2 className="size-12 animate-spin text-primary" />
                                    <p className="font-black text-xs uppercase tracking-widest text-primary animate-pulse">Removing Background... {progress}%</p>
                                    <Progress value={progress} className="h-1 w-full" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Alignment Toolbar */}
                {stage !== 'crop' && (
                    <div className="flex bg-muted/50 p-2 rounded-xl border-2 gap-2 mb-8 shadow-inner">
                        <Button variant="outline" size="icon" onClick={handleRemoveBackground} disabled={isProcessing} title="AI Remove BG"><Eraser className="size-4" /></Button>
                        <div className="w-px bg-border mx-1" />
                        <Button variant="outline" size="icon" onClick={() => setScale(s => s + 2)} title="Zoom In"><ZoomIn className="size-4"/></Button>
                        <Button variant="outline" size="icon" onClick={() => setScale(s => s - 2)} title="Zoom Out"><ZoomOut className="size-4"/></Button>
                        <div className="w-px bg-border mx-1" />
                        <Button variant="outline" size="icon" onClick={() => setPosX(p => p - 1)}><ChevronLeft className="size-4"/></Button>
                        <Button variant="outline" size="icon" onClick={() => setPosX(p => p + 1)}><ChevronRight className="size-4"/></Button>
                        <Button variant="outline" size="icon" onClick={() => setPosY(p => p - 1)}><ChevronUp className="size-4"/></Button>
                        <Button variant="outline" size="icon" onClick={() => setPosY(p => p + 1)}><ChevronDown className="size-4"/></Button>
                    </div>
                )}

                {stage === 'cloth' && (
                    <div className="w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl p-4 flex gap-4 items-stretch shadow-xl">
                        {/* Category Selector */}
                        <div className="flex flex-col gap-3 border-r pr-4">
                            {CLOTH_CATEGORIES.map(cat => (
                                <Button 
                                    key={cat.id} 
                                    variant={activeCategory === cat.id ? "default" : "ghost"} 
                                    size="icon" 
                                    className="size-10 rounded-lg"
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    <cat.icon className="size-5" />
                                </Button>
                            ))}
                        </div>

                        {/* Horizontal Clothes Scroll */}
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex gap-4 p-1">
                                <button 
                                    className={cn("size-24 bg-white border-2 rounded-xl flex flex-col items-center justify-center shrink-0", !selectedClothUrl && "border-primary ring-2 ring-primary/20")}
                                    onClick={() => setSelectedClothUrl(null)}
                                >
                                    <X className="size-6 text-muted-foreground" />
                                    <span className="text-[10px] font-bold mt-1">None</span>
                                </button>
                                {CLOTH_ITEMS[activeCategory].map((item) => (
                                    <button 
                                        key={item.id} 
                                        onClick={() => setSelectedClothUrl(item.url)}
                                        className={cn("size-24 bg-white border-2 rounded-xl overflow-hidden shrink-0 transition-all active:scale-95", selectedClothUrl === item.url ? "border-primary ring-2 ring-primary/20" : "border-transparent shadow-sm")}
                                    >
                                        <img src={item.url} alt={item.label} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                                    </button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </div>
                )}

                {stage === 'background' && (
                    <div className="flex flex-col items-center gap-6 w-full animate-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-5 gap-4">
                            {["#FFFFFF", "#ADD8E6", "#000080", "#F5F5F5", "#D3D3D3"].map(c => (
                                <button 
                                    key={c} 
                                    onClick={() => setBgColor(c)} 
                                    className={cn("size-12 rounded-full border-4 shadow-md", bgColor === c ? "border-primary scale-110" : "border-white")} 
                                    style={{ backgroundColor: c }} 
                                />
                            ))}
                        </div>
                        <Button className="h-14 px-12 font-black rounded-xl shadow-xl" onClick={() => setStage('cloth')}>
                            NEXT: CHANGE CLOTHES <ChevronRight className="ml-2" />
                        </Button>
                    </div>
                )}

                <div className="mt-8 flex gap-4">
                    <Button variant="outline" className="font-bold h-12 px-8" onClick={reset}><RefreshCcw className="mr-2 h-4 w-4" /> Reset</Button>
                    {stage === 'crop' && (
                        <Button className="font-black h-12 px-12 shadow-lg" onClick={handleInitialCrop}>CROP FACE</Button>
                    )}
                    {stage === 'cloth' && (
                        <Button className="font-black h-12 px-12 bg-green-600 hover:bg-green-700 shadow-xl" onClick={handleDownload}>DOWNLOAD PHOTO</Button>
                    )}
                </div>
            </div>
        </div>
    );
}
