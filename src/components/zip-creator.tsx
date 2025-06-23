
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, Download, Archive, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ZipCreator() {
    const { toast } = useToast();
    const [filesToZip, setFilesToZip] = useState<File[]>([]);
    const [isZipping, setIsZipping] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [zippedFileUrl, setZippedFileUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFilesChange = (fileList: FileList | null) => {
        if (zippedFileUrl) {
            URL.revokeObjectURL(zippedFileUrl);
            setZippedFileUrl(null);
        }
        const newFiles = Array.from(fileList || []);
        setFilesToZip(prev => [...prev, ...newFiles]);
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFilesChange(e.target.files);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFilesChange(e.dataTransfer.files); };

    const handleRemoveFile = (index: number) => {
        if (zippedFileUrl) {
            URL.revokeObjectURL(zippedFileUrl);
            setZippedFileUrl(null);
        }
        setFilesToZip(files => files.filter((_, i) => i !== index));
    };
    
    const handleReset = () => {
        setFilesToZip([]);
        if (zippedFileUrl) {
            URL.revokeObjectURL(zippedFileUrl);
            setZippedFileUrl(null);
        }
    }

    const handleCreateZip = async () => {
        if (filesToZip.length === 0) {
            toast({ variant: 'destructive', title: 'No files selected', description: 'Please add at least one file to create a zip.' });
            return;
        }
        setIsZipping(true);

        try {
            const zip = new JSZip();
            filesToZip.forEach(file => {
                zip.file(file.name, file);
            });

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            setZippedFileUrl(url);
            
            toast({title: 'Success!', description: 'Your zip file has been created.'});

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error Creating Zip', description: 'An unexpected error occurred while creating the zip file.' });
        } finally {
            setIsZipping(false);
        }
    };
    
    const handleDownload = () => {
        if (!zippedFileUrl) return;
        const link = document.createElement('a');
        link.href = zippedFileUrl;
        link.download = 'archive.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    return (
        <Card className={cn("w-full max-w-4xl transition-all duration-300 ease-in-out", isDragOver && "border-primary ring-4 ring-primary/20")}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
            <CardHeader>
                <CardTitle>Create Zip File</CardTitle>
                <CardDescription>Upload or drop files here to add them to a zip archive.</CardDescription>
            </CardHeader>
            <CardContent>
                {filesToZip.length === 0 ? (
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground"><span className="text-primary font-semibold">Click to upload</span> or drag and drop files</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filesToZip.map((file, index) => (
                             <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                                 <div className="flex items-center gap-3">
                                    <FileText className="h-6 w-6 text-primary" />
                                    <span className="text-sm font-medium">{file.name}</span>
                                 </div>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRemoveFile(index)}><X className="h-4 w-4" /></Button>
                             </div>
                        ))}
                        <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                            <UploadCloud className="h-6 w-6 text-muted-foreground mr-2" />
                            <span className="text-sm">Add more files...</span>
                        </div>
                    </div>
                )}
                <input ref={fileInputRef} type="file" className="hidden" multiple onChange={onFileChange} />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                {filesToZip.length > 0 && <Button variant="outline" onClick={handleReset}>Clear All</Button>}
                
                {!zippedFileUrl ? (
                    <Button onClick={handleCreateZip} disabled={isZipping || filesToZip.length === 0}>
                        {isZipping ? <Loader2 className="mr-2 animate-spin" /> : <Archive className="mr-2" />}
                        {isZipping ? 'Zipping...' : 'Create Zip'}
                    </Button>
                ) : (
                    <Button onClick={handleDownload}>
                        <Download className="mr-2" />
                        Download Zip
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
