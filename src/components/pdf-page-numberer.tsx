
"use client"

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
    UploadCloud, 
    Download, 
    Loader2, 
    NotebookPen, 
    Settings2, 
    Eye, 
    ShieldCheck, 
    Zap, 
    RefreshCcw, 
    Hash, 
    Layout, 
    Maximize, 
    Sparkles,
    CheckCircle2,
    Palette,
    AlignLeft,
    AlignCenter,
    AlignRight,
    X,
    FileText,
    SearchCode,
    ListFilter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from './ui/badge';

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

type PageNumberPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const FORMAT_PRESETS = [
    { label: 'Number Only (1)', value: '{page}' },
    { label: 'Dashes (- 1 -)', value: '- {page} -' },
    { label: 'Page 1', value: 'Page {page}' },
    { label: 'Page 1 of 10', value: 'Page {page} of {total}' },
];

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
                return [];
            }
        } else {
            const page = parseInt(trimmedPart, 10);
            if (!isNaN(page) && page > 0 && page <= maxPage) {
                result.add(page);
            } else if (trimmedPart !== '') {
                 return [];
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
  
  const [position, setPosition] = useState<PageNumberPosition>('bottom-center');
  const [format, setFormat] = useState('Page {page} of {total}');
  const [fontSize, setFontSize] = useState(12);
  const [pageRange, setPageRange] = useState('all');
  const [customRange, setCustomRange] = useState('');
  
  const [numberedPdfUrl, setNumberedPdfUrl] = useState<string | null>(null);
  const [originalPageImage, setOriginalPageImage] = useState<string | null>(null);
  const [totalPagesPreview, setTotalPagesPreview] = useState(0);

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
      setOriginalPageImage(null);
      setIsGeneratingPreview(true);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        setTotalPagesPreview(pdf.numPages);
        
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

  const handleAddPageNumbers = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);

    try {
        const existingPdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;
        const margin = 20; // Reduced margin to place numbers at the very last part of the page

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
                case 'top-left': x = margin; y = height - margin - fontSize; break;
                case 'top-center': x = (width - textWidth) / 2; y = height - margin - fontSize; break;
                case 'top-right': x = width - textWidth - margin; y = height - margin - fontSize; break;
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
      setOriginalPageImage(null);
      setNumberedPdfUrl(null);
      setTotalPagesPreview(0);
      setPageRange('all');
      setCustomRange('');
      if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const getPreviewStyle = () => {
      const styles: React.CSSProperties = {
          position: 'absolute',
          pointerEvents: 'none',
          color: '#000000',
          fontSize: `${fontSize * 0.8}px`,
          fontWeight: '900',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease-out',
          zIndex: 40
      };

      const m = "4%"; // Adjusted for real preview look
      switch (position) {
          case 'top-left': styles.top = m; styles.left = m; break;
          case 'top-center': styles.top = m; styles.left = '50%'; styles.transform = 'translateX(-50%)'; break;
          case 'top-right': styles.top = m; styles.right = m; break;
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
    <div className="w-full flex flex-col items-center justify-center gap-6 px-4">
      {/* Premium Header */}
      <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
          <div className="mx-auto mb-2 grid size-16 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-xl relative">
              <Hash className="size-8" />
              <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  <Sparkles className="size-2.5" />
              </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
              Add Page <span className="text-gradient-hero">Numbers Pro</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
              Professional positioning at the bottom edge. <br/>100% Private local RAM mapping.
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
                <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-purple-500" /> PRO FORMATS</div>
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
                                <ListFilter className="size-3" /> Quick Formats
                            </Label>
                            <Select value={format} onValueChange={setFormat}>
                                <SelectTrigger className="h-10 border-2 font-bold rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl border-2 shadow-2xl">
                                    {FORMAT_PRESETS.map(f => (
                                        <SelectItem key={f.value} value={f.value} className="font-bold py-2">{f.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-dashed">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60 flex items-center gap-2 mb-2">
                                <Layout className="size-3" /> Position on Page
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right'] as PageNumberPosition[]).map(pos => (
                                    <Button 
                                        key={pos} 
                                        variant={position === pos ? 'default' : 'outline'}
                                        onClick={() => setPosition(pos)}
                                        className={cn("h-10 text-[9px] font-black uppercase border-2 rounded-xl", position === pos ? "border-primary" : "")}
                                    >
                                        {pos.replace('-', ' ')}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-dashed">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60 flex items-center gap-2 mb-2">
                                <NotebookPen className="size-3" /> Custom Format
                            </Label>
                            <Input 
                                value={format} 
                                onChange={(e) => setFormat(e.target.value)}
                                placeholder="e.g. Page {page} of {total}"
                                className="h-10 border-2 font-bold rounded-xl bg-background shadow-inner"
                            />
                            <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-50">Variables: {'{page}'}, {'{total}'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase opacity-60">Font Size</Label>
                                <Input type="number" value={fontSize} onChange={(e) => setFontSize(Math.max(6, Number(e.target.value)))} className="h-10 border-2 font-bold rounded-xl" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase opacity-60">Range</Label>
                                <Select value={pageRange} onValueChange={setPageRange}>
                                    <SelectTrigger className="h-10 border-2 font-bold rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl border-2">
                                        <SelectItem value="all" className="font-bold">All Pages</SelectItem>
                                        <SelectItem value="custom" className="font-bold">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {pageRange === 'custom' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2">
                                <Label className="text-[10px] font-black uppercase opacity-60">Custom Range</Label>
                                <Input value={customRange} onChange={(e) => setCustomRange(e.target.value)} placeholder="e.g. 1, 3-5, 8" className="h-10 border-2 font-bold rounded-xl" />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-5 md:p-8 border-t flex flex-col gap-3">
                        {!numberedPdfUrl ? (
                            <Button 
                                className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-xl md:rounded-[1.5rem] group transition-all active:scale-95 disabled:opacity-50"
                                onClick={handleAddPageNumbers}
                                disabled={isProcessing || !format}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="size-6 md:size-8 animate-spin" />
                                        <span className="uppercase text-sm md:text-base">NUMBERING...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <Hash className="size-6 md:size-8 text-white group-hover:scale-125 transition-transform" />
                                        <span className="uppercase tracking-tighter text-lg md:text-2xl">APPLY NUMBERS</span>
                                    </div>
                                )}
                            </Button>
                        ) : (
                            <Button size="lg" className="w-full h-16 md:h-20 bg-green-600 hover:bg-green-700 text-lg md:text-2xl font-black rounded-xl md:rounded-[1.5rem] shadow-2xl active:scale-95 transition-all group" onClick={handleDownload}>
                                <Download className="mr-3 md:mr-4 size-6 md:size-8 group-hover:translate-y-1 transition-transform" /> DOWNLOAD PDF
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
                        {numberedPdfUrl && (
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
                                
                                {/* FLOATING PAGE NUMBER PREVIEW OVERLAY */}
                                <div className="absolute inset-0 z-10 select-none overflow-hidden pointer-events-none p-[8%]">
                                    <div style={getPreviewStyle()}>
                                        {format
                                            .replace('{page}', '1')
                                            .replace('{total}', String(totalPagesPreview))}
                                    </div>
                                </div>
                                
                                <div className="absolute top-2 right-2 opacity-20">
                                    <Badge variant="outline" className="text-[7px] border-black font-black uppercase">PAGE 1 VIEW</Badge>
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                    <CardFooter className="bg-white dark:bg-slate-950 border-t p-5 md:p-8 flex justify-center gap-8">
                         <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            <ShieldCheck className="size-4 text-green-500" /> SECURE RAM
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            <Zap className="size-4 text-yellow-500" /> TOP-TO-BOTTOM SYNC
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}
