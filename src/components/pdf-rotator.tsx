"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument, degrees, PDFName } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    RotateCw, 
    X, 
    ShieldCheck, 
    Zap, 
    RefreshCcw, 
    CheckCircle2, 
    Sparkles,
    Eye,
    LayoutGrid,
    Monitor,
    MousePointer2,
    Settings2,
    RotateCcw,
    FileDigit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// HARDCODED STABLE VERSION FOR WORKER
const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
}

interface PageItem {
    id: string;
    index: number;
    rotation: number; // 0, 90, 180, 270
    previewSrc: string;
}

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

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function PdfRotator() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [pages, setPages] = useState<PageItem[]>([]);
    const [progress, setProgress] = useState(0);
    const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (rotatedPdfUrl) URL.revokeObjectURL(rotatedPdfUrl);
        }
    }, [rotatedPdfUrl]);

    const handleFileChange = async (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setPages([]);
            setRotatedPdfUrl(null);
            setIsRendering(true);
            setProgress(0);

            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ 
                    data: new Uint8Array(arrayBuffer),
                    cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                    cMapPacked: true
                }).promise;
                const totalPages = pdf.numPages;

                const newPages: PageItem[] = [];
                for (let i = 1; i <= totalPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 0.8 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    if (context) {
                        context.fillStyle = '#FFFFFF';
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        await page.render({ canvasContext: context, viewport }).promise;
                        newPages.push({
                            id: Math.random().toString(36).substr(2, 9),
                            index: i,
                            rotation: 0,
                            previewSrc: canvas.toDataURL('image/jpeg', 0.8)
                        });
                    }
                    setProgress(Math.round((i / totalPages) * 100));
                }
                setPages(newPages);
                toast({ title: 'PDF Loaded', description: `Rendered ${newPages.length} pages visually.` });
            } catch (e) {
                console.error(e);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to process document.' });
            } finally {
                setIsRendering(false);
            }
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select a PDF file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const rotatePage = (id: string) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
        setRotatedPdfUrl(null);
    };

    const rotateAll = (deg: number) => {
        if (deg === 0) {
            setPages(prev => prev.map(p => ({ ...p, rotation: 0 })));
        } else {
            setPages(prev => prev.map(p => ({ ...p, rotation: (p.rotation + deg) % 360 })));
        }
        setRotatedPdfUrl(null);
        toast({ 
            title: deg === 0 ? "Rotations Reset" : "Rotated All Pages", 
            description: deg === 0 ? "All pages set to original orientation." : `Rotated entire stack by another ${deg}°.` 
        });
    };

    const handleSavePdf = async () => {
        if (!pdfFile) return;
        setIsSaving(true);
        try {
            const existingPdfBytes = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
            const pdfPages = pdfDoc.getPages();

            pages.forEach(p => {
                const page = pdfPages[p.index - 1];
                const currentRot = page.getRotation().angle;
                page.setRotation(degrees(currentRot + p.rotation));
            });

            // Set Viewer Preferences to prevent "huge" display
            const catalog = pdfDoc.catalog;
            catalog.set(PDFName.of('ViewerPreferences'), pdfDoc.context.obj({
                FitWindow: true,
                CenterWindow: true,
                DisplayDocTitle: true
            }));

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setRotatedPdfUrl(url);
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#f3cc8a', '#ffffff']
            });

            toast({ title: "Success!", description: "PDF rotation metadata updated." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Save Error', description: "Check if document is password protected." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = () => {
        if (!rotatedPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = rotatedPdfUrl;
        link.download = `rotated-${pdfFile.name}`;
        link.click();
    };

    const handleReset = () => {
        setPdfFile(null);
        setPages([]);
        setRotatedPdfUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    if (!pdfFile) {
        return (
            <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4 mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 mb-4">
                    <div className="mx-auto mb-2 grid size-16 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-xl relative">
                        <RotateCw className="size-8" />
                        <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                            <Sparkles className="size-2.5" />
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                        PDF <span className="text-gradient-hero">Rotator Studio</span>
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                        Fix sideways scans and upside-down documents instantly. <br/>100% Private local RAM processing.
                    </p>
                </motion.div>

                <Card className={cn(
                    "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 dark:hover:shadow-primary/20 cursor-pointer select-none",
                    isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                )}
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <CardHeader className="bg-muted/30 border-b p-6 text-center">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 md:p-16">
                        <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center space-y-6 bg-muted/30 group">
                            <div className="relative">
                                <UploadCloud className="size-14 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                            </div>
                            <div className="text-center px-4">
                                <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop PDF to Rotate</p>
                                <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">100% Private local processing.</p>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                    </CardContent>
                    <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                        <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-600" /> SECURE RAM</div>
                        <div className="flex items-center gap-1.5"><Monitor className="size-3.5 text-primary" /> VISUAL GRID</div>
                        <div className="flex items-center gap-1.5"><RotateCw className="size-3.5 text-yellow-500" /> INSTANT FIX</div>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                        <Settings2 className="size-5 md:size-6" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter">Studio <span className="text-primary">Panel</span></h2>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {/* Header download button removed per user request */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Viewport: Page Grid */}
                <div className="lg:col-span-8">
                    <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                        <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="h-4 w-4 text-primary" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Document Map</CardTitle>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="bg-primary/10 text-primary font-black text-[9px] px-3 py-1 rounded-full border-none">
                                    {pages.length} PAGES DETECTED
                                </Badge>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleReset} 
                                    className="h-8 text-[9px] font-black uppercase border-2 border-primary/10 hover:bg-destructive/5 hover:text-destructive px-3 rounded-lg"
                                >
                                    <RefreshCcw className="mr-1.5 size-3" /> Change PDF
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 md:p-8 lg:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[450px]">
                            {isRendering ? (
                                <div className="h-full flex flex-col items-center justify-center gap-8 py-20">
                                    <div className="relative">
                                        <Loader2 className="h-20 w-20 animate-spin text-primary opacity-20 stroke-[3]" />
                                        <Monitor className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
                                    </div>
                                    <div className="space-y-3 w-full max-w-xs text-center">
                                        <p className="font-black text-sm text-primary uppercase tracking-widest animate-pulse">Rendering Document Index...</p>
                                        <Progress value={progress} className="h-1.5 shadow-inner" />
                                    </div>
                                </div>
                            ) : (
                                <ScrollArea className="h-[500px] md:h-[700px] w-full p-2">
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                        {pages.map((p) => (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                                key={p.id}
                                                className="group relative aspect-[1/1.414] rounded-xl overflow-hidden border-2 bg-white shadow-xl transition-all hover:border-primary/40"
                                            >
                                                <div className="absolute top-2 left-2 size-7 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white z-20 border border-white/10">
                                                    {p.index}
                                                </div>
                                                
                                                <div className="size-full flex items-center justify-center p-3 transition-transform duration-300" style={{ transform: `rotate(${p.rotation}deg)` }}>
                                                    <img src={p.previewSrc} className="max-w-full max-h-full object-contain shadow-sm" alt="p" />
                                                </div>

                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />

                                                {/* Permanent Rotate Icon for discoverability */}
                                                <div className="absolute bottom-2 right-2 z-20 transition-all transform hover:scale-110">
                                                    <Button size="icon" className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-2xl border-2 border-white/20" onClick={() => rotatePage(p.id)}>
                                                        <RotateCw className="size-5" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <ScrollBar />
                                </ScrollArea>
                            )}
                        </CardContent>
                        <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 flex justify-center items-center relative">
                             <div className="inline-flex items-center gap-3 px-8 py-3 bg-black/80 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-3xl z-40">
                                <MousePointer2 className="size-3.5 text-primary animate-pulse" /> Click icons to rotate pages individually
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* Sidebar: Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-2xl md:rounded-[2.5rem]">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-5 md:p-8">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter">
                                <RotateCw className="size-4 md:size-5 text-primary" /> Studio Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Bulk Rotation</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => rotateAll(90)} className="btn-pos-uiverse h-12 !ring-[3px] !ring-slate-950 dark:!ring-white transition-all" data-label="90° RIGHT" />
                                    <button onClick={() => rotateAll(180)} className="btn-pos-uiverse h-12 !ring-[3px] !ring-slate-950 dark:!ring-white transition-all" data-label="180° FLIP" />
                                    <button onClick={() => rotateAll(270)} className="btn-pos-uiverse h-12 !ring-[3px] !ring-slate-950 dark:!ring-white transition-all" data-label="90° LEFT" />
                                    <button onClick={() => rotateAll(0)} className="btn-pos-uiverse h-12 !ring-[3px] !ring-slate-950 dark:!ring-white transition-all" data-label="RESET ALL" />
                                </div>
                            </div>

                            <div className="p-5 bg-primary/5 rounded-[1.5rem] border-2 border-primary/10 flex gap-4 shadow-inner">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20"><Zap className="size-5 text-yellow-500 animate-pulse" /></div>
                                <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase text-left">
                                    <span className="font-black block mb-1 text-primary">VECTOR LOCK:</span>
                                    Rotation is applied as metadata. Original quality is preserved 100%.
                                </p>
                            </div>

                            <Separator className="opacity-10" />

                            <div className="space-y-4">
                                {!rotatedPdfUrl ? (
                                    <Button 
                                        className="magic-button w-full h-16 md:h-18 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-4" 
                                        onClick={handleSavePdf}
                                        disabled={isSaving || isRendering || pages.length === 0}
                                    >
                                        <StarIcons />
                                        {isSaving ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="size-6 md:size-7 animate-spin" />
                                                <span className="uppercase text-sm md:text-base tracking-tighter">SAVING...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <FileDigit className="size-6 md:size-7 text-white/50 group-hover:scale-125 transition-transform" />
                                                <span className="uppercase tracking-tighter text-lg md:text-xl">SAVE PDF</span>
                                            </div>
                                        )}
                                    </Button>
                                ) : (
                                    <Button onClick={handleDownload} className="magic-button magic-button-success w-full h-16 md:h-18 text-lg font-black bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 rounded-full transition-all active:scale-95 flex items-center justify-center gap-4 px-10">
                                        <StarIcons />
                                        <Download className="mr-3 size-7 md:size-8 group-hover:translate-y-1 transition-transform" /> 
                                        <span className="uppercase tracking-tighter">DOWNLOAD PDF</span>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-4 border-t border-white/10 flex justify-center gap-4 opacity-40 text-[7px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-1"><ShieldCheck className="size-2.5 text-green-500" /> SECURE RAM</div>
                            <div className="flex items-center gap-1"><Zap className="size-2.5 text-yellow-500" /> LOSSLESS</div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
