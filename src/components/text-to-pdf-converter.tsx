"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, Loader2, FileText, Settings, Eye, Smartphone, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Badge } from './ui/badge';

type Font = 'helvetica' | 'times' | 'courier';

const StarIcons = () => (
    <>
        <div className="star-1">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-2">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-3">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-4">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-5">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-6">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
    </>
);

export default function TextToPdfConverter() {
    const { toast } = useToast();
    const [text, setText] = useState("Hello, World!\n\nThis is a real-time live preview. Type something here and see the PDF update instantly on the right (or below on mobile).");
    const [fontSize, setFontSize] = useState(12);
    const [font, setFont] = useState<Font>('helvetica');
    const [margin, setMargin] = useState(20);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    const generatePdf = useCallback(async () => {
        if (!text.trim() || !previewRef.current) {
            setPreviewImage(null);
            setPdfBlob(null);
            return;
        }

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                logging: false,
                backgroundColor: '#FFFFFF',
                width: 595, 
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.92);
            setPreviewImage(imgData);

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
            let cursorY = marginSize + (fontSize * 0.3);
            
            lines.forEach((line: string) => {
                if (cursorY + (fontSize * 0.35) > pageHeight - marginSize) {
                    doc.addPage();
                    cursorY = marginSize + (fontSize * 0.3);
                }
                doc.text(line, marginSize, cursorY);
                cursorY += (fontSize * 0.5); 
            });
            
            setPdfBlob(doc.output('blob'));
        } catch (error) {
            console.error("Live preview error:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [text, fontSize, font, margin]);

    useEffect(() => {
        const timer = setTimeout(() => {
            generatePdf();
        }, 600); 
        return () => clearTimeout(timer);
    }, [text, fontSize, font, margin, generatePdf]);

    const handleDownload = () => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: 'Download Started', description: 'Your PDF is being saved.' });
    }
    
    return (
        <div className="w-full max-w-7xl flex flex-col gap-6 px-4 animate-in fade-in duration-500">
            <div className="fixed top-0 -left-[5000px] -z-10 opacity-0 pointer-events-none">
                <div 
                    ref={previewRef} 
                    className="w-[595px] bg-white p-[20px] m-0 overflow-hidden text-left" 
                    style={{ 
                        fontFamily: font === 'times' ? 'Times New Roman, serif' : font === 'courier' ? 'Courier New, monospace' : 'Helvetica, sans-serif',
                        fontSize: `${fontSize}px`,
                        padding: `${margin}mm`,
                        whiteSpace: 'pre-wrap',
                        color: '#000'
                    }}
                >
                    {text}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                <Card className="flex flex-col border-2 shadow-xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-950">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <FileText className="size-5" />
                                </div>
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">Text Editor</CardTitle>
                            </div>
                            {isGenerating && <Loader2 className="size-4 animate-spin text-primary opacity-50" />}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-6 p-8">
                        <div className="flex-1 min-h-[350px] flex flex-col gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type or Paste Content</Label>
                            <Textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Start typing your document content here..."
                                className="flex-1 text-base resize-none font-medium leading-relaxed border-2 focus-visible:ring-primary rounded-2xl p-4 bg-muted/10"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-dashed">
                             <div className="space-y-2">
                                 <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><Settings className="size-3"/> Font</Label>
                                 <Select value={font} onValueChange={(v) => setFont(v as Font)}>
                                    <SelectTrigger className="h-10 font-bold rounded-xl border-2"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl border-2 shadow-2xl">
                                        <SelectItem value="helvetica" className="font-bold">Helvetica</SelectItem>
                                        <SelectItem value="times" className="font-bold">Times New Roman</SelectItem>
                                        <SelectItem value="courier" className="font-bold">Courier</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-2">
                                 <Label className="text-[10px] font-black uppercase text-muted-foreground">Size (pt)</Label>
                                 <Input type="number" value={fontSize} onChange={(e) => setFontSize(Math.max(6, Number(e.target.value)))} className="h-10 font-bold border-2 rounded-xl" />
                             </div>
                              <div className="space-y-2">
                                 <Label className="text-[10px] font-black uppercase text-muted-foreground">Margin (mm)</Label>
                                 <Input type="number" value={margin} onChange={(e) => setMargin(Math.max(0, Number(e.target.value)))} className="h-10 font-bold border-2 rounded-xl" />
                             </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col border-2 shadow-xl rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 border-primary/10">
                    <CardHeader className="bg-muted/30 border-b p-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="size-4 text-primary" />
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Live PDF Preview</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-black bg-white dark:bg-black uppercase border-primary/20">A4 Document</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-8 relative min-h-[450px] lg:min-h-[550px] flex flex-col bg-slate-200 dark:bg-slate-800 shadow-inner overflow-y-auto max-h-[700px]">
                       {previewImage ? (
                            <div className="relative w-full shadow-2xl border-4 border-white bg-white rounded-sm mx-auto overflow-hidden animate-in zoom-in-95 duration-300">
                                <img
                                    src={previewImage}
                                    alt="Live PDF Preview"
                                    className="w-full h-auto block"
                                />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-4">
                                <div className="size-16 rounded-full bg-white/50 flex items-center justify-center animate-pulse">
                                    <Loader2 className="size-8 text-primary/20 animate-spin" />
                                </div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-tighter">Waiting for input...</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="p-6 bg-white dark:bg-slate-950 border-t flex flex-col sm:flex-row gap-4">
                        <Button onClick={handleDownload} disabled={!pdfBlob} className="magic-button magic-button-success w-full h-16 text-lg font-black bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 rounded-full transition-all active:scale-95 flex items-center justify-center gap-4">
                            <StarIcons />
                            <Download className="mr-2 h-7 w-7 group-hover:translate-y-0.5 transition-transform" /> 
                            <span className="uppercase tracking-tighter">DOWNLOAD PDF FILE</span>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            
            <div className="flex items-center justify-center gap-6 py-4 opacity-40">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Smartphone className="size-3" /> Responsive HD Rendering
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                    <ShieldCheck className="size-3" /> 100% Private
                </div>
            </div>
        </div>
    );
}