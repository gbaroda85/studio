
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UploadCloud, Download, Loader2, NotebookPen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type PageNumberPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

function parsePageRanges(ranges: string, maxPage: number): number[] {
    const result = new Set<number>();
    if (!ranges) return [];

    const parts = ranges.split(',');
    for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.includes('-')) {
            const [startStr, endStr] = trimmedPart.split('-');
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            if (!isNaN(start) && !isNaN(end) && start <= end && start > 0 && end <= maxPage) {
                for (let i = start; i <= end; i++) {
                    result.add(i);
                }
            } else {
                return []; // Invalid range
            }
        } else {
            const page = parseInt(trimmedPart, 10);
            if (!isNaN(page) && page > 0 && page <= maxPage) {
                result.add(page);
            } else if (trimmedPart !== '') {
                 return []; // Invalid page number
            }
        }
    }
    return Array.from(result).sort((a, b) => a - b);
}

export default function PdfPageNumberer() {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [position, setPosition] = useState<PageNumberPosition>('bottom-center');
  const [format, setFormat] = useState('{page}');
  const [fontSize, setFontSize] = useState(12);
  const [pageRange, setPageRange] = useState('all');
  const [customRange, setCustomRange] = useState('');
  const [numberedPdfUrl, setNumberedPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
        if(numberedPdfUrl) URL.revokeObjectURL(numberedPdfUrl);
    }
  }, [numberedPdfUrl]);

  useEffect(() => {
    if (numberedPdfUrl) {
        URL.revokeObjectURL(numberedPdfUrl);
        setNumberedPdfUrl(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, format, fontSize, pageRange, customRange]);

  const handleFileChange = (file: File | null) => {
    if (file && file.type === 'application/pdf') {
      resetState();
      setPdfFile(file);
    } else if (file) {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a PDF file.' });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const handleAddPageNumbers = async () => {
    if (!pdfFile) {
        toast({variant: 'destructive', title: 'No PDF', description: 'Please upload a PDF file first.'});
        return;
    }
    setIsProcessing(true);

    try {
        const existingPdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;
        const margin = 40;

        let pagesToNumber: number[];
        if (pageRange === 'all') {
            pagesToNumber = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            pagesToNumber = parsePageRanges(customRange, totalPages);
            if (pagesToNumber.length === 0) {
                toast({variant: 'destructive', title: 'Invalid Range', description: 'Please enter a valid page range.'});
                setIsProcessing(false);
                return;
            }
        }

        for (const pageNum of pagesToNumber) {
            const pageIndex = pageNum - 1;
            const page = pages[pageIndex];
            const { width, height } = page.getSize();
            const pageNumberText = format
                .replace('{page}', String(pageNum))
                .replace('{total}', String(totalPages));
            
            const textWidth = font.widthOfTextAtSize(pageNumberText, fontSize);
            let x, y;

            switch (position) {
                case 'top-left': x = margin; y = height - margin; break;
                case 'top-center': x = (width - textWidth) / 2; y = height - margin; break;
                case 'top-right': x = width - textWidth - margin; y = height - margin; break;
                case 'bottom-left': x = margin; y = margin; break;
                case 'bottom-right': x = width - textWidth - margin; y = margin; break;
                case 'bottom-center':
                default:
                    x = (width - textWidth) / 2;
                    y = margin;
                    break;
            }

            page.drawText(pageNumberText, {
                x,
                y,
                font,
                size: fontSize,
                color: rgb(0, 0, 0),
            });
        }

        const newPdfBytes = await pdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setNumberedPdfUrl(url);
        toast({title: "Success!", description: "Page numbers added. Your PDF is ready for download."});
    } catch (error) {
        console.error(error);
        toast({variant: 'destructive', title: 'Error', description: 'Failed to add page numbers. The PDF might be encrypted.'});
    } finally {
        setIsProcessing(false);
    }
  }
  
  const handleDownload = () => {
    if (!numberedPdfUrl || !pdfFile) return;
    const link = document.createElement('a');
    link.href = numberedPdfUrl;
    link.download = `numbered-${pdfFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const resetState = () => {
      setPdfFile(null);
      if (numberedPdfUrl) {
          URL.revokeObjectURL(numberedPdfUrl);
          setNumberedPdfUrl(null);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
  }
  
  if (!pdfFile) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <CardHeader>
          <CardTitle>Add Page Numbers to PDF</CardTitle>
          <CardDescription>Upload a PDF to add page numbers.</CardDescription>
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
    <Card className="w-full max-w-2xl">
        <CardHeader>
            <CardTitle>Page Numbering Options</CardTitle>
            <CardDescription>File: {pdfFile.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select value={position} onValueChange={(v) => setPosition(v as PageNumberPosition)} disabled={isProcessing}>
                        <SelectTrigger id="position"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bottom-center">Bottom Center</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="top-center">Top Center</SelectItem>
                            <SelectItem value="top-left">Top Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Input id="format" value={format} onChange={(e) => setFormat(e.target.value)} placeholder="{page} of {total}" disabled={isProcessing} />
                    <p className="text-xs text-muted-foreground">Use {'{page}'} and {'{total}'}</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <Input id="font-size" type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} disabled={isProcessing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="page-range">Pages to Number</Label>
                    <Select value={pageRange} onValueChange={setPageRange} disabled={isProcessing}>
                        <SelectTrigger id="page-range"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All pages</SelectItem>
                            <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {pageRange === 'custom' && (
                <div className="space-y-2 animate-in fade-in">
                    <Label htmlFor="custom-range">Custom Range</Label>
                    <Input id="custom-range" value={customRange} onChange={(e) => setCustomRange(e.target.value)} placeholder="e.g., 1, 3-5, 8" disabled={isProcessing} />
                </div>
            )}
        </CardContent>
        <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={resetState}>Upload Another</Button>
            {!numberedPdfUrl ? (
                <Button onClick={handleAddPageNumbers} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <NotebookPen className="mr-2" />}
                    Add Page Numbers
                </Button>
            ) : (
                <Button onClick={handleDownload}>
                    <Download className="mr-2" />
                    Download PDF
                </Button>
            )}
        </CardFooter>
    </Card>
  )
}
