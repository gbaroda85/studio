
"use client";

import 'react-image-crop/dist/ReactCrop.css';

import { useState, useRef, useEffect, type SyntheticEvent } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Camera, Download, ScanLine, X, Loader2, AlertTriangle, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop } from 'react-image-crop';

export default function ScannerToPdf() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cropImgRef = useRef<HTMLImageElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdPdfUrl, setCreatedPdfUrl] = useState<string | null>(null);
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  useEffect(() => {
    async function getCameraPermission() {
      const constraints = { video: { facingMode: 'environment' } };
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.warn('Rear camera not available, trying any camera.', error);
        try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = fallbackStream;
            }
            setHasCameraPermission(true);
        } catch (fallbackError) {
            console.error('Error accessing camera:', fallbackError);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings.',
            });
        }
      }
    }
    getCameraPermission();
    
    return () => {
        if(videoRef.current && videoRef.current.srcObject){
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        if (createdPdfUrl) {
            URL.revokeObjectURL(createdPdfUrl);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const clearCreatedPdf = () => {
      if(createdPdfUrl) {
          URL.revokeObjectURL(createdPdfUrl);
          setCreatedPdfUrl(null);
      }
  }

  const handleScan = () => {
    if (!videoRef.current) return;
    clearCreatedPdf();
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImageToCrop(dataUrl);
      setCrop(undefined);
    }
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
      pdf.addImage(src, 'JPEG', (pdfWidth - width) / 2, (pdfHeight - height) / 2, width, height);
    });
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setCreatedPdfUrl(url);
    setIsProcessing(false);
    toast({ title: 'Success!', description: 'PDF created and ready for download.'});
  };
  
  const handleDownload = () => {
      if (!createdPdfUrl) return;
      const link = document.createElement('a');
      link.href = createdPdfUrl;
      link.download = "scanned-document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  function onCropImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop({ unit: '%', width: 90, height: 90 }, width, height);
    setCrop(initialCrop);
    setCompletedCrop({
      unit: 'px',
      x: (width * initialCrop.x) / 100,
      y: (height * initialCrop.y) / 100,
      width: (width * initialCrop.width) / 100,
      height: (height * initialCrop.height) / 100
    });
  }

  const handleConfirmCrop = () => {
    const image = cropImgRef.current;
    if (!image || !completedCrop?.width) {
      toast({
        variant: 'destructive',
        title: 'Crop Error',
        description: 'Could not crop image. Please select a crop area.',
      });
      return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not process the image for cropping.',
      });
      return;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setScannedImages(prev => [...prev, croppedDataUrl]);
    setImageToCrop(null);
    toast({
      title: "Page Scanned!",
      description: `You have ${scannedImages.length + 1} pages.`
    })
  };

  const handleCancelCrop = () => {
    setImageToCrop(null);
  };
  
  const handleReset = () => {
      setScannedImages([]);
      clearCreatedPdf();
  }
  
  return (
    <>
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Scan Document</CardTitle>
            <CardDescription>Use your camera to scan pages for your PDF.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                  {hasCameraPermission === false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Alert variant="destructive" className="w-auto">
                              <AlertTriangle />
                              <AlertTitle>Camera Access Required</AlertTitle>
                              <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
                          </Alert>
                      </div>
                  )}
              </div>
          </CardContent>
          <CardFooter>
              <Button onClick={handleScan} disabled={!hasCameraPermission} className="w-full">
                  <Camera className="mr-2" />
                  Scan Current Page
              </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
              <CardTitle>Scanned Pages ({scannedImages.length})</CardTitle>
              <CardDescription>Review your scanned pages before creating the PDF.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px]">
              {scannedImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {scannedImages.map((src, index) => (
                          <div key={index} className="relative group aspect-[3/4]">
                              <Image src={src} alt={`Scanned page ${index + 1}`} fill className="object-cover rounded-md" />
                              <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveImage(index)}>
                                  <X className="h-4 w-4" />
                              </Button>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-12 border-2 border-dashed rounded-md">
                      <ScanLine className="h-12 w-12 mb-4" />
                      <p>Your scanned pages will appear here.</p>
                  </div>
              )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
              {scannedImages.length > 0 && <Button variant="outline" onClick={handleReset}>Clear All</Button>}
              
              {!createdPdfUrl ? (
                <Button onClick={handleCreatePdf} disabled={scannedImages.length === 0 || isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <FileDigit className="mr-2" />}
                    Create PDF
                </Button>
              ) : (
                <Button onClick={handleDownload}>
                    <Download className="mr-2" />
                    Download PDF
                </Button>
              )}
          </CardFooter>
        </Card>
      </div>

      <Dialog open={imageToCrop !== null} onOpenChange={(open) => !open && handleCancelCrop()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crop Scanned Page</DialogTitle>
          </DialogHeader>
          {imageToCrop && (
            <div className="flex justify-center bg-muted/30 p-4 rounded-md">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
              >
                <img
                  ref={cropImgRef}
                  alt="Crop preview"
                  src={imageToCrop}
                  onLoad={onCropImageLoad}
                  style={{ maxHeight: '70vh', objectFit: 'contain' }}
                />
              </ReactCrop>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelCrop}>Cancel</Button>
            <Button onClick={handleConfirmCrop} disabled={!completedCrop?.width}>
              <Crop className="mr-2" />
              Add to Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
