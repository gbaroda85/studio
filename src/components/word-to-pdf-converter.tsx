
"use client";

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Download, Loader2, FileText, UploadCloud, FileType, CheckCircle2, RefreshCcw, Eye, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as mammoth from 'mammoth';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function WordToPdfConverter() {
    const { toast } = useToast();
    const [wordFile, setWordFile] = useState<File | null>(null);
    const [htmlContent, setHtmlContent] = useState<string>("");
    const [isConverting, setIsConverting] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    
    const previewRef = useRef<HTMLDivElement>(null);
    const hiddenContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [pdfUrl]);

    const handleFileChange = async (file: File | null) => {
        if (!file) return;

        if (file.name.toLowerCase().endsWith('.docx')) {
            setWordFile(file);
            setPdfUrl(null);
            setIsParsing(true);
            setHtmlContent("");
            
            try {
                const arrayBuffer = await file.arrayBuffer();
                // We use custom style map to ensure basic formatting is preserved
                const options = {
                    styleMap: [
                        "p[style-name='Header'] => h1:fresh",
                        "p[style-name='Footer'] => p:fresh",
                    ]
                };
                const result = await mammoth.convertToHtml({ arrayBuffer }, options);
                setHtmlContent(result.value);
                
                if (result.messages.length > 0) {
                    console.log("Mammoth messages:", result.messages);
                }
                
                toast({ title: "Word File Parsed", description: "Document loaded. Ready to convert." });
            } catch (error) {
                console.error("Word parsing error:", error);
                toast({ variant: 'destructive', title: 'Parsing Error', description: 'Could not read Word file. Please ensure it is a valid .docx file.' });
                setWordFile(null);
            } finally {
                setIsParsing(false);
            }
        } else {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select a .docx file.' });
        }
    };

    const handleConvert = async () => {
        if (!htmlContent || !previewRef.current) {
            toast({ variant: 'destructive', title: 'No Content', description: 'Please upload a Word file first.' });
            return;
        }

        setIsConverting(true);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        
        toast({ title: 'Generating PDF...', description: 'Processing multi-page content locally.' });

        try {
            // Use the visible preview but ensure it's rendered properly
            const element = previewRef.current;
            
            // Calculate total height to see if we need multi-page logic
            const canvas = await html2canvas(element, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: element.scrollWidth,
                scrollY: -window.scrollY // Fix for scrolled pages
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            
            // A4 dimensions in points (pt)
            // Width: 595.28pt, Height: 841.89pt
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * pageWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            // Page 1
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pageHeight;

            // If content is longer than one A4 page, keep adding pages
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
                heightLeft -= pageHeight;
            }
            
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

            toast({ title: 'Success!', description: 'Full document converted successfully.' });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast({ variant: 'destructive', title: 'Conversion Error', description: 'Failed to generate PDF. Try a smaller file.' });
        } finally {
            setIsConverting(false);
        }
    };
    
    const handleDownload = () => {
        if (!pdfUrl || !wordFile) return;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = wordFile.name.replace(/\.docx$/i, '.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const reset = () => {
        setWordFile(null);
        setHtmlContent("");
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
    };

    if (!wordFile) {
        return (
            <Card
                className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl border-foreground/10", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); }}
            >
                <CardHeader>
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-blue-500/10 text-blue-600">
                        <FileType className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-black">Word to PDF Pro</CardTitle>
                    <CardDescription>Convert long .docx documents to professional multi-page PDF files.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
                        onClick={() => document.getElementById('word-upload')?.click()}
                    >
                        <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div>
                            <p className="text-xl font-bold">Drop Word document here</p>
                            <p className="text-sm text-muted-foreground mt-2">Supports multi-page DOCX. 100% Client-side.</p>
                        </div>
                    </div>
                    <input id="word-upload" type="file" className="hidden" accept=".docx" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                </CardContent>
                <CardFooter className="justify-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-8">
                    <div className="flex items-center gap-1"><CheckCircle2 className="size-3 text-green-500" /> Multi-page Support</div>
                    <div className="flex items-center gap-1"><CheckCircle2 className="size-3 text-green-500" /> Private & Secure</div>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
            
            <div className="lg:col-span-4 flex flex-col gap-6">
                <Card className="border-2 shadow-lg">
                    <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Word Source
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={reset} className="h-8 text-[10px] font-black">
                            <RefreshCcw className="mr-1 h-3 w-3" /> CHANGE
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileType className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{wordFile.name}</p>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase">{(wordFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-xl border-primary/20 overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b py-4">
                        <CardTitle className="text-sm font-bold uppercase tracking-tight">Export PDF</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 flex gap-3">
                            <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                                Tip: For very long documents, the conversion might take a few seconds. Do not close the tab.
                            </p>
                        </div>
                        
                        {!pdfUrl ? (
                            <Button onClick={handleConvert} disabled={isConverting || isParsing} className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-xl">
                                {isConverting ? <Loader2 className="mr-3 h-7 w-7 animate-spin" /> : <FileType className="mr-3 h-7 w-7" />}
                                {isConverting ? "GENERATING..." : "CREATE PDF"}
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <Button onClick={handleDownload} className="w-full h-16 text-xl font-black bg-green-600 hover:bg-green-700 shadow-xl animate-bounce">
                                    <Download className="mr-3 h-7 w-7" /> DOWNLOAD PDF
                                </Button>
                                <Button variant="outline" onClick={() => setPdfUrl(null)} className="w-full h-12 font-bold border-2">
                                    <RefreshCcw className="mr-2 h-4 w-4" /> RE-CONVERT
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-8 flex flex-col">
                <Card className="border-2 shadow-2xl flex-1 overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-900/50 min-h-[600px]">
                    <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center justify-between shrink-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Eye className="h-4 w-4" /> Full Document Preview
                        </CardTitle>
                        <Badge variant="outline" className="text-[9px] font-black">A4 FORMAT</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-auto custom-scrollbar flex justify-center bg-slate-200/50 dark:bg-slate-950/50">
                        <div className="my-8 bg-white text-black shadow-2xl rounded-sm w-[595pt] min-h-[842pt] max-w-[95%] origin-top transition-transform">
                            {isParsing ? (
                                <div className="flex flex-col items-center justify-center py-40 gap-4">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Scanning Document Content...</p>
                                </div>
                            ) : htmlContent ? (
                                <div 
                                    ref={previewRef}
                                    dangerouslySetInnerHTML={{ __html: htmlContent }} 
                                    className="word-preview-content p-[50pt] prose prose-sm max-w-none"
                                    style={{ 
                                        fontFamily: "'Times New Roman', serif",
                                        lineHeight: '1.5',
                                        color: '#000000',
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-40 text-muted-foreground opacity-20">
                                    <FileText className="h-20 w-20 mb-4" />
                                    <p className="font-bold">No Content Loaded</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <style jsx global>{`
                .word-preview-content {
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                .word-preview-content p { margin-bottom: 12pt; font-size: 11pt; }
                .word-preview-content h1 { font-size: 24pt; font-weight: bold; margin-bottom: 18pt; margin-top: 24pt; }
                .word-preview-content h2 { font-size: 18pt; font-weight: bold; margin-bottom: 14pt; margin-top: 20pt; }
                .word-preview-content h3 { font-size: 14pt; font-weight: bold; margin-bottom: 12pt; margin-top: 16pt; }
                .word-preview-content table { border-collapse: collapse; width: 100%; margin-bottom: 12pt; border: 1pt solid #000; }
                .word-preview-content td, .word-preview-content th { border: 1pt solid #000; padding: 6pt; font-size: 10pt; }
                .word-preview-content ul, .word-preview-content ol { margin-bottom: 12pt; padding-left: 20pt; }
                .word-preview-content li { margin-bottom: 6pt; }
                .word-preview-content img { max-width: 100%; height: auto; display: block; margin: 12pt auto; }
            `}</style>
        </div>
    );
}
