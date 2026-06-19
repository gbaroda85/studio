"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
    Download, 
    Loader2, 
    FileText, 
    Settings2, 
    Eye, 
    Smartphone, 
    ShieldCheck, 
    Zap, 
    Sparkles, 
    RefreshCcw, 
    Eraser, 
    Monitor,
    Bold,
    Palette,
    Baseline,
    Move,
    SearchCode
} from 'lucide-react';
import jsPDF from 'jspdf';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type Font = 'helvetica' | 'times' | 'courier';

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i} pointer-events-none`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

export default function TextToPdfConverter() {
    const { toast } = useToast();
    const [text, setText] = useState("Hello, World!\n\nThis is a real-time live preview.\n\nEverything happens locally in your browser for 100% privacy.\n\nNow typing and deleting is extremely fast and smooth!");
    const [fontSize, setFontSize] = useState(14);
    const [font, setFont] = useState<Font>('helvetica');
    const [isBold, setIsBold] = useState(true);
    const [textColor, setTextColor] = useState("#000000");
    const [margin, setMargin] = useState(20);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const previewRef = useRef<HTMLDivElement>(null);

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    };

    const handleDownload = async () => {
        if (!text.trim()) {
            toast({ variant: 'destructive', title: 'Empty Content', description: 'Please type some text first.' });
            return;
        }

        setIsGenerating(true);
        try {
            await new Promise(r => setTimeout(r, 100));

            const doc = new jsPDF({
                orientation: "p",
                unit: "mm",
                format: "a4"
            });
            
            doc.setFont(font, isBold ? 'bold' : 'normal');
            doc.setFontSize(fontSize);
            
            const rgbValue = hexToRgb(textColor);
            doc.setTextColor(rgbValue.r, rgbValue.g, rgbValue.b);
            
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const marginSize = margin;
            const maxLineWidth = pageWidth - marginSize * 2;
            
            const lines = doc.splitTextToSize(text, maxLineWidth);
            let cursorY = marginSize + (fontSize * 0.35);
            
            lines.forEach((line: string) => {
                if (cursorY + (fontSize * 0.5) > pageHeight - marginSize) {
                    doc.addPage();
                    cursorY = marginSize + (fontSize * 0.35);
                }
                doc.text(line, marginSize, cursorY);
                cursorY += (fontSize * 0.5); 
            });
            
            doc.save(`GR7-Text-Document-${Date.now()}.pdf`);
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#1D61F2', '#8E5CF6', '#ffffff']
            });
            
            toast({ title: 'Download Started', description: 'Your professional PDF is ready.' });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClear = () => {
        setText('');
        toast({ title: 'Editor Cleared' });
    };

    const handleReset = () => {
        setText("Hello, World!\n\nThis is a real-time live preview.");
        setFontSize(14);
        setFont('helvetica');
        setIsBold(true);
        setTextColor("#000000");
        setMargin(20);
    };
    
    return (
        <div className="w-full max-w-[1800px] flex flex-col gap-8 px-4 animate-in fade-in duration-700 mx-auto pb-32">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 no-print">
                <div className="flex items-center gap-3">
                    <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                        <Settings2 className="size-5 md:size-6" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-none text-left">Text <span className="text-primary">Studio</span></h2>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 text-left">Advanced Document Editor</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-11 md:h-12 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5 transition-all">
                        <RefreshCcw className="mr-1.5 size-3 md:size-4" /> Reset
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-0">
                {/* LEFT: SOURCE EDITOR */}
                <div className="lg:col-span-5 flex flex-col gap-6 h-[700px] lg:h-[850px]">
                    <Card className="flex flex-col border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30 h-full min-h-0">
                        <CardHeader className="bg-primary/5 border-b p-4 md:p-6 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                                        <FileText className="size-5" />
                                    </div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tighter">Source Editor</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleClear} className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5">
                                    <Eraser className="size-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-6 p-6 md:p-8 min-h-0 overflow-hidden">
                            <div className="flex-1 flex flex-col gap-3 min-h-0">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Type or Paste Content</Label>
                                    <Badge variant="outline" className="bg-primary/5 text-primary text-[8px] font-black border-primary/20 uppercase tracking-widest">Safe Input</Badge>
                                </div>
                                <Textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Start typing your document content here..."
                                    className="flex-1 text-base resize-none font-bold border-2 focus-visible:ring-primary/20 rounded-[1.5rem] p-5 bg-muted/20 custom-scrollbar shadow-inner text-left h-full"
                                    style={{ lineHeight: '1.2' }}
                                />
                            </div>

                            {/* ADVANCED CONTROLS GRID */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-dashed items-start shrink-0">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><Baseline className="size-3"/> Font & Style</Label>
                                    <div className="flex gap-2">
                                        <Select value={font} onValueChange={(v) => setFont(v as Font)}>
                                            <SelectTrigger className="h-10 flex-1 font-black border-2 rounded-xl bg-background/50 shadow-sm text-[10px]"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl border-2 shadow-2xl">
                                                <SelectItem value="helvetica" className="font-bold py-2 uppercase text-[10px]">Helvetica (Sans)</SelectItem>
                                                <SelectItem value="times" className="font-bold py-2 uppercase text-[10px]">Times (Serif)</SelectItem>
                                                <SelectItem value="courier" className="font-bold py-2 uppercase text-[10px]">Courier (Mono)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className={cn("h-10 w-10 shrink-0 border-2 rounded-xl transition-all", isBold && "bg-primary text-white border-primary shadow-lg")}
                                            onClick={() => setIsBold(!isBold)}
                                        >
                                            <Bold className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><Palette className="size-3"/> Size & Color</Label>
                                    <div className="flex gap-2">
                                        <Input type="number" value={fontSize} onChange={(e) => setFontSize(Math.max(6, Number(e.target.value)))} className="h-10 flex-1 font-black text-sm border-2 rounded-xl text-center bg-background/50 shadow-inner" />
                                        <div className="h-10 w-12 rounded-xl border-2 p-1 bg-background/50 shadow-inner flex items-center justify-center group relative overflow-hidden text-center">
                                            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-left">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><Move className="size-3"/> Margin (mm)</Label>
                                    <Input type="number" value={margin} onChange={(e) => setMargin(Math.max(0, Number(e.target.value)))} className="h-10 font-black text-sm border-2 rounded-xl text-center bg-background/50 shadow-inner" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-4 border-t flex justify-center shrink-0">
                            <div className="flex items-center gap-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
                                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-500" /> SECURE RAM</div>
                                <div className="flex items-center gap-1.5"><Zap className="size-3.5 text-yellow-500" /> INSTANT PERFORMANCE</div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* RIGHT: HD VIEWPORT - FIXED HEIGHT SCROLLABLE */}
                <div className="lg:col-span-7 flex flex-col gap-6 h-[700px] lg:h-[850px] min-h-0">
                    <Card className="flex flex-col border-2 shadow-3xl rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 border-primary/10 h-full min-h-0">
                        <CardHeader className="bg-muted/30 border-b p-4 md:p-6 flex flex-row items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <Eye className="size-4 text-primary" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Studio Direct Render</CardTitle>
                            </div>
                            <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-lg animate-pulse uppercase">A4 LAYOUT</Badge>
                        </CardHeader>
                        
                        <CardContent className="flex-1 p-0 relative bg-slate-200 dark:bg-slate-800 shadow-inner overflow-hidden flex flex-col min-h-0">
                            {/* NATIVE SCROLLABLE CONTAINER */}
                            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-200 dark:bg-slate-800 p-6 md:p-12 lg:p-20 relative">
                                <div className="flex justify-center w-full min-h-full">
                                    <div className="relative transform-gpu scale-[0.45] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.9] xl:scale-[1.0] origin-top transition-transform duration-500 flex justify-center w-full h-fit">
                                        <div 
                                            ref={previewRef} 
                                            className="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] relative text-left select-none pointer-events-none overflow-hidden" 
                                            style={{ 
                                                width: '210mm',
                                                minHeight: '297mm',
                                                padding: `${margin}mm`,
                                                fontFamily: font === 'times' ? 'Times New Roman, serif' : font === 'courier' ? 'Courier New, monospace' : 'Helvetica, sans-serif',
                                                fontSize: `${fontSize}pt`,
                                                fontWeight: isBold ? 'bold' : 'normal',
                                                color: textColor,
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                                overflowWrap: 'break-word',
                                                lineHeight: '1.2', 
                                                boxSizing: 'border-box',
                                                textAlign: 'left',
                                                display: 'block'
                                            }}
                                        >
                                            {text || <span className="opacity-10 italic uppercase tracking-widest text-4xl block text-center mt-40 w-full">Start Typing...</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-2.5 bg-black/80 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-3xl z-40 transition-all hover:scale-105">
                                 <SearchCode className="size-4 text-primary animate-pulse" /> Real-time Native Mapping Active
                            </div>
                        </CardContent>

                        <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center shrink-0">
                            <Button 
                                size="lg" 
                                className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-16 w-full shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none" 
                                onClick={handleDownload}
                                disabled={isGenerating || !text.trim()}
                            >
                                <div className="absolute left-4 w-0.5 h-10 bg-white/40 rounded-full" />
                                <span className="flex-1 px-10 text-center tracking-widest text-base md:text-xl uppercase">
                                    {isGenerating ? "GENERATING..." : "DOWNLOAD PROFESSIONAL PDF"}
                                </span>
                                <div className="bg-white h-full pl-8 pr-10 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-9 group-hover:pr-11 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-20px' }}>
                                    <Download className="size-8 group-hover:scale-110 transition-transform" />
                                    <div className="absolute right-4 w-0.5 h-8 bg-[#00aeef]/20 rounded-full" />
                                </div>
                            </Button>
                            <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground/30 text-[8px] font-black uppercase tracking-widest shrink-0">
                                <div className="flex items-center gap-1.5"><Smartphone className="size-3 text-primary" /> MOBILE SYNC</div>
                                <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> 300 DPI RENDER</div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
