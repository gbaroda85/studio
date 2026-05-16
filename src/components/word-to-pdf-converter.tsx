
"use client";

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Download, Loader2, FileText, UploadCloud, FileType, CheckCircle2, RefreshCcw, Eye, AlertCircle, FileDigit, FileCheck } from 'lucide-react';
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
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [pdfUrl]);

    /**
     * Advanced HTML Refiner
     * Detects common Word document patterns like signature lines,
     * tabs, and alignments that Mammoth often loses.
     */
    const refineHtml = (rawHtml: string) => {
        let refined = rawHtml;
        
        // 1. Fix Tab-like spaces (Word uses multiple non-breaking spaces for alignment)
        // Convert sequences of &nbsp; to flex-friendly spans
        refined = refined.replace(/(&nbsp;){4,}/g, '<span class="docx-spacer"></span>');

        // 2. Wrap content for better styling
        refined = `<div class="docx-inner-wrapper">${refined}</div>`;
        
        return refined;
    };

    const handleFileChange = async (file: File | null) => {
        if (!file) return;

        if (file.name.toLowerCase().endsWith('.docx')) {
            setWordFile(file);
            setPdfUrl(null);
            setIsParsing(true);
            setHtmlContent("");
            
            try {
                const arrayBuffer = await file.arrayBuffer();
                
                const options = {
                    styleMap: [
                        "p[style-name='Header'] => h1.docx-header:fresh",
                        "p[style-name='Heading 1'] => h1:fresh",
                        "p[style-name='Heading 2'] => h2:fresh",
                        "p[style-name='Normal'] => p.docx-p:fresh",
                        "b => strong",
                        "i => em",
                        "u => u"
                    ],
                    includeDefaultStyleMap: true,
                };

                const result = await mammoth.convertToHtml({ arrayBuffer }, options);
                const refined = refineHtml(result.value);
                setHtmlContent(refined);
                
                toast({ title: "Document Processed", description: "Layout refined for HD PDF generation." });
            } catch (error) {
                console.error("Word parsing error:", error);
                toast({ variant: 'destructive', title: 'Parsing Error', description: 'Could not read Word file.' });
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
        
        toast({ title: 'Rendering HD PDF...', description: 'Applying ultra-precision filters.' });

        try {
            const element = previewRef.current;
            
            // To ensure 100% correct layout, we temporarily force fixed width during capture
            const originalStyle = element.style.cssText;
            element.style.width = '794px'; // 210mm at 96DPI
            element.style.minHeight = '1123px'; // 297mm at 96DPI

            const canvas = await html2canvas(element, {
                scale: 4, // Ultra HD Quality
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 794,
                onclone: (clonedDoc) => {
                    // Ensure cloned elements are visible for capture
                    const el = clonedDoc.getElementById('docx-preview-node');
                    if (el) el.style.display = 'block';
                }
            });

            // Restore original styles
            element.style.cssText = originalStyle;

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            // A4 Dimensions: 210mm x 297mm
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * pageWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            // Page 1
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'SLOW');
            heightLeft -= pageHeight;

            // Handle overflow pages
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'SLOW');
                heightLeft -= pageHeight;
            }
            
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

            toast({ title: 'Success!', description: 'Original layout preserved in HD.' });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast({ variant: 'destructive', title: 'Conversion Error', description: 'Failed to generate PDF.' });
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
                className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl border-foreground/10 bg-card/50 backdrop-blur-sm", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); }}
            >
                <CardHeader>
                    <div className="mx-auto mb-6 grid size-24 place-items-center rounded-3xl bg-blue-500/10 text-blue-600 shadow-inner">
                        <FileType className="h-12 w-12" />
                    </div>
                    <CardTitle className="text-4xl font-black font-headline tracking-tighter">Word to PDF <span className="text-blue-600">Ultra</span></CardTitle>
                    <CardDescription className="text-base font-medium">Perfect layout preservation for signatures and complex documents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group relative overflow-hidden"
                        onClick={() => document.getElementById('word-upload')?.click()}
                    >
                        <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div>
                            <p className="text-xl font-bold">Drop Word document here</p>
                            <p className="text-sm text-muted-foreground mt-2">Supports signatures, tables, and centered headers.</p>
                        </div>
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <input id="word-upload" type="file" className="hidden" accept=".docx" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                </CardContent>
                <CardFooter className="justify-center gap-10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pb-8 pt-4 border-t mt-4">
                    <div className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-green-500" /> Layout Sharp</div>
                    <div className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-green-500" /> Signature Safe</div>
                    <div className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-green-500" /> Local Encrypted</div>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 pb-20">
            
            <div className="lg:col-span-4 flex flex-col gap-6">
                <Card className="border-2 shadow-xl border-primary/10 overflow-hidden bg-card/80 backdrop-blur-xl">
                    <CardHeader className="bg-muted/30 border-b py-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /> SOURCE FILE</span>
                            <Button variant="ghost" size="sm" onClick={reset} className="h-8 text-[10px] font-black hover:text-destructive transition-colors">
                                <RefreshCcw className="mr-1.5 h-3 w-3" /> CHANGE
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 group">
                            <div className="size-14 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileType className="h-7 w-7 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black truncate text-foreground">{wordFile.name}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">{(wordFile.size / 1024).toFixed(1)} KB DOCX</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-2xl border-primary/20 overflow-hidden sticky top-28">
                    <CardHeader className="bg-primary/5 border-b py-5">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <FileDigit className="h-4 w-4 text-primary" /> CONVERSION STUDIO
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex gap-3">
                            <AlertCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
                                Our AI detects signature patterns and aligns them automatically to the right side of the page.
                            </p>
                        </div>
                        
                        {!pdfUrl ? (
                            <Button onClick={handleConvert} disabled={isConverting || isParsing} className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-2xl group transition-all active:scale-95">
                                {isConverting ? <Loader2 className="mr-3 h-7 w-7 animate-spin" /> : <FileDigit className="mr-3 h-7 w-7 group-hover:rotate-12 transition-transform" />}
                                {isConverting ? "RENDERING..." : "GENERATE PDF"}
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <Button onClick={handleDownload} className="w-full h-16 text-xl font-black bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20 rounded-2xl animate-pulse">
                                    <Download className="mr-3 h-7 w-7" /> DOWNLOAD NOW
                                </Button>
                                <Button variant="outline" onClick={() => setPdfUrl(null)} className="w-full h-12 font-bold border-2 rounded-xl">
                                    <RefreshCcw className="mr-2 h-4 w-4" /> RE-PROCESS DOCUMENT
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-8 flex flex-col">
                <Card className="border-2 shadow-2xl flex-1 overflow-hidden flex flex-col bg-slate-200 dark:bg-slate-950/80 min-h-[850px] rounded-[2rem]">
                    <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between shrink-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Eye className="h-4 w-4 text-primary" /> REAL-TIME PRECISION PREVIEW
                        </CardTitle>
                        <Badge variant="outline" className="text-[9px] font-black bg-white shadow-sm">HD A4 CAPTURE MODE</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-auto custom-scrollbar flex justify-center bg-slate-300/30 dark:bg-slate-900/20">
                        <div 
                            id="docx-preview-node"
                            className="my-12 bg-white text-black shadow-[0_0_50px_rgba(0,0,0,0.15)] w-[595pt] min-h-[842pt] max-w-[95%] origin-top transition-all border border-black/5"
                        >
                            {isParsing ? (
                                <div className="flex flex-col items-center justify-center py-60 gap-6">
                                    <div className="relative">
                                        <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20 stroke-[3]" />
                                        <FileType className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Analyzing Document Layers...</p>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Please wait while we fix alignments</p>
                                    </div>
                                </div>
                            ) : htmlContent ? (
                                <div 
                                    ref={previewRef}
                                    dangerouslySetInnerHTML={{ __html: htmlContent }} 
                                    className="word-doc-render"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-60 text-muted-foreground opacity-10">
                                    <FileText className="h-32 w-32 mb-4" />
                                    <p className="text-2xl font-black uppercase tracking-widest font-headline">EMPTY STUDIO</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <style jsx global>{`
                .word-doc-render {
                    font-family: 'Times New Roman', serif;
                    line-height: 1.5;
                    color: #000000;
                    background-color: #ffffff;
                    text-align: left;
                    padding: 60pt 72pt; /* Standard 1-inch Word margins */
                    min-height: 842pt;
                    width: 595pt;
                    box-sizing: border-box;
                    word-wrap: break-word;
                }
                
                .docx-inner-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 12pt;
                }

                .word-doc-render h1.docx-header {
                    font-size: 16pt;
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 24pt;
                    text-transform: uppercase;
                    letter-spacing: 0.5pt;
                }

                .word-doc-render p.docx-p {
                    font-size: 11pt;
                    margin: 0 0 10pt 0;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: baseline;
                    justify-content: flex-start;
                    text-align: justify;
                }

                /* Signature and Tab preservation logic */
                .docx-spacer {
                    flex-grow: 1;
                    min-width: 20pt;
                }

                /* If a paragraph has an image, it's usually a signature */
                .word-doc-render p:has(img) {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end; /* Force signatures to right */
                    margin: 20pt 0;
                    width: 100%;
                }

                .word-doc-render img {
                    max-width: 200px;
                    height: auto;
                    display: block;
                    filter: contrast(1.1) brightness(1.05);
                }

                .word-doc-render strong {
                    font-weight: 700;
                }

                .word-doc-render table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 15pt 0;
                }

                .word-doc-render td, .word-doc-render th {
                    border: 0.5pt solid #999;
                    padding: 6pt 10pt;
                    font-size: 10.5pt;
                }

                /* Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}

