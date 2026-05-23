
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
    Square
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type Stage = 'size' | 'crop' | 'background' | 'studio' | 'download';

const PRESETS = [
    { label: "India Passport (3.5x4.5cm)", width: 3.5, height: 4.5, unit: 'cm' },
    { label: "USA Visa (2x2in)", width: 2, height: 2, unit: 'inch' },
    { label: "PAN Card / ID (2.5x3.5cm)", width: 2.5, height: 3.5, unit: 'cm' },
    { label: "Standard Small (2x2.5cm)", width: 2, height: 2.5, unit: 'cm' },
];

const COLORS = [
    { name: "Pure White", value: "#FFFFFF" },
    { name: "Off White", value: "#F5F5F5" },
    { name: "Royal Blue", value: "#003399" },
    { name: "Navy Blue", value: "#000080" },
    { name: "Light Grey", value: "#D3D3D3" },
    { name: "Sky Blue", value: "#ADD8E6" },
];

const BORDER_COLORS = [
    { name: "None", value: "transparent" },
    { name: "White", value: "#FFFFFF" },
    { name: "Black", value: "#000000" },
    { name: "Light Grey", value: "#CCCCCC" },
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
    const [scale, setScale] = useState(100);
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [borderWidth, setBorderWidth] = useState([0]);
    const [borderColor, setBorderColor] = useState("#000000");

    // Crop Logic
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [originalCroppedData, setOriginalCroppedData] = useState<string | null>(null);

    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const faceImgRef = useRef<HTMLImageElement | null>(null);

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
                setScale(100);
                setPosX(0);
                setPosY(0);
                setRotation(0);
                setBorderWidth([0]);
            };
            reader.readAsDataURL(file);
        }
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
                setStage('studio');
            };

            toast({ title: "AI Success!", description: "Background isolated locally with HD precision." });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Offline Limit", description: "Using original cropped image." });
            setStage('studio');
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

        // ULTRA HD Resolution (approx 1200px width for best print quality)
        const targetW = 1200; 
        const targetH = targetW / getAspectRatio();
        canvas.width = targetW;
        canvas.height = targetH;

        // 1. Draw Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw Face Image with transformations
        ctx.save();
        
        const s = scale / 100;
        const dw = canvas.width * s;
        // Maintain aspect ratio based on width scaling
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

        // 3. Draw Border (Last layer)
        if (borderWidth[0] > 0) {
            const bPx = (borderWidth[0] / 100) * canvas.width;
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = bPx;
            ctx.strokeRect(bPx/2, bPx/2, canvas.width - bPx, canvas.height - bPx);
        }
    }, [bgColor, scale, posX, posY, rotation, selectedPreset, borderWidth, borderColor]);

    useEffect(() => {
        if (stage === 'background' || stage === 'studio') {
            renderPhoto();
        }
    }, [renderPhoto, stage]);

    const handleInitialCrop = async () => {
        if (!imgRef.current || !completedCrop) return;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // High res crop buffer
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
        
        // Populate faceImgRef immediately so the next stage shows the photo
        const img = new window.Image();
        img.src = data;
        img.onload = () => {
            faceImgRef.current = img;
            setStage('background');
            // Give canvas a moment to register ref
            setTimeout(renderPhoto, 50);
        };
    };

    const handleDownload = () => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        
        // Ensure final render is fresh and highest quality
        renderPhoto();
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 1.0); // 1.0 = Highest Quality
        link.download = `hd-passport-photo-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: 'Download Success', description: 'Your Ultra-HD passport photo has been saved.' });
    };

    const handleReset = () => {
        setImgSrc(null);
        setOriginalCroppedData(null);
        setSubjectImageSrc(null);
        faceImgRef.current = null;
        setStage('size');
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    if (!imgSrc) {
        return (
            <Card className="w-full max-w-2xl border-2 border-primary/20 shadow-2xl animate-in fade-in duration-500 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b p-8 text-center">
                    <div className="mx-auto mb-4 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary shadow-inner">
                        <UserCircle className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-black font-headline uppercase tracking-tighter">PROFESSIONAL PASSPORT PHOTO STUDIO</CardTitle>
                    <CardDescription className="text-base font-bold">100% Secure Local AI Studio. No server uploads.</CardDescription>
                </CardHeader>
                <CardContent className="p-12 space-y-10">
                    <div className="max-w-xs mx-auto space-y-4">
                        <Label className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                           <Settings2 className="size-3" /> 1. Select Country Standard
                        </Label>
                        <Select value={String(selectedPreset)} onValueChange={(v) => setSelectedPreset(Number(v))}>
                            <SelectTrigger className="h-14 font-black text-sm border-2 rounded-2xl shadow-sm"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl border-2">
                                {PRESETS.map((p, i) => (
                                    <SelectItem key={i} value={String(i)} className="font-bold">{p.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border-3 border-dashed border-primary/20 rounded-[2.5rem] p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-primary/5 transition-all group relative overflow-hidden" 
                         onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div className="text-center">
                            <p className="text-xl font-black uppercase tracking-tight">2. Upload Face Photo</p>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">JPEG, PNG or WEBP (Max 10MB)</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                </CardContent>
                <CardFooter className="justify-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-widest py-6 bg-muted/20 border-t">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> AES SECURE</div>
                    <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT AI</div>
                    <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-primary" /> HD 300DPI</div>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-7xl px-4 py-8 animate-in fade-in duration-500">
            {/* Stage Stepper */}
            <div className="flex justify-center items-center gap-2 mb-10 bg-muted/40 p-1.5 rounded-2xl border-2 overflow-x-auto no-scrollbar shadow-inner max-w-3xl mx-auto">
                {(['size', 'crop', 'background', 'studio'] as Stage[]).map((s, i) => (
                    <button 
                        key={s} 
                        disabled={!originalCroppedData && i > 1}
                        onClick={() => originalCroppedData && setStage(s)} 
                        className={cn(
                            "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                            stage === s ? "bg-primary text-white shadow-lg scale-105" : "bg-transparent text-muted-foreground hover:text-primary disabled:opacity-30"
                        )}
                    >
                        <span className="opacity-50">{i + 1}.</span> {s}
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Main Preview Container */}
                <div className="lg:col-span-8 flex flex-col items-center gap-8">
                    <Card className="relative bg-white shadow-2xl border-4 border-white rounded-[3rem] overflow-hidden flex items-center justify-center min-h-[500px] w-full max-w-[450px]">
                        {stage === 'crop' ? (
                            <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={getAspectRatio()} className="w-full h-full">
                                <img ref={imgRef} src={imgSrc} alt="source" className="max-h-[65vh] w-full object-contain" onLoad={(e) => {
                                    const { width, height } = e.currentTarget;
                                    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 80 }, getAspectRatio(), width, height), width, height));
                                }} />
                            </ReactCrop>
                        ) : (
                            <div className="relative group p-8">
                                <canvas ref={mainCanvasRef} className="max-w-full h-auto shadow-2xl rounded-sm border" />
                                {isProcessing && (
                                    <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-12 gap-8 z-20">
                                        <div className="relative">
                                            <Loader2 className="size-20 animate-spin text-primary stroke-[3]" />
                                            <Eraser className="absolute inset-0 m-auto size-8 text-primary animate-pulse" />
                                        </div>
                                        <div className="w-full max-w-[250px] space-y-4">
                                            <div className="space-y-1 text-center">
                                                <p className="font-black text-2xl text-primary uppercase tracking-tighter animate-pulse">Removing Background</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{progress}% Complete</p>
                                            </div>
                                            <Progress value={progress} className="h-2 shadow-inner" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {stage === 'studio' && (
                        <div className="flex bg-white dark:bg-slate-900 p-4 rounded-[2rem] border-2 gap-4 shadow-xl items-center flex-wrap justify-center animate-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-2 px-4 border-r">
                                <Button variant="outline" size="icon" className="size-10 rounded-xl" onClick={() => setScale(s => s + 5)}><ZoomIn className="size-5"/></Button>
                                <Button variant="outline" size="icon" className="size-10 rounded-xl" onClick={() => setScale(s => s - 5)}><ZoomOut className="size-5"/></Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="icon" className="size-10 rounded-xl" onClick={() => setPosX(p => p - 2)}><ChevronLeft className="size-5"/></Button>
                                <Button variant="outline" size="icon" className="size-10 rounded-xl" onClick={() => setPosX(p => p + 2)}><ChevronRight className="size-5"/></Button>
                                <Button variant="outline" size="icon" className="size-10 rounded-xl" onClick={() => setPosY(p => p - 2)}><ChevronUp className="size-5"/></Button>
                                <Button variant="outline" size="icon" className="size-10 rounded-xl" onClick={() => setPosY(p => p + 2)}><ChevronDown className="size-5"/></Button>
                            </div>
                            <div className="w-px h-10 bg-border mx-2" />
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="icon" className="size-12 rounded-xl text-destructive hover:bg-destructive/5" onClick={() => { setPosX(0); setPosY(0); setScale(100); setRotation(0); setBorderWidth([0]); }}>
                                    <RefreshCcw className="size-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Controls Area */}
                <div className="lg:col-span-4 w-full">
                    <Card className="border-2 border-primary/10 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950">
                        <CardHeader className="bg-primary/5 border-b py-6">
                            <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                                <Settings2 className="size-6 text-primary" /> Studio Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {stage === 'crop' && (
                                <div className="space-y-6">
                                    <div className="p-5 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 text-center">
                                        <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                                            Align your face in the center of the frame. Ensure both ears are visible if possible.
                                        </p>
                                    </div>
                                    <Button className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl" onClick={handleInitialCrop}>
                                        CONFIRM CROP <ChevronRight className="ml-2 size-5" />
                                    </Button>
                                </div>
                            )}

                            {stage === 'background' && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Optional Action</Label>
                                        <Button className="w-full h-16 font-black bg-primary text-lg rounded-2xl group overflow-hidden relative shadow-2xl" onClick={handleRemoveBackground} disabled={isProcessing}>
                                            <span className="relative z-10 flex items-center justify-center gap-3">
                                                {isProcessing ? <Loader2 className="size-6 animate-spin" /> : <Zap className="size-6 text-yellow-400 fill-yellow-400" />}
                                                AI REMOVE BACKGROUND
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-accent animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Button>
                                    </div>
                                    <div className="p-4 bg-muted/20 rounded-xl">
                                        <p className="text-[10px] font-medium text-muted-foreground text-center">
                                            Use our neural engine to extract your face from the background for a cleaner result.
                                        </p>
                                    </div>
                                    <Button variant="outline" className="w-full h-12 font-black text-xs uppercase border-2 rounded-xl" onClick={() => setStage('studio')}>
                                        SKIP TO STUDIO <ChevronRight className="ml-2 size-4" />
                                    </Button>
                                </div>
                            )}

                            {stage === 'studio' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <Tabs defaultValue="adjust" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted p-1 rounded-xl">
                                            <TabsTrigger value="adjust" className="font-bold text-[10px] uppercase">Rotate & Color</TabsTrigger>
                                            <TabsTrigger value="border" className="font-bold text-[10px] uppercase">Add Border</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="adjust" className="pt-6 space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2">
                                                        <RotateCw className="size-3" /> Straighten Face
                                                    </Label>
                                                    <Badge variant="secondary" className="font-mono text-[10px]">{rotation}°</Badge>
                                                </div>
                                                <Slider min={-180} max={180} step={0.5} value={[rotation]} onValueChange={(v) => setRotation(v[0])} />
                                            </div>

                                            <div className="space-y-4 pt-4 border-t">
                                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Palette className="size-3"/> Background Color</Label>
                                                <div className="grid grid-cols-6 gap-3">
                                                    {COLORS.map(c => (
                                                        <button 
                                                            key={c.value} 
                                                            onClick={() => setBgColor(c.value)} 
                                                            className={cn(
                                                                "size-10 rounded-xl border-2 transition-all shadow-sm ring-offset-2", 
                                                                bgColor === c.value ? "border-primary ring-2 ring-primary/10 scale-110" : "border-muted hover:scale-105"
                                                            )} 
                                                            style={{ backgroundColor: c.value }} 
                                                            title={c.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="border" className="pt-6 space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2">
                                                        <Square className="size-3" /> Border Thickness
                                                    </Label>
                                                    <Badge variant="secondary" className="font-mono text-[10px]">{borderWidth[0]}%</Badge>
                                                </div>
                                                <Slider min={0} max={8} step={0.1} value={borderWidth} onValueChange={setBorderWidth} />
                                            </div>
                                            <div className="space-y-4 pt-4 border-t">
                                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Border Color</Label>
                                                <div className="grid grid-cols-5 gap-3">
                                                    {BORDER_COLORS.map(c => (
                                                        <button 
                                                            key={c.value} 
                                                            onClick={() => setBorderColor(c.value)} 
                                                            className={cn(
                                                                "size-10 rounded-xl border-2 transition-all shadow-sm", 
                                                                borderColor === c.value ? "border-primary ring-2 ring-primary/10 scale-110" : "border-muted hover:scale-105"
                                                            )} 
                                                            style={{ backgroundColor: c.value === 'transparent' ? '#fff' : c.value }} 
                                                            title={c.name}
                                                        >
                                                            {c.value === 'transparent' && <X className="size-4 text-muted-foreground mx-auto" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <div className="p-5 bg-green-500/5 rounded-2xl border-2 border-green-500/10 flex gap-4">
                                        <ShieldCheck className="size-6 text-green-600 shrink-0" />
                                        <p className="text-[10px] text-green-800 font-bold leading-relaxed">
                                            <span className="font-black uppercase block mb-0.5 text-green-700">Studio Quality Active:</span>
                                            Pixels are rendered at **300 DPI (Ultra-HD)**. Ready for high-quality glossy photo prints.
                                        </p>
                                    </div>

                                    <Button className="w-full h-18 text-xl font-black bg-green-600 hover:bg-green-700 shadow-2xl rounded-2xl transition-all active:scale-95 group" onClick={handleDownload}>
                                        <Download className="mr-3 size-7 group-hover:translate-y-1 transition-transform" /> DOWNLOAD HD PHOTO
                                    </Button>
                                </div>
                            )}

                            <Button variant="ghost" className="w-full font-black h-10 text-[10px] uppercase text-muted-foreground hover:bg-destructive/5 hover:text-destructive" onClick={handleReset}>
                                <RefreshCcw className="mr-2 size-3" /> START OVER / CHANGE PHOTO
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
