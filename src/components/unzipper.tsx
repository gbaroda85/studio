
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, Download, ArchiveRestore, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ExtractedFile = {
    name: string;
    url: string;
};

export default function Unzipper() {
    const { toast } = useToast();
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
    const [isUnzipping, setIsUnzipping] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (file && file.type.includes('zip')) {
            setZipFile(file);
            handleUnzip(file);
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a zip file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const handleUnzip = async (file: File) => {
        setIsUnzipping(true);
        setExtractedFiles([]);
        try {
            const zip = await JSZip.loadAsync(file);
            const files: ExtractedFile[] = [];
            for (const filename in zip.files) {
                if (!zip.files[filename].dir) {
                    const fileData = await zip.files[filename].async('blob');
                    const url = URL.createObjectURL(fileData);
                    files.push({ name: filename, url });
                }
            }
            setExtractedFiles(files);
            toast({ title: 'Success', description: `Extracted ${files.length} files from the zip archive.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not process the zip file. It might be corrupt.' });
        } finally {
            setIsUnzipping(false);
        }
    };
    
    const handleDownload = (url: string, name: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    const resetState = () => {
        setZipFile(null);
        extractedFiles.forEach(f => URL.revokeObjectURL(f.url));
        setExtractedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    if (!zipFile) {
        return (
            <Card
                className={cn("w-full max-w-2xl text-center", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                <CardHeader>
                    <CardTitle>Unzip File</CardTitle>
                    <CardDescription>Upload a zip file to extract its contents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground"><span className="text-primary font-semibold">Click to upload</span> or drag and drop a zip file</p>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".zip,application/zip,application/x-zip,application/x-zip-compressed" onChange={onFileChange} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Extracted Files</CardTitle>
                <CardDescription>Found {extractedFiles.length} files in <span className="font-semibold">{zipFile.name}</span>.</CardDescription>
            </CardHeader>
            <CardContent>
                {isUnzipping ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-16">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">Unzipping your file...</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {extractedFiles.map((file) => (
                            <div key={file.name} className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                                <div className="flex items-center gap-3 truncate">
                                    <FileIcon className="h-5 w-5 text-primary flex-shrink-0" />
                                    <span className="text-sm font-medium truncate">{file.name}</span>
                                </div>
                                <Button size="sm" onClick={() => handleDownload(file.url, file.name)}>
                                    <Download className="mr-2 h-4 w-4"/>
                                    Download
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button variant="outline" onClick={resetState}>Extract Another Zip</Button>
            </CardFooter>
        </Card>
    )
}
