"use client";

import 'react-image-crop/dist/ReactCrop.css';

import { useState, useRef, useEffect, type SyntheticEvent, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { 
    Camera, 
    Download, 
    X, 
    Loader2, 
    Crop, 
    FileDigit, 
    UploadCloud,
    CheckCircle2,
    RefreshCcw,
    Zap,
    ShieldCheck,
    ScanLine,
    Monitor,
    Smartphone,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop } from 'react-image-crop';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function ScannerToPdf() {
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const cropImgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBuildingPdf, setIsBuildingPdf] = useState(false);
  const [createdPdfUrl, setCreatedPdfUrl] = useState<string | null>(null);
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  // 1. Camera Management
  const stopCamera = useCallback(() => {
    if(videoRef.current && videoRef.current.srcObject){
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
    }

    setHasCameraPermission(null); 
    stopCamera();

    const constraints = { 
        video: { 
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        } 
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
            await videoRef.current.play();
            setHasCameraPermission(true);
        } catch (playErr) {
            console.warn("Auto-play blocked");
            setHasCameraPermission(true); 
        }
      }
    } catch (error) {
      setHasCameraPermission(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const onCropImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop({ unit: '%', width: 90, height: 90 }, width, height));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result?.toString() || null);
        setCrop(undefined);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !hasCameraPermission) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImageToCrop(dataUrl);
      setCrop(undefined);
    }
  };

  const handleConfirmCrop = async () => {
    const image = cropImgRef.current;
    if (!image || !completedCrop?.width) return;
    
    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
    const croppedData = canvas.toDataURL('image/jpeg', 0.85);

    setScannedImages(prev => [...prev, croppedData]);
    setCreatedPdfUrl(null);

    setImageToCrop(null);
    setIsProcessing(false);
    toast({ title: "Page Added", description: "Added to your document stack." });
  };

  const handleCreatePdf = async () => {
    if (scannedImages.length === 0) return;
    setIsBuildingPdf(true);
    
    const pdf = new jsPDF();
    for (let i = 0; i < scannedImages.length; i++) {
        if (i > 0) pdf.addPage();
        const src = scannedImages[i];
        const imgProps = pdf.getImageProperties(src);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
        const width = imgProps.width * ratio;
        const height = imgProps.height * ratio;
        pdf.addImage(src, 'JPEG', (pdfWidth - width) / 2, (pdfHeight - height) / 2, width, height, undefined, 'FAST');
    }
    
    const pdfOutput = pdf.output('datauristring');
    setCreatedPdfUrl(pdfOutput);
    setIsBuildingPdf(false);
    toast({ title: 'PDF Ready!', description: 'Your scanned document is ready to download.' });
  };
  
  const handleDownload = () => {
      if (!createdPdfUrl) return;
      const link = document.createElement('a');
      link.href = createdPdfUrl;
      link.download = `scanned-document-${Date.now()}.pdf`;
      link.click();
  }

  const handleRemoveImage = (index: number) => {
    setScannedImages(prev => prev.filter((_, i) => i !== index));
    setCreatedPdfUrl(null);
  }

  const handleReset = () => {
    setScannedImages([]);
    setCreatedPdfUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-500 pb-20 overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* Left Side: Viewfinder */}
        <div className="lg:col-span-7 space-y-6">
            <Card className="border-2 shadow-2xl overflow-hidden bg-card/50 relative rounded-2xl md:rounded-[2.5rem]">
                <CardHeader className="bg-muted/30 border-b py-3 md:py-4 flex flex-row items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <Camera className="size-3.5 md:size-4 text-primary" />
                        <CardTitle className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Scanner Viewfinder</CardTitle>
                    </div>
                    {hasCameraPermission === true && (
                         <Badge className="bg-green-600 text-white font-black text-[8px] md:text-[9px] uppercase tracking-widest px-2">CAMERA ACTIVE</Badge>
                    )}
                </CardHeader>
                <CardContent className="p-0 relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
                    <video 
                        ref={videoRef} 
                        className={cn("w-full h-full object-contain", hasCameraPermission !== true && "hidden")} 
                        autoPlay 
                        muted 
                        playsInline 
                    />

                    {hasCameraPermission === false && (
                        <div className="p-8 md:p-12 text-center space-y-4 md:space-y-6">
                            <div className="size-16 md:size-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                                <Camera className="size-8 md:size-10 text-destructive" />
                            </div>
                            <div className="space-y-2 text-white">
                                <p className="font-black uppercase text-sm md:text-base">Camera Access Required</p>
                                <p className="text-slate-400 text-[10px] md:text-xs">Please enable camera in your browser settings to scan documents.</p>
                            </div>
                            <Button onClick={startCamera} className="bg-primary font-black uppercase tracking-tighter h-10 md:h-12 px-6 md:px-8 rounded-xl shadow-xl text-xs">ACTIVATE CAMERA</Button>
                        </div>
                    )}
                    
                    {hasCameraPermission === null && (
                        <div className="flex flex-col items-center gap-4 text-white">
                            <Loader2 className="size-8 md:size-10 animate-spin text-primary opacity-20" />
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest animate-pulse">Initializing Lens...</p>
                        </div>
                    )}
                    
                    {hasCameraPermission === true && (
                        <div className="absolute inset-0 pointer-events-none border-[20px] md:border-[40px] border-black/20 flex items-center justify-center">
                            <div className="size-full border-2 border-dashed border-white/40 rounded-xl" />
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-4 md:p-8 bg-white dark:bg-slate-950 border-t flex flex-col sm:flex-row gap-3 md:gap-4">
                    <Button onClick={handleCapture} disabled={hasCameraPermission !== true} className="h-12 md:h-16 flex-[2] text-sm md:text-xl font-black bg-gradient-button text-white shadow-2xl rounded-xl md:rounded-2xl group active:scale-95 transition-all">
                        <ScanLine className="mr-2 md:mr-3 h-5 w-5 md:h-7 md:w-7 group-hover:scale-110 transition-transform" /> CAPTURE PAGE
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-12 md:h-16 flex-1 font-black border-2 rounded-xl md:rounded-2xl uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-primary/5">
                        <UploadCloud className="mr-2 h-4 w-4" /> UPLOAD IMAGE
                    </Button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 md:p-6 bg-primary/5 rounded-2xl md:rounded-[2rem] border-2 border-primary/10 flex gap-3 md:gap-4 items-center">
                    <div className="size-10 md:size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="size-5 md:size-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-[11px] font-black text-primary uppercase tracking-tight">100% PRIVATE</p>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium leading-tight">All scanning occurs locally in your device RAM.</p>
                    </div>
                </div>
                <div className="p-4 md:p-6 bg-blue-500/5 rounded-2xl md:rounded-[2rem] border-2 border-blue-500/10 flex gap-3 md:gap-4 items-center">
                    <div className="size-10 md:size-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Zap className="size-5 md:size-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-[11px] font-black text-blue-700 uppercase tracking-tight">HD RENDERING</p>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium leading-tight">Output pages are rendered in high density for sharp text.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side: Stack & Controls */}
        <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 shadow-2xl border-primary/10 flex flex-col bg-card/50 rounded-2xl md:rounded-[2.5rem] min-h-[300px] md:min-h-[500px]">
                <CardHeader className="bg-primary/5 border-b p-4 md:p-6 flex flex-row items-center justify-between">
                    <CardTitle className="text-base md:text-lg font-black uppercase tracking-tighter flex items-center gap-2 md:gap-3">
                        <FileDigit className="size-5 md:size-6 text-primary" /> Page Stack
                    </CardTitle>
                    <Badge variant="outline" className="font-black text-primary border-primary/30 text-[9px] md:text-xs px-2">{scannedImages.length} PAGES</Badge>
                </CardHeader>
                <CardContent className="flex-1 p-4 md:p-6">
                    {scannedImages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 md:py-24 text-center gap-4 md:gap-6 opacity-30">
                            <div className="relative">
                                <Monitor className="size-16 md:size-20" />
                                <Smartphone className="size-6 md:size-8 absolute -bottom-2 -right-2 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs md:text-sm font-black uppercase tracking-widest">Waiting for Capture</p>
                                <p className="text-[9px] md:text-[10px] font-bold">Use camera or upload a file.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 md:gap-4 max-h-[300px] md:max-h-[500px] overflow-y-auto pr-1 custom-scrollbar p-1">
                            {scannedImages.map((src, index) => (
                                <div key={index} className="relative aspect-[3/4] rounded-lg md:rounded-xl overflow-hidden border-2 bg-white group shadow-md hover:border-primary/50 transition-all hover:scale-[1.02]">
                                    <Image src={src} alt={`page-${index}`} fill className="object-cover" />
                                    <div className="absolute top-1 left-1 md:top-2 md:left-2 bg-black/60 backdrop-blur-md text-white text-[7px] md:text-[8px] px-1.5 md:px-2 py-0.5 rounded-full font-black uppercase">P{index + 1}</div>
                                    <Button 
                                        size="icon" 
                                        variant="destructive" 
                                        className="absolute top-1 right-1 md:top-2 md:right-2 h-6 w-6 md:h-7 md:w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" 
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <X className="h-3 w-3 md:h-4 md:w-4" />
                                    </Button>
                                </div>
                            ))}
                            <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl aspect-[3/4] flex flex-col items-center justify-center gap-2 opacity-30">
                                <Zap className="size-5 md:size-6" />
                                <span className="text-[7px] md:text-[8px] font-black uppercase">Next Page</span>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-4 md:p-8 bg-muted/10 border-t flex flex-col gap-3 md:gap-4">
                    {createdPdfUrl ? (
                         <Button className="w-full h-14 md:h-18 bg-green-600 hover:bg-green-700 text-base md:text-xl font-black rounded-xl md:rounded-2xl shadow-2xl animate-in zoom-in-95 group" onClick={handleDownload}>
                            <Download className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 group-hover:translate-y-1 transition-transform" /> DOWNLOAD PDF
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleCreatePdf} 
                            disabled={scannedImages.length === 0 || isBuildingPdf} 
                            className="w-full h-14 md:h-18 text-sm md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-xl md:rounded-2xl transition-all active:scale-95 group"
                        >
                            {isBuildingPdf ? <Loader2 className="animate-spin mr-2 md:mr-3 size-5 md:size-7" /> : <CheckCircle2 className="mr-2 md:mr-3 size-5 md:size-7 text-white/50" />}
                            GENERATE DOCUMENT
                        </Button>
                    )}
                    {scannedImages.length > 0 && (
                        <Button variant="ghost" onClick={handleReset} className="w-full h-9 md:h-10 text-[9px] md:text-[10px] font-black uppercase text-muted-foreground hover:text-destructive hover:bg-destructive/5">
                            <RefreshCcw className="mr-1.5 size-3" /> Clear All Pages
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
      </div>

      <Dialog open={imageToCrop !== null} onOpenChange={() => setImageToCrop(null)}>
        <DialogContent className="max-w-4xl p-0 rounded-2xl md:rounded-[3rem] overflow-hidden border-2 shadow-3xl bg-white mx-4">
          <DialogHeader className="p-4 md:p-6 bg-primary/5 border-b flex flex-row items-center justify-between">
            <DialogTitle className="font-black uppercase flex items-center gap-2 md:gap-3 tracking-tighter text-base md:text-xl">
                <Crop className="text-primary size-5 md:size-6"/> Precision Page Trim
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 md:p-8 flex justify-center bg-slate-100 max-h-[70vh] overflow-hidden">
            {imageToCrop && (
                <ReactCrop 
                    crop={crop} 
                    onChange={(_, p) => setCrop(p)} 
                    onComplete={setCompletedCrop}
                    className="shadow-2xl border-2 md:border-4 border-white rounded-sm max-w-full"
                >
                    <img 
                        ref={cropImgRef} 
                        src={imageToCrop} 
                        onLoad={onCropImageLoad} 
                        className="max-h-[50vh] md:max-h-[60vh] object-contain" 
                        alt="To Crop"
                    />
                </ReactCrop>
            )}
          </div>
          <DialogFooter className="p-4 md:p-8 bg-muted/20 border-t flex flex-col gap-3 md:gap-4">
             <Button className="w-full h-12 md:h-16 text-sm md:text-xl font-black bg-primary rounded-xl md:rounded-2xl shadow-xl active:scale-95 transition-all" onClick={handleConfirmCrop} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="animate-spin mr-2 md:mr-3"/> : <CheckCircle2 className="mr-2 md:mr-3 h-5 w-5 md:h-7 md:w-7"/>}
                CONFIRM & ADD TO STACK
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
