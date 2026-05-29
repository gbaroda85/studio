"use client";

import { useState, useRef, useEffect, type ChangeEvent, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { 
    Download, 
    X, 
    Loader2, 
    UploadCloud,
    CheckCircle2,
    Zap, 
    ShieldCheck, 
    ImageIcon,
    FileStack,
    Trash2,
    RotateCw,
    Layout,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyEnd,
    MousePointer2,
    Layers,
    ChevronRight,
    Camera,
    RefreshCcw,
    Settings2,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

type VAlign = 'top' | 'center' | 'bottom';

interface ScannedPage {
    id: string;
    src: string;
    name: string;
    vAlign: VAlign;
}

export default function ScannerToPdf() {
  const { toast } = useToast();
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      pages.forEach(page => {
        if (page.src.startsWith('blob:')) {
          URL.revokeObjectURL(page.src);
        }
      });
    };
  }, []);

  // Handle local file uploads or camera capture with instant ObjectURL
  const handleFilesUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const newItems: ScannedPage[] = Array.from(filesList).map(file => {
        const id = Math.random().toString(36).substr(2, 9);
        return {
            id,
            src: URL.createObjectURL(file), // Direct and instant
            name: file.name || `Scan-${Date.now()}.jpg`,
            vAlign: 'center'
        };
    });

    setPages(prev => {
        const updated = [...prev, ...newItems];
        if (!selectedId && updated.length > 0) setSelectedId(updated[0].id);
        return updated;
    });

    // Reset input so same file/camera action can be repeated
    e.target.value = "";
    toast({ title: "Page Added", description: `${newItems.length} new scan(s) loaded.` });
  };

  const handleRemovePage = (id: string) => {
    setPages(prev => {
        const item = prev.find(p => p.id === id);
        if (item?.src.startsWith('blob:')) URL.revokeObjectURL(item.src);
        
        const filtered = prev.filter(p => p.id !== id);
        if (selectedId === id) setSelectedId(filtered.length > 0 ? filtered[0].id : null);
        return filtered;
    });
  };

  const handleRotate = (id: string) => {
    const item = pages.find(p => p.id === id);
    if (!item) return;

    const img = new window.Image();
    img.src = item.src;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = img.height;
        canvas.height = img.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        const rotatedSrc = canvas.toDataURL('image/jpeg', 0.9);
        // Revoke old blob if it was a blob
        if (item.src.startsWith('blob:')) URL.revokeObjectURL(item.src);
        
        setPages(prev => prev.map(p => p.id === id ? { ...p, src: rotatedSrc } : p));
    };
  };

  const updateAlignment = (vAlign: VAlign) => {
      if (!selectedId) return;
      setPages(prev => prev.map(p => p.id === selectedId ? { ...p, vAlign } : p));
  };

  const applyAlignmentToAll = () => {
      const selected = pages.find(p => p.id === selectedId);
      if (!selected) return;
      setPages(prev => prev.map(p => ({ ...p, vAlign: selected.vAlign })));
      toast({ title: "Applied to All", description: `All pages set to ${selected.vAlign} alignment.` });
  };

  const handleDownloadPdf = async () => {
    if (pages.length === 0) return;
    setIsGenerating(true);
    try {
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < pages.length; i++) {
            if (i > 0) pdf.addPage();
            
            const pageData = pages[i];
            const img = new window.Image();
            img.src = pageData.src;

            await new Promise((resolve, reject) => {
                img.onload = () => {
                    const imgProps = pdf.getImageProperties(img);
                    const margin = 10;
                    const safeWidth = pageWidth - (margin * 2);
                    const safeHeight = pageHeight - (margin * 2);
                    
                    const ratio = Math.min(safeWidth / imgProps.width, safeHeight / imgProps.height);
                    const finalW = imgProps.width * ratio;
                    const finalH = imgProps.height * ratio;

                    const x = (pageWidth - finalW) / 2;
                    let y;

                    if (pageData.vAlign === 'top') {
                        y = margin;
                    } else if (pageData.vAlign === 'bottom') {
                        y = pageHeight - finalH - margin;
                    } else {
                        y = (pageHeight - finalH) / 2;
                    }

                    pdf.addImage(pageData.src, 'JPEG', x, y, finalW, finalH, undefined, 'FAST');
                    resolve(null);
                };
                img.onerror = () => reject(new Error("Image Load Failed"));
            });
        }

        pdf.save(`GR7-Scan-Bundle-${Date.now()}.pdf`);
        toast({ title: "PDF Exported", description: "Document saved successfully." });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Export Failed', description: "Check file permissions." });
    } finally {
        setIsGenerating(false);
    }
  };

  const selectedPage = pages.find(p => p.id === selectedId);

  return (
    <div className="w-full max-w-7xl flex flex-col gap-6 animate-in fade-in duration-700 pb-20 px-4 mx-auto">
        
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: WORKSPACE */}
            <div className="lg:col-span-8 space-y-6">
                <Card className="border-2 shadow-2xl overflow-hidden rounded-[2.5rem] bg-card/50">
                    <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                         <div className="space-y-1">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <FileStack className="size-6 text-primary" /> BUNDLE STUDIO
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase opacity-60">Capture or upload to start bundle.</CardDescription>
                         </div>
                         <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={() => setPages([])} className="h-8 text-[9px] font-black uppercase border-2 rounded-lg text-destructive hover:bg-destructive/5"><Trash2 className="size-3 mr-1" /> Clear All</Button>
                         </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        {pages.length === 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div 
                                    className="border-4 border-dashed border-primary/20 rounded-3xl p-10 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-primary/5 transition-all group"
                                    onClick={() => cameraInputRef.current?.click()}
                                >
                                    <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg">
                                        <Camera className="size-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-black uppercase tracking-tighter">Native Camera</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Full screen capture</p>
                                    </div>
                                    <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFilesUpload} />
                                </div>

                                <div 
                                    className="border-4 border-dashed border-muted-foreground/20 rounded-3xl p-10 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/5 transition-all group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
                                        <UploadCloud className="size-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-black uppercase tracking-tighter">Photo Gallery</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Select multiple files</p>
                                    </div>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleFilesUpload} />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <ScrollArea className="h-[450px] pr-2 custom-scrollbar">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
                                        {pages.map((p, i) => (
                                            <div 
                                                key={p.id} 
                                                onClick={() => setSelectedId(p.id)}
                                                className={cn(
                                                    "group relative aspect-[1/1.414] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-white shadow-lg",
                                                    selectedId === p.id ? "border-primary ring-4 ring-primary/20 scale-105 z-10" : "hover:border-primary/40"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute inset-0 flex flex-col p-1 transition-all duration-300",
                                                    p.vAlign === 'top' ? 'justify-start' : p.vAlign === 'bottom' ? 'justify-end' : 'justify-center'
                                                )}>
                                                    <img src={p.src} className="max-w-full max-h-[90%] object-contain mx-auto" alt="thumb" />
                                                </div>
                                                <div className="absolute top-2 left-2 size-7 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white z-20">P{i + 1}</div>
                                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1">
                                                    <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg shadow-lg" onClick={(e) => { e.stopPropagation(); handleRotate(p.id); }}>
                                                        <RotateCw className="size-3.5" />
                                                    </Button>
                                                    <Button size="icon" variant="destructive" className="h-7 w-7 rounded-lg shadow-lg" onClick={(e) => { e.stopPropagation(); handleRemovePage(p.id); }}>
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            className="aspect-[1/1.414] border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-all text-primary font-black uppercase text-[10px]"
                                            onClick={() => cameraInputRef.current?.click()}
                                        >
                                            <Plus className="size-6" />
                                            Add Scan
                                        </button>
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-muted/10 border-t p-4 flex justify-center gap-8">
                         <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            <ShieldCheck className="size-4 text-green-500" /> SECURE RAM
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            <Zap className="size-4 text-yellow-500" /> 100% PRIVATE
                        </div>
                    </CardFooter>
                </Card>

                {pages.length > 0 && (
                    <Button 
                        onClick={handleDownloadPdf} 
                        disabled={isGenerating}
                        className="h-20 w-full bg-primary text-black font-black text-2xl rounded-3xl shadow-3xl transform active:scale-95 transition-all group relative overflow-hidden"
                    >
                        {isGenerating ? <Loader2 className="animate-spin mr-3 size-8" /> : <Download className="mr-3 size-8 group-hover:translate-y-1 transition-transform" />}
                        GENERATE PDF BUNDLE
                        <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 size-8 opacity-20" />
                    </Button>
                )}
            </div>

            {/* RIGHT: POSITIONING PANEL */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                            <Layout className="size-6 text-primary" /> POSITIONING
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-8">
                        {!selectedId ? (
                            <div className="py-12 text-center space-y-4 opacity-40">
                                 <MousePointer2 className="size-12 mx-auto text-muted-foreground" />
                                 <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Select a page thumbnail<br/>to adjust its position</p>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <AlignVerticalJustifyCenter className="size-3" /> Vertical Alignment
                                    </Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Button 
                                            variant={selectedPage?.vAlign === 'top' ? 'default' : 'outline'} 
                                            className={cn("h-16 flex-col gap-1 rounded-xl border-2", selectedPage?.vAlign === 'top' && "border-primary")} 
                                            onClick={() => updateAlignment('top')}
                                        >
                                            <AlignVerticalJustifyStart className="size-5" />
                                            <span className="text-[8px] font-black uppercase">Top</span>
                                        </Button>
                                        <Button 
                                            variant={selectedPage?.vAlign === 'center' ? 'default' : 'outline'} 
                                            className={cn("h-16 flex-col gap-1 rounded-xl border-2", selectedPage?.vAlign === 'center' && "border-primary")} 
                                            onClick={() => updateAlignment('center')}
                                        >
                                            <AlignVerticalJustifyCenter className="size-5" />
                                            <span className="text-[8px] font-black uppercase">Center</span>
                                        </Button>
                                        <Button 
                                            variant={selectedPage?.vAlign === 'bottom' ? 'default' : 'outline'} 
                                            className={cn("h-16 flex-col gap-1 rounded-xl border-2", selectedPage?.vAlign === 'bottom' && "border-primary")} 
                                            onClick={() => updateAlignment('bottom')}
                                        >
                                            <AlignVerticalJustifyEnd className="size-5" />
                                            <span className="text-[8px] font-black uppercase">Bottom</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t-2 border-dashed">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <RotateCw className="size-3" /> Orientation
                                    </Label>
                                    <Button 
                                        variant="outline" 
                                        className="w-full h-12 rounded-xl border-2 font-black text-xs uppercase"
                                        onClick={() => handleRotate(selectedId)}
                                    >
                                        <RotateCw className="size-4 mr-2" /> Rotate 90°
                                    </Button>
                                </div>

                                <Button variant="outline" className="w-full h-10 border-2 font-black text-[9px] uppercase tracking-widest text-primary hover:bg-primary/5" onClick={applyAlignmentToAll}>
                                    <Layers className="size-3 mr-2" /> Apply to All Pages
                                </Button>
                            </div>
                        )}

                        <div className="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10 flex gap-4">
                            <Zap className="size-6 text-yellow-500 shrink-0" />
                            <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase">
                                <span className="font-black block mb-1 text-primary">A4 AUTO-FIT:</span>
                                Photos are automatically scaled to fit standard A4 margins perfectly.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-6 border-t-2">
                        <div className="flex items-center gap-3 text-muted-foreground/60 text-[8px] font-black uppercase tracking-widest mx-auto">
                            <ShieldCheck className="size-3" /> Industrial Grade PDF Render
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
