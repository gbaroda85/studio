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
    PenTool,
    Highlighter
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

interface OverlayHighlight {
    id: string;
    type: 'highlight';
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    opacity: number;
}

type Element = OverlayText | OverlayImage | OverlayHighlight;

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

    // History for Undo/Redo
    const [history, setHistory] = useState<PageState[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Drag State
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const [dragInitialElPos, setDragInitialElPos] = useState({ x: 0, y: 0 });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const overlayImgInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const saveToHistory = useCallback((currentPages: PageState[]) => {
        const historyCopy = JSON.parse(JSON.stringify(currentPages));
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(historyCopy);
            if (newHistory.length > 30) newHistory.shift();
            return newHistory;
        });
        setHistoryIndex(prev => {
            const nextIdx = prev + 1;
            return nextIdx > 29 ? 29 : nextIdx;
        });
    }, [historyIndex]);

    const handleUndo = () => {
        if (historyIndex > 0) {
            const prev = history[historyIndex - 1];
            setPages(JSON.parse(JSON.stringify(prev)));
            setHistoryIndex(historyIndex - 1);
            setSelectedElementId(null);
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
                    const context = canvas.getContext('2d', { willReadFrequently: true });
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
                            previewSrc: canvas.toDataURL('image/jpeg', 0.85)
                        });
                    }
                }
                setPages(initialPages);
                saveToHistory(initialPages);
                if (initialPages.length > 0) setSelectedPageIndex(0);
                toast({ title: "PDF Ready", description: `${totalPages} pages loaded for local editing.` });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to process PDF file.' });
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
            text: "New Text Box",
            x: 40,
            y: 40,
            size: 20,
            color: "#000000",
            font: "Helvetica"
        };
        const updated = [...pages];
        updated[selectedPageIndex].elements.push(newText);
        setPages(updated);
        saveToHistory(updated);
        setSelectedElementId(id);
    };

    const handleAddHighlight = () => {
        if (selectedPageIndex === null) return;
        const id = Math.random().toString(36).substr(2, 9);
        const newHighlight: OverlayHighlight = {
            id,
            type: 'highlight',
            x: 30,
            y: 30,
            width: 40,
            height: 5,
            color: "#ffff00",
            opacity: 40
        };
        const updated = [...pages];
        updated[selectedPageIndex].elements.push(newHighlight);
        setPages(updated);
        saveToHistory(updated);
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
                    x: 30,
                    y: 30,
                    width: 150,
                    rotation: 0,
                    opacity: 100
                };
                const updated = [...pages];
                updated[selectedPageIndex].elements.push(newImg);
                setPages(updated);
                saveToHistory(updated);
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

    /**
     * MOUSE DRAG LOGIC
     */
    const handleElementMouseDown = (e: React.MouseEvent, pageIdx: number, el: Element) => {
        e.stopPropagation();
        setSelectedPageIndex(pageIdx);
        setSelectedElementId(el.id);
        setIsDragging(true);
        setDragStartPos({ x: e.clientX, y: e.clientY });
        setDragInitialElPos({ x: el.x, y: el.y });
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || selectedPageIndex === null || !selectedElementId || !containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const deltaX = ((e.clientX - dragStartPos.x) / (rect.width * (zoom / 100))) * 100;
        const deltaY = ((e.clientY - dragStartPos.y) / (rect.height * (zoom / 100))) * 100;

        const newX = Math.max(0, Math.min(100, dragInitialElPos.x + deltaX));
        const newY = Math.max(0, Math.min(100, dragInitialElPos.y + deltaY));

        updateElement(selectedPageIndex, selectedElementId, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            saveToHistory(pages);
        }
    };

    const handleDeleteElement = (id: string) => {
        if (selectedPageIndex === null) return;
        const updated = [...pages];
        updated[selectedPageIndex].elements = updated[selectedPageIndex].elements.filter(el => el.id !== id);
        setPages(updated);
        saveToHistory(updated);
        setSelectedElementId(null);
    };

    const handleRotatePage = (idx: number) => {
        const updated = pages.map((p, i) => i === idx ? { ...p, rotation: (p.rotation + 90) % 360 } : p);
        setPages(updated);
        saveToHistory(updated);
    };

    /**
     * EXPORT LOGIC
     */
    const handleExport = async () => {
        if (!pdfFile || pages.length === 0) return;
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
                    const elX = (el.x / 100) * width;
                    const elY = height - ((el.y / 100) * height);

                    if (el.type === 'text') {
                        let font;
                        if (el.font === 'Times') font = await finalPdfDoc.embedFont(StandardFonts.TimesRomanBold);
                        else if (el.font === 'Courier') font = await finalPdfDoc.embedFont(StandardFonts.CourierBold);
                        else font = await finalPdfDoc.embedFont(StandardFonts.HelveticaBold);

                        const colorRgb = hexToRgb(el.color);

                        copiedPage.drawText(el.text, {
                            x: elX,
                            y: elY - el.size,
                            size: el.size,
                            font,
                            color: rgb(colorRgb.r, colorRgb.g, colorRgb.b)
                        });
                    } else if (el.type === 'highlight') {
                        const hColor = hexToRgb(el.color);
                        const hW = (el.width / 100) * width;
                        const hH = (el.height / 100) * height;

                        copiedPage.drawRectangle({
                            x: elX,
                            y: elY - hH,
                            width: hW,
                            height: hH,
                            color: rgb(hColor.r, hColor.g, hColor.b),
                            opacity: el.opacity / 100
                        });
                    } else if (el.type === 'image') {
                        const response = await fetch(el.src);
                        const imgBuffer = await response.arrayBuffer();
                        const embeddedImg = el.src.includes('png') 
                            ? await finalPdfDoc.embedPng(imgBuffer) 
                            : await finalPdfDoc.embedJpg(imgBuffer);
                        
                        const imgW = el.width;
                        const imgH = el.width * (embeddedImg.height / embeddedImg.width);

                        copiedPage.drawImage(embeddedImg, {
                            x: elX,
                            y: elY - imgH,
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
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `GR7-Edit-${pdfFile.name}`;
            link.click();
            
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#48a9a4', '#ffffff'] });
            toast({ title: "Success!", description: "High-quality PDF exported successfully." });
        } catch (e: any) {
            console.error("Export Error:", e);
            toast({ variant: 'destructive', title: "Export Failed", description: "Try using simpler fonts or smaller images." });
        } finally {
            setIsExporting(false);
        }
    };

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
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
                            <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">Drop PDF to Edit</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase opacity-60 mt-1">100% Private local rendering.</p>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-4 animate-in fade-in duration-500 h-[calc(100vh-140px)] overflow-hidden" 
             onMouseMove={handleCanvasMouseMove} onMouseUp={handleMouseUp}>
            
            {/* TOOLBAR */}
            <div className="w-full h-16 bg-slate-900 border-b border-white/5 rounded-t-[2rem] flex items-center justify-between px-4 md:px-8 shrink-0 shadow-2xl z-50">
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={handleUndo} disabled={historyIndex <= 0}><Undo2 className="size-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={handleRedo} disabled={historyIndex >= history.length - 1}><Redo2 className="size-4"/></Button>
                    </div>
                    <Separator orientation="vertical" className="h-6 opacity-10 hidden sm:block" />
                    <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto no-scrollbar">
                        <Button size="sm" className="bg-primary text-black font-black uppercase text-[9px] md:text-[10px] h-9 px-3 md:px-4 rounded-lg shadow-lg shrink-0" onClick={handleAddText}><Type className="size-3.5 md:size-4 mr-1.5"/> Text</Button>
                        <Button size="sm" variant="outline" className="text-white border-white/10 hover:bg-white/5 font-black uppercase text-[9px] md:text-[10px] h-9 px-3 md:px-4 rounded-lg shrink-0" onClick={handleAddHighlight}><Highlighter className="size-3.5 md:size-4 mr-1.5"/> Highlight</Button>
                        <Button size="sm" variant="outline" className="text-white border-white/10 hover:bg-white/5 font-black uppercase text-[9px] md:text-[10px] h-9 px-3 md:px-4 rounded-lg shrink-0" onClick={() => overlayImgInputRef.current?.click()}><ImageIcon className="size-3.5 md:size-4 mr-1.5"/> Image</Button>
                        <Button size="sm" variant="outline" className="text-white border-white/10 hover:bg-white/5 font-black uppercase text-[9px] md:text-[10px] h-9 px-3 md:px-4 rounded-lg shrink-0 hidden md:flex" onClick={() => overlayImgInputRef.current?.click()}><PenTool className="size-3.5 md:size-4 mr-1.5"/> Signature</Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-white" onClick={() => setZoom(z => Math.max(50, z - 10))}><ZoomOut className="size-3.5"/></Button>
                        <span className="text-[10px] font-black text-white/60 w-10 text-center uppercase">{zoom}%</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-white" onClick={() => setZoom(z => Math.min(200, z + 10))}><ZoomIn className="size-3.5"/></Button>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-black uppercase text-[10px] md:text-xs h-9 md:h-10 px-4 md:px-8 rounded-xl shadow-xl active:scale-95 shrink-0" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? <Loader2 className="animate-spin mr-2 size-4" /> : <Download className="mr-2 size-4" />} EXPORT
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden gap-4 pb-4">
                
                {/* LEFT: NAV STACK */}
                <div className="w-20 md:w-60 bg-slate-900 border-r border-white/5 flex flex-col shrink-0 rounded-bl-[2rem] overflow-hidden shadow-2xl">
                    <div className="p-3 md:p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hidden md:block">Pages</span>
                         <Badge className="bg-primary/20 text-primary border-primary/20">{pages.filter(p => !p.isDeleted).length}</Badge>
                    </div>
                    <ScrollArea className="flex-1 p-2 md:p-4">
                        <div className="space-y-4">
                            {pages.map((p, i) => !p.isDeleted && (
                                <div key={p.id} onClick={() => { setSelectedPageIndex(i); setSelectedElementId(null); }}
                                    className={cn(
                                        "relative aspect-[1/1.414] rounded-xl overflow-hidden border-2 transition-all cursor-pointer group shadow-xl bg-white",
                                        selectedPageIndex === i ? "border-primary ring-2 ring-primary/40 scale-[1.02]" : "border-white/5 opacity-40 hover:opacity-100"
                                    )}>
                                    <div className="size-full flex items-center justify-center p-1" style={{ transform: `rotate(${p.rotation}deg)` }}>
                                        <img src={p.previewSrc!} className="max-w-full max-h-full object-contain" alt={`P${i+1}`} />
                                    </div>
                                    <div className="absolute top-1 left-1 size-5 rounded bg-black/60 backdrop-blur-md flex items-center justify-center text-[8px] font-black text-white">P{i+1}</div>
                                    <div className="absolute bottom-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 duration-300">
                                        <Button size="icon" variant="secondary" className="size-6 rounded shadow-2xl" onClick={(e) => { e.stopPropagation(); handleRotatePage(i); }}><RotateCw className="size-3"/></Button>
                                        <Button size="icon" variant="destructive" className="size-6 rounded shadow-2xl" onClick={(e) => { e.stopPropagation(); setPages(prev => prev.map((pg, idx) => idx === i ? { ...pg, isDeleted: true } : pg)); }}><Trash2 className="size-3"/></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* CENTER: STUDIO */}
                <div className="flex-1 bg-black/60 flex items-start justify-center overflow-auto p-4 md:p-12 custom-scrollbar rounded-br-[2rem] border-t border-white/5 relative shadow-inner">
                    {selectedPage ? (
                        <div 
                            ref={containerRef}
                            className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] bg-white transition-transform duration-300 origin-top flex items-center justify-center" 
                            style={{ transform: `scale(${zoom / 100})`, width: 'fit-content' }}
                            onMouseDown={() => setSelectedElementId(null)}
                        >
                            <div className="relative" style={{ transform: `rotate(${selectedPage.rotation}deg)` }}>
                                <img src={selectedPage.previewSrc!} alt="edit" className="max-h-[85vh] w-auto block select-none pointer-events-none" />

                                {/* ELEMENTS LAYER */}
                                {selectedPage.elements.map(el => (
                                    <motion.div 
                                        key={el.id}
                                        onMouseDown={(e) => handleElementMouseDown(e, selectedPageIndex!, el)}
                                        className={cn(
                                            "absolute z-10 cursor-move group transition-shadow",
                                            selectedElementId === el.id ? "ring-2 ring-primary ring-offset-2 ring-offset-white rounded-sm shadow-2xl" : "hover:ring-1 hover:ring-primary/40"
                                        )}
                                        style={{ left: `${el.x}%`, top: `${el.y}%`, transform: `rotate(${-selectedPage.rotation}deg)` }}
                                    >
                                        {el.type === 'text' ? (
                                            <div style={{ fontSize: `${el.size}px`, fontWeight: '900', color: el.color, fontFamily: el.font, whiteSpace: 'nowrap', padding: '4px' }}>
                                                {el.text}
                                            </div>
                                        ) : el.type === 'highlight' ? (
                                            <div style={{ width: `${el.width}vw`, height: `${el.height}vh`, backgroundColor: el.color, opacity: el.opacity / 100, border: '1px solid rgba(0,0,0,0.1)' }} />
                                        ) : (
                                            <div style={{ width: `${el.width}px`, opacity: el.opacity / 100, transform: `rotate(${el.rotation}deg)` }}>
                                                <img src={el.src} className="size-full block" alt="ovl" />
                                            </div>
                                        )}

                                        {/* FLOATING QUICK ACTIONS */}
                                        <AnimatePresence>
                                            {selectedElementId === el.id && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/90 backdrop-blur-xl p-1 rounded-lg shadow-2xl border border-white/10 z-50">
                                                    <Button size="icon" variant="destructive" className="h-6 w-6 rounded-md" onClick={(e) => { e.stopPropagation(); handleDeleteElement(el.id); }}><Trash2 className="size-3"/></Button>
                                                    <div className="w-px h-3 bg-white/10 mx-0.5" />
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-white" onClick={(e) => { e.stopPropagation(); updateElement(selectedPageIndex!, el.id, { y: el.y - 0.5 }); }}><ChevronUp className="size-3.5"/></Button>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-white" onClick={(e) => { e.stopPropagation(); updateElement(selectedPageIndex!, el.id, { y: el.y + 0.5 }); }}><ChevronDown className="size-3.5"/></Button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-8 text-white/5 p-20 select-none">
                             <FilePenLine className="size-60" />
                             <p className="font-black uppercase tracking-[0.5em] text-3xl">READY TO EDIT</p>
                        </div>
                    )}
                </div>

                {/* RIGHT: PROPERTIES */}
                <div className="w-72 md:w-80 bg-slate-900 border-l border-white/5 flex flex-col shrink-0 overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
                         <Settings2 className="size-5 text-primary" />
                         <span className="text-[11px] font-black uppercase tracking-widest text-white/60">Properties</span>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4 md:p-6">
                        <AnimatePresence mode="wait">
                            {selectedElement ? (
                                <motion.div key={selectedElement.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                    {selectedElement.type === 'text' && (
                                        <div className="space-y-6">
                                            <div className="space-y-2.5">
                                                <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">CONTENT</Label>
                                                <Input 
                                                    value={selectedElement.text} 
                                                    onChange={(e) => updateElement(selectedPageIndex!, selectedElementId!, { text: e.target.value })} 
                                                    className="bg-white/5 border-white/10 text-white h-11 font-bold" 
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">FONT</Label>
                                                    <Select value={selectedElement.font} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { font: v })}>
                                                        <SelectTrigger className="h-9 bg-white/5 border-white/10 text-white font-bold text-[10px]"><SelectValue /></SelectTrigger>
                                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                            <SelectItem value="Helvetica" className="font-bold">Helvetica</SelectItem>
                                                            <SelectItem value="Times" className="font-bold">Times</SelectItem>
                                                            <SelectItem value="Courier" className="font-bold">Courier</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">COLOR</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['#000000', '#FF0000', '#0000FF', '#FFFFFF', '#00FF00'].map(c => (
                                                            <button key={c} onClick={() => updateElement(selectedPageIndex!, selectedElementId!, { color: c })} 
                                                                className={cn("size-6 rounded-lg border-2 transition-transform", selectedElement.color === c ? "border-primary scale-110" : "border-white/10")} style={{ backgroundColor: c }} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">SIZE</Label><span className="text-[11px] font-mono text-primary font-bold">{selectedElement.size}px</span></div>
                                                <Slider min={8} max={100} step={1} value={[selectedElement.size]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { size: v[0] })} />
                                            </div>
                                        </div>
                                    )}

                                    {selectedElement.type === 'highlight' && (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">WIDTH (%)</Label><span className="text-[11px] font-mono text-primary font-bold">{selectedElement.width}</span></div>
                                                <Slider min={1} max={100} step={0.5} value={[selectedElement.width]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { width: v[0] })} />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">HEIGHT (%)</Label><span className="text-[11px] font-mono text-primary font-bold">{selectedElement.height}</span></div>
                                                <Slider min={0.5} max={50} step={0.1} value={[selectedElement.height]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { height: v[0] })} />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">OPACITY</Label><span className="text-[11px] font-mono text-primary font-bold">{selectedElement.opacity}%</span></div>
                                                <Slider min={10} max={100} step={1} value={[selectedElement.opacity]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { opacity: v[0] })} />
                                            </div>
                                        </div>
                                    )}

                                    {selectedElement.type === 'image' && (
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">WIDTH</Label><span className="text-[11px] font-mono text-primary font-bold">{selectedElement.width}px</span></div>
                                                <Slider min={10} max={800} step={1} value={[selectedElement.width]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { width: v[0] })} />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">ROTATION</Label><span className="text-[11px] font-mono text-primary font-bold">{selectedElement.rotation}°</span></div>
                                                <Slider min={0} max={360} step={1} value={[selectedElement.rotation]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { rotation: v[0] })} />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40 tracking-widest">OPACITY</Label><span className="text-[11px] font-mono text-primary font-bold">{selectedElement.opacity}%</span></div>
                                                <Slider min={10} max={100} step={1} value={[selectedElement.opacity]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { opacity: v[0] })} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 bg-primary/5 rounded-xl border border-white/5 space-y-3">
                                         <p className="text-[9px] font-black uppercase text-primary flex items-center gap-2 tracking-widest"><Move className="size-3"/> Manual Move</p>
                                         <div className="grid grid-cols-2 gap-4">
                                             <div className="space-y-2">
                                                <span className="text-[8px] font-bold text-white/20 uppercase">X: {selectedElement.x.toFixed(1)}%</span>
                                                <Slider min={0} max={100} step={0.5} value={[selectedElement.x]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { x: v[0] })} />
                                             </div>
                                             <div className="space-y-2">
                                                <span className="text-[8px] font-bold text-white/20 uppercase">Y: {selectedElement.y.toFixed(1)}%</span>
                                                <Slider min={0} max={100} step={0.5} value={[selectedElement.y]} onValueChange={(v) => updateElement(selectedPageIndex!, selectedElementId!, { y: v[0] })} />
                                             </div>
                                         </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="py-24 text-center flex flex-col items-center gap-4 opacity-5">
                                     <MousePointer2 className="size-20" />
                                     <p className="text-[11px] font-black uppercase tracking-widest">CLICK ELEMENT TO EDIT</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </ScrollArea>

                    <div className="p-6 bg-primary/5 border-t border-white/5">
                        <div className="flex items-center gap-3 opacity-40 mb-3">
                            <ShieldCheck className="size-4 text-green-500" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Local Session</span>
                        </div>
                        <p className="text-[8px] text-white/20 font-bold leading-relaxed uppercase">Edits are held in volatile RAM until export. Document stays on device.</p>
                    </div>
                </div>
            </div>
            
            <input ref={overlayImgInputRef} type="file" className="hidden" accept="image/*" onChange={handleAddImage} />
            <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
        </div>
    );
}
