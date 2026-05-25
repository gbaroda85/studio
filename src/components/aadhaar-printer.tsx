"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { 
    UploadCloud, 
    Printer, 
    X, 
    Loader2, 
    ShieldCheck, 
    Zap, 
    RotateCcw,
    CheckCircle2,
    FileImage,
    Crop,
    MousePointer2,
    AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AadhaarPrinter() {
  const { toast } = useToast();
  const [frontSrc, setFrontSrc] = useState<string | null>(null);
  const [backSrc, setBackSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAadhaar = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please upload an image file (JPG or PNG)." });
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        // Aadhaar card portion is typically at the bottom of the A4 page
        // Standard A4 aspect ratio is ~1.414. 
        // We crop the bottom 25-30% of the image.
        const cropHeight = img.height * 0.3;
        const startY = img.height - cropHeight;
        
        canvas.width = img.width;
        canvas.height = cropHeight;
        
        ctx.drawImage(img, 0, startY, img.width, cropHeight, 0, 0, img.width, canvas.height);
        
        // Split the bottom strip into two equal vertical halves (Front and Back)
        const halfWidth = img.width / 2;
        
        // Front (Left Half)
        const frontCanvas = document.createElement("canvas");
        frontCanvas.width = halfWidth;
        frontCanvas.height = canvas.height;
        const fCtx = frontCanvas.getContext("2d");
        fCtx?.drawImage(canvas, 0, 0, halfWidth, canvas.height, 0, 0, halfWidth, canvas.height);
        setFrontSrc(frontCanvas.toDataURL("image/png"));
        
        // Back (Right Half)
        const backCanvas = document.createElement("canvas");
        backCanvas.width = halfWidth;
        backCanvas.height = canvas.height;
        const bCtx = backCanvas.getContext("2d");
        bCtx?.drawImage(canvas, halfWidth, 0, halfWidth, canvas.height, 0, 0, halfWidth, canvas.height);
        setBackSrc(backCanvas.toDataURL("image/png"));
        
        setIsProcessing(false);
        toast({ title: "Crop Successful!", description: "Aadhaar Card extracted and arranged." });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) processAadhaar(e.target.files[0]);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setFrontSrc(null);
    setBackSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-4xl animate-in fade-in duration-500">
      
      {/* 1. UPLOAD SECTION */}
      {!frontSrc && (
        <Card className={cn(
            "border-2 border-dashed transition-all duration-300 relative overflow-hidden bg-card/50 text-center",
            "hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/10",
            isDragOver && "border-primary bg-primary/5 shadow-2xl scale-[1.01]"
        )}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if(e.dataTransfer.files[0]) processAadhaar(e.dataTransfer.files[0]); }}
        >
            <CardHeader className="pt-12">
                <div className="mx-auto mb-6 grid size-20 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-inner">
                    <Printer className="size-10" />
                </div>
                <CardTitle className="text-3xl font-black uppercase tracking-tighter">Aadhaar Card Printer</CardTitle>
                <CardDescription className="text-sm font-medium">Upload your A4 e-Aadhaar image for instant cropping.</CardDescription>
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
                        <p className="text-xl font-bold">Drop e-Aadhaar JPG here</p>
                        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-black opacity-60">100% SECURE • NO SERVER UPLOADS</p>
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
            </CardContent>
            <CardFooter className="justify-center gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] bg-muted/10 py-6">
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-500" /> LOCAL RAM</div>
                <div className="flex items-center gap-1.5"><Crop className="size-3.5 text-primary" /> AUTO-CROP</div>
                <div className="flex items-center gap-1.5"><Printer className="size-3.5 text-blue-500" /> EASY PRINT</div>
            </CardFooter>
        </Card>
      )}

      {/* 2. PREVIEW & PRINT SECTION */}
      {frontSrc && backSrc && (
        <div className="space-y-10">
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
                    <Button variant="outline" onClick={handleReset} className="h-12 border-2 px-6 font-black text-xs uppercase rounded-xl">
                        <RotateCcw className="mr-2 size-4" /> Change Image
                    </Button>
                    <Button onClick={handlePrint} className="h-12 px-10 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-2xl active:scale-95 transition-all">
                        <Printer className="mr-2 size-5" /> PRINT NOW
                    </Button>
                </div>
            </div>

            {/* Visual Screen Preview (ID Layout) */}
            <div className="no-print">
                <Card className="border-2 shadow-2xl bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-white/50 dark:bg-black/20 border-b p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-center text-muted-foreground">Digital Preview (Front & Back)</p>
                    </CardHeader>
                    <CardContent className="p-12 flex flex-col md:flex-row items-center justify-center gap-12">
                        {/* Front Card UI */}
                        <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block text-center">FRONT SIDE</span>
                            <div className="relative shadow-2xl rounded-xl overflow-hidden border-[6px] border-white bg-white group hover:scale-[1.02] transition-transform" style={{ width: '320px', height: '202px' }}>
                                <img src={frontSrc} alt="Front" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Badge className="bg-primary">85.6mm x 54mm</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Back Card UI */}
                        <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block text-center">BACK SIDE</span>
                            <div className="relative shadow-2xl rounded-xl overflow-hidden border-[6px] border-white bg-white group hover:scale-[1.02] transition-transform" style={{ width: '320px', height: '202px' }}>
                                <img src={backSrc} alt="Back" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Badge className="bg-primary">85.6mm x 54mm</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-primary/5 p-6 border-t flex gap-4">
                        <AlertCircle className="size-5 text-primary shrink-0" />
                        <p className="text-[10px] font-bold leading-relaxed text-primary/80">
                            <strong>Note:</strong> We automatically crop the bottom of the image. Ensure your A4 Aadhaar scan has the ID at the standard bottom position for the best result.
                        </p>
                    </CardFooter>
                </Card>
            </div>

            {/* 3. HIDDEN PRINT CONTAINER (Only visible during window.print()) */}
            <div className="hidden print:block print:m-0 print:p-0">
                <div className="flex flex-col items-center gap-12 pt-20">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold uppercase tracking-widest">Digital Aadhaar ID Card</h2>
                        <p className="text-[10px] uppercase opacity-50">Cut along the borders and fold</p>
                    </div>
                    
                    {/* Front Side Print */}
                    <div className="border-[1.5pt] border-slate-300 rounded-sm overflow-hidden" style={{ width: '85.6mm', height: '54mm' }}>
                        <img src={frontSrc} className="w-full h-full object-cover" alt="Front Print" />
                    </div>

                    {/* Back Side Print */}
                    <div className="border-[1.5pt] border-slate-300 rounded-sm overflow-hidden" style={{ width: '85.6mm', height: '54mm' }}>
                        <img src={backSrc} className="w-full h-full object-cover" alt="Back Print" />
                    </div>

                    <div className="mt-20 border-t border-dashed w-32 border-slate-200"></div>
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
