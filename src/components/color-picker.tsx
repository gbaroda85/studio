"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    ArrowRightLeft,
    Layers,
    Share2,
    Check
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

    const addToHistory = (hex: string) => {
        setHistory(prev => [hex, ...prev.filter(c => c !== hex)].slice(0, 12));
    };

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6 pb-20 mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                        <Palette className="size-5 md:size-6" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter">Color <span className="text-primary">Studio</span></h2>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={() => setColor("#3B82F6")} className="flex-1 md:flex-none h-11 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5">
                        <RefreshCcw className="mr-1.5 size-3 md:size-4" /> Reset
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Viewport: Color Area */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                        <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-primary" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Studio Viewport</CardTitle>
                            </div>
                            <Badge className="bg-primary text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-md">HD RENDERING</Badge>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[450px] flex flex-col items-center justify-center relative select-none">
                            <div className="w-full max-w-md flex flex-col gap-10">
                                {/* Color Block */}
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

                                {/* Inputs Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormatInput label="HEX" value={color} onCopy={() => handleCopy(color, 'hex')} />
                                    <FormatInput label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} onCopy={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')} />
                                    <FormatInput label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} onCopy={() => handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')} />
                                    <FormatInput label="CMYK" value={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`} onCopy={() => handleCopy(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`, 'cmyk')} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* History Strip */}
                    <Card className="border-2 shadow-xl bg-card/40 rounded-[2rem] overflow-hidden no-print">
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

                {/* Sidebar: Config */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[3rem]">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
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
                                                <p className="text-[8px] font-bold opacity-40 uppercase">Open native color system</p>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                className="h-10 border-2 rounded-xl font-black text-[9px] uppercase group-hover:border-primary"
                                                onClick={handleEyeDropper}
                                            >
                                                <Pipette className="size-3.5 mr-1.5" /> Eyedropper
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-dashed text-left">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Contrast className="size-3" /> Accessibility Check
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <ContrastBadge label="On White" score={contrast.white} />
                                        <ContrastBadge label="On Black" score={contrast.black} />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-dashed text-left">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Tints & Shades</Label>
                                    <ScrollArea className="w-full whitespace-nowrap pb-2">
                                        <div className="flex gap-1.5">
                                            {shades.map((s, i) => (
                                                <button 
                                                    key={i} 
                                                    className="size-8 rounded-md border shadow-sm shrink-0 transition-transform hover:scale-125" 
                                                    style={{ backgroundColor: s }}
                                                    onClick={() => setColor(s)}
                                                    title={s}
                                                />
                                            ))}
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
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

                            <div className="p-4 md:p-5 bg-green-500/5 rounded-[1.5rem] border-2 border-green-500/10 flex gap-4 shadow-sm text-left">
                                <ShieldCheck className="size-5 md:size-6 text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] md:text-[11px] font-black text-green-700 uppercase tracking-tight">WCAG 2.1 Compliant</p>
                                    <p className="text-[8px] md:text-[10px] text-green-600/80 font-medium leading-tight mt-1 uppercase">
                                        Contrast ratios are verified locally for web accessibility standards.
                                    </p>
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
                            
                            <div className="flex items-center justify-center gap-8 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
                                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                                <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT SYNC</div>
                                <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-primary" /> DESIGNER PRO</div>
                            </div>
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
                <button onClick={onCopy} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
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
                        title={c}
                    />
                ))}
            </div>
        </div>
    );
}
