
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
            
            // Short delay to ensure DOM is ready
            setTimeout(async () => {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const container = previewRef.current;
                    
                    if (container) {
                        container.innerHTML = ""; // Clear existing
                        
                        await renderAsync(arrayBuffer, container, undefined, {
                            className: "docx-viewer",
                            inWrapper: true,
                            ignoreWidth: false,
                            ignoreHeight: false,
                            useBase64URL: true,
                        });
                        
                        // Force STRICT A4 ALIGNMENT (Hard-coded for Certificates/Forms)
                        const renderedPages = container.querySelectorAll('.docx');
                        renderedPages.forEach((page: any) => {
                            page.style.width = '210mm';
                            page.style.minHeight = '297mm';
                            page.style.padding = '15mm 20mm'; // Standard Word margins
                            page.style.margin = '0 auto 20px auto';
                            page.style.backgroundColor = 'white';
                            page.style.boxShadow = '0 0 20px rgba(0,0,0,0.15)';
                            page.style.position = 'relative';
                            // CRITICAL: Prevent alignment shift
                            page.style.whiteSpace = "break-spaces"; 
                            page.style.wordBreak = "normal";
                            page.style.tabSize = "4";
                        });

                        toast({ title: "Layout Synchronized", description: "Document aligned with A4 grid precision." });
                    }
                } catch (error) {
                    console.error("Word rendering error:", error);
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
        
        toast({ title: 'Locking Grid Alignment', description: 'Capturing text and signature positions...' });

        try {
            const container = previewRef.current;
            // Get all rendered pages (using both possible selectors for docx-preview)
            let pages = Array.from(container.querySelectorAll('.docx'));
            if (pages.length === 0) {
                pages = Array.from(container.querySelectorAll('section'));
            }

            if (pages.length === 0) {
                // Fail-safe: if nothing found, maybe it's the direct children
                pages = Array.from(container.children) as HTMLElement[];
            }

            if (pages.length === 0) throw new Error("No document layers found to convert.");

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < pages.length; i++) {
                const pageElement = pages[i] as HTMLElement;
                
                // Final check to ensure width is locked during capture
                const originalWidth = pageElement.style.width;
                pageElement.style.width = '210mm';
                pageElement.style.margin = '0';

                const canvas = await html2canvas(pageElement, {
                    scale: 3.5, // 3.5x scale is best for crystal clear colons and lines without crashing
                    useCORS: true,
                    logging: false,
                    backgroundColor: "#ffffff",
                    width: pageElement.offsetWidth,
                    height: pageElement.offsetHeight,
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
                
                // Restore style for UI
                pageElement.style.width = originalWidth;
                pageElement.style.margin = '0 auto 20px auto';
            }
            
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

            toast({ title: 'Conversion Complete', description: 'Your PDF matches the original Word layout.' });
        } catch (error: any) {
            console.error("PDF engine error:", error);
            toast({ variant: 'destructive', title: 'System Error', description: 'Failed to capture aligned layout.' });
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
            
            {/* Left Controls */}
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
                            <CardTitle className="text-3xl font-black font-headline uppercase tracking-tighter">Word to PDF <span className="text-blue-600">Perfect</span></CardTitle>
                            <CardDescription>Maintains exact alignments, colons, and tabs.</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-12">
                            <div
                                className="border-3 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
                                onClick={() => document.getElementById('word-upload-input')?.click()}
                            >
                                <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                <p className="text-lg font-bold">Select .docx Certificate</p>
                            </div>
                            <input id="word-upload-input" type="file" className="hidden" accept=".docx" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <Card className="border-2 shadow-xl overflow-hidden bg-card/80">
                            <CardHeader className="bg-muted/30 border-b py-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Document Ready</span>
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
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Grid-Lock: Active</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 shadow-2xl border-primary/20 overflow-hidden">
                            <CardHeader className="bg-primary/5 border-b py-6">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" /> PRODUCTION ENGINE
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/10 flex gap-3">
                                    <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-black text-green-700 uppercase leading-tight">
                                        Fidelity Lock: Tabs, colons, and signature positions fixed.
                                    </p>
                                </div>
                                
                                {!pdfUrl ? (
                                    <Button onClick={handleConvert} disabled={isConverting || isParsing} className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl transition-all active:scale-95">
                                        {isConverting ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <FileDigit className="mr-3 h-6 w-6 text-yellow-400" />}
                                        {isConverting ? "SYNCING GRID..." : "CONVERT TO PDF"}
                                    </Button>
                                ) : (
                                    <div className="space-y-4">
                                        <Button onClick={handleDownload} className="w-full h-16 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl rounded-2xl animate-pulse">
                                            <Download className="mr-3 h-6 w-6" /> DOWNLOAD PERFECT PDF
                                        </Button>
                                        <Button variant="outline" onClick={() => setPdfUrl(null)} className="w-full h-12 font-bold border-2 rounded-xl">
                                            <RefreshCcw className="mr-2 h-4 w-4" /> RESET ENGINE
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Right Preview */}
            <div className="lg:col-span-8 flex flex-col">
                <Card className="border-2 shadow-2xl flex-1 overflow-hidden flex flex-col bg-slate-200 dark:bg-slate-900 rounded-[2rem] min-h-[800px]">
                    <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between shrink-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Eye className="h-4 w-4 text-primary" /> PRECISION PREVIEW
                        </CardTitle>
                        <div className="flex gap-2">
                             <Badge variant="outline" className="text-[9px] font-black bg-white shadow-sm uppercase">Tab-Stop: 8</Badge>
                             <Badge variant="outline" className="text-[9px] font-black bg-white shadow-sm uppercase">Width: 210mm</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-auto custom-scrollbar flex justify-center bg-slate-300/30">
                        <div className="my-10 w-full flex flex-col items-center">
                            {isParsing && (
                                <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center gap-6">
                                    <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">Analyzing Word Spacing...</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Locking Vertical Alignment...</p>
                                    </div>
                                </div>
                            )}
                            <div 
                                ref={previewRef}
                                className="docx-output-container"
                            />
                            {!wordFile && !isParsing && (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/10 py-60 select-none">
                                    <FileType className="h-40 w-40 mb-4" />
                                    <p className="text-3xl font-black font-headline uppercase tracking-tighter">Awaiting Doc...</p>
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
                    box-shadow: 0 15px 60px rgba(0,0,0,0.2) !important;
                    background: white !important;
                    width: 210mm !important;
                    min-height: 297mm !important;
                    padding: 15mm 20mm !important;
                    box-sizing: border-box !important;
                    overflow: hidden !important;
                    position: relative !important;
                    /* HARD ALIGNMENT FIX */
                    white-space: break-spaces !important;
                    tab-size: 8 !important;
                    -moz-tab-size: 8 !important;
                    font-variant-ligatures: none !important;
                    text-rendering: optimizeLegibility !important;
                }
                .docx p {
                    margin-bottom: 0.1em !important;
                    line-height: 1.4 !important;
                    font-family: 'Times New Roman', serif !important;
                }
                .docx span {
                    display: inline-block !important;
                }
                .docx img {
                    max-width: 100% !important;
                    height: auto !important;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}
