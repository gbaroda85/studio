
"use client";

import { useState, useRef, useEffect, useCallback, type ChangeEvent } from 'react';
import { PDFDocument, degrees, PDFName } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    type DragStartEvent,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    Layers, 
    Trash2, 
    RotateCw, 
    X, 
    RefreshCcw, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    Sparkles,
    Eye,
    LayoutGrid,
    Monitor,
    MousePointer2,
    Settings2,
    Move,
    FileDigit,
    Plus,
    FilePlus2,
    Grip,
    History,
    ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import confetti from 'canvas-confetti';

const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
}

type PageType = 'original' | 'blank' | 'image';

interface PageItem {
    id: string;
    index: number;       
    rotation: number;    
    previewSrc: string;
    isDeleted: boolean;
    type: PageType;
    sourceFile?: File; 
}

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i} pointer-events-none`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
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

function SortablePage({ 
    page, 
    onDelete, 
    onRotate, 
    onInsertBlank,
    onInsertImage,
    onInsertPdf,
    onView,
    isRestored
}: { 
    page: PageItem; 
    onDelete: (id: string) => void;
    onRotate: (id: string) => void;
    onInsertBlank: (id: string) => void;
    onInsertImage: (id: string) => void;
    onInsertPdf: (id: string) => void;
    onView: (page: PageItem) => void;
    isRestored: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: page.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 999 : undefined,
        opacity: isDragging ? 0.3 : 1,
    };

    const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
        e.stopPropagation();
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={cn(
                "group relative aspect-[1/1.414] rounded-2xl overflow-hidden border-2 bg-white dark:bg-slate-900 shadow-xl transition-all transform-gpu will-change-transform touch-none",
                "hover:border-primary/40 border-transparent shadow-primary/5",
                isDragging && "scale-95 shadow-2xl",
                isRestored && "ring-4 ring-green-500 animate-pulse"
            )}
        >
            <div className="absolute top-2 left-2 size-7 md:size-8 rounded-lg bg-black/80 backdrop-blur-md flex items-center justify-center text-[10px] md:text-xs font-black text-white z-20 border border-white/10 pointer-events-none shadow-lg">
                {page.type === 'original' ? page.index : page.type === 'blank' ? 'B' : 'IMG'}
            </div>
            
            <div {...attributes} {...listeners} className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing flex items-center justify-center">
                <Grip className="size-10 md:size-12 text-primary opacity-0 group-hover:opacity-20 transition-opacity" />
            </div>

            {page.type === 'blank' ? (
                <div className="size-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 text-muted-foreground gap-2 p-4 pointer-events-none border">
                    <FilePlus2 className="size-8 opacity-20" />
                    <span className="text-[8px] font-black uppercase opacity-40">Blank Page</span>
                </div>
            ) : (
                <div className="size-full flex items-center justify-center p-2 transition-transform duration-300 pointer-events-none backface-hidden transform-gpu" style={{ transform: `rotate(${page.rotation}deg)` }}>
                    <img src={page.previewSrc || undefined} className="max-w-full max-h-full object-contain pointer-events-none" alt="p" />
                </div>
            )}

            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 md:gap-1.5 z-40 px-2">
                <button 
                    type="button"
                    className="h-8 flex-1 rounded-lg bg-white dark:bg-slate-800 shadow-xl border-2 dark:border-white/20 flex items-center justify-center hover:text-primary dark:text-white transition-all active:scale-90" 
                    onPointerDown={stopPropagation}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onView(page); }} 
                >
                    <Eye className="size-3.5" />
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button 
                            type="button"
                            className="h-8 flex-1 rounded-lg bg-white dark:bg-slate-800 shadow-xl border-2 dark:border-white/20 flex items-center justify-center hover:text-primary dark:text-white transition-all active:scale-90" 
                            onPointerDown={stopPropagation}
                        >
                            <Plus className="size-3.5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="z-[1000] rounded-xl border-2 shadow-2xl bg-white dark:bg-slate-900">
                        <DropdownMenuItem onClick={() => onInsertPdf(page.id)} className="font-bold text-[10px] uppercase py-2 cursor-pointer">
                            <FileDigit className="size-3.5 mr-2 text-rose-500" /> Add PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onInsertBlank(page.id)} className="font-bold text-[10px] uppercase py-2 cursor-pointer">
                            <Plus className="size-3.5 mr-2 text-primary" /> Add Blank Page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onInsertImage(page.id)} className="font-bold text-[10px] uppercase py-2 cursor-pointer">
                            <ImageIcon className="size-3.5 mr-2 text-blue-500" /> Upload Image
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <button 
                    type="button"
                    className="h-8 flex-1 rounded-lg bg-white dark:bg-slate-800 shadow-xl border-2 dark:border-white/20 flex items-center justify-center hover:text-primary dark:text-white transition-all active:scale-90" 
                    onPointerDown={stopPropagation}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRotate(page.id); }} 
                >
                    <RotateCw className="size-3.5" />
                </button>
                <button 
                    type="button"
                    className="h-8 flex-1 rounded-lg shadow-xl transition-all flex items-center justify-center bg-rose-500 text-white hover:bg-rose-600 active:scale-90" 
                    onPointerDown={stopPropagation}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(page.id); }} 
                >
                    <Trash2 className="size-3.5" />
                </button>
            </div>
        </div>
    );
}

export default function PdfOrganizer() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    
    const [pages, setPages] = useState<PageItem[]>([]);
    const [deletedPages, setDeletedPages] = useState<PageItem[]>([]);
    
    const [progress, setProgress] = useState(0);
    const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isRestoreOpen, setIsRestoreOpen] = useState(false);
    const [zoomPage, setZoomPage] = useState<PageItem | null>(null);
    const [restoredId, setRestoredId] = useState<string | null>(null);
    
    const [insertAfterId, setInsertAfterId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const insertPdfInputRef = useRef<HTMLInputElement>(null);
    const insertImgInputRef = useRef<HTMLInputElement>(null);
    const renderIdRef = useRef(0);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { 
            activationConstraint: { 
                delay: 250, 
                tolerance: 8 
            } 
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        return () => {
            if (resultPdfUrl) URL.revokeObjectURL(resultPdfUrl);
        }
    }, [resultPdfUrl]);

    const handleReset = () => {
        setPdfFile(null);
        setPages([]);
        setDeletedPages([]);
        setResultPdfUrl(null);
        setIsRendering(false);
        setIsSaving(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = async (file: File | null, afterId?: string) => {
        if (file && file.type === 'application/pdf') {
            setIsRendering(true);
            if (!afterId) {
                setPdfFile(file);
                setPages([]);
                setDeletedPages([]);
                setResultPdfUrl(null);
            }
            setProgress(0);

            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ 
                    data: new Uint8Array(arrayBuffer),
                    cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                    cMapPacked: true
                }).promise;
                const totalPages = pdf.numPages;
                const newPagesBatch: PageItem[] = [];

                for (let i = 1; i <= totalPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    if (context) {
                        context.fillStyle = '#FFFFFF';
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        await page.render({ canvasContext: context, viewport }).promise;
                        
                        const newPage: PageItem = {
                            id: `p-${i}-${Date.now()}-${Math.random()}`, 
                            index: i,
                            rotation: 0,
                            isDeleted: false,
                            previewSrc: canvas.toDataURL('image/jpeg', 0.8),
                            type: 'original',
                            sourceFile: file 
                        };
                        
                        newPagesBatch.push(newPage);
                    }
                    setProgress(Math.round((i / totalPages) * 100));
                }

                setPages(prev => {
                    if (!afterId) return newPagesBatch;
                    const index = prev.findIndex(p => p.id === afterId);
                    const next = [...prev];
                    next.splice(index + 1, 0, ...newPagesBatch);
                    return next;
                });

                toast({ title: afterId ? 'PDF Inserted' : 'PDF Loaded', description: `Visual map of ${totalPages} pages added.` });
            } catch (e) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to process document.' });
            } finally {
                setIsRendering(false);
            }
        }
    };

    const onMainFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFileChange(e.target.files?.[0] || null);
        e.target.value = "";
    };

    const onInsertPdfChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file && insertAfterId) {
            handleFileChange(file, insertAfterId);
        }
        setInsertAfterId(null);
        e.target.value = "";
    };

    const onInsertImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !insertAfterId) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const src = ev.target?.result as string;
            const imgId = `img-${Math.random().toString(36).substr(2, 9)}`;
            const imgPage: PageItem = { 
                id: imgId, 
                index: -1, 
                rotation: 0, 
                isDeleted: false, 
                previewSrc: src, 
                type: 'image' 
            };
            
            setPages(prev => {
                const index = prev.findIndex(p => p.id === insertAfterId);
                const next = [...prev];
                next.splice(index + 1, 0, imgPage);
                return next;
            });
            setInsertAfterId(null);
            toast({ title: "Image Inserted as Page" });
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const deletePage = (id: string) => {
        const pageToDelete = pages.find(p => p.id === id);
        if (!pageToDelete) return;
        setPages(prev => prev.filter(p => p.id !== id));
        setDeletedPages(prev => [...prev, { ...pageToDelete, isDeleted: true }]);
        setResultPdfUrl(null);
        toast({ title: "Page Moved to Trash" });
    };

    const restorePage = (id: string) => {
        const pageToRestore = deletedPages.find(p => p.id === id);
        if (!pageToRestore) return;
        
        setDeletedPages(prev => prev.filter(p => p.id !== id));
        setPages(prev => {
            const next = [...prev, { ...pageToRestore, isDeleted: false }];
            return next.sort((a, b) => {
                if (a.index === -1) return 1; 
                if (b.index === -1) return -1;
                return a.index - b.index;
            });
        });
        
        setRestoredId(id);
        setTimeout(() => setRestoredId(null), 2000);
        
        setResultPdfUrl(null);
        toast({ title: "Restored to position" });
    };

    const restoreAll = () => {
        if (deletedPages.length === 0) return;
        setPages(prev => {
            const next = [...prev, ...deletedPages.map(p => ({ ...p, isDeleted: false }))];
            return next.sort((a, b) => {
                if (a.index === -1) return 1;
                if (b.index === -1) return -1;
                return a.index - b.index;
            });
        });
        setDeletedPages([]);
        setResultPdfUrl(null);
        setIsRestoreOpen(false);
        toast({ title: "All Pages Restored" });
    };

    const rotatePage = (id: string) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
        setResultPdfUrl(null);
    };

    const addBlankPage = (afterId?: string) => {
        const blankId = `blank-${Math.random().toString(36).substr(2, 9)}`;
        const blankPage: PageItem = { id: blankId, index: -1, rotation: 0, isDeleted: false, previewSrc: "", type: 'blank' };
        setPages(prev => {
            if (!afterId) return [...prev, blankPage];
            const index = prev.findIndex(p => p.id === afterId);
            const next = [...prev];
            next.splice(index + 1, 0, blankPage);
            return next;
        });
        toast({ title: "Blank Page Inserted" });
    };

    const onInsertPdfClick = (afterId: string) => {
        setInsertAfterId(afterId);
        insertPdfInputRef.current?.click();
    };

    const onInsertImageClick = (afterId: string) => {
        setInsertAfterId(afterId);
        insertImgInputRef.current?.click();
    };

    const rotateAll = (deg: number) => {
        setPages(prev => prev.map(p => ({ ...p, rotation: deg === 0 ? 0 : (p.rotation + deg) % 360 })));
        setResultPdfUrl(null);
        toast({ title: deg === 0 ? "Rotations Reset" : "Rotated All Pages" });
    };

    const sortPages = (direction: 'asc' | 'desc') => {
        setPages(prev => [...prev].sort((a, b) => {
            if (a.index === -1 && b.index !== -1) return 1;
            if (a.index !== -1 && b.index === -1) return -1;
            return direction === 'asc' ? a.index - b.index : b.index - a.index;
        }));
        setResultPdfUrl(null);
        toast({ title: direction === 'asc' ? "Sorted 1 to N" : "Sorted N to 1" });
    };

    const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setPages((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
            setResultPdfUrl(null);
        }
        setActiveId(null);
    };

    const handleSavePdf = async () => {
        if (pages.length === 0) return;
        setIsSaving(true);
        try {
            const newPdfDoc = await PDFDocument.create();
            const fileBuffers = new Map<string, PDFDocument>();

            for (const p of pages) {
                if (p.type === 'blank') {
                    newPdfDoc.addPage([595.28, 841.89]); 
                } else if (p.type === 'image') {
                    const imgBuffer = await fetch(p.previewSrc).then(res => res.arrayBuffer());
                    const isPng = p.previewSrc.startsWith('data:image/png');
                    const embeddedImg = isPng ? await newPdfDoc.embedPng(imgBuffer) : await newPdfDoc.embedJpg(imgBuffer);
                    const page = newPdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
                    page.drawImage(embeddedImg, { x: 0, y: 0, width: embeddedImg.width, height: embeddedImg.height, rotate: degrees(-p.rotation) });
                } else if (p.sourceFile) {
                    let sourcePdf = fileBuffers.get(p.sourceFile.name);
                    if (!sourcePdf) {
                        const bytes = await p.sourceFile.arrayBuffer();
                        sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
                        fileBuffers.set(p.sourceFile.name, sourcePdf);
                    }
                    const [copiedPage] = await newPdfDoc.copyPages(sourcePdf, [p.index - 1]);
                    const currentRot = copiedPage.getRotation().angle;
                    copiedPage.setRotation(degrees(currentRot + p.rotation));
                    newPdfDoc.addPage(copiedPage);
                }
            }

            const catalog = newPdfDoc.catalog;
            catalog.set(PDFName.of('ViewerPreferences'), newPdfDoc.context.obj({
                FitWindow: true,
                CenterWindow: true,
                DisplayDocTitle: true
            }));

            const pdfBytes = await newPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setResultPdfUrl(url);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#043873', '#4F9CF9', '#ffffff'] });
            toast({ title: "Organize Success!", description: "Changes bundled into new PDF." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Save Error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = () => {
        if (!resultPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = resultPdfUrl;
        link.download = `Organized_${pdfFile.name}`;
        link.click();
    };

    const activePage = pages.find(p => p.id === activeId);

    return (
        <div className="w-full max-w-7xl px-2 md:px-4 flex flex-col gap-6 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-auto">
                
                <div className="lg:col-span-8 h-full flex flex-col min-h-[450px]">
                    {!pdfFile ? (
                        <Card className={cn(
                            "w-full glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 cursor-pointer h-[500px] flex flex-col",
                            isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
                        )}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <CardHeader className="bg-muted/30 border-b p-6 text-center">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col items-center justify-center p-10 md:p-16">
                                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center space-y-6 bg-muted/30 group">
                                    <div className="relative">
                                        <UploadCloud className="size-14 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <Zap className="absolute -top-1 -right-1 size-5 md:size-8 text-yellow-500 animate-pulse" />
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop PDF to Organize</p>
                                        <p className="text-[10px] md:text-sm font-bold uppercase opacity-60 mt-1">Delete, re-order, rotate or insert blank pages.</p>
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onMainFileChange} />
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                            <CardHeader className="bg-muted/30 border-b py-3 px-4 md:px-6 flex flex-row items-center justify-between shrink-0">
                                <div className="flex items-center gap-2 text-left">
                                    <LayoutGrid className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Document Map</CardTitle>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary font-black text-[8px] md:text-[9px] px-3 py-1 rounded-full border-none">
                                        {pages.length} / {isRendering ? '...' : pages.length + deletedPages.length} PAGES
                                    </Badge>
                                    <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-[9px] font-black uppercase border-2 border-primary/10 hover:bg-destructive/5 hover:text-destructive rounded-lg px-3"><RefreshCcw className="size-3" /> Change</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner overflow-hidden relative border-b">
                                <ScrollArea className="h-[600px] md:h-[800px] w-full">
                                    {isRendering && pages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center gap-8 py-20">
                                            <div className="relative">
                                                <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20 stroke-[3]" /><Monitor className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                                            </div>
                                            <div className="space-y-3 w-full max-w-xs text-center px-4">
                                                <p className="font-black text-sm text-primary uppercase tracking-widest animate-pulse">Rendering Pages...</p>
                                                <Progress value={progress} className="h-1.5 shadow-inner" />
                                            </div>
                                        </div>
                                    ) : (
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                                            <SortableContext items={pages} strategy={rectSortingStrategy}>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 p-4 md:p-6 pb-24">
                                                    {pages.map((p) => (
                                                        <SortablePage 
                                                            key={p.id} 
                                                            page={p} 
                                                            onDelete={deletePage} 
                                                            onRotate={rotatePage} 
                                                            onInsertBlank={addBlankPage} 
                                                            onInsertImage={onInsertImageClick}
                                                            onInsertPdf={onInsertPdfClick}
                                                            onView={(page) => setZoomPage(page)}
                                                            isRestored={restoredId === p.id}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.3' } } }) }}>
                                                {activeId && activePage ? (
                                                    <div className="relative aspect-[1/1.414] rounded-2xl overflow-hidden border-4 border-primary bg-white shadow-3xl opacity-80 scale-105 transition-transform z-[9999] pointer-events-none transform-gpu">
                                                        <div className="absolute top-2 left-2 size-8 rounded-lg bg-black/80 backdrop-blur-md flex items-center justify-center text-[11px] font-black text-white z-20 border border-white/20 shadow-lg">{activePage.index === -1 ? (activePage.type === 'blank' ? 'B' : 'IMG') : activePage.index}</div>
                                                        {activePage.type === 'blank' ? (
                                                            <div className="size-full flex flex-col items-center justify-center bg-white text-muted-foreground gap-2 p-4"><FilePlus2 className="size-8 opacity-20" /><span className="text-[8px] font-black uppercase opacity-40">Blank Page</span></div>
                                                        ) : (
                                                            <div className="size-full flex items-center justify-center p-3 transition-transform transform-gpu" style={{ transform: `rotate(${activePage.rotation}deg)` }}>
                                                                <img src={activePage.previewSrc || undefined} className="max-w-full max-h-full object-contain" alt="drag" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </DragOverlay>
                                        </DndContext>
                                    )}
                                    <ScrollBar />
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="bg-white dark:bg-slate-950 p-4 flex justify-center items-center relative shrink-0">
                                 <div className="inline-flex items-center gap-3 px-6 py-2 bg-black/80 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-3xl z-40"><MousePointer2 className="size-3.5 text-primary animate-pulse" /> Drag tiles to reorder pages</div>
                            </CardFooter>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-6 h-full flex flex-col no-print">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem] flex-1 flex flex-col">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8 shrink-0">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary text-left"><Settings2 className="size-4 md:size-5 text-primary" /> Studio Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-5 bg-primary/5 rounded-3xl border-2 border-primary/10 flex gap-4 shadow-inner text-left">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20"><Zap className="size-5 text-yellow-500 animate-pulse" /></div>
                                <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase">Quality is preserved as PDF metadata. Safe for submission.</p>
                            </div>

                            <div className="space-y-4 pt-4 border-t-2 border-dashed border-white/10 text-left">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Global Commands</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => sortPages('asc')} className="btn-pos-uiverse h-12 !ring-[3px] !ring-slate-950 dark:!ring-white transition-all shadow-sm" data-label="SORT 1 → N" />
                                    <button onClick={() => sortPages('desc')} className="btn-pos-uiverse h-12 !ring-[3px] !ring-slate-950 dark:!ring-white transition-all shadow-sm" data-label="SORT N → 1" />
                                    <button onClick={() => addBlankPage()} className="btn-pos-uiverse h-12 !ring-[3px] !ring-slate-950 dark:!ring-white transition-all shadow-sm" data-label="ADD BLANK" />
                                    <button onClick={() => rotateAll(90)} className="btn-pos-uiverse h-12 !ring-[3px] !ring-slate-950 dark:!ring-white transition-all shadow-sm" data-label="ROTATE ALL" />
                                    <button onClick={() => rotateAll(0)} className="btn-pos-uiverse h-12 !ring-[3px] !ring-slate-950 dark:!ring-white transition-all shadow-sm" data-label="RESET ALL" />
                                    <div className="relative">
                                        <button onClick={() => setIsRestoreOpen(true)} className="btn-pos-uiverse h-12 !ring-[3px] !ring-slate-950 dark:!ring-white transition-all shadow-sm" data-label="RECOVER BIN" />
                                        {deletedPages.length > 0 && (
                                            <span className="absolute -top-2 -right-1 size-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg border-2 border-white z-[60] animate-in zoom-in-50 pointer-events-none">
                                                {deletedPages.length}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mt-auto pt-6">
                                {!resultPdfUrl ? (
                                    <Button 
                                        className="magic-button w-full h-16 md:h-18 rounded-[1.5rem] bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-4" onClick={handleSavePdf} disabled={isSaving || isRendering || pages.length === 0}>
                                        <StarIcons />
                                        {isSaving ? <Loader2 className="size-6 md:size-7 animate-spin" /> : <FileDigit className="size-6 md:size-7 text-white/50 group-hover:scale-125 transition-transform" />}
                                        <span className="uppercase tracking-tighter text-lg md:text-xl">SAVE CHANGES</span>
                                    </Button>
                                ) : (
                                    <div className="space-y-3">
                                        <Button 
                                            size="lg" 
                                            className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-16 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none" 
                                            onClick={handleDownload}
                                        >
                                            <div className="absolute left-4 w-0.5 h-6 md:h-8 bg-white/40 rounded-full" />
                                            <span className="flex-1 px-10 text-center tracking-widest text-[11px] md:text-xs uppercase">SAVE PDF</span>
                                            <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                                <Download className="size-6 md:size-8 group-hover:scale-110 transition-transform" />
                                                <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                                            </div>
                                        </Button>
                                        <Button variant="outline" onClick={handleReset} className="h-11 w-full border-2 font-black uppercase text-[10px] rounded-xl hover:bg-destructive/5 hover:text-destructive"><RefreshCcw className="size-3.5 mr-2" /> Start New</Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isRestoreOpen} onOpenChange={setIsRestoreOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] p-0 rounded-[3rem] overflow-hidden border-none shadow-3xl bg-white dark:bg-slate-950 flex flex-col z-[1000] top-[50%]">
                    <DialogHeader className="p-8 border-b bg-primary/5">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3"><History className="size-6 text-primary" /> Trash Recovery</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="flex-1 p-8 bg-slate-100 dark:bg-slate-900/40 shadow-inner">
                        {deletedPages.length === 0 ? <div className="h-64 flex flex-col items-center justify-center text-center opacity-20 gap-4"><Trash2 className="size-16" /><p className="font-black uppercase tracking-widest text-sm">Trash is empty</p></div> : 
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {deletedPages.map((p) => (
                                    <div key={p.id} className="relative aspect-[1/1.414] rounded-xl overflow-hidden border-2 bg-white shadow-lg group">
                                        {p.type === 'blank' ? (
                                            <div className="size-full flex flex-col items-center justify-center bg-white text-muted-foreground gap-2 p-4 opacity-50"><FilePlus2 className="size-8 opacity-20" /><span className="text-[8px] font-black uppercase opacity-40">Blank Page</span></div>
                                        ) : (
                                            <div className="size-full flex items-center justify-center p-2 opacity-50 grayscale transition-all group-hover:grayscale-0 group-hover:opacity-100">
                                                <img src={p.previewSrc || undefined} className="max-w-full max-h-full object-contain" alt="trash" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2 size-7 rounded-md bg-black/60 flex items-center justify-center text-[9px] font-black text-white shadow-lg">{p.index === -1 ? (p.type === 'blank' ? 'B' : 'IMG') : p.index}</div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Button size="sm" className="bg-primary text-white font-black text-[9px] uppercase px-4 h-8 rounded-lg shadow-xl" onClick={() => restorePage(p.id)}>RESTORE</Button></div>
                                    </div>
                                ))}
                            </div>
                        }
                    </ScrollArea>
                    <DialogFooter className="p-8 border-t bg-muted/10 gap-4">
                        <Button variant="ghost" onClick={() => setIsRestoreOpen(false)} className="font-black uppercase text-[10px] tracking-widest px-8">CLOSE BIN</Button>
                        <Button disabled={deletedPages.length === 0} onClick={restoreAll} className="bg-primary text-white font-black text-xs uppercase px-10 h-12 rounded-xl shadow-xl">RESTORE ALL</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!zoomPage} onOpenChange={(open) => !open && setZoomPage(null)}>
                <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-3xl bg-white dark:bg-slate-950 flex flex-col top-[54%] z-[2000]">
                    <DialogHeader className="bg-primary/5 p-4 border-b shrink-0">
                        <DialogTitle className="text-center font-black uppercase tracking-widest text-[10px] text-muted-foreground flex items-center justify-center gap-2">
                             <Eye className="size-4 text-primary" /> Visual Studio Preview
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-slate-100 dark:bg-slate-900 shadow-inner custom-scrollbar text-center">
                        {zoomPage?.type === 'blank' ? (
                            <div className="bg-white aspect-[1/1.414] w-full max-w-[500px] shadow-3xl flex flex-col items-center justify-center border-[12px] border-white gap-4 mt-4 animate-in zoom-in-95 duration-500">
                                <FilePlus2 className="size-20 text-muted-foreground opacity-10" />
                                <span className="text-muted-foreground uppercase font-black text-xl opacity-20">Blank Canvas</span>
                                <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400">A4 FORMAT</Badge>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6 w-full">
                                <div className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[12px] border-white bg-white rounded-sm animate-in zoom-in-95 duration-500 overflow-hidden w-full max-w-[650px] mt-4 mb-4 transform-gpu">
                                    <img 
                                        src={zoomPage?.previewSrc || undefined} 
                                        className="w-full h-auto block" 
                                        style={{ transform: `rotate(${zoomPage?.rotation}deg)`, transition: 'transform 0.3s ease' }} 
                                        alt="zoom" 
                                    />
                                    <div className="absolute top-2 right-2 opacity-20 pointer-events-none">
                                        <Badge variant="outline" className="text-[7px] font-black uppercase border-black">{zoomPage?.type === 'image' ? 'IMAGE PAGE' : `PAGE ${zoomPage?.index}`}</Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-black/80 backdrop-blur-xl px-8 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-3xl z-40 transition-all hover:scale-105 mb-10">
                                    <Sparkles className="size-4 text-primary animate-pulse" /> High-Density Page Map Ready
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="p-5 bg-muted/10 border-t flex justify-center shrink-0">
                        <Button variant="outline" onClick={() => setZoomPage(null)} className="font-black text-[10px] uppercase tracking-widest px-10 h-12 border-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                            <X className="mr-2 size-4" /> Close Studio View
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* HIDDEN INPUTS FOR INSERTION */}
            <input ref={insertPdfInputRef} type="file" className="hidden" accept="application/pdf" onChange={onInsertPdfChange} />
            <input ref={insertImgInputRef} type="file" className="hidden" accept="image/*" onChange={onInsertImageChange} />
        </div>
    );
}
