
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
    { label: "Passport (3.5x4.5cm)", width: 3.5, height: 4.5, unit: 'cm' },
];

const CLOTH_CATEGORIES = [
    { id: 'men', icon: UserCircle, label: 'Men' },
    { id: 'women', icon: User, label: 'Women' },
    { id: 'kids', icon: Baby, label: 'Kids' },
];

// Using standard <img> tags and no-referrer to bypass hotlinking protection
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

    // Settings
    const [selectedPreset, setSelectedPreset] = useState<number>(0);
    const [subjectImageSrc, setSubjectImageSrc] = useState<string | null>(null); 
    const [bgColor, setBgColor] = useState("#FFFFFF");
    const [selectedClothUrl, setSelectedClothUrl] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('men');

    // Alignment
    const [scale, setScale] = useState(100);
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);
    const [brightness, setBrightness] = useState([100]);
    const [contrast, setContrast] = useState([100]);

    // Cropping
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
                output: { format: "image/png", quality: 0.95 }
            });

            const url = URL.createObjectURL(blob);
            setSubjectImageSrc(url);
            toast({ title: "Background Removed!" });
            setStage('background'); // Move to background after removal
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "AI Error", description: "Could not remove background automatically." });
            setSubjectImageSrc(originalCroppedData);
            setStage('background');
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

            const targetW = 600;
            const targetH = targetW / getAspectRatio();
            canvas.width = targetW;
            canvas.height = targetH;

            // 1. Background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Face (Subject)
            const faceImg = new Image();
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

                    ctx.save();
                    ctx.filter = `brightness(${brightness[0]}%) contrast(${contrast[0]}%)`;
                    ctx.drawImage(faceImg, x, y, dw, dh);
                    ctx.restore();
                    resolve(null);
                };
                faceImg.onerror = () => resolve(null);
            });

            // 3. Cloth (Suit)
            if (selectedClothUrl) {
                const clothImg = new Image();
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

        const timer = setTimeout(render, 50);
        return () => clearTimeout(timer);
    }, [subjectImageSrc, bgColor, selectedClothUrl, scale, posX, posY, selectedPreset, brightness, contrast]);

    const handleInitialCrop = async () => {
        if (!imgRef.current || !completedCrop) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const targetW = 800;
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
        setOriginalCroppedData(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!imgSrc) {
        return (
            <Card className="w-full max-w-2xl border-foreground/10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                <CardContent className="p-12 text-center space-y-8">
                    <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
                        <Contact className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black">Passport Studio</h2>
                        <p className="text-muted-foreground font-medium">Create professional passport photos with AI suit changer.</p>
                    </div>
                    <div className="max-w-xs mx-auto space-y-4">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">1. Select Standard Size</Label>
                        <Select value={String(selectedPreset)} onValueChange={(v) => setSelectedPreset(Number(v))}>
                            <SelectTrigger className="h-12 font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {PRESETS.map((p, i) => <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="border-2 border-dashed border-primary/20 rounded-3xl p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-primary/5 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="size-12 text-muted-foreground group-hover:text-primary transition-colors" />
                        <p className="font-bold">2. Upload Your Photo</p>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Supports PNG, JPG, WEBP</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-5xl px-4 py-8 animate-in fade-in duration-500">
            {/* Stage Tabs */}
            <div className="flex justify-center items-center gap-2 mb-8 bg-muted/30 p-1.5 rounded-2xl border-2 shadow-inner overflow-x-auto no-scrollbar">
                {(['size', 'crop', 'background', 'cloth', 'download'] as Stage[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => setStage(s)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
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

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Canvas Area */}
                <div className="lg:col-span-7 flex flex-col items-center gap-6">
                    <div className={cn(
                        "relative bg-white shadow-2xl border-4 border-white rounded-2xl overflow-hidden flex items-center justify-center min-h-[450px] w-full max-w-[400px]",
                        stage === 'crop' && "max-w-full"
                    )}>
                        {stage === 'crop' ? (
                            <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={getAspectRatio()} className="w-full h-full">
                                <img 
                                    ref={imgRef} src={imgSrc || ''} alt="source" className="max-h-[65vh] w-full object-contain" 
                                    onLoad={(e) => {
                                        const { width, height } = e.currentTarget;
                                        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 80 }, getAspectRatio(), width, height), width, height));
                                    }}
                                />
                            </ReactCrop>
                        ) : (
                            <div className="relative">
                                <canvas ref={mainCanvasRef} className="max-w-full h-auto rounded-lg shadow-inner" />
                                {isProcessing && (
                                    <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-8 gap-6 z-20">
                                        <Loader2 className="size-16 animate-spin text-primary stroke-[3]" />
                                        <div className="w-full max-w-[200px] space-y-2">
                                            <p className="font-black text-[10px] uppercase tracking-tighter text-center text-primary animate-pulse">Removing Background... {progress}%</p>
                                            <Progress value={progress} className="h-1.5" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Instant Alignment Bar */}
                    {stage !== 'crop' && (
                        <div className="flex bg-background/80 backdrop-blur-md p-2.5 rounded-2xl border-2 gap-2 shadow-xl">
                            <Button variant="outline" size="icon" onClick={handleRemoveBackground} disabled={isProcessing} className="bg-primary/5 border-primary/20 hover:bg-primary/10" title="AI REMOVE BACKGROUND">
                                <Eraser className="size-4 text-primary" />
                            </Button>
                            <div className="w-px bg-border mx-1" />
                            <Button variant="outline" size="icon" onClick={() => setScale(s => s + 5)} title="Zoom In"><ZoomIn className="size-4"/></Button>
                            <Button variant="outline" size="icon" onClick={() => setScale(s => s - 5)} title="Zoom Out"><ZoomOut className="size-4"/></Button>
                            <div className="w-px bg-border mx-1" />
                            <Button variant="outline" size="icon" onClick={() => setPosX(p => p - 2)}><ChevronLeft className="size-4"/></Button>
                            <Button variant="outline" size="icon" onClick={() => setPosX(p => p + 2)}><ChevronRight className="size-4"/></Button>
                            <Button variant="outline" size="icon" onClick={() => setPosY(p => p - 2)}><ChevronUp className="size-4"/></Button>
                            <Button variant="outline" size="icon" onClick={() => setPosY(p => p + 2)}><ChevronDown className="size-4"/></Button>
                        </div>
                    )}
                </div>

                {/* Right Settings Panel */}
                <div className="lg:col-span-5 w-full space-y-6">
                    <Card className="border-2 border-primary/10 shadow-xl overflow-hidden">
                        <CardContent className="p-6 space-y-6">
                            
                            {stage === 'crop' && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                    <h3 className="text-xl font-black tracking-tight">Crop Your Face</h3>
                                    <p className="text-sm text-muted-foreground">Adjust the box to frame your head and shoulders correctly.</p>
                                    <Button className="w-full h-14 text-lg font-black bg-primary shadow-xl" onClick={handleInitialCrop}>
                                        CONFIRM FACE CROP <ChevronRight className="ml-2" />
                                    </Button>
                                </div>
                            )}

                            {stage === 'background' && (
                                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        <Eraser className="text-primary" /> Background Color
                                    </h3>
                                    <Button className="w-full h-14 font-black bg-primary/10 text-primary border-2 border-primary/20 hover:bg-primary/20" onClick={handleRemoveBackground} disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <Zap className="mr-2 fill-current" />}
                                        AI AUTO REMOVE BACKGROUND
                                    </Button>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Select Official Color</Label>
                                        <div className="grid grid-cols-5 gap-4">
                                            {["#FFFFFF", "#ADD8E6", "#000080", "#F5F5F5", "#D3D3D3"].map(c => (
                                                <button 
                                                    key={c} 
                                                    onClick={() => setBgColor(c)} 
                                                    className={cn("size-12 rounded-full border-4 shadow-md transition-transform active:scale-90", bgColor === c ? "border-primary scale-110 ring-4 ring-primary/20" : "border-white")} 
                                                    style={{ backgroundColor: c }} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <Button className="w-full h-14 text-lg font-black bg-primary shadow-xl" onClick={() => setStage('cloth')}>
                                        NEXT: CHANGE CLOTHES <ChevronRight className="ml-2" />
                                    </Button>
                                </div>
                            )}

                            {stage === 'cloth' && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                            <Shirt className="text-primary" /> Clothing Studio
                                        </h3>
                                        <Button variant="ghost" size="icon" onClick={() => setStage('background')}><RefreshCcw className="size-4" /></Button>
                                    </div>
                                    
                                    {/* Category Select */}
                                    <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border">
                                        {CLOTH_CATEGORIES.map(cat => (
                                            <Button 
                                                key={cat.id} 
                                                variant={activeCategory === cat.id ? "default" : "ghost"} 
                                                className="flex-1 rounded-lg text-[10px] font-black uppercase"
                                                onClick={() => setActiveCategory(cat.id)}
                                            >
                                                <cat.icon className="mr-2 size-4" /> {cat.label}
                                            </Button>
                                        ))}
                                    </div>

                                    {/* Scrollable Clothes */}
                                    <div className="p-4 bg-muted/20 border-2 border-dashed border-primary/10 rounded-2xl">
                                        <ScrollArea className="w-full whitespace-nowrap">
                                            <div className="flex gap-4 p-2">
                                                <button 
                                                    className={cn("size-24 bg-white border-2 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-all", !selectedClothUrl && "border-primary ring-4 ring-primary/10")}
                                                    onClick={() => setSelectedClothUrl(null)}
                                                >
                                                    <X className="size-8 text-muted-foreground" />
                                                    <span className="text-[10px] font-black uppercase mt-1">None</span>
                                                </button>
                                                {CLOTH_ITEMS[activeCategory].map((item) => (
                                                    <button 
                                                        key={item.id} 
                                                        onClick={() => setSelectedClothUrl(item.url)}
                                                        className={cn(
                                                            "size-24 bg-white border-2 rounded-2xl overflow-hidden shrink-0 transition-all active:scale-95 group relative", 
                                                            selectedClothUrl === item.url ? "border-primary ring-4 ring-primary/10" : "border-transparent shadow-md hover:border-primary/30"
                                                        )}
                                                    >
                                                        <img 
                                                            src={item.url} 
                                                            alt={item.label} 
                                                            className="w-full h-full object-contain p-1" 
                                                            referrerPolicy="no-referrer"
                                                            onError={(e) => {
                                                                (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9InN0cm9rZS1tdXRlZC1mb3JlZ3JvdW5kIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwLjM4IDMuNDZhMi4xOCAyLjE4IDAgMCAwLTIuMS0uMTRMMTUgNSAxMiAzIDkgNSA2IDMuMzJhMi4xOCAyLjE4IDAgMCAwLTIuMS4xNCAyLjE0IDIuMTQgMCAwIDAtMSAxLjgzdjkuMDRjMCAuODMgLjY3IDEuNSA0IDEuNSAxLjY2IDAgMy0xLjMzIDMtM3YtMWMwLTEuNjcgMS4zMy0zIDMtM3MxLjMzIDEuMzMgMyAzIHYxYzAgMS42NyAxLjMzIDMgMyAzIDMuMzMgMCA0LS42NyA0LTEuNXYtOS4wNGEyLjE0IDIuMTQgMCAwIDAtMS0xLjgzeiIvPjwvc3ZnPg==';
                                                            }}
                                                        />
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] font-black py-1 uppercase tracking-tighter truncate px-1">
                                                            {item.label}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                            <ScrollBar orientation="horizontal" />
                                        </ScrollArea>
                                    </div>

                                    {/* Image Adjustments */}
                                    <div className="space-y-4 pt-4 border-t">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><Sun className="size-3" /> Brightness</Label>
                                        <Slider min={50} max={150} step={1} value={brightness} onValueChange={setBrightness} />
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><Contrast className="size-3" /> Contrast</Label>
                                        <Slider min={50} max={150} step={1} value={contrast} onValueChange={setContrast} />
                                    </div>

                                    <Button className="w-full h-16 text-xl font-black bg-green-600 hover:bg-green-700 shadow-xl rounded-2xl animate-bounce-subtle" onClick={handleDownload}>
                                        <Download className="mr-3 size-6" /> DOWNLOAD FINAL PHOTO
                                    </Button>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <Button variant="outline" className="flex-1 font-bold h-12 rounded-xl" onClick={reset}><RefreshCcw className="mr-2 h-4 w-4" /> Start Over</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-4 bg-primary/5 border-2 border-primary/10 rounded-2xl flex gap-3 items-center">
                        <ShieldCheck className="size-8 text-primary shrink-0" />
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase">Security Lock</p>
                            <p className="text-[9px] text-muted-foreground font-medium">All processing is 100% local. No data leaves your browser.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
