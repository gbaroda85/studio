
"use client";

import 'react-image-crop/dist/ReactCrop.css';

import { useState, useRef, useEffect, type SyntheticEvent } from 'react';
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
    FileImage,
    CheckCircle2,
    RefreshCcw,
    Monitor,
    Zap,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop } from 'react-image-crop';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ScannerToPdf() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cropImgRef = useRef<HTMLImageElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdPdfUrl, setCreatedPdfUrl] = useState<string | null>(null);
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showQrBridge, setShowMobileQr] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentUrl(window.location.href);
    
    // Auto-start on mount
    startCamera();
    
    return () => {
        stopCamera();
        if (createdPdfUrl) URL.revokeObjectURL(createdPdfUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        toast({
            variant: "destructive",
            title: "Not Supported",
            description: "Your browser does not support camera access or you are not using HTTPS."
        });
        return;
    }

    setHasCameraPermission(null); // Loading state

    // Try Rear Camera first
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
        // Ensure video plays
        videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
        };
      }
      setHasCameraPermission(true);
    } catch (error) {
      console.warn('Rear camera not available, trying any camera.', error);
      try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream;
              videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play();
            };
          }
          setHasCameraPermission(true);
      } catch (fallbackError) {
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Permission Denied',
            description: 'Please allow camera access in your browser settings to scan documents.',
          });
      }
    }
  }

  const stopCamera = () => {
    if(videoRef.current && videoRef.current.srcObject){
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
  }
  
  const clearCreatedPdf = () => {
      if(createdPdfUrl) {
          URL.revokeObjectURL(createdPdfUrl);
          setCreatedPdfUrl(null);
      }
  }

  const handleCapture = () => {
    if (!videoRef.current || !hasCameraPermission) return;
    clearCreatedPdf();
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
    
    clearCreatedPdf();
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
    clearCreatedPdf();
    setScannedImages(images => images.filter((_, i) => i !== index));
  }

  const handleCreatePdf = () => {
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
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setCreatedPdfUrl(url);
    setIsProcessing(false);
    toast({ title: 'PDF Ready!', description: 'Your scanned document is ready for download.'});
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
    setCompletedCrop(undefined);
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

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0, canvas.width, canvas.height,
    );
    
    setScannedImages(prev => [...prev, canvas.toDataURL('image/jpeg', 0.9)]);
    setImageToCrop(null);
    toast({ title: "Page Added", description: `Document now has ${scannedImages.length + 1} pages.` });
  };
  
  const handleReset = () => {
      setScannedImages([]);
      clearCreatedPdf();
      toast({ title: "Reset Complete", description: "Workspace cleared." });
  }
  
  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Section: Camera / Scanner Workspace */}
        <div className="lg:col-span-7 space-y-6">
            <Card className="border-2 shadow-2xl overflow-hidden bg-card/50 relative">
                <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Camera className="size-4 text-primary" />
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Live Viewfinder</CardTitle>
                    </div>
                    {hasCameraPermission === true && <Badge className="bg-green-600 text-white font-black text-[9px] uppercase">CAMERA ACTIVE</Badge>}
                    {hasCameraPermission === null && <Loader2 className="size-4 animate-spin text-primary" />}
                </CardHeader>
                <CardContent className="p-0 relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                    {hasCameraPermission === true ? (
                        <video 
                            ref={videoRef} 
                            className="w-full h-full object-cover" 
                            autoPlay 
                            muted 
                            playsInline 
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-center p-8 gap-6">
                            <div className="size-20 rounded-full bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-700">
                                <AlertTriangle className="size-8 text-orange-500" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-black text-white uppercase tracking-tighter">Camera Access Required</p>
                                <p className="text-xs text-slate-400 max-w-[300px] mx-auto leading-relaxed">
                                    To scan documents, please allow camera permissions in your browser. 
                                    If you are on desktop, you can also scan using your phone via the QR code below.
                                </p>
                            </div>
                            <Button onClick={startCamera} className="bg-primary hover:bg-primary/90 font-black h-12 px-8 rounded-xl shadow-xl">
                                <Camera className="mr-2" /> ENABLE CAMERA
                            </Button>
                        </div>
                    )}

                    {/* Capture UI Hint */}
                    {hasCameraPermission === true && (
                        <div className="absolute inset-0 border-[20px] border-black/30 pointer-events-none flex items-center justify-center">
                            <div className="size-64 border-2 border-white/20 rounded-xl" />
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-6 bg-muted/10 border-t grid grid-cols-2 gap-4">
                    <Button 
                        onClick={handleCapture} 
                        disabled={!hasCameraPermission} 
                        className="h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl group active:scale-95"
                    >
                        <ScanLine className="mr-2 size-6 group-hover:scale-110 transition-transform" />
                        CAPTURE PAGE
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()} 
                        className="h-14 text-sm font-black border-2 rounded-2xl hover:bg-primary/5"
                    >
                        <UploadCloud className="mr-2 size-5" />
                        UPLOAD PHOTO
                    </Button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </CardFooter>
            </Card>

            {/* Desktop Sync Bridge Dialog */}
            {!isMobile && (
                <Card className={cn(
                    "border-2 transition-all duration-300 bg-slate-900 text-white overflow-hidden",
                    showQrBridge ? "shadow-2xl border-primary/40" : "border-white/5 opacity-80"
                )}>
                    <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <QrCode className="size-8 text-primary" />
                                <h3 className="text-xl font-black uppercase tracking-tighter">Mobile Scan Sync</h3>
                            </div>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Use your phone's high-resolution camera for better document clarity. Scan this code to sync your session.
                            </p>
                            {!showQrBridge && (
                                <Button variant="secondary" className="font-black text-xs h-10 px-6 rounded-lg" onClick={() => setShowMobileQr(true)}>
                                    REVEAL QR CODE
                                </Button>
                            )}
                        </div>
                        {showQrBridge && (
                            <div className="bg-white p-4 rounded-2xl shadow-2xl shrink-0 animate-in zoom-in-95 duration-300">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`} 
                                    alt="QR Sync" 
                                    className="size-36"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Right Section: Page Grid & PDF Actions */}
        <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 shadow-xl border-primary/10 overflow-hidden min-h-[600px] flex flex-col bg-card/50">
                <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileDigit className="size-4 text-primary" />
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Scanned Document Stack</CardTitle>
                    </div>
                    <Badge variant="secondary" className="font-black text-[10px] bg-primary/10 text-primary">{scannedImages.length} PAGES</Badge>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                    {scannedImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {scannedImages.map((src, index) => (
                                <div key={index} className="relative group aspect-[3/4] rounded-xl overflow-hidden border-2 bg-white shadow-md hover:border-primary/50 transition-all transform hover:-translate-y-1">
                                    <Image src={src} alt={`Page ${index + 1}`} fill className="object-cover" />
                                    <div className="absolute top-2 left-2 size-6 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-[8px] font-black text-white">{index + 1}</div>
                                    <Button 
                                        size="icon" 
                                        variant="destructive" 
                                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 shadow-lg" 
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-24 gap-4 opacity-30">
                            <Monitor className="size-16 text-muted-foreground" />
                            <p className="text-xs font-black uppercase tracking-widest">Stack is Empty</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-6 bg-muted/5 border-t flex flex-col gap-4">
                    {createdPdfUrl ? (
                         <Button size="lg" className="w-full h-18 bg-green-600 hover:bg-green-700 font-black text-xl shadow-2xl rounded-2xl transition-all animate-in zoom-in-95" onClick={handleDownload}>
                            <Download className="mr-3 size-7" /> DOWNLOAD PDF
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleCreatePdf} 
                            disabled={scannedImages.length === 0 || isProcessing} 
                            className="w-full h-18 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl group transition-all"
                        >
                            {isProcessing ? <Loader2 className="animate-spin mr-3 size-7"/> : <CheckCircle2 className="mr-3 size-7 group-hover:scale-110 transition-transform" />}
                            {isProcessing ? "PROCESSING..." : "GENERATE PDF"}
                        </Button>
                    )}
                    <div className="flex gap-2 w-full">
                        <Button variant="ghost" size="sm" onClick={handleReset} className="flex-1 text-[10px] font-black uppercase text-muted-foreground hover:bg-destructive/5 hover:text-destructive">
                            <RefreshCcw className="size-3 mr-1.5" /> Clear Workspace
                        </Button>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            <ShieldCheck className="size-3 text-green-500" /> SECURE RAM
                        </div>
                    </div>
                </CardFooter>
            </Card>

            <div className="p-5 bg-primary/5 border-2 border-primary/10 rounded-[2rem] flex gap-4 items-center">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Zap className="size-6 text-primary" />
                </div>
                <div>
                    <p className="text-[11px] font-black text-primary uppercase tracking-tight">Pro OCR Logic Ready</p>
                    <p className="text-[10px] text-muted-foreground leading-tight font-medium">After scanning, you can use our <strong>Image to Text</strong> tool to extract editable characters from this PDF.</p>
                </div>
            </div>
        </div>
      </div>

      {/* Manual Crop Dialog */}
      <Dialog open={imageToCrop !== null} onOpenChange={(open) => !open && setImageToCrop(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-2 shadow-2xl rounded-[2.5rem]">
          <DialogHeader className="bg-muted/30 border-b p-6">
            <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                <Crop className="text-primary size-5" /> Trim Scanned Page
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 bg-black/5 flex justify-center">
            {imageToCrop && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                className="shadow-2xl border-4 border-white"
              >
                <img
                  ref={cropImgRef}
                  alt="Crop preview"
                  src={imageToCrop}
                  onLoad={onCropImageLoad}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter className="p-6 bg-muted/10 border-t flex flex-row gap-3">
            <Button variant="outline" className="flex-1 font-bold h-12 rounded-xl" onClick={() => setImageToCrop(null)}>CANCEL</Button>
            <Button className="flex-[2] font-black h-12 rounded-xl bg-primary text-lg" onClick={handleConfirmCrop} disabled={!completedCrop?.width}>
              <CheckCircle2 className="mr-2 size-5" /> ADD TO PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
