
"use client";

import React, { useState, useRef, useEffect, type SyntheticEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
    ShieldCheck,
    Zap,
    Sun,
    Contrast,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Stage = 'size' | 'crop' | 'background' | 'studio' | 'download';

const PRESETS = [
    { label: "India (3.5x4.5cm)", width: 3.5, height: 4.5, unit: 'cm' },
    { label: "USA (2x2in)", width: 2, height: 2, unit: 'inch' },
    { label: "Pan Card (2.5x3.5cm)", width: 2.5, height: 3.5, unit: 'cm' },
    { label: "Passport (3.5x4.5cm)", width: 3.5, height: 4.5, unit: 'cm' },
];

// PRO-TIP: Using realistic cloth fallbacks from PI7 but with a more robust proxy method
const CLOTH_CATEGORIES = [
    { id: 'men', icon: UserCircle, label: 'Men' },
    { id: 'women', icon: User, label: 'Women' },
    { id: 'kids', icon: Baby, label: 'Kids' },
];

const CLOTH_ITEMS: Record<string, { id: string; url: string; label: string }[]> = {
    men: [
        { id: 'm1', label: 'Grey Suit', url: 'https://pi7.org/assets/img/clothes/men/m1.png' },
        { id: 'm2', label: 'Navy Blazer', url: 'https://pi7.org/assets/img/clothes/men/m2.png' },
        { id: 'm3', label: 'Blue Shirt', url: 'https://pi7.org/assets/img/clothes/men/m3.png' },
        { id: 'm4', label: 'Black Tux', url: 'https://pi7.org/assets/img/clothes/men/m4.png' },
        { id: 'm5', label: 'Formal', url: 'https://pi7.org/assets/img/clothes/men/m5.png' },
    ],
    women: [
        { id: 'w1', label: 'Blazer', url: 'https://pi7.org/assets/img/clothes/women/w1.png' },
        { id: 'w2', label: 'Formal Top', url: 'https://pi7.org/assets/img/clothes/women/w2.png' },
        { id: 'w3', label: 'White Coat', url: 'https://pi7.org/assets/img/clothes/women/w3.png' },
    ],
    kids: [
        { id: 'k1', label: 'Tiny Suit', url: 'https://pi7.org/assets/img/clothes/kids/k1.png' },
        { id: 'k2', label: 'Uniform', url: 'https://pi7.org/assets/img/clothes/kids/k2.png' },
    ]
};

export default function PassportPhotoMaker() {
    const { toast } = useToast();
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [stage, setStage] = useState<Stage>('size');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    // States for Editing
    const [selectedPreset, setSelectedPreset] = useState<number>(0);
    const [subjectImageSrc, setSubjectImageSrc] = useState<string | null>(null); 
    const [bgColor, setBgColor] = useState("#FFFFFF");
    const [selectedClothUrl, setSelectedClothUrl] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('men');

    // Alignment & Adjustment
    const [scale, setScale] = useState(100);
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);
    const [brightness, setBrightness] = useState([100]);
    const [contrast, setContrast] = useState([100]);

    // Crop Logic
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

    // Robust AI BG Removal
    const handleRemoveBackground = async () => {
        if (!originalCroppedData) return;
        setIsProcessing(true);
        setProgress(0);
        toast({ title: "AI Scanning...", description: "Initializing local removal engine." });

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
            toast({ title: "Done!", description: "Background removed successfully." });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "AI Error", description: "Could not remove background. Using original photo." });
            setSubjectImageSrc(originalCroppedData);
        } finally {
            setIsProcessing(false);
            setStage('background');
        }
    };

    // Final Rendering Logic
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

            // 1. Draw BG Color
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Draw Subject (User Face)
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

            // 3. Draw Cloth Overlay
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
            <Card className="w-full max-w-2xl border-primary/20 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                <CardContent className="p-12 text-center space-y-10">
                    <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
                        <Contact className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black font-headline">Passport Pro Studio</h2>
                        <p className="text-muted-foreground font-medium">Official Size Photos with AI Suit Changer.</p>
                    </div>
                    
                    <div className="max-w-xs mx-auto space-y-4">
                        <Label className="text-xs font-black uppercase tracking-widest text-primary">1. Select Photo Standard</Label>
                        <Select value={String(selectedPreset)} onValueChange={(v) => setSelectedPreset(Number(v))}>
                            <SelectTrigger className="h-12 font-bold border-2"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {PRESETS.map((p, i) => <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border-3 border-dashed border-primary/20 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-primary/5 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div className="space-y-1">
                            <p className="text-xl font-bold">2. Upload Your Photo</p>
                            <p className="text-xs text-muted-foreground">Select a clear face photo</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-6xl px-4 py-8 animate-in fade-in duration-500">
            {/* Header Steps */}
            <div className="flex justify-center items-center gap-2 mb-10 bg-muted/40 p-1.5 rounded-3xl border-2 shadow-inner overflow-x-auto no-scrollbar">
                {(['size', 'crop', 'background', 'studio', 'download'] as Stage[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => { if(originalCroppedData) setStage(s); }}
                        className={cn(
                            "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                            stage === s ? "bg-primary text-white shadow-xl scale-105" : "bg-transparent text-muted-foreground hover:bg-muted"
                        )}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-10 items-start">
                
                {/* Visual Area */}
                <div className="lg:col-span-7 flex flex-col items-center gap-8">
                    <div className={cn(
                        "relative bg-white shadow-2xl border-4 border-white rounded-[2.5rem] overflow-hidden flex items-center justify-center min-h-[500px] w-full max-w-[420px]",
                        stage === 'crop' && "max-w-full"
                    )}>
                        {stage === 'crop' ? (
                            <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={getAspectRatio()} className="w-full h-full">
                                <img 
                                    ref={imgRef} src={imgSrc} alt="source" className="max-h-[65vh] w-full object-contain" 
                                    onLoad={(e) => {
                                        const { width, height } = e.currentTarget;
                                        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 80 }, getAspectRatio(), width, height), width, height));
                                    }}
                                />
                            </ReactCrop>
                        ) : (
                            <div className="relative group">
                                <canvas ref={mainCanvasRef} className="max-w-full h-auto shadow-2xl" />
                                {isProcessing && (
                                    <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-12 gap-8 z-20">
                                        <Loader2 className="size-20 animate-spin text-primary stroke-[3]" />
                                        <div className="w-full max-w-[250px] space-y-3">
                                            <p className="font-black text-xs uppercase tracking-tighter text-center text-primary animate-pulse">Removing Background... {progress}%</p>
                                            <Progress value={progress} className="h-2 rounded-full" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Instant Control Toolbar */}
                    {stage !== 'crop' && (
                        <div className="flex bg-background/90 backdrop-blur-xl p-3.5 rounded-[2rem] border-2 gap-3 shadow-2xl items-center">
                            <Button variant="outline" size="icon" onClick={() => setScale(s => s + 5)} title="Zoom In" className="rounded-xl"><ZoomIn className="size-5"/></Button>
                            <Button variant="outline" size="icon" onClick={() => setScale(s => s - 5)} title="Zoom Out" className="rounded-xl"><ZoomOut className="size-5"/></Button>
                            <div className="w-px h-8 bg-border mx-1" />
                            <Button variant="outline" size="icon" onClick={() => setPosX(p => p - 2)} className="rounded-xl"><ChevronLeft className="size-5"/></Button>
                            <Button variant="outline" size="icon" onClick={() => setPosX(p => p + 2)} className="rounded-xl"><ChevronRight className="size-5"/></Button>
                            <Button variant="outline" size="icon" onClick={() => setPosY(p => p - 2)} className="rounded-xl"><ChevronUp className="size-5"/></Button>
                            <Button variant="outline" size="icon" onClick={() => setPosY(p => p + 2)} className="rounded-xl"><ChevronDown className="size-5"/></Button>
                            <div className="w-px h-8 bg-border mx-1" />
                            <Button variant="outline" onClick={handleRemoveBackground} disabled={isProcessing} className="bg-primary/5 border-primary/30 text-primary font-black text-[10px] rounded-xl px-4 h-10">
                                <Eraser className="size-4 mr-2" /> RE-SCAN BG
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right Side Studio Panel */}
                <div className="lg:col-span-5 w-full space-y-6">
                    <Card className="border-2 border-primary/10 shadow-2xl rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-8 space-y-8">
                            
                            {stage === 'crop' && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                    <h3 className="text-2xl font-black tracking-tight font-headline">Crop Face</h3>
                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">Adjust the blue box to keep your face centered. This area will be used for the passport photo.</p>
                                    <Button className="w-full h-16 text-xl font-black bg-primary shadow-xl rounded-2xl group" onClick={handleInitialCrop}>
                                        CONFIRM & PROCEED <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            )}

                            {stage === 'background' && (
                                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                                    <h3 className="text-2xl font-black tracking-tight font-headline flex items-center gap-3">
                                        <Eraser className="text-primary" /> Step 3: Background
                                    </h3>
                                    
                                    {!subjectImageSrc?.startsWith('blob') ? (
                                        <Button className="w-full h-20 font-black bg-primary text-xl shadow-2xl rounded-2xl" onClick={handleRemoveBackground} disabled={isProcessing}>
                                            {isProcessing ? <Loader2 className="mr-3 size-8 animate-spin" /> : <Zap className="mr-3 size-8 fill-yellow-400 text-yellow-400" />}
                                            AI REMOVE BACKGROUND
                                        </Button>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="p-5 bg-green-500/10 border-2 border-dashed border-green-500/20 rounded-2xl text-center">
                                                <p className="text-sm font-bold text-green-700">Background Successfully Cleaned!</p>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Select Official Color</Label>
                                                <div className="grid grid-cols-5 gap-4">
                                                    {["#FFFFFF", "#ADD8E6", "#000080", "#F5F5F5", "#D3D3D3"].map(c => (
                                                        <button 
                                                            key={c} 
                                                            onClick={() => setBgColor(c)} 
                                                            className={cn("size-14 rounded-3xl border-4 shadow-xl transition-all active:scale-90", bgColor === c ? "border-primary scale-110 ring-4 ring-primary/20" : "border-white")} 
                                                            style={{ backgroundColor: c }} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <Button className="w-full h-16 text-xl font-black bg-primary shadow-xl rounded-2xl" onClick={() => setStage('studio')}>
                                                NEXT: ADD FORMAL SUIT <ChevronRight className="ml-2" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {stage === 'studio' && (
                                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                                    <Tabs defaultValue="cloth" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1.5 rounded-2xl border-2">
                                            <TabsTrigger value="cloth" className="rounded-xl font-black text-[10px] uppercase">
                                                <Shirt className="mr-2 size-4" /> Clothes
                                            </TabsTrigger>
                                            <TabsTrigger value="adjust" className="rounded-xl font-black text-[10px] uppercase">
                                                <Sparkles className="mr-2 size-4" /> Fine-Tune
                                            </TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="cloth" className="space-y-6">
                                            <div className="flex gap-2 p-1.5 bg-muted/30 rounded-2xl border-2">
                                                {CLOTH_CATEGORIES.map(cat => (
                                                    <Button 
                                                        key={cat.id} 
                                                        variant={activeCategory === cat.id ? "default" : "ghost"} 
                                                        className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-tighter"
                                                        onClick={() => setActiveCategory(cat.id)}
                                                    >
                                                        <cat.icon className="mr-2 size-4" /> {cat.label}
                                                    </Button>
                                                ))}
                                            </div>

                                            <div className="p-4 bg-muted/10 border-3 border-dashed border-primary/10 rounded-[2rem]">
                                                <ScrollArea className="w-full whitespace-nowrap">
                                                    <div className="flex gap-6 p-3">
                                                        <button 
                                                            className={cn("size-28 bg-white border-3 rounded-3xl flex flex-col items-center justify-center shrink-0 transition-all shadow-xl", !selectedClothUrl && "border-primary ring-4 ring-primary/10")}
                                                            onClick={() => setSelectedClothUrl(null)}
                                                        >
                                                            <X className="size-10 text-muted-foreground" />
                                                            <span className="text-[10px] font-black uppercase mt-2">No Suit</span>
                                                        </button>
                                                        {CLOTH_ITEMS[activeCategory].map((item) => (
                                                            <button 
                                                                key={item.id} 
                                                                onClick={() => setSelectedClothUrl(item.url)}
                                                                className={cn(
                                                                    "size-28 bg-white border-3 rounded-3xl overflow-hidden shrink-0 transition-all active:scale-95 group relative shadow-xl hover:shadow-2xl", 
                                                                    selectedClothUrl === item.url ? "border-primary ring-4 ring-primary/10 scale-105" : "border-transparent"
                                                                )}
                                                            >
                                                                <img 
                                                                    src={item.url} 
                                                                    alt={item.label} 
                                                                    className="w-full h-full object-contain p-2" 
                                                                    referrerPolicy="no-referrer"
                                                                />
                                                                <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-[9px] font-black py-1.5 uppercase tracking-tighter truncate px-2 text-center">
                                                                    {item.label}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <ScrollBar orientation="horizontal" />
                                                </ScrollArea>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="adjust" className="space-y-8 py-4">
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground">
                                                        <Label className="flex items-center gap-2"><Sun className="size-4 text-yellow-500" /> Brightness</Label>
                                                        <span className="bg-muted px-2 py-0.5 rounded-lg">{brightness[0]}%</span>
                                                    </div>
                                                    <Slider min={50} max={150} step={1} value={brightness} onValueChange={setBrightness} />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground">
                                                        <Label className="flex items-center gap-2"><Contrast className="size-4 text-primary" /> Contrast</Label>
                                                        <span className="bg-muted px-2 py-0.5 rounded-lg">{contrast[0]}%</span>
                                                    </div>
                                                    <Slider min={50} max={150} step={1} value={contrast} onValueChange={setContrast} />
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <Button className="w-full h-20 text-2xl font-black bg-green-600 hover:bg-green-700 shadow-2xl rounded-3xl animate-pulse-subtle" onClick={handleDownload}>
                                        <Download className="mr-3 size-8" /> DOWNLOAD HD JPG
                                    </Button>
                                </div>
                            )}

                            <div className="pt-6 border-t flex gap-4">
                                <Button variant="outline" className="flex-1 font-black h-12 rounded-2xl border-2 hover:bg-primary/5" onClick={reset}>
                                    <RefreshCcw className="mr-2 h-4 w-4" /> START OVER
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-5 bg-primary/5 border-2 border-primary/10 rounded-3xl flex gap-4 items-center">
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <ShieldCheck className="size-7 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-primary uppercase">Studio Privacy Lock</p>
                            <p className="text-[10px] text-muted-foreground font-medium">All processing is 100% local. Your photo is never uploaded to any server.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
