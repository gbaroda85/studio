"use client";

import { useState, useRef, useEffect, useCallback, type ChangeEvent } from 'react';
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
    ImageIcon,
    FileStack,
    Trash2,
    Smartphone,
    Plus,
    RotateCw,
    FileText,
    Grid3X3,
    ArrowRight,
    RefreshCcw,
    Layers,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

interface ScannedPage {
    id: string;
    src: string;
    name: string;
}

export default function ScannerToPdf() {
  const { toast } = useToast();
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if(videoRef.current && videoRef.current.srcObject){
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: { ideal: "environment" }, 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 } 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setHasCameraPermission(true);
        setIsCameraActive(true);
      }
    } catch (error) {
      setHasCameraPermission(false);
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access camera. Please check permissions.' });
    }
  }, [toast]);

  // Handle local file uploads
  const handleFilesUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPages: ScannedPage[] = [];
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setScannedPages(prev => [...prev, {
                    id: Math.random().toString(36).substr(2, 9),
                    src: event.target?.result as string,
                    name: file.name
                }]);
            };
            reader.readAsDataURL(file);
        }
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const src = canvas.toDataURL('image/jpeg', 0.9);
      setScannedPages(prev => [...prev, { 
          id: Math.random().toString(36).substr(2, 9), 
          src,
          name: `Scan-${prev.length + 1}.jpg`
      }]);
      setIsCapturing(false);
      toast({ title: "Page Captured", description: `Added to bundle.` });
    }
  };

  const handleRotate = (id: string) => {
    const item = scannedPages.find(p => p.id === id);
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
        setScannedPages(prev => prev.map(p => p.id === id ? { ...p, src: rotatedSrc } : p));
    };
  };

  const handleDownloadPdf = () => {
    if (scannedPages.length === 0) return;
    setIsGenerating(true);
    try {
        const pdf = new jsPDF();
        scannedPages.forEach((page, i) => {
            if (i > 0) pdf.addPage();
            const props = pdf.getImageProperties(page.src);
            const pw = pdf.internal.pageSize.getWidth();
            const ph = pdf.internal.pageSize.getHeight();
            const ratio = Math.min(pw / props.width, ph / props.height);
            pdf.addImage(page.src, 'JPEG', (pw - props.width * ratio) / 2, (ph - props.height * ratio) / 2, props.width * ratio, props.height * ratio, undefined, 'FAST');
        });
        pdf.save(`GR7-Scan-Bundle-${Date.now()}.pdf`);
        toast({ title: "PDF Exported", description: "Document saved successfully." });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Export Failed' });
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-7xl flex flex-col gap-6 animate-in fade-in duration-700 pb-20 px-4 mx-auto">
        
        {/* TOP: MAIN WORKSPACE */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Input & Interaction Area */}
            <div className="lg:col-span-7 space-y-6">
                <Card className="border-2 shadow-2xl overflow-hidden rounded-[2.5rem] bg-card/50">
                    <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                         <div className="space-y-1">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <FileStack className="size-6 text-primary" /> SCAN STUDIO
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase opacity-60">Bundle multiple pages into one PDF.</CardDescription>
                         </div>
                         <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={() => setScannedPages([])} className="h-8 text-[9px] font-black uppercase border-2 rounded-lg text-destructive hover:bg-destructive/5"><Trash2 className="size-3 mr-1" /> Clear All</Button>
                         </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Option 1: File Upload */}
                            <div 
                                className="border-4 border-dashed border-primary/20 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-primary/5 transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <UploadCloud className="size-8" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black uppercase tracking-tighter">Upload from Gallery</p>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">Select existing photos</p>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleFilesUpload} />
                            </div>

                            {/* Option 2: Live Camera */}
                            <div 
                                className="border-4 border-dashed border-emerald-500/20 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-emerald-500/5 transition-all group"
                                onClick={startCamera}
                            >
                                <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                    <Camera className="size-8" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black uppercase tracking-tighter">Capture with Camera</p>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">Live mobile scanning</p>
                                </div>
                            </div>
                        </div>
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

                {/* PDF Generation Action */}
                {scannedPages.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <Button 
                            onClick={handleDownloadPdf} 
                            disabled={isGenerating}
                            className="h-20 w-full bg-primary text-black font-black text-2xl rounded-3xl shadow-3xl transform active:scale-95 transition-all group relative overflow-hidden"
                        >
                            {isGenerating ? <Loader2 className="animate-spin mr-3 size-8" /> : <Download className="mr-3 size-8 group-hover:translate-y-1 transition-transform" />}
                            GENERATE PDF BUNDLE
                            <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 size-8 opacity-20" />
                        </Button>
                        <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Ready for official submissions</p>
                    </motion.div>
                )}
            </div>

            {/* Right: Gallery & Page List */}
            <div className="lg:col-span-5">
                <Card className="border-2 shadow-2xl flex flex-col bg-card/50 rounded-[2.5rem] h-full min-h-[500px]">
                    <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Layers className="size-6 text-primary" /> BUNDLE STACK
                        </CardTitle>
                        <Badge className="bg-primary text-black font-black px-4 py-1.5 rounded-full shadow-lg">{scannedPages.length} PAGES</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-6">
                        <ScrollArea className="h-[500px] pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6 p-1">
                                <AnimatePresence>
                                    {scannedPages.map((p, i) => (
                                        <motion.div 
                                            key={p.id} 
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }} 
                                            animate={{ opacity: 1, scale: 1 }} 
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 bg-white shadow-xl hover:border-primary transition-all transform-gpu"
                                        >
                                            <img src={p.src} className="size-full object-cover" alt="scan" />
                                            <div className="absolute top-2 left-2 size-8 rounded-xl bg-black/70 backdrop-blur-md flex items-center justify-center text-xs font-black text-white border border-white/10 shadow-lg">P{i + 1}</div>
                                            
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <Button size="icon" variant="secondary" className="size-10 rounded-xl shadow-2xl" onClick={() => handleRotate(p.id)}>
                                                    <RotateCw className="size-5" />
                                                </Button>
                                                <Button size="icon" variant="destructive" className="size-10 rounded-xl shadow-2xl" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}>
                                                    <Trash2 className="size-5" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                
                                {scannedPages.length === 0 && (
                                    <div className="col-span-2 py-32 text-center opacity-10 flex flex-col items-center gap-6">
                                        <FileStack className="size-24" />
                                        <p className="text-xs font-black uppercase tracking-[0.4em]">Stack is empty</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* MODAL: CAMERA VIEWFINDER */}
        <AnimatePresence>
            {isCameraActive && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black p-4 flex flex-col items-center justify-center gap-6"
                >
                    <div className="relative w-full max-w-4xl h-[70vh] md:h-[600px] overflow-hidden rounded-[2.5rem] md:rounded-[3rem] shadow-3xl border-4 border-white/10 bg-slate-900">
                        <video ref={videoRef} className="w-full h-full object-cover md:object-contain" autoPlay muted playsInline />
                        
                        <div className="absolute top-8 left-8 z-20">
                             <Badge className="bg-black/60 backdrop-blur-md text-white font-black text-[10px] px-4 py-2 border border-white/20 uppercase tracking-widest rounded-full">
                                <ScanLine className="size-3 mr-2 inline text-primary animate-pulse" /> SCANNER ACTIVE
                             </Badge>
                        </div>

                        <Button variant="ghost" size="icon" className="absolute top-8 right-8 z-30 size-12 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md" onClick={stopCamera}>
                            <X className="size-6" />
                        </Button>
                        
                        {isCapturing && (
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-40 flex items-center justify-center">
                                <Loader2 className="size-16 animate-spin text-white" />
                            </div>
                        )}
                    </div>

                    <div className="w-full max-w-4xl flex items-center justify-between px-8">
                        <div className="size-14" /> {/* Spacer */}
                        <Button 
                            onClick={handleCapture} 
                            disabled={isCapturing}
                            className="size-24 md:size-28 rounded-full bg-white border-[8px] border-white/30 p-0 shadow-3xl active:scale-90 transition-transform group"
                        >
                            <div className="size-full rounded-full border-4 border-slate-900 flex items-center justify-center">
                                <div className="size-12 md:size-16 rounded-full bg-red-600 shadow-inner group-hover:scale-95 transition-transform" />
                            </div>
                        </Button>
                        <div className="text-center text-white">
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{scannedPages.length} PAGES</p>
                             <Button variant="ghost" onClick={stopCamera} className="text-xs font-black uppercase text-white">FINISH</Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

    </div>
  );
}

