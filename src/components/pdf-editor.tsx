
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UploadCloud, Download, Loader2, ChevronLeft, ChevronRight, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

type TextPosition = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export default function PdfEditor() {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textToAdd, setTextToAdd] = useState('Confidential');
  const [position, setPosition] = useState<TextPosition>('center');
  const [editedPdfUrl, setEditedPdfUrl] = useState<string | null>(null);
  
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null);

  useEffect(() => {
    // Clean up blob URL on unmount
    return () => {
      if (editedPdfUrl) {
        URL.revokeObjectURL(editedPdfUrl);
      }
    };
  }, [editedPdfUrl]);

  useEffect(() => {
      if (editedPdfUrl) {
          URL.revokeObjectURL(editedPdfUrl);
          setEditedPdfUrl(null);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textToAdd, position]);

  const handleFileChange = async (file: File | null) => {
    if (file && file.type === 'application/pdf') {
      resetState();
      setPdfFile(file);
      setIsProcessing(true);
      try {
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
            const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
            pdfDocRef.current = pdf;
            setNumPages(pdf.numPages);
            setCurrentPage(1);
            
            const previews: string[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                if(context) {
                    context.fillStyle = '#FFFFFF';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvasContext: context, viewport }).promise;
                    previews.push(canvas.toDataURL('image/png'));
                }
            }
            setPagePreviews(previews);
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

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };
  
  const handlePageChange = (newPage: number) => {
      if (newPage > 0 && newPage <= numPages) {
          setCurrentPage(newPage);
          if (editedPdfUrl) {
            URL.revokeObjectURL(editedPdfUrl);
            setEditedPdfUrl(null);
          }
      }
  }

  const handleAddText = async () => {
    if (!pdfFile || !textToAdd) {
        toast({variant: 'destructive', title: 'Missing info', description: 'Please upload a file and enter text to add.'});
        return;
    }
    setIsProcessing(true);

    try {
        const existingPdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        const pages = pdfDoc.getPages();
        const page = pages[currentPage - 1];
        const { width, height } = page.getSize();
        
        const fontSize = 50;
        const textWidth = helveticaFont.widthOfTextAtSize(textToAdd, fontSize);
        const textHeight = helveticaFont.heightAtSize(fontSize);
        const margin = 40;

        let x = 0;
        let y = 0;

        switch (position) {
            case 'top-left': x = margin; y = height - margin - textHeight; break;
            case 'top-center': x = (width / 2) - (textWidth / 2); y = height - margin - textHeight; break;
            case 'top-right': x = width - margin - textWidth; y = height - margin - textHeight; break;
            case 'center': x = (width / 2) - (textWidth / 2); y = (height / 2) - (textHeight / 2); break;
            case 'bottom-left': x = margin; y = margin; break;
            case 'bottom-center': x = (width / 2) - (textWidth / 2); y = margin; break;
            case 'bottom-right': x = width - margin - textWidth; y = margin; break;
        }

        page.drawText(textToAdd, {
            x,
            y,
            font: helveticaFont,
            size: fontSize,
            color: rgb(0.95, 0.1, 0.1),
            opacity: 0.75,
        });

        const newPdfBytes = await pdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setEditedPdfUrl(url);
        toast({title: "Success", description: "Text added. Your PDF is ready to download."});
    } catch (error) {
        console.error(error);
        toast({variant: 'destructive', title: 'Error', description: 'Failed to edit the PDF.'});
    } finally {
        setIsProcessing(false);
    }
  }
  
  const handleDownload = () => {
      if (!editedPdfUrl || !pdfFile) return;
      const link = document.createElement('a');
      link.href = editedPdfUrl;
      link.download = `edited-${pdfFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  const resetState = () => {
      setPdfFile(null);
      setIsProcessing(false);
      setNumPages(0);
      setCurrentPage(1);
      setPagePreviews([]);
      if (editedPdfUrl) {
          URL.revokeObjectURL(editedPdfUrl);
          setEditedPdfUrl(null);
      }
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
          <CardTitle>Edit PDF</CardTitle>
          <CardDescription>Upload a PDF to add text to its pages.</CardDescription>
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
    <div className="w-full max-w-6xl grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>PDF Preview</CardTitle>
                    <CardDescription>File: {pdfFile.name}</CardDescription>
                </CardHeader>
                <CardContent className="relative aspect-[0.707] bg-muted/30 flex justify-center items-center">
                    {isProcessing && pagePreviews.length === 0 && <Loader2 className="h-8 w-8 animate-spin" />}
                    {pagePreviews[currentPage - 1] && (
                        <Image src={pagePreviews[currentPage - 1]} alt={`Page ${currentPage}`} fill className="object-contain" />
                    )}
                </CardContent>
                <CardFooter className="justify-center">
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
                </CardFooter>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Editing Tools</CardTitle>
                    <CardDescription>Add text to the current page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="text-to-add">Text to Add</Label>
                        <Textarea id="text-to-add" value={textToAdd} onChange={(e) => setTextToAdd(e.target.value)} placeholder="Enter text" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Select value={position} onValueChange={(v) => setPosition(v as TextPosition)} disabled={isProcessing}>
                            <SelectTrigger id="position"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="top-left">Top Left</SelectItem>
                                <SelectItem value="top-center">Top Center</SelectItem>
                                <SelectItem value="top-right">Top Right</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">More options like font and color are coming soon!</p>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    {!editedPdfUrl ? (
                        <Button className="w-full" onClick={handleAddText} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <Type className="mr-2" />}
                            Apply Text
                        </Button>
                    ) : (
                        <Button className="w-full" onClick={handleDownload}>
                            <Download className="mr-2" />
                            Download PDF
                        </Button>
                    )}
                    <Button variant="outline" onClick={resetState} className="w-full">Upload Another</Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  )
}
