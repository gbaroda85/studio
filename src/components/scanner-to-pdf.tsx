"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Camera, Download, ScanLine, X, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function ScannerToPdf() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function getCameraPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    }
    getCameraPermission();
    
    return () => {
        if(videoRef.current && videoRef.current.srcObject){
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleScan = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setScannedImages(prev => [...prev, dataUrl]);
      toast({title: "Page Scanned!", description: `You have ${scannedImages.length + 1} pages.`})
    }
  };
  
  const handleRemoveImage = (index: number) => {
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
    pdf.save('scanned-document.pdf');
    setIsProcessing(false);
  };
  
  return (
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
            {scannedImages.length > 0 && <Button variant="outline" onClick={() => setScannedImages([])}>Clear All</Button>}
            <Button onClick={handleCreatePdf} disabled={scannedImages.length === 0 || isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
                Create & Download PDF
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
