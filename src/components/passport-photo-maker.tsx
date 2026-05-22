
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    Eraser, 
    Shirt, 
    Loader2, 
    ZoomIn, 
    ZoomOut, 
    ChevronUp, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight, 
    UserCircle, 
    Baby, 
    X, 
    ShieldCheck, 
    Zap,
    Paintbrush,
    Undo2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

type Stage = 'size' | 'crop' | 'background' | 'studio' | 'download';

const PRESETS = [
    { label: "India (3.5x4.5cm)", width: 3.5, height: 4.5, unit: 'cm' },
    { label: "USA (2x2in)", width: 2, height: 2, unit: 'inch' },
    { label: "PAN Card (2.5x3.5cm)", width: 2.5, height: 3.5, unit: 'cm' },
];

const CLOTH_ITEMS = [
    { id: 'm1', label: 'Grey Suit', url: 'https://pi7.org/assets/img/clothes/men/m1.png' },
    { id: 'm2', label: 'Navy Blazer', url: 'https://pi7.org/assets/img/clothes/men/m2.png' },
    { id: 'm3', label: 'Blue Shirt', url: 'https://pi7.org/assets/img/clothes/men/m3.png' },
    { id: 'w1', label: 'Female Blazer', url: 'https://pi7.org/assets/img/clothes/women/w1.png' },
    { id: 'w2', label: 'Formal Top', url: 'https://pi7.org/assets/img/clothes/women/w2.png' },
    { id: 'k1', label: 'Kid Suit', url: 'https://pi7.org/assets/img/clothes/kids/k1.png' },
];

