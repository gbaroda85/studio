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
    Undo2,
    Redo2,
    ZoomIn,
    ZoomOut,
    Eraser,
    Highlighter,
    ArrowUpRight,
    Pencil
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

type ElementType = 'text' | 'image' | 'shape' | 'mask';

interface BaseElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    opacity: number;
}

interface OverlayText extends BaseElement {
    type: 'text';
    text: string;
    size: number;
    color: string;
    font: string;
}

interface OverlayImage extends BaseElement {
    type: 'image';
    src: string;
    width: number;
    rotation: number;
}

interface OverlayShape extends BaseElement {
    type: 'mask' | 'shape';
    width: number;
    height: number;
    color: string;
}

type Element = OverlayText | OverlayImage | OverlayShape;

interface PageState {
    id: string;
    index: number;
    rotation: number;
    isDeleted: boolean;
    elements: Element[];
    previewSrc: string | null;
}

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
            if (newHistory.length > 20) newHistory.shift();
            return newHistory;
        });
        setHistoryIndex(prev => {
            const nextIdx = prev + 1;
            return nextIdx > 19 ? 19 : nextIdx;
        });
    }, [historyIndex]);

    const handleUndo = () => {
        if (historyIndex > 0) {
            const prevIdx = historyIndex - 1;
            setPages(JSON.parse(JSON.stringify(history[prevIdx])));
            setHistoryIndex(prevIdx);
            setSelectedElementId(null);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextIdx = historyIndex + 1;
            setPages(JSON.parse(JSON.stringify(history[nextIdx])));
            setHistoryIndex(nextIdx);
        }
    };

    const handleFileChange = async (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setIsProcessing(true);
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
                        await page.render({ canvasContext: context, viewport }).promise;
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
                setSelectedPageIndex(0);
                toast({ title: "PDF Loaded", description: `${totalPages} pages ready for premium editing.` });
            } catch (e) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to process PDF.' });
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const addElement = (element: Element) => {
        if (selectedPageIndex === null) return;
        const updated = [...pages];
        updated[selectedPageIndex].elements.push(element);
        setPages(updated);
        saveToHistory(updated);
        setSelectedElementId(element.id);
    };

    const handleAddText = () => {
        const id = Math.random().toString(36).substr(2, 9);
        addElement({
            id, type: 'text', text: "Type here...", x: 40, y: 40, size: 18, color: "#000000", font: "Helvetica", opacity: 100
        });
    };

    const handleAddWhiteout = () => {
        const id = Math.random().toString(36).substr(2, 9);
        addElement({
            id, type: 'mask', x: 35, y: 35, width: 20, height: 5, color: "#FFFFFF", opacity: 100
        });
        toast({ title: "Whiteout Active", description: "Position this block over existing text to hide it." });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedPageIndex !== null) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const id = Math.random().toString(36).substr(2, 9);
                addElement({
                    id, type: 'image', src: ev.target?.result as string, x: 30, y: 30, width: 120, rotation: 0, opacity: 100
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleElementMouseDown = (e: React.MouseEvent, pageIdx: number, el: Element) => {
        e.stopPropagation();
        setSelectedPageIndex(pageIdx);
        setSelectedElementId(el.id);
        setIsDragging(true);
        setDragStartPos({ x: e.clientX, y: e.clientY });
        setDragInitialElPos({ x: el.x, y: el.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || selectedPageIndex === null || !selectedElementId || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const deltaX = ((e.clientX - dragStartPos.x) / rect.width) * 100;
        const deltaY = ((e.clientY - dragStartPos.y) / rect.height) * 100;

        setPages(prev => {
            const next = [...prev];
            const page = next[selectedPageIndex];
            page.elements = page.elements.map(el => el.id === selectedElementId ? { 
                ...el, 
                x: Math.max(0, Math.min(100, dragInitialElPos.x + deltaX)),
                y: Math.max(0, Math.min(100, dragInitialElPos.y + deltaY))
            } : el);
            return next;
        });
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            saveToHistory(pages);
        }
    };

    const updateElement = (updates: Partial<Element>) => {
        if (selectedPageIndex === null || !selectedElementId) return;
        setPages(prev => {
            const next = [...prev];
            const page = next[selectedPageIndex];
            page.elements = page.elements.map(el => el.id === selectedElementId ? { ...el, ...updates } : el);
            saveToHistory(next);
            return next;
        });
    };

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
                        const font = await finalPdfDoc.embedFont(el.font === 'Times' ? StandardFonts.TimesRomanBold : el.font === 'Courier' ? StandardFonts.CourierBold : StandardFonts.HelveticaBold);
                        copiedPage.drawText(el.text, { 
                            x: elX, 
                            y: elY - el.size, 
                            size: el.size, 
                            font, 
                            color: hexToRgb(el.color), 
                            opacity: el.opacity / 100 
                        });
                    } else if (el.type === 'mask') {
                        copiedPage.drawRectangle({
                            x: elX,
                            y: elY - (el.height / 100) * height,
                            width: (el.width / 100) * width,
                            height: (el.height / 100) * height,
                            color: hexToRgb(el.color),
                            opacity: el.opacity / 100
                        });
                    } else if (el.type === 'image') {
                        const response = await fetch(el.src);
                        const imgBuffer = await response.arrayBuffer();
                        const embeddedImg = el.src.includes('png') ? await finalPdfDoc.embedPng(imgBuffer) : await finalPdfDoc.embedJpg(imgBuffer);
                        const imgW = (el.width / 100) * width;
                        const imgH = imgW * (embeddedImg.height / embeddedImg.width);
                        copiedPage.drawImage(embeddedImg, { x: elX, y: elY - imgH, width: imgW, height: imgH, rotate: degrees(-el.rotation), opacity: el.opacity / 100 });
                    }
                }
                finalPdfDoc.addPage(copiedPage);
            }

            const pdfBytes = await finalPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Edited-${pdfFile.name}`;
            link.click();
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "PDF Exported Successfully" });
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Export Failed", description: "Could not reconstruct PDF layers." });
        } finally {
            setIsExporting(false);
        }
    };

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? rgb(parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255) : rgb(0, 0, 0);
    };

    const selectedPage = selectedPageIndex !== null ? pages[selectedPageIndex] : null;
    const selectedElement = selectedPage?.elements.find(el => el.id === selectedElementId);

    return (
        <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-4 animate-in fade-in duration-500 h-[calc(100vh-140px)] overflow-hidden" 
             onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            
            {/* TOOLBAR */}
            <div className="w-full h-16 bg-slate-900 border-b border-white/5 rounded-t-[2rem] flex items-center justify-between px-4 md:px-8 shrink-0 shadow-2xl z-50 no-print">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={handleUndo} disabled={historyIndex <= 0}><Undo2 className="size-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={handleRedo} disabled={historyIndex >= history.length - 1}><Redo2 className="size-4"/></Button>
                    </div>
                    <Separator orientation="vertical" className="h-6 opacity-10" />
                    <div className="flex items-center gap-2">
                        <Button size="sm" className="bg-primary text-black font-black uppercase text-[10px] h-9 px-4 rounded-lg shadow-lg" onClick={handleAddText}><Type className="size-3.5 mr-1.5"/> Add Text</Button>
                        <Button size="sm" variant="outline" className="text-white border-white/10 hover:bg-white/5 font-black uppercase text-[10px] h-9 px-4 rounded-lg" onClick={handleAddWhiteout}><Eraser className="size-3.5 mr-1.5"/> Whiteout</Button>
                        <Button size="sm" variant="outline" className="text-white border-white/10 hover:bg-white/5 font-black uppercase text-[10px] h-9 px-4 rounded-lg" onClick={() => overlayImgInputRef.current?.click()}><ImageIcon className="size-3.5 mr-1.5"/> Insert Image</Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 bg-white/5 px-2 py-1.5 rounded-xl border border-white/5">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40" onClick={() => setZoom(z => Math.max(50, z - 10))}><ZoomOut className="size-3.5"/></Button>
                        <span className="text-[10px] font-black text-white/60 w-8 text-center">{zoom}%</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40" onClick={() => setZoom(z => Math.min(200, z + 10))}><ZoomIn className="size-3.5"/></Button>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-black uppercase text-xs h-10 px-8 rounded-xl shadow-xl active:scale-95" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? <Loader2 className="animate-spin mr-2 size-4" /> : <Download className="mr-2 size-4" />} DOWNLOAD
                    </Button>
                </div>
            </div>

            {!pdfFile ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <Card className={cn("w-full max-w-2xl glass-card border-2 border-dashed shadow-2xl rounded-[2.5rem] transition-all", isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]")}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); }}
                    >
                        <CardContent className="p-20 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-muted/30 transition-all" onClick={() => fileInputRef.current?.click()}>
                            <div className="relative"><UploadCloud className="size-24 text-muted-foreground group-hover:text-primary transition-colors" /><Zap className="absolute -top-1 -right-1 size-8 text-yellow-500 animate-pulse" /></div>
                            <div className="text-center px-4"><p className="text-2xl font-black uppercase tracking-tighter">Drop PDF to Edit</p><p className="text-sm font-bold uppercase opacity-60 mt-1">100% Private local rendering. No cloud risk.</p></div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex-1 flex overflow-hidden gap-4 pb-4">
                    {/* PAGE STACK */}
                    <div className="w-20 md:w-60 bg-slate-900 border-r border-white/5 flex flex-col shrink-0 rounded-bl-[2rem] overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-white/40 hidden md:block">Document Pages</span><Badge className="bg-primary/20 text-primary">{pages.filter(p => !p.isDeleted).length}</Badge></div>
                        <ScrollArea className="flex-1 p-2 md:p-4">
                            <div className="space-y-4">
                                {pages.map((p, i) => !p.isDeleted && (
                                    <div key={p.id} onClick={() => { setSelectedPageIndex(i); setSelectedElementId(null); }}
                                        className={cn("relative aspect-[1/1.414] rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white", selectedPageIndex === i ? "border-primary ring-2 ring-primary/40 scale-[1.02]" : "border-white/5 opacity-40 hover:opacity-100")}>
                                        <div className="size-full flex items-center justify-center p-1" style={{ transform: `rotate(${p.rotation}deg)` }}><img src={p.previewSrc!} className="max-w-full max-h-full object-contain" alt={`P${i+1}`} /></div>
                                        <div className="absolute top-1 left-1 size-5 rounded bg-black/60 backdrop-blur-md flex items-center justify-center text-[8px] font-black text-white">P{i+1}</div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* CANVAS AREA */}
                    <div className="flex-1 bg-black/60 flex items-start justify-center overflow-auto p-4 md:p-12 rounded-br-[2rem] border-t border-white/5 relative shadow-inner">
                        {selectedPage ? (
                            <div ref={containerRef} className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] bg-white transition-transform origin-top flex items-center justify-center" 
                                 style={{ transform: `scale(${zoom / 100})`, width: 'fit-content' }} onMouseDown={() => setSelectedElementId(null)}>
                                <div className="relative" style={{ transform: `rotate(${selectedPage.rotation}deg)` }}>
                                    <img src={selectedPage.previewSrc!} alt="edit" className="max-h-[85vh] w-auto block select-none pointer-events-none" />
                                    {selectedPage.elements.map(el => (
                                        <motion.div key={el.id} onMouseDown={(e) => handleElementMouseDown(e, selectedPageIndex!, el)}
                                            className={cn("absolute z-10 cursor-move transition-shadow", selectedElementId === el.id ? "ring-2 ring-primary ring-offset-1 rounded-sm shadow-2xl" : "hover:ring-1 hover:ring-primary/40")}
                                            style={{ left: `${el.x}%`, top: `${el.y}%`, transform: `rotate(${-selectedPage.rotation}deg)` }}>
                                            {el.type === 'text' ? (
                                                <div className="group relative">
                                                    <div style={{ fontSize: `${el.size}px`, fontWeight: '900', color: el.color, fontFamily: el.font, whiteSpace: 'nowrap', padding: '4px', opacity: el.opacity/100 }}>{el.text}</div>
                                                    {selectedElementId === el.id && (
                                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded-lg p-2 shadow-2xl flex items-center gap-2 z-50">
                                                            <Input value={el.text} onChange={e => updateElement({ text: e.target.value })} className="h-8 bg-white/10 text-white font-bold border-none w-48 text-xs" autoFocus />
                                                            <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => updateElement({ text: "" })}><X className="size-4"/></Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) :
                                             el.type === 'mask' ? <div style={{ width: `${el.width}px`, height: `${el.height}px`, backgroundColor: el.color, opacity: el.opacity / 100 }} /> :
                                             <div style={{ width: `${el.width}px`, opacity: el.opacity / 100, transform: `rotate(${el.rotation}deg)` }}><img src={el.src} className="size-full" alt="img" /></div>}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-8 text-white/5 p-20 select-none">
                                <FilePenLine className="size-60" />
                                <p className="font-black uppercase tracking-[0.5em] text-3xl">SELECT PAGE TO EDIT</p>
                            </div>
                        )}
                    </div>

                    {/* PROPERTIES PANEL */}
                    <div className="w-72 md:w-80 bg-slate-900 border-l border-white/5 flex flex-col shrink-0 overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3"><Settings2 className="size-5 text-primary" /><span className="text-[11px] font-black uppercase tracking-widest text-white/60">Properties</span></div>
                        <ScrollArea className="flex-1 p-6">
                            {selectedElement ? (
                                <div className="space-y-8 animate-in slide-in-from-right-4">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40">Opacity</Label><span className="text-primary text-[10px] font-bold">{selectedElement.opacity}%</span></div>
                                        <Slider min={10} max={100} value={[selectedElement.opacity]} onValueChange={v => updateElement({ opacity: v[0] })} />
                                    </div>

                                    {selectedElement.type === 'text' && (
                                        <div className="space-y-6">
                                            <div className="space-y-2"><Label className="text-[9px] font-black text-white/40">CONTENT</Label><Input value={selectedElement.text} onChange={e => updateElement({ text: e.target.value })} className="bg-white/5 border-white/10 text-white h-11 font-bold" /></div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2"><Label className="text-[9px] font-black text-white/40">FONT</Label><Select value={selectedElement.font} onValueChange={v => updateElement({ font: v })}><SelectTrigger className="h-9 bg-white/5 text-white font-bold text-[10px]"><SelectValue /></SelectTrigger><SelectContent className="bg-slate-900 text-white"><SelectItem value="Helvetica">Helvetica</SelectItem><SelectItem value="Times">Times</SelectItem><SelectItem value="Courier">Courier</SelectItem></SelectContent></Select></div>
                                                <div className="space-y-2"><Label className="text-[9px] font-black text-white/40">SIZE</Label><Input type="number" value={selectedElement.size} onChange={e => updateElement({ size: Number(e.target.value) })} className="bg-white/5 text-white h-9 font-bold" /></div>
                                            </div>
                                            <div className="space-y-2"><Label className="text-[9px] font-black text-white/40">COLOR</Label><div className="flex gap-2"> {['#000000', '#FF0000', '#0000FF', '#FFFFFF', '#ffff00'].map(c => <button key={c} onClick={() => updateElement({ color: c })} className={cn("size-6 rounded-lg border-2", selectedElement.color === c ? "border-primary" : "border-white/10")} style={{ backgroundColor: c }} />)} </div></div>
                                        </div>
                                    )}

                                    {selectedElement.type === 'mask' && (
                                        <div className="space-y-6">
                                            <div className="space-y-4"><div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40">Block Width</Label></div><Slider min={5} max={800} value={[selectedElement.width]} onValueChange={v => updateElement({ width: v[0] })} /></div>
                                            <div className="space-y-4"><div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40">Block Height</Label></div><Slider min={5} max={800} value={[selectedElement.height]} onValueChange={v => updateElement({ height: v[0] })} /></div>
                                            <div className="space-y-2"><Label className="text-[9px] font-black text-white/40">BLOCK COLOR</Label><div className="flex gap-2"> {['#FFFFFF', '#000000', '#f1f5f9'].map(c => <button key={c} onClick={() => updateElement({ color: c })} className={cn("size-8 rounded-lg border-2", selectedElement.color === c ? "border-primary" : "border-white/10")} style={{ backgroundColor: c }} />)} </div></div>
                                        </div>
                                    )}

                                    {selectedElement.type === 'image' && (
                                        <div className="space-y-6">
                                            <div className="space-y-4"><div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40">Scale Size</Label></div><Slider min={20} max={800} value={[selectedElement.width]} onValueChange={v => updateElement({ width: v[0] })} /></div>
                                            <div className="space-y-4"><div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-white/40">Rotate Image</Label></div><Slider min={0} max={360} value={[selectedElement.rotation]} onValueChange={v => updateElement({ rotation: v[0] })} /></div>
                                        </div>
                                    )}

                                    <Button variant="destructive" className="w-full h-11 font-black uppercase text-[10px]" onClick={() => {
                                        const next = [...pages];
                                        next[selectedPageIndex!].elements = next[selectedPageIndex!].elements.filter(el => el.id !== selectedElementId);
                                        setPages(next);
                                        saveToHistory(next);
                                        setSelectedElementId(null);
                                    }}><Trash2 className="size-4 mr-2"/> Remove Item</Button>
                                </div>
                            ) : (
                                <div className="py-24 text-center opacity-10 flex flex-col items-center gap-4">
                                    <MousePointer2 className="size-16"/>
                                    <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">Select an item on<br/>the page to edit</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            )}

            <input ref={overlayImgInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
    );
}
