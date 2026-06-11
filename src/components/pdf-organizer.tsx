"use client";

import { useState, useRef, useEffect, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
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
    Undo2,
    ChevronUp,
    ChevronDown,
    FilePlus2,
    FileText,
    Grip,
    ArrowDownAz,
    ArrowUpAz,
    History,
    Undo,
    RotateCcw
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
    DialogTrigger,
} from "@/components/ui/dialog";
import confetti from 'canvas-confetti';

const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
}

interface PageItem {
    id: string;
    index: number;       
    rotation: number;    
    previewSrc: string;
    isDeleted: boolean;
    type: 'original' | 'blank';
}

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i}`}>
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

/**
 * SORTABLE PAGE CARD COMPONENT
 */
function SortablePage({ 
    page, 
    onDelete, 
    onRotate, 
    onInsertBlank 
}: { 
    page: PageItem; 
    onDelete: (id: string) => void;
    onRotate: (id: string) => void;
    onInsertBlank: (id: string) => void;
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
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : undefined,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={cn(
                "group relative aspect-[1/1.414] rounded-2xl overflow-hidden border-2 bg-white dark:bg-slate-900 shadow-xl transition-all",
                "hover:border-primary/40 border-transparent shadow-primary/5",
                isDragging && "opacity-0"
            )}
        >
            <div className="absolute top-2 left-2 size-7 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white z-20 border border-white/10 pointer-events-none">
                {page.type === 'blank' ? 'B' : page.index}
            </div>
            
            <div {...attributes} {...listeners} className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Grip className="size-12 text-primary opacity-20" />
            </div>

            {page.type === 'blank' ? (
                <div className="size-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 text-muted-foreground gap-2 p-4 pointer-events-none border">
                    <FilePlus2 className="size-8 opacity-20" />
                    <span className="text-[8px] font-black uppercase opacity-40">Blank Page</span>
                </div>
            ) : (
                <div className="size-full flex items-center justify-center p-3 transition-transform duration-300 pointer-events-none" style={{ transform: `rotate(${page.rotation}deg)` }}>
                    <img src={page.previewSrc} className="max-w-full max-h-full object-contain pointer-events-none" alt="p" />
                </div>
            )}

            <div className="absolute bottom-2 right-2 flex gap-1.5 transition-all z-40">
                <button 
                    className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 shadow-xl border-2 dark:border-white/20 flex items-center justify-center hover:text-primary dark:text-white transition-all" 
                    onClick={(e) => { e.stopPropagation(); onInsertBlank(page.id); }} 
                    title="Insert Blank After"
                >
                    <Plus className="size-4" />
                </button>
                <button 
                    className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 shadow-xl border-2 dark:border-white/20 flex items-center justify-center hover:text-primary dark:text-white transition-all" 
                    onClick={(e) => { e.stopPropagation(); onRotate(page.id); }} 
                    title="Rotate 90"
                >
                    <RotateCw className="size-4" />
                </button>
                <button 
                    className="h-8 w-8 rounded-lg shadow-xl transition-all flex items-center justify-center bg-rose-500 text-white hover:bg-rose-600" 
                    onClick={(e) => { e.stopPropagation(); onDelete(page.id); }} 
                    title="Delete Page"
                >
                    <Trash2 className="size-4" />
                </button>
            </div>
        </div>
    );
}

/**
 * MAIN COMPONENT
 */
export default function PdfOrganizer() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    
    // Core State: Split between active and deleted
    const [pages, setPages] = useState<PageItem[]>([]);
    const [deletedPages, setDeletedPages] = useState<PageItem[]>([]);
    
    const [progress, setProgress] = useState(0);
    const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isRestoreOpen, setIsRestoreOpen] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const studioWorkspaceRef = useRef<HTMLDivElement>(null);
    const renderIdRef = useRef(0);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        return () => {
            if (resultPdfUrl) URL.revokeObjectURL(resultPdfUrl);
        }
    }, [resultPdfUrl]);

    const handleReset = () => {
        renderIdRef.current++;
        setPdfFile(null);
        setPages([]);
        setDeletedPages([]);
        setResultPdfUrl(null);
        setIsRendering(false);
        setIsSaving(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = async (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setPages([]);
            setDeletedPages([]);
            setResultPdfUrl(null);
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
                const timestamp = Date.now();
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
                            id: `p-${i}-${timestamp}`, 
                            index: i,
                            rotation: 0,
                            isDeleted: false,
                            previewSrc: canvas.toDataURL('image/jpeg', 0.7),
                            type: 'original'
                        });
                    }
                    setProgress(Math.round((i / totalPages) * 100));
                }
                setPages(newPages);
                toast({ title: 'PDF Loaded', description: `Visual map of ${newPages.length} pages ready.` });
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

    /**
     * MOVE TO TRASH
     */
    const deletePage = (id: string) => {
        const pageToDelete = pages.find(p => p.id === id);
        if (!pageToDelete) return;

        setPages(prev => prev.filter(p => p.id !== id));
        setDeletedPages(prev => [...prev, { ...pageToDelete, isDeleted: true }]);
        setResultPdfUrl(null);
        toast({ title: "Page Moved to Trash" });
    };

    /**
     * RESTORE FROM TRASH
     */
    const restorePage = (id: string) => {
        const pageToRestore = deletedPages.find(p => p.id === id);
        if (!pageToRestore) return;

        setDeletedPages(prev => prev.filter(p => p.id !== id));
        setPages(prev => [...prev, { ...pageToRestore, isDeleted: false }]);
        setResultPdfUrl(null);
        toast({ title: "Page Restored" });
    };

    const restoreAll = () => {
        if (deletedPages.length === 0) return;
        setPages(prev => [...prev, ...deletedPages.map(p => ({ ...p, isDeleted: false }))]);
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
        const blankPage: PageItem = {
            id: blankId,
            index: -1,
            rotation: 0,
            isDeleted: false,
            previewSrc: "", 
            type: 'blank'
        };

        setPages(prev => {
            if (!afterId) return [...prev, blankPage];
            const index = prev.findIndex(p => p.id === afterId);
            const next = [...prev];
            next.splice(index + 1, 0, blankPage);
            return next;
        });
        toast({ title: "Blank Page Inserted" });
    };

    const resetAllRotations = () => {
        setPages(prev => prev.map(p => ({ ...p, rotation: 0 })));
        setResultPdfUrl(null);
        toast({ title: "Rotations Reset", description: "All pages set to original orientation." });
    };

    const rotateAll = (deg: number) => {
        setPages(prev => prev.map(p => ({ ...p, rotation: deg % 360 })));
        setResultPdfUrl(null);
        toast({ title: "Rotated All Pages", description: `Applied ${deg}° to the entire stack.` });
    };

    const sortPages = (direction: 'asc' | 'desc') => {
        setPages(prev => {
            const sorted = [...prev].sort((a, b) => {
                if (a.type === 'blank' && b.type !== 'blank') return 1;
                if (a.type !== 'blank' && b.type === 'blank') return -1;
                if (a.type === 'blank' && b.type === 'blank') return 0;
                return direction === 'asc' ? a.index - b.index : b.index - a.index;
            });
            return sorted;
        });
        setResultPdfUrl(null);
        toast({ 
            title: direction === 'asc' ? "Sorted 1 to N" : "Sorted N to 1",
            description: `Pages re-arranged by original index.`
        });
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

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
        if (!pdfFile || pages.length === 0) return;
        setIsSaving(true);
        try {
            const existingPdfBytes = await pdfFile.arrayBuffer();
            const originalPdf = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
            const newPdfDoc = await PDFDocument.create();

            for (const p of pages) {
                if (p.type === 'blank') {
                    newPdfDoc.addPage([595.28, 841.89]); 
                } else {
                    const [copiedPage] = await newPdfDoc.copyPages(originalPdf, [p.index - 1]);
                    const currentRot = copiedPage.getRotation().angle;
                    copiedPage.setRotation(degrees(currentRot + p.rotation));
                    newPdfDoc.addPage(copiedPage);
                }
            }

            const pdfBytes = await newPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setResultPdfUrl(url);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#043873', '#4F9CF9', '#ffffff'] });
            toast({ title: "Organize Success!", description: "Changes bundled into new PDF." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Save Error', description: "Check if document is password protected." });
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
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6 mb-8 md:mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 no-print">
                <div className="flex items-center gap-3">
                    <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                        <Settings2 className="size-5 md:size-6" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter">Studio <span className="text-primary">Panel</span></h2>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {resultPdfUrl && (
                        <Button size="lg" className="magic-button magic-button-success flex-1 md:flex-none h-11 md:h-12 px-8 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 font-black rounded-full transition-all active:scale-95 group flex items-center justify-center gap-3" onClick={handleDownload}>
                            <StarIcons />
                            <Download className="mr-1.5 size-7 md:size-8 group-hover:translate-y-1 transition-transform" /> 
                            <span className="uppercase tracking-tighter text-[10px] md:text-xs">DOWNLOAD PDF</span>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-auto lg:h-[calc(100vh-280px)] md:h-[650px]">
                {/* Main Viewport */}
                <div className="lg:col-span-8 h-full flex flex-col min-h-[450px]">
                    {!pdfFile ? (
                        <Card className={cn(
                            "w-full glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 cursor-pointer select-none h-full flex flex-col",
                            isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
                        )}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <CardHeader className="bg-muted/30 border-b p-6 text-center">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col items-center justify-center p-10 md:p-16">
                                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center space-y-6 bg-muted/30 group">
                                    <div className="relative">
                                        <UploadCloud className="size-14 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop PDF to Organize</p>
                                        <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">Delete, re-order, rotate or insert blank pages.</p>
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                            <CardHeader className="bg-muted/30 border-b py-3 px-4 md:px-6 flex flex-row items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <LayoutGrid className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Visual Document Map</CardTitle>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary font-black text-[8px] md:text-[9px] px-3 py-1 rounded-full border-none">
                                        {pages.length} ACTIVE PAGES
                                    </Badge>
                                    <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-[8px] md:text-[9px] font-black uppercase border-2 border-primary/10 hover:bg-destructive/5 hover:text-destructive px-3 rounded-lg shrink-0 no-print">
                                        <RefreshCcw className="mr-1.5 size-3" /> Change
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner overflow-hidden relative border-b">
                                {isRendering ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-8 py-20">
                                        <div className="relative">
                                            <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20 stroke-[3]" />
                                            <Monitor className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                                        </div>
                                        <div className="space-y-3 w-full max-w-xs text-center">
                                            <p className="font-black text-sm text-primary uppercase tracking-widest animate-pulse">Rendering Pages...</p>
                                            <Progress value={progress} className="h-1.5 shadow-inner" />
                                        </div>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-full w-full">
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragStart={handleDragStart}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext items={pages} strategy={rectSortingStrategy}>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 p-6 pb-24">
                                                    {pages.map((p) => (
                                                        <SortablePage 
                                                            key={p.id} 
                                                            page={p} 
                                                            onDelete={deletePage}
                                                            onRotate={rotatePage}
                                                            onInsertBlank={addBlankPage}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                            
                                            <DragOverlay adjustScale dropAnimation={{
                                                sideEffects: defaultDropAnimationSideEffects({
                                                    styles: { active: { opacity: '0.4' } },
                                                }),
                                            }}>
                                                {activeId && activePage ? (
                                                    <div className="relative aspect-[1/1.414] rounded-2xl overflow-hidden border-4 border-primary bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] opacity-80 scale-105 transition-transform cursor-grabbing z-[9999] pointer-events-none">
                                                        <div className="absolute top-2 left-2 size-7 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white z-20 border border-white/10">
                                                            {activePage.type === 'blank' ? 'B' : activePage.index}
                                                        </div>
                                                        {activePage.type === 'blank' ? (
                                                            <div className="size-full flex flex-col items-center justify-center bg-white text-muted-foreground gap-2 p-4"><FilePlus2 className="size-8 opacity-20" /><span className="text-[8px] font-black uppercase opacity-40">Blank Page</span></div>
                                                        ) : (
                                                            <div className="size-full flex items-center justify-center p-3" style={{ transform: `rotate(${activePage.rotation}deg)` }}>
                                                                <img src={activePage.previewSrc} className="max-w-full max-h-full object-contain" alt="drag" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </DragOverlay>
                                        </DndContext>
                                        <ScrollBar />
                                    </ScrollArea>
                                )}
                            </CardContent>
                            <CardFooter className="bg-white dark:bg-slate-950 p-4 flex justify-center items-center relative shrink-0">
                                 <div className="inline-flex items-center gap-3 px-6 py-2 bg-black/80 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-3xl z-40">
                                    <MousePointer2 className="size-3.5 text-primary animate-pulse" /> Drag tiles to reorder pages
                                </div>
                            </CardFooter>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6 h-full flex flex-col no-print">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem] flex-1 flex flex-col">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8 shrink-0">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                <Settings2 className="size-4 md:size-5 text-primary" /> Studio Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-5 bg-primary/5 rounded-3xl border-2 border-primary/10 flex gap-4 shadow-inner">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20"><Zap className="size-5 text-yellow-500 animate-pulse" /></div>
                                <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase text-left">
                                    <span className="font-black block mb-1 text-primary">VECTOR LOCK:</span>
                                    Rotation and reordering are applied as high-fidelity metadata changes.
                                </p>
                            </div>

                            <div className="space-y-4 pt-4 border-t-2 border-dashed border-white/10">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Global Commands</Label>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => sortPages('asc')} className="btn-pos-uiverse h-14 hover:scale-105 active:scale-95 transition-all" data-label="SORT 1 → N" />
                                        <button onClick={() => sortPages('desc')} className="btn-pos-uiverse h-14 hover:scale-105 active:scale-95 transition-all" data-label="SORT N → 1" />
                                    </div>
                                    <button onClick={() => addBlankPage()} className="btn-pos-uiverse h-14 hover:scale-105 active:scale-95 transition-all" data-label="ADD BLANK PAGE" />
                                    <button onClick={() => rotateAll(90)} className="btn-pos-uiverse h-14 hover:scale-105 active:scale-95 transition-all" data-label="ROTATE ALL 90°" />
                                    <button onClick={() => resetAllRotations()} className="btn-pos-uiverse h-14 hover:scale-105 active:scale-95 transition-all" data-label="RESET ALL ROTATIONS" />
                                    
                                    <Dialog open={isRestoreOpen} onOpenChange={setIsRestoreOpen}>
                                        <div className="relative w-full">
                                            <DialogTrigger asChild>
                                                <button className="btn-pos-uiverse h-14 hover:scale-105 active:scale-95 transition-all" data-label="RESTORE DELETED" />
                                            </DialogTrigger>
                                            {deletedPages.length > 0 && (
                                                <span className="absolute -top-3 -right-2 size-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-black animate-bounce z-50 pointer-events-none shadow-xl border-2 border-white">
                                                    {deletedPages.length}
                                                </span>
                                            )}
                                        </div>
                                        <DialogContent className="max-w-4xl max-h-[85vh] p-0 rounded-[3rem] overflow-hidden border-none shadow-3xl bg-white dark:bg-slate-950 flex flex-col">
                                            <DialogHeader className="p-8 border-b bg-primary/5">
                                                <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                    <History className="size-6 text-primary" /> Trash Bin Recovery
                                                </DialogTitle>
                                                <CardDescription className="uppercase font-bold text-[10px] tracking-widest">Select pages to restore back to workspace</CardDescription>
                                            </DialogHeader>
                                            
                                            <ScrollArea className="flex-1 p-8 bg-slate-100 dark:bg-slate-900/40 shadow-inner">
                                                {deletedPages.length === 0 ? (
                                                    <div className="h-64 flex flex-col items-center justify-center text-center opacity-20 gap-4">
                                                        <Trash2 className="size-16" />
                                                        <p className="font-black uppercase tracking-widest text-sm">Trash is empty</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                        {deletedPages.map((p) => (
                                                            <div key={p.id} className="relative aspect-[1/1.414] rounded-xl overflow-hidden border-2 bg-white shadow-lg group">
                                                                <div className="size-full flex items-center justify-center p-2 opacity-50 grayscale transition-all group-hover:grayscale-0 group-hover:opacity-100">
                                                                    <img src={p.previewSrc} className="max-w-full max-h-full object-contain" alt="trash" />
                                                                </div>
                                                                <div className="absolute top-2 left-2 size-6 rounded-md bg-black/60 flex items-center justify-center text-[9px] font-black text-white">{p.index === -1 ? 'B' : p.index}</div>
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <Button size="sm" className="bg-primary text-white font-black text-[9px] uppercase px-4 h-8 rounded-lg" onClick={() => restorePage(p.id)}>RESTORE</Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </ScrollArea>

                                            <DialogFooter className="p-8 border-t bg-muted/10 gap-4">
                                                <Button variant="ghost" onClick={() => setIsRestoreOpen(false)} className="font-black uppercase text-[10px] tracking-widest px-8">CLOSE BIN</Button>
                                                <Button 
                                                    disabled={deletedPages.length === 0} 
                                                    onClick={restoreAll}
                                                    className="bg-primary text-white font-black text-xs uppercase px-10 h-12 rounded-xl shadow-xl"
                                                >
                                                    RESTORE ALL PAGES
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            <Separator className="opacity-10" />

                            <div className="space-y-4 mt-auto">
                                {!resultPdfUrl ? (
                                    <Button className="magic-button w-full h-16 md:h-20 rounded-[1.5rem] bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-4" onClick={handleSavePdf} disabled={isSaving || isRendering || pages.length === 0}>
                                        <StarIcons />
                                        {isSaving ? <div className="flex items-center gap-3"><Loader2 className="size-6 md:size-7 animate-spin" /><span className="uppercase text-sm md:text-base tracking-tighter">BUNDLING...</span></div> : <div className="flex items-center gap-3"><FileDigit className="size-6 md:size-7 text-white/50 group-hover:scale-125 transition-transform" /><span className="uppercase tracking-tighter text-lg md:text-xl">SAVE CHANGES</span></div>}
                                    </Button>
                                ) : (
                                    <Button onClick={handleDownload} className="magic-button magic-button-success w-full h-16 md:h-20 text-lg font-black bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 rounded-[1.5rem] transition-all active:scale-95 flex items-center justify-center gap-4 px-10 animate-in zoom-in-95">
                                        <StarIcons /><Download className="mr-3 size-7 md:size-8 group-hover:translate-y-1 transition-transform" /><span className="uppercase tracking-tighter">DOWNLOAD PDF</span>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
