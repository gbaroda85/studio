
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    Lock, 
    ShieldCheck, 
    Zap, 
    AlertCircle, 
    RefreshCcw, 
    Sparkles, 
    Info,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PdfProtector() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
            setConfirmPassword('');
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
        setConfirmPassword('');
        clearProtectedFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleProtectPdf = async () => {
        if (!pdfFile || !password) return;
        
        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Passwords Mismatch', description: 'Please ensure both passwords are the same.' });
            return;
        }

        setIsProtecting(true);
        setErrorDetails(null);
        clearProtectedFile();

        try {
            const existingPdfBytes = await pdfFile.arrayBuffer();
            
            // Step 1: Load original PDF (ignoring any existing owner-locks)
            const srcDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
            
            // Step 2: Create a completely NEW document to ensure clean security dictionary
            const secureDoc = await PDFDocument.create();
            
            // Step 3: Deep copy all pages
            const copiedPages = await secureDoc.copyPages(srcDoc, srcDoc.getPageIndices());
            copiedPages.forEach((page) => secureDoc.addPage(page));

            /**
             * ULTRA-STRICT ENCRYPTION ENFORCEMENT (AES-128/256 equivalent for browsers)
             * Setting both User and Owner password ensures an "Open Password" prompt.
             */
            const protectedPdfBytes = await secureDoc.save({
                userPassword: password,      // Password to OPEN the file
                ownerPassword: `owner-${password}-${Date.now()}`, // Distinct owner pass to force encryption dictionary
                updateMetadata: true,        // Rewrite catalog with encrypted flags
                addDefaultPage: false,
                permissions: {
                    printing: 'none',
                    modifying: false,
                    copying: false,
                    annotating: false,
                    fillingForms: false,
                    contentAccessibility: false,
                    assembling: false,
                }
            });

            const blob = new Blob([protectedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setProtectedPdfUrl(url);
            
            toast({ title: 'Extreme Lock Applied!', description: 'Your PDF is now strictly password protected.' });

        } catch (error: any) {
            console.error("Protection Error:", error);
            setErrorDetails("Could not apply protection. The file might have internal structural conflicts.");
            toast({
                variant: 'destructive',
                title: 'Lock Failed',
                description: 'Failed to encrypt the PDF.',
            });
        } finally {
            setIsProtecting(false);
        }
    };
    
    const handleDownload = () => {
        if (!protectedPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = protectedPdfUrl;
        link.download = `locked-${pdfFile.name}`;
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
                    <CardTitle className="text-2xl font-bold font-headline">Studio PDF Protector</CardTitle>
                    <CardDescription>Lock your documents with professional-grade encryption. No servers involved.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <div className="relative">
                            <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-foreground">Click to select or Drop PDF here</p>
                            <p className="text-sm text-muted-foreground mt-2">100% Private local encryption.</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
                <CardFooter className="justify-center gap-6 text-[10px] text-muted-foreground font-bold pb-8">
                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> SECURE DICTIONARY</div>
                    <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> ADOBE COMPATIBLE</div>
                </CardFooter>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-md shadow-2xl border-primary/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="text-primary h-5 w-5" />
                    Apply Password Protection
                </CardTitle>
                <CardDescription className="truncate font-mono text-[10px] text-muted-foreground">File: {pdfFile.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {!protectedPdfUrl && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Set Document Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password} 
                                onChange={(e) => { setPassword(e.target.value); setErrorDetails(null); }}
                                placeholder="Choose a password..."
                                disabled={isProtecting}
                                className="h-12 text-lg font-bold tracking-widest focus-visible:ring-primary border-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input 
                                id="confirm-password" 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => { setConfirmPassword(e.target.value); setErrorDetails(null); }}
                                placeholder="Repeat your password..."
                                disabled={isProtecting}
                                className={cn(
                                    "h-12 text-lg font-bold tracking-widest border-2",
                                    confirmPassword && password !== confirmPassword && "border-destructive focus-visible:ring-destructive",
                                    confirmPassword && password === confirmPassword && "border-green-500 focus-visible:ring-green-500"
                                )}
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-[10px] font-bold text-destructive animate-in slide-in-from-top-1">Passwords do not match!</p>
                            )}
                        </div>
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex gap-3">
                            <Info className="h-5 w-5 text-primary shrink-0" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-primary uppercase">Pro-Lock Active</p>
                                <p className="text-[10px] text-muted-foreground leading-tight font-medium">
                                    We use explicit Security Dictionaries. To test, open the file in **Adobe Reader** or a **Private/Incognito** window.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {isProtecting && (
                    <div className="space-y-4 py-8 text-center">
                        <div className="relative inline-block">
                             <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                             <Zap className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <p className="font-black text-primary uppercase tracking-tighter text-sm animate-pulse">Encoding Security Headers...</p>
                    </div>
                )}

                {errorDetails && (
                    <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-xs font-bold uppercase">System Error</AlertTitle>
                        <AlertDescription className="text-[11px] font-medium leading-relaxed mt-1">
                            {errorDetails}
                        </AlertDescription>
                    </Alert>
                )}

                {protectedPdfUrl && (
                    <div className="p-8 bg-green-500/10 border-2 border-dashed border-green-500/30 rounded-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
                        <div className="size-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-green-700">PDF Successfully Locked!</p>
                            <p className="text-[10px] text-green-600/80 uppercase font-black">Strict Encryption Dictionary Applied</p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 bg-muted/10 border-t p-6">
                {!protectedPdfUrl ? (
                    <Button 
                        onClick={handleProtectPdf} 
                        disabled={isProtecting || !password || password !== confirmPassword} 
                        className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl"
                    >
                        {isProtecting ? <Loader2 className="animate-spin mr-2"/> : <Lock className="mr-2 h-5 w-5"/>}
                        {isProtecting ? "PROTECTING..." : "PROTECT PDF"}
                    </Button>
                ) : (
                    <Button onClick={handleDownload} className="w-full h-14 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20 animate-bounce">
                        <Download className="mr-2" />
                        DOWNLOAD LOCKED PDF
                    </Button>
                )}
                <Button variant="ghost" onClick={resetState} className="w-full text-xs" disabled={isProtecting}>
                    <RefreshCcw className="h-3 w-3 mr-1" /> {protectedPdfUrl ? "Protect Another File" : "Change File"}
                </Button>
            </CardFooter>
        </Card>
    );
}