export default function PassportPhotoMaker() {
    const { toast } = useToast();
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [stage, setStage] = useState<Stage>('size');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    // Editing States
    const [selectedPreset, setSelectedPreset] = useState<number>(0);
    const [subjectImageSrc, setSubjectImageSrc] = useState<string | null>(null); 
    const [bgColor, setBgColor] = useState("#FFFFFF");
    const [selectedClothUrl, setSelectedClothUrl] = useState<string | null>(null);
    const [scale, setScale] = useState(100);
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);

    // Refinement States
    const [brushSize, setBrushSize] = useState([20]);

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

    const handleRemoveBackground = async () => {
        if (!originalCroppedData) return;
        setIsProcessing(true);
        setProgress(5);
        
        // Use timeout to yield thread for smooth UI
        setTimeout(async () => {
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
                toast({ title: "Success!", description: "Background removed locally." });
                setStage('studio');
            } catch (error: any) {
                console.error(error);
                toast({ variant: "destructive", title: "AI Error", description: "Using original photo." });
                setSubjectImageSrc(originalCroppedData);
                setStage('studio');
            } finally {
                setIsProcessing(false);
            }
        }, 300);
    };

    const renderPhoto = useCallback(async () => {
        const canvas = mainCanvasRef.current;
        if (!canvas || !subjectImageSrc) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const targetW = 600;
        const targetH = targetW / getAspectRatio();
        canvas.width = targetW;
        canvas.height = targetH;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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
                ctx.drawImage(faceImg, x, y, dw, dh);
                resolve(null);
            };
            faceImg.onerror = () => resolve(null);
        });

        if (selectedClothUrl) {
            const clothImg = new Image();
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
    }, [subjectImageSrc, bgColor, selectedClothUrl, scale, posX, posY, selectedPreset]);

    useEffect(() => {
        const timer = setTimeout(renderPhoto, 50);
        return () => clearTimeout(timer);
    }, [renderPhoto]);

    const handleInitialCrop = async () => {
        if (!imgRef.current || !completedCrop) return;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const targetW = 800;
        const targetH = targetW / getAspectRatio();
        canvas.width = targetW;
        canvas.height = targetH;

        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        ctx.drawImage(imgRef.current, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, targetW, targetH);
        const data = canvas.toDataURL('image/jpeg', 0.95);
        setOriginalCroppedData(data);
        setSubjectImageSrc(data);
        setStage('background');
    };

    if (!imgSrc) {
        return (
            <Card className="w-full max-w-2xl border-primary/20 shadow-2xl animate-in fade-in duration-500">
                <CardContent className="p-12 text-center space-y-10">
                    <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
                        <UserCircle className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black font-headline uppercase">Passport Pro Studio</h2>
                        <p className="text-muted-foreground font-medium">Ultra-stable Local AI Passport Maker</p>
                    </div>
                    <div className="max-w-xs mx-auto space-y-4">
                        <Label className="text-xs font-black uppercase text-primary">1. Select Output Size</Label>
                        <Select value={String(selectedPreset)} onValueChange={(v) => setSelectedPreset(Number(v))}>
                            <SelectTrigger className="h-12 font-bold border-2"><SelectValue /></SelectTrigger>
                            <SelectContent>{PRESETS.map((p, i) => <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="border-3 border-dashed border-primary/20 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-primary/5 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <p className="text-xl font-bold">2. Upload Face Photo</p>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-6xl px-4 py-8 animate-in fade-in duration-500">
            <div className="flex justify-center items-center gap-2 mb-8 bg-muted/40 p-1 rounded-2xl border-2 overflow-x-auto no-scrollbar">
                {(['size', 'crop', 'background', 'studio', 'download'] as Stage[]).map((s) => (
                    <button key={s} onClick={() => originalCroppedData && setStage(s)} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", stage === s ? "bg-primary text-white shadow-lg" : "bg-transparent text-muted-foreground")}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 flex flex-col items-center gap-6">
                    <div className="relative bg-white shadow-2xl border-4 border-white rounded-[2rem] overflow-hidden flex items-center justify-center min-h-[450px] w-full max-w-[400px]">
                        {stage === 'crop' ? (
                            <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={getAspectRatio()} className="w-full h-full">
                                <img ref={imgRef} src={imgSrc} alt="source" className="max-h-[60vh] w-full object-contain" onLoad={(e) => {
                                    const { width, height } = e.currentTarget;
                                    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 80 }, getAspectRatio(), width, height), width, height));
                                }} />
                            </ReactCrop>
                        ) : (
                            <div className="relative group">
                                <canvas ref={mainCanvasRef} className="max-w-full h-auto" />
                                {isProcessing && (
                                    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-12 gap-6 z-20 transform-gpu">
                                        <Loader2 className="size-16 animate-spin text-primary" />
                                        <div className="w-full max-w-[200px] space-y-2">
                                            <p className="font-black text-[10px] uppercase text-center text-primary">Cleaning BG... {progress}%</p>
                                            <Progress value={progress} className="h-1" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {stage !== 'crop' && (
                        <div className="flex bg-card p-3 rounded-2xl border-2 gap-3 shadow-xl items-center flex-wrap justify-center">
                            <Button variant="outline" size="icon" onClick={() => setScale(s => s + 5)}><ZoomIn className="size-5"/></Button>
                            <Button variant="outline" size="icon" onClick={() => setScale(s => s - 5)}><ZoomOut className="size-5"/></Button>
                            <div className="w-px h-6 bg-border mx-1" />
                            <Button variant="outline" size="icon" onClick={() => setPosX(p => p - 2)}><ChevronLeft className="size-5"/></Button>
                            <Button variant="outline" size="icon" onClick={() => setPosX(p => p + 2)}><ChevronRight className="size-5"/></Button>
                            <Button variant="outline" size="icon" onClick={() => setPosY(p => p - 2)}><ChevronUp className="size-5"/></Button>
                            <Button variant="outline" size="icon" onClick={() => setPosY(p => p + 2)}><ChevronDown className="size-5"/></Button>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 w-full">
                    <Card className="border-2 border-primary/10 shadow-xl rounded-[2rem] overflow-hidden bg-card/50">
                        <CardContent className="p-6 space-y-6">
                            {stage === 'crop' && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black">Crop Face</h3>
                                    <Button className="w-full h-14 text-lg font-black bg-primary" onClick={handleInitialCrop}>NEXT: REMOVE BACKGROUND <ChevronRight className="ml-2" /></Button>
                                </div>
                            )}

                            {stage === 'background' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black flex items-center gap-2"><Eraser className="text-primary" /> Background</h3>
                                    <Button className="w-full h-16 font-black bg-primary text-lg" onClick={handleRemoveBackground} disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="mr-3 size-6 animate-spin" /> : <Zap className="mr-3 size-6 text-yellow-400 fill-yellow-400" />}
                                        AI REMOVE BACKGROUND
                                    </Button>
                                    <div className="grid grid-cols-5 gap-3">
                                        {["#FFFFFF", "#ADD8E6", "#000080", "#F5F5F5", "#D3D3D3"].map(c => (
                                            <button key={c} onClick={() => setBgColor(c)} className={cn("size-10 rounded-xl border-2 transition-all", bgColor === c ? "border-primary ring-2 ring-primary/20 scale-110" : "border-muted")} style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                    <Button variant="outline" className="w-full h-12 font-bold" onClick={() => setStage('studio')}>NEXT: CHANGE CLOTHES <ChevronRight className="ml-2" /></Button>
                                </div>
                            )}

                            {stage === 'studio' && (
                                <div className="space-y-6">
                                    <Tabs defaultValue="cloth">
                                        <TabsList className="grid w-full grid-cols-2 mb-6">
                                            <TabsTrigger value="cloth" className="font-black text-[10px] uppercase">Clothes</TabsTrigger>
                                            <TabsTrigger value="refine" className="font-black text-[10px] uppercase">Refine Body</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="cloth" className="space-y-4">
                                            <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-2 border rounded-xl bg-muted/10">
                                                <button className={cn("h-24 bg-white border-2 rounded-xl flex flex-col items-center justify-center", !selectedClothUrl && "border-primary")} onClick={() => setSelectedClothUrl(null)}>
                                                    <X className="size-6" /> <span className="text-[8px] font-bold uppercase mt-1">No Suit</span>
                                                </button>
                                                {CLOTH_ITEMS.map((item) => (
                                                    <button key={item.id} onClick={() => setSelectedClothUrl(item.url)} className={cn("h-24 bg-white border-2 rounded-xl overflow-hidden p-1", selectedClothUrl === item.url ? "border-primary ring-2 ring-primary/10" : "border-transparent")}>
                                                        <img src={item.url} alt={item.label} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                                        <div className="text-[8px] font-black uppercase text-center truncate">{item.label}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="refine" className="space-y-4">
                                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
                                                <p className="text-[10px] font-black uppercase text-primary">Manual Refinement (Beta)</p>
                                                <p className="text-xs text-muted-foreground">If AI cut your hand, use a brush to manually fix it on canvas.</p>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase">Brush Size</Label>
                                                    <Slider value={brushSize} onValueChange={setBrushSize} min={5} max={50} step={1} />
                                                </div>
                                                <Button variant="outline" className="w-full h-10 text-[10px] font-black uppercase"><Paintbrush className="mr-2 size-3" /> Start Refining</Button>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <Button className="w-full h-16 text-xl font-black bg-green-600 hover:bg-green-700 shadow-2xl" onClick={handleDownload}>
                                        <Download className="mr-2 size-6" /> DOWNLOAD HD PHOTO
                                    </Button>
                                </div>
                            )}

                            <Button variant="outline" className="w-full font-black h-10 text-[10px]" onClick={() => { setStage('size'); setImgSrc(null); setOriginalCroppedData(null); setSubjectImageSrc(null); }}>
                                <RefreshCcw className="mr-2 size-3" /> CHANGE PHOTO
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );

    function handleDownload() {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.98);
        link.download = `passport-photo-${Date.now()}.jpg`;
        link.click();
    }
}
