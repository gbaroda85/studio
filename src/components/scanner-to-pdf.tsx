
"use client";

import React, { useState, useRef, useEffect, useCallback, type ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { 
    Camera, 
    Download, 
    X, 
    Loader2, 
    UploadCloud,
    CheckCircle2,
    Zap, 
    ShieldCheck, 
    Sparkles,
    Layout,
    Plus,
    Monitor,
    ImageIcon,
    MousePointer2,
    Settings2,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    RefreshCcw,
    Trash2,
    ArrowRight,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type VAlign = 'top' | 'center' | 'bottom';

interface ImageItem {
    id: string;
    src: string;
    vAlign: VAlign;
    name: string;
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

export default function ScannerToPdf() {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setIsCapturing(true);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
        });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    } catch (err) {
        toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access camera.' });
        setIsCapturing(false);
    }
  };

  const stopCamera = () => {
      if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
      setIsCapturing(false);
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; 
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(video, 0, 0);
        const data = canvas.toDataURL('image/jpeg', 0.95);
        const id = Math.random().toString(36).substr(2, 9);
        const newItem: ImageItem = { id, src: data, vAlign: 'center', name: `Capture-${Date.now()}.jpg` };
        setImages(prev => [...prev, newItem]);
        if (!selectedId) setSelectedId(id);
        stopCamera();
        toast({ title: "Captured!" });
    }
  };

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const filesArray = Array.from(files);
    filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const id = Math.random().toString(36).substr(2, 9);
            const newItem: ImageItem = { id, src: ev.target?.result as string, vAlign: 'center', name: file.name };
            setImages(prev => [...prev, newItem]);
            if (!selectedId) setSelectedId(id);
        };
        reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemove = (id: string) => {
      setImages(prev => {
          const filtered = prev.filter(img => img.id !== id);
          if (selectedId === id) setSelectedId(filtered.length > 0 ? filtered[0].id : null);
          return filtered;
      });
  };

  const handleUpdateAlign = (vAlign: VAlign) => {
      if (!selectedId) return;
      setImages(prev => prev.map(img => img.id === selectedId ? { ...img, vAlign } : img));
  };

  const handleBuildPdf = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);
    
    try {
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < images.length; i++) {
            if (i > 0) pdf.addPage();
            const item = images[i];
            
            const img = new window.Image();
            img.src = item.src;
            await new Promise(r => img.onload = r);
            
            const ratio = Math.min(pw / img.width, ph / img.height) * 0.95;
            const fw = img.width * ratio;
            const fh = img.height * ratio;
            const x = (pw - fw) / 2;
            let y;

            if (item.vAlign === 'top') y = 0;
            else if (item.vAlign === 'bottom') y = ph - fh;
            else y = (ph - fh) / 2;

            pdf.addImage(item.src, 'JPEG', x, y, fw, fh, undefined, 'FAST');
        }

        pdf.save(`GR7-Bundle-${Date.now()}.pdf`);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff5569', '#ffffff'] });
        toast({ title: "PDF Generated Successfully" });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Export Failed' });
    } finally {
        setIsGenerating(false);
    }
  };

  const selectedImage = images.find(img => img.id === selectedId);

  return (
    <div className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 py-6 animate-in fade-in duration-700 bg-transparent text-left">
        
        {/* MAIN AREA: BUNDLE STUDIO */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            <Card className="border-none shadow-3xl bg-[#0a040d] rounded-[2.5rem] overflow-hidden flex flex-col flex-1 border border-white/5">
                <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-[#ff5569]/10 flex items-center justify-center text-[#ff5569] shadow-lg border border-[#ff5569]/20">
                            <FileStack className="size-5" />
                        </div>
                        <div className="text-left">
                            <CardTitle className="text-2xl font-black uppercase tracking-tighter text-[#ff5569]">BUNDLE STUDIO</CardTitle>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#ff5569]/40 mt-1">100% PRIVATE LOCAL RAM PROCESSING.</p>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-8 flex flex-col items-center justify-center min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {isCapturing ? (
                            <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative group">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-[50vh] object-contain rounded-3xl border-4 border-white/10 bg-black shadow-3xl" />
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-50">
                                    <Button className="size-16 rounded-full bg-white text-black p-0 shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-[#ff5569]/40" onClick={captureFrame}>
                                        <Camera className="size-8"/>
                                    </Button>
                                    <Button variant="ghost" className="h-16 w-16 rounded-full bg-black/40 text-white border border-white/10 hover:bg-black/60" onClick={stopCamera}>
                                        <X className="size-8" />
                                    </Button>
                                </div>
                            </motion.div>
                        ) : images.length === 0 ? (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl h-auto">
                                <button 
                                    className="border-2 border-dashed border-[#ff5569]/20 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-6 bg-[#ff5569]/5 hover:bg-[#ff5569]/10 transition-all group group relative"
                                    onClick={startCamera}
                                >
                                    <div className="size-16 rounded-2xl bg-[#ff5569]/10 flex items-center justify-center text-[#ff5569] shadow-xl group-hover:scale-110 transition-transform">
                                        <Camera className="size-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-black uppercase tracking-tighter text-[#ff5569]">NATIVE CAMERA</p>
                                        <p className="text-[10px] font-bold text-[#ff5569]/40 mt-1 uppercase tracking-widest">FULL SCREEN CAPTURE</p>
                                    </div>
                                </button>

                                <button 
                                    className="border-2 border-dashed border-[#ff5569]/20 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-6 bg-[#ff5569]/5 hover:bg-[#ff5569]/10 transition-all group group relative"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="size-16 rounded-2xl bg-[#ff5569]/10 flex items-center justify-center text-[#ff5569] shadow-xl group-hover:scale-110 transition-transform">
                                        <UploadCloud className="size-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-black uppercase tracking-tighter text-[#ff5569]">PHOTO GALLERY</p>
                                        <p className="text-[10px] font-bold text-[#ff5569]/40 mt-1 uppercase tracking-widest">SELECT MULTIPLE IMAGES</p>
                                    </div>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleFiles} />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col gap-6 h-full">
                                <ScrollArea className="flex-1 w-full h-[450px] pr-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-20">
                                        {images.map((img, idx) => (
                                            <div 
                                                key={img.id} 
                                                onClick={() => setSelectedId(img.id)}
                                                className={cn(
                                                    "relative aspect-[3/4] rounded-[1.5rem] overflow-hidden border-2 bg-[#120c18] transition-all cursor-pointer transform active:scale-95 group shadow-2xl",
                                                    selectedId === img.id ? "border-[#ff5569] ring-8 ring-[#ff5569]/10 z-10 scale-105" : "border-white/5 hover:border-[#ff5569]/30"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute inset-0 flex flex-col w-full h-full p-2 transition-all duration-300",
                                                    img.vAlign === 'top' ? 'justify-start' : img.vAlign === 'bottom' ? 'justify-end' : 'justify-center'
                                                )}>
                                                    <img src={img.src} className="max-w-full max-h-full object-contain pointer-events-none mx-auto block" alt="scan" />
                                                </div>
                                                <div className="absolute top-2 left-2 size-6 rounded-md bg-[#ff5569] text-white flex items-center justify-center text-[10px] font-black shadow-lg">#{idx + 1}</div>
                                                <button 
                                                    className="absolute top-2 right-2 size-8 rounded-lg bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                                                    onClick={(e) => { e.stopPropagation(); handleRemove(img.id); }}
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button 
                                            className="aspect-[3/4] border-2 border-dashed border-[#ff5569]/20 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 hover:bg-[#ff5569]/5 transition-all text-[#ff5569]/40 group"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Plus className="size-10 group-hover:scale-125 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">ADD PAGE</span>
                                        </button>
                                    </div>
                                    <ScrollBar />
                                </ScrollArea>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
                
                <CardFooter className="bg-black/20 p-6 flex justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-[#ff5569]/30 shrink-0">
                    <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500/60" /> SECURE RAM</div>
                    <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500/60" /> 100% PRIVATE</div>
                </CardFooter>
            </Card>
        </div>

        {/* SIDEBAR: POSITIONING */}
        <div className="lg:col-span-4 flex flex-col gap-6 no-print">
            <Card className="border-none shadow-3xl bg-[#0a040d] rounded-[2.5rem] overflow-hidden flex flex-col h-full border border-white/5">
                <CardHeader className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-[#ff5569]/10 flex items-center justify-center text-[#ff5569] border border-[#ff5569]/20">
                            <Layout className="size-4" />
                        </div>
                        <CardTitle className="text-lg font-black uppercase tracking-tighter text-white">POSITIONING</CardTitle>
                    </div>
                </CardHeader>
                
                <CardContent className="p-8 flex-1 space-y-10 flex flex-col text-left">
                    {!selectedId ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-30 gap-6">
                            <MousePointer2 className="size-16 text-[#ff5569] animate-bounce" />
                            <p className="text-xs font-black uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">SELECT AN IMAGE TO UNLOCK ALIGNMENT</p>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 text-left">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5569] flex items-center gap-2 mb-4">
                                    <AlignVerticalJustifyCenter className="size-3" /> Vertical Position
                                </Label>
                                <div className="grid grid-cols-1 gap-3">
                                    <button 
                                        className={cn(
                                            "btn-pos-uiverse h-14 relative group !ring-[3px] !ring-white/10",
                                            selectedImage?.vAlign === 'top' && "active-uiverse"
                                        )} 
                                        data-label="      Top Align"
                                        onClick={() => handleUpdateAlign('top')}
                                    >
                                        <AlignVerticalJustifyStart className="absolute left-4 top-1/2 -translate-y-1/2 size-5 z-30 text-white group-hover:text-black transition-colors" />
                                    </button>
                                    <button 
                                        className={cn(
                                            "btn-pos-uiverse h-14 relative group !ring-[3px] !ring-white/10",
                                            selectedImage?.vAlign === 'center' && "active-uiverse"
                                        )} 
                                        data-label="      Center Align"
                                        onClick={() => handleUpdateAlign('center')}
                                    >
                                        <AlignVerticalJustifyCenter className="absolute left-4 top-1/2 -translate-y-1/2 size-5 z-30 text-white group-hover:text-black transition-colors" />
                                    </button>
                                    <button 
                                        className={cn(
                                            "btn-pos-uiverse h-14 relative group !ring-[3px] !ring-white/10",
                                            selectedImage?.vAlign === 'bottom' && "active-uiverse"
                                        )} 
                                        data-label="      Bottom Align"
                                        onClick={() => handleUpdateAlign('bottom')}
                                    >
                                        <AlignVerticalJustifyEnd className="absolute left-4 top-1/2 -translate-y-1/2 size-5 z-30 text-white group-hover:text-black transition-colors" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-4 pt-4">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                                    <Settings2 className="size-4 text-[#ff5569] opacity-40" />
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Alignment is persistent per page.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="p-6 bg-[#ff5569]/5 rounded-[2rem] border border-[#ff5569]/10 flex gap-5 shadow-inner mt-auto">
                        <div className="size-10 rounded-full bg-[#ff5569]/10 flex items-center justify-center shrink-0 border border-[#ff5569]/20">
                             <Zap className="size-5 text-[#ff5569] animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-[#ff5569] uppercase tracking-tight">A4 SYNC:</p>
                            <p className="text-[8px] text-[#ff5569]/80 font-medium leading-relaxed uppercase">
                                FINAL PDF IS GENERATED AT 300DPI WITH DEEP BUFFER DECODING TO PREVENT QUALITY LOSS.
                            </p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="bg-black/20 p-8 border-t border-white/5 flex flex-col gap-4 shrink-0">
                    <Button 
                        size="lg"
                        className="magic-button w-full h-16 md:h-18 bg-[#ff5569] hover:bg-[#ff5569]/90 text-white font-black rounded-2xl shadow-3xl active:scale-95 transition-all flex items-center justify-center gap-4 border-none"
                        onClick={handleBuildPdf}
                        disabled={images.length === 0 || isGenerating}
                    >
                        <StarIcons />
                        {isGenerating ? <Loader2 className="size-6 animate-spin" /> : <Eye className="size-6" />}
                        <span className="uppercase tracking-widest text-sm font-black">BUILD HD PREVIEW</span>
                    </Button>
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 text-center">LOCAL RAM PROCESSING ACTIVE</p>
                </CardFooter>
            </Card>
        </div>

    </div>
  );
}
