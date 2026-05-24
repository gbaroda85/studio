
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, Loader2, FileText, Settings, Eye, MonitorMobile } from 'lucide-react';
import jsPDF from 'jspdf';

type Font = 'helvetica' | 'times' | 'courier';

export default function TextToPdfConverter() {
    const { toast } = useToast();
    const [text, setText] = useState("Hello, World!\n\nThis is a real-time live preview. Type something here and see the PDF update instantly on the right (or below on mobile).");
    const [fontSize, setFontSize] = useState(12);
    const [font, setFont] = useState<Font>('helvetica');
    const [margin, setMargin] = useState(20);
    const [isGenerating, setIsGenerating] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const generatePdf = useCallback(async () => {
        if (!text.trim()) {
            setPdfUrl(null);
            return;
        }

        setIsGenerating(true);
        try {
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
            let cursorY = marginSize;
            
            lines.forEach((line: string) => {
                if (cursorY + (fontSize * 0.35) > pageHeight - marginSize) {
                    doc.addPage();
                    cursorY = marginSize;
                }
                doc.text(line, marginSize, cursorY);
                cursorY += (fontSize * 0.5); 
            });
            
            const pdfBlob = doc.output('blob');
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
        } catch (error) {
            console.error("Live preview error:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [text, fontSize, font, margin]);

    // Debounced effect for live preview
    useEffect(() => {
        const timer = setTimeout(() => {
            generatePdf();
        }, 600); // 600ms delay to prevent excessive regeneration while typing
        return () => clearTimeout(timer);
    }, [generatePdf]);

    useEffect(() => {
        return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
    }, [pdfUrl]);
    
    const handleDownload = () => {
        if (!pdfUrl) return;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: 'Download Started', description: 'Your PDF is being saved.' });
    }
    
    return (
        <div className="w-full max-w-7xl flex flex-col gap-6 px-4">
            <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                {/* Editor Section */}
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

                {/* Live Preview Section */}
                <Card className="flex flex-col border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 border-primary/10">
                    <CardHeader className="bg-muted/30 border-b p-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="size-4 text-primary" />
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Live PDF Preview</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-black bg-white dark:bg-black uppercase border-primary/20">A4 Document</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative min-h-[450px] lg:min-h-[550px] flex flex-col bg-slate-200 dark:bg-slate-800 shadow-inner">
                       {pdfUrl ? (
                            <iframe
                                src={pdfUrl}
                                className="w-full h-full border-0"
                                title="Live PDF Preview"
                            />
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
                        <Button onClick={handleDownload} disabled={!pdfUrl} className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl group active:scale-95 transition-all">
                            <Download className="mr-2 h-6 w-6 group-hover:translate-y-0.5 transition-transform" />
                            DOWNLOAD PDF FILE
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            
            <div className="flex items-center justify-center gap-6 py-4 opacity-40">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                    <MonitorMobile className="size-3" /> Mobile Optimized Preview
                </div>
            </div>
        </div>
    );
}
