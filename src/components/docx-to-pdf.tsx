"use client";

import React, { useState, useRef } from 'react';
import { 
    FileText, 
    UploadCloud, 
    X, 
    FileOutput, 
    CheckCircle, 
    AlertCircle, 
    Loader2, 
    Sparkles, 
    ShieldCheck, 
    Zap, 
    RefreshCcw,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import { convertDocxToPdf } from '@/lib/docx-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import confetti from 'canvas-confetti';

export default function DocxToPdf() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
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
      if (droppedFile.name.toLowerCase().endsWith('.docx') || droppedFile.name.toLowerCase().endsWith('.doc')) { 
        setFile(droppedFile); 
        setIsSuccess(false);
        setRequiresPassword(false);
        setPassword("");
      } else {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a valid .docx or .doc Word file.' });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.toLowerCase().endsWith('.docx') || selectedFile.name.toLowerCase().endsWith('.doc')) { 
        setFile(selectedFile); 
        setIsSuccess(false);
        setRequiresPassword(false);
        setPassword("");
      } else {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a valid Word document.' });
      }
    }
  };

  const removeFile = () => {
    setFile(null); 
    setIsSuccess(false);
    setRequiresPassword(false);
    setPassword("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      await convertDocxToPdf(file, password);
      setIsSuccess(true);
      confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#5cbdb9', '#fbe3e8', '#ffffff']
      });
      toast({ title: 'Conversion Success!', description: 'Your PDF is ready for download.' });
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.toLowerCase().includes('password')) {
          setRequiresPassword(true);
          toast({ variant: 'destructive', title: 'File Protected', description: 'This document requires a password to convert.' });
      } else {
          toast({ variant: 'destructive', title: 'Conversion Error', description: msg });
      }
    } finally { 
      setIsProcessing(false); 
    }
  };

  return (
    <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
          <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xl relative">
              <FileText className="size-8" />
              <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  <Sparkles className="size-2.5" />
              </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
              Word to <span className="text-gradient-hero">PDF Cloud</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
              Professional high-fidelity conversion. <br/>Supports encrypted and complex Word documents.
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
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".docx,.doc" className="hidden" />
                  <div className="relative">
                    <UploadCloud className="size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Zap className="absolute -top-1 -right-1 size-6 text-yellow-500 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Drop Word File here</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-bold opacity-60 uppercase">Supports .doc & .docx documents.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="p-6 bg-primary/5 border-2 border-primary/10 rounded-2xl flex items-center justify-between group shadow-sm">
                      <div className="flex items-center gap-4 truncate">
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                          <FileText className="size-6" />
                        </div>
                        <div className="truncate text-left">
                          <div className="text-sm font-black truncate uppercase tracking-tight" title={file.name}>{file.name}</div>
                          <Badge variant="secondary" className="text-[9px] font-mono mt-0.5">READY FOR CLOUD CONVERSION</Badge>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/5" onClick={removeFile}>
                        <X size={20} />
                      </Button>
                    </div>

                    {requiresPassword && (
                        <div className="space-y-4 animate-in slide-in-from-top-4">
                            <Alert className="bg-orange-50 border-orange-100 rounded-2xl">
                                <Lock className="size-4 text-orange-600" />
                                <AlertTitle className="text-[10px] font-black uppercase text-orange-700">Protected Document</AlertTitle>
                                <AlertDescription className="text-[11px] font-bold text-orange-600 uppercase">
                                    This file is encrypted. Please enter the password to continue.
                                </AlertDescription>
                            </Alert>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Enter Password</Label>
                                <div className="relative">
                                    <Input 
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 text-lg font-bold border-2 rounded-xl bg-background/50 pl-4 pr-12 focus:ring-primary/20"
                                        placeholder="••••••••"
                                        autoFocus
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
              )}

              <Button 
                className="w-full h-18 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl group transition-all active:scale-95 disabled:opacity-50" 
                onClick={handleConvert} 
                disabled={!file || isProcessing || (requiresPassword && !password)}
              >
                {isProcessing ? (
                    <div className="flex items-center gap-3">
                        <Loader2 className="size-7 animate-spin" />
                        <span className="uppercase tracking-tighter">CONVERTING...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        {requiresPassword ? <Lock className="size-7 group-hover:rotate-12 transition-transform" /> : <FileOutput className="size-7 group-hover:scale-110 transition-transform" />}
                        <span className="uppercase tracking-tighter">{requiresPassword ? 'UNLOCK & CONVERT' : 'CONVERT TO PDF'}</span>
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
                    <p className="text-sm text-muted-foreground font-bold">Your document was processed via API and saved.</p>
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
                <ShieldCheck className="size-4 text-green-500" /> SECURE HANDSHAKE
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                <Zap className="size-4 text-yellow-500" /> AES DECRYPTION
            </div>
        </CardFooter>
      </Card>
      
      {/* Help Note */}
      <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-center gap-4 max-w-xl">
          <AlertCircle className="size-5 text-blue-500 shrink-0" />
          <p className="text-[10px] text-blue-700 font-bold leading-tight uppercase">
              Encrypted Word documents are supported. Our engine securely handles passwords to ensure layout preservation during PDF rendering.
          </p>
      </div>
    </div>
  );
}
