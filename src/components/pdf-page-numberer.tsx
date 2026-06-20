"use client"

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts, PDFName } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
    UploadCloud, 
    Download, 
    Hash, 
    Layout, 
    RefreshCcw, 
    Sparkles,
    CheckCircle2,
    Palette,
    X,
    ShieldCheck,
    Zap,
    Eye,
    Monitor,
    ChevronLeft,
    ChevronRight,
    Type,
    Layers,
    Bold,
    Italic,
    Move,
    Loader2,
    ListFilter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from './ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import confetti from 'canvas-confetti';

const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
}

type PageNumberPosition = 
    | 'top-left' | 'top-center' | 'top-right' 
    | 'center-left' | 'center-center' | 'center-right' 
    | 'bottom-left' | 'bottom-center' | 'bottom-right';

type NumberStyle = 'arabic' | 'roman-upper' | 'roman-lower' | 'alpha-upper' | 'alpha-lower';

const QUICK_FORMATS = [
    { label: 'Page {page}', display: 'Page 1', value: 'Page {page}' },
    { label: '{page} / {total}', display: '1 / 10', value: '{page} / {total}' },
    { label: '- {page} -', display: '- 1 -', value: '- {page} -' },
    { label: '{page}', display: '1', value: '{page}' },
];

const NUMBER_STYLES = [
    { label: '1, 2, 3 (Arabic)', value: 'arabic' },
    { label: 'I, II, III (Roman Upper)', value: 'roman-upper' },
    { label: 'i, ii, iii (Roman Lower)', value: 'roman-lower' },
    { label: 'A, B, C (Alpha Upper)', value: 'alpha-upper' },
    { label: 'a, b, c (Alpha Lower)', value: 'alpha-lower' },
];

