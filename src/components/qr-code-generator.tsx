"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
    X,
    LayoutGrid,
    Printer,
    ImageIcon,
    Globe,
    Wifi,
    Mail,
    MessageSquare,
    Palette,
    History,
    Lock,
    CreditCard,
    IndianRupee,
    Loader2,
    FileDigit
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
import confetti from 'canvas-confetti';

type QRType = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms' | 'whatsapp' | 'vcard' | 'location' | 'upi';

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
    const [debouncedData, setDebouncedData] = useState(inputData);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Type-specific states
    const [wifiData, setWifiData] = useState({ ssid: '', password: '', encryption: 'WPA' });
    const [whatsappData, setWhatsappData] = useState({ phone: '', message: '' });
    const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });
    const [upiData, setUpiData] = useState({ pa: '', pn: '', am: '', tn: '', cu: 'INR' });

    // Design states (Flat state to ensure smooth reactivity)
    const [dotColor, setDotColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [dotType, setDotType] = useState<DotType>("rounded");
    const [cornerType, setCornerType] = useState<CornerSquareType>("extra-rounded");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    const qrContainerRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<QRCodeStyling | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [history, setHistory] = useState<{ id: string, data: string, date: string, type: QRType }[]>([]);

    // 1. Data Debounce (250ms delay for heavy typing)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedData(inputData);
        }, 250);
        return () => clearTimeout(handler);
    }, [inputData]);

    // 2. Type-to-Data Mapper
    useEffect(() => {
        let dataStr = inputData;
        if (qrType === 'wifi') {
            dataStr = `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};;`;
        } else if (qrType === 'whatsapp') {
            dataStr = `https://wa.me/${whatsappData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappData.message)}`;
        } else if (qrType === 'email') {
            dataStr = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        } else if (qrType === 'upi') {
            let upi = `upi://pay?pa=${upiData.pa}`;
            if (upiData.pn) upi += `&pn=${encodeURIComponent(upiData.pn)}`;
            if (upiData.am) upi += `&am=${upiData.am}`;
            if (upiData.cu) upi += `&cu=${upiData.cu}`;
            if (upiData.tn) upi += `&tn=${encodeURIComponent(upiData.tn)}`;
            dataStr = upi;
        }
        if (dataStr !== inputData) setInputData(dataStr);
    }, [qrType, wifiData, whatsappData, emailData, upiData]);

    // 3. Engine Initialization
    useEffect(() => {
        if (typeof window !== 'undefined' && !qrCodeRef.current) {
            qrCodeRef.current = new QRCodeStyling({
                width: 300,
                height: 300,
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

    // 4. Smooth Sync Effect (Throttled update)
    useEffect(() => {
        if (qrCodeRef.current) {
            // We use requestAnimationFrame to ensure the browser is ready and prevent "stuck" feeling
            const frame = requestAnimationFrame(() => {
                qrCodeRef.current?.update({
                    data: debouncedData || " ",
                    image: logoUrl || undefined,
                    dotsOptions: { color: dotColor, type: dotType },
                    backgroundOptions: { color: bgColor },
                    cornersSquareOptions: { color: dotColor, type: cornerType },
                    cornersDotOptions: { color: dotColor, type: 'dot' },
                    imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 5 }
                });
            });
            return () => cancelAnimationFrame(frame);
        }
    }, [debouncedData, logoUrl, dotColor, bgColor, dotType, cornerType]);

    const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setLogoUrl(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async (ext: 'png' | 'svg' | 'jpeg' | 'webp' | 'pdf') => {
        if (!qrCodeRef.current) return;
        setIsProcessing(true);
        try {
            // CRITICAL: Force a final sync to current colors to avoid the "Maroon/Stale" bug
            qrCodeRef.current.update({
                dotsOptions: { color: dotColor, type: dotType },
                backgroundOptions: { color: bgColor },
                cornersSquareOptions: { color: dotColor, type: cornerType },
                cornersDotOptions: { color: dotColor, type: 'dot' }
            });

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
                await qrCodeRef.current.download({ name: `GR7-QR-${Date.now()}`, extension: ext });
            }
            
            setHistory(prev => [{ id: Math.random().toString(36).substr(2, 9), data: inputData, date: new Date().toLocaleTimeString(), type: qrType }, ...prev].slice(0, 10));
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Saved Successfully" });
        } catch (e) {
            toast({ variant: 'destructive', title: "Export Error" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrint = async () => {
        if (!qrCodeRef.current) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) { toast({ variant: 'destructive', title: "Printer Blocked" }); return; }
        printWindow.document.write('<html><head><title>Print QR</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:white;"><p>Loading...</p></body></html>');
        try {
            const blob = await qrCodeRef.current.getRawData('png');
            if (blob) {
                const url = URL.createObjectURL(blob);
                printWindow.document.body.innerHTML = `<div style="text-align:center;"><img src="${url}" style="max-width:90%;"><p style="font-size:12px;color:#999;">GR7 Tools Hub Studio</p></div>`;
                printWindow.document.close();
                setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
            }
        } catch (e) { printWindow.close(); }
    };

    const handleReset = () => {
        setInputData("https://www.gr7imagepdf.com");
        setLogoUrl(null);
        setDotColor("#000000");
        setBgColor("#ffffff");
        setDotType("rounded");
        setCornerType("extra-rounded");
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
                            <Badge className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-md">HD SYNC</Badge>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[450px] flex items-center justify-center relative select-none">
                            <div className="flex flex-col items-center gap-10 w-full">
                                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-[0_35px_80px_-15px_rgba(0,0,0,0.3)] border-4 border-white flex items-center justify-center relative group overflow-hidden">
                                    <div ref={qrContainerRef} className="transition-transform group-hover:scale-[1.02] duration-500" />
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
                                <ScrollArea className="w-full whitespace-nowrap mb-6">
                                    <TabsList className="flex h-auto w-max p-1.5 bg-muted/40 rounded-2xl border-2">
                                        <TabsTrigger value="url" className="text-[9px] font-black px-4"><Globe className="size-3 mr-1.5" /> URL</TabsTrigger>
                                        <TabsTrigger value="upi" className="text-[9px] font-black px-4 text-emerald-600"><CreditCard className="size-3 mr-1.5" /> PAYMENT</TabsTrigger>
                                        <TabsTrigger value="text" className="text-[9px] font-black px-4"><Type className="size-3 mr-1.5" /> TEXT</TabsTrigger>
                                        <TabsTrigger value="wifi" className="text-[9px] font-black px-4"><Wifi className="size-3 mr-1.5" /> WIFI</TabsTrigger>
                                        <TabsTrigger value="whatsapp" className="text-[9px] font-black px-4"><MessageSquare className="size-3 mr-1.5" /> WHATSAPP</TabsTrigger>
                                        <TabsTrigger value="email" className="text-[9px] font-black px-4"><Mail className="size-3 mr-1.5" /> EMAIL</TabsTrigger>
                                    </TabsList>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>

                                <div className="space-y-6 text-left">
                                    <TabsContent value="url" className="m-0"><div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">Website URL</Label><Input value={inputData} onChange={(e) => setInputData(e.target.value)} className="h-12 border-2 rounded-xl bg-background/50 font-bold" /></div></TabsContent>
                                    <TabsContent value="upi" className="m-0 space-y-4">
                                        <Input value={upiData.pn} onChange={(e) => setUpiData(p => ({...p, pn: e.target.value}))} placeholder="Payee Name" className="h-10 border-2" />
                                        <Input value={upiData.pa} onChange={(e) => setUpiData(p => ({...p, pa: e.target.value}))} placeholder="UPI ID (e.g. user@bank)" className="h-10 border-2" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input type="number" value={upiData.am} onChange={(e) => setUpiData(p => ({...p, am: e.target.value}))} placeholder="Amount (Optional)" className="h-10 border-2" />
                                            <Select value={upiData.cu} onValueChange={(v) => setUpiData(p => ({...p, cu: v}))}><SelectTrigger className="h-10 border-2 font-bold"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl border-2"><SelectItem value="INR">INR (₹)</SelectItem><SelectItem value="USD">USD ($)</SelectItem></SelectContent></Select>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="text" className="m-0"><Textarea value={inputData} onChange={(e) => setInputData(e.target.value)} className="min-h-[100px] border-2 rounded-xl" /></TabsContent>
                                    <TabsContent value="wifi" className="m-0 space-y-4">
                                        <Input value={wifiData.ssid} onChange={(e) => setWifiData(p => ({...p, ssid: e.target.value}))} placeholder="Wifi Name" className="h-10 border-2" />
                                        <Input value={wifiData.password} onChange={(e) => setWifiData(p => ({...p, password: e.target.value}))} placeholder="Password" className="h-10 border-2" />
                                    </TabsContent>
                                    <TabsContent value="whatsapp" className="m-0 space-y-4">
                                        <Input value={whatsappData.phone} onChange={(e) => setWhatsappData(p => ({...p, phone: e.target.value}))} placeholder="Phone (e.g. 919876543210)" className="h-10 border-2" />
                                        <Textarea value={whatsappData.message} onChange={(e) => setWhatsappData(p => ({...p, message: e.target.value}))} placeholder="Message" className="min-h-[80px] border-2" />
                                    </TabsContent>
                                    <TabsContent value="email" className="m-0 space-y-4">
                                        <Input value={emailData.to} onChange={(e) => setEmailData(p => ({...p, to: e.target.value}))} placeholder="Recipient Email" className="h-10 border-2" />
                                        <Input value={emailData.subject} onChange={(e) => setEmailData(p => ({...p, subject: e.target.value}))} placeholder="Subject" className="h-10 border-2" />
                                        <Textarea value={emailData.body} onChange={(e) => setEmailData(p => ({...p, body: e.target.value}))} placeholder="Message" className="min-h-[80px] border-2" />
                                    </TabsContent>

                                    <div className="space-y-8 pt-6 border-t border-dashed">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                                <LayoutGrid className="size-3" /> Dot Pattern
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {DOT_TYPES.map(d => (
                                                    <button key={d.id} className={cn("btn-pos-uiverse h-10", dotType === d.id && "active-uiverse")} onClick={() => setDotType(d.id)} data-label={d.label} />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Main Color</Label>
                                                <div className="flex gap-2 items-center">
                                                    <input 
                                                        type="color" 
                                                        value={dotColor} 
                                                        onChange={(e) => setDotColor(e.target.value)}
                                                        className="size-10 p-1 rounded-lg border-2 cursor-pointer bg-white"
                                                    />
                                                    <span className="text-[10px] font-mono font-bold uppercase">{dotColor}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Background</Label>
                                                <div className="flex gap-2 items-center">
                                                    <input 
                                                        type="color" 
                                                        value={bgColor} 
                                                        onChange={(e) => setBgColor(e.target.value)}
                                                        className="size-10 p-1 rounded-lg border-2 cursor-pointer bg-white"
                                                    />
                                                    <span className="text-[10px] font-mono font-bold uppercase">{bgColor}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-dashed">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                <ImageIcon className="size-3" /> Brand Logo
                                            </Label>
                                            <div className="flex flex-col gap-3">
                                                <Button variant="outline" className="h-12 border-2 border-dashed rounded-xl font-black text-[10px] uppercase group" onClick={() => logoInputRef.current?.click()}>
                                                    <Plus className="size-4 mr-2 group-hover:scale-125 transition-transform" /> {logoUrl ? "CHANGE LOGO" : "UPLOAD LOGO"}
                                                </Button>
                                                <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-white/10 flex flex-col gap-4">
                            <Button 
                                size="lg" 
                                className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-16 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] border-none" 
                                onClick={() => handleDownload('png')} 
                                disabled={isProcessing}
                            >
                                <div className="absolute left-4 w-0.5 h-6 md:h-8 bg-white/40 rounded-full" />
                                <span className="flex-1 px-10 text-center tracking-widest text-base md:text-xl uppercase">DOWNLOAD HD QR</span>
                                <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                    {isProcessing ? <Loader2 className="size-6 animate-spin" /> : <Download className="size-6 group-hover:scale-110 transition-transform" />}
                                    <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                                </div>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
