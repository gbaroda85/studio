
"use client";

import React, { useState, useRef } from 'react';
import { FileText, UploadCloud, X, FileOutput, CheckCircle, AlertCircle, Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { convertDocxToPdf } from '@/lib/docx-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

export default function DocxToPdf() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.toLowerCase().endsWith('.docx')) { 
        setFile(droppedFile); setIsSuccess(false); 
      } else {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a valid .docx Word file.' });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.toLowerCase().endsWith('.docx')) { 
        setFile(selectedFile); setIsSuccess(false); 
      } else {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a valid .docx Word file.' });
      }
    }
  };

  const removeFile = () => {
    setFile(null); setIsSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      await convertDocxToPdf(file);
      setIsSuccess(true);
      confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#5cbdb9', '#fbe3e8', '#ffffff']
      });
      toast({ title: 'Success!', description: 'DOCX successfully converted to PDF.' });
    } catch (error) {
      console.error(error); 
      toast({ variant: 'destructive', title: 'Conversion Error', description: 'Failed to convert document. Please try a simpler file.' });
    } finally { 
      setIsProcessing(false); 
    }
  };

  return (
    <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
      {/* Header Info */}
      <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
          <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
              <FileText className="size-8" />
              <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  <Sparkles className="size-2.5" />
              </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
              Word to <span className="text-gradient-hero">PDF Pro</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
              Convert DOCX files to high-quality PDF instantly. <br/>100% Private local browser mapping.
          </p>
      </div>

      <Card className={cn(
        "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20",
        dragActive && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
      )}>
        <CardHeader className="bg-muted/30 border-b p-6 text-center">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
        </CardHeader>
        <CardContent className="p-8 md:p-12">
          {!isSuccess ? (
            <div className="space-y-8">
              {!file ? (
                <div 
                  className={cn(
                    "border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group",
                    dragActive && "border-primary"
                  )}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" />
                  <div className="relative">
                    <UploadCloud className="size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Zap className="absolute -top-1 -right-1 size-6 text-yellow-500 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Drop Word File here</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-bold opacity-60">Supports .docx standard documents.</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-primary/5 border-2 border-primary/10 rounded-2xl flex items-center justify-between group animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-4 truncate">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                      <FileText className="size-6" />
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-black truncate uppercase tracking-tight" title={file.name}>{file.name}</div>
                      <Badge variant="secondary" className="text-[9px] font-mono mt-0.5">READY FOR CONVERSION</Badge>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/5" onClick={removeFile}>
                    <X size={20} />
                  </Button>
                </div>
              )}

              <Button 
                className="w-full h-18 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl group transition-all active:scale-95 disabled:opacity-50" 
                onClick={handleConvert} 
                disabled={!file || isProcessing}
              >
                {isProcessing ? (
                    <div className="flex items-center gap-3">
                        <Loader2 className="size-7 animate-spin" />
                        <span className="uppercase tracking-tighter">CONVERTING...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <FileOutput className="size-7 group-hover:scale-110 transition-transform" />
                        <span className="uppercase tracking-tighter">CONVERT TO PDF</span>
                    </div>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-500 py-6">
                <div className="size-24 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-green-500/40 relative">
                    <CheckCircle className="size-12" />
                    <Sparkles className="absolute -top-2 -right-2 text-yellow-400" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-green-700">CONVERTED!</h2>
                    <p className="text-sm text-muted-foreground font-bold">Your PDF has been generated and saved.</p>
                </div>
                <Button 
                    variant="outline" 
                    className="w-full h-16 rounded-2xl border-2 font-black text-xs uppercase tracking-widest hover:bg-primary/5" 
                    onClick={removeFile}
                >
                    CONVERT ANOTHER FILE
                </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/10 border-t p-6 flex justify-center gap-8">
            <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                <ShieldCheck className="size-4 text-green-500" /> SECURE RAM
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                <Zap className="size-4 text-yellow-500" /> 100% CLIENT-SIDE
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
