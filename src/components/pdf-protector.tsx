"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Loader2, Download, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PdfProtector() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isProtecting, setIsProtecting] = useState(false);
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

    const handleProtectPdf = async () => {
        if (!pdfFile) {
            toast({ variant: 'destructive', title: 'No file', description: 'Please upload a PDF file first.' });
            return;
        }
        if (!password) {
            toast({ variant: 'destructive', title: 'No password', description: 'Please enter a password.' });
            return;
        }
        setIsProtecting(true);

        try {
            const existingPdfBytes = await pdfFile.arrayBuffer();
            
            const pdfDoc = await PDFDocument.load(existingPdfBytes, {
                ignoreEncryption: true,
            });

            if (pdfDoc.isEncrypted) {
                toast({
                    variant: 'destructive',
                    title: 'Already Protected',
                    description: 'This PDF is already password protected. Please use the Unlock PDF tool first.',
                });
                setIsProtecting(false);
                return;
            }

            // Create a new document and copy pages. This is a robust way to apply changes.
            const newDoc = await PDFDocument.create();
            const content = await newDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
            content.forEach((page) => {
                newDoc.addPage(page);
            });
            
            // Save the new document with encryption options
            const protectedPdfBytes = await newDoc.save({
              userPassword: password,
              ownerPassword: password,
              permissions: {
                  printing: true,
              },
            });

            const blob = new Blob([protectedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `protected-${pdfFile.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast({ title: 'Success!', description: 'Your PDF has been protected and downloaded.' });

        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error Protecting PDF',
                description: 'An unexpected error occurred. Please ensure the file is not corrupted.',
            });
        } finally {
            setIsProtecting(false);
        }
    };

    if (!pdfFile) {
        return (
            <Card
                className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                <CardHeader>
                    <CardTitle>Protect PDF</CardTitle>
                    <CardDescription>Upload a PDF to add password protection.</CardDescription>
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
                <CardTitle>Protect PDF</CardTitle>
                <CardDescription>Set a password to encrypt your PDF file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="font-medium text-sm truncate">File: {pdfFile.name}</div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        disabled={isProtecting}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button onClick={handleProtectPdf} disabled={isProtecting || !password} className="w-full">
                    {isProtecting ? <Loader2 className="animate-spin mr-2"/> : <Lock className="mr-2"/>}
                    Protect & Download
                </Button>
                <Button variant="ghost" onClick={() => { setPdfFile(null); setPassword(''); }}>Protect another file</Button>
            </CardFooter>
        </Card>
    );
}