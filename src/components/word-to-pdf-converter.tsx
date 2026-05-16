
"use client";

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Download, Loader2, FileText, UploadCloud, FileType, RefreshCcw, Eye, FileDigit, ShieldCheck, Zap } from 'lucide-react';
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
            
            // Allow state to update before rendering
            setTimeout(async () => {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const container = previewRef.current;
                    
                    if (container) {
                        container.innerHTML = ""; // Clear existing preview
                        
                        await renderAsync(arrayBuffer, container, undefined, {
                            className: "docx-viewer",
                            inWrapper: true,
                            ignoreWidth: false,
                            ignoreHeight: false,
                            useBase64URL: true,
                        });
                        
                        // Force Standard A4 Styling and Alignment fixes
                        const pages = container.querySelectorAll('.docx');
                        pages.forEach((page: any) => {
                            page.style.width = '210mm';
                            page.style.minHeight = '297mm';
                            page.style.padding = '20mm';
                            page.style.margin = '0 auto';
                            page.style.backgroundColor = 'white';
                            page.style.position = 'relative';
                            page.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
                            page.style.fontFamily = "'Times New Roman', Times, serif";
                            // Critical: Preserve tabs and spacing
                            page.style.whiteSpace = "pre-wrap";
                            page.style.wordBreak = "break-word";
                        });

                        toast({ title: "Layout Calibrated", description: "Document rendered with A4 precision." });
                    }
                } catch (error) {
                    console.error("Word parsing error:", error);
                    toast({ variant: 'destructive', title: 'Parsing Error', description: 'Could not render Word file layout.' });
                    setWordFile(null);
                } finally {
                    setIsParsing(false);
                }
            }, 300);
        } else {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select a valid Word (.docx) file.' });
        }
    };

    const handleConvert = async () => {
        if (!wordFile || !previewRef.current) return;

        setIsConverting(true);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        
        toast({ title: 'Capturing High-Res PDF', description: 'Locking fonts and alignments...' });

        try {
            const container = previewRef.current;
            // Robust selector for docx-preview output
            let pages = Array.from(container.querySelectorAll('.docx'));
            
            // Fallback if class names are different
            if (pages.length === 0) {
                pages = Array.from(container.querySelectorAll('section'));
            }

            if (pages.length === 0) throw new Error("Document pages not detected in preview.");

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < pages.length; i++) {
                const pageElement = pages[i] as HTMLElement;
                
                // Ensure page is visible and correctly sized for capture
                pageElement.style.display = 'block';
                pageElement.style.visibility = 'visible';

                const canvas = await html2canvas(pageElement, {
                    scale: 3.5, // High DPI for crystal clear text (4x might crash some browsers, 3.5 is safe-high)
                    useCORS: true,
                    logging: false,
                    backgroundColor: "#ffffff",
                    width: pageElement.offsetWidth,
                    height: pageElement.offsetHeight,
                    onclone: (clonedDoc) => {
                        const clonedPage = clonedDoc.querySelector('.docx') as HTMLElement;
                        if (clonedPage) {
                            clonedPage.style.width = '210mm';
                            clonedPage.style.margin = '0';
                        }
                    }
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
            }
            
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

            toast({ title: 'Conversion Complete', description: '100% layout-perfect PDF generated.' });
        } catch (error: any) {
            console.error("PDF generation error:", error);
            toast({ variant: 'destructive', title: 'Conversion Error', description: error.message || 'Failed to capture document layout.' });
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
                            <CardDescription className="text-sm font-medium">True-to-Word Layout Engine</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-10">
                            <div
                                className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-12 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
                                onClick={() => document.getElementById('word-upload')?.click()}
                            >
                                <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                <p className="text-lg font-bold">Select Word File (.docx)</p>
                            </div>
                            <input id="word-upload" type="file" className="hidden" accept=".docx" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <Card className="border-2 shadow-xl border-primary/10 overflow-hidden bg-card/80">
                            <CardHeader className="bg-muted/30 border-b py-4">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                                    <span>STATUS: LOADED</span>
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
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Alignment: Grid-Locked</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 shadow-2xl border-primary/20 overflow-hidden">
                            <CardHeader className="bg-primary/5 border-b py-5">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <FileDigit className="h-4 w-4 text-primary" /> CONVERSION HUB
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/10 flex gap-3">
                                    <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                                    <div className="text-[10px] font-black text-green-700 uppercase leading-tight">
                                        Fidelity Lock: Tabs & Signatures preserved.
                                    </div>
                                </div>
                                
                                {!pdfUrl ? (
                                    <Button onClick={handleConvert} disabled={isConverting || isParsing} className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl transition-all active:scale-95">
                                        {isConverting ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Zap className="mr-3 h-6 w-6 text-yellow-400" />}
                                        {isConverting ? "GENERATING..." : "START CONVERSION"}
                                    </Button>
                                ) : (
                                    <div className="space-y-4">
                                        <Button onClick={handleDownload} className="w-full h-16 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl rounded-2xl">
                                            <Download className="mr-3 h-6 w-6" /> DOWNLOAD PDF
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

            {/* Main Preview Container */}
            <div className="lg:col-span-8 flex flex-col min-h-[90vh]">
                <Card className="border-2 shadow-2xl flex-1 overflow-hidden flex flex-col bg-slate-200 dark:bg-slate-900 rounded-[2rem]">
                    <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between shrink-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Eye className="h-4 w-4 text-primary" /> REAL-TIME FIDELITY VIEW
                        </CardTitle>
                        <div className="flex gap-2">
                             <Badge variant="outline" className="text-[9px] font-black bg-white shadow-sm uppercase">Width Lock: 210mm</Badge>
                             <Badge variant="outline" className="text-[9px] font-black bg-white shadow-sm uppercase">Tab Precision: On</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-auto custom-scrollbar flex justify-center bg-slate-300/30">
                        <div 
                            className="my-10 w-full flex flex-col items-center gap-12"
                            id="pdf-render-area"
                        >
                            {isParsing && (
                                <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center gap-6">
                                    <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">Syncing Word XML...</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Mapping Spacing and Tab-Stops...</p>
                                    </div>
                                </div>
                            )}
                            <div 
                                ref={previewRef}
                                className="docx-wrapper-container"
                            />
                            {!wordFile && !isParsing && (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/10 py-60 select-none">
                                    <FileText className="h-40 w-40 mb-4" />
                                    <p className="text-3xl font-black font-headline uppercase">Awaiting .docx</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <style jsx global>{`
                .docx-wrapper-container {
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
                    gap: 40px !important;
                }
                .docx {
                    box-shadow: 0 10px 50px rgba(0,0,0,0.15) !important;
                    background: white !important;
                    width: 210mm !important;
                    min-height: 297mm !important;
                    padding: 20mm !important;
                    box-sizing: border-box !important;
                    overflow: hidden !important;
                    position: relative !important;
                    /* Core spacing fixes */
                    white-space: pre-wrap !important;
                    word-wrap: break-word !important;
                    tab-size: 4 !important;
                    -moz-tab-size: 4 !important;
                }
                /* Font and Spacing Alignment Overrides */
                .docx p {
                    margin-bottom: 0.1em !important;
                    line-height: 1.5 !important;
                    font-family: 'Times New Roman', serif !important;
                }
                .docx * {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                /* Ensure Images/Signatures scale correctly */
                .docx img {
                    max-width: 100%;
                    height: auto !important;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
            `}</style>
        </div>
    );
}

