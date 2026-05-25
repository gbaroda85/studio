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
    Grid3X3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

type Workflow = 'a4' | 'separate';
type Stage = 'selection' | 'upload' | 'password' | 'refine' | 'preview';

interface Point {
    x: number;
    y: number;
}

export default function AadhaarPrinter() {
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [stage, setStage] = useState<Stage>('selection');
  
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
  
  // 4-Dot Scanner States
  const [points, setPoints] = useState<Point[]>([
    { x: 20, y: 20 }, { x: 80, y: 20 },
    { x: 80, y: 80 }, { x: 20, y: 80 }
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const ID_ASPECT = 85.6 / 54;

  const handleSelection = (mode: Workflow) => {
    setWorkflow(mode);
    setStage('upload');
  };

  const handleFile = (file: File, side?: 'front' | 'back') => {
    if (workflow === 'a4') {
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPdfBuffer(e.target?.result as ArrayBuffer);
                setStage('password');
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
        } else {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a PDF or Image.' });
        }
    } else {
        if (!file.type.startsWith('image/')) {
            toast({ variant: 'destructive', title: 'Image Required', description: 'Please upload a JPG or PNG photo.' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target?.result as string;
            if (side === 'front') {
                setFrontRaw(src);
                setFrontFinal(null);
            } else {
                setBackRaw(src);
                setBackFinal(null);
            }
            toast({ title: 'Upload Successful', description: `Side ${side?.toUpperCase()} ready for adjustment.` });
        };
        reader.readAsDataURL(file);
    }
  };

  const resetPoints = () => {
    setPoints([
        { x: 10, y: 10 }, { x: 90, y: 10 },
        { x: 90, y: 90 }, { x: 10, y: 90 }
    ]);
  };

  const handlePdfRender = async () => {
    if (!pdfBuffer) return;
    setIsProcessing(true);
    try {
        const loadingTask = pdfjs.getDocument({ 
            data: new Uint8Array(pdfBuffer),
            password: password 
        });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(pdf.numPages); 
        
        const viewport = page.getViewport({ scale: 2.5 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;
            setOriginalA4Src(canvas.toDataURL('image/jpeg', 1.0));
            setStage('refine');
            resetPoints();
        }
    } catch (error: any) {
        if (error.name === 'PasswordException') {
            toast({ variant: 'destructive', title: 'Wrong Password', description: 'Check Aadhaar password format (NAME1990).' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to process PDF.' });
        }
    } finally {
        setIsProcessing(false);
    }
  };

  // --- PERSPECTIVE LOGIC (Homography) ---
  const solvePerspective = (src: Point[], dst: Point[]) => {
    const p = [];
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
    if (!image) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Calculate dimensions based on top and side distances
    const w1 = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
    const w2 = Math.hypot(points[2].x - points[3].x, points[2].y - points[3].y);
    const h1 = Math.hypot(points[3].x - points[0].x, points[3].y - points[0].y);
    const h2 = Math.hypot(points[2].x - points[1].x, points[2].y - points[1].y);
    
    // Scale normalized percentage to natural pixels
    const targetWidth = Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100));
    const targetHeight = Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100));
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const srcPoints = points.map(p => ({ 
        x: p.x * (image.naturalWidth / 100), 
        y: p.y * (image.naturalHeight / 100) 
    }));
    const dstPoints = [
        { x: 0, y: 0 }, 
        { x: targetWidth, y: 0 }, 
        { x: targetWidth, y: targetHeight }, 
        { x: 0, y: targetHeight }
    ];

    const h = solvePerspective(dstPoints, srcPoints);
    const imgData = ctx.createImageData(targetWidth, targetHeight);
    
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = image.naturalWidth;
    srcCanvas.height = image.naturalHeight;
    const srcCtx = srcCanvas.getContext('2d');
    srcCtx?.drawImage(image, 0, 0);
    const srcData = srcCtx?.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;

    if (srcData) {
        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < targetWidth; x++) {
                const z = h[6] * x + h[7] * y + 1;
                const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
                const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
                
                if (sx >= 0 && sx < image.naturalWidth && sy >= 0 && sy < image.naturalHeight) {
                    const dstIdx = (y * targetWidth + x) * 4;
                    const srcIdx = (sy * image.naturalWidth + sx) * 4;
                    imgData.data[dstIdx] = srcData[srcIdx];
                    imgData.data[dstIdx+1] = srcData[srcIdx+1];
                    imgData.data[dstIdx+2] = srcData[srcIdx+2];
                    imgData.data[dstIdx+3] = srcData[srcIdx+3];
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    const finalData = canvas.toDataURL("image/png");

    if (workflow === 'a4') {
        // For Aadhaar strip, split into two
        const halfWidth = canvas.width / 2;
        
        const fCanvas = document.createElement("canvas");
        fCanvas.width = halfWidth; fCanvas.height = canvas.height;
        fCanvas.getContext("2d")?.drawImage(canvas, 0, 0, halfWidth, canvas.height, 0, 0, halfWidth, canvas.height);
        setFrontFinal(fCanvas.toDataURL("image/png"));
        
        const bCanvas = document.createElement("canvas");
        bCanvas.width = halfWidth; bCanvas.height = canvas.height;
        bCanvas.getContext("2d")?.drawImage(canvas, halfWidth, 0, halfWidth, canvas.height, 0, 0, halfWidth, canvas.height);
        setBackFinal(bCanvas.toDataURL("image/png"));
        
        setStage('preview');
    } else {
        if (refiningSide === 'front') setFrontFinal(finalData);
        else setBackFinal(finalData);
        
        setRefiningSide(null);
        setStage('upload');
    }
    
    setIsProcessing(false);
    toast({ title: "Smart Scan Success", description: "Perspective corrected and straightened." });
  };

  // --- MAGNIFIER & POINT HANDLERS ---
  const updateMagnifier = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setMagnifierPos({ x, y });
    return { x, y };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current) return;
    if (e.cancelable) e.preventDefault();
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY;
    }
    
    const pos = updateMagnifier(clientX, clientY);
    if (pos) {
        setPoints(prev => {
            const next = [...prev];
            next[draggingPoint] = { x: pos.x, y: pos.y };
            return next;
        });
    }
  }, [draggingPoint, updateMagnifier]);

  const handlePointMouseDown = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    setDraggingPoint(index);
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY;
    }
    updateMagnifier(clientX, clientY);
  };

  const handleMouseUp = () => setDraggingPoint(null);

  const handlePrint = () => window.print();

  const handleReset = () => {
    setWorkflow(null);
    setStage('selection');
    setOriginalA4Src(null);
    setFrontRaw(null);
    setBackRaw(null);
    setFrontFinal(null);
    setBackFinal(null);
    setRefiningSide(null);
    setPdfBuffer(null);
    setPassword("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (frontInputRef.current) frontInputRef.current.value = "";
    if (backInputRef.current) backInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-5xl animate-in fade-in duration-500 pb-12">
      
      {/* STAGE 0: SELECTION */}
      {stage === 'selection' && (
        <div className="grid md:grid-cols-2 gap-8 pt-4 px-4">
            <Card className="group border-2 border-dashed hover:border-primary hover:shadow-2xl transition-all cursor-pointer rounded-[2.5rem] overflow-hidden" onClick={() => handleSelection('a4')}>
                <CardHeader className="p-10 text-center">
                    <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary shadow-xl transition-transform group-hover:scale-110">
                        <FileText className="size-10" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">e-Aadhaar A4 File</CardTitle>
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
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">Individual Sides</CardTitle>
                    <CardDescription className="text-sm font-bold opacity-60">Straighten PAN, DL or Voter ID photos taken at angles.</CardDescription>
                </CardHeader>
                <CardFooter className="bg-emerald-500/5 py-4 justify-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">SELECT INDIVIDUAL WORKFLOW <ChevronRight className="inline size-3" /></span>
                </CardFooter>
            </Card>
        </div>
      )}

      {/* STAGE 1: UPLOAD (A4) */}
      {stage === 'upload' && workflow === 'a4' && (
        <Card className={cn(
            "border-2 border-dashed bg-card/50 text-center transition-all duration-300 rounded-[2.5rem] overflow-hidden shadow-xl mx-4",
            isDragOver && "border-primary bg-primary/5"
        )}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        >
            <CardHeader className="pt-12">
                <Button variant="ghost" size="sm" onClick={handleReset} className="absolute top-6 left-6 font-black text-[10px] uppercase"><ArrowLeft className="mr-1 size-3" /> Back</Button>
                <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
                    <UploadCloud className="size-10" />
                </div>
                <CardTitle className="text-3xl font-black uppercase tracking-tighter">e-Aadhaar Upload</CardTitle>
                <CardDescription>Select the PDF file downloaded from UIDAI portal.</CardDescription>
            </CardHeader>
            <CardContent className="pb-12">
                <div className="border-3 border-dashed border-muted-foreground/20 rounded-[2rem] p-20 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/30 transition-all" onClick={() => fileInputRef.current?.click()}>
                    <Zap className="size-8 text-yellow-500 animate-pulse" />
                    <p className="font-black uppercase tracking-tighter">Drop Original PDF here</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Local Extraction Logic Active</p>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </CardContent>
        </Card>
      )}

      {/* STAGE 1: UPLOAD (SEPARATE SIDES) */}
      {stage === 'upload' && workflow === 'separate' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 px-4">
              <div className="flex items-center justify-between no-print">
                   <Button variant="ghost" onClick={handleReset} className="font-black text-[10px] uppercase tracking-widest"><ArrowLeft className="mr-1 size-3" /> Selection</Button>
                   <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-black text-primary border-primary/20 bg-primary/5 uppercase text-[9px] px-3">Standard ID-1 Format</Badge>
                        {frontFinal && backFinal && (
                            <Button onClick={() => setStage('preview')} className="bg-primary font-black uppercase text-xs h-10 px-8 rounded-xl shadow-xl animate-bounce">GENERATE PRINT <ChevronRight className="ml-1 size-4" /></Button>
                        )}
                   </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 no-print">
                  <Card className={cn("border-2 border-dashed rounded-[2.5rem] overflow-hidden transition-all", frontFinal ? "border-green-500/50 bg-green-500/5" : "hover:border-primary")}>
                      <CardHeader className="pb-4 text-center">
                          <CardTitle className="text-sm font-black uppercase text-muted-foreground flex items-center justify-center gap-2">
                             {frontFinal ? <CheckCircle2 className="size-4 text-green-500" /> : <CreditCard className="size-4" />} FRONT SIDE
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 flex flex-col items-center gap-6 min-h-[300px] justify-center">
                          {frontFinal ? (
                              <div className="relative group shadow-2xl rounded-lg overflow-hidden border-2 bg-white max-w-full aspect-[85.6/54] h-40">
                                  <img src={frontFinal} alt="front" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <Button size="sm" variant="secondary" className="font-black text-[9px] uppercase h-8 px-4" onClick={() => { setRefiningSide('front'); resetPoints(); setStage('refine'); }}><Scan className="size-3 mr-1.5" /> Adjust</Button>
                                      <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => { setFrontFinal(null); setFrontRaw(null); }}><X className="size-4" /></Button>
                                  </div>
                              </div>
                          ) : frontRaw ? (
                              <div className="flex flex-col items-center gap-4 text-center">
                                  <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse"><Move className="size-8" /></div>
                                  <p className="text-xs font-bold text-primary uppercase">Straighten Needed</p>
                                  <Button className="font-black uppercase text-xs bg-primary rounded-xl" onClick={() => { setRefiningSide('front'); resetPoints(); setStage('refine'); }}>Start Smart Scanner</Button>
                                  <Button variant="ghost" onClick={() => setFrontRaw(null)} className="text-[9px] font-bold uppercase opacity-50">Clear Image</Button>
                              </div>
                          ) : (
                              <div className="flex flex-col items-center gap-4 text-center cursor-pointer opacity-40 hover:opacity-100 transition-opacity" onClick={() => frontInputRef.current?.click()}>
                                  <UploadCloud className="size-12" />
                                  <p className="text-xs font-black uppercase tracking-tighter">Upload Front Photo</p>
                                  <input ref={frontInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'front')} />
                              </div>
                          )}
                      </CardContent>
                  </Card>

                  <Card className={cn("border-2 border-dashed rounded-[2.5rem] overflow-hidden transition-all", backFinal ? "border-green-500/50 bg-green-500/5" : "hover:border-primary")}>
                      <CardHeader className="pb-4 text-center">
                          <CardTitle className="text-sm font-black uppercase text-muted-foreground flex items-center justify-center gap-2">
                             {backFinal ? <CheckCircle2 className="size-4 text-green-500" /> : <CreditCard className="size-4" />} BACK SIDE
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 flex flex-col items-center gap-6 min-h-[300px] justify-center">
                          {backFinal ? (
                              <div className="relative group shadow-2xl rounded-lg overflow-hidden border-2 bg-white max-w-full aspect-[85.6/54] h-40">
                                  <img src={backFinal} alt="back" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <Button size="sm" variant="secondary" className="font-black text-[9px] uppercase h-8 px-4" onClick={() => { setRefiningSide('back'); resetPoints(); setStage('refine'); }}><Scan className="size-3 mr-1.5" /> Adjust</Button>
                                      <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => { setBackFinal(null); setBackRaw(null); }}><X className="size-4" /></Button>
                                  </div>
                              </div>
                          ) : backRaw ? (
                              <div className="flex flex-col items-center gap-4 text-center">
                                  <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse"><Move className="size-8" /></div>
                                  <p className="text-xs font-bold text-primary uppercase">Straighten Needed</p>
                                  <Button className="font-black uppercase text-xs bg-primary rounded-xl" onClick={() => { setRefiningSide('back'); resetPoints(); setStage('refine'); }}>Start Smart Scanner</Button>
                                  <Button variant="ghost" onClick={() => setBackRaw(null)} className="text-[9px] font-bold uppercase opacity-50">Clear Image</Button>
                              </div>
                          ) : (
                              <div className="flex flex-col items-center gap-4 text-center cursor-pointer opacity-40 hover:opacity-100 transition-opacity" onClick={() => backInputRef.current?.click()}>
                                  <UploadCloud className="size-12" />
                                  <p className="text-xs font-black uppercase tracking-tighter">Upload Back Photo</p>
                                  <input ref={backInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'back')} />
                              </div>
                          )}
                      </CardContent>
                  </Card>
              </div>

              <div className="p-8 bg-blue-500/5 rounded-[3rem] border-2 border-dashed border-blue-500/10 flex flex-col items-center gap-4 text-center no-print">
                  <div className="flex items-center gap-3">
                       <Zap className="size-5 text-yellow-500 fill-yellow-500" />
                       <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-700">Perspective Scan Mode Active</p>
                  </div>
                  <p className="text-xs text-blue-900/60 font-medium max-w-xl">
                      Drag the 4 corner points to the edges of the ID card in your photo. Use the magnifier circle for pixel-perfect placement.
                  </p>
              </div>
          </div>
      )}

      {/* STAGE 2: PASSWORD (A4 ONLY) */}
      {stage === 'password' && (
        <Card className="w-full max-w-md mx-auto shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary/5 p-6 border-b text-center">
                <CardTitle className="text-xl font-black uppercase flex items-center justify-center gap-3">
                    <Lock className="size-5 text-primary" /> Aadhaar Password
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase opacity-50">Enter PDF Open Password</Label>
                    <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="h-14 text-2xl font-black tracking-[0.3em] text-center border-2 rounded-2xl"
                        placeholder="••••••••"
                        autoFocus
                    />
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                        <AlertCircle className="size-5 text-blue-500 shrink-0" />
                        <p className="text-[10px] text-blue-700 font-bold leading-tight">
                            Format: FIRST 4 Letters of NAME (CAPS) + Year of Birth. <br/>Example: <strong>ANIS1995</strong>
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-6 bg-muted/5 border-t">
                <Button onClick={handlePdfRender} disabled={isProcessing || !password} className="w-full h-14 bg-primary font-black rounded-xl text-lg shadow-xl">
                    {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2 h-5 w-5 text-yellow-400 fill-yellow-400" />}
                    UNLOCK & RENDER
                </Button>
            </CardFooter>
        </Card>
      )}

      {/* STAGE 3: REFINE WITH 4-DOT SCANNER */}
      {stage === 'refine' && (
          <Card className="w-full max-w-6xl mx-auto shadow-2xl rounded-[2.5rem] overflow-hidden mx-4">
              <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <Scan className="size-5 text-primary" /> Smart-Scan Straightener
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase opacity-60">Drag dots to the 4 corners of {refiningSide || 'Aadhaar'} portion.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setStage('upload')} className="text-destructive"><X /></Button>
              </CardHeader>
              <CardContent className="p-0 bg-slate-200 dark:bg-slate-900 flex items-center justify-center min-h-[600px] relative overflow-hidden select-none"
                           onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}>
                  
                  <div ref={containerRef} className="relative cursor-crosshair shadow-2xl border-4 border-white transform-gpu bg-white">
                    <img 
                        ref={imgRef} 
                        src={workflow === 'a4' ? originalA4Src! : (refiningSide === 'front' ? frontRaw! : backRaw!)} 
                        alt="refining" 
                        className="max-h-[70vh] w-auto object-contain pointer-events-none" 
                    />
                    
                    {/* Perspective Guide Overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} className="fill-primary/20 stroke-primary stroke-[0.5]" />
                    </svg>

                    {/* Drag Handles */}
                    {points.map((p, i) => (
                        <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-xl cursor-grab active:cursor-grabbing z-20 flex items-center justify-center transition-transform", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/80")}
                             style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                             onMouseDown={(e) => handlePointMouseDown(i, e)} onTouchStart={(e) => handlePointMouseDown(i, e)}>
                            <div className="size-2.5 bg-white rounded-full shadow-inner" />
                        </div>
                    ))}

                    {/* Precision Fixed Magnifier Circle */}
                    {draggingPoint !== null && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 rounded-full border-4 border-green-500 shadow-2xl bg-white animate-in zoom-in-50 ring-4 ring-white/50">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="absolute size-full flex items-center justify-center pointer-events-none z-10">
                                    <div className="w-full h-0.5 bg-green-500/50 absolute" />
                                    <div className="h-full w-0.5 bg-green-500/50 absolute" />
                                    <div className="size-3 border-2 border-red-500 rounded-full bg-white/50 shadow-sm" />
                                </div>
                            </div>
                            <img 
                                src={workflow === 'a4' ? originalA4Src! : (refiningSide === 'front' ? frontRaw! : backRaw!)} 
                                alt="magnify" 
                                className="absolute max-w-none origin-top-left"
                                style={{ 
                                    width: `${(imgRef.current?.width || 0) * 4}px`,
                                    height: `${(imgRef.current?.height || 0) * 4}px`,
                                    left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`,
                                    top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)`
                                }} 
                            />
                        </div>
                    )}
                  </div>

                  <div className="absolute bottom-8 flex justify-center w-full">
                       <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/70 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl">
                          <Move className="h-4 w-4 text-primary animate-pulse" /> Drag 4 dots to ID corners
                      </div>
                  </div>
              </CardContent>
              <CardFooter className="p-6 bg-white dark:bg-slate-950 border-t flex justify-between">
                  <Button variant="ghost" onClick={() => setStage('upload')} className="font-black text-[10px] uppercase h-12 px-6 rounded-xl border-2">CANCEL</Button>
                  <Button className="h-12 px-12 bg-primary font-black rounded-xl shadow-xl group" onClick={handleFinalizeCrop}>
                      APPLY SMART SCAN <ChevronRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
              </CardFooter>
          </Card>
      )}

      {/* STAGE 4: PREVIEW & PRINT */}
      {stage === 'preview' && frontFinal && backFinal && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 shadow-md border border-green-500/20">
                        <CheckCircle2 className="size-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Smart Scan Ready</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Standard 85.6mm x 54mm Alignment</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStage('upload')} className="h-12 border-2 px-6 font-black text-xs uppercase rounded-xl hover:bg-primary/5">
                        <RefreshCcw className="mr-2 size-4" /> Change / Re-align
                    </Button>
                    <Button onClick={handlePrint} className="h-12 px-10 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-2xl active:scale-95 transition-all">
                        <Printer className="mr-2 size-5" /> PRINT NOW
                    </Button>
                </div>
            </div>

            <div className="no-print">
                <Card className="border-2 shadow-2xl bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-white/50 dark:bg-black/20 border-b p-4 text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">300 DPI SCANNER QUALITY RENDERING</span>
                    </CardHeader>
                    <CardContent className="p-12 flex flex-col md:flex-row items-center justify-center gap-12">
                        <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block text-center opacity-60">FRONT PORTION</span>
                            <div className="relative shadow-2xl rounded-xl overflow-hidden border-[6px] border-white bg-white group hover:scale-[1.05] transition-all" style={{ width: '320px', height: '202px' }}>
                                <img src={frontFinal} alt="Front" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Badge className="bg-primary shadow-lg border-2 border-white font-black">ID-1 STANDARD</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block text-center opacity-60">BACK PORTION</span>
                            <div className="relative shadow-2xl rounded-xl overflow-hidden border-[6px] border-white bg-white group hover:scale-[1.05] transition-all" style={{ width: '320px', height: '202px' }}>
                                <img src={backFinal} alt="Back" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Badge className="bg-primary shadow-lg border-2 border-white font-black">ID-1 STANDARD</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-primary/5 p-6 border-t flex gap-4">
                        <ShieldCheck className="size-5 text-primary shrink-0" />
                        <p className="text-[11px] font-bold leading-relaxed text-primary/80 uppercase">
                            <strong>Safe & Private:</strong> This straightened rendering is generated 100% locally in your RAM. Your ID details never touch any external server.
                        </p>
                    </CardFooter>
                </Card>
            </div>

            <div className="hidden print:block print:m-0 print:p-0">
                <div className="flex flex-col items-center gap-12 pt-24">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-slate-800">DIGITAL IDENTITY MASTER</h2>
                        <p className="text-[9px] font-black uppercase opacity-40 mt-1">Straightened via GR7 Smart Scanner • High Fidelity 300 DPI</p>
                    </div>
                    
                    <div className="border-[1pt] border-slate-300 rounded-sm overflow-hidden bg-white shadow-sm" style={{ width: '85.6mm', height: '54mm' }}>
                        <img src={frontFinal} className="w-full h-full object-cover" alt="Front Print" />
                    </div>

                    <div className="border-[1pt] border-slate-300 rounded-sm overflow-hidden bg-white shadow-sm" style={{ width: '85.6mm', height: '54mm' }}>
                        <img src={backFinal} className="w-full h-full object-cover" alt="Back Print" />
                    </div>

                    <div className="mt-20 border-t-2 border-dashed w-48 border-slate-300 opacity-50"></div>
                </div>
            </div>
        </div>
      )}

      {/* Global CSS for Print & Magnifier */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\:block, .print\:block * {
            visibility: visible;
          }
          .print\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
      `}</style>
      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}

