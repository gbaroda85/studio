
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect, useCallback } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
    UploadCloud, 
    Download, 
    Loader2, 
    Copyright, 
    Settings2, 
    Eye, 
    ShieldCheck, 
    Zap, 
    RefreshCcw, 
    Type, 
    Maximize, 
    RotateCw, 
    Sparkles,
    CheckCircle2,
    Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

type WatermarkPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal-bottom-up' | 'diagonal-top-down';

export default function PdfWatermarker() {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [position, setPosition] = useState<WatermarkPosition>('center');
  const [opacity, setOpacity] = useState([30]);
  const [fontSize, setFontSize] = useState(60);
  const [rotation, setRotation] = useState(-45);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState<string | null>(null);
  const [originalPageImage, setOriginalPageImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
        if(watermarkedPdfUrl) URL.revokeObjectURL(watermarkedPdfUrl);
    }
  }, [watermarkedPdfUrl]);

  // Handle file upload and initial page render
  const handleFileChange = async (file: File | null) => {
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setWatermarkedPdfUrl(null);
      setOriginalPageImage(null);
      setPreviewImage(null);
      setIsGeneratingPreview(true);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: context, viewport }).promise;
            setOriginalPageImage(canvas.toDataURL('image/jpeg', 0.9));
        }
      } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load PDF for preview.' });
      } finally {
        setIsGeneratingPreview(false);
      }
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
      if(value === 'diagonal-bottom-up') setRotation(-45);
      else if(value === 'diagonal-top-down') setRotation(45);
      else setRotation(0);
  }

  const handleApplyWatermark = async () => {
    if (!pdfFile || !watermarkText) return;
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
            let x = 0, y = 0;

            switch (position) {
                case 'top-left': x = margin; y = height - margin - textHeight; break;
                case 'top-right': x = width - textWidth - margin; y = height - margin - textHeight; break;
                case 'bottom-left': x = margin; y = margin; break;
                case 'bottom-right': x = width - textWidth - margin; y = margin; break;
                default: // center & diagonals
                    x = (width - textWidth) / 2;
                    y = (height - textHeight) / 2;
                    break;
            }

            // Correction for rotation centering if it's center
            if (position === 'center' || position.startsWith('diagonal')) {
                const rad = (rotation * Math.PI) / 180;
                const cos = Math.abs(Math.cos(rad));
                const sin = Math.abs(Math.sin(rad));
                // Simplified visual centering offset
                x = (width - (textWidth * cos)) / 2;
                y = (height - (textWidth * sin)) / 2;
            }

            page.drawText(watermarkText, {
                x,
                y,
                font,
                size: fontSize,
                color: rgb(0.5, 0.5, 0.5),
                opacity: opacity[0] / 100,
                rotate: degrees(rotation),
            });
        }

        const newPdfBytes = await pdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setWatermarkedPdfUrl(url);
        toast({ title: "Success!", description: "Watermark embedded in all pages." });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to process document.' });
    } finally {
        setIsProcessing(false);
    }
  }
  
  const handleDownload = () => {
    if (!watermarkedPdfUrl || !pdfFile) return;
    const link = document.createElement('a');
    link.href = watermarkedPdfUrl;
    link.download = `watermarked-${pdfFile.name}`;
    link.click();
  }

  const resetState = () => {
      setPdfFile(null);
      setOriginalPageImage(null);
      setWatermarkedPdfUrl(null);
      setWatermarkText('CONFIDENTIAL');
      if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Calculate CSS for Preview Overlay
  const getPreviewStyle = () => {
      const styles: React.CSSProperties = {
          position: 'absolute',
          pointerEvents: 'none',
          color: 'rgba(0,0,0,0.5)', // Preview uses darker for visibility
          opacity: opacity[0] / 100,
          fontSize: `${fontSize}px`,
          fontWeight: 'black',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          transform: `rotate(${rotation}deg)`,
          transition: 'all 0.2s ease-out'
      };

      switch (position) {
          case 'top-left': styles.top = '10%'; styles.left = '10%'; break;
          case 'top-right': styles.top = '10%'; styles.right = '10%'; break;
          case 'bottom-left': styles.bottom = '10%'; styles.left = '10%'; break;
          case 'bottom-right': styles.bottom = '10%'; styles.right = '10%'; break;
          default: // center
              styles.top = '50%';
              styles.left = '50%';
              styles.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
              break;
      }
      return styles;
  }
  
  if (!pdfFile) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 bg-card/50 hover:border-primary/80 hover:shadow-2xl border-2 border-dashed mx-auto", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <CardHeader>
          <div className="mx-auto mb-4 grid size-16 md:size-20 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Copyright className="h-8 md:h-10 w-8 md:w-10" />
          </div>
          <CardTitle className="text-xl md:text-3xl font-black uppercase tracking-tight">PDF Watermark Studio</CardTitle>
          <CardDescription className="text-[10px] md:text-sm uppercase font-bold opacity-60">Add secure text overlays with real-time preview.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div
            className="border-3 border-dashed border-muted-foreground/30 rounded-2xl md:rounded-3xl p-8 md:p-20 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="relative">
                <UploadCloud className="h-12 md:h-16 w-12 md:w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                <Zap className="absolute -top-2 -right-2 h-6 md:h-8 w-6 md:w-8 text-yellow-500 animate-pulse" />
            </div>
            <div>
                <p className="text-lg md:text-xl font-bold uppercase tracking-tighter">Drop PDF here to Begin</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-2 font-medium">100% Private local RAM processing.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center gap-4 md:gap-8 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
            <div className="flex items-center gap-1.5"><Eye className="size-3 text-primary" /> LIVE PREVIEW</div>
            <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-purple-500" /> PRO LAYOUTS</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-500 flex flex-col gap-6 md:gap-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-4">
                <div className="size-12 md:size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                    <Settings2 className="size-6 md:size-8" />
                </div>
                <div>
                    <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Watermark <span className="text-primary">Studio</span></h2>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[7px] md:text-[8px] font-black uppercase bg-green-500/5 text-green-600 border-green-500/20 truncate max-w-[150px]">{pdfFile.name}</Badge>
                        <Badge variant="outline" className="text-[7px] md:text-[8px] font-black uppercase bg-primary/5 text-primary border-primary/20">LIVE HD PREVIEW</Badge>
                    </div>
                </div>
            </div>
            <Button variant="outline" onClick={resetState} className="w-full md:w-auto h-10 md:h-12 border-2 font-black text-[9px] md:text-[10px] uppercase px-4 md:px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive">
                <RefreshCcw className="mr-2 size-3 md:size-4" /> Change File
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
            
            {/* Sidebar: Controls */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-slate-950">
                    <CardHeader className="bg-primary/5 border-b p-5 md:p-6">
                        <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                            <Palette className="size-5 text-primary" /> Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-6 md:space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60 flex items-center gap-2">
                                <Type className="size-3" /> Watermark Text
                            </Label>
                            <Input 
                                value={watermarkText} 
                                onChange={(e) => setWatermarkText(e.target.value.toUpperCase())}
                                placeholder="e.g. CONFIDENTIAL"
                                className="h-12 md:h-14 font-black text-base md:text-lg border-2 rounded-xl bg-background shadow-inner uppercase tracking-wider"
                                maxLength={20}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60 flex items-center gap-2">
                                <Maximize className="size-3" /> Position Preset
                            </Label>
                            <Select value={position} onValueChange={(v) => handlePositionChange(v as WatermarkPosition)}>
                                <SelectTrigger className="h-12 border-2 font-bold rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl border-2 shadow-2xl">
                                    <SelectItem value="center" className="font-bold">Perfect Center</SelectItem>
                                    <SelectItem value="diagonal-bottom-up" className="font-bold">Diagonal (Standard)</SelectItem>
                                    <SelectItem value="diagonal-top-down" className="font-bold">Diagonal (Reverse)</SelectItem>
                                    <SelectItem value="top-left" className="font-bold">Top Left</SelectItem>
                                    <SelectItem value="top-right" className="font-bold">Top Right</SelectItem>
                                    <SelectItem value="bottom-left" className="font-bold">Bottom Left</SelectItem>
                                    <SelectItem value="bottom-right" className="font-bold">Bottom Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-black uppercase opacity-60">Size</Label>
                                    <span className="text-[10px] font-bold text-primary">{fontSize}pt</span>
                                </div>
                                <Input type="number" value={fontSize} onChange={(e) => setFontSize(Math.max(10, Number(e.target.value)))} className="h-10 border-2 font-bold rounded-xl" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-black uppercase opacity-60">Rotation</Label>
                                    <span className="text-[10px] font-bold text-primary">{rotation}°</span>
                                </div>
                                <Input type="number" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="h-10 border-2 font-bold rounded-xl" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase opacity-60">Opacity / Transparency</Label>
                                <Badge variant="secondary" className="font-black text-[10px]">{opacity[0]}%</Badge>
                            </div>
                            <Slider value={opacity} min={5} max={100} step={1} onValueChange={setOpacity} className="py-2" />
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-5 md:p-8 border-t">
                        {!watermarkedPdfUrl ? (
                            <Button 
                                className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-xl md:rounded-[1.5rem] group transition-all active:scale-95 disabled:opacity-50"
                                onClick={handleApplyWatermark}
                                disabled={isProcessing || !watermarkText}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="size-6 md:size-8 animate-spin" />
                                        <span className="uppercase text-sm md:text-base">PROCESSING...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <Copyright className="size-6 md:size-8 text-white group-hover:rotate-12 transition-transform" />
                                        <span className="uppercase tracking-tighter text-lg md:text-2xl">APPLY TO ALL</span>
                                    </div>
                                )}
                            </Button>
                        ) : (
                            <Button size="lg" className="w-full h-16 md:h-20 bg-green-600 hover:bg-green-700 text-lg md:text-2xl font-black rounded-xl md:rounded-[1.5rem] shadow-2xl active:scale-95 transition-all group" onClick={handleDownload}>
                                <Download className="mr-3 md:mr-4 size-6 md:size-8 group-hover:translate-y-1 transition-transform" /> SAVE PDF
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>

            {/* Workspace: Live Preview */}
            <div className="lg:col-span-8">
                <Card className="overflow-hidden glass-card border-none shadow-2xl relative rounded-2xl md:rounded-[3rem]">
                    <CardHeader className="bg-muted/30 border-b p-4 md:p-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="size-4 text-primary" />
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live HD Document Preview</CardTitle>
                        </div>
                        {watermarkedPdfUrl && (
                             <div className="flex items-center gap-1.5 text-green-600">
                                <CheckCircle2 className="size-3 md:size-4" />
                                <span className="text-[8px] md:text-[10px] font-black uppercase">Ready</span>
                             </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-6 md:p-12 lg:p-16 flex flex-col items-center justify-center min-h-[450px] md:min-h-[650px] bg-slate-200 dark:bg-slate-900 shadow-inner overflow-hidden">
                        {isGeneratingPreview ? (
                            <div className="flex flex-col items-center gap-6 text-center">
                                <div className="relative">
                                    <Loader2 className="size-16 md:size-24 text-primary opacity-20 animate-spin stroke-[3]" />
                                    <Eye className="absolute inset-0 m-auto size-6 md:size-8 text-primary animate-pulse" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Rendering Page 1...</p>
                            </div>
                        ) : originalPageImage ? (
                            <div className="relative group w-full max-w-[500px] shadow-3xl border-4 md:border-8 border-white bg-white rounded-sm animate-in zoom-in-95 duration-500 overflow-hidden">
                                <img src={originalPageImage} alt="Preview" className="w-full h-auto block" />
                                
                                {/* FLOATING WATERMARK PREVIEW OVERLAY */}
                                <div 
                                    className="absolute inset-0 z-10 select-none overflow-hidden flex items-center justify-center pointer-events-none"
                                    style={{ padding: '20px' }}
                                >
                                    <div style={getPreviewStyle()}>
                                        {watermarkText}
                                    </div>
                                </div>
                                
                                <div className="absolute top-2 right-2 opacity-20">
                                    <Badge variant="outline" className="text-[7px] border-black font-black uppercase">PAGE 1 VIEW</Badge>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 opacity-30">
                                <UploadCloud className="size-20" />
                                <p className="text-xs font-black uppercase">Upload a document to see preview</p>
                            </div>
                        )}
                        
                        {!watermarkedPdfUrl && originalPageImage && (
                            <div className="mt-8 flex items-center gap-3 px-6 py-3 bg-black/70 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl z-40">
                                <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" /> 
                                Real-time Studio Sync Active
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-white dark:bg-slate-950 border-t p-5 md:p-8 flex justify-center gap-6 md:gap-12">
                         <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            <ShieldCheck className="size-4 text-green-500" /> SECURE RAM
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            <Zap className="size-4 text-yellow-500" /> 300 DPI RENDER
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
