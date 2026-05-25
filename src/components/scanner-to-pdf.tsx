
"use client";

import 'react-image-crop/dist/ReactCrop.css';

import { useState, useRef, useEffect, type SyntheticEvent, useCallback } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { 
    Camera, 
    Download, 
    ScanLine, 
    X, 
    Loader2, 
    AlertTriangle, 
    Crop, 
    FileDigit, 
    Smartphone, 
    QrCode, 
    UploadCloud,
    CheckCircle2,
    RefreshCcw,
    Monitor,
    Zap,
    ShieldCheck,
    CloudSync
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
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

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
  const [createdPdfUrl, setCreatedPdfUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [isWaitingForMobile, setIsWaitingForMobile] = useState(false);
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showQrBridge, setShowMobileQr] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync Logic
  useEffect(() => {
    const { firestore } = initializeFirebase();
    
    if (sessionIdFromUrl) {
        setSessionId(sessionIdFromUrl);
    } else {
        const newId = Math.random().toString(36).substr(2, 9);
        setSessionId(newId);
        setCurrentUrl(`${window.location.origin}${window.location.pathname}?sessionId=${newId}`);
        
        setIsWaitingForMobile(true);
        const unsubscribe = onSnapshot(doc(firestore, 'shared-scans', newId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.pdfUrl) {
                    setCreatedPdfUrl(data.pdfUrl);
                    setIsWaitingForMobile(false);
                    toast({ title: "Scan Received!", description: "Document from mobile is now visible on computer." });
                }
            }
        });
        return () => unsubscribe();
    }
  }, [sessionIdFromUrl, toast]);

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
            width: { ideal: 1280 },
            height: { ideal: 720 }
        } 
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
            await videoRef.current.play();
        } catch (playErr) {
            console.warn("Auto-play blocked");
        }
      }
      setHasCameraPermission(true);
    } catch (error) {
      setHasCameraPermission(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
        stopCamera();
        if (createdPdfUrl) URL.revokeObjectURL(createdPdfUrl);
    }
  }, [startCamera, stopCamera, createdPdfUrl]);

  const handleCapture = () => {
    if (!videoRef.current || !hasCameraPermission || videoRef.current.paused) return;
    setCreatedPdfUrl(null);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setImageToCrop(dataUrl);
      setCrop(undefined);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setCreatedPdfUrl(null);
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setImageToCrop(event.target?.result as string);
            setCrop(undefined);
        };
        reader.readAsDataURL(file);
    }
    e.target.value = "";
  };
  
  const handleRemoveImage = (index: number) => {
    setCreatedPdfUrl(null);
    setScannedImages(images => images.filter((_, i) => i !== index));
  }

  const handleCreatePdf = async () => {
    if (scannedImages.length === 0) return;
    setIsProcessing(true);
    const pdf = new jsPDF();
    scannedImages.forEach((src, index) => {
      if (index > 0) pdf.addPage();
      const imgProps = pdf.getImageProperties(src);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
      const width = imgProps.width * ratio;
      const height = imgProps.height * ratio;
      pdf.addImage(src, 'JPEG', (pdfWidth - width) / 2, (pdfHeight - height) / 2, width, height, undefined, 'FAST');
    });
    
    const pdfOutput = pdf.output('datauristring');
    setCreatedPdfUrl(pdfOutput);

    if (isMobile && sessionId) {
        const { firestore } = initializeFirebase();
        await setDoc(doc(firestore, 'shared-scans', sessionId), {
            pdfUrl: pdfOutput,
            timestamp: new Date()
        }, { merge: true });
        toast({ title: 'Synced!', description: 'Document sent to computer.' });
    }

    setIsProcessing(false);
    toast({ title: 'PDF Ready!', description: 'Scanned document created.'});
  };
  
  const handleDownload = () => {
      if (!createdPdfUrl) return;
      const link = document.createElement('a');
      link.href = createdPdfUrl;
      link.download = `scan-${Date.now()}.pdf`;
      link.click();
  }

  function onCropImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop({ unit: '%', width: 90, height: 90 }, width, height);
    setCrop(initialCrop);
  }

  const handleConfirmCrop = () => {
    const image = cropImgRef.current;
    if (!image || !completedCrop?.width) return;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
    setScannedImages(prev => [...prev, canvas.toDataURL('image/jpeg', 0.9)]);
    setImageToCrop(null);
  };
  
  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4 pb-10">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
            <Card className="border-2 shadow-2xl overflow-hidden bg-card/50 relative rounded-[2rem]">
                <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Camera className="size-4 text-primary" />
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Viewfinder</CardTitle>
                    </div>
                    {hasCameraPermission === true && <Badge className="bg-green-600 text-white font-black text-[9px] uppercase">ACTIVE</Badge>}
                </CardHeader>
                <CardContent className="p-0 relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                    {hasCameraPermission === true ? (
                        <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted playsInline />
                    ) : (
                        <div className="p-8 text-center text-white">
                            <Button onClick={startCamera} className="bg-primary font-black">ENABLE CAMERA</Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-6 bg-muted/10 border-t flex gap-3">
                    <Button onClick={handleCapture} disabled={!hasCameraPermission} className="h-14 flex-1 text-lg font-black bg-gradient-button text-white shadow-xl rounded-2xl">
                        CAPTURE PAGE
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-14 flex-1 font-black border-2 rounded-2xl">
                        UPLOAD PHOTO
                    </Button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </CardFooter>
            </Card>

            {!isMobile && (
                <Card className="border-2 bg-slate-950 text-white rounded-[2.5rem]">
                    <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <QrCode className="size-8 text-primary" />
                                <h3 className="text-xl font-black uppercase tracking-tighter">Mobile Scan Sync</h3>
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Scan code on phone. Mobile scan will appear here <strong>instantly</strong>.</p>
                            {!showQrBridge && <Button variant="secondary" className="font-black" onClick={() => setShowMobileQr(true)}>SHOW QR CODE</Button>}
                        </div>
                        {showQrBridge && <div className="bg-white p-4 rounded-2xl"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(currentUrl)}`} alt="QR" /></div>}
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 shadow-xl border-primary/10 flex flex-col bg-card/50 rounded-[2rem] min-h-[400px]">
                <CardHeader className="bg-muted/30 border-b py-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <FileDigit className="size-4" /> Page Stack ({scannedImages.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-4">
                    {isWaitingForMobile && !createdPdfUrl && !isMobile && scannedImages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="size-8 animate-spin text-primary opacity-20" />
                            <p className="text-[10px] font-black uppercase text-muted-foreground animate-pulse">Waiting for mobile scan...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                            {scannedImages.map((src, index) => (
                                <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 bg-white group">
                                    <Image src={src} alt="page" fill className="object-cover" />
                                    <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveImage(index)}><X className="h-3 w-3" /></Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-6 bg-muted/5 border-t">
                    {createdPdfUrl ? (
                         <Button className="w-full h-16 bg-green-600 font-black text-lg rounded-2xl" onClick={handleDownload}><Download className="mr-2" /> DOWNLOAD PDF</Button>
                    ) : (
                        <Button onClick={handleCreatePdf} disabled={scannedImages.length === 0 || isProcessing} className="w-full h-16 font-black bg-primary rounded-2xl">
                            {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <CheckCircle2 className="mr-2"/>}
                            {isMobile ? "SYNC TO COMPUTER" : "GENERATE PDF"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
      </div>

      <Dialog open={imageToCrop !== null} onOpenChange={() => setImageToCrop(null)}>
        <DialogContent className="max-w-4xl p-0 rounded-[2.5rem] overflow-hidden border-2">
          <DialogHeader className="p-4 bg-muted/30 border-b">
            <DialogTitle className="font-black uppercase flex items-center gap-2"><Crop className="text-primary"/> TRIM PAGE</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex justify-center bg-black/5">
            {imageToCrop && <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={setCompletedCrop}><img ref={cropImgRef} src={imageToCrop} onLoad={onCropImageLoad} className="max-h-[60vh] object-contain" /></ReactCrop>}
          </div>
          <DialogFooter className="p-4 bg-muted/10 border-t">
            <Button className="w-full h-12 font-black bg-primary rounded-xl" onClick={handleConfirmCrop}>ADD TO BUNDLE</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
