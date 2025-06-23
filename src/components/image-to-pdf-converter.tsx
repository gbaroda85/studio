"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { UploadCloud, Download, FileDigit, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ImageToPdfConverter() {
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageSrcs, setImageSrcs] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clean up blob URL on unmount
    return () => {
      if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
      }
    };
  }, [convertedPdfUrl]);

  const handleFilesChange = (files: FileList | null) => {
    if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
        setConvertedPdfUrl(null);
    }
    const newFiles = Array.from(files || []).filter(file => file.type.startsWith('image/'));
    if (newFiles.length === 0 && files && files.length > 0) {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select only image files.' });
        return;
    }

    setImageFiles(prev => [...prev, ...newFiles]);
    const newSrcs: string[] = [];
    newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            newSrcs.push(e.target?.result as string);
            if (newSrcs.length === newFiles.length) {
                setImageSrcs(prev => [...prev, ...newSrcs]);
            }
        };
        reader.readAsDataURL(file);
    });
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFilesChange(e.target.files);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFilesChange(e.dataTransfer.files); };

  const handleRemoveImage = (index: number) => {
    if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
        setConvertedPdfUrl(null);
    }
    setImageFiles(files => files.filter((_, i) => i !== index));
    setImageSrcs(srcs => srcs.filter((_, i) => i !== index));
  }
  
  const handleReset = () => {
    setImageFiles([]);
    setImageSrcs([]);
    if (convertedPdfUrl) {
      URL.revokeObjectURL(convertedPdfUrl);
    }
    setConvertedPdfUrl(null);
  }

  const handleConvertToPdf = () => {
    if (imageFiles.length === 0) return;
    setIsConverting(true);

    const pdf = new jsPDF();
    let processedImages = 0;
    
    // Create a new promise to handle the async operations
    new Promise<string>((resolve, reject) => {
        imageSrcs.forEach((src, index) => {
            const img = new window.Image();
            img.src = src;
            img.onload = () => {
                if (index > 0) {
                    pdf.addPage();
                }
                const imgProps = pdf.getImageProperties(img);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const widthRatio = pdfWidth / imgProps.width;
                const heightRatio = pdfHeight / imgProps.height;
                const ratio = Math.min(widthRatio, heightRatio);
                const imgWidth = imgProps.width * ratio;
                const imgHeight = imgProps.height * ratio;
                const x = (pdfWidth - imgWidth) / 2;
                const y = (pdfHeight - imgHeight) / 2;
                pdf.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
                
                processedImages++;
                if (processedImages === imageFiles.length) {
                    const pdfBlob = pdf.output('blob');
                    const url = URL.createObjectURL(pdfBlob);
                    resolve(url);
                }
            }
            img.onerror = () => {
                processedImages++;
                toast({variant: 'destructive', title: 'Error', description: `Could not load image ${imageFiles[index].name}`})
                if (processedImages === imageFiles.length) {
                    const pdfBlob = pdf.output('blob');
                    const url = URL.createObjectURL(pdfBlob);
                    resolve(url);
                }
            }
        });
    }).then(url => {
        setConvertedPdfUrl(url);
        toast({ title: "Success!", description: "Your PDF is ready for download." });
        setIsConverting(false);
    });
  };
  
  const handleDownload = () => {
      if (!convertedPdfUrl) return;
      const link = document.createElement('a');
      link.href = convertedPdfUrl;
      link.download = "converted-images.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  return (
    <Card className={cn("w-full max-w-4xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <CardHeader>
        <CardTitle>Image to PDF</CardTitle>
        <CardDescription>Upload one or more images to combine into a single PDF.</CardDescription>
      </CardHeader>
      <CardContent>
        {imageSrcs.length === 0 ? (
          <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground"><span className="text-primary font-semibold">Click to upload</span> or drag and drop</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {imageSrcs.map((src, index) => (
              <div key={index} className="relative group aspect-square">
                 <Image src={src} alt={`upload-preview-${index}`} fill className="object-cover rounded-md" />
                 <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveImage(index)}>
                     <X className="h-4 w-4" />
                 </Button>
              </div>
            ))}
            <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors aspect-square" onClick={() => fileInputRef.current?.click()}>
                 <UploadCloud className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} />
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
         {imageSrcs.length > 0 && <Button variant="outline" onClick={handleReset}>Clear All</Button>}
         
         {!convertedPdfUrl ? (
            <Button onClick={handleConvertToPdf} disabled={isConverting || imageFiles.length === 0}>
                {isConverting ? <Loader2 className="mr-2 animate-spin" /> : <FileDigit className="mr-2" />}
                {isConverting ? "Converting..." : "Convert to PDF"}
            </Button>
         ) : (
            <Button onClick={handleDownload}>
                <Download className="mr-2" />
                Download PDF
            </Button>
         )}
      </CardFooter>
    </Card>
  );
}
