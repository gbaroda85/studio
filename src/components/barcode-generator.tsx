"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
    Barcode, 
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
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import confetti from 'canvas-confetti';

const FORMATS = [
    { id: 'CODE128', label: 'CODE128 (Standard)', description: 'General Purpose' },
    { id: 'CODE39', label: 'CODE39', description: 'Industrial/Govt' },
    { id: 'EAN13', label: 'EAN-13', description: 'Retail/Product' },
    { id: 'EAN8', label: 'EAN-8', description: 'Small Retail' },
    { id: 'UPC', label: 'UPC-A', description: 'Retail US' },
    { id: 'ITF14', label: 'ITF-14', description: 'Packaging' },
    { id: 'pharmacode', label: 'Pharmacode', description: 'Pharmaceutical' },
    { id: 'codabar', label: 'Codabar', description: 'Blood Banks/Library' },
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

export default function BarcodeGenerator() {
    const { toast } = useToast();
    const [inputData, setInputData] = useState("GR7-854120");
    const [format, setFormat] = useState('CODE128');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Customization States
    const [width, setWidth] = useState([2]);
    const [height, setHeight] = useState([100]);
    const [displayValue, setDisplayValue] = useState(true);
    const [fontSize, setFontSize] = useState([20]);
    const [margin, setMargin] = useState([10]);
    const [lineColor, setLineColor] = useState("#000000");
    
    const [previews, setPreviews] = useState<{ id: string, data: string, label: string }[]>([]);
    const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);

    const generateBarcode = useCallback(async (isManual = false) => {
        if (!inputData.trim()) {
            setPreviews([]);
            return;
        }

        if (isManual) setIsGenerating(true);

        // Small simulation for better UX on manual click
        if (isManual) await new Promise(r => setTimeout(r, 600));

        const lines = inputData.split('\n').filter(l => l.trim() !== '');
        const results: { id: string, data: string, label: string }[] = [];

        try {
            lines.forEach((line) => {
                const container = document.createElement('div');
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                container.appendChild(svg);

                JsBarcode(svg, line, {
                    format: format as any,
                    width: width[0],
                    height: height[0],
                    displayValue: displayValue,
                    fontSize: fontSize[0],
                    margin: margin[0],
                    lineColor: lineColor,
                    background: "transparent"
                });

                const svgData = new XMLSerializer().serializeToString(svg);
                
                // Use a stable ID based on content to prevent unnecessary re-animations (blinking)
                const stableId = btoa(line + format).substring(0, 12);

                results.push({
                    id: stableId,
                    data: `data:image/svg+xml;base64,${btoa(svgData)}`,
                    label: line
                });
            });

            setPreviews(results);
            if (results.length > 0) {
                // Determine which ID to select
                if (isManual || !selectedPreviewId || !results.find(r => r.id === selectedPreviewId)) {
                    setSelectedPreviewId(results[0].id);
                }
            }
            
            if (isManual) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3b82f6', '#10b981', '#ffffff']
                });
                toast({ title: "Barcode Ready", description: `${results.length} code(s) generated successfully.` });
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Format Error', description: 'Data is not valid for this barcode type.' });
        } finally {
            if (isManual) setIsGenerating(false);
        }
    }, [inputData, format, width, height, displayValue, fontSize, margin, lineColor, toast, selectedPreviewId]);

    // Initial and debounced auto-generation
    useEffect(() => {
        const timer = setTimeout(() => generateBarcode(false), 300);
        return () => clearTimeout(timer);
    }, [generateBarcode]);

    const handleDownload = (type: 'png' | 'svg' | 'pdf', item?: { data: string, label: string }) => {
        const target = item || previews.find(p => p.id === selectedPreviewId);
        if (!target) return;

        if (type === 'svg') {
            const link = document.createElement('a');
            link.href = target.data;
            link.download = `barcode-${target.label}.svg`;
            link.click();
        } else if (type === 'png') {
            const img = new window.Image();
            img.src = target.data;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Use higher resolution for PNG
                canvas.width = img.width * 4; 
                canvas.height = img.height * 4;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png', 1.0);
                    link.download = `barcode-${target.label}.png`;
                    link.click();
                }
            };
        } else if (type === 'pdf') {
            const img = new window.Image();
            img.src = target.data;
            img.onload = () => {
                // To fix the "SVG not supported" error in jsPDF:
                // We render the SVG to a Canvas first, then add as JPEG to PDF
                const canvas = document.createElement('canvas');
                canvas.width = img.width * 4; // High DPI
                canvas.height = img.height * 4;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const pngData = canvas.toDataURL('image/jpeg', 1.0);
                    
                    const pdf = new jsPDF({ 
                        orientation: img.width > img.height ? 'l' : 'p', 
                        unit: 'px', 
                        format: [img.width, img.height] 
                    });
                    pdf.addImage(pngData, 'JPEG', 0, 0, img.width, img.height);
                    pdf.save(`barcode-${target.label}.pdf`);
                }
            };
        }
    };

    const handleDownloadAllZip = async () => {
        setIsProcessing(true);
        const zip = new JSZip();
        
        try {
            for (const item of previews) {
                const img = new window.Image();
                img.src = item.data;
                await new Promise(r => img.onload = r);
                
                const canvas = document.createElement('canvas');
                canvas.width = img.width * 2; canvas.height = img.height * 2;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const base64 = canvas.toDataURL('image/png').split(',')[1];
                    zip.file(`${item.label}.png`, base64, { base64: true });
                }
            }
            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.download = `GR7-Barcode-Bundle-${Date.now()}.zip`;
            link.click();
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Export Failed' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrint = () => {
        const target = previews.find(p => p.id === selectedPreviewId);
        if (!target) return;

        // satisify browser popup heuristics by opening window immediately
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({ variant: 'destructive', title: "Printer Blocked", description: "Please allow popups to print." });
            return;
        }

        printWindow.document.write('<html><head><title>Print Barcode</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:white;"><div id="loader" style="text-align:center;font-family:sans-serif;"><div style="border:4px solid #3b82f6;border-top-color:transparent;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 20px;"></div><p style="font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#1e293b;">Preparing Print...</p></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style></body></html>');

        const img = new window.Image();
        img.src = target.data;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width * 4; // High DPI for crisp printing
            canvas.height = img.height * 4;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const pngData = canvas.toDataURL('image/png');
                
                printWindow.document.body.innerHTML = `<img src="${pngData}" style="max-width:90%; max-height:90%; object-fit: contain;">`;
                printWindow.document.title = `Print Barcode - ${target.label}`;
                
                // Finalize parsing and execute print
                printWindow.document.close();
                
                // Allow a small delay for mobile rendering engines before triggering dialog
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                }, 500);
            }
        };
    };

    const selectedItem = previews.find(p => p.id === selectedPreviewId);

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
                    <Button variant="outline" onClick={() => { setInputData("GR7-854120"); setPreviews([]); }} className="flex-1 md:flex-none h-11 md:h-12 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive">
                        <RefreshCcw className="mr-1.5 size-3 md:size-4" /> Reset Data
                    </Button>
                    {previews.length > 1 && (
                        <Button 
                            size="lg" 
                            className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-12 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none" 
                            onClick={handleDownloadAllZip} 
                            disabled={isProcessing}
                        >
                            <div className="absolute left-4 w-0.5 h-6 md:h-8 bg-white/40 rounded-full" />
                            <span className="flex-1 px-10 text-center tracking-widest text-[10px] uppercase">DOWNLOAD ZIP BUNDLE</span>
                            <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                {isProcessing ? <Loader2 className="size-6 animate-spin" /> : <Archive className="size-6 group-hover:scale-110 transition-transform" />}
                                <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                            </div>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Viewport */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                        <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-primary" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Studio Viewport</CardTitle>
                            </div>
                            {previews.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 bg-green-500/10 text-green-700 px-3 py-1 rounded-full border border-green-500/20 animate-in zoom-in-95">
                                        <CheckCircle2 className="size-3" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">ACTIVE</span>
                                    </div>
                                    <Badge className="bg-primary text-white font-black text-[10px] px-3 py-1 rounded-full">{previews.length} GENERATED</Badge>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-8 md:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[450px] flex items-center justify-center relative select-none">
                            <AnimatePresence mode="wait">
                                {isGenerating ? (
                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                                        <Loader2 className="size-16 animate-spin text-primary opacity-20 stroke-[3]" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Encoding Pixels...</p>
                                    </motion.div>
                                ) : selectedItem ? (
                                    <motion.div 
                                        key={selectedItem.id} 
                                        initial={{ scale: 0.9, opacity: 0 }} 
                                        animate={{ scale: 1, opacity: 1 }} 
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col items-center gap-8"
                                    >
                                        <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.3)] border-4 border-white flex items-center justify-center relative overflow-hidden group">
                                            <img src={selectedItem.data} alt="Barcode Preview" className="max-h-[35vh] w-auto block transition-transform group-hover:scale-105" />
                                            <div className="absolute top-4 right-4"><Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20 text-[8px] font-black">SCANNABLE HD</Badge></div>
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center gap-3 no-print">
                                            <Button variant="outline" className="h-10 border-2 rounded-xl font-black text-[9px] uppercase px-4 hover:border-primary transition-all" onClick={() => handleDownload('png')}><ImageIcon className="size-3.5 mr-1.5" /> PNG</Button>
                                            <Button variant="outline" className="h-10 border-2 rounded-xl font-black text-[9px] uppercase px-4 hover:border-primary transition-all" onClick={() => handleDownload('svg')}><LayoutGrid className="size-3.5 mr-1.5" /> SVG</Button>
                                            <Button variant="outline" className="h-10 border-2 rounded-xl font-black text-[9px] uppercase px-4 hover:border-primary transition-all" onClick={() => handleDownload('pdf')}><FileDigit className="size-3.5 mr-1.5" /> PDF</Button>
                                            <Separator orientation="vertical" className="h-6 opacity-20 mx-2" />
                                            <Button className="h-10 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase shadow-lg hover:scale-105 transition-all" onClick={handlePrint}><Printer className="size-3.5 mr-1.5" /> PRINT NOW</Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <Barcode className="size-32" />
                                        <p className="font-black uppercase tracking-widest text-lg">Input Data to Start</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    {previews.length > 1 && (
                        <Card className="border-2 shadow-xl bg-card/40 rounded-[2rem] overflow-hidden no-print">
                            <CardHeader className="p-4 bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <Layers className="size-3 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Batch Stream ({previews.length})</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <ScrollArea className="w-full whitespace-nowrap">
                                    <div className="flex gap-4 pb-4 px-1">
                                        {previews.map((p) => (
                                            <div key={p.id} onClick={() => setSelectedPreviewId(p.id)} className={cn(
                                                "relative inline-block w-32 aspect-video rounded-xl overflow-hidden border-2 bg-white shadow-md cursor-pointer transition-all active:scale-95",
                                                selectedPreviewId === p.id ? "border-primary ring-4 ring-primary/20 scale-105 z-10 shadow-primary/20" : "border-slate-100 hover:border-primary/40 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                                            )}>
                                                <img src={p.data} className="size-full object-contain p-2" alt={p.label} />
                                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[7px] font-black text-white">{p.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar: Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-5 md:p-8">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                <Settings2 className="size-4 md:size-5 text-primary" /> Config Studio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-10">
                            
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Type className="size-3" /> Input Source Data
                                </Label>
                                <div className="space-y-2">
                                    <textarea 
                                        value={inputData} 
                                        onChange={(e) => setInputData(e.target.value)} 
                                        className="w-full min-h-[120px] rounded-2xl border-2 p-4 text-sm font-bold bg-background/50 focus-visible:ring-primary/20 shadow-inner"
                                        placeholder="Enter values (one per line)..."
                                    />
                                    <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-50 px-1">Paste multiple lines for batch generation.</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-dashed">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Engine Protocol</Label>
                                <Select value={format} onValueChange={setFormat}>
                                    <SelectTrigger className="h-12 font-black border-2 rounded-xl bg-background/50 shadow-inner"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl border-2 shadow-2xl">
                                        {FORMATS.map(f => (
                                            <SelectItem key={f.id} value={f.id} className="font-bold py-3">
                                                <div className="flex flex-col items-start gap-0.5">
                                                    <span className="text-[10px] uppercase font-black">{f.label}</span>
                                                    <span className="text-[8px] text-muted-foreground font-medium uppercase">{f.description}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-dashed">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Bar Width</Label><Badge variant="secondary" className="font-black text-[9px]">{width[0]}</Badge></div>
                                    <Slider min={1} max={10} step={1} value={width} onValueChange={setWidth} />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Bar Height</Label><Badge variant="secondary" className="font-black text-[9px]">{height[0]}px</Badge></div>
                                    <Slider min={20} max={300} step={5} value={height} onValueChange={setHeight} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-dashed">
                                    <div className="flex items-center gap-3"><Smartphone className="size-4 text-primary" /><Label className="text-[10px] font-black uppercase opacity-60">Show Human-Text</Label></div>
                                    <Switch checked={displayValue} onCheckedChange={setDisplayValue} />
                                </div>
                                {displayValue && (
                                    <div className="space-y-4 animate-in slide-in-from-top-2">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Text Size</Label><Badge variant="secondary" className="font-black text-[9px]">{fontSize[0]}pt</Badge></div>
                                        <Slider min={8} max={50} step={1} value={fontSize} onValueChange={setFontSize} />
                                    </div>
                                )}
                            </div>

                            <div className="p-4 md:p-5 bg-green-500/5 rounded-[1.5rem] border-2 border-green-500/10 flex gap-4 shadow-sm text-left">
                                <ShieldCheck className="size-5 md:size-6 text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] md:text-[11px] font-black text-green-700 uppercase tracking-tight">HD Scannable Output</p>
                                    <p className="text-[8px] md:text-[10px] text-green-600/80 font-medium leading-tight mt-1 uppercase">
                                        Optimized vectors for zero scanning errors.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-white/10 flex flex-col gap-3">
                             <Button 
                                className="magic-button w-full h-16 md:h-18 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-4" 
                                onClick={() => generateBarcode(true)}
                                disabled={!inputData.trim() || isGenerating}
                            >
                                <StarIcons />
                                {isGenerating ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="size-7 md:size-8 animate-spin" />
                                        <span className="uppercase font-black text-base md:text-lg tracking-tighter">GENERATING...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Barcode className="size-7 group-hover:scale-110 transition-transform text-white/50" />
                                        <span className="uppercase tracking-tighter text-lg md:text-2xl font-black">GENERATE BARCODE</span>
                                    </div>
                                )}
                            </Button>
                            
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 text-center">Local RAM Processing Active</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
