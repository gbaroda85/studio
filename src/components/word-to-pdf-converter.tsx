"use client";

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Download, Loader2, FileText, UploadCloud, FileType, RefreshCcw, Eye, FileDigit, FileCheck, ShieldCheck, Zap } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { renderAsync } from 'docx-preview';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function WordToPdfConverter() {
    const { toast } = useToast();
    const [wordFile, setWordFile] = useState<File | null>(null);
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

        if (file.name.toLowerCase().endsWith('.docx')) {
            setWordFile(file);
            setPdfUrl(null);
            setIsParsing(true);
            
            // Allow state to update and show loader
            setTimeout(async () => {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const container = previewRef.current;
                    
                    if (container) {
                        container.innerHTML = ""; // Clear old content
                        await renderAsync(arrayBuffer, container, undefined, {
                            className: "docx-viewer",
                            inWrapper: true,
                            ignoreWidth: false,
                            ignoreHeight: false,
                            useBase64URL: true,
                            debug: false
                        });
                        toast({ title: "Layout Rendered", description: "Document looks exactly like Word now." });
                    }
                } catch (error) {
                    console.error("Word rendering error:", error);
                    toast({ variant: 'destructive', title: 'Parsing Error', description: 'Could not render Word file accurately.' });
                    setWordFile(null);
                } finally {
                    setIsParsing(false);
                }
            }, 100);
        } else {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select a .docx file.' });
        }
    };

    const handleConvert = async () => {
        if (!wordFile || !previewRef.current) return;

        setIsConverting(true);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        
        toast({ title: 'Capturing High-Fidelity PDF...', description: 'Applying 4x Ultra-HD Scaling.' });

        try {
            const element = previewRef.current;
            
            // To ensure 100% correct layout, we temporarily force fixed width during capture
            const originalStyle = element.style.cssText;
            element.style.width = '816px'; // Standard A4 (8.5in at 96dpi)
            
            const canvas = await html2canvas(element, {
                scale: 4, // Ultra HD Quality for crisp text
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 816,
                scrollX: 0,
                scrollY: 0,
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

            // Add first page
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'SLOW');
            heightLeft -= pageHeight;

            // Handle multi-page overflow
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'SLOW');
                heightLeft -= pageHeight;
            }
            
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

            toast({ title: 'Conversion Success!', description: 'Original layout preserved in HD.' });
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
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        if (previewRef.current) previewRef.current.innerHTML = "";
    };

    return (
        <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 pb-20">
            
            {/* Sidebar Controls */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                {!wordFile ? (
                    <Card
                        className={cn("w-full text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/80 border-foreground/10 bg-card/50", isDragOver && "border-primary ring-4 ring-primary/20")}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); }}
                    >
                        <CardHeader className="pt-10">
                            <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-blue-500/10 text-blue-600">
                                <FileType className="h-10 w-10" />
                            </div>
                            <CardTitle className="text-3xl font-black font-headline tracking-tighter uppercase">Word to PDF <span className="text-blue-600">Pro</span></CardTitle>
                            <CardDescription className="text-sm font-medium">True-to-Life Rendering Engine</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-10">
                            <div
                                className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-12 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
                                onClick={() => document.getElementById('word-upload')?.click()}
                            >
                                <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                <p className="text-lg font-bold">Select Word (.docx) file</p>
                            </div>
                            <input id="word-upload" type="file" className="hidden" accept=".docx" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card className="border-2 shadow-xl border-primary/10 overflow-hidden bg-card/80">
                            <CardHeader className="bg-muted/30 border-b py-4">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                                    <span>FILE LOADED</span>
                                    <Button variant="ghost" size="sm" onClick={reset} className="h-8 text-[10px] font-black hover:text-destructive transition-colors">
                                        <RefreshCcw className="mr-1.5 h-3 w-3" /> CHANGE
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <FileType className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black truncate">{wordFile.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground">{(wordFile.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 shadow-2xl border-primary/20 overflow-hidden">
                            <CardHeader className="bg-primary/5 border-b py-5">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <FileDigit className="h-4 w-4 text-primary" /> ACTION CENTER
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex gap-2 text-green-600 items-center">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase">Local HD Rendering Active</span>
                                </div>
                                
                                {!pdfUrl ? (
                                    <Button onClick={handleConvert} disabled={isConverting || isParsing} className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl transition-all active:scale-95">
                                        {isConverting ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Zap className="mr-3 h-6 w-6 text-yellow-400" />}
                                        {isConverting ? "GENERATING..." : "START CONVERSION"}
                                    </Button>
                                ) : (
                                    <div className="space-y-4">
                                        <Button onClick={handleDownload} className="w-full h-16 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl rounded-2xl animate-pulse">
                                            <Download className="mr-3 h-6 w-6" /> DOWNLOAD PDF
                                        </Button>
                                        <Button variant="outline" onClick={() => setPdfUrl(null)} className="w-full h-12 font-bold border-2 rounded-xl">
                                            <RefreshCcw className="mr-2 h-4 w-4" /> RE-TRY CONVERSION
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Preview Workspace */}
            <div className="lg:col-span-8 flex flex-col min-h-[90vh]">
                <Card className="border-2 shadow-2xl flex-1 overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-900 rounded-[2rem]">
                    <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between shrink-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Eye className="h-4 w-4 text-primary" /> WYSIWYG PREVIEW
                        </CardTitle>
                        <Badge variant="outline" className="text-[9px] font-black bg-white shadow-sm uppercase">HD 4x Scaling</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-auto custom-scrollbar bg-slate-300/20 flex justify-center">
                        <div 
                            className="my-10 bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] w-[816px] min-h-[1056px] relative"
                            id="pdf-render-area"
                        >
                            {isParsing && (
                                <div className="absolute inset-0 z-20 bg-white/90 flex flex-col items-center justify-center gap-6">
                                    <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Emulating Word Document...</p>
                                </div>
                            )}
                            <div 
                                ref={previewRef}
                                className="docx-wrapper-inner"
                            />
                            {!wordFile && !isParsing && (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/20 py-60">
                                    <FileText className="h-40 w-40 mb-4" />
                                    <p className="text-3xl font-black font-headline uppercase">Empty Studio</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <style jsx global>{`
                /* Overriding docx-preview default wrapper styles for A4 precision */
                .docx-viewer {
                    padding: 0 !important;
                    margin: 0 !important;
                    background: white !important;
                }
                .docx-wrapper {
                    padding: 0 !important;
                    background: transparent !important;
                    display: block !important;
                }
                .docx {
                    margin: 0 !important;
                    padding: 1in !important; /* Standard Word Margins */
                    width: 100% !important;
                    min-height: 11in !important;
                    box-shadow: none !important;
                    box-sizing: border-box !important;
                    font-family: 'Times New Roman', serif !important;
                }
                /* Custom Scrollbar for Preview */
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}
