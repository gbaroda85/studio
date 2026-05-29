"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
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
    ScanLine,
    ImageIcon,
    FileStack,
    Trash2,
    Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScannedPage {
    id: string;
    src: string;
}

export default function ScannerToPdf() {
  const { toast } = useToast();
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if(videoRef.current && videoRef.current.srcObject){
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices) return;
    stopCamera();
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
      }
    } catch (error) {
      setHasCameraPermission(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (isCameraActive) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [isCameraActive, startCamera, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const src = canvas.toDataURL('image/jpeg', 0.9);
      setScannedPages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), src }]);
      toast({ title: "Page Captured", description: `Page ${scannedPages.length + 1} added to stack.` });
    }
  };

  const handleDownloadPdf = () => {
    if (scannedPages.length === 0) return;
    const pdf = new jsPDF();
    scannedPages.forEach((page, i) => {
        if (i > 0) pdf.addPage();
        const props = pdf.getImageProperties(page.src);
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pw / props.width, ph / props.height);
        pdf.addImage(page.src, 'JPEG', (pw - props.width * ratio) / 2, (ph - props.height * ratio) / 2, props.width * ratio, props.height * ratio);
    });
    pdf.save(`GR7-Scan-${Date.now()}.pdf`);
    toast({ title: "PDF Saved", description: "Download started successfully." });
  };

  return (
    <div className="w-full max-w-6xl flex flex-col gap-6 animate-in fade-in duration-700 pb-20 px-4 mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
                <div className="relative w-full overflow-hidden bg-black rounded-[2rem] md:rounded-[3rem] shadow-3xl h-[65vh] md:h-[550px] border-4 border-white/10">
                    <video ref={videoRef} className="w-full h-full object-cover md:object-contain" autoPlay muted playsInline />
                    {!hasCameraPermission && hasCameraPermission !== null && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/60 backdrop-blur-sm z-30">
                            <Smartphone className="size-16 mb-4 text-white/20" />
                            <p className="text-white font-bold mb-6">Camera access is required to scan documents.</p>
                            <Button onClick={startCamera} className="bg-primary text-black font-black uppercase rounded-xl h-12 px-8">Enable Camera</Button>
                        </div>
                    )}
                    <div className="absolute top-6 left-6 z-20">
                         <Badge className="bg-black/60 backdrop-blur-md text-white font-black text-[10px] px-3 py-1 border border-white/20 uppercase tracking-widest">
                            {hasCameraPermission ? "SCANNER READY" : "CONNECTING..."}
                         </Badge>
                    </div>
                </div>

                <Button onClick={handleCapture} className="h-20 w-full bg-primary text-black font-black text-2xl rounded-3xl shadow-3xl transform active:scale-95 transition-all">
                    <Camera className="mr-3 size-8" /> CAPTURE PAGE
                </Button>
            </div>

            <div className="lg:col-span-4">
                <Card className="border-2 shadow-2xl flex flex-col bg-card/50 rounded-[2.5rem] h-full min-h-[400px]">
                    <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><FileStack className="size-6 text-primary" /> BUNDLE</CardTitle>
                        <Badge className="bg-primary text-black font-black px-3 py-1 rounded-full">{scannedPages.length}</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-6">
                        <div className="grid grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar p-1">
                            {scannedPages.map((p, i) => (
                                <div key={p.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 bg-white shadow-lg group hover:border-primary transition-all">
                                    <img src={p.src} className="size-full object-cover" alt="scan" />
                                    <div className="absolute top-1.5 left-1.5 size-6 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">{i+1}</div>
                                    <Button size="icon" variant="destructive" className="absolute top-1.5 right-1.5 size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}><Trash2 className="size-4" /></Button>
                                </div>
                            ))}
                            {scannedPages.length === 0 && (
                                <div className="col-span-2 py-20 text-center opacity-10">
                                    <FileStack className="size-20 mx-auto" />
                                    <p className="text-[10px] font-black uppercase mt-4 tracking-[0.3em]">Stack is empty</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 border-t bg-muted/10">
                        <Button disabled={scannedPages.length === 0} className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-black text-sm rounded-2xl shadow-xl uppercase" onClick={handleDownloadPdf}>
                            <Download className="mr-3 size-6" /> EXPORT AS PDF
                        </Button>
                    </CardFooter>
                </Card>
                
                <div className="mt-6 flex items-center gap-3 px-6 py-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <ShieldCheck className="size-5 text-green-600" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-tight">Everything is processed locally. No data leaves your device.</p>
                </div>
            </div>
        </div>
    </div>
  );
}
