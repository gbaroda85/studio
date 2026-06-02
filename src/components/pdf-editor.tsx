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
    ChevronLeft,
    ChevronRight,
    RefreshCcw,
    FilePenLine,
    SearchCode,
    Sparkles,
    Maximize,
    Palette,
    MousePointer2,
    BringToFront,
    Scale,
    Layout,
    Undo2,
    Redo2,
    ZoomIn,
    ZoomOut,
    PenTool
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
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

/**
 * INTERFACES
 */
interface OverlayText {
    id: string;
    type: 'text';
    text: string;
    x: number; 
    y: number;
    size: number;
    color: string;
    font: string;
}

interface OverlayImage {
    id: string;
    type: 'image';
    src: string;
    x: number;
    y: number;
    width: number;
    rotation: number;
    opacity: number;
}

type Element = OverlayText | OverlayImage;

interface PageState {
    id: string;
    index: number;
    rotation: number;
    isDeleted: boolean;
    elements: Element[];
    previewSrc: string | null;
}

/**
 * MAIN COMPONENT
 */
export default function PdfEditor() {
    const { toast } = useToast();
    
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageState[]>([]);
    const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const [history, setHistory] = useState<PageState[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const overlayImgInputRef = useRef<HTMLInputElement>(null);

    const saveToHistory = useCallback((currentPages: PageState[]) => {
        const historyCopy = JSON.parse(JSON.stringify(currentPages));
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(historyCopy);
            if (newHistory.length > 20) newHistory.shift();
            return newHistory;
        });
        setHistoryIndex(prev => {
            const newIdx = prev + 1;
            return newIdx > 19 ? 19 : newIdx;
        });
    }, [historyIndex]);

    const handleUndo = () => {
        if (historyIndex > 0) {
            const prev = history[historyIndex - 1];
            setPages(JSON.parse(JSON.stringify(prev)));
            setHistoryIndex(historyIndex - 1);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const next = history[historyIndex + 1];
            setPages(JSON.parse(JSON.stringify(next)));
            setHistoryIndex(historyIndex + 1);
        }
    };

    const handleFileChange = async (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setIsProcessing(true);
            setPages([]);
            setSelectedPageIndex(null);
            setHistory([]);
            setHistoryIndex(-1);
            
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                const totalPages = pdf.numPages;
                const initialPages: PageState[] = [];

                for (let i = 1; i <= totalPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    if (context) {
                        context.fillStyle = '#FFFFFF';
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        await page.render({ canvasContext: context, viewport: viewport }).promise;
                        initialPages.push({
                            id: Math.random().toString(36).substr(2, 9),
                            index: i,
                            rotation: 0,
                            isDeleted: false,
                            elements: [],
                            previewSrc: canvas.toDataURL('image/jpeg', 0.8)
                        });
                    }
                }
                setPages(initialPages);
                saveToHistory(initialPages);
                if (initialPages.length > 0) setSelectedPageIndex(0);
                toast({ title: "PDF Loaded", description: `${totalPages} pages ready for premium editing.` });
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
            type: 'text',
            text: "Double-click to Edit",
            x: 20,
            y: 20,
            size: 24,
            color: "#000000",
            font: "Helvetica"
        };
        const updatedPages = [...pages];
        updatedPages[selectedPageIndex].elements.push(newText);
        setPages(updatedPages);
        saveToHistory(updatedPages);
        setSelectedElementId(id);
    };

    const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedPageIndex !== null) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const id = Math.random().toString(36).substr(2, 9);
                const newImg: OverlayImage = {
                    id,
                    type: 'image',
                    src: event.target?.result as string,
                    x: 20,
                    y: 20,
                    width: 150,
                    rotation: 0,
                    opacity: 100
                };
                const updatedPages = [...pages];
                updatedPages[selectedPageIndex].elements.push(newImg);
                setPages(updatedPages);
                saveToHistory(updatedPages);
                setSelectedElementId(id);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = "";
    };

    const updateElement = (pageIdx: number, elId: string, updates: Partial<Element>) => {
        setPages(prev => {
            const next = [...prev];
            const page = next[pageIdx];
            page.elements = page.elements.map(el => el.id === elId ? { ...el, ...updates } : el);
            return next;
        });
    };

    const commitElementChange = () => {
        saveToHistory(pages);
    };

    const handleDeleteElement = (id: string) => {
        if (selectedPageIndex === null) return;
        const updatedPages = [...pages];
        updatedPages[selectedPageIndex].elements = updatedPages[selectedPageIndex].elements.filter(el => el.id !== id);
        setPages(updatedPages);
        saveToHistory(updatedPages);
        setSelectedElementId(null);
    };

    const handleRotatePage = (idx: number) => {
        const updatedPages = pages.map((p, i) => i === idx ? { ...p, rotation: (p.rotation + 90) % 360 } : p);
        setPages(updatedPages);
        saveToHistory(updatedPages);
    };

    const handleExport = async () => {
        if (!pdfFile) return;
        setIsExporting(true);
        try {
            const existingPdfBytes = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
            const finalPdfDoc = await PDFDocument.create();
            const activePages = pages.filter(p => !p.isDeleted);

            for (const pageState of activePages) {
                const [copiedPage] = await finalPdfDoc.copyPages(pdfDoc, [pageState.index - 1]);
                copiedPage.setRotation(degrees(pageState.rotation));
                const { width, height } = copiedPage.getSize();

                for (const el of pageState.elements) {
                    if (el.type === 'text') {
                        let font;
                        if (el.font === 'Times') font = await finalPdfDoc.embedFont(StandardFonts.TimesRomanBold);
                        else if (el.font === 'Courier') font = await finalPdfDoc.embedFont(StandardFonts.CourierBold);
                        else font = await finalPdfDoc.embedFont(StandardFonts.HelveticaBold);

                        const r = parseInt(el.color.slice(1, 3), 16) / 255;
                        const g = parseInt(el.color.slice(3, 5), 16) / 255;
                        const b = parseInt(el.color.slice(5, 7), 16) / 255;

                        copiedPage.drawText(el.text, {
                            x: (el.x / 100) * width,
                            y: height - (el.y / 100) * height - (el.size * 0.8),
                            size: el.size,
                            font,
                            color: rgb(r, g, b)
                        });
                    } else if (el.type === 'image') {
                        const imgBytes = await fetch(el.src).then(res => res.arrayBuffer());
                        const embeddedImg = el.src.includes('png') ? await finalPdfDoc.embedPng(imgBytes) : await finalPdfDoc.embedJpg(imgBytes);
                        
                        const imgW = el.width;
                        const imgH = el.width * (embeddedImg.height / embeddedImg.width);

                        copiedPage.drawImage(embeddedImg, {
                            x: (el.x / 100) * width,
                            y: height - (el.y / 100) * height - imgH,
                            width: imgW,
                            height: imgH,
                            rotate: degrees(-el.rotation),
                            opacity: el.opacity / 100
                        });
                    }
                }
                finalPdfDoc.addPage(copiedPage);
            }

            const pdfBytes = await finalPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Studio-Edit-${pdfFile.name}`;
            link.click();
            
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Exported!", description: "High-quality PDF ready." });
        } catch (e) {
            toast({ variant: 'destructive', title: "Export Failed" });
        } finally {
            setIsExporting(false);
        }
    };

    const selectedPage = selectedPageIndex !== null ? pages[selectedPageIndex] : null;
    const selectedElement = selectedPage?.elements.find(el => el.id === selectedElementId);

    if (!pdfFile) {
        return (
            <div className="w-full flex-1 flex flex-col items-center justify-center p-6 py-12">
                <Card className={cn(
                    "w-full max-w-2xl glass-card overflow-hidden border-2 border-dashed shadow-2xl rounded-[2.5rem] transition-all",
                    isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                )}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); }}
                >
                    <CardHeader className="bg-muted/30 border-b p-6 text-center">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 md:p-16 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-muted/30 transition-all"
                                 onClick={() => fileInputRef.current?.click()}>
                        <div className="relative">
                            <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Zap className="absolute -top-1 -right-1 size-6 text-yellow-500 animate-pulse" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">Click to Upload PDF</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase opacity-60 mt-1">100% Private Local Studio</p>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-4 animate-in fade-in duration-500 h-[calc(100vh-140px)] overflow-hidden">
            
            {/* TOP TOOLBAR */}
            <div className="w-full h-16 bg-slate-900 border-b border-white/5 rounded-t-[2.5rem] flex items-center justify-between px-8 shrink-0 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={handleUndo} disabled={historyIndex <= 0}><Undo2 className="size-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={handleRedo} disabled={historyIndex >= history.length - 1}><Redo2 className="size-4"/></Button>
                    </div>
                    <Separator orientation="vertical" className="h-6 opacity-10" />
                    <div className="flex items-center gap-2">
                        <Button size="sm" className="bg-primary text-black font-black uppercase text-[10px] h-9 px-4 rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all" onClick={handleAddText}><Type className="size-4 mr-2"/> Add Text</Button>
                        <Button size="sm" variant="outline" className="text-white border-white/10 hover:bg-white/5 font-black uppercase text-[10px] h-9 px-4 rounded-lg" onClick={() => overlayImgInputRef.current?.click()}><ImageIcon className="size-4 mr-2"/> Add Image</Button>
                        <Button size="sm" variant="outline" className="text-white border-white/10 hover:bg-white/5 font-black uppercase text-[10px] h-9 px-4 rounded-lg" onClick={() => overlayImgInputRef.current?.click()}><PenTool className="size-4 mr-2"/> Signature</Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-xl border border-white/5 shadow-inner">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-white" onClick={() => setZoom(z => Math.max(50, z - 10))}><ZoomOut className="size-3.5"/></Button>
                        <span className="text-[11px] font-black text-white/60 w-12 text-center uppercase tracking-tighter">{zoom}%</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-white" onClick={() => setZoom(z => Math.min(200, z + 10))}><ZoomIn className="size-3.5"/></Button>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-black uppercase text-xs h-10 px-8 rounded-xl shadow-xl transition-all active:scale-95" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? <Loader2 className="animate-spin mr-2 size-4" /> : <Download className="mr-2 size-4" />} EXPORT PDF
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden gap-4 pb-4">
                
                {/* LEFT: PAGE STACK */}
                <div className="w-64 bg-slate-900 border-r border-white/5 flex flex-col shrink-0 rounded-bl-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Navigation</span>
                         <Badge className="bg-primary/20 text-primary border-primary/20">{pages.filter(p => !p.isDeleted).length}</Badge>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {pages.map((p, i) => !p.isDeleted && (
                                <div key={p.id} onClick={() => { setSelectedPageIndex(i); setSelectedElementId(null); }}
                                    className={cn(
                                        "relative aspect-[1/1.414] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group shadow-xl bg-white",
                                        selectedPageIndex === i ? "border-primary ring-4 ring-primary/20 scale-[1.02]" : "border-white/5 opacity-40 hover:opacity-100"
                                    )}>
                                    <div className="size-full flex items-center justify-center p-2" style={{ transform: `rotate(${p.rotation}deg)` }}>
                                        <img src={p.previewSrc!} className="max-w-full max-h-full object-contain" alt={`P${i+1}`} />
                                    </div>
                                    <div className="absolute top-2 left-2 size-6 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[9px] font-black text-white">P{i+1}</div>
                                    <div className="absolute bottom-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                                        <Button size="icon" variant="secondary" className="size-7 rounded-lg shadow-2xl" onClick={(e) => { e.stopPropagation(); handleRotatePage(i); }}><RotateCw className="size-4"/></Button>
                                        <Button size="icon" variant="destructive" className="size-7 rounded-lg shadow-2xl" onClick={(e) => { e.stopPropagation(); setPages(prev => prev.map((pg, idx) => idx === i ? { ...pg, isDeleted: true } : pg)); }}><Trash2 className="size-4"/></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* CENTER: STUDIO CANVAS */}
                <div className="flex-1 bg-black/40 flex items-start justify-center overflow-auto p-12 custom-scrollbar rounded-br-[2.5rem] border-t border-white/5 relative shadow-inner">
                    {selectedPage ? (
                        <div className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] bg-white transition-transform duration-300 origin-top flex items-center justify-center" 
                             style={{ transform: `scale(${zoom / 100})`, width: '100%' }}>
                            
                            <div className="relative" style={{ transform: `rotate(${selectedPage.rotation}deg)` }}>
                                <img src={selectedPage.previewSrc!} alt="edit" className="max-h-[80vh] w-auto block select-none pointer-events-none" />

                                {/* DYNAMIC ELEMENTS LAYER */}
                                {selectedPage.elements.map(el => (
                                    <motion.div 
                                        key={el.id}
                                        onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                                        className={cn(
                                            "absolute z-10 cursor-move group transition-shadow",
                                            selectedElementId === el.id ? "ring-2 ring-primary ring-offset-4 ring-offset-white rounded-sm shadow-2xl bg-primary/5" : "hover:ring-1 hover:ring-primary/40"
                                        )}
                                        style={{ left: `${el.x}%`, top: `${el.y}%`, transform: `rotate(${-selectedPage.rotation}deg)` }}
                                    >
                                        {el.type === 'text' ? (
                                            <div style={{ fontSize: `${el.size}px`, fontWeight: '900', color: el.color, fontFamily: el.font, whiteSpace: 'nowrap', padding: '4px' }}>
                                                {el.text}
                                            </div>
                                        ) : (
                                            <div style={{ width: `${el.width}px`, opacity: el.opacity / 100, transform: `rotate(${el.rotation}deg)` }}>
                                                <img src={el.src} className="size-full block" alt="ovl" />
                                            </div>
                                        )}

                                        {/* FLOATING ACTION OVERLAY */}
                                        <AnimatePresence>
                                            {selectedElementId === el.id && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/80 backdrop-blur-xl p-1 rounded-xl shadow-2xl border border-white/10 z-50">
                                                    <Button size="icon" variant="destructive" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); handleDeleteElement(el.id); }}><Trash2 className="size-3.5"/></Button>
                                                    <div className="w-px h-4 bg-white/10 mx-1" />
                                                    <div className="flex gap-0.5">
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-white" onClick={(e) => { e.stopPropagation(); updateElement(selectedPageIndex!, el.id, { y: el.y - 1 }); }}><ChevronUp className="size-4"/></Button>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-white" onClick={(e) => { e.stopPropagation(); updateElement(selectedPageIndex!, el.id, { y: el.y + 1 }); }}><ChevronDown className="size-4"/></Button>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-white" onClick={(e) => { e.stopPropagation(); updateElement(selectedPageIndex!, el.id, { x: el.x - 1 }); }}><ChevronLeft className="size-4"/></Button>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-white" onClick={(e) => { e.stopPropagation(); updateElement(selectedPageIndex!, el.id, { x: el.x + 1 }); }}><ChevronRight className="size-4"/></Button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-8 text-white/10 opacity-30 p-20">
                             <FilePenLine className="size-40" />
                             <p className="font-black uppercase tracking-[0.5em] text-2xl">SELECT PAGE TO BEGIN</p>
                        </div>
                    )}
                </div>

                {/* RIGHT: PROPERTIES PANEL */}
                <div className="w-80 bg-slate-900 border-l border-white/5 flex flex-col shrink-0 overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
                         <Settings2 className="size-5 text-primary" />
                         <span className="text-[11px] font-black uppercase tracking-widest text-white/60">Property Editor</span>
                    </div>
                    
                    <ScrollArea className="flex-1 p-6">
                        <AnimatePresence mode="wait">
                            {selectedElement ? (
                                <motion.div key={selectedElement.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                    {selectedElement.type === 'text' ? (
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">TEXT CONTENT</Label>
                                                <Input 
                                                    value={selectedElement.text} 
                                                    onChange={(e) => updateElement(selectedPageIndex!, selectedElementId!, { text: e.target.value })} 
                                                    onBlur={commitElementChange}
                                                    className="bg-white/5 border-white/10 text-white h-12 font-bold focus-visible:ring-primary" 
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">FONT</Label>
                                                    <Select value={selectedElement.font} onValueChange={(v) => { updateElement(selectedPageIndex!, selectedElementId!, { font: v }); commitElementChange(); }}>
                                                        <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white font-bold"><SelectValue /></SelectTrigger>
                                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                            <SelectItem value="Helvetica" className="font-bold">Sans Serif</SelectItem>
                                                            <SelectItem value="Times" className="font-bold">Serif</SelectItem>
                                                            <SelectItem value="Courier" className="font-bold">Mono</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">COLOR</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['#000000', '#FF0000', '#0000FF', '#FFFFFF', '#00FF00', '#FFCC00'].map(c => (
                                                            <button key={c} onClick={() => { updateElement(selectedPageIndex!, selectedElementId!, { color: c }); commitElementChange(); }} 
                                                                className={cn("size-6 rounded-lg border-2 transition-transform active:scale-90", selectedElement.color === c ? "border-primary" : "border-white/10")} style={{ backgroundColor: c }} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">FONT SIZE</Label><span className="text-[11px] font-mono text-primary font-bold">{selectedElement.size}px</span></div>
                                                <Slider min={8} max={120} step={1} value={[selectedElement.size]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { size: v[0] })} onPointerUp={commitElementChange} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">WIDTH SCALE</Label><span className="text-[11px] font-mono text-primary font-bold">{selectedElement.width}px</span></div>
                                                <Slider min={20} max={800} step={1} value={[selectedElement.width]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { width: v[0] })} onPointerUp={commitElementChange} />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">ROTATION</Label><span className="text-[11px] font-mono text-primary font-bold">{selectedElement.rotation}°</span></div>
                                                <Slider min={0} max={360} step={1} value={[selectedElement.rotation]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { rotation: v[0] })} onPointerUp={commitElementChange} />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">OPACITY</Label><span className="text-[11px] font-mono text-primary font-bold">{selectedElement.opacity}%</span></div>
                                                <Slider min={10} max={100} step={1} value={[selectedElement.opacity]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { opacity: v[0] })} onPointerUp={commitElementChange} />
                                            </div>
                                        </div>
                                    )}

                                    <Separator className="opacity-5" />

                                    <div className="space-y-4">
                                        <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2"><Move className="size-3"/> Manual Positioning (%)</Label>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <div className="flex justify-between"><Label className="text-[8px] uppercase opacity-40">X-POS</Label><span className="text-[10px] font-mono text-white/60">{selectedElement.x}%</span></div>
                                                <Slider min={0} max={100} step={0.5} value={[selectedElement.x]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { x: v[0] })} onPointerUp={commitElementChange} />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between"><Label className="text-[8px] uppercase opacity-40">Y-POS</Label><span className="text-[10px] font-mono text-white/60">{selectedElement.y}%</span></div>
                                                <Slider min={0} max={100} step={0.5} value={[selectedElement.y]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { y: v[0] })} onPointerUp={commitElementChange} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center gap-4 opacity-10">
                                     <MousePointer2 className="size-20" />
                                     <p className="text-[11px] font-black uppercase tracking-widest">CLICK ELEMENT TO EDIT</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </ScrollArea>

                    <div className="p-6 bg-primary/5 border-t border-white/5 space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="size-5 text-green-500" />
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Safe Studio Active</span>
                        </div>
                        <p className="text-[9px] text-white/20 font-bold leading-relaxed uppercase tracking-tighter">Changes are stored locally in RAM. No data ever leaves your device.</p>
                    </div>
                </div>
            </div>
            
            <input ref={overlayImgInputRef} type="file" className="hidden" accept="image/*" onChange={handleAddImage} />
            <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
        </div>
    );
}
