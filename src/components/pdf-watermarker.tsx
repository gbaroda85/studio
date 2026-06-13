
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect, useCallback } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts, PDFName } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
    UploadCloud, 
    Download, 
    Copyright, 
    Settings2, 
    Eye, 
    ShieldCheck, 
    Zap, 
    RefreshCcw, 
    Type, 
    RotateCw, 
    Sparkles,
    CheckCircle2,
    Palette,
    X,
    Monitor,
    Bold,
    Italic,
    Layers,
    ImageIcon,
    Plus,
    LayoutGrid,
    Trash2,
    Move,
    SearchCode,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from './ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// STABLE WORKER CONFIG
const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
}

type WatermarkType = 'text' | 'image';
type WatermarkPosition = 
    | 'top-left' | 'top-center' | 'top-right' 
    | 'center-left' | 'center-center' | 'center-right' 
    | 'bottom-left' | 'bottom-center' | 'bottom-right';

const POSITIONS: WatermarkPosition[] = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center-center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right'
];

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i}`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : { r: 0.5, g: 0.5, b: 0.5 };
}

export default function PdfWatermarker() {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [wType, setWType] = useState<WatermarkType>('text');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [imageWatermarkSrc, setImageWatermarkSrc] = useState<string | null>(null);
  const [position, setPosition] = useState<WatermarkPosition>('center-center');
  const [opacity, setOpacity] = useState([30]);
  const [fontSize, setFontSize] = useState(60);
  const [imageScale, setImageScale] = useState([30]);
  const [rotation, setRotation] = useState([45]);
  const [margin, setMargin] = useState([40]);
  
  const [textColor, setTextColor] = useState("#808080");
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState<string | null>(null);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [renderingProgress, setRenderingProgress] = useState(0);
  const [pageSize, setPageSize] = useState({ width: 595, height: 842 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageWatermarkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
        if(watermarkedPdfUrl) URL.revokeObjectURL(watermarkedPdfUrl);
    }
  }, [watermarkedPdfUrl]);

  const handleFileChange = async (file: File | null) => {
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setWatermarkedPdfUrl(null);
      setPreviewPages([]);
      setIsGeneratingPreview(true);
      setRenderingProgress(0);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ 
            data: new Uint8Array(arrayBuffer),
            cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
            cMapPacked: true
        });
        const pdf = await loadingTask.promise;
        const count = pdf.numPages;

        if (count > 0) {
            const firstPage = await pdf.getPage(1);
            const viewport = firstPage.getViewport({ scale: 1 });
            setPageSize({ width: viewport.width, height: viewport.height });
        }
        
        const imgs: string[] = [];
        const pagesToRender = Math.min(count, 10); 

        for (let i = 1; i <= pagesToRender; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, canvas.width, canvas.height);
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                imgs.push(canvas.toDataURL('image/jpeg', 0.85));
            }
            setRenderingProgress(Math.round((i / pagesToRender) * 100));
        }
        setPreviewPages(imgs);
      } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load PDF.' });
      } finally {
        setIsGeneratingPreview(false);
      }
    } else if (file) {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a PDF.' });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const handleImageWatermarkUpload = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setImageWatermarkSrc(ev.target?.result as string);
              setWType('image');
          };
          reader.readAsDataURL(file);
      }
  };

  const handleApplyWatermark = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);

    try {
        const existingPdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
        
        let font;
        if (wType === 'text') {
            const variant = (isBold && isItalic) ? StandardFonts.HelveticaBoldOblique : 
                           isBold ? StandardFonts.HelveticaBold : 
                           isItalic ? StandardFonts.HelveticaOblique : StandardFonts.Helvetica;
            font = await pdfDoc.embedFont(variant);
        }

        let embeddedImage: any;
        let imageDims = { width: 0, height: 0 };
        if (wType === 'image' && imageWatermarkSrc) {
            const imgBuffer = await fetch(imageWatermarkSrc).then(r => r.arrayBuffer());
            embeddedImage = imageWatermarkSrc.startsWith('data:image/png') ? await pdfDoc.embedPng(imgBuffer) : await pdfDoc.embedJpg(imgBuffer);
            imageDims = { width: embeddedImage.width, height: embeddedImage.height };
        }

        const rgbColor = hexToRgb(textColor);
        const rotDeg = -rotation[0]; 
        const rad = (rotDeg * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const op = opacity[0] / 100;
        const curMargin = margin[0];

        const pages = pdfDoc.getPages();
        for (const page of pages) {
            const { width, height } = page.getSize();
            const pageRot = page.getRotation().angle;
            
            const isSideways = pageRot === 90 || pageRot === 270;
            const vw = isSideways ? height : width;
            const vh = isSideways ? width : height;

            let tw = 0, th = 0;
            if (wType === 'text' && font) {
                tw = font.widthOfTextAtSize(watermarkText, fontSize);
                th = font.heightAtSize(fontSize);
            } else if (embeddedImage) {
                const aspect = imageDims.height / imageDims.width;
                tw = (imageScale[0] / 100) * vw;
                th = tw * aspect;
            }

            let vcx, vcy;
            switch (position) {
                case 'top-left': vcx = curMargin + tw/2; vcy = curMargin + th/2; break;
                case 'top-center': vcx = vw / 2; vcy = curMargin + th/2; break;
                case 'top-right': vcx = vw - curMargin - tw/2; vcy = curMargin + th/2; break;
                case 'center-left': vcx = curMargin + tw/2; vcy = vh / 2; break;
                case 'center-center': vcx = vw / 2; vcy = vh / 2; break;
                case 'center-right': vcx = vw - curMargin - tw/2; vcy = vh / 2; break;
                case 'bottom-left': vcx = curMargin + tw/2; vcy = vh - curMargin - th/2; break;
                case 'bottom-center': vcx = vw / 2; vcy = vh - curMargin - th/2; break;
                case 'bottom-right': vcx = vw - curMargin - tw/2; vcy = vh - curMargin - th/2; break;
                default: vcx = vw/2; vcy = vh/2;
            }

            let lcx, lcy;
            if (pageRot === 0) { lcx = vcx; lcy = vh - vcy; }
            else if (pageRot === 90) { lcx = vcy; lcy = vcx; }
            else if (pageRot === 180) { lcx = vw - vcx; lcy = vcy; }
            else if (pageRot === 270) { lcx = vh - vcy; lcy = vw - vcx; }
            else { lcx = vcx; lcy = vh - vcy; }

            const dx = lcx - (tw/2 * cos) + (th/2 * sin);
            const dy = lcy - (tw/2 * sin) - (th/2 * cos);

            if (wType === 'text') {
                page.drawText(watermarkText, {
                    x: dx, y: dy, font, size: fontSize,
                    color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
                    opacity: op, rotate: degrees(rotDeg)
                });
            } else if (embeddedImage) {
                page.drawImage(embeddedImage, {
                    x: dx, y: dy, width: tw, height: th,
                    opacity: op, rotate: degrees(rotDeg)
                });
            }
        }

        const catalog = pdfDoc.catalog;
        catalog.set(PDFName.of('ViewerPreferences'), pdfDoc.context.obj({
            FitWindow: true,
            CenterWindow: true,
            DisplayDocTitle: true
        }));

        const finalPdfBytes = await pdfDoc.save();
        const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
        setWatermarkedPdfUrl(URL.createObjectURL(blob));
        
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        toast({ title: "Success", description: "Watermark applied to all pages." });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to process PDF.' });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!watermarkedPdfUrl || !pdfFile) return;
    const link = document.createElement('a');
    link.href = watermarkedPdfUrl;
    const originalName = pdfFile.name.replace('.pdf', '');
    link.download = `Watermarked_${originalName}.pdf`;
    link.click();
  }

  const resetState = () => {
      setPdfFile(null);
      setPreviewPages([]);
      setWatermarkedPdfUrl(null);
      setWatermarkText('CONFIDENTIAL');
      setImageWatermarkSrc(null);
      setOpacity([30]);
      setFontSize(60);
      setRotation([45]);
      setMargin([40]);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getPreviewStyle = (): React.CSSProperties => {
      const containerWidth = 550; 
      const scale = containerWidth / pageSize.width;
      
      const styles: React.CSSProperties = {
          position: 'absolute',
          pointerEvents: 'none',
          color: textColor,
          opacity: opacity[0] / 100,
          fontSize: `${fontSize * scale}px`,
          fontWeight: isBold ? '900' : '500',
          fontStyle: isItalic ? 'italic' : 'normal',
          textAlign: 'center',
          transition: 'all 0.1s linear',
          zIndex: 50,
          whiteSpace: 'nowrap',
          transformOrigin: 'center center'
      };

      const m = `${(margin[0] / pageSize.width) * 100}%`; 
      
      switch (position) {
          case 'top-left': styles.top = m; styles.left = m; styles.transform = `rotate(${-rotation[0]}deg)`; break;
          case 'top-center': styles.top = m; styles.left = '50%'; styles.transform = `translate(-50%, 0) rotate(${-rotation[0]}deg)`; break;
          case 'top-right': styles.top = m; styles.right = m; styles.transform = `rotate(${-rotation[0]}deg)`; break;
          case 'center-left': styles.top = '50%'; styles.left = m; styles.transform = `translate(0, -50%) rotate(${-rotation[0]}deg)`; break;
          case 'center-center': styles.top = '50%'; styles.left = '50%'; styles.transform = `translate(-50%, -50%) rotate(${-rotation[0]}deg)`; break;
          case 'center-right': styles.top = '50%'; styles.right = m; styles.transform = `translate(0, -50%) rotate(${-rotation[0]}deg)`; break;
          case 'bottom-left': styles.bottom = m; styles.left = m; styles.transform = `rotate(${-rotation[0]}deg)`; break;
          case 'bottom-center': styles.bottom = m; styles.left = '50%'; styles.transform = `translate(-50%, 0) rotate(${-rotation[0]}deg)`; break;
          case 'bottom-right': styles.bottom = m; styles.right = m; styles.transform = `rotate(${-rotation[0]}deg)`; break;
      }
      return styles;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 px-4 pb-24">
      <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500 mb-4 no-print">
          <div className="mx-auto mb-2 grid size-16 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-xl relative">
              <Copyright className="size-8" />
              <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  <Sparkles className="size-2.5" />
              </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
              PDF <span className="text-gradient-hero">Watermark Studio</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
              Secure documents with professional text or image overlays. <br/>100% Private local RAM mapping.
          </p>
      </div>

      {!pdfFile ? (
        <Card
            className={cn(
                "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 cursor-pointer select-none",
                isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
            )}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <CardHeader className="bg-muted/30 border-b p-6 text-center">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
            </CardHeader>
            <CardContent className="p-10 md:p-12">
                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-10 md:p-16 flex flex-col items-center justify-center space-y-6 bg-muted/30 group relative">
                    <div className="relative">
                        <UploadCloud className="size-14 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="text-center px-4">
                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop PDF to begin</p>
                        <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">100% Private local processing.</p>
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
            </CardContent>
            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                <div className="flex items-center gap-1.5"><Eye className="size-3 text-primary" /> LIVE PREVIEW</div>
                <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-purple-500" /> PRO OVERLAYS</div>
            </CardFooter>
        </Card>
      ) : (
        <div className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in duration-500">
            {/* Sidebar: Controls */}
            <div className="lg:col-span-5 space-y-6 no-print">
                <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-950 transition-all hover:border-primary/30 h-full flex flex-col">
                    <CardHeader className="bg-primary/5 border-b p-4 md:p-6">
                        <CardTitle className="text-base md:text-lg font-black uppercase tracking-tighter flex items-center gap-3 text-primary">
                            <Palette className="size-5 text-primary" /> Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                        <Tabs value={wType} onValueChange={(v) => setWType(v as WatermarkType)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-11 bg-muted p-1 rounded-xl border-2 mb-6">
                                <TabsTrigger value="text" className="font-bold text-[9px] uppercase"><Type className="size-3 mr-1.5" /> Text</TabsTrigger>
                                <TabsTrigger value="image" className="font-bold text-[9px] uppercase"><ImageIcon className="size-3 mr-1.5" /> Image</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="text" className="space-y-6 m-0 animate-in fade-in duration-300">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase opacity-60">Watermark Text</Label>
                                    <Input value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="h-12 text-lg font-bold border-2 rounded-xl bg-muted/20" placeholder="CONFIDENTIAL" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase opacity-60">Text Style</Label>
                                        <div className="flex gap-1">
                                            <Button variant="outline" size="sm" className={cn("h-8 flex-1 rounded-lg border-2", isBold && "bg-primary/10 border-primary text-primary")} onClick={() => setIsBold(!isBold)}><Bold className="size-3" /></Button>
                                            <Button variant="outline" size="sm" className={cn("h-8 flex-1 rounded-lg border-2", isItalic && "bg-primary/10 border-primary text-primary")} onClick={() => setIsItalic(!isItalic)}><Italic className="size-3" /></Button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase opacity-60">Color</Label>
                                        <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-lg border-2 shadow-inner">
                                            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="size-6 rounded-md cursor-pointer border-none bg-transparent" />
                                            <span className="text-[8px] font-black uppercase font-mono">{textColor}</span>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="image" className="space-y-6 m-0 animate-in fade-in duration-300">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase opacity-60">Watermark Image</Label>
                                    {!imageWatermarkSrc ? (
                                        <Button variant="outline" className="w-full h-16 border-2 border-dashed rounded-2xl flex flex-col gap-1" onClick={() => imageWatermarkInputRef.current?.click()}>
                                            <UploadCloud className="size-5 text-muted-foreground" />
                                            <span className="text-[9px] font-black uppercase opacity-40">Upload PNG Logo</span>
                                        </Button>
                                    ) : (
                                        <div className="relative group">
                                            <div className="aspect-video bg-muted/30 rounded-2xl border-2 flex items-center justify-center p-4 shadow-inner">
                                                <img src={imageWatermarkSrc} alt="watermark" className="max-h-full object-contain" />
                                            </div>
                                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" onClick={() => setImageWatermarkSrc(null)}><Trash2 className="size-3.5"/></Button>
                                        </div>
                                    )}
                                    <input ref={imageWatermarkInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageWatermarkUpload} />
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t-2 border-dashed">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <LayoutGrid className="size-3" /> Position
                                </Label>
                                <div className="grid grid-cols-3 gap-1 p-2 bg-muted/20 border-2 border-dashed rounded-xl w-fit mx-auto">
                                    {POSITIONS.map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => setPosition(pos)}
                                            className={cn(
                                                "size-8 rounded-md border-2 transition-all flex items-center justify-center relative",
                                                position === pos ? "bg-primary border-primary text-white shadow-md scale-105" : "bg-white/50 border-border hover:border-primary/40"
                                            )}
                                            title={pos}
                                        >
                                            <div className={cn("size-2 rounded-full", position === pos ? "bg-white" : "bg-muted-foreground/20")} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                 <div className="space-y-3">
                                    <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Opacity</Label><span className="text-[10px] font-bold text-primary">{opacity[0]}%</span></div>
                                    <Slider value={opacity} min={5} max={100} step={1} onValueChange={setOpacity} />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Rotation</Label><span className="text-[10px] font-bold text-primary">{rotation[0]}°</span></div>
                                    <Slider value={rotation} min={-180} max={180} step={1} onValueChange={setRotation} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t-2 border-dashed">
                             <div className="space-y-2">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-[10px] font-black uppercase opacity-60">{wType === 'text' ? 'Font Size' : 'Scale %'}</Label>
                                    <Badge variant="secondary" className="font-mono text-[9px] h-5">{wType === 'text' ? fontSize : imageScale[0]}</Badge>
                                </div>
                                <Input 
                                    type="number" 
                                    value={wType === 'text' ? fontSize : imageScale[0]} 
                                    onChange={(e) => wType === 'text' ? setFontSize(Number(e.target.value)) : setImageScale([Number(e.target.value)])} 
                                    className="h-10 border-2 font-bold rounded-xl text-center shadow-inner" 
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60 flex items-center gap-2">
                                        <Move className="size-3" /> Corner Margin
                                    </Label>
                                    <Badge variant="secondary" className="font-mono text-[9px] h-5">{margin[0]}pt</Badge>
                                </div>
                                <Slider value={margin} min={0} max={200} step={1} onValueChange={setMargin} />
                            </div>
                        </div>

                        <div className="p-4 bg-green-500/5 rounded-[1.5rem] border-2 border-green-500/10 flex gap-4 shadow-sm mt-4">
                            <ShieldCheck className="size-6 text-green-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">Industrial Secure</p>
                                <p className="text-[8px] font-medium text-muted-foreground leading-relaxed mt-0.5 uppercase">Watermarks are hard-encoded into the PDF structure.</p>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="p-6 bg-muted/10 border-t flex flex-col gap-3">
                         {!watermarkedPdfUrl ? (
                            <Button 
                                className="magic-button w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl group transition-all active:scale-95 disabled:opacity-50"
                                onClick={handleApplyWatermark}
                                disabled={isProcessing || (wType === 'image' && !imageWatermarkSrc)}
                            >
                                <StarIcons />
                                {isProcessing ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="size-6 animate-spin" />
                                        <span className="uppercase text-sm tracking-tighter">RENDERING...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Copyright className="size-6 group-hover:rotate-12 transition-transform" />
                                        <span className="uppercase tracking-tighter">APPLY WATERMARK</span>
                                    </div>
                                )}
                            </Button>
                        ) : (
                            <div className="space-y-3 w-full animate-in zoom-in-95">
                                <Button size="lg" className="magic-button magic-button-success w-full h-16 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 text-lg font-black rounded-xl shadow-2xl active:scale-95 transition-all group" onClick={handleDownload}>
                                    <StarIcons />
                                    <Download className="mr-3 size-6 group-hover:translate-y-1 transition-transform" /> 
                                    <span className="uppercase tracking-tighter">SAVE WATERMARKED PDF</span>
                                </Button>
                                <Button variant="outline" onClick={resetState} className="w-full h-11 border-2 font-black uppercase text-[10px] rounded-xl hover:bg-destructive/5 hover:text-destructive"><RefreshCcw className="size-3 mr-2" /> Start Over</Button>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>

            {/* RIGHT: HD VIEWPORT */}
            <div className="lg:col-span-7 h-full flex flex-col no-print">
                <Card className="overflow-hidden glass-card border-none shadow-2xl relative rounded-[3rem] h-[650px] lg:h-[850px] flex flex-col">
                    <CardHeader className="bg-muted/30 border-b p-5 md:p-7 flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Eye className="size-4 text-primary" />
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Studio Viewport</CardTitle>
                        </div>
                        {watermarkedPdfUrl && (
                             <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-lg animate-pulse uppercase">RENDER READY</Badge>
                        )}
                    </CardHeader>
                    <CardContent className="p-0 bg-slate-200 dark:bg-slate-900 shadow-inner overflow-hidden relative flex-1 flex flex-col">
                        <ScrollArea className="flex-1 w-full h-full p-4 md:p-12 lg:p-20">
                            <div className="flex flex-col items-center gap-16 pb-20">
                                {isGeneratingPreview ? (
                                    <div className="flex flex-col items-center gap-6 text-center py-40">
                                        <div className="relative">
                                            <Loader2 className="size-20 md:size-24 text-primary opacity-20 animate-spin stroke-[3]" />
                                            <Monitor className="absolute inset-0 m-auto h-10 w-10 text-primary/40 animate-pulse" />
                                        </div>
                                        <div className="space-y-3 w-full max-w-[280px]">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Rendering Page Samples...</p>
                                            <Progress value={renderingProgress} className="h-1.5 shadow-inner" />
                                        </div>
                                    </div>
                                ) : previewPages.length > 0 ? (
                                    previewPages.map((src, i) => (
                                        <div key={i} className="relative group w-full max-w-[550px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-4 md:border-[12px] border-white bg-white rounded-sm animate-in slide-in-from-bottom-6 duration-700 overflow-hidden">
                                            <img src={src} alt={`P${i+1}`} className="w-full h-auto block" />
                                            
                                            {/* LIVE OVERLAY PREVIEW */}
                                            <div className="absolute inset-0 z-10 select-none overflow-hidden pointer-events-none p-1">
                                                <div style={getPreviewStyle()}>
                                                    {wType === 'text' ? (
                                                        <span>{watermarkText}</span>
                                                    ) : imageWatermarkSrc ? (
                                                        <img 
                                                            src={imageWatermarkSrc} 
                                                            alt="preview" 
                                                            style={{ width: `${(imageScale[0] / 100) * 550}px`, height: 'auto', display: 'block' }} 
                                                        />
                                                    ) : null}
                                                </div>
                                            </div>
                                            
                                            <div className="absolute top-2 right-2 opacity-20 flex items-center gap-1.5">
                                                <Badge variant="outline" className="text-[7px] border-black font-black uppercase">PAGE {i+1} PREVIEW</Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-40 opacity-20 gap-6">
                                        <SearchCode className="size-32" />
                                        <div className="space-y-1 text-center">
                                            <p className="text-xl font-black uppercase tracking-widest">Waiting for Input</p>
                                            <p className="text-[10px] font-bold">Select a file to unlock visual watermark studio</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <ScrollBar />
                        </ScrollArea>
                        
                        {previewPages.length > 0 && (
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-3 bg-black/80 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-3xl z-40 transition-all hover:scale-105">
                                <Sparkles className="size-4 text-primary animate-pulse" /> Real-time Studio Mapping Active
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 shrink-0">
                         <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM PROCESSING</div>
                        <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> 300 DPI RENDER</div>
                    </CardFooter>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}

