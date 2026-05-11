
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Loader2, Download, Unlock, AlertCircle, ShieldAlert, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PdfUnlocker() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [unlockedPdfUrl, setUnlockedPdfUrl] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Detect if the file is likely an Aadhaar card based on name
    const isAadhaar = pdfFile?.name.toLowerCase().includes('aadhaar') || pdfFile?.name.toLowerCase().includes('eaadhaar');
    
    useEffect(() => {
        return () => {
            if (unlockedPdfUrl) URL.revokeObjectURL(unlockedPdfUrl);
        }
    }, [unlockedPdfUrl]);
    
    const clearUnlockedFile = () => {
        if (unlockedPdfUrl) {
            URL.revokeObjectURL(unlockedPdfUrl);
            setUnlockedPdfUrl(null);
        }
        setErrorDetails(null);
    }

    const handleFileChange = (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setPassword('');
            clearUnlockedFile();
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
        clearUnlockedFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleUnlockPdf = async () => {
        if (!pdfFile) return;
        
        setIsUnlocking(true);
        setErrorDetails(null);
        clearUnlockedFile();

        try {
            const pdfBytes = await pdfFile.arrayBuffer();

            // First check if it's even encrypted
            const checkDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            if (!checkDoc.isEncrypted) {
                toast({ variant: 'destructive', title: 'Not Protected', description: 'This PDF is already unlocked.' });
                setIsUnlocking(false);
                return;
            }

            // Attempt to load with the provided password
            let pdfDoc;
            try {
                pdfDoc = await PDFDocument.load(pdfBytes, {
                    userPassword: password,
                });
            } catch (loadError: any) {
                const errMsg = loadError.message?.toLowerCase() || "";
                
                // Specific checks for Aadhaar and modern encryption
                if (errMsg.includes('aes-256') || errMsg.includes('unsupported') || errMsg.includes('encryption')) {
                    throw new Error("UNSUPPORTED_ENCRYPTION");
                }
                
                if (errMsg.includes('password')) {
                    throw new Error("WRONG_PASSWORD");
                }
                
                throw loadError;
            }

            // To "unlock", we create a brand new document and copy pages
            const unlockedDoc = await PDFDocument.create();
            const pageIndices = pdfDoc.getPageIndices();
            
            if (pageIndices.length === 0) {
                throw new Error("NO_PAGES");
            }

            const copiedPages = await unlockedDoc.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach((page) => unlockedDoc.addPage(page));

            const unlockedPdfBytes = await unlockedDoc.save();
            
            const blob = new Blob([unlockedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setUnlockedPdfUrl(url);
            
            toast({ title: 'Success!', description: 'PDF Unlocked successfully.' });
        } catch (error: any) {
            console.error("Unlock Error:", error);
            
            if (error.message === "UNSUPPORTED_ENCRYPTION") {
                setErrorDetails("This file uses advanced encryption (AES-256) which is often not supported in standard browsers. EAadhaar files are difficult to unlock via web tools.");
            } else if (error.message === "WRONG_PASSWORD") {
                setErrorDetails("The password you entered is incorrect. Please check and try again.");
            } else if (error.message === "NO_PAGES") {
                setErrorDetails("The document was loaded but no pages were found. It might be corrupt.");
            } else {
                setErrorDetails("A technical error occurred while processing this secure file. It might be using a non-standard security format.");
            }
            
            toast({ 
                variant: 'destructive', 
                title: 'Unlock Failed', 
                description: 'We encountered a problem with this file.' 
            });
        } finally {
            setIsUnlocking(false);
        }
    };
    
    const handleDownload = () => {
        if (!unlockedPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = unlockedPdfUrl;
        link.download = `unlocked-${pdfFile.name}`;
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
                    <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Unlock className="text-primary h-6 w-6" /> PDF Unlocker
                    </CardTitle>
                    <CardDescription>Upload a password-protected PDF to remove security.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground"><span className="text-primary font-semibold">Click to upload</span> or drag and drop a PDF</p>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
                <CardFooter className="justify-center text-xs text-muted-foreground">
                    <ShieldAlert className="h-3 w-3 mr-1" /> All processing is local. Your privacy is guaranteed.
                </CardFooter>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-md shadow-2xl border-primary/10">
            <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg">Remove PDF Security</CardTitle>
                <CardDescription className="truncate">File: {pdfFile.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {!unlockedPdfUrl && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <Label htmlFor="password">Enter PDF Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password} 
                                onChange={(e) => { setPassword(e.target.value); setErrorDetails(null); }}
                                placeholder="Enter password to unlock"
                                disabled={isUnlocking}
                                className="h-12 text-lg border-2 focus-visible:ring-primary"
                            />
                        </div>
                        
                        {isAadhaar && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 flex gap-3">
                                <Info className="h-5 w-5 text-blue-500 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">Aadhaar Password Tip</p>
                                    <p className="text-[11px] text-blue-600 dark:text-blue-400">
                                        Use FIRST 4 LETTERS of your name (CAPITAL) and YEAR of birth. 
                                        <br/>Example: <span className="font-mono font-bold">ANIS1990</span>
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {!isAadhaar && (
                            <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                                Note: High-security corporate or government PDFs (like Aadhaar) often use encryption that isn't supported by web-based unlockers.
                            </p>
                        )}
                    </div>
                )}

                {errorDetails && (
                    <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Unlock Error</AlertTitle>
                        <AlertDescription className="text-[11px] font-medium leading-relaxed">
                            {errorDetails}
                        </AlertDescription>
                    </Alert>
                )}

                {unlockedPdfUrl && (
                    <div className="p-8 bg-green-500/10 border-2 border-dashed border-green-500/30 rounded-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
                        <div className="size-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                            <Download className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-green-700">Decryption Successful!</p>
                            <p className="text-xs text-green-600/80">Security removed. You can now download the file.</p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 bg-muted/10 border-t p-6">
                {!unlockedPdfUrl ? (
                    <Button onClick={handleUnlockPdf} disabled={isUnlocking || !password} className="w-full h-14 text-lg font-bold shadow-lg">
                        {isUnlocking ? <Loader2 className="animate-spin mr-2"/> : <Unlock className="mr-2"/>}
                        {isUnlocking ? "UNLOCKING..." : "UNLOCK PDF"}
                    </Button>
                ) : (
                    <Button onClick={handleDownload} className="w-full h-14 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20 animate-bounce">
                        <Download className="mr-2" />
                        DOWNLOAD UNLOCKED PDF
                    </Button>
                )}
                <Button variant="ghost" onClick={resetState} className="w-full" disabled={isUnlocking}>
                    {unlockedPdfUrl ? "Upload Another" : "Choose different file"}
                </Button>
            </CardFooter>
        </Card>
    );
}
