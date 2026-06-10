
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCodeStyling, { 
    type Options, 
    type DrawType, 
    type TypeNumber, 
    type Mode, 
    type ErrorCorrectionLevel,
    type DotType,
    type CornerSquareType,
    type CornerDotType
} from 'qr-code-styling';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
    QrCode, 
    Download, 
    RefreshCcw, 
    Settings2, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    Eye, 
    CheckCircle2, 
    Type, 
    Maximize, 
    Layers, 
    Trash2, 
    Plus, 
    Search,
    X,
    LayoutGrid,
    Printer,
    Monitor,
    Copy,
    AlertCircle,
    Info,
    Smartphone,
    FileDigit,
    ArrowDownToLine,
    Archive,
    ImageIcon,
    Globe,
    Wifi,
    Mail,
    Phone,
    MessageSquare,
    MapPin,
    Calendar,
    Share2,
    Palette,
    History,
    FileSpreadsheet,
    Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import confetti from 'canvas-confetti';

type QRType = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms' | 'whatsapp' | 'vcard' | 'location';

const DOT_TYPES: { id: DotType, label: string }[] = [
    { id: 'square', label: 'Square' },
    { id: 'rounded', label: 'Rounded' },
    { id: 'dots', label: 'Dots' },
    { id: 'classy', label: 'Classy' },
    { id: 'classy-rounded', label: 'Classy Rounded' },
    { id: 'extra-rounded', label: 'Extra Rounded' },
];

const CORNER_SQUARE_TYPES: { id: CornerSquareType, label: string }[] = [
    { id: 'square', label: 'Square' },
    { id: 'dot', label: 'Dot' },
    { id: 'extra-rounded', label: 'Extra Rounded' },
];

const CORNER_DOT_TYPES: { id: CornerDotType, label: string }[] = [
    { id: 'square', label: 'Square' },
    { id: 'dot', label: 'Dot' },
];

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

