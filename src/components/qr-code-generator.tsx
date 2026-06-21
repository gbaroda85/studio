"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCodeStyling, { 
    type DotType,
    type CornerSquareType,
} from 'qr-code-styling';
import jsPDF from 'jspdf';
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
    X,
    LayoutGrid,
    Printer,
    ImageIcon,
    Globe,
    Wifi,
    Mail,
    MessageSquare,
    Palette,
    CreditCard,
    Loader2,
    FileDigit,
    Square,
    AlignJustify
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import confetti from 'canvas-confetti';

type QRType = 'url' | 'text' | 'wifi' | 'email' | 'whatsapp' | 'upi';

const DOT_TYPES: { id: DotType, label: string }[] = [
    { id: 'square', label: 'Square' },
    { id: 'rounded', label: 'Rounded' },
    { id: 'dots', label: 'Dots' },
    { id: 'classy', label: 'Classy' },
    { id: 'classy-rounded', label: 'Classy Rounded' },
    { id: 'extra-rounded', label: 'Extra Rounded' },
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
    
    // Type-specific states
    const [wifiData, setWifiData] = useState({ ssid: '', password: '', encryption: 'WPA' });
    const [whatsappData, setWhatsappData] = useState({ phone: '', message: '' });
    const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });
    const [upiData, setUpiData] = useState({ pa: '', pn: '', am: '', tn: '', cu: 'INR' });

    // Design states
    const [dotColor, setDotColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [dotType, setDotType] = useState<DotType>("rounded");
    const [cornerType, setCornerType] = useState<CornerSquareType>("extra-rounded");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    // New: Border and Label
    const [borderWidth, setBorderWidth] = useState([0]);
    const [borderColor, setBorderColor] = useState("#000000");
    const [showLabel, setShowLabel] = useState(false);
    const [customLabel, setCustomLabel] = useState("");

    const qrContainerRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<QRCodeStyling | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // --- REFINED DATA LOGIC ---
    const finalData = useMemo(() => {
        if (qrType === 'url') return inputData;
        if (qrType === 'text') return inputData;
        if (qrType === 'wifi') return `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};;`;
        if (qrType === 'whatsapp') return `https://wa.me/${whatsappData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappData.message)}`;
        if (qrType === 'email') return `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        if (qrType === 'upi') {
            let upi = `upi://pay?pa=${upiData.pa}`;
            if (upiData.pn) upi += `&pn=${encodeURIComponent(upiData.pn)}`;
            if (upiData.am) upi += `&am=${upiData.am}`;
            if (upiData.cu) upi += `&cu=${upiData.cu}`;
            if (upiData.tn) upi += `&tn=${encodeURIComponent(upiData.tn)}`;
            return upi;
        }
        return inputData;
    }, [inputData, qrType, wifiData, whatsappData, emailData, upiData]);

    const activeLabel = customLabel || (qrType === 'url' ? inputData.replace(/^https?:\/\//i, '') : inputData.substring(0, 20));

    // --- ZERO-BLINK ENGINE ---
    const updateQR = useCallback(() => {
        if (!qrCodeRef.current) return;

        requestAnimationFrame(() => {
            qrCodeRef.current?.update({
                data: finalData || " ",
                image: logoUrl || undefined,
                dotsOptions: { color: dotColor, type: dotType },
                backgroundOptions: { color: bgColor },
                cornersSquareOptions: { color: dotColor, type: cornerType },
                cornersDotOptions: { color: dotColor, type: 'dot' },
                margin: 10,
                imageOptions: { 
                    hideBackgroundDots: true, 
                    imageSize: 0.4, 
                    margin: 5,
                    crossOrigin: 'anonymous'
                }
            });
        });
    }, [finalData, logoUrl, dotColor, bgColor, dotType, cornerType]);

    useEffect(() => {
        if (typeof window !== 'undefined' && !qrCodeRef.current) {
            qrCodeRef.current = new QRCodeStyling({
                width: 600, // High-res internal
                height: 600,
                type: 'svg',
                dotsOptions: { type: 'rounded', color: '#000000' },
                backgroundOptions: { color: '#ffffff' }
            });
            if (qrContainerRef.current) {
                qrContainerRef.current.innerHTML = "";
                qrCodeRef.current.append(qrContainerRef.current);
            }
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(updateQR, 50);
        return () => clearTimeout(timer);
    }, [updateQR]);

    const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setLogoUrl(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    /**
     * COMPOSITE DOWNLOAD ENGINE
     * Merges QR + Border + Label into one high-quality canvas
     */
    const getCompositeCanvas = async (): Promise<HTMLCanvasElement | null> => {
        if (!qrCodeRef.current) return null;
        
        const blob = await qrCodeRef.current.getRawData('png');
        if (!blob) return null;

        const url = URL.createObjectURL(blob);
        const qrImg = new window.Image();
        qrImg.src = url;
        await new Promise(r => qrImg.onload = r);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const baseSize = 800;
        const bWidth = (borderWidth[0] / 100) * baseSize;
        const labelSpace = showLabel ? 60 : 0;
        
        canvas.width = baseSize + (bWidth * 2);
        canvas.height = baseSize + (bWidth * 2) + labelSpace;

        // 1. Draw Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw QR Image
        ctx.drawImage(qrImg, bWidth, bWidth, baseSize, baseSize);

        // 3. Draw Border
        if (bWidth > 0) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = bWidth * 2;
            ctx.strokeRect(0, 0, canvas.width, canvas.height - labelSpace);
        }

        // 4. Draw Label
        if (showLabel && activeLabel) {
            ctx.fillStyle = dotColor;
            ctx.textAlign = 'center';
            ctx.font = `bold 24px Arial`;
            ctx.fillText(activeLabel.toUpperCase(), canvas.width / 2, canvas.height - 25);
        }

        URL.revokeObjectURL(url);
        return canvas;
    };

    const handleDownload = async (ext: 'png' | 'svg' | 'jpeg' | 'pdf') => {
        setIsProcessing(true);
        try {
            const composite = await getCompositeCanvas();
            if (!composite) throw new Error();

            if (ext === 'pdf') {
                const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const imgData = composite.toDataURL('image/jpeg', 1.0);
                pdf.addImage(imgData, 'JPEG', 10, 10, 190, 190);
                pdf.save(`GR7-QR-${Date.now()}.pdf`);
            } else {
                const link = document.createElement('a');
                link.href = composite.toDataURL(`image/${ext}`, 1.0);
                link.download = `GR7-QR-${Date.now()}.${ext}`;
                link.click();
            }
            
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Saved Successfully" });
        } catch (e) {
            toast({ variant: 'destructive', title: "Export Error" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrint = async () => {
        const composite = await getCompositeCanvas();
        if (!composite) return;
        const url = composite.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`<html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;"><img src="${url}" style="max-width:90%;"></body></html>`);
        printWindow.document.close();
        setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
    };

    const handleReset = () => {
        setInputData("https://www.gr7imagepdf.com");
        setLogoUrl(null);
        setDotColor("#000000");
        setBgColor("#ffffff");
        setDotType("rounded");
        setCornerType("extra-rounded");
        setQrType('url');
        setBorderWidth([0]);
        setShowLabel(false);
        setCustomLabel("");
    };

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6 pb-20 mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                        <Settings2 className="size-5 md:size-6" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-none">Studio <span className="text-primary">Panel</span></h2>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 mt-1">Industrial High-Speed Engine</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-11 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5 transition-all">
                        <RefreshCcw className="mr-1.5 size-3 md:size-4" /> Reset Design
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                        <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-primary" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Studio Viewport</CardTitle>
                            </div>
                            <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 rounded-full border-2 border-white shadow-md uppercase">RENDER READY</Badge>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[500px] flex flex-col items-center justify-center relative select-none">
                            <div className="flex flex-col items-center gap-10 w-full max-w-lg">
                                
                                {/* DYNAMIC PREVIEW BOX */}
                                <div 
                                    className="p-4 md:p-8 rounded-[2.5rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.4)] border-4 border-white flex flex-col items-center justify-center relative group overflow-hidden transition-all duration-300"
                                    style={{ 
                                        backgroundColor: bgColor, 
                                        border: `${borderWidth[0]}px solid ${borderColor}`,
                                        paddingBottom: showLabel ? '40px' : '30px'
                                    }}
                                >
                                    <div ref={qrContainerRef} className="size-[280px] md:size-[320px] transition-transform group-hover:scale-[1.02] duration-500 flex items-center justify-center" />
                                    
                                    {showLabel && (
                                        <div className="absolute bottom-4 left-0 right-0 text-center animate-in slide-in-from-bottom-2">
                                            <p className="text-[10px] md:text-sm font-black uppercase tracking-widest" style={{ color: dotColor }}>
                                                {activeLabel}
                                            </p>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-3 no-print">
                                    <Button variant="outline" className="h-10 border-2 rounded-xl font-black text-[9px] uppercase px-4 hover:border-primary" onClick={() => handleDownload('png')}><ImageIcon className="size-3.5 mr-1.5" /> PNG</Button>
                                    <Button variant="outline" className="h-10 border-2 rounded-xl font-black text-[9px] uppercase px-4 hover:border-primary" onClick={() => handleDownload('svg')}><LayoutGrid className="size-3.5 mr-1.5" /> SVG</Button>
                                    <Button variant="outline" className="h-10 border-2 rounded-xl font-black text-[9px] uppercase px-4 hover:border-primary" onClick={() => handleDownload('pdf')}><FileDigit className="size-3.5 mr-1.5" /> PDF</Button>
                                    <Separator orientation="vertical" className="h-6 opacity-20 mx-2" />
                                    <Button className="h-10 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase shadow-lg hover:scale-105" onClick={handlePrint}><Printer className="size-3.5 mr-1.5" /> PRINT</Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-white dark:bg-slate-950 border-t p-5 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 shrink-0">
                             <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
                             <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> INSTANT SYNC</div>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[3rem]">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                <Palette className="size-4 md:size-5 text-primary" /> Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8">
                            <Tabs value={qrType} onValueChange={(v) => setQrType(v as QRType)} className="w-full">
                                <ScrollArea className="w-full whitespace-nowrap mb-8">
                                    <TabsList className="flex h-auto w-max p-1.5 bg-muted/40 rounded-2xl border-2">
                                        <TabsTrigger value="url" className="text-[9px] font-black px-4"><Globe className="size-3 mr-1.5" /> URL</TabsTrigger>
                                        <TabsTrigger value="upi" className="text-[9px] font-black px-4 text-emerald-600"><CreditCard className="size-3 mr-1.5" /> PAYMENT</TabsTrigger>
                                        <TabsTrigger value="text" className="text-[9px] font-black px-4"><Type className="size-3 mr-1.5" /> TEXT</TabsTrigger>
                                        <TabsTrigger value="wifi" className="text-[9px] font-black px-4"><MessageSquare className="size-3 mr-1.5" /> WIFI</TabsTrigger>
                                        <TabsTrigger value="email" className="text-[9px] font-black px-4"><Mail className="size-3 mr-1.5" /> EMAIL</TabsTrigger>
                                    </TabsList>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>

                                <div className="space-y-6 text-left">
                                    <TabsContent value="url" className="m-0 animate-in fade-in"><div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">Website URL</Label><Input value={inputData} onChange={(e) => setInputData(e.target.value)} className="h-12 border-2 rounded-xl bg-background/50 font-bold" /></div></TabsContent>
                                    <TabsContent value="upi" className="m-0 space-y-4 animate-in fade-in">
                                        <Input value={upiData.pn} onChange={(e) => setUpiData(p => ({...p, pn: e.target.value}))} placeholder="Payee Name" className="h-10 border-2 rounded-xl" />
                                        <Input value={upiData.pa} onChange={(e) => setUpiData(p => ({...p, pa: e.target.value}))} placeholder="UPI ID (e.g. user@bank)" className="h-10 border-2 rounded-xl" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input type="number" value={upiData.am} onChange={(e) => setUpiData(p => ({...p, am: e.target.value}))} placeholder="Amount (Optional)" className="h-10 border-2 rounded-xl" />
                                            <Select value={upiData.cu} onValueChange={(v) => setUpiData(p => ({...p, cu: v}))}><SelectTrigger className="h-10 border-2 font-bold rounded-xl"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl border-2"><SelectItem value="INR">INR (₹)</SelectItem><SelectItem value="USD">USD ($)</SelectItem></SelectContent></Select>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="text" className="m-0 animate-in fade-in"><Textarea value={inputData} onChange={(e) => setInputData(e.target.value)} className="min-h-[100px] border-2 rounded-2xl p-4 font-bold" placeholder="Enter custom text..." /></TabsContent>
                                    <TabsContent value="wifi" className="m-0 space-y-4 animate-in fade-in">
                                        <Input value={wifiData.ssid} onChange={(e) => setWifiData(p => ({...p, ssid: e.target.value}))} placeholder="Wifi Name (SSID)" className="h-10 border-2 rounded-xl" />
                                        <Input value={wifiData.password} onChange={(e) => setWifiData(p => ({...p, password: e.target.value}))} placeholder="Password" className="h-10 border-2 rounded-xl" />
                                    </TabsContent>
                                    <TabsContent value="email" className="m-0 space-y-4 animate-in fade-in">
                                        <Input value={emailData.to} onChange={(e) => setEmailData(p => ({...p, to: e.target.value}))} placeholder="Recipient Email" className="h-10 border-2 rounded-xl" />
                                        <Input value={emailData.subject} onChange={(e) => setEmailData(p => ({...p, subject: e.target.value}))} placeholder="Subject" className="h-10 border-2 rounded-xl" />
                                        <Textarea value={emailData.body} onChange={(e) => setEmailData(p => ({...p, body: e.target.value}))} placeholder="Message body..." className="min-h-[80px] border-2 rounded-xl" />
                                    </TabsContent>

                                    <div className="space-y-8 pt-8 border-t border-dashed">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                                <LayoutGrid className="size-3" /> Pattern Style
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {DOT_TYPES.map(d => (
                                                    <button key={d.id} className={cn("btn-pos-uiverse h-10 transition-all !ring-[3px] !ring-slate-950 dark:!ring-white", dotType === d.id && "active-uiverse")} onClick={() => setDotType(d.id)} data-label={d.label} />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Main Color</Label>
                                                <div className="flex gap-3 items-center p-2 bg-white dark:bg-slate-900 border-2 rounded-xl shadow-inner">
                                                    <input type="color" value={dotColor} onChange={(e) => setDotColor(e.target.value)} className="size-8 p-1 rounded-lg border-2 cursor-pointer bg-white" />
                                                    <span className="text-[10px] font-mono font-bold uppercase">{dotColor}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Background</Label>
                                                <div className="flex gap-3 items-center p-2 bg-white dark:bg-slate-900 border-2 rounded-xl shadow-inner">
                                                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="size-8 p-1 rounded-lg border-2 cursor-pointer bg-white" />
                                                    <span className="text-[10px] font-mono font-bold uppercase">{bgColor}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* NEW: BORDER & LABEL CONTROLS */}
                                        <div className="space-y-6 pt-6 border-t border-dashed">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Square className="size-3"/> Border Width</Label>
                                                    <Badge variant="secondary" className="font-mono text-[10px]">{borderWidth[0]}px</Badge>
                                                </div>
                                                <Slider min={0} max={20} step={1} value={borderWidth} onValueChange={setBorderWidth} />
                                                {borderWidth[0] > 0 && (
                                                    <div className="flex items-center gap-3 p-2 bg-muted/20 rounded-xl border-2 animate-in zoom-in-95">
                                                        <Label className="text-[8px] font-black uppercase opacity-40 ml-2">Color</Label>
                                                        <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="size-7 rounded-lg border-2 cursor-pointer" />
                                                        <span className="text-[9px] font-mono font-bold uppercase">{borderColor}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-4 pt-2">
                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border-2 border-dashed">
                                                    <div className="flex items-center gap-3"><AlignJustify className="size-4 text-primary"/><Label className="text-[10px] font-black uppercase opacity-60">Add Name Label</Label></div>
                                                    <Switch checked={showLabel} onCheckedChange={setShowLabel} />
                                                </div>
                                                <AnimatePresence>
                                                    {showLabel && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
                                                            <Input 
                                                                value={customLabel} 
                                                                onChange={(e) => setCustomLabel(e.target.value)} 
                                                                placeholder={activeLabel} 
                                                                className="h-11 border-2 rounded-xl font-bold uppercase text-xs" 
                                                            />
                                                            <p className="text-[8px] font-bold text-muted-foreground uppercase px-2 opacity-50">Label will appear below the QR code.</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-dashed">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                <ImageIcon className="size-3" /> Center Brand Logo
                                            </Label>
                                            <div className="flex flex-col gap-3">
                                                <Button variant="outline" className="h-12 border-2 border-dashed rounded-xl font-black text-[10px] uppercase group bg-muted/10" onClick={() => logoInputRef.current?.click()}>
                                                    {logoUrl ? <CheckCircle2 className="size-4 mr-2 text-green-500" /> : <Plus className="size-4 mr-2 group-hover:scale-125 transition-transform" />} 
                                                    {logoUrl ? "CHANGE LOGO" : "UPLOAD LOGO"}
                                                </Button>
                                                {logoUrl && <Button variant="ghost" onClick={() => setLogoUrl(null)} className="h-8 text-rose-500 font-black text-[9px] uppercase"><Trash2 className="size-3 mr-1.5"/> REMOVE LOGO</Button>}
                                                <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-white/10">
                            <Button 
                                size="lg" 
                                className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-16 md:h-20 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] border-none w-full active:scale-95 disabled:opacity-50" 
                                onClick={() => handleDownload('png')} 
                                disabled={isProcessing}
                            >
                                <StarIcons />
                                <div className="absolute left-6 w-0.5 h-10 bg-white/40 rounded-full" />
                                <span className="flex-1 px-10 text-center tracking-widest text-lg md:text-xl font-black uppercase">
                                    {isProcessing ? "SAVING..." : "DOWNLOAD HD QR"}
                                </span>
                                <div className="bg-white h-full pl-8 pr-10 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-9 group-hover:pr-11 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-20px' }}>
                                    {isProcessing ? <Loader2 className="size-8 animate-spin" /> : <Download className="size-8 group-hover:scale-110 transition-transform" />}
                                    <div className="absolute right-4 w-0.5 h-8 bg-[#00aeef]/20 rounded-full" />
                                </div>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
