
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts, degrees, PDFName } from 'pdf-lib';
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
    Pencil,
    HandMetal
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// PDF.js Worker Configuration
const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
}

type ElementType = 'text' | 'image' | 'shape' | 'mask' | 'arrow' | 'highlight';

interface BaseElement {
    id: string;
    type: ElementType;
    x: number; // % from left
    y: number; // % from top
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
    width: number; // % of page width
    rotation: number;
}

interface OverlayShape extends BaseElement {
    type: 'mask' | 'shape' | 'highlight';
    width: number; // %
    height: number; // %
    color: string;
}

interface OverlayArrow extends BaseElement {
    type: 'arrow';
    length: number; // %
    rotation: number;
    color: string;
    thickness: number;
}

type Element = OverlayText | OverlayImage | OverlayShape | OverlayArrow;

interface PageState {
    id: string;
    index: number;
    rotation: number;
    isDeleted: boolean;
    elements: Element[];
    previewSrc: string | null;
}

const StarIcons = () => (
    <>
        <div className="star-1 pointer-events-none">
            <svg viewBox="0 0 784.11 815.53" className="fill-white">
                <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-2 pointer-events-none">
            <svg viewBox="0 0 784.11 815.53" className="fill-white">
                <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-3 pointer-events-none">
            <svg viewBox="0 0 784.11 815.53" className="fill-white">
                <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
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
    const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
    
    const [history, setHistory] = useState<PageState[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const [dragInitialElPos, setDragInitialElPos] = useState({ x: 0, y: 0 });

    const [isDrawing, setIsDrawing] = useState(false);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);

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
                const pdf = await pdfjs.getDocument({ 
                    data: new Uint8Array(arrayBuffer),
                    cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                    cMapPacked: true
                }).promise;
                const totalPages = pdf.numPages;
                const initialPages: PageState[] = [];

                for (let i = 1; i <= totalPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2.2 }); // Higher fidelity render for editor
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
                toast({ title: "PDF Loaded", description: "Studio ready for editing." });
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
        addElement({
            id: Math.random().toString(36).substr(2, 9),
            type: 'text',
            text: "Type here...",
            x: 40, y: 40, size: 18, color: "#000000", font: "Helvetica", opacity: 100
        } as OverlayText);
    };

    const handleAddWhiteout = () => {
        addElement({
            id: Math.random().toString(36).substr(2, 9),
            type: 'mask',
            x: 35, y: 35, width: 20, height: 5, color: "#FFFFFF", opacity: 100
        } as OverlayShape);
        toast({ title: "Eraser Tool Active", description: "Position over content to remove it." });
    };

    const handleAddHighlight = () => {
        addElement({
            id: Math.random().toString(36).substr(2, 9),
            type: 'highlight',
            x: 30, y: 30, width: 30, height: 4, color: "#ffff00", opacity: 40
        } as OverlayShape);
    };

    const handleAddArrow = () => {
        addElement({
            id: Math.random().toString(36).substr(2, 9),
            type: 'arrow',
            x: 50, y: 50, length: 15, rotation: 45, color: "#FF0000", thickness: 4, opacity: 100
        } as OverlayArrow);
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;
        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = (e as React.MouseEvent).clientX - rect.left;
            y = (e as React.MouseEvent).clientY - rect.top;
        }
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;
        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = (e as React.MouseEvent).clientX - rect.left;
            y = (e as React.MouseEvent).clientY - rect.top;
        }

        ctx.lineTo(x, y);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
    };

    const finishDrawing = () => {
        setIsDrawing(false);
    };

    const saveDrawnSignature = () => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        addElement({
            id: Math.random().toString(36).substr(2, 9),
            type: 'image',
            src: dataUrl,
            x: 40, y: 40, width: 25, rotation: 0, opacity: 100
        } as OverlayImage);
        toast({ title: "Signature Created" });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedPageIndex !== null) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                addElement({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'image',
                    src: ev.target?.result as string,
                    x: 30, y: 30, width: 20, rotation: 0, opacity: 100
                } as OverlayImage);
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

    const handleMouseMoveGlobal = (e: React.MouseEvent) => {
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
            } as any : el);
            return next;
        });
    };

    const handleMouseUpGlobal = () => {
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
            page.elements = page.elements.map(el => el.id === selectedElementId ? { ...el, ...updates } as any : el);
            return next;
        });
    };

    const commitChange = () => {
        saveToHistory(pages);
    };

    const getImageBytes = async (src: string): Promise<ArrayBuffer> => {
        if (src.startsWith('data:')) {
            const base64 = src.split(',')[1];
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            return bytes.buffer;
        }
        const response = await fetch(src);
        return await response.arrayBuffer();
    }

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? rgb(parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255) : rgb(0, 0, 0);
    };

    const handleExport = async () => {
        if (!pdfFile || pages.length === 0) return;
        setIsExporting(true);
        try {
            const existingPdfBytes = await pdfFile.arrayBuffer();
            const originalPdf = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
            const newPdfDoc = await PDFDocument.create();
            
            const activePageStates = pages.filter(p => !p.isDeleted);
            
            for (const pageState of activePageStates) {
                const [copiedPage] = await newPdfDoc.copyPages(originalPdf, [pageState.index - 1]);
                const pdfPage = newPdfDoc.addPage(copiedPage);
                
                const pageWidth = pdfPage.getWidth();
                const pageHeight = pdfPage.getHeight();
                const pageRotation = pdfPage.getRotation().angle;
                const cropBox = pdfPage.getCropBox();
                
                const ox = cropBox.x;
                const oy = cropBox.y;

                for (const el of pageState.elements) {
                    const isLeaning = pageRotation === 90 || pageRotation === 270;
                    const visualW = isLeaning ? pageHeight : pageWidth;
                    const visualH = isLeaning ? pageWidth : pageHeight;

                    // POINT MAPPING: Convert UI % to PDF points
                    const px = (el.x / 100) * visualW;
                    const py = (el.y / 100) * visualH;

                    let finalX = 0;
                    let finalY = 0;

                    // CONVERSION: Map visual (top-left) to PDF (bottom-left)
                    if (pageRotation === 0) {
                        finalX = px;
                        finalY = pageHeight - py;
                    } else if (pageRotation === 90) {
                        finalX = py;
                        finalY = px;
                    } else if (pageRotation === 180) {
                        finalX = pageWidth - px;
                        finalY = py;
                    } else if (pageRotation === 270) {
                        finalX = pageWidth - py;
                        finalY = pageHeight - px;
                    }

                    const x = ox + finalX;
                    const y = oy + finalY;

                    if (el.type === 'text') {
                        const fontName = el.font === 'Times' ? StandardFonts.TimesRomanBold : el.font === 'Courier' ? StandardFonts.CourierBold : StandardFonts.HelveticaBold;
                        const font = await newPdfDoc.embedFont(fontName);
                        
                        pdfPage.drawText(el.text, { 
                            x, 
                            y: y - (el.size * 0.8), 
                            size: el.size, 
                            font, 
                            color: hexToRgb(el.color), 
                            opacity: el.opacity / 100 
                        });
                    } else if (el.type === 'mask' || el.type === 'highlight' || el.type === 'shape') {
                        const shapeW = (el.width / 100) * visualW;
                        const shapeH = (el.height / 100) * visualH;
                        pdfPage.drawRectangle({
                            x,
                            y: y - shapeH,
                            width: shapeW,
                            height: shapeH,
                            color: hexToRgb(el.color),
                            opacity: el.opacity / 100
                        });
                    } else if (el.type === 'image') {
                        const imgBuffer = await getImageBytes(el.src);
                        const isPng = el.src.startsWith('data:image/png') || el.src.toLowerCase().endsWith('.png');
                        const embeddedImg = isPng ? await newPdfDoc.embedPng(imgBuffer) : await newPdfDoc.embedJpg(imgBuffer);
                        
                        const imgW = (el.width / 100) * visualW;
                        const imgH = imgW * (embeddedImg.height / embeddedImg.width);
                        
                        pdfPage.drawImage(embeddedImg, { 
                            x: x, 
                            y: y - imgH, 
                            width: imgW, 
                            height: imgH, 
                            rotate: degrees(-el.rotation), 
                            opacity: el.opacity / 100 
                        });
                    } else if (el.type === 'arrow') {
                        const angleRad = (el.rotation * Math.PI) / 180;
                        const len = (el.length / 100) * visualW;
                        const endX = x + Math.cos(angleRad) * len;
                        const endY = y - Math.sin(angleRad) * len;

                        pdfPage.drawLine({
                            start: { x, y },
                            end: { x: endX, y: endY },
                            thickness: el.thickness,
                            color: hexToRgb(el.color),
                            opacity: el.opacity / 100
                        });
                        
                        const headSize = el.thickness * 4;
                        const headAngle = Math.PI / 6;
                        pdfPage.drawLine({
                            start: { x: endX, y: endY },
                            end: { x: endX - headSize * Math.cos(angleRad - headAngle), y: endY + headSize * Math.sin(angleRad - headAngle) },
                            thickness: el.thickness,
                            color: hexToRgb(el.color)
                        });
                        pdfPage.drawLine({
                            start: { x: endX, y: endY },
                            end: { x: endX - headSize * Math.cos(angleRad + headAngle), y: endY + headSize * Math.sin(angleRad + headAngle) },
                            thickness: el.thickness,
                            color: hexToRgb(el.color)
                        });
                    }
                }
            }

            const catalog = newPdfDoc.catalog;
            catalog.set(PDFName.of('ViewerPreferences'), newPdfDoc.context.obj({
                FitWindow: true,
                CenterWindow: true,
                DisplayDocTitle: true
            }));

            const finalPdfBytes = await newPdfDoc.save();
            const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `GR7-Edited-${pdfFile.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "PDF Exported Successfully" });
        } catch (e) {
            console.error('[Export Error]:', e);
            toast({ variant: 'destructive', title: "Export Failed", description: "Internal rendering error." });
        } finally {
            setIsExporting(false);
        }
    };

    const selectedPage = selectedPageIndex !== null ? pages[selectedPageIndex] : null;
    const selectedElement = selectedPage?.elements.find(el => el.id === selectedElementId);

    return (
        <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-0 animate-in fade-in duration-500 h-[calc(100vh-140px)] overflow-hidden" 
             onMouseMove={handleMouseMoveGlobal} onMouseUp={handleMouseUpGlobal}>
            
            {pdfFile ? (
                <div className="w-full h-16 bg-slate-900 dark:bg-slate-950 border-b border-white/10 rounded-t-[2rem] flex items-center justify-between px-4 md:px-8 shrink-0 shadow-2xl z-50 no-print">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl shrink-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10" onClick={handleUndo} disabled={historyIndex <= 0}><Undo2 className="size-4"/></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10" onClick={handleRedo} disabled={historyIndex >= history.length - 1}><Redo2 className="size-4"/></Button>
                        </div>
                        <Separator orientation="vertical" className="h-6 opacity-10 mx-2" />
                        <div className="flex items-center gap-1 md:gap-2">
                            <Button size="sm" className="bg-primary text-black font-black uppercase text-[10px] h-9 px-4 rounded-lg shadow-lg hover:bg-primary/90 hover:text-primary-foreground" onClick={handleAddText}><Type className="size-3.5 mr-1.5"/> TEXT</Button>
                            <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-primary hover:text-primary-foreground font-black uppercase text-[10px] h-9 px-4 rounded-lg bg-white/5" onClick={handleAddWhiteout}><Eraser className="size-3.5 mr-1.5"/> WHITEOUT</Button>
                            <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-primary hover:text-primary-foreground font-black uppercase text-[10px] h-9 px-4 rounded-lg bg-white/5" onClick={handleAddHighlight}><Highlighter className="size-3.5 mr-1.5"/> HIGHLIGHT</Button>
                            <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-primary hover:text-primary-foreground font-black uppercase text-[10px] h-9 px-4 rounded-lg bg-white/5" onClick={handleAddArrow}><ArrowUpRight className="size-3.5 mr-1.5"/> ARROW</Button>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-primary hover:text-primary-foreground font-black uppercase text-[10px] h-9 px-4 rounded-lg bg-white/5">
                                        <Pencil className="size-3.5 mr-1.5"/> SIGN
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48 p-2 rounded-xl border-2 shadow-2xl bg-white dark:bg-slate-900 z-[110]">
                                    <DropdownMenuItem onClick={() => overlayImgInputRef.current?.click()} className="flex items-center gap-2 py-2.5 px-3 cursor-pointer rounded-lg hover:bg-muted font-bold text-xs">
                                        <UploadCloud className="size-4 text-blue-500" />
                                        UPLOAD SIGNATURE
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setIsSignDialogOpen(true)} className="flex items-center gap-2 py-2.5 px-3 cursor-pointer rounded-lg hover:bg-muted font-bold text-xs">
                                        <Pencil className="size-4 text-emerald-500" />
                                        ADD SIGN (DRAW)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
                                <DialogContent className="max-w-md bg-slate-900 border-white/10 text-white shadow-3xl rounded-[2.5rem]">
                                    <DialogHeader><DialogTitle className="uppercase font-black tracking-widest text-primary">Handwriting Signature</DialogTitle></DialogHeader>
                                    <div className="bg-white rounded-xl overflow-hidden touch-none border-4 border-primary/20 shadow-inner">
                                        <canvas ref={drawingCanvasRef} width={400} height={200} className="w-full h-[200px] cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={finishDrawing} onMouseLeave={finishDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={finishDrawing} />
                                    </div>
                                    <DialogFooter className="gap-2 pt-4">
                                        <Button variant="ghost" onClick={() => drawingCanvasRef.current?.getContext('2d')?.clearRect(0,0,400,200)} className="font-black text-[10px] uppercase text-white/60">Clear Pad</Button>
                                        <Button onClick={() => { saveDrawnSignature(); setIsSignDialogOpen(false); }} className="bg-primary text-black font-black uppercase text-[10px] px-8 hover:bg-primary/90 hover:text-primary-foreground">Add to PDF</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-primary hover:text-primary-foreground font-black uppercase text-[10px] h-9 px-4 rounded-lg bg-white/5" onClick={() => overlayImgInputRef.current?.click()}><ImageIcon className="size-3.5 mr-1.5"/> IMAGE</Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 bg-white/10 px-2 py-1.5 rounded-xl border border-white/10">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-white/60 hover:text-white" onClick={() => setZoom(z => Math.max(50, z - 10))}><ZoomOut className="size-3.5"/></Button>
                            <span className="text-[10px] font-black text-white/80 w-8 text-center">{zoom}%</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-white/60 hover:text-white" onClick={() => setZoom(z => Math.min(300, z + 10))}><ZoomIn className="size-3.5"/></Button>
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700 text-white font-black uppercase text-xs h-10 px-6 rounded-xl shadow-xl active:scale-95 transition-all border-none" onClick={handleExport} disabled={isExporting}>
                            {isExporting ? <Loader2 className="animate-spin mr-2 size-4" /> : <Download className="mr-2 size-4" />} EXPORT PDF
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-start pt-6 px-6 bg-slate-200/50 dark:bg-slate-900/10">
                    <Card className={cn(
                        "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20 cursor-pointer select-none",
                        isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                    )}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <CardHeader className="bg-muted/30 border-b p-6 text-center">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12">
                            <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center space-y-4 bg-muted/30 group">
                                <div className="relative">
                                    <UploadCloud className="size-14 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop PDF to Studio</p>
                                    <p className="text-[10px] md:text-sm font-bold uppercase opacity-60 mt-1">100% Private local rendering.</p>
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                        </CardContent>
                        <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                            <div className="flex items-center gap-1.5"><SearchCode className="size-3 text-primary" /> VISUAL EDIT</div>
                            <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-purple-500" /> 300 DPI HD</div>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {pdfFile && (
                <div className="flex-1 flex overflow-hidden gap-0 bg-slate-200 dark:bg-black/20">
                    <div className="w-20 md:w-64 bg-muted/30 dark:bg-slate-950 border-r flex flex-col shrink-0 overflow-hidden shadow-2xl transition-colors">
                        <div className="p-4 border-b bg-primary/5 flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden md:block">Pages</span><Badge className="bg-primary/20 text-primary">{pages.filter(p => !p.isDeleted).length}</Badge></div>
                        <ScrollArea className="flex-1 p-2 md:p-4">
                            <div className="space-y-4">
                                {pages.map((p, i) => !p.isDeleted && (
                                    <div key={p.id} onClick={() => { setSelectedPageIndex(i); setSelectedElementId(null); }}
                                        className={cn("relative aspect-[1/1.414] rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white", selectedPageIndex === i ? "border-primary ring-2 ring-primary/40 scale-105 z-10 shadow-3xl" : "border-foreground/5 opacity-40 hover:opacity-100")}>
                                        <div className="size-full flex items-center justify-center p-1" style={{ transform: `rotate(${p.rotation}deg)` }}><img src={p.previewSrc!} className="max-w-full max-h-full object-contain" alt={`P${i+1}`} /></div>
                                        <div className="absolute top-1 left-1 size-5 rounded bg-black/80 backdrop-blur-md flex items-center justify-center text-[8px] font-black text-white">P{i+1}</div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="flex-1 bg-slate-100 dark:bg-black/40 flex items-start justify-center overflow-auto p-8 md:p-16 rounded-none border-t border-white/5 relative shadow-inner custom-scrollbar">
                        {selectedPage ? (
                            <div ref={containerRef} className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] bg-white transition-transform origin-top flex items-center justify-center" 
                                 style={{ transform: `scale(${zoom / 100})`, width: 'fit-content' }} onMouseDown={() => setSelectedElementId(null)}>
                                <div className="relative" style={{ transform: `rotate(${selectedPage.rotation}deg)` }}>
                                    <img src={selectedPage.previewSrc!} alt="edit" className="max-h-[85vh] w-auto block select-none pointer-events-none" />
                                    {selectedPage.elements.map(el => (
                                        <motion.div key={el.id} onMouseDown={(e) => handleElementMouseDown(e, selectedPageIndex!, el)}
                                            className={cn("absolute z-10 cursor-move transition-shadow", selectedElementId === el.id ? "ring-2 ring-primary ring-offset-1 rounded-sm shadow-2xl" : "hover:ring-1 hover:ring-primary/20")}
                                            style={{ left: `${el.x}%`, top: `${el.y}%`, transform: `rotate(${-selectedPage.rotation}deg)` }}>
                                            {el.type === 'text' ? (
                                                <div className="group relative">
                                                    {selectedElementId === el.id ? (
                                                        <div className="p-1 bg-[#1e293b] rounded border-2 border-primary shadow-2xl">
                                                            <input 
                                                                value={el.text} 
                                                                onChange={e => updateElement({ text: e.target.value })} 
                                                                onBlur={commitChange} 
                                                                className="bg-transparent border-none font-bold outline-none focus:ring-0 px-2 placeholder:text-white/20" 
                                                                style={{ fontSize: `${el.size}px`, fontFamily: el.font, color: el.color, minWidth: '50px' }} 
                                                                autoFocus 
                                                                onMouseDown={(e) => e.stopPropagation()} 
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: `${el.size}px`, fontWeight: '900', color: el.color, fontFamily: el.font, whiteSpace: 'nowrap', padding: '4px', opacity: el.opacity/100 }}>{el.text}</div>
                                                    )}
                                                </div>
                                            ) : (el.type === 'mask' || el.type === 'highlight' || el.type === 'shape') ? (
                                                <div style={{ width: `${el.width * (containerRef.current?.clientWidth || 0) / 100}px`, height: `${el.height * (containerRef.current?.clientHeight || 0) / 100}px`, backgroundColor: el.color, opacity: el.opacity / 100, border: selectedElementId === el.id ? '2px dashed #ff0000' : 'none' }} />
                                            ) : el.type === 'arrow' ? (
                                                <div style={{ transform: `rotate(${el.rotation}deg)`, transformOrigin: 'left center', width: `${el.length * (containerRef.current?.clientWidth || 0) / 100}px`, height: `${el.thickness}px`, backgroundColor: el.color, opacity: el.opacity/100, position: 'relative' }}>
                                                    <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px]" style={{ borderLeftColor: el.color }} />
                                                </div>
                                            ) : (
                                                <div style={{ width: `${el.width * (containerRef.current?.clientWidth || 0) / 100}px`, opacity: el.opacity / 100, transform: `rotate(${el.rotation}deg)` }}><img src={el.src} className="size-full" alt="img" /></div>
                                            )}
                                            {selectedElementId === el.id && (
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-3xl z-50 scale-90 md:scale-100">
                                                     <Button size="icon" variant="ghost" className="h-7 w-7 text-white/80 hover:text-white" onClick={(e) => { e.stopPropagation(); updateElement({ y: el.y - 1 }); commitChange(); }}><ChevronUp className="size-3.5"/></Button>
                                                     <Button size="icon" variant="ghost" className="h-7 w-7 text-white/80 hover:text-white" onClick={(e) => { e.stopPropagation(); updateElement({ y: el.y + 1 }); commitChange(); }}><ChevronDown className="size-3.5"/></Button>
                                                     <Button size="icon" variant="ghost" className="h-7 w-7 text-white/80 hover:text-white" onClick={(e) => { e.stopPropagation(); updateElement({ x: el.x - 1 }); commitChange(); }}><ChevronLeft className="size-3.5"/></Button>
                                                     <Button size="icon" variant="ghost" className="h-7 w-7 text-white/80 hover:text-white" onClick={(e) => { e.stopPropagation(); updateElement({ x: el.x + 1 }); commitChange(); }}><ChevronRight className="size-3.5"/></Button>
                                                     <Separator orientation="vertical" className="h-4 opacity-20 mx-1" />
                                                     <Button size="icon" variant="destructive" className="h-7 w-7 rounded-full shadow-lg" onClick={(e) => { e.stopPropagation(); const next = [...pages]; next[selectedPageIndex!].elements = next[selectedPageIndex!].elements.filter(item => item.id !== el.id); setPages(next); saveToHistory(next); setSelectedElementId(null); }}><Trash2 className="size-3.5"/></Button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-8 text-slate-400 dark:text-white/5 p-20 select-none animate-pulse"><FilePenLine className="size-60" /><p className="font-black uppercase tracking-[0.5em] text-3xl">Loading Workspace...</p></div>
                        )}
                    </div>

                    <div className="w-72 md:w-80 bg-muted/30 dark:bg-slate-950 border-l flex flex-col shrink-0 overflow-hidden shadow-2xl transition-colors">
                        <div className="p-4 border-b bg-primary/5 flex items-center gap-3"><Settings2 className="size-5 text-primary" /><span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Studio Properties</span></div>
                        <ScrollArea className="flex-1 p-6">
                            {selectedElement ? (
                                <div className="space-y-8 animate-in slide-in-from-right-4">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">Opacity</Label><span className="text-primary text-[10px] font-bold">{selectedElement.opacity}%</span></div>
                                        <Slider min={10} max={100} value={[selectedElement.opacity]} onValueChange={v => updateElement({ opacity: v[0] })} onValueCommit={commitChange} />
                                    </div>
                                    {selectedElement.type === 'text' && (
                                        <div className="space-y-6">
                                            <div className="space-y-2"><Label className="text-[9px] font-black text-muted-foreground opacity-60 uppercase">CONTENT</Label><Input value={selectedElement.text} onChange={e => updateElement({ text: e.target.value })} onBlur={commitChange} className="bg-background border-border text-foreground h-11 font-bold focus:ring-primary/20" /></div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2"><Label className="text-[9px] font-black text-muted-foreground opacity-60 uppercase">FONT</Label><Select value={selectedElement.font} onValueChange={v => { updateElement({ font: v }); commitChange(); }}><SelectTrigger className="h-9 bg-background text-foreground font-bold text-[10px] border-border"><SelectValue /></SelectTrigger><SelectContent className="border-border shadow-2xl"><SelectItem value="Helvetica">Helvetica</SelectItem><SelectItem value="Times">Times Roman</SelectItem><SelectItem value="Courier">Courier</SelectItem></SelectContent></Select></div>
                                                <div className="space-y-2"><Label className="text-[9px] font-black text-muted-foreground opacity-60 uppercase">SIZE</Label><Input type="number" value={selectedElement.size} onChange={e => { updateElement({ size: Number(e.target.value) }); commitChange(); }} className="bg-background border-border text-foreground h-9 font-bold" /></div>
                                            </div>
                                            <div className="space-y-2"><Label className="text-[9px] font-black text-muted-foreground opacity-60 uppercase">COLOR</Label><div className="flex gap-2"> {['#000000', '#FF0000', '#0000FF', '#FFFFFF', '#ffff00'].map(c => <button key={c} onClick={() => { updateElement({ color: c }); commitChange(); }} className={cn("size-7 rounded-lg border-2", selectedElement.color === c ? "border-primary scale-110 shadow-lg" : "border-border")} style={{ backgroundColor: c }} />)} </div></div>
                                        </div>
                                    )}
                                    {(selectedElement.type === 'mask' || selectedElement.type === 'highlight' || selectedElement.type === 'shape') && (
                                        <div className="space-y-6">
                                            <div className="space-y-4"><div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">Width (%)</Label></div><Slider min={1} max={100} value={[selectedElement.width]} onValueChange={v => updateElement({ width: v[0] })} onValueCommit={commitChange} /></div>
                                            <div className="space-y-4"><div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">Height (%)</Label></div><Slider min={1} max={100} value={[selectedElement.height]} onValueChange={v => updateElement({ height: v[0] })} onValueCommit={commitChange} /></div>
                                            <div className="space-y-2"><Label className="text-[9px] font-black text-muted-foreground opacity-60 uppercase">FILL COLOR</Label><div className="flex gap-2"> {['#FFFFFF', '#ffff00', '#000000', '#ADD8E6'].map(c => <button key={c} onClick={() => { updateElement({ color: c }); commitChange(); }} className={cn("size-8 rounded-lg border-2", selectedElement.color === c ? "border-primary scale-110" : "border-border")} style={{ backgroundColor: c }} />)} </div></div>
                                        </div>
                                    )}
                                    {selectedElement.type === 'arrow' && (
                                        <div className="space-y-6">
                                            <div className="space-y-4"><Label className="text-[9px] font-black text-muted-foreground opacity-60 uppercase">Length (%)</Label><Slider min={1} max={100} value={[selectedElement.length]} onValueChange={v => updateElement({ length: v[0] })} onValueCommit={commitChange} /></div>
                                            <div className="space-y-4"><Label className="text-[9px] font-black text-muted-foreground opacity-60 uppercase">Angle Rotation</Label><Slider min={0} max={360} value={[selectedElement.rotation]} onValueChange={v => updateElement({ rotation: v[0] })} onValueCommit={commitChange} /></div>
                                            <div className="space-y-2"><Label className="text-[9px] font-black text-muted-foreground opacity-60 uppercase">COLOR</Label><div className="flex gap-2"> {['#FF0000', '#000000', '#00FF00', '#0000FF'].map(c => <button key={c} onClick={() => { updateElement({ color: c }); commitChange(); }} className={cn("size-7 rounded-lg border-2", selectedElement.color === c ? "border-primary" : "border-border")} style={{ backgroundColor: c }} />)} </div></div>
                                        </div>
                                    )}
                                    {selectedElement.type === 'image' && (
                                        <div className="space-y-6">
                                            <div className="space-y-4"><div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">Scale (%)</Label></div><Slider min={1} max={100} value={[selectedElement.width]} onValueChange={v => updateElement({ width: v[0] })} onValueCommit={commitChange} /></div>
                                            <div className="space-y-4"><div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">Rotate</Label></div><Slider min={0} max={360} value={[selectedElement.rotation]} onValueChange={v => updateElement({ rotation: v[0] })} onValueCommit={commitChange} /></div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-24 text-center opacity-10 flex flex-col items-center gap-4"><MousePointer2 className="size-16 text-foreground"/><p className="text-[11px] font-black uppercase tracking-widest text-foreground leading-relaxed">Select any item on<br/>the page to modify</p></div>
                            )}
                        </ScrollArea>
                        <CardFooter className="bg-primary/5 p-4 border-t"><div className="flex gap-3 items-center"><ShieldCheck className="size-4 text-primary" /><p className="text-[9px] font-black uppercase text-primary/60 tracking-tight">Active Secured Studio</p></div></CardFooter>
                    </div>
                </div>
            )}
            <input ref={overlayImgInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
    );
}
