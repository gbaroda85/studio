
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
    Palette,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [position, setPosition] = useState<WatermarkPosition>('diagonal-bottom-up');
  const [opacity, setOpacity] = useState([30]);
  const [fontSize, setFontSize] = useState(60);
  const [rotation, setRotation] = useState(-45); // CSS Degrees
  
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState<string | null>(null);
  const [originalPageImage, setOriginalPageImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
        if(watermarkedPdfUrl) URL.revokeObjectURL(watermarkedPdfUrl);
    }
  }, [watermarkedPdfUrl]);

  const handleFileChange = async (file: File | null) => {
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setWatermarkedPdfUrl(null);
      setOriginalPageImage(null);
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
        const pdfRotation = -rotation; 
        const rad = (pdfRotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        const centerXOffset = (textWidth / 2) * cos - (textHeight / 2) * sin;
        const centerYOffset = (textWidth / 2) * sin + (textHeight / 2) * cos;

        for (const page of pages) {
            const { width, height } = page.getSize();
            let targetCX, targetCY;
            const margin = 50; 

            if (position === 'center' || position.startsWith('diagonal')) {
                targetCX = width / 2;
                targetCY = height / 2;
            } else {
                switch (position) {
                    case 'top-left':
                        targetCX = margin + textWidth / 2;
                        targetCY = height - margin - textHeight / 2;
                        break;
                    case 'top-right':
                        targetCX = width - margin - textWidth / 2;
                        targetCY = height - margin - textHeight / 2;
                        break;
                    case 'bottom-left':
                        targetCX = margin + textWidth / 2;
                        targetCY = margin + textHeight / 2;
                        break;
                    case 'bottom-right':
                        targetCX = width - margin - textWidth / 2;
                        targetCY = margin + textHeight / 2;
                        break;
                    default:
                        targetCX = width / 2;
                        targetCY = height / 2;
                }
            }

            const x = targetCX! - centerXOffset;
            const y = targetCY! - centerYOffset;

            page.drawText(watermarkText, {
                x,
                y,
                font,
                size: fontSize,
                color: rgb(0.5, 0.5, 0.5),
                opacity: opacity[0] / 100,
                rotate: degrees(pdfRotation),
            });
        }

        const newPdfBytes = await pdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setWatermarkedPdfUrl(url);
        toast({ title: "Success!", description: "Watermark applied correctly." });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to process document.' });
    } finally {
        setIsProcessing(false);
    }
  }
  
  const handleDownload = () => {
    if (!watermarkedPdfUrl || !pdfFile) return;
    const link = document.createElement('a');
    link.href = watermarkedPdfUrl;
    const originalName = pdfFile.name.replace('.pdf', '');
    link.download = `GR7-Tools-Watermarked-${originalName}.pdf`;
    link.click();
  }

  const resetState = () => {
      setPdfFile(null);
      setOriginalPageImage(null);
      setWatermarkedPdfUrl(null);
      setWatermarkText('CONFIDENTIAL');
      setPosition('diagonal-bottom-up');
      setRotation(-45);
      if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const getPreviewStyle = () => {
      const styles: React.CSSProperties = {
          position: 'absolute',
          pointerEvents: 'none',
          color: 'rgba(0,0,0,0.5)', 
          opacity: opacity[0] / 100,
          fontSize: `${fontSize * 0.84}px`, 
          fontWeight: '900',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          transition: 'all(0.1s) ease-out',
          lineHeight: '1',
          zIndex: 40
      };

      if (position === 'center' || position.startsWith('diagonal')) {
          styles.top = '50%';
          styles.left = '50%';
          styles.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
      } else {
          const m = "8%";
          styles.transform = `rotate(${rotation}deg)`;
          switch (position) {
              case 'top-left': styles.top = m; styles.left = m; break;
              case 'top-right': styles.top = m; styles.right = m; break;
              case 'bottom-left': styles.bottom = m; styles.left = m; break;
              case 'bottom-right': styles.bottom = m; styles.right = m; break;
          }
      }
      return styles;
  }
  
  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 px-4">
      {/* Header Info - Same as Word to PDF */}
      <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
          <div className="mx-auto mb-2 grid size-16 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-xl relative">
              <Copyright className="size-8" />
              <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  <Sparkles className="size-2.5" />
              </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
              PDF <span className="text-gradient-hero">Watermark Pro</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
              Secure documents with professional text overlays. <br/>100% Private local RAM mapping.
          </p>
      </div>

      {!pdfFile ? (
        <Card
            className={cn(
                "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20",
                isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
            )}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <CardHeader className="bg-muted/30 border-b p-6 text-center">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
            </CardHeader>
            <CardContent className="p-10 md:p-12">
                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-10 md:p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group relative">
                    <div className="relative">
                        <UploadCloud className="size-14 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="text-center px-4">
                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter">Drop PDF to begin</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-2 font-bold opacity-60 uppercase">100% Private local processing.</p>
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
            </CardContent>
            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                <div className="flex items-center gap-1.5"><Eye className="size-3 text-primary" /> LIVE PREVIEW</div>
                <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-purple-500" /> PRO LAYOUTS</div>
            </CardFooter>
        </Card>
      ) : (
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start animate-in fade-in duration-500 pb-20">
            {/* Sidebar: Controls */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-950 transition-all hover:border-primary/30">
                    <CardHeader className="bg-primary/5 border-b p-5 md:p-6">
                        <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                            <Palette className="size-5 text-primary" /> Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-6 md:space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60 flex items-center gap-2 mb-2">
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
                            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60 flex items-center gap-2 mb-2">
                                <Maximize className="size-3" /> Position Preset
                            </Label>
                            <Select value={position} onValueChange={(v) => handlePositionChange(v as WatermarkPosition)}>
                                <SelectTrigger className="h-12 border-2 font-bold rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl border-2 shadow-2xl">
                                    <SelectItem value="diagonal-bottom-up" className="font-bold">Diagonal (Standard)</SelectItem>
                                    <SelectItem value="diagonal-top-down" className="font-bold">Diagonal (Reverse)</SelectItem>
                                    <SelectItem value="center" className="font-bold">Perfect Center</SelectItem>
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
                    <CardFooter className="bg-muted/10 p-5 md:p-8 border-t flex flex-col gap-3">
                        {!watermarkedPdfUrl ? (
                            <Button 
                                className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl md:rounded-[1.5rem] group transition-all active:scale-95 disabled:opacity-50"
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
                                        <span className="uppercase tracking-tighter text-lg md:text-2xl">APPLY WATERMARK</span>
                                    </div>
                                )}
                            </Button>
                        ) : (
                            <Button size="lg" className="w-full h-16 md:h-20 bg-green-600 hover:bg-green-700 text-lg md:text-2xl font-black rounded-xl md:rounded-[1.5rem] shadow-2xl active:scale-95 transition-all group" onClick={handleDownload}>
                                <Download className="mr-3 md:mr-4 size-6 md:size-8 group-hover:translate-y-1 transition-transform" /> SAVE PDF
                            </Button>
                        )}
                        <Button variant="ghost" onClick={resetState} className="w-full text-[10px] font-black uppercase tracking-widest h-10 hover:bg-destructive/5 hover:text-destructive">
                            <RefreshCcw className="mr-2 size-3" /> Change File
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Workspace: Live Preview */}
            <div className="lg:col-span-8 h-full">
                <Card className="overflow-hidden glass-card border-none shadow-2xl relative rounded-[2.5rem] h-full flex flex-col">
                    <CardHeader className="bg-muted/30 border-b p-4 md:p-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="size-4 text-primary" />
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live HD Preview</CardTitle>
                        </div>
                        {watermarkedPdfUrl && (
                             <div className="flex items-center gap-1.5 text-green-600 animate-in zoom-in-95">
                                <CheckCircle2 className="size-4" />
                                <span className="text-[10px] font-black uppercase">Ready</span>
                             </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-6 md:p-12 lg:p-16 flex flex-col items-center justify-center min-h-[450px] md:min-h-[650px] bg-slate-200 dark:bg-slate-900 shadow-inner overflow-hidden relative flex-1">
                        {isGeneratingPreview ? (
                            <div className="flex flex-col items-center gap-6 text-center">
                                <div className="relative">
                                    <Loader2 className="size-16 md:size-24 text-primary opacity-20 animate-spin stroke-[3]" />
                                    <Eye className="absolute inset-0 m-auto size-6 md:size-8 text-primary animate-pulse" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Rendering Page 1...</p>
                            </div>
                        ) : originalPageImage ? (
                            <div className="relative group w-full max-w-[500px] shadow-3xl border-4 md:border-8 border-white bg-white rounded-sm animate-in zoom-in-95 duration-300 overflow-hidden">
                                <img src={originalPageImage} alt="Preview" className="w-full h-auto block" />
                                
                                {/* FLOATING WATERMARK PREVIEW OVERLAY */}
                                <div className="absolute inset-0 z-10 select-none overflow-hidden pointer-events-none">
                                    <div style={getPreviewStyle()}>
                                        {watermarkText}
                                    </div>
                                </div>
                                
                                <div className="absolute top-2 right-2 opacity-20">
                                    <Badge variant="outline" className="text-[7px] border-black font-black uppercase">PAGE 1 VIEW</Badge>
                                </div>
                            </div>
                        ) : null}
                        
                        {!watermarkedPdfUrl && originalPageImage && (
                            <div className="mt-8 flex items-center gap-3 px-6 py-3 bg-black/70 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl z-40">
                                <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" /> 
                                Real-time Studio Sync Active
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-white dark:bg-slate-950 border-t p-5 md:p-8 flex justify-center gap-8">
                         <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            <ShieldCheck className="size-4 text-green-500" /> SECURE RAM
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            <Zap className="size-4 text-yellow-500" /> 300 DPI HD
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}
