
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UploadCloud, Download, Loader2, ChevronLeft, ChevronRight, Type, Image as ImageIcon, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Input } from './ui/input';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

const standardFonts = {
  'Courier': StandardFonts.Courier,
  'Courier-Bold': StandardFonts.CourierBold,
  'Courier-Oblique': StandardFonts.CourierOblique,
  'Courier-BoldOblique': StandardFonts.CourierBoldOblique,
  'Helvetica': StandardFonts.Helvetica,
  'Helvetica-Bold': StandardFonts.HelveticaBold,
  'Helvetica-Oblique': StandardFonts.HelveticaOblique,
  'Helvetica-BoldOblique': StandardFonts.HelveticaBoldOblique,
  'Times-Roman': StandardFonts.TimesRoman,
  'Times-Roman-Bold': StandardFonts.TimesRomanBold,
  'Times-Roman-Italic': StandardFonts.TimesRomanItalic,
  'Times-Roman-BoldItalic': StandardFonts.TimesRomanBoldItalic,
};
type FontKey = keyof typeof standardFonts;


function hexToRgbForPdfLib(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return rgb(r / 255, g / 255, b / 255);
}

export default function PdfEditor() {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Editing state
  const [activeTab, setActiveTab] = useState('text');
  
  // Text state
  const [textToAdd, setTextToAdd] = useState('Confidential');
  const [font, setFont] = useState<FontKey>('Helvetica-Bold');
  const [fontSize, setFontSize] = useState(50);
  const [textColor, setTextColor] = useState('#ff0000');
  const [textRotation, setTextRotation] = useState([0]);
  const [textOpacity, setTextOpacity] = useState([85]);
  const [textX, setTextX] = useState('50');
  const [textY, setTextY] = useState('400');

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState([25]);
  const [imageOpacity, setImageOpacity] = useState([100]);
  const [imageX, setImageX] = useState('50');
  const [imageY, setImageY] = useState('400');


  const [editedPdfUrl, setEditedPdfUrl] = useState<string | null>(null);
  
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null);

  useEffect(() => {
    return () => {
      if (editedPdfUrl) URL.revokeObjectURL(editedPdfUrl);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      pagePreviews.forEach(URL.revokeObjectURL);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedPdfUrl, imagePreviewUrl]);


  const updatePagePreview = async (pdfBytes: ArrayBuffer, pageNumber: number) => {
      const typedArray = new Uint8Array(pdfBytes);
      const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
      pdfDocRef.current = pdf;

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      if (context) {
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: context, viewport }).promise;
          const newPreviewUrl = canvas.toDataURL('image/png');
          setPagePreviews(previews => {
              const newPreviews = [...previews];
              if (newPreviews[pageNumber - 1]) {
                  URL.revokeObjectURL(newPreviews[pageNumber - 1]);
              }
              newPreviews[pageNumber - 1] = newPreviewUrl;
              return newPreviews;
          });
      }
  }


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
                const viewport = page.getViewport({ scale: 1.5 }); // Better quality preview
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

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setImageFile(file);
      if(imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    } else if (file) {
      toast({variant: 'destructive', title: 'Unsupported Image', description: 'Please upload a JPG or PNG file.'});
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };
  
  const handlePageChange = (newPage: number) => {
      if (newPage > 0 && newPage <= numPages) {
          setCurrentPage(newPage);
      }
  }
  
  const handleApply = async () => {
      if (activeTab === 'text') {
          await handleApplyText();
      } else {
          await handleApplyImage();
      }
  }

  const handleApplyText = async () => {
    if (!pdfFile || !textToAdd) {
        toast({variant: 'destructive', title: 'Missing info', description: 'Please upload a file and enter text to add.'});
        return;
    }
    setIsProcessing(true);

    try {
        const existingPdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const selectedFont = await pdfDoc.embedFont(standardFonts[font]);
        
        const page = pdfDoc.getPage(currentPage - 1);
        
        const x = parseFloat(textX) || 0;
        const y = parseFloat(textY) || 0;

        page.drawText(textToAdd, {
            x,
            y,
            font: selectedFont,
            size: fontSize,
            color: hexToRgbForPdfLib(textColor),
            rotate: degrees(textRotation[0]),
            opacity: textOpacity[0] / 100,
        });

        const newPdfBytes = await pdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        
        // Update file in state for cumulative edits
        const newFile = new File([blob], pdfFile.name, { type: 'application/pdf' });
        setPdfFile(newFile);
        
        // Update download URL
        if(editedPdfUrl) URL.revokeObjectURL(editedPdfUrl);
        const url = URL.createObjectURL(blob);
        setEditedPdfUrl(url);

        // Update preview
        await updatePagePreview(newPdfBytes, currentPage);
        toast({title: "Success", description: "Text added. You can apply more changes or download."});
    } catch (error) {
        console.error(error);
        toast({variant: 'destructive', title: 'Error', description: 'Failed to edit the PDF.'});
    } finally {
        setIsProcessing(false);
    }
  }

  const handleApplyImage = async () => {
    if (!pdfFile || !imageFile) {
        toast({variant: 'destructive', title: 'Missing info', description: 'Please upload a PDF and select an image.'});
        return;
    }
    setIsProcessing(true);
    try {
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const imageBytes = await imageFile.arrayBuffer();
        
        let embeddedImage;
        if (imageFile.type === 'image/jpeg') {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else {
            embeddedImage = await pdfDoc.embedPng(imageBytes);
        }

        const page = pdfDoc.getPage(currentPage - 1);
        const scale = imageScale[0] / 100;
        const imgWidth = embeddedImage.width * scale;
        const imgHeight = embeddedImage.height * scale;
        
        const x = parseFloat(imageX) || 0;
        const y = parseFloat(imageY) || 0;
        
        page.drawImage(embeddedImage, {
            x,
            y,
            width: imgWidth,
            height: imgHeight,
            opacity: imageOpacity[0] / 100,
        });

        const newPdfBytes = await pdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        
        const newFile = new File([blob], pdfFile.name, { type: 'application/pdf' });
        setPdfFile(newFile);

        if(editedPdfUrl) URL.revokeObjectURL(editedPdfUrl);
        const url = URL.createObjectURL(blob);
        setEditedPdfUrl(url);

        await updatePagePreview(newPdfBytes, currentPage);
        toast({title: "Success", description: "Image added. You can apply more changes or download."});
    } catch (error) {
        console.error(error);
        toast({variant: 'destructive', title: 'Error', description: 'Failed to add image to PDF.'});
    } finally {
        setIsProcessing(false);
    }
  }
  
  const handleDownload = () => {
      if (!editedPdfUrl && !pdfFile) {
          toast({variant: 'destructive', title: 'No file to download', description: 'Please apply an edit first.'});
          return;
      }

      if (!editedPdfUrl && pdfFile) {
          const url = URL.createObjectURL(pdfFile);
          const link = document.createElement('a');
          link.href = url;
          link.download = `edited-${pdfFile.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return;
      }
      
      const link = document.createElement('a');
      link.href = editedPdfUrl!;
      link.download = `edited-${pdfFile!.name}`;
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
      setImageFile(null);
      if (imagePreviewUrl) {
          URL.revokeObjectURL(imagePreviewUrl);
          setImagePreviewUrl(null);
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
          <CardDescription>Upload a PDF to add text or images to its pages.</CardDescription>
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
                    <CardDescription>Add content to page {currentPage}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text"><Type className="mr-2 h-4 w-4" /> Text</TabsTrigger>
                            <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" /> Image</TabsTrigger>
                        </TabsList>
                        <TabsContent value="text" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="text-to-add">Text</Label>
                                <Input id="text-to-add" value={textToAdd} onChange={(e) => setTextToAdd(e.target.value)} placeholder="Enter text" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="font">Font</Label>
                                <Select value={font} onValueChange={(v) => setFont(v as FontKey)}>
                                    <SelectTrigger id="font"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(standardFonts).map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="font-size">Font Size</Label>
                                    <Input id="font-size" type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color">Color</Label>
                                    <Input id="color" type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="p-1"/>
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="text-x">X Position</Label>
                                    <Input id="text-x" type="number" value={textX} onChange={e => setTextX(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="text-y">Y Position</Label>
                                    <Input id="text-y" type="number" value={textY} onChange={e => setTextY(e.target.value)} />
                                </div>
                            </div>
                             <p className="text-xs text-muted-foreground -mt-2">Coordinates start from the bottom-left corner.</p>
                            <div className="space-y-2">
                                <Label htmlFor="text-opacity" className="flex justify-between">
                                    <span>Opacity</span>
                                    <span className="text-primary font-medium">{textOpacity[0]}%</span>
                                </Label>
                                <Slider id="text-opacity" min={0} max={100} step={1} value={textOpacity} onValueChange={setTextOpacity} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rotation" className="flex justify-between">
                                    <span><RotateCw className="inline-block mr-2 h-4 w-4" />Rotation</span>
                                    <span className="text-primary font-medium">{textRotation[0]}°</span>
                                </Label>
                                <Slider id="rotation" min={-180} max={180} step={1} value={textRotation} onValueChange={setTextRotation} />
                            </div>
                        </TabsContent>
                        <TabsContent value="image" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="image-upload">Upload Image (JPG/PNG)</Label>
                                <Input id="image-upload" type="file" accept="image/jpeg,image/png" onChange={handleImageFileChange} />
                            </div>
                            {imagePreviewUrl && (
                                <div className="p-2 border rounded-md flex justify-center">
                                    <Image src={imagePreviewUrl} alt="Image Preview" width={100} height={100} className="object-contain" />
                                </div>
                            )}
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="image-x">X Position</Label>
                                    <Input id="image-x" type="number" value={imageX} onChange={e => setImageX(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image-y">Y Position</Label>
                                    <Input id="image-y" type="number" value={imageY} onChange={e => setImageY(e.target.value)} />
                                </div>
                            </div>
                             <p className="text-xs text-muted-foreground -mt-2">Coordinates start from the bottom-left corner.</p>
                            <div className="space-y-2">
                                <Label htmlFor="image-scale" className="flex justify-between">
                                    <span>Scale</span>
                                    <span className="text-primary font-medium">{imageScale[0]}%</span>
                                </Label>
                                <Slider id="image-scale" min={1} max={200} step={1} value={imageScale} onValueChange={setImageScale} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="image-opacity" className="flex justify-between">
                                    <span>Opacity</span>
                                    <span className="text-primary font-medium">{imageOpacity[0]}%</span>
                                </Label>
                                <Slider id="image-opacity" min={0} max={100} step={1} value={imageOpacity} onValueChange={setImageOpacity} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex-col gap-2 pt-4">
                    <Button className="w-full" onClick={handleApply} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : (activeTab === 'text' ? <Type className="mr-2" /> : <ImageIcon className="mr-2" />)}
                        Apply to Page {currentPage}
                    </Button>
                    <Button className="w-full" onClick={handleDownload} variant="secondary">
                        <Download className="mr-2" />
                        Download PDF
                    </Button>
                    <Button variant="outline" onClick={resetState} className="w-full">Start Over</Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  )
}

    

    