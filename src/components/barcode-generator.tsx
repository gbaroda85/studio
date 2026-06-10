
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
    Archive
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
    
    // Customization States
    const [width, setWidth] = useState([2]);
    const [height, setHeight] = useState([100]);
    const [displayValue, setDisplayValue] = useState(true);
    const [fontSize, setFontSize] = useState([20]);
    const [margin, setMargin] = useState([10]);
    const [lineColor, setBorderColor] = useState("#000000");
    
    const [previews, setPreviews] = useState<{ id: string, data: string, label: string }[]>([]);
    const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);

    const svgRef = useRef<SVGSVGElement>(null);

    const generateBarcode = useCallback(() => {
        if (!inputData.trim()) {
            setPreviews([]);
            return;
        }

        const lines = inputData.split('\n').filter(l => l.trim() !== '');
        const results: { id: string, data: string, label: string }[] = [];

        try {
            lines.forEach((line, idx) => {
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
                results.push({
                    id: Math.random().toString(36).substr(2, 9),
                    data: `data:image/svg+xml;base64,${btoa(svgData)}`,
                    label: line
                });
            });

            setPreviews(results);
            if (results.length > 0 && !selectedPreviewId) {
                setSelectedPreviewId(results[0].id);
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Format Error', description: 'Data is not valid for this barcode type.' });
        }
    }, [inputData, format, width, height, displayValue, fontSize, margin, lineColor, toast]);

    useEffect(() => {
        const timer = setTimeout(generateBarcode, 300);
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
                canvas.width = img.width * 2; // High DPI
                canvas.height = img.height * 2;
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
                const pdf = new jsPDF({ orientation: 'l', unit: 'px', format: [img.width, img.height] });
                pdf.addImage(target.data, 'SVG', 0, 0, img.width, img.height);
                pdf.save(`barcode-${target.label}.pdf`);
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
                canvas.width = img.width; canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
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
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;"><img src="${target.data}" style="max-width:80%;"></body></html>`);
            win.document.close();
            win.focus();
            setTimeout(() => { win.print(); win.close(); }, 500);
        }
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
                    <Button variant="outline" onClick={() => { setInputData("GR7-854120"); setPreviews([]); }} className="flex-1 md:flex-none h-11 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive">
                        <RefreshCcw className="mr-1.5 size-3 md:size-4" /> Reset Data
                    </Button>
                    {previews.length > 1 && (
                        <Button className="magic-button magic-button-success flex-1 md:flex-none h-11 px-8 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 font-black rounded-full transition-all active:scale-95 group flex items-center justify-center gap-3" onClick={handleDownloadAllZip} disabled={isProcessing}>
                            <StarIcons />
                            {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <Archive className="size-4" />}
                            <span className="uppercase tracking-tighter text-[10px]">DOWNLOAD ZIP BUNDLE</span>
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
                                    <Badge className="bg-primary text-white font-black text-[10px] px-3 py-1 rounded-full">{previews.length} GENERATED</Badge>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-8 md:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[400px] flex items-center justify-center relative select-none">
                            <AnimatePresence mode="wait">
                                {selectedItem ? (
                                    <motion.div key={selectedItem.id} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-8">
                                        <div className="bg-white p-10 md:p-16 rounded-[2rem] shadow-2xl border-4 border-white flex items-center justify-center relative overflow-hidden group">
                                            <img src={selectedItem.data} alt="Barcode Preview" className="max-h-[35vh] w-auto block transition-transform group-hover:scale-105" />
                                            <div className="absolute top-4 right-4"><Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20 text-[8px] font-black">SCANNABLE HD</Badge></div>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center gap-3 no-print">
                                            <Button variant="outline" className="h-10 border-2 rounded-xl font-black text-[9px] uppercase" onClick={() => handleDownload('png')}><ImageIcon className="size-3.5 mr-1.5" /> PNG</Button>
                                            <Button variant="outline" className="h-10 border-2 rounded-xl font-black text-[9px] uppercase" onClick={() => handleDownload('svg')}><LayoutGrid className="size-3.5 mr-1.5" /> SVG</Button>
                                            <Button variant="outline" className="h-10 border-2 rounded-xl font-black text-[9px] uppercase" onClick={() => handleDownload('pdf')}><FileDigit className="size-3.5 mr-1.5" /> PDF</Button>
                                            <Separator orientation="vertical" className="h-6 opacity-20 mx-2" />
                                            <Button className="h-10 bg-slate-800 text-white rounded-xl font-black text-[9px] uppercase shadow-lg hover:scale-105" onClick={handlePrint}><Printer className="size-3.5 mr-1.5" /> PRINT NOW</Button>
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
                                                selectedPreviewId === p.id ? "border-primary ring-4 ring-primary/20 scale-105" : "border-slate-100 hover:border-primary/40 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
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
                                <Settings2 className="size-4 md:size-5" /> Config Studio
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

                            <div className="p-4 md:p-5 bg-green-500/5 rounded-[1.5rem] border-2 border-green-500/10 flex gap-4 shadow-sm">
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
                                onClick={() => handleDownload('png')}
                                disabled={previews.length === 0}
                            >
                                <StarIcons />
                                <Download className="size-6 md:size-8 text-white group-hover:translate-y-1 transition-transform" />
                                <span className="uppercase tracking-tighter text-lg md:text-2xl">SAVE IMAGE</span>
                            </Button>
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 text-center">Local RAM Processing Active</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

const audioBufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const outBuffer = new ArrayBuffer(length);
    const view = new DataView(outBuffer);
    const channels = [];
    let offset = 0;
    let pos = 0;
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };
    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157); setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan); setUint32(buffer.sampleRate); setUint32(buffer.sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);
    for (let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));
    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }
    return new Blob([outBuffer], { type: "audio/wav" });
};
