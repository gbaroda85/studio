
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
    Settings2,
    Sun,
    Contrast,
    Zap,
    Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

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

type Stage = 'size' | 'crop' | 'removing_bg' | 'studio';

export default function PassportPhotoMaker() {
    const { toast } = useToast();
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [stage, setStage] = useState<Stage>('size');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");

    // Settings
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
        setStage('removing_bg');
    };

    const startBackgroundRemoval = async () => {
        if (!originalCroppedData) return;
        setIsProcessing(true);
        setProgress(5);
        setStatusText("Loading AI Model...");

        try {
            const imglyModule = await import("@imgly/background-removal");
            const removeBackgroundFunc = imglyModule.removeBackground || (imglyModule as any).default;

            const blob = await removeBackgroundFunc(originalCroppedData, {
                progress: (item: string, index: number, total: number) => {
                    const p = Math.round((index / total) * 100);
                    setProgress(p);
                    setStatusText(`Removing Background... (${p}%)`);
                },
                output: { format: "image/png", quality: 0.95 }
            });

            const url = URL.createObjectURL(blob);
            setSubjectImageSrc(url);
            setStage('studio');
            toast({ title: "Done!", description: "Background removed successfully." });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "AI Busy", description: "Background removal skipped. You can still add a suit." });
            setStage('studio');
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    useEffect(() => {
        if (stage === 'removing_bg') {
            startBackgroundRemoval();
        }
    }, [stage]);

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

            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

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

                    ctx.save();
                    ctx.filter = `brightness(${brightness[0]}%) contrast(${contrast[0]}%)`;
                    ctx.drawImage(faceImg, x, y, dw, dh);
                    ctx.restore();
                    resolve(null);
                };
                faceImg.onerror = () => resolve(null);
            });

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
    }, [subjectImageSrc, bgColor, selectedClothUrl, scale, posX, posY, brightness, contrast, selectedPreset]);

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
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (stage === 'size') {
        return (
            <Card className="w-full max-w-2xl border-foreground/10 shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <Contact className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-3xl font-black">Passport Studio Pro</CardTitle>
                    <CardDescription>Step 1: Choose Photo Size</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="font-black text-xs uppercase text-muted-foreground tracking-widest">Select Dimensions</Label>
                            <Select value={String(selectedPreset)} onValueChange={(v) => setSelectedPreset(v === 'custom' ? 'custom' : Number(v))}>
                                <SelectTrigger className="h-14 font-bold text-lg"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {PRESETS.map((p, i) => <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>)}
                                    <SelectItem value="custom">Custom Size</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="font-black text-xs uppercase text-muted-foreground tracking-widest">Print Quality</Label>
                            <div className="h-14 flex items-center px-4 border rounded-md bg-muted/30 font-bold">300 DPI (Default)</div>
                        </div>
                    </div>

                    <div className="border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-primary/5 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div className="text-center">
                            <p className="text-xl font-bold">Click to select photo</p>
                            <p className="text-sm text-muted-foreground mt-2">Formal photos work best.</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                </CardContent>
            </Card>
        );
    }

    if (stage === 'removing_bg') {
        return (
            <Card className="w-full max-w-2xl p-16 text-center space-y-8 border-2">
                <div className="relative mx-auto">
                    <Loader2 className="size-20 animate-spin text-primary mx-auto stroke-[3]" />
                    <Eraser className="absolute inset-0 m-auto size-8 text-primary animate-pulse" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-primary animate-pulse">{statusText}</h2>
                    <Progress value={progress} className="h-3 shadow-inner" />
                    <p className="text-sm text-muted-foreground font-medium">Please wait while our AI cleans the background for a professional look.</p>
                </div>
                <Button variant="ghost" className="text-xs font-bold" onClick={() => setStage('studio')}>Skip AI Removal</Button>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
            <div className="flex justify-center mb-8">
                <div className="bg-card/80 backdrop-blur-xl border-2 rounded-2xl p-1 flex gap-2 shadow-xl">
                    <Badge variant="outline" className="px-6 py-2 rounded-xl border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-widest">
                        <Sparkles className="mr-2 size-4" /> Professional Studio Mode Active
                    </Badge>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <Card className="overflow-hidden border-2 shadow-2xl relative bg-white min-h-[500px] flex items-center justify-center p-8">
                        {stage === 'crop' && imgSrc ? (
                            <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={getAspectRatio()} keepSelection>
                                <img 
                                    ref={imgRef} 
                                    src={imgSrc} 
                                    alt="source" 
                                    className="max-h-[65vh] w-auto object-contain" 
                                    onLoad={(e) => {
                                        const { width, height } = e.currentTarget;
                                        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 80 }, getAspectRatio(), width, height), width, height));
                                    }} 
                                />
                            </ReactCrop>
                        ) : (
                            <canvas ref={mainCanvasRef} className="max-h-[65vh] w-auto h-auto rounded shadow-2xl ring-8 ring-white" />
                        )}
                    </Card>

                    <div className="flex justify-center items-center gap-4">
                        <Button variant="outline" size="lg" className="h-14 px-8 border-2 font-black" onClick={reset}>
                            <RefreshCcw className="mr-2" /> START OVER
                        </Button>

                        {stage === 'crop' ? (
                            <Button size="lg" className="h-14 px-12 bg-primary font-black shadow-xl" onClick={handleInitialCrop}>
                                NEXT: REMOVE BG <ChevronRightIcon className="ml-2" />
                            </Button>
                        ) : (
                            <Button size="lg" className="h-14 px-12 bg-green-600 hover:bg-green-700 font-black shadow-xl" onClick={handleDownload}>
                                <Download className="mr-2" /> DOWNLOAD PHOTO
                            </Button>
                        )}
                    </div>
                </div>

                <div className={cn("lg:col-span-5 flex flex-col gap-6", stage === 'crop' && "opacity-20 pointer-events-none")}>
                    <Card className="border-2 shadow-xl border-primary/10 overflow-hidden flex flex-col">
                        <CardHeader className="bg-primary/5 border-b p-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Settings2 className="size-5 text-primary" /> Studio Controls
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Tabs defaultValue="suits" className="flex flex-col">
                                <TabsList className="grid w-full grid-cols-3 rounded-none bg-muted/50 h-14">
                                    <TabsTrigger value="suits" className="font-bold uppercase text-[10px]">Clothes</TabsTrigger>
                                    <TabsTrigger value="fit" className="font-bold uppercase text-[10px]">Fit Face</TabsTrigger>
                                    <TabsTrigger value="adjust" className="font-bold uppercase text-[10px]">Enhance</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="suits" className="p-0 animate-in slide-in-from-right-4">
                                    <div className="flex bg-muted/30 p-2 gap-2 border-b overflow-x-auto no-scrollbar">
                                        {CLOTH_CATEGORIES.map(cat => (
                                            <Button key={cat.id} variant={activeCategory === cat.id ? "default" : "ghost"} className="flex-1 rounded-xl h-11 font-black text-[10px]" onClick={() => setActiveCategory(cat.id)}>
                                                <cat.icon className="mr-2 size-3" /> {cat.label}
                                            </Button>
                                        ))}
                                    </div>
                                    <ScrollArea className="h-[400px] p-4">
                                        <div className="grid grid-cols-2 gap-3 pb-4">
                                            <button className={cn("aspect-[3/4] rounded-2xl border-4 bg-muted/30 flex flex-col items-center justify-center gap-2", !selectedClothUrl && "border-primary")} onClick={() => setSelectedClothUrl(null)}>
                                                <X className="size-8 text-muted-foreground" /><span className="text-[10px] font-black uppercase">No Suit</span>
                                            </button>
                                            {CLOTH_ITEMS[activeCategory].map((item) => (
                                                <button key={item.id} onClick={() => setSelectedClothUrl(item.url)} className={cn("aspect-[3/4] relative rounded-2xl border-4 overflow-hidden bg-white shadow-md transition-all active:scale-95", selectedClothUrl === item.url ? "border-primary" : "border-transparent")}>
                                                    <img src={item.url} alt={item.label} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                                                    <div className="absolute bottom-0 left-0 w-full bg-black/60 py-1 text-white text-[8px] font-black uppercase text-center">{item.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="fit" className="p-6 space-y-6 animate-in slide-in-from-right-4">
                                     <div className="grid grid-cols-3 gap-2">
                                         <Button variant="outline" size="icon" className="h-12 w-full rounded-xl" onClick={() => setScale(s => s + 5)}><ZoomIn className="size-5"/></Button>
                                         <Button variant="outline" size="icon" className="h-12 w-full rounded-xl" onClick={() => setScale(s => s - 5)}><ZoomOut className="size-5"/></Button>
                                         <Button variant="outline" size="icon" className="h-12 w-full rounded-xl text-destructive" onClick={() => { setPosX(0); setPosY(0); setScale(100); }}><RefreshCcw className="size-5"/></Button>
                                     </div>
                                     <div className="grid grid-cols-3 gap-2 place-items-center bg-muted/20 p-6 rounded-2xl border-2 border-dashed">
                                         <div /> <Button variant="ghost" size="icon" onClick={() => setPosY(p => p - 1)}><ChevronUp /></Button> <div />
                                         <Button variant="ghost" size="icon" onClick={() => setPosX(p => p - 1)}><ChevronLeft /></Button>
                                         <div className="size-4 rounded-full bg-primary/20" />
                                         <Button variant="ghost" size="icon" onClick={() => setPosX(p => p + 1)}><ChevronRight /></Button>
                                         <div /> <Button variant="ghost" size="icon" onClick={() => setPosY(p => p + 1)}><ChevronDown /></Button> <div />
                                     </div>
                                     <div className="space-y-4 pt-4">
                                         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Official Background Colors</Label>
                                         <div className="grid grid-cols-5 gap-3">
                                            {BG_COLORS.map(c => (
                                                <button key={c.value} onClick={() => setBgColor(c.value)} className={cn("size-10 rounded-xl border-4 shadow-sm", bgColor === c.value ? "border-primary scale-110" : "border-transparent")} style={{ backgroundColor: c.value }} />
                                            ))}
                                         </div>
                                     </div>
                                </TabsContent>

                                <TabsContent value="adjust" className="p-6 space-y-8 animate-in slide-in-from-right-4">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><Sun className="size-3" /> Brightness</Label><span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{brightness[0]}%</span></div>
                                        <Slider min={50} max={150} step={1} value={brightness} onValueChange={setBrightness} />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><Contrast className="size-3" /> Contrast</Label><span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{contrast[0]}%</span></div>
                                        <Slider min={50} max={150} step={1} value={contrast} onValueChange={setContrast} />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="bg-muted/30 border-t p-4 flex gap-3 items-center">
                            <ShieldCheck className="size-8 text-green-600 shrink-0" />
                            <p className="text-[9px] text-green-700 font-bold uppercase leading-tight">All processing happens locally. Photos are never uploaded to any server.</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
