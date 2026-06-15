"use client";

import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, Loader2, FileText, Settings2, Eye, Smartphone, ShieldCheck, Zap, Sparkles, RefreshCcw, Eraser, Monitor } from 'lucide-react';
import jsPDF from 'jspdf';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type Font = 'helvetica' | 'times' | 'courier';

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

export default function TextToPdfConverter() {
    const { toast } = useToast();
    const [text, setText] = useState("Hello, World!\n\nThis is a real-time live preview.\n\nEverything happens locally in your browser for 100% privacy.\n\nNow typing and deleting is extremely fast and smooth!");
    const [fontSize, setFontSize] = useState(14);
    const [font, setFont] = useState<Font>('helvetica');
    const [margin, setMargin] = useState(20);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const previewRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!text.trim()) {
            toast({ variant: 'destructive', title: 'Empty Content', description: 'Please type some text first.' });
            return;
        }

        setIsGenerating(true);
        try {
            // Give browser a tiny moment to stabilize
            await new Promise(r => setTimeout(r, 100));

            const doc = new jsPDF({
                orientation: "p",
                unit: "mm",
                format: "a4"
            });
            
            doc.setFont(font, 'normal');
            doc.setFontSize(fontSize);
            
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
                cursorY += (fontSize * 0.6); // Standard line spacing
            });
            
            doc.save(`GR7-Text-Document-${Date.now()}.pdf`);
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#1D61F2', '#8E5CF6', '#ffffff']
            });
            
            toast({ title: 'Download Started', description: 'Your high-quality PDF is ready.' });
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
        setMargin(20);
    };
    
    return (
        <div className="w-full max-w-7xl flex flex-col gap-8 px-4 animate-in fade-in duration-700 mx-auto pb-32">
            
            {/* Header: Studio Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 no-print">
                <div className="flex items-center gap-3">
                    <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                        <Settings2 className="size-5 md:size-6" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-none">Text <span className="text-primary">Studio</span></h2>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">High-Performance Editor</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-11 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive transition-all">
                        <RefreshCcw className="mr-1.5 size-3 md:size-4" /> Reset Settings
                    </Button>
                    <Button 
                        size="lg" 
                        className="magic-button magic-button-success flex-[2] md:flex-none h-12 px-10 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 font-black rounded-full transition-all active:scale-95 group flex items-center justify-center gap-3" 
                        onClick={handleDownload}
                        disabled={isGenerating || !text.trim()}
                    >
                        <StarIcons />
                        {isGenerating ? <Loader2 className="size-6 animate-spin" /> : <Download className="size-6 group-hover:translate-y-1 transition-transform" />}
                        <span className="text-xs uppercase tracking-widest">DOWNLOAD PDF</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* LEFT: EDITOR */}
                <Card className="flex flex-col border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
                    <CardHeader className="bg-primary/5 border-b p-6">
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
                    <CardContent className="flex-1 flex flex-col gap-6 p-6 md:p-10">
                        <div className="flex-1 flex flex-col gap-3">
                            <div className="flex justify-between items-center px-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Type or Paste Content</Label>
                                <Badge variant="outline" className="bg-primary/5 text-primary text-[8px] font-black border-primary/20">UTF-8 ENCODING</Badge>
                            </div>
                            <Textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Start typing your document content here..."
                                className="flex-1 min-h-[400px] text-base md:text-lg resize-none font-bold leading-relaxed border-2 focus-visible:ring-primary/20 rounded-[1.5rem] p-6 bg-muted/20 custom-scrollbar shadow-inner"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-dashed">
                             <div className="space-y-2">
                                 <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">Font Family</Label>
                                 <Select value={font} onValueChange={(v) => setFont(v as Font)}>
                                    <SelectTrigger className="h-11 font-black border-2 rounded-xl bg-background/50 shadow-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl border-2 shadow-2xl">
                                        <SelectItem value="helvetica" className="font-bold py-3">Helvetica (Sans)</SelectItem>
                                        <SelectItem value="times" className="font-bold py-3">Times Roman (Serif)</SelectItem>
                                        <SelectItem value="courier" className="font-bold py-3">Courier (Mono)</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-2">
                                 <Label className="text-[10px] font-black uppercase text-muted-foreground">Size (pt)</Label>
                                 <Input type="number" value={fontSize} onChange={(e) => setFontSize(Math.max(6, Number(e.target.value)))} className="h-11 font-black text-lg border-2 rounded-xl text-center bg-background/50 shadow-inner" />
                             </div>
                              <div className="space-y-2">
                                 <Label className="text-[10px] font-black uppercase text-muted-foreground">Margin (mm)</Label>
                                 <Input type="number" value={margin} onChange={(e) => setMargin(Math.max(0, Number(e.target.value)))} className="h-11 font-black text-lg border-2 rounded-xl text-center bg-background/50 shadow-inner" />
                             </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-6 border-t flex justify-center">
                        <div className="flex items-center gap-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
                            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-500" /> SECURE RAM</div>
                            <div className="flex items-center gap-1.5"><Zap className="size-3.5 text-yellow-500" /> INSTANT PERFORMANCE</div>
                        </div>
                    </CardFooter>
                </Card>

                {/* RIGHT: VIRTUAL A4 PREVIEW (CSS-BASED, NO LAG) */}
                <Card className="flex flex-col border-2 shadow-3xl rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 border-primary/10">
                    <CardHeader className="bg-muted/30 border-b p-5 md:p-7 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="size-4 text-primary" />
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Studio Direct Render</CardTitle>
                        </div>
                        <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-lg animate-pulse">A4 LAYOUT</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-6 md:p-12 lg:p-16 relative bg-slate-200 dark:bg-slate-800 shadow-inner overflow-hidden flex justify-center items-start min-h-[600px]">
                        
                        {/* THE VIRTUAL A4 PAGE (Scaled via CSS transform for performance) */}
                        <div className="relative transform-gpu scale-[0.45] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.85] xl:scale-[0.95] origin-top transition-transform duration-500">
                            <div 
                                ref={previewRef} 
                                className="bg-white shadow-[0_45px_100px_-20px_rgba(0,0,0,0.4)] relative text-left select-none pointer-events-none" 
                                style={{ 
                                    width: '210mm',
                                    minHeight: '297mm',
                                    padding: `${margin}mm`,
                                    fontFamily: font === 'times' ? 'Times New Roman, serif' : font === 'courier' ? 'Courier New, monospace' : 'Helvetica, sans-serif',
                                    fontSize: `${fontSize}pt`,
                                    color: '#000000',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.4',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {text || <span className="opacity-10 italic uppercase tracking-widest text-4xl block text-center mt-40">Start Typing...</span>}
                            </div>
                        </div>

                        {/* STATUS OVERLAY */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-3 bg-black/80 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-3xl z-40 transition-all hover:scale-105">
                             <Sparkles className="size-4 text-primary animate-pulse" /> Real-time Native Mapping Active
                        </div>
                    </CardContent>
                    <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 shrink-0">
                         <div className="flex items-center gap-2"><Smartphone className="size-4" /> MOBILE OPTIMIZED</div>
                        <div className="flex items-center gap-2"><Monitor className="size-4" /> 300 DPI RENDER</div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
