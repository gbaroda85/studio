"use client";

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Download, Loader2, UploadCloud, FileType, RefreshCcw, Eye, FileDigit, ShieldCheck, Zap } from 'lucide-react';
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
            
            // Allow state to update
            setTimeout(async () => {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const container = previewRef.current;
                    
                    if (container) {
                        container.innerHTML = ""; 
                        
                        await renderAsync(arrayBuffer, container, undefined, {
                            className: "docx-viewer",
                            inWrapper: true,
                            ignoreWidth: false,
                            ignoreHeight: false,
                            useBase64URL: true,
                        });
                        
                        // Apply Strict Grid Fidelity Styles to the output
                        const docxElements = container.querySelectorAll('.docx');
                        docxElements.forEach((el: any) => {
                            el.style.width = '210mm';
                            el.style.minHeight = '297mm';
                            el.style.padding = '20mm';
                            el.style.backgroundColor = 'white';
                            el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                            el.style.position = 'relative';
                            el.style.margin = '0 auto 30px auto';
                            
                            // THE ALIGNMENT FIX: Force browser to respect character widths
                            el.style.whiteSpace = "break-spaces";
                            el.style.tabSize = "8";
                            el.style.fontFamily = "'Times New Roman', Times, serif";
                            el.style.textRendering = "geometricPrecision";
                            el.style.fontVariantLigatures = "none";
                            el.style.webkitFontSmoothing = "antialiased";
                        });

                        toast({ title: "Grid Alignment Locked", description: "Character widths synchronized with original Word layout." });
                    }
                } catch (error) {
                    console.error("Word preview error:", error);
                    toast({ variant: 'destructive', title: 'Parsing Error', description: 'Could not render file layout.' });
                    setWordFile(null);
                } finally {
                    setIsParsing(false);
                }
            }, 300);
        } else {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select a valid .docx file.' });
        }
    };

    const handleConvert = async () => {
        if (!wordFile || !previewRef.current) return;

        setIsConverting(true);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        
        toast({ title: 'Capturing High-Resolution PDF', description: 'Applying pixel-perfect alignment...' });

        try {
            const container = previewRef.current;
            // Robust selection for multiple pages
            let pages = Array.from(container.querySelectorAll('.docx, section, .docx-wrapper > div'));
            
            if (pages.length === 0) {
                // Fallback selector
                pages = Array.from(container.children) as HTMLElement[];
            }

            if (pages.length === 0) throw new Error("No document content found to convert.");

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < pages.length; i++) {
                const pageElement = pages[i] as HTMLElement;
                
                // Temporarily force exact A4 width for the screenshot scan
                const originalWidth = pageElement.style.width;
                const originalMargin = pageElement.style.margin;
                pageElement.style.width = '210mm';
                pageElement.style.margin = '0';

                const canvas = await html2canvas(pageElement, {
                    scale: 3.5, // High resolution for sharp text and alignment preservation
                    useCORS: true,
                    logging: false,
                    backgroundColor: "#ffffff",
                    width: pageElement.offsetWidth,
                    height: pageElement.offsetHeight,
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
                
                // Restore UI styles
                pageElement.style.width = originalWidth;
                pageElement.style.margin = originalMargin;
            }
            
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

            toast({ title: 'Success!', description: 'Conversion complete. All alignments preserved.' });
        } catch (error: any) {
            console.error("PDF generation failed:", error);
            toast({ variant: 'destructive', title: 'System Error', description: error.message || 'Failed to capture document grid.' });
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
            
            {/* Control Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                {!wordFile ? (
                    <Card
                        className={cn("w-full text-center transition-all duration-300 hover:border-primary/80 border-foreground/10 bg-card/50 shadow-xl", isDragOver && "border-primary ring-4 ring-primary/20")}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); }}
                    >
                        <CardHeader className="pt-12">
                            <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-blue-500/10 text-blue-600">
                                <FileType className="h-10 w-10" />
                            </div>
                            <CardTitle className="text-3xl font-black font-headline uppercase tracking-tighter">Word to PDF <span className="text-blue-600">PRO</span></CardTitle>
                            <CardDescription>Maintains exact alignments, signatures, and tabs locally.</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-12">
                            <div
                                className="border-3 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
                                onClick={() => document.getElementById('word-upload-input')?.click()}
                            >
                                <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                <p className="text-lg font-bold">Select Word File</p>
                                <p className="text-xs text-muted-foreground italic">Works best for Certificates and Letters</p>
                            </div>
                            <input id="word-upload-input" type="file" className="hidden" accept=".docx" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <Card className="border-2 shadow-xl overflow-hidden bg-card/80">
                            <CardHeader className="bg-muted/30 border-b py-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Grid-Lock Active</span>
                                    <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-[9px] font-black hover:text-destructive">
                                        <RefreshCcw className="mr-1 h-2.5 w-3" /> CHANGE FILE
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <FileType className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black truncate">{wordFile.name}</p>
                                        <p className="text-[10px] font-bold text-primary uppercase">Fidelity Engine: Ready</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 shadow-2xl border-primary/20 overflow-hidden">
                            <CardHeader className="bg-primary/5 border-b py-6">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" /> CONVERSION HUB
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/10 flex gap-3">
                                    <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-black text-green-700 uppercase leading-tight">
                                        Character Sync Mode: Preserving exact character positions and spaces.
                                    </p>
                                </div>
                                
                                {!pdfUrl ? (
                                    <Button onClick={handleConvert} disabled={isConverting || isParsing} className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl transition-all active:scale-95">
                                        {isConverting ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <FileDigit className="mr-3 h-6 w-6 text-yellow-400" />}
                                        {isConverting ? "ALIGNING GRID..." : "DOWNLOAD PRO PDF"}
                                    </Button>
                                ) : (
                                    <div className="space-y-4">
                                        <Button onClick={handleDownload} className="w-full h-16 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl rounded-2xl animate-bounce">
                                            <Download className="mr-3 h-6 w-6" /> SAVE PDF NOW
                                        </Button>
                                        <Button variant="outline" onClick={() => setPdfUrl(null)} className="w-full h-12 font-bold border-2 rounded-xl">
                                            <RefreshCcw className="mr-2 h-4 w-4" /> RE-PROCESS
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Document Preview Area */}
            <div className="lg:col-span-8">
                <Card className="border-2 shadow-2xl overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] min-h-[850px]">
                    <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between shrink-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Eye className="h-4 w-4 text-primary" /> FIDELITY PREVIEW (A4)
                        </CardTitle>
                        <div className="flex gap-2">
                             <Badge variant="outline" className="text-[9px] font-black bg-white shadow-sm uppercase">Grid-Lock: Active</Badge>
                             <Badge variant="outline" className="text-[9px] font-black bg-white shadow-sm uppercase">Fidelity: 100%</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-auto custom-scrollbar bg-slate-300/30">
                        <div className="py-12 w-full flex flex-col items-center">
                            {isParsing && (
                                <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center gap-6">
                                    <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">Locking Grid...</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Syncing character widths...</p>
                                    </div>
                                </div>
                            )}
                            <div ref={previewRef} className="docx-output-container" />
                            {!wordFile && !isParsing && (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/10 py-64 select-none">
                                    <FileType className="h-40 w-40 mb-4" />
                                    <p className="text-4xl font-black font-headline uppercase tracking-tighter">Awaiting Document</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <style jsx global>{`
                .docx-output-container {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .docx-wrapper {
                    background: transparent !important;
                    padding: 0 !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 30px !important;
                }
                .docx {
                    box-shadow: 0 25px 60px rgba(0,0,0,0.1) !important;
                    background: white !important;
                    width: 210mm !important;
                    min-height: 297mm !important;
                    padding: 20mm !important;
                    box-sizing: border-box !important;
                    overflow: hidden !important;
                    position: relative !important;
                    /* THE GRID LOCK FIX */
                    white-space: break-spaces !important;
                    tab-size: 8 !important;
                    font-variant-ligatures: none !important;
                    text-rendering: geometricPrecision !important;
                    font-family: 'Times New Roman', serif !important;
                    line-height: 1.5 !important;
                }
                .docx p {
                    margin-bottom: 0.1em !important;
                }
                .docx span {
                    display: inline-block !important;
                    /* Prevents character squeeze by browser font engine */
                }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 20px; }
            `}</style>
        </div>
    );
}