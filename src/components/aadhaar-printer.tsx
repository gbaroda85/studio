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
    Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

type Stage = 'upload' | 'password' | 'refine' | 'preview';

export default function AadhaarPrinter() {
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>('upload');
  const [fileType, setFileType] = useState<'image' | 'pdf'>('image');
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [password, setPassword] = useState("");
  
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [frontSrc, setFrontSrc] = useState<string | null>(null);
  const [backSrc, setBackSrc] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Crop States
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFile = (file: File) => {
    if (file.type === 'application/pdf') {
        setFileType('pdf');
        const reader = new FileReader();
        reader.onload = (e) => {
            setPdfBuffer(e.target?.result as ArrayBuffer);
            setStage('password');
        };
        reader.readAsArrayBuffer(file);
    } else if (file.type.startsWith('image/')) {
        setFileType('image');
        const reader = new FileReader();
        reader.onload = (e) => {
            setOriginalImageSrc(e.target?.result as string);
            setStage('refine');
        };
        reader.readAsDataURL(file);
    } else {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a PDF or an Image.' });
    }
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
        const page = await pdf.getPage(pdf.numPages); // Aadhaar is usually on the last page
        
        const viewport = page.getViewport({ scale: 2.5 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;
            setOriginalImageSrc(canvas.toDataURL('image/jpeg', 0.95));
            setStage('refine');
        }
    } catch (error: any) {
        if (error.name === 'PasswordException') {
            toast({ variant: 'destructive', title: 'Wrong Password', description: 'Check Aadhaar password format (ANIS1990).' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to process PDF.' });
        }
    } finally {
        setIsProcessing(false);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // Initial crop: Bottom 30% of A4 page
    const initialCrop = centerCrop(
        { unit: '%', width: 95, height: 28 }, 
        width, 
        height
    );
    // Push initial crop to bottom
    initialCrop.y = 70; 
    setCrop(initialCrop);
  };

  const handleFinalizeCrop = () => {
    if (!imgRef.current || !completedCrop) return;
    
    setIsProcessing(true);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    const targetW = completedCrop.width * scaleX;
    const targetH = completedCrop.height * scaleY;
    
    canvas.width = targetW;
    canvas.height = targetH;
    
    ctx.drawImage(
        imgRef.current, 
        completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 
        0, 0, targetW, targetH
    );
    
    // Split into Front and Back
    const halfWidth = canvas.width / 2;
    
    // Front (Left)
    const frontCanvas = document.createElement("canvas");
    frontCanvas.width = halfWidth;
    frontCanvas.height = canvas.height;
    frontCanvas.getContext("2d")?.drawImage(canvas, 0, 0, halfWidth, canvas.height, 0, 0, halfWidth, canvas.height);
    setFrontSrc(frontCanvas.toDataURL("image/png"));
    
    // Back (Right)
    const backCanvas = document.createElement("canvas");
    backCanvas.width = halfWidth;
    backCanvas.height = canvas.height;
    backCanvas.getContext("2d")?.drawImage(canvas, halfWidth, 0, halfWidth, canvas.height, 0, 0, halfWidth, canvas.height);
    setBackSrc(backCanvas.toDataURL("image/png"));
    
    setStage('preview');
    setIsProcessing(false);
    toast({ title: "Precision Crop Applied", description: "Aadhaar Card arranged for printing." });
  };

  const handlePrint = () => window.print();

  const handleReset = () => {
    setStage('upload');
    setOriginalImageSrc(null);
    setFrontSrc(null);
    setBackSrc(null);
    setPdfBuffer(null);
    setPassword("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-5xl animate-in fade-in duration-500">
      
      {/* STAGE 1: UPLOAD */}
      {stage === 'upload' && (
        <Card className={cn(
            "border-2 border-dashed transition-all duration-300 relative overflow-hidden bg-card/50 text-center",
            "hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/10",
            isDragOver && "border-primary bg-primary/5 shadow-2xl scale-[1.01]"
        )}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        >
            <CardHeader className="pt-12">
                <div className="mx-auto mb-6 grid size-20 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-inner">
                    <Printer className="size-10" />
                </div>
                <CardTitle className="text-3xl font-black uppercase tracking-tighter">Aadhaar Card Easy Printer</CardTitle>
                <CardDescription className="text-sm font-medium">Upload your A4 e-Aadhaar (PDF or Image) for precision printing.</CardDescription>
            </CardHeader>
            <CardContent className="pb-12">
                <div 
                    className="border-3 border-dashed border-muted-foreground/20 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="relative">
                        <UploadCloud className="size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Zap className="absolute -top-2 -right-2 size-6 text-yellow-500 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-xl font-bold">Drop Original PDF or JPG here</p>
                        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-black opacity-60">100% SECURE • LOCAL RAM ONLY</p>
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </CardContent>
            <CardFooter className="justify-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] bg-muted/10 py-6">
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-500" /> ENCRYPTED RAM</div>
                <div className="flex items-center gap-1.5"><FileText className="size-3.5 text-primary" /> PDF SUPPORT</div>
                <div className="flex items-center gap-1.5"><Printer className="size-3.5 text-blue-500" /> ISO STANDARD</div>
            </CardFooter>
        </Card>
      )}

      {/* STAGE 2: PASSWORD */}
      {stage === 'password' && (
        <Card className="w-full max-w-md mx-auto shadow-2xl animate-in zoom-in-95 duration-300 rounded-[2.5rem]">
            <CardHeader className="bg-primary/5 p-6 border-b">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <Lock className="size-5 text-primary" /> Aadhaar Password
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase opacity-60">Enter PDF Password</Label>
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
                            Format: First 4 letters of NAME (CAPS) + Year of Birth. <br/>Example: <strong>ANIS1990</strong>
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-6 bg-muted/5 border-t">
                <Button onClick={handlePdfRender} disabled={isProcessing || !password} className="w-full h-14 bg-primary font-black rounded-xl">
                    {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2 h-4 w-4" />}
                    UNLOCK & RENDER
                </Button>
            </CardFooter>
        </Card>
      )}

      {/* STAGE 3: REFINE CROP */}
      {stage === 'refine' && originalImageSrc && (
          <Card className="w-full max-w-4xl mx-auto shadow-2xl overflow-hidden rounded-[2.5rem]">
              <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <Crop className="size-5 text-primary" /> Precision Selection
                    </CardTitle>
                    <CardDescription className="text-xs font-bold uppercase opacity-60">Adjust handles to fit the ID portion perfectly.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={handleReset} className="text-destructive"><X /></Button>
              </CardHeader>
              <CardContent className="p-8 bg-slate-900/5 flex items-center justify-center min-h-[500px]">
                  <div className="max-h-[60vh] overflow-hidden rounded-xl border-4 border-white shadow-2xl">
                    <ReactCrop 
                        crop={crop} 
                        onChange={setCrop} 
                        onComplete={setCompletedCrop}
                    >
                        <img 
                            ref={imgRef} 
                            src={originalImageSrc} 
                            onLoad={onImageLoad}
                            alt="source" 
                            className="max-h-[60vh] w-auto object-contain block" 
                        />
                    </ReactCrop>
                  </div>
              </CardContent>
              <CardFooter className="p-6 bg-white dark:bg-slate-950 border-t flex justify-between">
                  <Button variant="outline" onClick={handleReset} className="font-black text-xs uppercase h-12 rounded-xl border-2">CANCEL</Button>
                  <Button className="h-12 px-12 bg-primary font-black rounded-xl shadow-xl group" onClick={handleFinalizeCrop}>
                      GENERATE PREVIEW <ChevronRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
              </CardFooter>
          </Card>
      )}

      {/* STAGE 4: PREVIEW & PRINT */}
      {stage === 'preview' && frontSrc && backSrc && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 shadow-md border border-green-500/20">
                        <CheckCircle2 className="size-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Ready for Print</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Standard ID Size: 85.6mm x 54mm</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStage('refine')} className="h-12 border-2 px-6 font-black text-xs uppercase rounded-xl">
                        <Crop className="mr-2 size-4" /> Re-Crop
                    </Button>
                    <Button onClick={handlePrint} className="h-12 px-10 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-2xl active:scale-95 transition-all">
                        <Printer className="mr-2 size-5" /> PRINT NOW
                    </Button>
                </div>
            </div>

            <div className="no-print">
                <Card className="border-2 shadow-2xl bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-white/50 dark:bg-black/20 border-b p-4 text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Studio Rendering Flow</span>
                    </CardHeader>
                    <CardContent className="p-12 flex flex-col md:flex-row items-center justify-center gap-12">
                        <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block text-center">FRONT SIDE</span>
                            <div className="relative shadow-2xl rounded-xl overflow-hidden border-[6px] border-white bg-white group hover:scale-[1.05] transition-all" style={{ width: '320px', height: '202px' }}>
                                <img src={frontSrc} alt="Front" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Badge className="bg-primary shadow-lg border-2 border-white">85.6mm x 54mm</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block text-center">BACK SIDE</span>
                            <div className="relative shadow-2xl rounded-xl overflow-hidden border-[6px] border-white bg-white group hover:scale-[1.05] transition-all" style={{ width: '320px', height: '202px' }}>
                                <img src={backSrc} alt="Back" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Badge className="bg-primary shadow-lg border-2 border-white">85.6mm x 54mm</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-primary/5 p-6 border-t flex gap-4">
                        <AlertCircle className="size-5 text-primary shrink-0" />
                        <p className="text-[11px] font-bold leading-relaxed text-primary/80 uppercase">
                            <strong>Note:</strong> Content is rendered at 300 DPI. For best results, use "High Quality" and "Actual Size" in your printer settings.
                        </p>
                    </CardFooter>
                </Card>
            </div>

            {/* PRINT CONTAINER */}
            <div className="hidden print:block print:m-0 print:p-0">
                <div className="flex flex-col items-center gap-12 pt-24">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-slate-800">DIGITAL IDENTITY CARD</h2>
                        <p className="text-[9px] font-black uppercase opacity-40 mt-1">Generated via GR7 Studio • 300 DPI Lossless Render</p>
                    </div>
                    
                    <div className="border-[1pt] border-slate-300 rounded-sm overflow-hidden bg-white shadow-sm" style={{ width: '85.6mm', height: '54mm' }}>
                        <img src={frontSrc} className="w-full h-full object-cover" alt="Front Print" />
                    </div>

                    <div className="border-[1pt] border-slate-300 rounded-sm overflow-hidden bg-white shadow-sm" style={{ width: '85.6mm', height: '54mm' }}>
                        <img src={backSrc} className="w-full h-full object-cover" alt="Back Print" />
                    </div>

                    <div className="mt-20 border-t-2 border-dashed w-48 border-slate-300 opacity-50"></div>
                </div>
            </div>
        </div>
      )}

      {/* Global CSS for Print */}
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
      `}</style>
    </div>
  );
}
