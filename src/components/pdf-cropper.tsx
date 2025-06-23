
"use client";

import 'react-image-crop/dist/ReactCrop.css';

import React, { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import ReactCrop, { type Crop, type PixelCrop, centerCrop } from 'react-image-crop';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UploadCloud, Download, Loader2, ChevronLeft, ChevronRight, Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

export default function PdfCropper() {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null);

  const handleFileChange = async (file: File | null) => {
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setCrop(undefined);
      setIsProcessing(true);
      try {
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
            const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
            pdfDocRef.current = pdf;
            setNumPages(pdf.numPages);
            setCurrentPage(1);
            await renderPage(pdf, 1);
        };
        fileReader.readAsArrayBuffer(file);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not process the PDF file.' });
        resetState();
      } finally {
        setIsProcessing(false);
      }
    } else if (file) {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a PDF file.' });
    }
  };

  const renderPage = async (pdf: pdfjs.PDFDocumentProxy, pageNum: number) => {
      setIsProcessing(true);
      try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            setPageImage(canvas.toDataURL('image/png'));
          }
      } catch (e) {
        toast({variant: 'destructive', title: 'Error', description: 'Could not render PDF page.'});
        setPageImage(null);
      } finally {
        setIsProcessing(false);
      }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };
  
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop({ unit: '%', width: 90, height: 90 }, width, height);
    setCrop(initialCrop);
  }

  const handlePageChange = (newPage: number) => {
      if (newPage > 0 && newPage <= numPages && pdfDocRef.current) {
          setCurrentPage(newPage);
          setCrop(undefined);
          setCompletedCrop(undefined);
          renderPage(pdfDocRef.current, newPage);
      }
  }

  const handleCropPdf = async () => {
    if (!pdfFile || !completedCrop?.width) {
        toast({variant: 'destructive', title: 'No crop selected', description: 'Please select an area to crop.'});
        return;
    }
    setIsProcessing(true);

    try {
        const existingPdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const page = pdfDoc.getPage(currentPage - 1);
        
        const image = imgRef.current;
        if (!image) throw new Error('Image reference not found');

        // Scale from displayed image size to natural image size
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const naturalCropX = completedCrop.x * scaleX;
        const naturalCropY = completedCrop.y * scaleY;
        const naturalCropWidth = completedCrop.width * scaleX;
        const naturalCropHeight = completedCrop.height * scaleY;

        // Get PDF page size
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        // Scale from natural image size to PDF points
        const pointsPerPixelX = pageWidth / image.naturalWidth;
        const pointsPerPixelY = pageHeight / image.naturalHeight;

        const cropBoxX = naturalCropX * pointsPerPixelX;
        const cropBoxWidth = naturalCropWidth * pointsPerPixelX;
        const cropBoxHeight = naturalCropHeight * pointsPerPixelY;
        
        // pdf-lib's y-coordinate is from the bottom-left corner.
        const cropBoxY = pageHeight - (naturalCropY * pointsPerPixelY) - cropBoxHeight;
        
        page.setCropBox(
            cropBoxX,
            cropBoxY,
            cropBoxWidth,
            cropBoxHeight
        );

        const newPdfBytes = await pdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cropped-${pdfFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error(error);
        toast({variant: 'destructive', title: 'Error', description: 'Failed to crop the PDF.'});
    } finally {
        setIsProcessing(false);
    }
  }

  const resetState = () => {
      setPdfFile(null);
      setIsProcessing(false);
      setNumPages(0);
      setCurrentPage(1);
      setPageImage(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
      pdfDocRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (!pdfFile) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <CardHeader>
          <CardTitle>Crop PDF</CardTitle>
          <CardDescription>Upload a PDF to crop its pages.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground"><span className="text-primary font-semibold">Click to upload</span> or drag and drop</p>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
        <CardHeader>
            <CardTitle>Crop PDF</CardTitle>
            <CardDescription>Select an area on the page to crop. Cropping is applied to the current page only.</CardDescription>
        </CardHeader>
        <CardContent>
            {isProcessing && !pageImage && <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {pageImage && (
                <div className="flex justify-center bg-muted/30 p-4 rounded-md relative">
                    {isProcessing && <div className="absolute inset-0 bg-background/50 flex justify-center items-center z-10"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                    >
                        <img
                        ref={imgRef}
                        alt="PDF Page Preview"
                        src={pageImage}
                        onLoad={onImageLoad}
                        style={{ maxHeight: '70vh', objectFit: 'contain' }}
                        />
                    </ReactCrop>
                </div>
            )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isProcessing}>
                    <ChevronLeft />
                </Button>
                <span className="text-sm font-medium">
                    Page {currentPage} of {numPages}
                </span>
                <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= numPages || isProcessing}>
                    <ChevronRight />
                </Button>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={resetState}>Upload Another</Button>
                <Button onClick={handleCropPdf} disabled={!completedCrop?.width || isProcessing}>
                    <Scissors className="mr-2" />
                    Crop & Download
                </Button>
            </div>
        </CardFooter>
    </Card>
  )
}