const POSITIONS: PageNumberPosition[] = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center-center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right'
];

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i} pointer-events-none`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

function romanize(num: number): string {
    if (isNaN(num)) return "";
    const digits = String(+num).split("");
    const key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"];
    let roman = "";
    let i = 3;
    while (i--) {
        const val = digits.pop();
        if (val !== undefined) {
            roman = (key[+val + (i * 10)] || "") + roman;
        }
    }
    return Array(+digits.join("") + 1).join("M") + roman;
}

function alphabetize(num: number): string {
    let s = "";
    while (num > 0) {
        let m = (num - 1) % 26;
        s = String.fromCharCode(65 + m) + s;
        num = Math.floor((num - m) / 26);
    }
    return s;
}

function formatWithStyle(num: number, style: NumberStyle): string {
    switch (style) {
        case 'roman-upper': return romanize(num) || String(num);
        case 'roman-lower': return romanize(num).toLowerCase() || String(num);
        case 'alpha-upper': return alphabetize(num);
        case 'alpha-lower': return alphabetize(num).toLowerCase();
        default: return String(num);
    }
}

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
}

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
            }
        } else {
            const page = parseInt(trimmedPart, 10);
            if (!isNaN(page) && page > 0 && page <= maxPage) {
                result.add(page);
            }
        }
    }
    return Array.from(result).sort((a, b) => a - b);
}

export default function PdfPageNumberer() {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [renderingProgress, setRenderingProgress] = useState(0);
  
  // Custom Controls
  const [position, setPosition] = useState<PageNumberPosition>('bottom-right');
  const [format, setFormat] = useState('Page {page} of {total}');
  const [numberStyle, setNumberStyle] = useState<NumberStyle>('arabic');
  const [fontSize, setFontSize] = useState(12);
  const [margin, setMargin] = useState([25]);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [pageRange, setPageRange] = useState<'all' | 'custom'>('all');
  const [customRange, setCustomRange] = useState('');
  
  const [numberedPdfUrl, setNumberedPdfUrl] = useState<string | null>(null);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [totalPagesPreview, setTotalPagesPreview] = useState(0);
  const [pageSize, setPageSize] = useState({ width: 595, height: 842 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
        if(numberedPdfUrl) URL.revokeObjectURL(numberedPdfUrl);
    }
  }, [numberedPdfUrl]);

  const handleFileChange = async (file: File | null) => {
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setNumberedPdfUrl(null);
      setPreviewPages([]);
      setIsGeneratingPreview(true);
      setRenderingProgress(0);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ 
            data: new Uint8Array(arrayBuffer),
            cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/standard_fonts/`
        });
        const pdf = await loadingTask.promise;
        const count = pdf.numPages;
        setTotalPagesPreview(count);

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

  const handleAddPageNumbers = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);

    try {
        const existingPdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
        
        let fontVariant = StandardFonts.Helvetica;
        if (isBold && isItalic) fontVariant = StandardFonts.HelveticaBoldOblique;
        else if (isBold) fontVariant = StandardFonts.HelveticaBold;
        else if (isItalic) fontVariant = StandardFonts.HelveticaOblique;

        const font = await pdfDoc.embedFont(fontVariant);
        const rgbColor = hexToRgb(textColor);
        
        const pdfPages = pdfDoc.getPages();
        const totalPages = pdfPages.length;
        const currentMargin = margin[0];

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

        const formattedTotal = formatWithStyle(totalPages, numberStyle);

        for (const pageNum of pagesToNumber) {
            const pageIndex = pageNum - 1;
            const page = pdfPages[pageIndex];
            const { width, height } = page.getSize();
            
            const formattedPageNum = formatWithStyle(pageNum, numberStyle);
            const pageNumberText = format
                .replace('{page}', formattedPageNum)
                .replace('{total}', formattedTotal);
            
            const textWidth = font.widthOfTextAtSize(pageNumberText, fontSize);
            const textHeight = font.heightAtSize(fontSize);
            
            let x, y;

            switch (position) {
                case 'top-left': x = currentMargin; y = height - currentMargin - textHeight; break;
                case 'top-center': x = (width - textWidth) / 2; y = height - currentMargin - textHeight; break;
                case 'top-right': x = width - textWidth - currentMargin; y = height - currentMargin - textHeight; break;
                
                case 'center-left': x = currentMargin; y = (height - textHeight) / 2; break;
                case 'center-center': x = (width - textWidth) / 2; y = (height - textHeight) / 2; break;
                case 'center-right': x = width - textWidth - currentMargin; y = (height - textHeight) / 2; break;
                
                case 'bottom-left': x = currentMargin; y = currentMargin; break;
                case 'bottom-right': x = width - textWidth - currentMargin; y = currentMargin; break;
                case 'bottom-center':
                default:
                    x = (width - textWidth) / 2;
                    y = currentMargin;
                    break;
            }

            page.drawText(pageNumberText, {
                x, y, font, size: fontSize,
                color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
            });
        }

        const catalog = pdfDoc.catalog;
        catalog.set(PDFName.of('ViewerPreferences'), pdfDoc.context.obj({
            FitWindow: true,
            CenterWindow: true,
            DisplayDocTitle: true
        }));

        const newPdfBytes = await pdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setNumberedPdfUrl(url);
        
        confetti({
            particleCount: 150, spread: 70, origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#ffffff']
        });

        toast({title: "Success!", description: `Page numbers added to ${pagesToNumber.length} pages.`});
    } catch (error) {
        console.error(error);
        toast({variant: 'destructive', title: 'Error', description: 'Failed to process document.'});
    } finally {
        setIsProcessing(false);
    }
  }
  
  const handleDownload = () => {
    if (!numberedPdfUrl || !pdfFile) return;
    const link = document.createElement('a');
    link.href = numberedPdfUrl;
    const originalName = pdfFile.name.replace('.pdf', '');
    link.download = `GR7-Tools-Numbered-${originalName}.pdf`;
    link.click();
  }

  const resetState = () => {
      setPdfFile(null);
      setPreviewPages([]);
      setNumberedPdfUrl(null);
      setTotalPagesPreview(0);
      setPageRange('all');
      setCustomRange('');
      setNumberStyle('arabic');
      setMargin([25]);
      setTextColor("#000000");
      setIsBold(true);
      setIsItalic(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const getPreviewStyle = (): React.CSSProperties => {
      const containerWidth = 550; 
      const scale = containerWidth / pageSize.width;
      
      const styles: React.CSSProperties = {
          position: 'absolute',
          pointerEvents: 'none',
          color: textColor,
          fontSize: `${fontSize * scale}px`,
          fontWeight: isBold ? '900' : '500',
          fontStyle: isItalic ? 'italic' : 'normal',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 50,
          padding: '2px'
      };

      const m = `${(margin[0] / pageSize.width) * 100}%`; 
      
      switch (position) {
          case 'top-left': styles.top = m; styles.left = m; break;
          case 'top-center': styles.top = m; styles.left = '50%'; styles.transform = 'translateX(-50%)'; break;
          case 'top-right': styles.top = m; styles.right = m; break;
          
          case 'center-left': styles.top = '50%'; styles.left = m; styles.transform = 'translateY(-50%)'; break;
          case 'center-center': styles.top = '50%'; styles.left = '50%'; styles.transform = 'translate(-50%, -50%)'; break;
          case 'center-right': styles.top = '50%'; styles.right = m; styles.transform = 'translateY(-50%)'; break;
          
          case 'bottom-left': styles.bottom = m; styles.left = m; break;
          case 'bottom-right': styles.bottom = m; styles.right = m; break;
          case 'bottom-center':
          default:
              styles.bottom = m; styles.left = '50%'; styles.transform = 'translateX(-50%)';
              break;
      }
      return styles;
  }
  
  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 px-4 pb-24">
      {!pdfFile ? (
        <Card
            className={cn(
                "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 dark:hover:shadow-primary/20 cursor-pointer select-none",
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
                <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-purple-500" /> PRO FORMATS</div>
            </CardFooter>
        </Card>
      ) : (
        <div className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in duration-500">
            {/* Sidebar: Controls */}
            <div className="lg:col-span-5 space-y-6 no-print">
                <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-950 transition-all hover:border-primary/30 h-full flex flex-col">
                    <CardHeader className="bg-primary/5 border-b p-4 md:p-6 text-left">
                        <CardTitle className="text-base md:text-lg font-black uppercase tracking-tighter flex items-center gap-3 text-primary">
                            <Palette className="size-5 text-primary" /> Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Layout className="size-3" /> Position
                                </Label>
                                <div className="grid grid-cols-3 gap-1 p-2 bg-muted/20 border-2 border-dashed rounded-xl w-fit mx-auto">
                                    {POSITIONS.map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => setPosition(pos)}
                                            className={cn(
                                                "size-8 rounded-md border-2 transition-all flex items-center justify-center relative",
                                                position === pos ? "bg-primary border-primary text-white shadow-md scale-105" : "bg-white/50 border-border hover:border-primary/40",
                                                "!ring-[3px] !ring-slate-950 dark:!ring-white"
                                            )}
                                            title={pos}
                                        >
                                            <div className={cn("size-1.5 rounded-full", position === pos ? "bg-white" : "bg-muted-foreground/30")} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase opacity-60">Text Style</Label>
                                    <div className="flex gap-1.5">
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed text-left">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60 flex items-center gap-2"><Type className="size-3" /> System</Label>
                                <Select value={numberStyle} onValueChange={(v) => setNumberStyle(v as NumberStyle)}>
                                    <SelectTrigger className="h-9 border-2 font-black rounded-lg bg-background text-[10px]"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-lg border-2 shadow-2xl">
                                        {NUMBER_STYLES.map(s => (
                                            <SelectItem key={s.value} value={s.value} className="font-bold py-2 uppercase text-[10px]">{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60 flex items-center gap-2"><Layers className="size-3" /> Format</Label>
                                <Select value={format} onValueChange={(v) => setFormat(v)}>
                                    <SelectTrigger className="h-9 border-2 font-black rounded-lg bg-background text-[10px]"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-lg border-2 shadow-2xl">
                                        {QUICK_FORMATS.map(f => (
                                            <SelectItem key={f.value} value={f.value} className="font-bold py-2 uppercase text-[10px]">{f.display}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Page Selection Area */}
                        <div className="space-y-4 pt-4 border-t border-dashed text-left">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-2">
                                <ListFilter className="size-3" /> Page Selection
                            </Label>
                            <Tabs value={pageRange} onValueChange={(v) => setPageRange(v as any)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 h-10 bg-muted/20 border-2 rounded-xl">
                                    <TabsTrigger value="all" className="text-[9px] font-black uppercase">All Pages</TabsTrigger>
                                    <TabsTrigger value="custom" className="text-[9px] font-black uppercase">Custom Range</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            {pageRange === 'custom' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2">
                                    <Input 
                                        value={customRange} 
                                        onChange={(e) => setCustomRange(e.target.value)} 
                                        placeholder="e.g. 1, 3-5, 8" 
                                        className="h-10 border-2 font-bold text-center rounded-xl shadow-inner text-xs" 
                                    />
                                    <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40 text-center">Example: 1, 3-5, 8</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed text-left">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60">Size (pt)</Label>
                                <Input type="number" value={fontSize} onChange={(e) => setFontSize(Math.max(6, Number(e.target.value)))} className="h-9 border-2 font-bold rounded-lg text-[10px] text-center" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60 flex items-center gap-1.5">
                                        <Move className="size-3" /> Margins
                                    </Label>
                                    <Badge variant="secondary" className="font-mono text-[9px] h-5">{margin[0]}pt</Badge>
                                </div>
                                <Slider value={margin} min={10} max={100} step={1} onValueChange={(v) => setMargin(v)} />
                            </div>
                        </div>

                        <div className="p-4 bg-green-500/5 rounded-xl border-2 border-green-500/10 flex gap-4 text-left">
                            <ShieldCheck className="size-6 text-green-600 shrink-0 mt-0.5" />
                            <p className="text-[9px] text-green-700 font-bold uppercase leading-tight">Numbers are hard-encoded into the PDF structure.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 md:p-6 border-t flex flex-col gap-3">
                        {!numberedPdfUrl ? (
                            <Button 
                                className="magic-button w-full h-14 md:h-16 text-base md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl group transition-all active:scale-95 disabled:opacity-50"
                                onClick={handleAddPageNumbers}
                                disabled={isProcessing || !format}
                            >
                                <StarIcons />
                                {isProcessing ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="size-6 md:size-7 animate-spin" />
                                        <span className="uppercase text-xs md:text-sm tracking-tighter">PROCESSING...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <Hash className="size-6 md:size-7 text-white group-hover:scale-125 transition-transform" />
                                        <span className="uppercase tracking-tighter text-sm md:text-base">APPLY NUMBERS</span>
                                    </div>
                                )}
                            </Button>
                        ) : (
                            <div className="space-y-3 w-full">
                                <Button 
                                    size="lg" 
                                    className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-16 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none w-full" 
                                    onClick={handleDownload}
                                >
                                    <div className="absolute left-4 w-0.5 h-6 md:h-8 bg-white/40 rounded-full" />
                                    <span className="flex-1 px-10 text-center tracking-widest text-[11px] md:text-xs uppercase">SAVE NUMBERED PDF</span>
                                    <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                        <Download className="size-6 md:size-8 group-hover:scale-110 transition-transform" />
                                        <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                                    </div>
                                </Button>
                                <Button variant="outline" onClick={resetState} className="w-full h-10 border-2 font-black uppercase text-[10px] rounded-xl hover:bg-destructive/5 hover:text-destructive"><RefreshCcw className="size-3" /> Start Over</Button>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>

            {/* Workspace: Live Preview */}
            <div className="lg:col-span-7 h-full flex flex-col no-print">
                <Card className="overflow-hidden glass-card border-none shadow-2xl relative rounded-[3rem] h-[600px] lg:h-[850px] flex flex-col">
                    <CardHeader className="bg-muted/30 border-b p-5 md:p-7 flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Eye className="size-4 text-primary" />
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live HD Studio View</CardTitle>
                        </div>
                        {numberedPdfUrl && (
                             <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-lg animate-pulse uppercase">PROCESSED</Badge>
                        )}
                    </CardHeader>
                    <CardContent className="p-0 bg-slate-200 dark:bg-slate-900 shadow-inner overflow-hidden relative flex-1 flex flex-col">
                        <ScrollArea className="flex-1 w-full h-full p-4 md:p-12 lg:p-20">
                            <div className="flex flex-col items-center gap-16 pb-20">
                                {isGeneratingPreview ? (
                                    <div className="flex flex-col items-center gap-6 text-center py-40">
                                        <div className="relative">
                                            <Loader2 className="size-20 md:size-24 text-primary opacity-20 animate-spin stroke-[3]" />
                                            <Monitor className="absolute inset-0 m-auto size-10 text-primary/40 animate-pulse" />
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
                                            
                                            <div className="absolute inset-0 z-10 select-none overflow-hidden pointer-events-none p-1">
                                                <div style={getPreviewStyle()}>
                                                    {format
                                                        .replace('{page}', formatWithStyle(i + 1, numberStyle))
                                                        .replace('{total}', formatWithStyle(totalPagesPreview, numberStyle))}
                                                </div>
                                            </div>
                                            
                                            <div className="absolute top-2 right-2 opacity-20 flex items-center gap-1.5">
                                                <Badge variant="outline" className="text-[7px] font-black uppercase border-black">PAGE {i+1} PREVIEW</Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-40 opacity-20 gap-6">
                                        <SearchCode className="size-32" />
                                        <div className="space-y-1 text-center">
                                            <p className="text-xl font-black uppercase tracking-widest">Waiting for Document</p>
                                            <p className="text-[10px] font-bold">Select a file to unlock visual numbering studio</p>
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
                         <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
                        <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> 300 DPI RENDER</div>
                    </CardFooter>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}
