"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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
    Sparkles
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
}

interface OverlayImage {
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    rotation: number;
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
    const [activeEditType, setActiveEditType] = useState<'none' | 'text' | 'image'>('none');
    
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
                toast({ title: "PDF Loaded", description: `${totalPages} pages ready for editing.` });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to read PDF.' });
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleAddText = () => {
        if (selectedPageIndex === null) return;
        const newText: OverlayText = {
            id: Math.random().toString(36).substr(2, 9),
            text: "Double click to edit",
            x: 10,
            y: 10,
            size: 14
        };
        setPages(prev => prev.map((p, i) => i === selectedPageIndex ? { ...p, textOverlays: [...p.textOverlays, newText] } : p));
        setActiveEditType('text');
        toast({ title: "Text Added", description: "Use sliders to position it." });
    };

    const handleAddImage = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedPageIndex !== null) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newImg: OverlayImage = {
                    id: Math.random().toString(36).substr(2, 9),
                    src: event.target?.result as string,
                    x: 10,
                    y: 20,
                    width: 100,
                    rotation: 0
                };
                setPages(prev => prev.map((p, i) => i === selectedPageIndex ? { ...p, imageOverlays: [...p.imageOverlays, newImg] } : p));
                setActiveEditType('image');
                toast({ title: "Image Added", description: "Perfect for signatures or logos." });
            };
            reader.readAsDataURL(file);
        }
        e.target.value = "";
    };

    const handleDeletePage = (idx: number) => {
        setPages(prev => prev.map((p, i) => i === idx ? { ...p, isDeleted: true } : p));
        if (selectedPageIndex === idx) setSelectedId(null);
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
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            const activePages = pages.filter(p => !p.isDeleted);
            const finalPdfDoc = await PDFDocument.create();

            for (const pageState of activePages) {
                const [copiedPage] = await finalPdfDoc.copyPages(pdfDoc, [pageState.index - 1]);
                copiedPage.setRotation(degrees(pageState.rotation));
                const { width, height } = copiedPage.getSize();

                // Apply Text Overlays
                for (const t of pageState.textOverlays) {
                    const pdfX = (t.x / 100) * width;
                    const pdfY = height - (t.y / 100) * height - t.size; 
                    copiedPage.drawText(t.text, {
                        x: pdfX,
                        y: pdfY,
                        size: t.size,
                        font: helveticaFont,
                        color: rgb(0, 0, 0)
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
                        rotate: degrees(-img.rotation)
                    });
                }

                finalPdfDoc.addPage(copiedPage);
            }

            const pdfBytes = await finalPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `edited-${pdfFile.name}`;
            link.click();
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#48a9a4', '#fce7eb', '#ffffff']
            });
            toast({ title: "Success!", description: "Edited PDF saved locally." });
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Export Failed", description: "Check if the original PDF is secured." });
        } finally {
            setIsExporting(false);
        }
    };

    const handleReset = () => {
        setPdfFile(null);
        setPages([]);
        setSelectedId(null);
    };

    const selectedPage = selectedPageIndex !== null ? pages[selectedPageIndex] : null;

    if (!pdfFile) {
        return (
            <Card className={cn("w-full max-w-2xl text-center transition-all duration-300 bg-card/50 hover:border-primary/80 hover:shadow-2xl border-2 border-dashed mx-auto", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); }}>
                <CardHeader className="pt-12">
                    <div className="mx-auto mb-4 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary shadow-inner">
                        <FilePenLine className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-black uppercase tracking-tight">Professional PDF Editor</CardTitle>
                    <CardDescription className="text-sm font-bold opacity-60 uppercase tracking-widest">Add Text, Images & Manage Pages Locally.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 md:p-16">
                    <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <div className="relative">
                            <UploadCloud className="size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Zap className="absolute -top-1 -right-1 size-6 text-yellow-500 animate-pulse" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold uppercase tracking-tight">Drop PDF to start editing</p>
                            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase opacity-60 tracking-widest">Supports Multi-page documents.</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                </CardContent>
                <CardFooter className="justify-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> 100% PRIVATE</div>
                    <div className="flex items-center gap-1.5"><SearchCode className="size-3 text-primary" /> LIVE STUDIO</div>
                    <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-purple-500" /> BATCH ACTIONS</div>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4 pb-20 animate-in fade-in duration-700">
            
            {/* 1. PAGE STACK (LIST) */}
            <div className="lg:col-span-3 space-y-4 h-full max-h-[85vh] flex flex-col">
                <Card className="border-2 shadow-xl flex-1 flex flex-col overflow-hidden bg-card/50">
                    <CardHeader className="bg-muted/30 border-b p-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">DOCUMENT PAGES</CardTitle>
                        <Badge className="bg-primary text-white font-black">{pages.filter(p => !p.isDeleted).length}</Badge>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-[600px] p-4">
                            <div className="grid grid-cols-1 gap-4">
                                {pages.map((p, i) => !p.isDeleted && (
                                    <div 
                                        key={i} 
                                        onClick={() => setSelectedId(i)}
                                        className={cn(
                                            "relative aspect-[1/1.414] rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white group shadow-md",
                                            selectedPageIndex === i ? "border-primary ring-4 ring-primary/10 shadow-2xl" : "hover:border-primary/40"
                                        )}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center p-2" style={{ transform: `rotate(${p.rotation}deg)` }}>
                                            <img src={p.previewSrc!} className="max-w-full max-h-full object-contain" alt={`P${i+1}`} />
                                        </div>
                                        <div className="absolute top-2 left-2 size-7 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">P{i + 1}</div>
                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1.5">
                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg shadow-lg" onClick={(e) => { e.stopPropagation(); handleRotatePage(i); }}><RotateCw className="size-4" /></Button>
                                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-lg shadow-lg" onClick={(e) => { e.stopPropagation(); handleDeletePage(i); }}><Trash2 className="size-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-4 border-t bg-muted/10">
                         <Button variant="outline" className="w-full font-black text-[10px] uppercase border-2 h-10" onClick={handleReset}><RefreshCcw className="size-3 mr-2" /> Start Over</Button>
                    </CardFooter>
                </Card>
            </div>

            {/* 2. EDITOR STUDIO (CANVAS PREVIEW) */}
            <div className="lg:col-span-6 flex flex-col gap-6 items-center">
                <Card className="w-full border-none shadow-3xl overflow-hidden rounded-[2.5rem] bg-slate-900 flex flex-col min-h-[600px]">
                    <CardHeader className="bg-white/5 border-b border-white/5 p-4 md:p-6 flex flex-row items-center justify-between">
                         <div className="flex items-center gap-4 text-white">
                            <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20"><Maximize className="size-6" /></div>
                            <div>
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">Live Editor</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase text-white/40">Page {selectedPageIndex !== null ? selectedPageIndex + 1 : '---'} in focus</CardDescription>
                            </div>
                         </div>
                         <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={handleAddText} disabled={selectedPageIndex === null} className="h-10 px-4 bg-white/10 text-white border-white/10 hover:bg-primary hover:text-black font-black uppercase text-[10px] rounded-xl"><Type className="size-4 mr-2" /> Text</Button>
                             <Button variant="outline" size="sm" onClick={() => overlayImgInputRef.current?.click()} disabled={selectedPageIndex === null} className="h-10 px-4 bg-white/10 text-white border-white/10 hover:bg-primary hover:text-black font-black uppercase text-[10px] rounded-xl"><ImageIcon className="size-4 mr-2" /> Image</Button>
                             <input ref={overlayImgInputRef} type="file" className="hidden" accept="image/*" onChange={handleAddImage} />
                         </div>
                    </CardHeader>
                    <CardContent className="p-8 flex items-center justify-center relative overflow-hidden bg-black/40 min-h-[500px]">
                        {isProcessing && <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white font-black animate-pulse uppercase tracking-[0.3em]">Processing...</div>}
                        
                        {selectedPage ? (
                            <div className="relative shadow-2xl border-4 border-white transform-gpu bg-white max-w-full" style={{ transform: `rotate(${selectedPage.rotation}deg)` }}>
                                <img src={selectedPage.previewSrc!} alt="edit" className="max-h-[65vh] w-auto block object-contain" />
                                
                                {/* RENDER TEXT OVERLAYS */}
                                {selectedPage.textOverlays.map(t => (
                                    <div key={t.id} className="absolute z-10 p-1 border border-dashed border-primary/40 cursor-move hover:bg-primary/5 transition-colors"
                                         style={{ left: `${t.x}%`, top: `${t.y}%`, fontSize: `${t.size}px`, fontWeight: '900', color: '#000', transform: `rotate(${-selectedPage.rotation}deg)` }}>
                                        {t.text}
                                    </div>
                                ))}

                                {/* RENDER IMAGE OVERLAYS */}
                                {selectedPage.imageOverlays.map(img => (
                                    <div key={img.id} className="absolute z-10 p-1 border border-dashed border-primary/40 cursor-move hover:bg-primary/5"
                                         style={{ left: `${img.x}%`, top: `${img.y}%`, width: `${img.width}px`, transform: `rotate(${img.rotation - selectedPage.rotation}deg)` }}>
                                        <img src={img.src} className="w-full h-auto" alt="overlay" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-white/20">
                                <FilePenLine className="size-20" />
                                <p className="text-xs font-black uppercase tracking-widest">Select a page to start editing</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-black/60 p-4 border-t border-white/5 flex justify-center">
                         <div className="flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                            <Move className="h-4 w-4 text-primary animate-pulse" /> Precision alignment active
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* 3. SETTINGS & EXPORT PANEL */}
            <div className="lg:col-span-3 space-y-6">
                <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                            <Settings2 className="size-6 text-primary" /> STUDIO PANEL
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-8">
                        {selectedPage && (activeEditType === 'text' || activeEditType === 'image') ? (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <Tabs defaultValue={activeEditType} onValueChange={(v) => setActiveEditType(v as 'text' | 'image')}>
                                    <TabsList className="grid w-full grid-cols-2 h-10 mb-6 bg-muted p-1 rounded-xl">
                                        <TabsTrigger value="text" className="font-bold text-[9px] uppercase">Text Controls</TabsTrigger>
                                        <TabsTrigger value="image" className="font-bold text-[9px] uppercase">Image Controls</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="text" className="space-y-6">
                                        {selectedPage.textOverlays.length > 0 ? (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase opacity-60">Content</Label>
                                                    <Input value={selectedPage.textOverlays[selectedPage.textOverlays.length - 1].text} 
                                                           onChange={(e) => updateTextOverlay(selectedPageIndex!, selectedPage.textOverlays[selectedPage.textOverlays.length - 1].id, { text: e.target.value })} 
                                                           className="h-10 border-2 font-bold" />
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black uppercase opacity-60">X-Position (%)</Label>
                                                    <Slider value={[selectedPage.textOverlays[selectedPage.textOverlays.length - 1].x]} min={0} max={100} 
                                                            onValueChange={(v) => updateTextOverlay(selectedPageIndex!, selectedPage.textOverlays[selectedPage.textOverlays.length - 1].id, { x: v[0] })} />
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black uppercase opacity-60">Y-Position (%)</Label>
                                                    <Slider value={[selectedPage.textOverlays[selectedPage.textOverlays.length - 1].y]} min={0} max={100} 
                                                            onValueChange={(v) => updateTextOverlay(selectedPageIndex!, selectedPage.textOverlays[selectedPage.textOverlays.length - 1].id, { y: v[0] })} />
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black uppercase opacity-60">Size (pt)</Label>
                                                    <Slider value={[selectedPage.textOverlays[selectedPage.textOverlays.length - 1].size]} min={8} max={72} 
                                                            onValueChange={(v) => updateTextOverlay(selectedPageIndex!, selectedPage.textOverlays[selectedPage.textOverlays.length - 1].id, { size: v[0] })} />
                                                </div>
                                            </div>
                                        ) : <p className="text-center py-10 opacity-30 text-[10px] font-bold uppercase">No text added yet</p>}
                                    </TabsContent>

                                    <TabsContent value="image" className="space-y-6">
                                        {selectedPage.imageOverlays.length > 0 ? (
                                            <div className="space-y-6">
                                                 <div className="space-y-4">
                                                    <Label className="text-[10px] font-black uppercase opacity-60">Width (px)</Label>
                                                    <Slider value={[selectedPage.imageOverlays[selectedPage.imageOverlays.length - 1].width]} min={20} max={500} 
                                                            onValueChange={(v) => updateImageOverlay(selectedPageIndex!, selectedPage.imageOverlays[selectedPage.imageOverlays.length - 1].id, { width: v[0] })} />
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black uppercase opacity-60">X-Position (%)</Label>
                                                    <Slider value={[selectedPage.imageOverlays[selectedPage.imageOverlays.length - 1].x]} min={0} max={100} 
                                                            onValueChange={(v) => updateImageOverlay(selectedPageIndex!, selectedPage.imageOverlays[selectedPage.imageOverlays.length - 1].id, { x: v[0] })} />
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black uppercase opacity-60">Y-Position (%)</Label>
                                                    <Slider value={[selectedPage.imageOverlays[selectedPage.imageOverlays.length - 1].y]} min={0} max={100} 
                                                            onValueChange={(v) => updateImageOverlay(selectedPageIndex!, selectedPage.imageOverlays[selectedPage.imageOverlays.length - 1].id, { y: v[0] })} />
                                                </div>
                                            </div>
                                        ) : <p className="text-center py-10 opacity-30 text-[10px] font-bold uppercase">No image added yet</p>}
                                    </TabsContent>
                                </Tabs>
                            </div>
                        ) : (
                            <div className="py-20 text-center opacity-30 space-y-4">
                                 <FilePenLine className="size-14 mx-auto" />
                                 <p className="text-xs font-black uppercase leading-relaxed tracking-widest">Awaiting Edits...<br/>Select tools above.</p>
                            </div>
                        )}

                        <div className="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10 flex gap-4">
                            <Zap className="size-6 text-yellow-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase">
                                <span className="font-black block mb-1 text-primary">STUDIO LOCK:</span>
                                All edits are rendered as native PDF vectors for absolute sharpness.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-6 md:p-8 border-t-2">
                        <Button 
                            className="w-full h-20 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all active:scale-95 disabled:opacity-50" 
                            disabled={pages.length === 0 || isExporting}
                            onClick={handleExport}
                        >
                            {isExporting ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="size-8 animate-spin" />
                                    <span className="uppercase tracking-tighter">EXPORTING...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Download className="size-9" />
                                    <div className="text-left">
                                        <span className="block uppercase tracking-tighter leading-none text-base md:text-xl">SAVE EDITS</span>
                                        <span className="text-[8px] md:text-[10px] font-bold opacity-60 uppercase tracking-widest">DOWNLOAD FINAL PDF</span>
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

function degrees(deg: number) {
    return deg;
}