export default function QrCodeGenerator() {
    const { toast } = useToast();
    const [qrType, setQrType] = useState<QRType>('url');
    const [inputData, setInputData] = useState("https://www.gr7imagepdf.com");
    const [isProcessing, setIsProcessing] = useState(false);
    
    // QR Styling Options
    const [options, setOptions] = useState<Options>({
        width: 300,
        height: 300,
        type: 'svg' as DrawType,
        data: inputData,
        image: undefined,
        margin: 10,
        qrOptions: {
            typeNumber: 0 as TypeNumber,
            mode: 'Byte' as Mode,
            errorCorrectionLevel: 'Q' as ErrorCorrectionLevel
        },
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.4,
            margin: 5,
            crossOrigin: 'anonymous',
        },
        dotsOptions: {
            color: "#000000",
            type: "rounded" as DotType
        },
        backgroundOptions: {
            color: "#ffffff",
        },
        cornersSquareOptions: {
            color: "#000000",
            type: "extra-rounded" as CornerSquareType
        },
        cornersDotOptions: {
            color: "#000000",
            type: "dot" as CornerDotType
        }
    });

    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [history, setHistory] = useState<{ id: string, data: string, date: string, type: QRType }[]>([]);
    
    const qrContainerRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<QRCodeStyling | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Initialize QR Code engine
    useEffect(() => {
        if (typeof window !== 'undefined') {
            qrCodeRef.current = new QRCodeStyling(options);
            if (qrContainerRef.current) {
                qrCodeRef.current.append(qrContainerRef.current);
            }
        }
    }, []);

    // Update QR Code when options change
    useEffect(() => {
        if (qrCodeRef.current) {
            qrCodeRef.current.update({
                ...options,
                data: inputData
            });
        }
    }, [options, inputData]);

    const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const src = event.target?.result as string;
                setLogoUrl(src);
                setOptions(prev => ({
                    ...prev,
                    image: src
                }));
                toast({ title: "Logo Uploaded", description: "Positioned at center of QR code." });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async (ext: 'png' | 'svg' | 'jpeg' | 'webp' | 'pdf') => {
        if (!qrCodeRef.current) return;
        setIsProcessing(true);
        try {
            if (ext === 'pdf') {
                const blob = await qrCodeRef.current.getRawData('png');
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                    pdf.addImage(url, 'PNG', 10, 10, 190, 190);
                    pdf.save(`GR7-QR-${Date.now()}.pdf`);
                    URL.revokeObjectURL(url);
                }
            } else {
                await qrCodeRef.current.download({
                    name: `GR7-QR-${Date.now()}`,
                    extension: ext
                });
            }
            
            // Save to history
            const newHistoryItem = {
                id: Math.random().toString(36).substr(2, 9),
                data: inputData,
                date: new Date().toLocaleTimeString(),
                type: qrType
            };
            setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
            
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Download Successful", description: `File saved as ${ext.toUpperCase()}.` });
        } catch (e) {
            toast({ variant: 'destructive', title: "Export Error" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrint = () => {
        if (!qrContainerRef.current) return;
        const win = window.open('', '_blank');
        if (win) {
            const svg = qrContainerRef.current.innerHTML;
            win.document.write(`<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;">${svg}</body></html>`);
            win.document.close();
            win.focus();
            setTimeout(() => { win.print(); win.close(); }, 500);
        }
    };

    const handleReset = () => {
        setInputData("https://www.gr7imagepdf.com");
        setLogoUrl(null);
        setOptions(prev => ({
            ...prev,
            image: undefined,
            dotsOptions: { color: "#000000", type: "rounded" },
            backgroundOptions: { color: "#ffffff" },
            cornersSquareOptions: { color: "#000000", type: "extra-rounded" },
            cornersDotOptions: { color: "#000000", type: "dot" }
        }));
    };

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6 pb-20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                        <Settings2 className="size-5 md:size-6" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter">Studio <span className="text-primary">Panel</span></h2>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-11 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive">
                        <RefreshCcw className="mr-1.5 size-3 md:size-4" /> Reset Design
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Main Viewport */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                        <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-primary" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Studio Viewport</CardTitle>
                            </div>
                            <Badge className="bg-green-500 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-md">REAL-TIME SYNC</Badge>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[450px] flex items-center justify-center relative select-none">
                            <div className="flex flex-col items-center gap-10 w-full">
                                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-[0_35px_80px_-15px_rgba(0,0,0,0.3)] border-4 border-white flex items-center justify-center relative group overflow-hidden">
                                    <div ref={qrContainerRef} className="transition-transform group-hover:scale-[1.02] duration-500" />
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-3 no-print">
                                    <Button variant="outline" className="h-10 border-2 rounded-xl font-black text-[9px] uppercase px-4 hover:border-primary transition-all" onClick={() => handleDownload('png')}><ImageIcon className="size-3.5 mr-1.5" /> PNG</Button>
                                    <Button variant="outline" className="h-10 border-2 rounded-xl font-black text-[9px] uppercase px-4 hover:border-primary transition-all" onClick={() => handleDownload('svg')}><LayoutGrid className="size-3.5 mr-1.5" /> SVG</Button>
                                    <Button variant="outline" className="h-10 border-2 rounded-xl font-black text-[9px] uppercase px-4 hover:border-primary transition-all" onClick={() => handleDownload('pdf')}><FileDigit className="size-3.5 mr-1.5" /> PDF</Button>
                                    <Separator orientation="vertical" className="h-6 opacity-20 mx-2" />
                                    <Button className="h-10 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase shadow-lg hover:scale-105 transition-all" onClick={handlePrint}><Printer className="size-3.5 mr-1.5" /> PRINT</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {history.length > 0 && (
                        <Card className="border-2 shadow-xl bg-card/40 rounded-[2rem] overflow-hidden no-print">
                            <CardHeader className="p-4 bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <History className="size-3 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Session History</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <ScrollArea className="w-full whitespace-nowrap">
                                    <div className="flex gap-4 pb-4 px-1">
                                        {history.map((item) => (
                                            <div 
                                                key={item.id} 
                                                onClick={() => setInputData(item.data)}
                                                className="inline-flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border-2 rounded-2xl shadow-sm hover:border-primary/40 cursor-pointer active:scale-95 transition-all min-w-[180px]"
                                            >
                                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"><QrCode className="size-4" /></div>
                                                <div className="truncate flex-1">
                                                    <p className="text-[10px] font-black uppercase truncate">{item.data}</p>
                                                    <p className="text-[8px] font-bold opacity-40 uppercase">{item.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar: Config */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[3rem]">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                <Palette className="size-4 md:size-5 text-primary" /> Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8">
                            <Tabs value={qrType} onValueChange={(v) => setQrType(v as QRType)} className="w-full">
                                <ScrollArea className="w-full whitespace-nowrap mb-6">
                                    <TabsList className="flex h-auto w-max p-1.5 bg-muted/40 rounded-2xl border-2">
                                        <TabsTrigger value="url" className="text-[9px] font-black px-4"><Globe className="size-3 mr-1.5" /> URL</TabsTrigger>
                                        <TabsTrigger value="text" className="text-[9px] font-black px-4"><Type className="size-3 mr-1.5" /> TEXT</TabsTrigger>
                                        <TabsTrigger value="wifi" className="text-[9px] font-black px-4"><Wifi className="size-3 mr-1.5" /> WIFI</TabsTrigger>
                                        <TabsTrigger value="whatsapp" className="text-[9px] font-black px-4"><MessageSquare className="size-3 mr-1.5" /> WHATSAPP</TabsTrigger>
                                        <TabsTrigger value="email" className="text-[9px] font-black px-4"><Mail className="size-3 mr-1.5" /> EMAIL</TabsTrigger>
                                    </TabsList>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>

                                <div className="space-y-6">
                                    <TabsContent value="url" className="space-y-4 m-0">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Website URL</Label>
                                            <Input 
                                                value={inputData} 
                                                onChange={(e) => setInputData(e.target.value)}
                                                className="h-12 border-2 rounded-xl bg-background/50 font-bold"
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="text" className="space-y-4 m-0">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plain Text</Label>
                                            <Textarea 
                                                value={inputData} 
                                                onChange={(e) => setInputData(e.target.value)}
                                                className="min-h-[100px] border-2 rounded-xl bg-background/50 font-bold"
                                                placeholder="Enter text data..."
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* Design Options Area */}
                                    <div className="space-y-8 pt-6 border-t border-dashed">
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                    <LayoutGrid className="size-3" /> Dot Pattern
                                                </Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {DOT_TYPES.map(d => (
                                                        <button 
                                                            key={d.id}
                                                            className={cn(
                                                                "btn-pos-uiverse h-10",
                                                                options.dotsOptions?.type === d.id && "active-uiverse"
                                                            )}
                                                            onClick={() => setOptions(prev => ({ ...prev, dotsOptions: { ...prev.dotsOptions, type: d.id } }))}
                                                            data-label={d.label}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-black uppercase opacity-60">Foreground</Label>
                                                    <div className="flex gap-2 items-center">
                                                        <input 
                                                            type="color" 
                                                            value={options.dotsOptions?.color} 
                                                            onChange={(e) => setOptions(prev => ({ ...prev, dotsOptions: { ...prev.dotsOptions, color: e.target.value }, cornersSquareOptions: { ...prev.cornersSquareOptions, color: e.target.value }, cornersDotOptions: { ...prev.cornersDotOptions, color: e.target.value } }))}
                                                            className="size-10 p-1 rounded-lg border-2 cursor-pointer bg-white"
                                                        />
                                                        <span className="text-[10px] font-mono font-bold uppercase">{options.dotsOptions?.color}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-black uppercase opacity-60">Background</Label>
                                                    <div className="flex gap-2 items-center">
                                                        <input 
                                                            type="color" 
                                                            value={options.backgroundOptions?.color} 
                                                            onChange={(e) => setOptions(prev => ({ ...prev, backgroundOptions: { ...prev.backgroundOptions, color: e.target.value } }))}
                                                            className="size-10 p-1 rounded-lg border-2 cursor-pointer bg-white"
                                                        />
                                                        <span className="text-[10px] font-mono font-bold uppercase">{options.backgroundOptions?.color}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-dashed">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                    <ImageIcon className="size-3" /> Brand Logo
                                                </Label>
                                                <div className="flex flex-col gap-3">
                                                    <Button variant="outline" className="h-12 border-2 border-dashed rounded-xl font-black text-[10px] uppercase group" onClick={() => logoInputRef.current?.click()}>
                                                        <Plus className="size-4 mr-2 group-hover:scale-125 transition-transform" /> {logoUrl ? "CHANGE LOGO" : "UPLOAD CENTER LOGO"}
                                                    </Button>
                                                    <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                                    {logoUrl && (
                                                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                                                            <div className="flex items-center gap-3">
                                                                <img src={logoUrl} className="size-8 rounded-md object-contain border bg-white" alt="logo" />
                                                                <span className="text-[9px] font-black uppercase opacity-60">Embedded</span>
                                                            </div>
                                                            <Button size="icon" variant="ghost" className="size-7 rounded-full text-destructive" onClick={() => { setLogoUrl(null); setOptions(prev => ({ ...prev, image: undefined })); }}><Trash2 className="size-3.5" /></Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-white/10 flex flex-col gap-4">
                            <Button 
                                className="magic-button w-full h-18 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 group flex items-center justify-center gap-4"
                                onClick={() => handleDownload('png')}
                                disabled={isProcessing}
                            >
                                <StarIcons />
                                <Download className="size-8 text-white group-hover:translate-y-1 transition-transform" />
                                <span className="uppercase tracking-tighter text-xl font-black">GENERATE HD QR</span>
                            </Button>
                            
                            <div className="flex items-center justify-center gap-8 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
                                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                                <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT SYNC</div>
                                <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-primary" /> BRAND READY</div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
