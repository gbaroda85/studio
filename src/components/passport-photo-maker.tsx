
"use client";

import React, { useState, useRef, type ChangeEvent, type DragEvent, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
    UploadCloud, 
    Download, 
    Crop as CropIcon, 
    RefreshCcw, 
    Contact, 
    Maximize, 
    Settings2, 
    CheckCircle2, 
    ShieldCheck,
    Printer,
    User,
    Eraser,
    Palette,
    Shirt,
    Loader2,
    Move,
    RotateCcw,
    Sparkles,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

type Unit = 'cm' | 'mm' | 'inch' | 'px';

interface PhotoSize {
    label: string;
    width: number;
    height: number;
    unit: Unit;
    description: string;
}

const PRESETS: PhotoSize[] = [
    { label: "India (3.5x4.5cm)", width: 3.5, height: 4.5, unit: 'cm', description: "Standard Indian Passport" },
    { label: "USA (2x2in)", width: 2, height: 2, unit: 'inch', description: "US Visa / Passport" },
    { label: "Pan Card (2.5x3.5cm)", width: 2.5, height: 3.5, unit: 'cm', description: "Indian Pan Card" },
    { label: "Europe / UK", width: 3.5, height: 4.5, unit: 'cm', description: "EU Standard" },
];

const BG_COLORS = [
    { name: "White", value: "#FFFFFF" },
    { name: "Off White", value: "#F5F5F5" },
    { name: "Light Blue", value: "#ADD8E6" },
    { name: "Navy Blue", value: "#000080" },
    { name: "Light Grey", value: "#D3D3D3" },
];

const SUIT_OVERLAYS = [
    { id: 'none', label: 'Original', path: '' },
    { id: 'suit1', label: 'Formal Suit 1', path: 'M12,2L4,10V22H20V10L12,2M12,4.5L18.5,10.5V20.5H15.5V14.5H8.5V20.5H5.5V10.5L12,4.5M10.5,11.5V13H13.5V11.5H10.5Z' },
    { id: 'suit2', label: 'Formal Suit 2', path: 'M12,2L2,12H5V22H19V12H22L12,2M12,4.5L19.5,12H17V20H7V12H4.5L12,4.5Z' },
];

export default function PassportPhotoMaker() {
  const { toast } = useToast();
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Settings
  const [dpi, setDPI] = useState(300);
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(0);
  const [customWidth, setCustomWidth] = useState("3.5");
  const [customHeight, setCustomHeight] = useState("4.5");
  const [customUnit, setCustomUnit] = useState<Unit>('cm');

  // Studio States
  const [stage, setStage] = useState<'upload' | 'crop' | 'studio'>('upload');
  const [subjectImageSrc, setSubjectImageSrc] = useState<string | null>(null); 
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [selectedSuit, setSelectedSuit] = useState('none');
  
  const [subjectScale, setSubjectScale] = useState([100]);
  const [subjectX, setSubjectX] = useState([0]);
  const [subjectY, setSubjectY] = useState([0]);

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const studioCanvasRef = useRef<HTMLCanvasElement>(null);

  const getAspectRatio = () => {
      let w, h;
      if (selectedPreset === 'custom') {
          w = parseFloat(customWidth);
          h = parseFloat(customHeight);
      } else {
          w = PRESETS[selectedPreset as number].width;
          h = PRESETS[selectedPreset as number].height;
      }
      return (w || 3.5) / (h || 4.5);
  };

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
          setImgSrc(reader.result?.toString() || null);
          setStage('crop');
      };
      reader.readAsDataURL(file);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const aspect = getAspectRatio();
    const initialCrop = centerCrop(
        makeAspectCrop({ unit: '%', width: 80 }, aspect, width, height),
        width,
        height
    );
    setCrop(initialCrop);
  }

  const handleProceedToStudio = async () => {
    if (!imgRef.current || !completedCrop) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetW = 1200;
    const targetH = targetW / getAspectRatio();

    canvas.width = targetW;
    canvas.height = targetH;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0, targetW, targetH
    );

    const croppedData = canvas.toDataURL('image/jpeg', 0.95);
    setCroppedImage(croppedData);
    setSubjectImageSrc(croppedData);
    setStage('studio');
    setIsProcessing(false);
  };

  const handleRemoveBackground = async () => {
    if (!croppedImage) return;
    setIsRemovingBg(true);
    setProgress(10);

    try {
      const imglyModule = await import("@imgly/background-removal");
      const removeBackgroundFunc = imglyModule.removeBackground || imglyModule.default;
      
      const blob = await removeBackgroundFunc(croppedImage, {
        progress: (item, index, total) => {
            setProgress(Math.round((index / total) * 100));
        },
        output: { format: "image/png", quality: 0.95 }
      });

      const url = URL.createObjectURL(blob);
      setSubjectImageSrc(url);
      toast({ title: "Background Removed!", description: "AI successfully extracted the subject." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "AI Error", description: "Could not remove background." });
    } finally {
      setIsRemovingBg(false);
    }
  };

  useEffect(() => {
    if (stage !== 'studio' || !subjectImageSrc) return;

    const compose = () => {
        const canvas = studioCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const targetW = 1000; 
        const targetH = targetW / getAspectRatio();
        canvas.width = targetW;
        canvas.height = targetH;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const subjImg = new window.Image();
        subjImg.src = subjectImageSrc;
        subjImg.onload = () => {
            const s = subjectScale[0] / 100;
            const dw = canvas.width * s;
            const dh = (subjImg.height * (canvas.width / subjImg.width)) * s;
            
            const dx = (subjectX[0] / 100) * canvas.width;
            const dy = (subjectY[0] / 100) * canvas.height;

            const x = (canvas.width - dw) / 2 + dx;
            const y = (canvas.height - dh) / 2 + dy;

            ctx.drawImage(subjImg, x, y, dw, dh);
            setFinalResult(canvas.toDataURL('image/jpeg', 0.95));
        };
    };

    compose();
  }, [stage, subjectImageSrc, bgColor, subjectScale, subjectX, subjectY, selectedSuit, selectedPreset, customWidth, customHeight]);

  const handleDownload = () => {
      if (!finalResult) return;
      const link = document.createElement('a');
      link.href = finalResult;
      link.download = `passport-photo-${Date.now()}.jpg`;
      link.click();
  };

  const handleReset = () => {
      setStage('upload');
      setImgSrc(null);
      setImageFile(null);
      setCroppedImage(null);
      setSubjectImageSrc(null);
      setFinalResult(null);
      setSubjectScale([100]);
      setSubjectX([0]);
      setSubjectY([0]);
  };

  if (stage === 'upload') {
    return (
      <Card className="w-full max-w-2xl text-center transition-all duration-300 hover:border-primary/80 hover:shadow-2xl">
        <CardHeader>
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Contact className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-black font-headline">Passport Studio Pro</CardTitle>
          <CardDescription>AI-powered background change & formal cloth editor.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
                <p className="text-xl font-bold">Drop photo or Click to start</p>
                <p className="text-sm text-muted-foreground mt-2">Formalize your look in seconds.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
        </CardContent>
        <CardFooter className="justify-center gap-8 text-[10px] text-muted-foreground font-black pb-8">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> 100% PRIVATE AI</div>
            <div className="flex items-center gap-2"><Shirt className="h-4 w-4 text-primary" /> CLOTH OVERLAYS</div>
            <div className="flex items-center gap-2"><Eraser className="h-4 w-4 text-rose-500" /> BG REMOVER</div>
        </CardFooter>
      </Card>
    );
  }

  if (stage === 'crop') {
      return (
          <Card className="w-full max-w-4xl shadow-2xl animate-in zoom-in-95">
              <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="flex items-center gap-2"><CropIcon className="text-primary" /> Step 1: Crop Face</CardTitle>
                  <CardDescription>Select the face area. The ratio is locked based on country rules.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 flex items-center justify-center min-h-[400px]">
                  <div className="max-w-full overflow-hidden border-4 border-white shadow-xl rounded-lg">
                    {imgSrc && (
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={getAspectRatio()}
                            keepSelection
                        >
                            <img ref={imgRef} src={imgSrc} alt="Source" onLoad={onImageLoad} className="max-h-[60vh] w-auto object-contain" />
                        </ReactCrop>
                    )}
                  </div>
              </CardContent>
              <CardFooter className="justify-between bg-primary/5 p-6 border-t">
                  <div className="w-48">
                      <Label className="text-[10px] font-black uppercase">Country Preset</Label>
                      <Select value={String(selectedPreset)} onValueChange={(v) => setSelectedPreset(v === 'custom' ? 'custom' : Number(v))}>
                          <SelectTrigger className="h-10 font-bold"><SelectValue /></SelectTrigger>
                          <SelectContent>
                              {PRESETS.map((p, i) => <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>)}
                              <SelectItem value="custom">Custom Size</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="flex gap-3">
                      <Button variant="outline" onClick={handleReset} className="h-12 px-6 border-2 font-black">CANCEL</Button>
                      <Button onClick={handleProceedToStudio} disabled={!completedCrop || isProcessing} className="h-12 px-10 font-black bg-primary shadow-xl">
                          {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <Maximize className="mr-2" />}
                          PROCEED TO STUDIO
                      </Button>
                  </div>
              </CardFooter>
          </Card>
      );
  }

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-500">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
            <Card className="overflow-hidden border-2 shadow-2xl">
                <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" /> Studio Workspace
                    </CardTitle>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="sm" onClick={() => setStage('crop')} className="h-8 text-[10px] font-black">
                            <RotateCcw className="mr-1 h-3 w-3" /> RE-CROP
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-[10px] font-black text-rose-500">
                            <X className="mr-1 h-3 w-3" /> START OVER
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-8 bg-slate-100 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
                    {isRemovingBg && (
                         <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-center gap-4">
                            <Loader2 className="h-16 w-16 animate-spin text-primary" />
                            <div className="w-full max-w-xs space-y-2">
                                <p className="font-black text-primary uppercase tracking-tighter">AI REMOVING BACKGROUND...</p>
                                <Progress value={progress} className="h-2" />
                            </div>
                        </div>
                    )}
                    
                    <div className="relative p-2 bg-white shadow-2xl rounded ring-1 ring-black/5" style={{ aspectRatio: String(getAspectRatio()) }}>
                         <canvas ref={studioCanvasRef} className="max-h-[60vh] w-auto h-auto shadow-inner border" />
                    </div>

                    <div className="mt-8 flex gap-4 w-full justify-center">
                         <Button size="lg" onClick={handleDownload} className="h-14 px-16 bg-green-600 hover:bg-green-700 text-white font-black shadow-xl">
                            <Download className="mr-3 h-6 w-6" /> DOWNLOAD OFFICIAL PHOTO
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 shadow-xl border-primary/10">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2 font-headline">
                        <Settings2 className="h-5 w-5 text-primary" /> Studio Panel
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <Tabs defaultValue="bg" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="bg" className="text-xs font-bold">BACKGROUND</TabsTrigger>
                            <TabsTrigger value="cloth" className="text-xs font-bold">CLOTHES</TabsTrigger>
                            <TabsTrigger value="adjust" className="text-xs font-bold">FIT</TabsTrigger>
                        </TabsList>

                        <TabsContent value="bg" className="space-y-6">
                            <Button className="w-full h-12 bg-primary/10 text-primary border-2 border-primary/20 font-black" onClick={handleRemoveBackground} disabled={isRemovingBg}>
                                <Eraser className="mr-2 h-4 w-4" /> AUTO-REMOVE BACKGROUND
                            </Button>
                            
                            <div className="space-y-4 pt-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                                    <Palette className="h-3 w-3" /> Select Official Color
                                </Label>
                                <div className="grid grid-cols-5 gap-3">
                                    {BG_COLORS.map(c => (
                                        <button 
                                            key={c.value} 
                                            onClick={() => setBgColor(c.value)}
                                            className={cn(
                                                "size-10 rounded-xl border-2 transition-all",
                                                bgColor === c.value ? "border-primary ring-4 ring-primary/10 scale-110" : "border-transparent shadow-md"
                                            )}
                                            style={{ backgroundColor: c.value }}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="cloth" className="space-y-6">
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-center">
                                <Shirt className="h-5 w-5 text-amber-600 shrink-0" />
                                <p className="text-[11px] font-medium text-amber-800 leading-tight">
                                    <strong>Formal Overlay:</strong> Use the "FIT" tab to align your photo inside the suit. 
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {SUIT_OVERLAYS.map(suit => (
                                    <Button 
                                        key={suit.id} 
                                        variant={selectedSuit === suit.id ? "default" : "outline"}
                                        className="justify-start h-14 px-4 font-bold"
                                        onClick={() => setSelectedSuit(suit.id)}
                                    >
                                        <Shirt className="mr-3 h-5 w-5" /> {suit.label}
                                    </Button>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="adjust" className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-black uppercase flex items-center gap-1.5"><Maximize className="size-3" /> Zoom Subject</Label>
                                    <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-primary">{subjectScale[0]}%</span>
                                </div>
                                <Slider min={50} max={200} step={1} value={subjectScale} onValueChange={setSubjectScale} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-black uppercase flex items-center gap-1.5"><Move className="size-3" /> Horizontal Move</Label>
                                    <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{subjectX[0]}%</span>
                                </div>
                                <Slider min={-100} max={100} step={1} value={subjectX} onValueChange={setSubjectX} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-black uppercase flex items-center gap-1.5"><Move className="size-3" /> Vertical Move</Label>
                                    <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{subjectY[0]}%</span>
                                </div>
                                <Slider min={-100} max={100} step={1} value={subjectY} onValueChange={setSubjectY} />
                            </div>
                            
                            <Button variant="outline" className="w-full font-bold h-10 border-2" onClick={() => { setSubjectScale([100]); setSubjectX([0]); setSubjectY([0]); }}>
                                RESET POSITION
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t py-4 text-center">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest w-full">
                        Tip: White background is recommended for most official passports.
                    </p>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
