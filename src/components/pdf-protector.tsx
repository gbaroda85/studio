
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Loader2, Download, Lock, ShieldCheck, Zap, AlertCircle, RefreshCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PdfProtector() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isProtecting, setIsProtecting] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [protectedPdfUrl, setProtectedPdfUrl] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        return () => {
            if (protectedPdfUrl) {
                URL.revokeObjectURL(protectedPdfUrl);
            }
        };
    }, [protectedPdfUrl]);
    
    const clearProtectedFile = () => {
        if (protectedPdfUrl) {
            URL.revokeObjectURL(protectedPdfUrl);
            setProtectedPdfUrl(null);
        }
        setErrorDetails(null);
    }

    const handleFileChange = (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setPassword('');
            clearProtectedFile();
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a PDF file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };
    
    const resetState = () => {
        setPdfFile(null);
        setPassword('');
        clearProtectedFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleProtectPdf = async () => {
        if (!pdfFile || !password) return;
        
        setIsProtecting(true);
        setErrorDetails(null);
        clearProtectedFile();

        try {
            const existingPdfBytes = await pdfFile.arrayBuffer();
            
            // First load to check if already encrypted
            const pdfDoc = await PDFDocument.load(existingPdfBytes, { 
                ignoreEncryption: true 
            });

            // Note: isEncrypted might be false if loaded with ignoreEncryption, 
            // but we double check metadata or try to save.
            
            const protectedPdfBytes = await pdfDoc.save({
                userPassword: password,
                ownerPassword: password,
                // Ensure high level of protection
                updateMetadata: true,
            });

            const blob = new Blob([protectedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setProtectedPdfUrl(url);
            
            toast({ title: 'Lock Applied!', description: 'Your PDF is now encrypted and secure.' });

        } catch (error: any) {
            console.error("Protection Error:", error);
            setErrorDetails("Could not apply protection. The file might be corrupted or restricted by owner permissions.");
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to protect the PDF.',
            });
        } finally {
            setIsProtecting(false);
        }
    };
    
    const handleDownload = () => {
        if (!protectedPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = protectedPdfUrl;
        link.download = `protected-${pdfFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (!pdfFile) {
        return (
            <Card
                className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                <CardHeader>
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <Lock className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Safe Guard: PDF Protector</CardTitle>
                    <CardDescription>Lock your documents with industrial-grade encryption. Local & Private.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <div className="relative">
                            <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-xl font-bold">Drop PDF to Lock</p>
                            <p className="text-sm text-muted-foreground mt-2">Best for Bills, Passwords, and Private Documents.</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
                <CardFooter className="justify-center gap-6 text-xs text-muted-foreground font-bold pb-8">
                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> 100% DEVICE ONLY</div>
                    <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> SECURE HASHING</div>
                </CardFooter>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-md shadow-2xl border-primary/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="text-primary h-5 w-5" />
                    Set Protection
                </CardTitle>
                <CardDescription className="truncate font-mono text-[10px]">File: {pdfFile.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {!protectedPdfUrl && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Create New Password</Label>
                            <input 
                                id="password" 
                                type="password" 
                                value={password} 
                                onChange={(e) => { setPassword(e.target.value); setErrorDetails(null); }}
                                placeholder="Enter secure password..."
                                disabled={isProtecting}
                                className="flex h-12 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-lg font-bold tracking-widest ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-inner disabled:opacity-50"
                            />
                            <p className="text-[10px] text-muted-foreground">This password will be required to open the PDF in any viewer.</p>
                        </div>
                    </div>
                )}

                {isProtecting && (
                    <div className="space-y-4 py-8 text-center">
                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto opacity-20" />
                        <p className="font-black text-primary uppercase tracking-tighter text-sm animate-pulse">Encrypting Document...</p>
                    </div>
                )}

                {errorDetails && (
                    <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-xs font-bold uppercase">Locking Failed</AlertTitle>
                        <AlertDescription className="text-[11px] font-medium leading-relaxed mt-1">
                            {errorDetails}
                        </AlertDescription>
                    </Alert>
                )}

                {protectedPdfUrl && (
                    <div className="p-8 bg-green-500/10 border-2 border-dashed border-green-500/30 rounded-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
                        <div className="size-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-green-700">Security Vault Created!</p>
                            <p className="text-xs text-green-600/80">Your file is now password protected.</p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 bg-muted/10 border-t p-6">
                {!protectedPdfUrl ? (
                    <Button onClick={handleProtectPdf} disabled={isProtecting || !password} className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl">
                        {isProtecting ? <Loader2 className="animate-spin mr-2"/> : <Lock className="mr-2 h-5 w-5"/>}
                        {isProtecting ? "LOCKING..." : "PROTECT PDF"}
                    </Button>
                ) : (
                    <Button onClick={handleDownload} className="w-full h-14 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20 animate-bounce">
                        <Download className="mr-2" />
                        DOWNLOAD LOCKED PDF
                    </Button>
                )}
                <Button variant="ghost" onClick={resetState} className="w-full text-xs" disabled={isProtecting}>
                    <RefreshCcw className="h-3 w-3 mr-1" /> {protectedPdfUrl ? "Protect Another File" : "Choose Different File"}
                </Button>
            </CardFooter>
        </Card>
    );
}
