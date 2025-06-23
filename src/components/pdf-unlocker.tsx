"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Loader2, Download, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PdfUnlocker() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setPassword('');
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a PDF file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const handleUnlockPdf = async () => {
        if (!pdfFile) {
            toast({ variant: 'destructive', title: 'No file', description: 'Please upload a PDF file first.' });
            return;
        }
        if (!password) {
            toast({ variant: 'destructive', title: 'No password', description: 'Please enter the PDF password.' });
            return;
        }
        setIsUnlocking(true);

        try {
            const pdfBytes = await pdfFile.arrayBuffer();
            // Try loading with the provided password
            const pdfDoc = await PDFDocument.load(pdfBytes, {
                userPassword: password,
            });

            // If loaded successfully, save without a password
            const unlockedPdfBytes = await pdfDoc.save();
            
            const blob = new Blob([unlockedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `unlocked-${pdfFile.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast({title: 'Success!', description: 'Your PDF has been unlocked and downloaded.'});

        } catch (error: any) {
            console.error(error);
            if (error.name === 'EncryptedPDFError') {
                 toast({ variant: 'destructive', title: 'Incorrect Password', description: 'The password you entered is incorrect.' });
            } else if (error.message?.includes('not encrypted')) {
                 toast({ variant: 'destructive', title: 'Not Encrypted', description: 'This PDF is not password protected.' });
            }
            else {
                toast({ variant: 'destructive', title: 'Error Unlocking PDF', description: 'Could not unlock the PDF. It might be corrupted.' });
            }
        } finally {
            setIsUnlocking(false);
        }
    };

    if (!pdfFile) {
        return (
            <Card
                className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                <CardHeader>
                    <CardTitle>Unlock PDF</CardTitle>
                    <CardDescription>Upload a PDF to remove password protection.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground"><span className="text-primary font-semibold">Click to upload</span> or drag and drop a PDF</p>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Unlock PDF</CardTitle>
                <CardDescription>Enter the password to decrypt your PDF file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="font-medium text-sm">File: {pdfFile.name}</div>
                <div className="space-y-2">
                    <Label htmlFor="password">Current Password</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter current password"
                        disabled={isUnlocking}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button onClick={handleUnlockPdf} disabled={isUnlocking || !password} className="w-full">
                    {isUnlocking ? <Loader2 className="animate-spin mr-2"/> : <Unlock className="mr-2"/>}
                    Unlock & Download
                </Button>
                <Button variant="ghost" onClick={() => setPdfFile(null)}>Unlock another file</Button>
            </CardFooter>
        </Card>
    );
}
