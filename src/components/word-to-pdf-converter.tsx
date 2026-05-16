"use client";

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Download, Loader2, FileText, UploadCloud, FileType, CheckCircle2, RefreshCcw, Eye } from 'lucide-react';
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

    useEffect(() => {
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [pdfUrl]);

    const handleFileChange = async (file: File | null) => {
        if (!file) return;

        if (file.name.endsWith('.docx')) {
            setWordFile(file);
            setPdfUrl(null);
            setIsParsing(true);
            
            try {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                setHtmlContent(result.value);
                toast({ title: "Word File Parsed", description: "Ready to convert to PDF." });
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
        
        toast({ title: 'Generating PDF...', description: 'Rendering document pages locally.' });

        try {
            // A small delay to ensure rendering
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 800, // Fixed width for consistent layout
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            // Standard A4 dimensions in pt
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * pageWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            // Add the first page
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add subsequent pages if content is long
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

            toast({ title: 'Success!', description: 'Your PDF is ready for download.' });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast({ variant: 'destructive', title: 'Conversion Error', description: 'Failed to generate PDF. The document might be too large.' });
        } finally {
            setIsConverting(false);
        }
    };
    
    const handleDownload = () => {
        if (!pdfUrl || !wordFile) return;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = wordFile.name.replace('.docx', '.pdf');
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
                    <CardTitle className="text-3xl font-black">Word to PDF</CardTitle>
                    <CardDescription>Convert .docx documents to professional PDF files instantly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
                        onClick={() => document.getElementById('word-upload')?.click()}
                    >
                        <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div>
                            <p className="text-xl font-bold">Drop your Word file here</p>
                            <p className="text-sm text-muted-foreground mt-2">Supports .docx files only. 100% Secure.</p>
                        </div>
                    </div>
                    <input id="word-upload" type="file" className="hidden" accept=".docx" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
            
            <div className="lg:col-span-5 flex flex-col gap-6">
                <Card className="border-2 shadow-lg">
                    <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Word Source
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={reset} className="h-8 text-[10px] font-black">
                            <RefreshCcw className="mr-1 h-3 w-3" /> CHANGE FILE
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
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-xl border-primary/20 overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b py-4">
                        <CardTitle className="text-sm font-bold uppercase tracking-tight">Conversion Workspace</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="p-4 bg-muted/20 rounded-xl space-y-3">
                            <p className="text-xs font-medium leading-relaxed">
                                Our engine parses the Word document locally and renders it for the PDF container. Best for text, lists, and standard formatting.
                            </p>
                        </div>
                        
                        {!pdfUrl ? (
                            <Button onClick={handleConvert} disabled={isConverting || isParsing} className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-xl">
                                {isConverting ? <Loader2 className="mr-3 h-7 w-7 animate-spin" /> : <FileType className="mr-3 h-7 w-7" />}
                                {isConverting ? "CONVERTING..." : "CONVERT TO PDF"}
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <Button onClick={handleDownload} className="w-full h-16 text-xl font-black bg-green-600 hover:bg-green-700 shadow-xl animate-bounce">
                                    <Download className="mr-3 h-7 w-7" /> DOWNLOAD PDF
                                </Button>
                                <p className="text-center text-[10px] font-black uppercase text-green-600 flex items-center justify-center gap-1.5">
                                    <CheckCircle2 className="h-3 w-3" /> Ready for final use
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-7 flex flex-col">
                <Card className="border-2 shadow-2xl flex-1 overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-900/50">
                    <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center justify-between shrink-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Eye className="h-4 w-4" /> Live Preview
                        </CardTitle>
                        <Badge variant="outline" className="text-[9px] font-black">LOCAL RENDER</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-8 overflow-auto custom-scrollbar flex justify-center">
                        <div className="bg-white text-black shadow-2xl rounded-sm p-12 min-h-[842px] w-[595pt] max-w-full origin-top transition-transform">
                            {isParsing ? (
                                <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Parsing Word Data...</p>
                                </div>
                            ) : (
                                <div 
                                    ref={previewRef}
                                    dangerouslySetInnerHTML={{ __html: htmlContent }} 
                                    className="word-preview-content prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-black prose-p:text-black"
                                    style={{ fontFamily: 'serif' }}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <style jsx global>{`
                .word-preview-content p { margin-bottom: 1em; line-height: 1.6; }
                .word-preview-content h1, .word-preview-content h2 { margin-top: 1.5em; margin-bottom: 0.5em; }
                .word-preview-content table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
                .word-preview-content td, .word-preview-content th { border: 1px solid #ddd; padding: 8px; }
            `}</style>
        </div>
    );
}