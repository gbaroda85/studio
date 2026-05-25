
"use client";

import 'react-image-crop/dist/ReactCrop.css';

import { useState, useRef, useEffect, type SyntheticEvent, useCallback } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { 
    Camera, 
    Download, 
    X, 
    Loader2, 
    Crop, 
    FileDigit, 
    QrCode, 
    UploadCloud,
    CheckCircle2,
    RefreshCcw,
    Zap,
    ShieldCheck,
    CloudSync,
    Monitor,
    Smartphone,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop } from 'react-image-crop';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

// Firebase for Sync
import { initializeFirebase } from '@/firebase';
import { doc, onSnapshot, setDoc, collection, addDoc, serverTimestamp, query, orderBy, deleteDoc, getDocs } from 'firebase/firestore';

export default function ScannerToPdf() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get('sessionId');

  const videoRef = useRef<HTMLVideoElement>(null);
  const cropImgRef = useRef<HTMLImageElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBuildingPdf, setIsBuildingPdf] = useState(false);
  const [createdPdfUrl, setCreatedPdfUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [currentUrl, setCurrentUrl] = useState("");
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showQrBridge, setShowMobileQr] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Session & Sync Logic
  useEffect(() => {
    const { firestore } = initializeFirebase();
    let sid = sessionIdFromUrl;

    if (!sid) {
        sid = Math.random().toString(36).substr(2, 9);
        const url = `${window.location.origin}${window.location.pathname}?sessionId=${sid}`;
        setCurrentUrl(url);
    }
    setSessionId(sid);

    // Sync Page Stack from Firestore
    const q = query(
        collection(firestore, 'shared-scans', sid, 'pages'), 
        orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const pages = snapshot.docs.map(d => d.data().src);
        if (pages.length > 0) {
            setScannedImages(pages);
            setCreatedPdfUrl(null); // Clear previous PDF if new images arrive
        }
    });

    // Listen for final PDF if needed (optional since we build locally now too)
    const unsubscribeFinal = onSnapshot(doc(firestore, 'shared-scans', sid), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.pdfUrl && !isMobile) {
                setCreatedPdfUrl(data.pdfUrl);
                toast({ title: "Document Synced!", description: "Complete PDF received from mobile." });
            }
        }
    });

    return () => {
        unsubscribe();
        unsubscribeFinal();
    };
  }, [sessionIdFromUrl, toast, isMobile]);

  // 2. Camera Management
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
        }
      }
    } catch (error) {
      setHasCameraPermission(false);
    }
  }, [stopCamera]);

  // Auto-start camera on mobile sync landing
  useEffect(() => {
    if (sessionIdFromUrl || isMobile) {
        startCamera();
    }
    return () => stopCamera();
  }, [sessionIdFromUrl, isMobile, startCamera, stopCamera]);

  // 3. Image Actions
  const handleCapture = () => {
    if (!videoRef.current || !hasCameraPermission || videoRef.current.paused) return;
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
    if (!image || !completedCrop?.width || !sessionId) return;
    
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

    // SYNC TO CLOUD IMMEDIATELY
    try {
        const { firestore } = initializeFirebase();
        await addDoc(collection(firestore, 'shared-scans', sessionId, 'pages'), {
            src: croppedData,
            timestamp: serverTimestamp()
        });
        toast({ title: "Captured!", description: "Image synced to computer stack." });
    } catch (e) {
        console.error(e);
        // Fallback to local only if firebase fails
        setScannedImages(prev => [...prev, croppedData]);
    }

    setImageToCrop(null);
    setIsProcessing(false);
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

    // Update final PDF status for session
    if (sessionId) {
        const { firestore } = initializeFirebase();
        await setDoc(doc(firestore, 'shared-scans', sessionId), {
            pdfUrl: pdfOutput,
            timestamp: serverTimestamp()
        }, { merge: true });
    }

    setIsBuildingPdf(false);
    toast({ title: 'PDF Ready!', description: 'Your scanned document is ready to download.' });
  };
  
  const handleRemoveImage = async (index: number) => {
    // If it's a sync session, we should ideally delete from Firestore too
    // For MVP simplicity, we just clear locally and the user can start over
    // or we could find the doc by index. Let's just reset the whole stack if needed
    // but better: user can manually click 'Refresh' if they want.
    setScannedImages(prev => prev.filter((_, i) => i !== index));
    setCreatedPdfUrl(null);
  }

  const handleReset = async () => {
    if (sessionId) {
        const { firestore } = initializeFirebase();
        // Clean up cloud pages
        const pagesRef = collection(firestore, 'shared-scans', sessionId, 'pages');
        const snaps = await getDocs(pagesRef);
        snaps.forEach(async (d) => await deleteDoc(d.ref));
    }
    setScannedImages([]);
    setCreatedPdfUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-500 pb-20">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Viewfinder & Sync Info */}
        <div className="lg:col-span-7 space-y-6">
            <Card className="border-2 shadow-2xl overflow-hidden bg-card/50 relative rounded-[2.5rem]">
                <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Camera className="size-4 text-primary" />
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Scanner Viewfinder</CardTitle>
                    </div>
                    {hasCameraPermission === true ? (
                         <Badge className="bg-green-600 text-white font-black text-[9px] uppercase tracking-widest">CAMERA ACTIVE</Badge>
                    ) : (
                         <Badge variant="outline" className="text-[9px] font-black uppercase">READY</Badge>
                    )}
                </CardHeader>
                <CardContent className="p-0 relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
                    {hasCameraPermission === true ? (
                        <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted playsInline />
                    ) : hasCameraPermission === false ? (
                        <div className="p-12 text-center space-y-6">
                            <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                                <Camera className="size-10 text-destructive" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-white font-black uppercase">Camera Blocked</p>
                                <p className="text-slate-400 text-xs">Please allow camera access in your browser settings.</p>
                            </div>
                            <Button onClick={startCamera} className="bg-primary font-black uppercase tracking-tighter h-12 px-8 rounded-xl">RETRY CAMERA</Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-white">
                            <Loader2 className="size-10 animate-spin text-primary opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Initializing Lens...</p>
                        </div>
                    )}
                    
                    {/* Floating Capture Overlay */}
                    {hasCameraPermission && (
                        <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20 flex items-center justify-center">
                            <div className="size-full border-2 border-dashed border-white/40 rounded-xl" />
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-8 bg-white dark:bg-slate-950 border-t flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleCapture} disabled={!hasCameraPermission} className="h-16 flex-[2] text-xl font-black bg-gradient-button text-white shadow-2xl rounded-2xl group">
                        <ScanLine className="mr-3 h-7 w-7 group-hover:scale-110 transition-transform" /> CAPTURE PAGE
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-16 flex-1 font-black border-2 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-primary/5">
                        <UploadCloud className="mr-2 h-4 w-4" /> UPLOAD IMAGE
                    </Button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </CardFooter>
            </Card>

            {/* Mobile Sync Box - Prominent QR */}
            {!isMobile && !sessionIdFromUrl && (
                <Card className="border-2 shadow-xl bg-slate-950 text-white rounded-[2.5rem] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CloudSync className="size-40" />
                    </div>
                    <CardContent className="p-10 flex flex-col md:flex-row items-center gap-10 relative z-10">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-3">
                                <Smartphone className="size-8 text-primary animate-bounce" />
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Instant Mobile Sync</h3>
                            </div>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                Don't have a document photo on your PC? Scan this QR on your phone to use your mobile camera. **Captures appear here instantly.**
                            </p>
                            {!showQrBridge ? (
                                <Button variant="secondary" size="lg" className="font-black rounded-xl h-14 px-8 shadow-xl" onClick={() => setShowMobileQr(true)}>
                                    GENERATE MOBILE LINK <ArrowRight className="ml-2 size-4" />
                                </Button>
                            ) : (
                                <div className="flex items-center gap-3 text-green-500 font-black text-xs uppercase tracking-widest bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                                    <CloudSync className="size-4 animate-spin" /> Link Active: Scan QR on Right
                                </div>
                            )}
                        </div>
                        {showQrBridge && (
                            <div className="bg-white p-6 rounded-[2rem] shadow-2xl scale-110 animate-in zoom-in-50 duration-500">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x140&data=${encodeURIComponent(currentUrl)}`} 
                                    alt="QR Sync" 
                                    className="w-40 h-40"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Right: Page Stack & Building */}
        <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 shadow-2xl border-primary/10 flex flex-col bg-card/50 rounded-[2.5rem] min-h-[500px]">
                <CardHeader className="bg-primary/5 border-b py-6 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                        <FileDigit className="size-6 text-primary" /> Page Stack
                    </CardTitle>
                    <Badge variant="outline" className="font-black text-primary border-primary/30">{scannedImages.length} PAGES</Badge>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                    {scannedImages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center gap-6 opacity-30">
                            <div className="relative">
                                <Monitor className="size-20" />
                                <Smartphone className="size-8 absolute -bottom-2 -right-2 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-widest">Waiting for Capture</p>
                                <p className="text-[10px] font-bold">Use mobile scanner or capture above.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar p-1">
                            {scannedImages.map((src, index) => (
                                <div key={index} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 bg-white group shadow-md hover:border-primary/50 transition-all hover:scale-[1.02]">
                                    <Image src={src} alt={`page-${index}`} fill className="object-cover" />
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase">P{index + 1}</div>
                                    <Button 
                                        size="icon" 
                                        variant="destructive" 
                                        className="absolute top-2 right-2 h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" 
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {/* Visual Hint for adding more */}
                            <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl aspect-[3/4] flex flex-col items-center justify-center gap-2 opacity-50">
                                <Zap className="size-6" />
                                <span className="text-[8px] font-black uppercase">Next Page</span>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-8 bg-muted/10 border-t flex flex-col gap-4">
                    {createdPdfUrl ? (
                         <Button className="w-full h-18 bg-green-600 hover:bg-green-700 text-xl font-black rounded-2xl shadow-2xl animate-in zoom-in-95 group" onClick={handleDownload}>
                            <Download className="mr-3 h-7 w-7 group-hover:translate-y-1 transition-transform" /> DOWNLOAD PDF
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleCreatePdf} 
                            disabled={scannedImages.length === 0 || isBuildingPdf} 
                            className="w-full h-18 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all active:scale-95 group"
                        >
                            {isBuildingPdf ? <Loader2 className="animate-spin mr-3 size-7" /> : <CheckCircle2 className="mr-3 size-7 text-white/50" />}
                            {isMobile ? "GENERATE & SYNC" : "GENERATE PDF"}
                        </Button>
                    )}
                    {scannedImages.length > 0 && (
                        <Button variant="ghost" onClick={handleReset} className="w-full h-10 text-[10px] font-black uppercase text-muted-foreground hover:text-destructive hover:bg-destructive/5">
                            <RefreshCcw className="mr-2 size-3" /> Clear All Pages
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Privacy Promise */}
            <div className="p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10 flex gap-4 items-center shadow-sm">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-6 text-primary" />
                </div>
                <div>
                    <p className="text-[11px] font-black text-primary uppercase tracking-tight">Security Handshake</p>
                    <p className="text-[10px] text-muted-foreground font-medium leading-tight">Captures are temporary and cleared from our cloud buffer after use.</p>
                </div>
            </div>
        </div>
      </div>

      {/* Crop Dialog for Capture */}
      <Dialog open={imageToCrop !== null} onOpenChange={() => setImageToCrop(null)}>
        <DialogContent className="max-w-4xl p-0 rounded-[3rem] overflow-hidden border-2 shadow-3xl bg-white">
          <DialogHeader className="p-6 bg-primary/5 border-b flex flex-row items-center justify-between">
            <DialogTitle className="font-black uppercase flex items-center gap-3 tracking-tighter text-xl">
                <Crop className="text-primary size-6"/> Precision Page Trim
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 flex justify-center bg-slate-100">
            {imageToCrop && (
                <ReactCrop 
                    crop={crop} 
                    onChange={(_, p) => setCrop(p)} 
                    onComplete={setCompletedCrop}
                    className="shadow-2xl border-4 border-white rounded-sm"
                >
                    <img 
                        ref={cropImgRef} 
                        src={imageToCrop} 
                        onLoad={onCropImageLoad} 
                        className="max-h-[60vh] object-contain" 
                        alt="To Crop"
                    />
                </ReactCrop>
            )}
          </div>
          <DialogFooter className="p-8 bg-muted/20 border-t flex flex-col gap-4">
             <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 justify-center">
                <Zap className="size-3 text-yellow-500" /> Instant sync active for this session
             </div>
             <Button className="w-full h-16 text-xl font-black bg-primary rounded-2xl shadow-xl active:scale-95 transition-all" onClick={handleConfirmCrop} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="animate-spin mr-3"/> : <CheckCircle2 className="mr-3 h-7 w-7"/>}
                CONFIRM & ADD PAGE
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

