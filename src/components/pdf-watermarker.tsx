
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UploadCloud, Download, Loader2, Copyright } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type WatermarkPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal-bottom-up' | 'diagonal-top-down';

export default function PdfWatermarker() {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [position, setPosition] = useState<WatermarkPosition>('center');
  const [opacity, setOpacity] = useState([50]);
  const [fontSize, setFontSize] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
        if(watermarkedPdfUrl) URL.revokeObjectURL(watermarkedPdfUrl);
    }
  }, [watermarkedPdfUrl]);

  useEffect(() => {
    if (watermarkedPdfUrl) {
        URL.revokeObjectURL(watermarkedPdfUrl);
        setWatermarkedPdfUrl(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watermarkText, position, opacity, fontSize, rotation]);

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
  
  const handlePositionChange = (value: WatermarkPosition) => {
      setPosition(value);
      if(value === 'diagonal-bottom-up') {
          setRotation(-45);
      } else if (value === 'diagonal-top-down') {
          setRotation(45);
      } else {
          setRotation(0);
      }
  }

  const handleApplyWatermark = async () => {
    if (!pdfFile) {
        toast({variant: 'destructive', title: 'No PDF', description: 'Please upload a PDF file first.'});
        return;
    }
    if (!watermarkText) {
        toast({variant: 'destructive', title: 'No Text', description: 'Please enter the watermark text.'});
        return;
    }
    setIsProcessing(true);

    try {
        const existingPdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        const pages = pdfDoc.getPages();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        const margin = 50;

        for (const page of pages) {
            const { width, height } = page.getSize();
            let x, y;

            switch (position) {
                case 'top-left': x = margin; y = height - margin - textHeight; break;
                case 'top-right': x = width - textWidth - margin; y = height - margin - textHeight; break;
                case 'bottom-left': x = margin; y = margin; break;
                case 'bottom-right': x = width - textWidth - margin; y = margin; break;
                case 'diagonal-bottom-up':
                case 'diagonal-top-down':
                case 'center':
                default:
                    x = (width - textWidth) / 2;
                    y = (height - textHeight) / 2;
                    break;
            }

            page.drawText(watermarkText, {
                x,
                y,
                font,
                size: fontSize,
                color: rgb(0, 0, 0),
                opacity: opacity[0] / 100,
                rotate: degrees(rotation),
            });
        }

        const newPdfBytes = await pdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setWatermarkedPdfUrl(url);
        toast({title: "Success!", description: "Watermark applied. Your PDF is ready for download."});
    } catch (error) {
        console.error(error);
        toast({variant: 'destructive', title: 'Error', description: 'Failed to add watermark. The PDF might be encrypted.'});
    } finally {
        setIsProcessing(false);
    }
  }
  
  const handleDownload = () => {
    if (!watermarkedPdfUrl || !pdfFile) return;
    const link = document.createElement('a');
    link.href = watermarkedPdfUrl;
    link.download = `watermarked-${pdfFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const resetState = () => {
      setPdfFile(null);
      if (watermarkedPdfUrl) {
          URL.revokeObjectURL(watermarkedPdfUrl);
          setWatermarkedPdfUrl(null);
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
          <CardTitle>Add Watermark to PDF</CardTitle>
          <CardDescription>Upload a PDF to apply a text watermark.</CardDescription>
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
            <CardTitle>Watermark Options</CardTitle>
            <CardDescription>File: {pdfFile.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="watermark-text">Watermark Text</Label>
                <Input id="watermark-text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="Your watermark text" disabled={isProcessing} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select value={position} onValueChange={(v) => handlePositionChange(v as WatermarkPosition)} disabled={isProcessing}>
                        <SelectTrigger id="position"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="diagonal-bottom-up">Diagonal (Bottom-Up)</SelectItem>
                            <SelectItem value="diagonal-top-down">Diagonal (Top-Down)</SelectItem>
                            <SelectItem value="top-left">Top Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="opacity" className="flex justify-between"><span>Opacity</span><span className="text-primary font-medium">{opacity[0]}%</span></Label>
                    <Slider id="opacity" min={0} max={100} step={1} value={opacity} onValueChange={setOpacity} disabled={isProcessing} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <Input id="font-size" type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} disabled={isProcessing} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="rotation">Rotation (degrees)</Label>
                    <Input id="rotation" type="number" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} disabled={isProcessing || position.startsWith('diagonal')} />
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={resetState}>Upload Another</Button>
            {!watermarkedPdfUrl ? (
                <Button onClick={handleApplyWatermark} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <Copyright className="mr-2" />}
                    Apply Watermark
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
