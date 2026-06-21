
"use client";

import React, { useState, useMemo, useRef, type ChangeEvent } from 'react';
import { 
    Palette, 
    Copy, 
    CheckCircle2, 
    RefreshCcw, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    Eye, 
    LayoutGrid, 
    Droplets,
    Wand2,
    Settings2,
    Contrast,
    FileDigit,
    Pipette,
    History,
    ArrowLeftRight,
    Layers,
    Share2,
    Check,
    UploadCloud,
    ImageIcon,
    X,
    MousePointer2,
    Maximize
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * COLOR CONVERSION UTILS
 */

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const rgbToCmyk = (r: number, g: number, b: number) => {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);
    
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    
    c = Math.round(((c - k) / (1 - k)) * 100);
    m = Math.round(((m - k) / (1 - k)) * 100);
    y = Math.round(((y - k) / (1 - k)) * 100);
    k = Math.round(k * 100);
    
    return { c, m, y, k };
};

const calculateContrast = (r: number, g: number, b: number) => {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    const luminance = 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    const whiteContrast = (1.0 + 0.05) / (luminance + 0.05);
    const blackContrast = (luminance + 0.05) / (0.0 + 0.05);
    return { white: whiteContrast, black: blackContrast };
};

const generateShades = (hex: string) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const shades = [];
    for (let i = 1; i <= 10; i++) {
        const l = Math.max(0, Math.min(100, i * 10));
        const sRgb = hslToRgb(hsl.h, hsl.s, l);
        shades.push(rgbToHex(sRgb.r, sRgb.g, sRgb.b));
    }
    return shades;
};

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i}`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

export default function ColorPicker() {
    const { toast } = useToast();
    const [color, setColor] = useState("#3B82F6");
    const [history, setHistory] = useState<string[]>([]);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    
    // Sampler State
    const [samplerImage, setSamplerImage] = useState<string | null>(null);
    const samplerCanvasRef = useRef<HTMLCanvasElement>(null);
    const samplerImgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const rgb = useMemo(() => hexToRgb(color), [color]);
    const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
    const cmyk = useMemo(() => rgbToCmyk(rgb.r, rgb.g, rgb.b), [rgb]);
    const contrast = useMemo(() => calculateContrast(rgb.r, rgb.g, rgb.b), [rgb]);
    const shades = useMemo(() => generateShades(color), [color]);

    const palette = useMemo(() => {
        const compRgb = hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l);
        const analogous1 = hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l);
        const analogous2 = hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l);
        const triadic1 = hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l);
        const triadic2 = hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l);
        
        return {
            complementary: rgbToHex(compRgb.r, compRgb.g, compRgb.b),
            analogous: [rgbToHex(analogous1.r, analogous1.g, analogous1.b), rgbToHex(analogous2.r, analogous2.g, analogous2.b)],
            triadic: [rgbToHex(triadic1.r, triadic1.g, triadic1.b), rgbToHex(triadic2.r, triadic2.g, triadic2.b)]
        };
    }, [hsl]);

    const addToHistory = (hex: string) => {
        setHistory(prev => [hex, ...prev.filter(c => c !== hex)].slice(0, 12));
    };

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast({ title: "Copied!", description: `${text} copied to clipboard.` });
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleEyeDropper = async () => {
        if (!window.EyeDropper) {
            toast({ variant: 'destructive', title: "Not Supported", description: "Your browser doesn't support the Eyedropper API." });
            return;
        }
        const dropper = new (window as any).EyeDropper();
        try {
            const result = await dropper.open();
            const hex = result.sRGBHex.toUpperCase();
            setColor(hex);
            addToHistory(hex);
        } catch (e) {}
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSamplerImage(event.target?.result as string);
                toast({ title: "Image Loaded", description: "Click anywhere on image to pick color." });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSamplerClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const rect = container.getBoundingClientRect();
        const img = samplerImgRef.current;
        if (!img) return;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x_css = clientX - rect.left;
        const y_css = clientY - rect.top;

        const scaleX = img.naturalWidth / rect.width;
        const scaleY = img.naturalHeight / rect.height;
        const x = Math.floor(x_css * scaleX);
        const y = Math.floor(y_css * scaleY);

        const canvas = samplerCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
        
        setColor(hex);
        addToHistory(hex);
    };

    const dropperCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m2 22 1-1h3l9-9'/%3E%3Cpath d='M3 21v-3l9-9'/%3E%3Cpath d='m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l-3-3Z'/%3E%3Ccircle cx='4' cy='20' r='1' fill='white'/%3E%3C/svg%3E") 0 32, crosshair`;

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6 pb-20 mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                        <Palette className="size-5 md:size-6" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-none">Color <span className="text-primary">Studio</span></h2>
                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1 text-left">AI Palette & Image Sampler</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {samplerImage && (
                        <Button variant="outline" onClick={() => setSamplerImage(null)} className="flex-1 md:flex-none h-11 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5">
                            <X className="mr-1.5 size-3 md:size-4" /> Clear Image
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => { setColor("#3B82F6"); setHistory([]); }} className="flex-1 md:flex-none h-11 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5">
                        <RefreshCcw className="mr-1.5 size-3 md:size-4" /> Reset
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 flex flex-col gap-6 h-full">
                    <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                        <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                {samplerImage ? <ImageIcon className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-primary" />}
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    {samplerImage ? "Image Sampler Mode" : "Studio Viewport"}
                                </CardTitle>
                            </div>
                            <Badge className="bg-primary text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-md">HD RENDERING</Badge>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[450px] md:min-h-[600px] flex flex-col items-center justify-center relative select-none overflow-hidden">
                            <AnimatePresence mode="wait">
                                {samplerImage ? (
                                    <motion.div 
                                        key="sampler"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="relative w-full h-full flex flex-col overflow-hidden"
                                    >
                                        <ScrollArea className="flex-1 w-full h-full p-4 md:p-12">
                                            <div className="flex justify-center min-h-full items-center p-4">
                                                <div 
                                                    className="relative max-w-full rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white transform-gpu"
                                                    onMouseDown={handleSamplerClick}
                                                    onTouchStart={handleSamplerClick}
                                                    style={{ cursor: dropperCursor, touchAction: 'none' }}
                                                >
                                                    <img 
                                                        ref={samplerImgRef} 
                                                        src={samplerImage} 
                                                        alt="sampler" 
                                                        className="max-w-full h-auto block pointer-events-none" 
                                                    />
                                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                </div>
                                            </div>
                                            <ScrollBar orientation="horizontal" />
                                            <ScrollBar orientation="vertical" />
                                        </ScrollArea>
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 bg-black/80 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-3xl z-40 whitespace-nowrap">
                                             <Pipette className="size-3.5 text-primary animate-pulse" /> CLICK ANYWHERE ON IMAGE TO PICK COLOR
                                        </div>
                                        <canvas ref={samplerCanvasRef} className="hidden" />
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="swatch"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-full max-w-md flex flex-col gap-10 p-6"
                                    >
                                        <div 
                                            className="w-full aspect-video rounded-[3rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.3)] border-8 border-white flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500"
                                            style={{ backgroundColor: color }}
                                        >
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <p className="text-4xl md:text-6xl font-black tracking-tighter drop-shadow-2xl" style={{ color: contrast.black > contrast.white ? '#000' : '#fff' }}>
                                                {color}
                                            </p>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40"
                                                onClick={() => handleCopy(color, 'main')}
                                            >
                                                {copiedKey === 'main' ? <CheckCircle2 className="size-5" /> : <Copy className="size-5" />}
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormatInput label="HEX" value={color} onCopy={() => handleCopy(color, 'hex')} />
                                            <FormatInput label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} onCopy={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')} />
                                            <FormatInput label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} onCopy={() => handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')} />
                                            <FormatInput label="CMYK" value={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`} onCopy={() => handleCopy(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`, 'cmyk')} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    <Card className="border-2 shadow-xl bg-card/40 rounded-[2rem] overflow-hidden no-print shrink-0">
                        <CardHeader className="p-4 bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <History className="size-3 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Recent Swatches</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <ScrollArea className="w-full whitespace-nowrap">
                                <div className="flex gap-4 pb-2 px-1">
                                    {history.length === 0 ? (
                                        <p className="text-[9px] font-black uppercase opacity-20 py-2">History is empty...</p>
                                    ) : history.map((c, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => setColor(c)}
                                            className="group relative size-12 rounded-xl border-2 border-white shadow-md transition-all hover:scale-110 active:scale-95"
                                            style={{ backgroundColor: c }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Eye className="size-4 text-white drop-shadow-md" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[3rem]">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary text-left">
                                <Settings2 className="size-4 md:size-5 text-primary" /> Studio Config
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-10">
                            
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Pick Mode</Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-2 rounded-2xl shadow-inner group">
                                            <input 
                                                type="color" 
                                                value={color} 
                                                onChange={(e) => { setColor(e.target.value.toUpperCase()); addToHistory(e.target.value.toUpperCase()); }}
                                                className="size-14 rounded-xl cursor-pointer border-none bg-transparent"
                                            />
                                            <div className="flex-1 text-left">
                                                <p className="text-[10px] font-black uppercase">Spectrum Wheel</p>
                                                <p className="text-[8px] font-bold opacity-40 uppercase">Native OS Tool</p>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                className="h-10 border-2 rounded-xl font-black text-[9px] uppercase group-hover:border-primary"
                                                onClick={handleEyeDropper}
                                            >
                                                <Pipette className="size-3.5 mr-1.5" /> Eyedropper
                                            </Button>
                                        </div>

                                        <Button 
                                            variant="outline" 
                                            className="w-full h-14 border-2 border-dashed border-primary/20 hover:border-primary rounded-2xl font-black text-xs uppercase group shadow-sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <UploadCloud className="size-5 mr-3 text-primary group-hover:scale-110 transition-transform" />
                                            {samplerImage ? "CHANGE SAMPLER IMAGE" : "UPLOAD IMAGE SAMPLER"}
                                        </Button>
                                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-dashed text-left">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-2">
                                        <Contrast className="size-3" /> Accessibility Check
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <ContrastBadge label="On White" score={contrast.white} />
                                        <ContrastBadge label="On Black" score={contrast.black} />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-dashed text-left">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">AI Smart Palette</Label>
                                    <div className="grid gap-3">
                                        <PaletteRow label="Complementary" colors={[palette.complementary]} onPick={setColor} />
                                        <PaletteRow label="Analogous" colors={palette.analogous} onPick={setColor} />
                                        <PaletteRow label="Triadic" colors={palette.triadic} onPick={setColor} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-white/10 flex flex-col gap-4">
                            <Button 
                                className="magic-button w-full h-16 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 group flex items-center justify-center gap-4"
                                onClick={() => handleCopy(color, 'final')}
                            >
                                <StarIcons />
                                <Copy className="size-8 text-white group-hover:scale-110 transition-transform" />
                                <span className="uppercase tracking-tighter text-xl font-black">COPY HEX CODE</span>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function FormatInput({ label, value, onCopy }: { label: string, value: string, onCopy: () => void }) {
    return (
        <div className="space-y-1.5 text-left">
            <Label className="text-[8px] font-black uppercase opacity-40 ml-1">{label}</Label>
            <div className="relative group">
                <Input value={value} readOnly className="h-10 font-bold bg-white dark:bg-slate-900 border-2 rounded-xl pr-10 text-xs shadow-sm" />
                <button onClick={onCopy} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-all">
                    <Copy className="size-3.5" />
                </button>
            </div>
        </div>
    );
}

function ContrastBadge({ label, score }: { label: string, score: number }) {
    const isPass = score >= 4.5;
    const isLargePass = score >= 3;
    
    return (
        <div className={cn(
            "p-3 rounded-2xl border-2 flex flex-col items-center gap-1 text-center transition-all",
            isPass ? "bg-green-500/5 border-green-500/20" : isLargePass ? "bg-yellow-500/5 border-yellow-500/20" : "bg-red-500/5 border-red-500/20"
        )}>
            <p className="text-[8px] font-black uppercase opacity-60">{label}</p>
            <p className={cn("text-lg font-black tracking-tighter", isPass ? "text-green-600" : isLargePass ? "text-yellow-600" : "text-red-600")}>
                {score.toFixed(2)}
            </p>
            <Badge className={cn(
                "text-[7px] font-black uppercase px-2 py-0 h-4",
                isPass ? "bg-green-600" : isLargePass ? "bg-yellow-600" : "bg-red-600"
            )}>
                {isPass ? 'PASS AAA' : isLargePass ? 'PASS AA' : 'FAIL'}
            </Badge>
        </div>
    );
}

function PaletteRow({ label, colors, onPick }: { label: string, colors: string[], onPick: (c: string) => void }) {
    return (
        <div className="flex items-center justify-between p-3 bg-muted/20 border-2 rounded-2xl shadow-inner group">
            <span className="text-[9px] font-black uppercase opacity-60">{label}</span>
            <div className="flex gap-2">
                {colors.map((c, i) => (
                    <button 
                        key={i} 
                        className="size-8 rounded-lg border-2 border-white shadow-md transition-all hover:scale-125" 
                        style={{ backgroundColor: c }}
                        onClick={() => onPick(c)}
                    />
                ))}
            </div>
        </div>
    );
}
