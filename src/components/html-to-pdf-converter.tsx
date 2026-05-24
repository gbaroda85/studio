"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Download, Loader2, FileCode, Eye, Globe, Zap, ShieldCheck, Smartphone } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Badge } from './ui/badge';
import { Label } from './ui/label';

const initialHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Professional Layout</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; line-height: 1.5; }
        .card { background: #f9f9f9; border-radius: 20px; padding: 30px; border: 2px solid #eee; margin-bottom: 20px; }
        h1 { color: #6366f1; font-size: 32px; margin-bottom: 10px; border-bottom: 3px solid #6366f1; display: inline-block; padding-bottom: 5px; }
        p { font-size: 16px; margin: 10px 0; }
        .accent { color: #f43f5e; font-weight: bold; }
        .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Live HTML Preview</h1>
        <p>This is a <span class="accent">Real-Time</span> rendering engine. Modify the code on the left and watch this PDF update instantly.</p>
        <p>Supports modern CSS3 features like borders, backgrounds, and custom fonts.</p>
    </div>
    <ul>
        <li>Client-side rendering (100% Private)</li>
        <li>High-DPI Export</li>
        <li>Automatic Page Layout</li>
    </ul>
    <div class="footer">Generated locally by GR7 Tools Hub</div>
</body>
</html>`;

export default function HtmlToPdfConverter() {
    const { toast } = useToast();
    const [htmlContent, setHtmlContent] = useState<string>(initialHtml);
    const [isGenerating, setIsGenerating] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    const generatePdf = useCallback(async () => {
        if (!htmlContent.trim() || !previewRef.current) {
            setPdfUrl(null);
            return;
        }

        setIsGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#FFFFFF',
                width: previewRef.current.scrollWidth,
                height: previewRef.current.scrollHeight,
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'l' : 'p',
                unit: 'px',
                format: [canvas.width, canvas.height],
            });

            pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
            
            const pdfBlob = pdf.output('blob');
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
        } catch (error) {
            console.error("Live HTML preview error:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [htmlContent]);

    // Debounce live preview
    useEffect(() => {
        const timer = setTimeout(() => {
            generatePdf();
        }, 800); 
        return () => clearTimeout(timer);
    }, [htmlContent, generatePdf]);

    useEffect(() => {
        return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
    }, [pdfUrl]);

    const handleDownload = () => {
        if (!pdfUrl) return;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'web-document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: 'Success', description: 'Professional PDF downloaded.' });
    };
    
    return (
        <div className="w-full max-w-7xl flex flex-col gap-6 px-4 animate-in fade-in duration-500">
            {/* Hidden Sandbox for Rendering */}
            <div className="fixed top-0 -left-[5000px] -z-10 opacity-0 pointer-events-none">
                <div 
                    ref={previewRef} 
                    className="w-[800px] bg-white p-0 m-0 overflow-hidden" 
                    dangerouslySetInnerHTML={{ __html: htmlContent }} 
                />
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                {/* Code Editor */}
                <Card className="lg:col-span-5 flex flex-col border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <FileCode className="size-5" />
                                </div>
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">HTML Source</CardTitle>
                            </div>
                            {isGenerating && <Loader2 className="size-4 animate-spin text-primary opacity-50" />}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4 p-8">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                           <Globe className="size-3"/> Real-time Web Renderer
                        </Label>
                        <Textarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            placeholder="Enter <html> here..."
                            className="flex-1 min-h-[450px] font-mono text-xs leading-relaxed border-2 focus-visible:ring-primary rounded-2xl p-6 bg-slate-900 text-slate-100 selection:bg-primary/30"
                        />
                        <div className="p-4 bg-muted/20 rounded-xl border-2 border-dashed flex gap-3 items-center">
                            <Zap className="size-4 text-yellow-500 shrink-0" />
                            <p className="text-[9px] font-bold text-muted-foreground leading-tight uppercase">
                                PRO TIP: Include all CSS within &lt;style&gt; tags for accurate local rendering.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* PDF Live Result */}
                <Card className="lg:col-span-7 flex flex-col border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <CardHeader className="bg-muted/30 border-b p-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="size-4 text-primary" />
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Visual PDF Output</CardTitle>
                        </div>
                        <Badge className="bg-green-600 text-white font-black text-[9px] uppercase tracking-widest px-3">Live Result</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative min-h-[500px] flex flex-col bg-white">
                       {pdfUrl ? (
                            <iframe
                                src={pdfUrl}
                                className="w-full h-full border-0"
                                title="HTML to PDF Live Preview"
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-4 bg-slate-50 dark:bg-slate-900/50">
                                <div className="relative">
                                    <Loader2 className="size-16 text-primary/10 animate-spin stroke-[4]" />
                                    <Globe className="absolute inset-0 m-auto size-6 text-primary/20" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest animate-pulse">Rendering Code...</p>
                                    <p className="text-[10px] text-muted-foreground/60 font-medium">Please provide valid HTML & CSS content.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="p-8 bg-white dark:bg-slate-950 border-t flex flex-col gap-4">
                        <Button 
                            onClick={handleDownload} 
                            disabled={!pdfUrl || isGenerating} 
                            className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl group active:scale-95 transition-all"
                        >
                            <Download className="mr-3 h-7 w-7 group-hover:translate-y-1 transition-transform" />
                            DOWNLOAD PROFESSIONAL PDF
                        </Button>
                        <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">
                                <Smartphone className="size-3 text-primary" /> RESPONSIVE PREVIEW
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">
                                <ShieldCheck className="size-3 text-green-500" /> 100% PRIVATE
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
