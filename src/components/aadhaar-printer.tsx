
"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useCallback, useEffect } from "react";
import { 
    UploadCloud, 
    Printer, 
    X, 
    Loader2, 
    ShieldCheck, 
    Zap, 
    RotateCcw,
    CheckCircle2,
    Crop,
    AlertCircle,
    FileText,
    ChevronRight,
    Lock,
    Eye,
    LayoutGrid,
    CreditCard,
    Smartphone,
    ArrowRightLeft,
    RefreshCcw,
    ArrowLeft,
    Move,
    Scan,
    Maximize,
    Grid3X3,
    Settings2,
    Download,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    Square,
    Sparkles,
    RotateCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import * as pdfjs from 'pdfjs-dist';
import jsPDF from 'jspdf';
import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Initialize PDF.js worker with stable CDN
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs`;
}

type Workflow = 'a4' | 'separate';
type Stage = 'selection' | 'upload' | 'password' | 'refine' | 'preview';
type CropMode = 'rect' | 'scanner';
type VAlign = 'top' | 'center' | 'bottom';

interface Point {
    x: number;
    y: number;
}

export default function AadhaarPrinter() {
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [stage, setStage] = useState<Stage>('selection');
  const [cropMode, setCropMode] = useState<CropMode>('scanner');
  const [vAlign, setVAlign] = useState<VAlign>('center');
  const [showBorder, setShowBorder] = useState(true);
  
  // A4 Workflow States
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [password, setPassword] = useState("");
  const [originalA4Src, setOriginalA4Src] = useState<string | null>(null);

  // Separate Workflow States
  const [frontRaw, setFrontRaw] = useState<string | null>(null);
  const [backRaw, setBackRaw] = useState<string | null>(null);
  const [refiningSide, setRefiningSide] = useState<'front' | 'back' | null>(null);

  // Final Cropped Results
  const [frontFinal, setFrontFinal] = useState<string | null>(null);
  const [backFinal, setBackFinal] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Rect Mode States
  const [rectCrop, setRectCrop] = useState<CropType>();
  const [completedRectCrop, setCompletedRectCrop] = useState<PixelCrop>();

  // 8-Dot Scanner States (Indices: 0=TL, 1=TC, 2=TR, 3=RC, 4=BR, 5=BC, 6=BL, 7=LC)
  const [points, setPoints] = useState<Point[]>([
    { x: 15, y: 15 }, { x: 50, y: 15 }, { x: 85, y: 15 }, 
    { x: 85, y: 50 }, { x: 85, y: 85 },                   
    { x: 50, y: 85 }, { x: 15, y: 85 },                   
    { x: 15, y: 50 }                                      
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelection = (mode: Workflow) => {
    setWorkflow(mode);
    setStage('upload');
  };

  const processPdfWithPassword = async (buffer: ArrayBuffer, pass: string = "") => {
    setIsProcessing(true);
    try {
        const bufferCopy = buffer.slice(0);
        const loadingTask = pdfjs.getDocument({ 
            data: new Uint8Array(bufferCopy),
            password: pass,
        });
        
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.2 }); 
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas init failed");

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        await page.render({ canvasContext: ctx, viewport }).promise;
        setOriginalA4Src(canvas.toDataURL('image/jpeg', 0.95));
        setStage('refine');
        resetPoints();
    } catch (error: any) {
        if (error.name === 'PasswordException' || error.message?.toLowerCase().includes('password')) {
            setStage('password');
        } else {
            toast({ variant: 'destructive', title: 'Processing Failed' });
        }
    } finally {
        setIsProcessing(false);
    }
  };

  const handleFile = (file: File, side?: 'front' | 'back') => {
    if (workflow === 'a4') {
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const buffer = e.target?.result as ArrayBuffer;
                setPdfBuffer(buffer);
                processPdfWithPassword(buffer);
            };
            reader.readAsArrayBuffer(file);
        } else if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setOriginalA4Src(e.target?.result as string);
                setStage('refine');
                resetPoints();
            };
            reader.readAsDataURL(file);
        }
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target?.result as string;
            if (side === 'front') setFrontRaw(src);
            else setBackRaw(src);
        };
        reader.readAsDataURL(file);
    }
  };

  const resetPoints = () => {
    setPoints([
        { x: 15, y: 15 }, { x: 50, y: 15 }, { x: 85, y: 15 },
        { x: 85, y: 50 }, { x: 85, y: 85 },
        { x: 50, y: 85 }, { x: 15, y: 85 },
        { x: 15, y: 50 }
    ]);
  };

  /**
   * Gaussian elimination for homography
   * This solves the perspective transformation matrix.
   */
  const solvePerspective = (src: Point[], dst: Point[]) => {
    const p = [];
    // We only use the 4 corners for the math
    for (let i = 0; i < 4; i++) {
        p.push([src[i].x, src[i].y, 1, 0, 0, 0, -src[i].x * dst[i].x, -src[i].y * dst[i].x, dst[i].x]);
        p.push([0, 0, 0, src[i].x, src[i].y, 1, -src[i].x * dst[i].y, -src[i].y * dst[i].y, dst[i].y]);
    }
    const n = 8;
    for (let i = 0; i < n; i++) {
        let max = i;
        for (let j = i + 1; j < n; j++) if (Math.abs(p[j][i]) > Math.abs(p[max][i])) max = j;
        const temp = p[i]; p[i] = p[max]; p[max] = temp;
        for (let j = i + 1; j < n; j++) {
            const f = p[j][i] / p[i][i];
            for (let k = i; k <= n; k++) p[j][k] -= f * p[i][k];
        }
    }
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        let s = 0;
        for (let j = i + 1; j < n; j++) s += p[i][j] * x[j];
        x[i] = (p[i][n] - s) / p[i][i];
    }
    return x;
  };

  const handleFinalizeCrop = async () => {
    const image = imgRef.current;
    if (!image || !image.naturalWidth) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let finalData = "";
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    if (cropMode === 'scanner') {
        // Calculate target dimensions based on perspective points
        const w1 = Math.hypot(points[2].x - points[0].x, points[2].y - points[0].y);
        const w2 = Math.hypot(points[4].x - points[6].x, points[4].y - points[6].y);
        const h1 = Math.hypot(points[6].x - points[0].x, points[6].y - points[0].y);
        const h2 = Math.hypot(points[4].x - points[2].x, points[4].y - points[2].y);
        
        const targetWidth = Math.max(10, Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100)));
        const targetHeight = Math.max(10, Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100)));
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Map relative UI points to actual pixel coordinates for the 4 corners
        const srcPoints = [points[0], points[2], points[4], points[6]].map(p => ({ 
            x: p.x * (image.naturalWidth / 100), 
            y: p.y * (image.naturalHeight / 100) 
        }));
        const dstPoints = [
          { x: 0, y: 0 }, 
          { x: canvas.width, y: 0 }, 
          { x: canvas.width, y: canvas.height }, 
          { x: 0, y: canvas.height }
        ];

        const h = solvePerspective(srcPoints, dstPoints);
        const imgData = ctx.createImageData(canvas.width, canvas.height);
        
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = image.naturalWidth; srcCanvas.height = image.naturalHeight;
        const srcCtx = srcCanvas.getContext('2d');
        srcCtx?.drawImage(image, 0, 0);
        const srcPixels = srcCtx?.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;

        if (srcPixels) {
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const z = h[6] * x + h[7] * y + 1;
                    const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
                    const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
                    if (sx >= 0 && sx < image.naturalWidth && sy >= 0 && sy < image.naturalHeight) {
                        const dstIdx = (y * canvas.width + x) * 4;
                        const srcIdx = (sy * image.naturalWidth + sx) * 4;
                        imgData.data[dstIdx] = srcPixels[srcIdx];
                        imgData.data[dstIdx+1] = srcPixels[srcIdx+1];
                        imgData.data[dstIdx+2] = srcPixels[srcIdx+2];
                        imgData.data[dstIdx+3] = srcPixels[srcIdx+3];
                    }
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }
        finalData = canvas.toDataURL("image/png");
    } else {
        if (!completedRectCrop) return;
        canvas.width = Math.max(10, completedRectCrop.width * scaleX);
        canvas.height = Math.max(10, completedRectCrop.height * scaleY);
        ctx.drawImage(image, completedRectCrop.x * scaleX, completedRectCrop.y * scaleY, completedRectCrop.width * scaleX, completedRectCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
        finalData = canvas.toDataURL("image/png");
    }

    if (workflow === 'a4') {
        const cardImg = new window.Image();
        cardImg.src = finalData;
        cardImg.onload = () => {
            const halfWidth = cardImg.width / 2;
            const fCanvas = document.createElement("canvas");
            fCanvas.width = halfWidth; fCanvas.height = cardImg.height;
            fCanvas.getContext("2d")?.drawImage(cardImg, 0, 0, halfWidth, cardImg.height, 0, 0, halfWidth, cardImg.height);
            setFrontFinal(fCanvas.toDataURL("image/png"));
            const bCanvas = document.createElement("canvas");
            bCanvas.width = halfWidth; bCanvas.height = cardImg.height;
            bCanvas.getContext("2d")?.drawImage(cardImg, halfWidth, 0, halfWidth, cardImg.height, 0, 0, halfWidth, cardImg.height);
            setBackFinal(bCanvas.toDataURL("image/png"));
            setStage('preview');
        };
    } else {
        if (refiningSide === 'front') setFrontFinal(finalData);
        else setBackFinal(finalData);
        setRefiningSide(null);
        setStage('upload');
    }
    setIsProcessing(false);
    toast({ title: "Adjustment Confirmed" });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current || !points[draggingPoint]) return;
    
    if (e.cancelable) e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    let cx, cy;
    if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }

    const x = Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((cy - rect.top) / rect.height) * 100));

    setMagnifierPos({ x, y });
    setPoints(prev => {
        const next = [...prev];
        const idx = draggingPoint;
        if (idx === null || !next[idx]) return prev;

        // Move target points
        if ([0, 2, 4, 6].includes(idx)) {
            next[idx] = { x, y };
        } else {
            // Midpoint Handles Logic: Move adjacent corners
            if (idx === 1) { next[0].y = y; next[2].y = y; } // Top Edge
            else if (idx === 3) { next[2].x = x; next[4].x = x; } // Right Edge
            else if (idx === 5) { next[6].y = y; next[4].y = y; } // Bottom Edge
            else if (idx === 7) { next[0].x = x; next[6].x = x; } // Left Edge
        }

        // Recalculate ALL midpoints based on current corner states to prevent drift
        next[1] = { x: (next[0].x + next[2].x) / 2, y: (next[0].y + next[2].y) / 2 };
        next[3] = { x: (next[2].x + next[4].x) / 2, y: (next[2].y + next[4].y) / 2 };
        next[5] = { x: (next[4].x + next[6].x) / 2, y: (next[4].y + next[6].y) / 2 };
        next[7] = { x: (next[6].x + next[0].x) / 2, y: (next[6].y + next[0].y) / 2 };

        return next;
    });
  }, [draggingPoint, points]);

  const handlePointDown = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
    setDraggingPoint(idx);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    let cx, cy;
    if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }
    setMagnifierPos({ x: ((cx - rect.left) / rect.width) * 100, y: ((cy - rect.top) / rect.height) * 100 });
  };

  const handlePrint = () => window.print();

  const handleReset = () => {
    setWorkflow(null); setStage('selection'); setOriginalA4Src(null); setFrontRaw(null); setBackRaw(null);
    setFrontFinal(null); setBackFinal(null); setRefiningSide(null); setPdfBuffer(null); setPassword("");
  };

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500 pb-24 overflow-x-hidden relative">
      
      {stage === 'selection' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 px-4 w-full max-w-5xl">
            <Card className="group border-2 border-dashed hover:border-primary hover:shadow-2xl transition-all cursor-pointer rounded-[2.5rem] overflow-hidden" onClick={() => handleSelection('a4')}>
                <CardHeader className="p-10 text-center">
                    <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary shadow-xl transition-transform group-hover:scale-110">
                        <FileText className="size-10" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase">e-Aadhaar A4 File</CardTitle>
                    <CardDescription className="text-sm font-bold opacity-60">Straighten e-Aadhaar strip for perfect results.</CardDescription>
                </CardHeader>
                <CardFooter className="bg-primary/5 py-4 justify-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">SELECT A4 WORKFLOW <ChevronRight className="inline size-3" /></span>
                </CardFooter>
            </Card>

            <Card className="group border-2 border-dashed hover:border-emerald-500 hover:shadow-2xl transition-all cursor-pointer rounded-[2.5rem] overflow-hidden" onClick={() => handleSelection('separate')}>
                <CardHeader className="p-10 text-center">
                    <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-emerald-500/10 text-emerald-600 shadow-xl transition-transform group-hover:scale-110">
                        <LayoutGrid className="size-10" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase">Individual Sides</CardTitle>
                    <CardDescription className="text-sm font-bold opacity-60">Straighten PAN, DL or Voter ID photos taken at angles.</CardDescription>
                </CardHeader>
                <CardFooter className="bg-emerald-500/5 py-4 justify-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">SELECT INDIVIDUAL WORKFLOW <ChevronRight className="inline size-3" /></span>
                </CardFooter>
            </Card>
        </div>
      )}

      {stage === 'upload' && workflow === 'a4' && (
        <Card className={cn("w-full max-w-4xl border-2 border-dashed bg-card/50 text-center rounded-[2.5rem] overflow-hidden shadow-xl mx-4", isDragOver && "border-primary bg-primary/5")}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        >
            <CardHeader className="pt-12 relative">
                <Button variant="ghost" size="sm" onClick={handleReset} className="absolute top-6 left-6 font-black text-[10px] uppercase"><ArrowLeft className="mr-1 size-3" /> Back</Button>
                <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary"><UploadCloud className="size-10" /></div>
                <CardTitle className="text-3xl font-black uppercase">e-Aadhaar Upload</CardTitle>
            </CardHeader>
            <CardContent className="pb-12 px-6">
                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-20 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/30 transition-all" onClick={() => fileInputRef.current?.click()}>
                    <Zap className="size-8 text-yellow-500 animate-pulse" />
                    <p className="font-black uppercase text-lg">Drop Original PDF here</p>
                    <Badge variant="outline">AUTO-DECRYPT ACTIVE</Badge>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </CardContent>
        </Card>
      )}

      {stage === 'upload' && workflow === 'separate' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 px-4 w-full max-w-5xl">
              <div className="flex flex-col sm:flex-row items-center justify-between no-print gap-4">
                   <Button variant="ghost" onClick={handleReset} className="font-black text-[10px] uppercase tracking-widest self-start md:self-center"><ArrowLeft className="mr-1 size-3" /> Selection</Button>
                   <div className="flex items-center gap-3">
                        {frontFinal && backFinal && (
                            <Button onClick={() => setStage('preview')} className="bg-primary font-black uppercase text-xs h-10 px-8 rounded-xl shadow-xl animate-bounce">GENERATE PRINT <ChevronRight className="ml-1 size-4" /></Button>
                        )}
                   </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
                  {[ { side: 'front' as const, raw: frontRaw, final: frontFinal, setRaw: setFrontRaw, setFinal: setFrontFinal, inputRef: frontInputRef },
                     { side: 'back' as const, raw: backRaw, final: backFinal, setRaw: setBackRaw, setFinal: setBackFinal, inputRef: backInputRef }
                  ].map(s => (
                    <Card key={s.side} className={cn("border-2 border-dashed rounded-[2.5rem] overflow-hidden transition-all", s.final ? "border-green-500/50 bg-green-500/5" : "hover:border-primary")}>
                      <CardHeader className="text-center"><CardTitle className="text-sm font-black uppercase text-muted-foreground">{s.side === 'front' ? 'FRONT SIDE' : 'BACK SIDE'}</CardTitle></CardHeader>
                      <CardContent className="p-8 flex flex-col items-center gap-6 min-h-[300px] justify-center">
                          {s.final ? (
                              <div className={cn("relative group shadow-2xl rounded-lg overflow-hidden bg-white aspect-[85.6/54] h-40", showBorder && "border-2 border-black")}>
                                  <img src={s.final} alt={s.side} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <Button size="sm" variant="secondary" className="font-black text-[9px] uppercase px-4" onClick={() => { setRefiningSide(s.side); resetPoints(); setStage('refine'); }}><Scan className="size-3 mr-1.5" /> Adjust</Button>
                                      <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => { s.setFinal(null); s.setRaw(null); }}><X className="size-4" /></Button>
                                  </div>
                              </div>
                          ) : s.raw ? (
                              <div className="flex flex-col items-center gap-3">
                                  <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse"><Move className="size-8" /></div>
                                  <Button className="font-black uppercase text-[10px] bg-primary rounded-xl" onClick={() => { setRefiningSide(s.side); resetPoints(); setStage('refine'); }}>Start Smart Scanner</Button>
                              </div>
                          ) : (
                              <div className="flex flex-col items-center gap-4 text-center cursor-pointer opacity-40 hover:opacity-100 transition-opacity" onClick={() => s.inputRef.current?.click()}>
                                  <UploadCloud className="size-12" /><p className="text-[10px] font-black uppercase">Upload Side Photo</p>
                                  <input ref={s.inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], s.side)} />
                              </div>
                          )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
          </div>
      )}

      {stage === 'password' && (
        <Card className="w-full max-w-md shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary/5 p-6 border-b text-center"><CardTitle className="text-xl font-black uppercase flex items-center justify-center gap-3"><Lock className="size-5 text-primary" /> Aadhaar Password</CardTitle></CardHeader>
            <CardContent className="p-8 space-y-6">
                <Label className="text-[10px] font-black uppercase opacity-50">Enter PDF Open Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 text-2xl font-black tracking-[0.3em] text-center border-2 rounded-2xl" placeholder="••••••••" autoFocus />
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3"><AlertCircle className="size-5 text-blue-500 shrink-0" /><p className="text-[10px] text-blue-700 font-bold leading-tight">Format: FIRST 4 Letters of NAME (CAPS) + Year of Birth.</p></div>
            </CardContent>
            <CardFooter className="p-6 bg-muted/5 border-t"><Button onClick={() => processPdfWithPassword(pdfBuffer!, password)} disabled={isProcessing || !password} className="w-full h-14 bg-primary font-black rounded-xl text-lg shadow-xl">{isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2 h-5 w-5 text-yellow-400 fill-yellow-400" />} UNLOCK & RENDER</Button></CardFooter>
        </Card>
      )}

      {stage === 'refine' && (
          <Card className="w-full max-w-5xl mx-4 shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-muted/30 border-b p-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2"><Settings2 className="size-5 text-primary" /> Adjustment Studio</CardTitle>
                    <div className="flex items-center gap-3">
                        <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as CropMode)} className="bg-background/50 p-1 rounded-lg border">
                            <TabsList className="h-9"><TabsTrigger value="rect" className="text-[10px] font-black uppercase px-4"><Maximize className="size-3 mr-1.5" /> Rect</TabsTrigger><TabsTrigger value="scanner" className="text-[10px] font-black uppercase px-4"><Scan className="size-3 mr-1.5" /> Scanner</TabsTrigger></TabsList>
                        </Tabs>
                        <Button variant="ghost" size="icon" onClick={() => setStage('upload')} className="text-destructive"><X /></Button>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-slate-200 dark:bg-slate-900 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden select-none"
                           onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                  
                  {isProcessing && <div className="absolute inset-0 z-40 bg-white/80 dark:bg-slate-950/80 flex flex-col items-center justify-center gap-4"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="text-[10px] font-black uppercase">Processing Pixels...</p></div>}

                  <div ref={containerRef} className="relative cursor-crosshair shadow-2xl border-4 border-white transform-gpu bg-white my-10 max-w-[95vw]" style={{ touchAction: 'none' }}>
                    {cropMode === 'rect' ? (
                        <ReactCrop crop={rectCrop} onChange={c => setRectCrop(c)} onComplete={c => setCompletedRectCrop(c)} className="max-h-[70vh]">
                            <img ref={imgRef} src={workflow === 'a4' ? originalA4Src! : (refiningSide === 'front' ? frontRaw! : backRaw!)} alt="crop" className="max-h-[70vh] w-auto object-contain" />
                        </ReactCrop>
                    ) : (
                        <div className="relative">
                            <img ref={imgRef} src={workflow === 'a4' ? originalA4Src! : (refiningSide === 'front' ? frontRaw! : backRaw!)} alt="scanner" className="max-h-[70vh] w-auto object-contain pointer-events-none" />
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <polygon points={`${points[0].x},${points[0].y} ${points[2].x},${points[2].y} ${points[4].x},${points[4].y} ${points[6].x},${points[6].y}`} className="fill-primary/10 stroke-primary stroke-[0.5]" />
                            </svg>
                            {points.map((p, i) => (
                                <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-2xl cursor-grab active:cursor-grabbing z-20 flex items-center justify-center", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/80")}
                                    style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                                    onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}>
                                    <div className="size-2.5 bg-white rounded-full" />
                                </div>
                            ))}
                            {draggingPoint !== null && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 rounded-full border-4 border-green-500 shadow-3xl bg-white animate-in zoom-in-50 ring-4 ring-white/50">
                                    <img src={workflow === 'a4' ? originalA4Src! : (refiningSide === 'front' ? frontRaw! : backRaw!)} alt="mag" className="absolute max-w-none origin-top-left"
                                        style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"><div className="w-full h-0.5 bg-green-500/50 absolute" /><div className="h-full w-0.5 bg-green-500/50 absolute" /></div>
                                </div>
                            )}
                        </div>
                    )}
                  </div>
                  <div className="w-full py-6 flex justify-center bg-slate-100 dark:bg-slate-950 border-t relative z-10">
                       <div className="inline-flex items-center gap-3 px-8 py-3 bg-black/70 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl">
                          <Move className="h-4 w-4 text-primary animate-pulse" /> {cropMode === 'rect' ? "Position box" : "Drag dots to corners"}
                      </div>
                  </div>
              </CardContent>
              <CardFooter className="p-6 bg-white dark:bg-slate-950 border-t flex justify-between gap-4">
                  <Button variant="ghost" onClick={() => setStage('upload')} className="font-black text-[10px] uppercase h-12 px-6 rounded-xl border-2">CANCEL</Button>
                  <Button className="h-14 px-12 bg-primary font-black rounded-xl shadow-xl text-base" onClick={handleFinalizeCrop}>CONFIRM ADJUSTMENT</Button>
              </CardFooter>
          </Card>
      )}

      {stage === 'preview' && frontFinal && backFinal && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 px-4 w-full max-w-5xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 no-print">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 shadow-md border border-green-500/20"><CheckCircle2 className="size-7" /></div>
                    <div><h3 className="text-xl font-black uppercase tracking-tighter">Print Ready</h3><p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest">A4 ID-1 ALIGNMENT</p></div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-xl border-2"><Square className="size-3 text-muted-foreground" /><span className="text-[10px] font-black uppercase">Border</span><Switch checked={showBorder} onCheckedChange={setShowBorder} /></div>
                    <Tabs value={vAlign} onValueChange={(v) => setVAlign(v as VAlign)} className="bg-muted p-1 rounded-xl border-2">
                        <TabsList className="h-9"><TabsTrigger value="top"><AlignVerticalJustifyStart className="size-4"/></TabsTrigger><TabsTrigger value="center"><AlignVerticalJustifyCenter className="size-4"/></TabsTrigger><TabsTrigger value="bottom"><AlignVerticalJustifyEnd className="size-4"/></TabsTrigger></TabsList>
                    </Tabs>
                    <Button variant="outline" onClick={() => setStage('upload')} className="h-12 border-2 px-6 font-black text-[10px] uppercase rounded-xl"><RefreshCcw className="mr-2 size-3" /> Re-align</Button>
                    <Button onClick={handlePrint} className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-2xl"><Printer className="mr-2 size-4" /> PRINT NOW</Button>
                </div>
            </div>

            <div className="no-print">
                <Card className="border-2 shadow-2xl bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-white/5 dark:bg-black/20 border-b p-4 text-center"><span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">STUDIO RENDER PREVIEW</span></CardHeader>
                    <CardContent className="p-12 flex flex-col md:flex-row items-center justify-center gap-12">
                        {[{ src: frontFinal, label: 'FRONT' }, { src: backFinal, label: 'BACK' }].map(side => (
                            <div key={side.label} className="space-y-4">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block text-center opacity-60">{side.label}</span>
                                <div className={cn("relative shadow-2xl rounded-xl overflow-hidden bg-white w-[320px] h-[202px]", showBorder ? "border-2 border-black" : "border-8 border-white")}>
                                    <img src={side.src} alt={side.label} className="w-full h-full object-contain" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className={cn("hidden print:flex flex-col items-center w-full min-h-[297mm] bg-white", vAlign === 'top' ? 'justify-start pt-10' : vAlign === 'bottom' ? 'justify-end pb-10' : 'justify-center')} id="printable-area">
                <div className="flex flex-col items-center gap-12">
                    {[frontFinal, backFinal].map((src, i) => (
                        <div key={i} className={cn("bg-white flex items-center justify-center overflow-hidden", showBorder && "border-[0.5pt] border-black")} style={{ width: '85.6mm', height: '54mm' }}>
                            <img src={src} className="max-w-full max-h-full object-contain" alt="print" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; height: 297mm !important; width: 210mm !important; overflow: hidden !important; }
          body * { visibility: hidden !important; margin: 0 !important; }
          #printable-area, #printable-area * { visibility: visible !important; }
          #printable-area { position: fixed !important; left: 0 !important; top: 0 !important; width: 210mm !important; height: 297mm !important; display: flex !important; flex-direction: column !important; align-items: center !important; z-index: 9999999 !important; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>
      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}
