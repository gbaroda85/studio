"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { 
    UploadCloud, 
    Download, 
    Loader2, 
    X, 
    Plus, 
    Trash2, 
    RotateCw, 
    Type, 
    ImageIcon, 
    Move, 
    CheckCircle2, 
    ShieldCheck, 
    Zap,
    Settings2,
    Layers,
    ChevronUp,
    ChevronDown,
    RefreshCcw,
    FilePenLine,
    SearchCode,
    Sparkles,
    Maximize,
    Palette,
    MousePointer2,
    BringToFront,
    Scale,
    Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import confetti from 'canvas-confetti';

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface OverlayText {
    id: string;
    text: string;
    x: number; 
    y: number;
    size: number;
    color: string;
    font: string;
}

interface OverlayImage {
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    rotation: number;
    opacity: number;
}

interface PageState {
    index: number;
    rotation: number;
    isDeleted: boolean;
    textOverlays: OverlayText[];
    imageOverlays: OverlayImage[];
    previewSrc: string | null;
}

export default function PdfEditor() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [pages, setPages] = useState<PageState[]>([]);
    const [selectedPageIndex, setSelectedId] = useState<number | null>(null);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const overlayImgInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setIsProcessing(true);
            setPages([]);
            setSelectedId(null);
            
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                const totalPages = pdf.numPages;
                const initialPages: PageState[] = [];

                for (let i = 1; i <= totalPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    if (context) {
                        context.fillStyle = '#FFFFFF';
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        await page.render({ canvasContext: context, viewport }).promise;
                        initialPages.push({
                            index: i,
                            rotation: 0,
                            isDeleted: false,
                            textOverlays: [],
                            imageOverlays: [],
                            previewSrc: canvas.toDataURL('image/jpeg', 0.8)
                        });
                    }
                }
                setPages(initialPages);
                if (initialPages.length > 0) setSelectedId(0);
                toast({ title: "PDF Loaded", description: `${totalPages} pages ready for professional editing.` });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to read PDF.' });
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleAddText = () => {
        if (selectedPageIndex === null) return;
        const id = Math.random().toString(36).substr(2, 9);
        const newText: OverlayText = {
            id,
            text: "Add your text",
            x: 20,
            y: 20,
            size: 18,
            color: "#000000",
            font: "Helvetica"
        };
        setPages(prev => prev.map((p, i) => i === selectedPageIndex ? { ...p, textOverlays: [...p.textOverlays, newText] } : p));
        setSelectedElementId(id);
        toast({ title: "Text Layer Added" });
    };

    const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedPageIndex !== null) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const id = Math.random().toString(36).substr(2, 9);
                const newImg: OverlayImage = {
                    id,
                    src: event.target?.result as string,
                    x: 10,
                    y: 30,
                    width: 120,
                    rotation: 0,
                    opacity: 100
                };
                setPages(prev => prev.map((p, i) => i === selectedPageIndex ? { ...p, imageOverlays: [...p.imageOverlays, newImg] } : p));
                setSelectedElementId(id);
                toast({ title: "Image Layer Added", description: "Scale it using the studio sliders." });
            };
            reader.readAsDataURL(file);
        }
        e.target.value = "";
    };

    const handleDeleteElement = (id: string) => {
        if (selectedPageIndex === null) return;
        setPages(prev => prev.map((p, i) => i === selectedPageIndex ? {
            ...p,
            textOverlays: p.textOverlays.filter(t => t.id !== id),
            imageOverlays: p.imageOverlays.filter(img => img.id !== id)
        } : p));
        setSelectedElementId(null);
    };

    const handleDeletePage = (idx: number) => {
        setPages(prev => prev.map((p, i) => i === idx ? { ...p, isDeleted: true } : p));
        if (selectedPageIndex === idx) {
            const nextActive = pages.findIndex((p, i) => !p.isDeleted && i !== idx);
            setSelectedId(nextActive !== -1 ? nextActive : null);
        }
    };

    const handleRotatePage = (idx: number) => {
        setPages(prev => prev.map((p, i) => i === idx ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
    };

    const updateTextOverlay = (pageIdx: number, textId: string, updates: Partial<OverlayText>) => {
        setPages(prev => prev.map((p, i) => i === pageIdx ? {
            ...p,
            textOverlays: p.textOverlays.map(t => t.id === textId ? { ...t, ...updates } : t)
        } : p));
    };

    const updateImageOverlay = (pageIdx: number, imgId: string, updates: Partial<OverlayImage>) => {
        setPages(prev => prev.map((p, i) => i === pageIdx ? {
            ...p,
            imageOverlays: p.imageOverlays.map(img => img.id === imgId ? { ...img, ...updates } : img)
        } : p));
    };

    const handleExport = async () => {
        if (!pdfFile) return;
        setIsExporting(true);
        try {
            const existingPdfBytes = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
            const activePages = pages.filter(p => !p.isDeleted);
            const finalPdfDoc = await PDFDocument.create();

            for (const pageState of activePages) {
                const [copiedPage] = await finalPdfDoc.copyPages(pdfDoc, [pageState.index - 1]);
                copiedPage.setRotation(degrees(pageState.rotation));
                const { width, height } = copiedPage.getSize();

                // Apply Text Overlays
                for (const t of pageState.textOverlays) {
                    let font;
                    if (t.font === 'Times') font = await finalPdfDoc.embedFont(StandardFonts.TimesRomanBold);
                    else if (t.font === 'Courier') font = await finalPdfDoc.embedFont(StandardFonts.CourierBold);
                    else font = await finalPdfDoc.embedFont(StandardFonts.HelveticaBold);

                    const pdfX = (t.x / 100) * width;
                    const pdfY = height - (t.y / 100) * height - t.size; 
                    
                    const hexColor = t.color || "#000000";
                    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
                    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
                    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

                    copiedPage.drawText(t.text, {
                        x: pdfX,
                        y: pdfY,
                        size: t.size,
                        font,
                        color: rgb(r, g, b)
                    });
                }

                // Apply Image Overlays
                for (const img of pageState.imageOverlays) {
                    const imgBytes = await fetch(img.src).then(res => res.arrayBuffer());
                    const isPng = img.src.includes('png');
                    const embeddedImg = isPng ? await finalPdfDoc.embedPng(imgBytes) : await finalPdfDoc.embedJpg(imgBytes);
                    const pdfX = (img.x / 100) * width;
                    const pdfY = height - (img.y / 100) * height - (img.width * (embeddedImg.height / embeddedImg.width));

                    copiedPage.drawImage(embeddedImg, {
                        x: pdfX,
                        y: pdfY,
                        width: img.width,
                        height: img.width * (embeddedImg.height / embeddedImg.width),
                        rotate: degrees(-img.rotation),
                        opacity: img.opacity / 100
                    });
                }

                finalPdfDoc.addPage(copiedPage);
            }

            const pdfBytes = await finalPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Studio-Edit-${pdfFile.name}`;
            link.click();
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#48a9a4', '#fce7eb', '#ffffff']
            });
            toast({ title: "Success!", description: "Professional PDF exported." });
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Export Failed", description: "Encryption error or corrupt file." });
        } finally {
            setIsExporting(false);
        }
    };

    if (!pdfFile) {
        return (
            <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
                <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
                    <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-indigo-600/10 text-indigo-600 shadow-xl relative">
                        <FilePenLine className="size-8" />
                        <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                            <Sparkles className="size-2.5" />
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                        Professional <span className="text-gradient-hero">PDF Editor</span>
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                        Add text, signatures, and manage pages in your document. <br/>100% Private local browser studio.
                    </p>
                </div>

                <Card className={cn(
                    "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50",
                    isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                )}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); }}
                >
                    <CardHeader className="bg-muted/30 border-b p-6 text-center">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 md:p-12">
                        <div 
                            className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="relative">
                                <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                <Zap className="absolute -top-2 -right-2 size-6 md:size-8 text-yellow-500 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">Drop PDF to Edit</p>
                                <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">Vector-layer editing engine active.</p>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                    </CardContent>
                    <CardFooter className="justify-center gap-8 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                        <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                        <div className="flex items-center gap-1.5"><SearchCode className="size-3 text-primary" /> LIVE PREVIEW</div>
                        <div className="flex items-center gap-1.5"><Type className="size-3 text-purple-500" /> TEXT & IMAGE</div>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const selectedPage = selectedPageIndex !== null ? pages[selectedPageIndex] : null;
    const selectedText = selectedPage?.textOverlays.find(t => t.id === selectedElementId);
    const selectedImage = selectedPage?.imageOverlays.find(i => i.id === selectedElementId);

    return (
        <div className="w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4 pb-20 animate-in fade-in duration-700">
            
            {/* 1. LEFT SIDEBAR: PAGE NAVIGATION */}
            <div className="lg:col-span-3 space-y-4 h-full max-h-[85vh] flex flex-col no-print">
                <Card className="border-2 shadow-xl flex-1 flex flex-col overflow-hidden bg-card/50">
                    <CardHeader className="bg-muted/30 border-b p-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Layers className="size-3" /> PAGE STACK
                        </CardTitle>
                        <Badge className="bg-primary text-white font-black">{pages.filter(p => !p.isDeleted).length}</Badge>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-[600px] p-4">
                            <div className="space-y-4">
                                {pages.map((p, i) => !p.isDeleted && (
                                    <div 
                                        key={i} 
                                        onClick={() => { setSelectedId(i); setSelectedElementId(null); }}
                                        className={cn(
                                            "relative aspect-[1/1.414] rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white group shadow-md",
                                            selectedPageIndex === i ? "border-primary ring-4 ring-primary/10 shadow-2xl scale-[1.02]" : "hover:border-primary/40 opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center p-2" style={{ transform: `rotate(${p.rotation}deg)` }}>
                                            <img src={p.previewSrc!} className="max-w-full max-h-full object-contain" alt={`Page ${i+1}`} />
                                        </div>
                                        <div className="absolute top-2 left-2 size-7 rounded-lg bg-black/70 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">P{i + 1}</div>
                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-1.5 translate-y-2 group-hover:translate-y-0">
                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg shadow-xl" onClick={(e) => { e.stopPropagation(); setPages(prev => prev.map((pg, idx) => idx === i ? { ...pg, rotation: (pg.rotation + 90) % 360 } : pg)); }}><RotateCw className="size-4" /></Button>
                                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-lg shadow-xl" onClick={(e) => { e.stopPropagation(); handleDeletePage(i); }}><Trash2 className="size-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-4 border-t bg-muted/10">
                         <Button variant="ghost" onClick={() => setPdfFile(null)} className="w-full font-black text-[10px] uppercase border-2 h-10 hover:bg-destructive/5 hover:text-destructive">
                             <RefreshCcw className="size-3 mr-2" /> Replace PDF
                         </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* 2. CENTER: LIVE EDITOR CANVAS */}
            <div className="lg:col-span-6 flex flex-col gap-6 items-center">
                <Card className="w-full border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden rounded-[2.5rem] bg-slate-900 flex flex-col min-h-[650px] relative">
                    <CardHeader className="bg-white/5 border-b border-white/5 p-4 md:p-6 flex flex-row items-center justify-between z-20">
                         <div className="flex items-center gap-4 text-white">
                            <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20"><Maximize className="size-6" /></div>
                            <div>
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">Live Studio</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase text-white/40">Page {selectedPageIndex !== null ? selectedPageIndex + 1 : '---'} Editor</CardDescription>
                            </div>
                         </div>
                         <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={handleAddText} disabled={selectedPageIndex === null} className="h-10 px-4 bg-white/10 text-white border-white/10 hover:bg-primary hover:text-black font-black uppercase text-[10px] rounded-xl transition-all"><Type className="size-4 mr-2" /> Add Text</Button>
                             <Button variant="outline" size="sm" onClick={() => overlayImgInputRef.current?.click()} disabled={selectedPageIndex === null} className="h-10 px-4 bg-white/10 text-white border-white/10 hover:bg-primary hover:text-black font-black uppercase text-[10px] rounded-xl transition-all"><ImageIcon className="size-4 mr-2" /> Add Image</Button>
                             <input ref={overlayImgInputRef} type="file" className="hidden" accept="image/*" onChange={handleAddImage} />
                         </div>
                    </CardHeader>
                    
                    <CardContent className="p-8 flex items-center justify-center relative overflow-hidden bg-black/40 min-h-[500px] flex-1">
                        {isProcessing && (
                            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-white">
                                <Loader2 className="h-12 w-12 animate-spin text-primary stroke-[3]" />
                                <p className="font-black text-xs uppercase tracking-widest animate-pulse">Rendering Studio...</p>
                            </div>
                        )}
                        
                        {selectedPage ? (
                            <div className="relative shadow-2xl border-8 border-white transform-gpu bg-white max-w-full" style={{ transform: `rotate(${selectedPage.rotation}deg)` }}>
                                <img src={selectedPage.previewSrc!} alt="edit" className="max-h-[65vh] w-auto block object-contain" />
                                
                                {/* TEXT OVERLAYS */}
                                {selectedPage.textOverlays.map(t => (
                                    <div 
                                        key={t.id} 
                                        onClick={() => setSelectedElementId(t.id)}
                                        className={cn(
                                            "absolute z-10 p-1.5 cursor-pointer group select-none transition-all",
                                            selectedElementId === t.id ? "ring-2 ring-primary ring-offset-2 bg-primary/5 rounded" : "hover:ring-1 hover:ring-primary/40"
                                        )}
                                        style={{ left: `${t.x}%`, top: `${t.y}%`, fontSize: `${t.size}px`, fontWeight: '900', color: t.color, fontFamily: t.font, transform: `rotate(${-selectedPage.rotation}deg)` }}
                                    >
                                        {t.text}
                                        {selectedElementId === t.id && (
                                            <div className="absolute -top-6 -right-6 bg-destructive text-white rounded-full size-6 flex items-center justify-center shadow-lg" onClick={(e) => { e.stopPropagation(); handleDeleteElement(t.id); }}>
                                                <Trash2 className="size-3" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* IMAGE OVERLAYS */}
                                {selectedPage.imageOverlays.map(img => (
                                    <div 
                                        key={img.id} 
                                        onClick={() => setSelectedElementId(img.id)}
                                        className={cn(
                                            "absolute z-10 p-1 cursor-pointer group transition-all",
                                            selectedElementId === img.id ? "ring-2 ring-primary ring-offset-2 bg-primary/5 rounded" : "hover:ring-1 hover:ring-primary/40"
                                        )}
                                        style={{ left: `${img.x}%`, top: `${img.y}%`, width: `${img.width}px`, opacity: img.opacity / 100, transform: `rotate(${img.rotation - selectedPage.rotation}deg)` }}
                                    >
                                        <img src={img.src} className="w-full h-auto block" alt="overlay" />
                                        {selectedElementId === img.id && (
                                            <div className="absolute -top-6 -right-6 bg-destructive text-white rounded-full size-6 flex items-center justify-center shadow-lg" onClick={(e) => { e.stopPropagation(); handleDeleteElement(img.id); }}>
                                                <Trash2 className="size-3" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6 text-white/10 p-12">
                                <FilePenLine className="size-24" />
                                <div className="text-center space-y-2">
                                    <p className="text-lg font-black uppercase tracking-tighter">SELECT A PAGE</p>
                                    <p className="text-xs font-bold uppercase opacity-50">Choose a thumbnail from the left stack to start editing</p>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="bg-black/60 p-4 border-t border-white/5 flex justify-center z-10">
                         <div className="flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl">
                            <MousePointer2 className="h-4 w-4 text-primary animate-pulse" /> 
                            Click items on page to edit specific properties
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* 3. RIGHT SIDEBAR: PROPERTIES PANEL */}
            <div className="lg:col-span-3 space-y-6 no-print">
                <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                            <Settings2 className="size-6 text-primary" /> PROPERTIES
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        <Tabs defaultValue="content" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-10 mb-6 bg-muted p-1 rounded-xl">
                                <TabsTrigger value="content" className="font-bold text-[9px] uppercase">Active Item</TabsTrigger>
                                <TabsTrigger value="page" className="font-bold text-[9px] uppercase">Page Actions</TabsTrigger>
                            </TabsList>

                            <TabsContent value="content" className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                {selectedText ? (
                                    <div className="space-y-6">
                                        <Badge className="bg-primary/10 text-primary font-black uppercase text-[10px] px-3 py-1 mb-2">TEXT SETTINGS</Badge>
                                        <div className="space-y-2.5">
                                            <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Text Content</Label>
                                            <Input 
                                                value={selectedText.text} 
                                                onChange={(e) => updateTextOverlay(selectedPageIndex!, selectedElementId!, { text: e.target.value })} 
                                                className="h-10 border-2 font-bold focus-visible:ring-primary" 
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2.5">
                                                <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Font Family</Label>
                                                <Select value={selectedText.font} onValueChange={(v) => updateTextOverlay(selectedPageIndex!, selectedElementId!, { font: v })}>
                                                    <SelectTrigger className="h-10 font-bold border-2"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Helvetica" className="font-bold">Helvetica</SelectItem>
                                                        <SelectItem value="Times" className="font-bold">Times Roman</SelectItem>
                                                        <SelectItem value="Courier" className="font-bold">Courier</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2.5">
                                                <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Text Color</Label>
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {['#000000', '#FF0000', '#0000FF', '#008000', '#FFFFFF'].map(c => (
                                                        <button key={c} onClick={() => updateTextOverlay(selectedPageIndex!, selectedElementId!, { color: c })}
                                                            className={cn("size-6 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200", selectedText.color === c && "ring-primary ring-2")}
                                                            style={{ backgroundColor: c }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-5 pt-2">
                                            <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Font Size</Label><span className="text-[10px] font-mono font-bold text-primary">{selectedText.size}pt</span></div>
                                            <Slider value={[selectedText.size]} min={8} max={100} onValueChange={(v) => updateTextOverlay(selectedPageIndex!, selectedElementId!, { size: v[0] })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                            <div className="space-y-4">
                                                <Label className="text-[9px] font-black uppercase opacity-40">Horizontal %</Label>
                                                <Slider value={[selectedText.x]} min={0} max={100} onValueChange={(v) => updateTextOverlay(selectedPageIndex!, selectedElementId!, { x: v[0] })} />
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[9px] font-black uppercase opacity-40">Vertical %</Label>
                                                <Slider value={[selectedText.y]} min={0} max={100} onValueChange={(v) => updateTextOverlay(selectedPageIndex!, selectedElementId!, { y: v[0] })} />
                                            </div>
                                        </div>
                                    </div>
                                ) : selectedImage ? (
                                    <div className="space-y-6">
                                        <Badge className="bg-purple-500/10 text-purple-600 font-black uppercase text-[10px] px-3 py-1 mb-2">IMAGE SETTINGS</Badge>
                                        <div className="space-y-5">
                                            <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Width Size</Label><span className="text-[10px] font-mono font-bold text-purple-600">{selectedImage.width}px</span></div>
                                            <Slider value={[selectedImage.width]} min={20} max={500} onValueChange={(v) => updateImageOverlay(selectedPageIndex!, selectedElementId!, { width: v[0] })} />
                                        </div>
                                        <div className="space-y-5">
                                            <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Opacity</Label><span className="text-[10px] font-mono font-bold text-purple-600">{selectedImage.opacity}%</span></div>
                                            <Slider value={[selectedImage.opacity]} min={0} max={100} onValueChange={(v) => updateImageOverlay(selectedPageIndex!, selectedElementId!, { opacity: v[0] })} />
                                        </div>
                                        <div className="space-y-5">
                                            <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Rotation</Label><span className="text-[10px] font-mono font-bold text-purple-600">{selectedImage.rotation}°</span></div>
                                            <Slider value={[selectedImage.rotation]} min={0} max={360} onValueChange={(v) => updateImageOverlay(selectedPageIndex!, selectedElementId!, { rotation: v[0] })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                            <div className="space-y-4">
                                                <Label className="text-[9px] font-black uppercase opacity-40">Horizontal %</Label>
                                                <Slider value={[selectedImage.x]} min={0} max={100} onValueChange={(v) => updateImageOverlay(selectedPageIndex!, selectedElementId!, { x: v[0] })} />
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[9px] font-black uppercase opacity-40">Vertical %</Label>
                                                <Slider value={[selectedImage.y]} min={0} max={100} onValueChange={(v) => updateImageOverlay(selectedPageIndex!, selectedElementId!, { y: v[0] })} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center opacity-30 space-y-4 flex flex-col items-center">
                                         <MousePointer2 className="size-16 text-muted-foreground animate-bounce" />
                                         <div className="space-y-1">
                                            <p className="text-xs font-black uppercase leading-tight tracking-widest">Select Element</p>
                                            <p className="text-[10px] font-bold uppercase">Click an item on the page to customize it.</p>
                                         </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="page" className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                {selectedPage ? (
                                    <div className="space-y-4">
                                        <Button variant="outline" className="w-full h-12 rounded-xl border-2 font-black uppercase text-[10px]" onClick={() => handleRotatePage(selectedPageIndex!)}>
                                            <RotateCw className="size-4 mr-2" /> Rotate Page 90°
                                        </Button>
                                        <Button variant="outline" className="w-full h-12 rounded-xl border-2 font-black uppercase text-[10px] border-destructive/20 text-destructive hover:bg-destructive/5" onClick={() => handleDeletePage(selectedPageIndex!)}>
                                            <Trash2 className="size-4 mr-2" /> Delete Page
                                        </Button>
                                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex gap-4 mt-6">
                                            <Sparkles className="size-5 text-primary shrink-0" />
                                            <p className="text-[9px] text-primary/80 font-bold leading-relaxed uppercase">
                                                Page-wide actions are permanent in this session. Be careful!
                                            </p>
                                        </div>
                                    </div>
                                ) : <p className="text-center py-20 opacity-30 text-xs font-bold">SELECT A PAGE FIRST</p>}
                            </TabsContent>
                        </Tabs>

                        <div className="p-5 bg-muted/30 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col gap-4 mt-10">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="size-5 text-green-500" />
                                <span className="text-[10px] font-black uppercase text-green-600">Secure Sanitization</span>
                            </div>
                            <p className="text-[9px] text-muted-foreground font-medium leading-relaxed uppercase">
                                All overlays are re-serialized as native PDF content. Text remains searchable and images remain high resolution.
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/10 p-6 md:p-8 border-t-2">
                        <Button 
                            className="w-full h-16 md:h-20 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all active:scale-95 disabled:opacity-50" 
                            disabled={pages.filter(p => !p.isDeleted).length === 0 || isExporting}
                            onClick={handleExport}
                        >
                            {isExporting ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="size-8 animate-spin" />
                                    <span className="uppercase tracking-tighter">BUILDING PDF...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Download className="size-8" />
                                    <div className="text-left">
                                        <span className="block uppercase tracking-tighter leading-none text-base md:text-xl">SAVE EDITS</span>
                                        <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">DOWNLOAD FINAL FILE</span>
                                    </div>
                                </div>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
