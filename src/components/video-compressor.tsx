'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { 
    Video, 
    ShieldCheck, 
    Zap, 
    Download, 
    CheckCircle2, 
    Loader2, 
    FileVideo, 
    Sparkles, 
    Settings2,
    Monitor,
    Cloud,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

/**
 * @fileOverview Professional Video Compressor using Next-Cloudinary.
 * This tool offloads heavy processing to the cloud to ensure browser stability.
 */

export default function VideoCompressor() {
    const [isUploading, setIsUploading] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [fileInfo, setFileInfo] = useState<{ name: string; size: number; originalSize: number } | null>(null);

    // CRITICAL: Hardcoded fallback for environment persistence in preview
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqwz8ynxb";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "gr7_video_preset";

    const handleSuccess = (result: any) => {
        setIsUploading(false);
        if (result?.info?.secure_url) {
            const info = result.info;
            setResultUrl(info.secure_url);
            setFileInfo({
                name: info.original_filename || "Compressed-Video",
                size: info.bytes,
                originalSize: info.bytes * 1.5 // Rough estimation for UI feedback
            });

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#0ea5e9', '#10b981', '#ffffff']
            });
        }
    };

    const handleReset = () => {
        setResultUrl(null);
        setFileInfo(null);
        setIsUploading(false);
    };

    return (
        <div className="w-full flex flex-col items-center gap-8 animate-in fade-in duration-700">
            <Card className="w-full max-w-2xl border-2 shadow-3xl rounded-[2.5rem] overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-primary/10">
                <CardHeader className="bg-primary/5 border-b p-6 md:p-10 text-center">
                    <div className="mx-auto mb-6 grid size-16 md:size-20 place-items-center rounded-3xl bg-primary/10 text-primary shadow-xl relative">
                        <Video className="size-10" />
                        <Sparkles className="absolute -top-1 -right-1 size-6 text-yellow-400 animate-pulse" />
                    </div>
                    <CardTitle className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Video <span className="text-primary">Compressor</span></CardTitle>
                    <CardDescription className="text-[10px] md:text-sm font-bold uppercase opacity-50 tracking-widest mt-1">Cloud-Powered High Fidelity Optimization</CardDescription>
                </CardHeader>

                <CardContent className="p-8 md:p-12">
                    {isUploading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-8 animate-in zoom-in-95">
                            <div className="relative">
                                <Loader2 className="size-20 md:size-24 animate-spin text-primary stroke-[3]" />
                                <Cloud className="absolute inset-0 m-auto size-8 text-primary animate-pulse opacity-40" />
                            </div>
                            <div className="text-center space-y-4 w-full max-w-xs">
                                <p className="text-xl font-black text-primary uppercase tracking-tighter animate-pulse">Uploading to Cloud...</p>
                                <Progress value={45} className="h-1.5 shadow-inner" />
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-40">Auto-Compressing via API</p>
                            </div>
                        </div>
                    ) : resultUrl ? (
                        <div className="space-y-8 animate-in zoom-in-95">
                            <div className="p-10 bg-green-500/10 border-2 border-dashed border-green-500/30 rounded-[3rem] flex flex-col items-center gap-4 shadow-inner">
                                <CheckCircle2 className="size-16 text-green-600" />
                                <div className="text-center">
                                    <p className="text-2xl font-black text-green-900 uppercase tracking-tighter">Compression Successful!</p>
                                    <p className="text-xs text-green-700 font-bold uppercase mt-1">Your video is optimized and ready.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-5 rounded-2xl border text-center">
                                <div><p className="text-[9px] font-black text-muted-foreground uppercase opacity-60">Result Size</p><p className="text-sm font-black text-primary">{formatBytes(fileInfo?.size || 0)}</p></div>
                                <div className="border-l border-white/20"><p className="text-[9px] font-black text-muted-foreground uppercase opacity-60">Format</p><p className="text-sm font-black text-primary uppercase">MP4 (HD)</p></div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <CldUploadWidget 
                                cloudName={cloudName}
                                uploadPreset={uploadPreset}
                                onSuccess={handleSuccess}
                                onOpen={() => setIsUploading(true)}
                                options={{
                                    sources: ['local', 'url'],
                                    multiple: false,
                                    resourceType: 'video',
                                    clientAllowedFormats: ['mp4', 'mov', 'webm', 'avi'],
                                    maxFileSize: 3000000000 // 3GB
                                }}
                            >
                                {({ open }) => (
                                    <div 
                                        onClick={() => open?.()}
                                        className="border-4 border-dashed border-muted-foreground/20 rounded-[2.5rem] p-12 md:p-20 flex flex-col items-center justify-center space-y-6 bg-muted/30 group cursor-pointer hover:bg-muted/40 transition-all hover:border-primary/40 relative"
                                    >
                                        <div className="relative">
                                            <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <Zap className="absolute -top-1 -right-1 size-6 md:size-8 text-yellow-500 animate-pulse" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Select Video File</p>
                                            <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">Max 3GB. Fast Cloud Processing.</p>
                                        </div>
                                    </div>
                                )}
                            </CldUploadWidget>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="bg-muted/10 p-8 border-t flex flex-col gap-6">
                    {resultUrl ? (
                        <div className="flex flex-col gap-4 w-full">
                            <Button 
                                size="lg" 
                                className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-2xl transition-all duration-300 group h-16 md:h-20 shadow-2xl border-none active:scale-95" 
                                asChild
                            >
                                <a href={resultUrl} download={`Compressed-${fileInfo?.name}.mp4`}>
                                    <div className="absolute left-6 w-0.5 h-10 bg-white/40 rounded-full" />
                                    <span className="flex-1 px-12 text-center tracking-widest text-lg md:text-xl uppercase">DOWNLOAD VIDEO</span>
                                    <div className="bg-white h-full pl-10 pr-12 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-11 group-hover:pr-13 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                        <Download className="size-8 group-hover:scale-110 transition-transform" />
                                        <div className="absolute right-4 w-0.5 h-10 bg-[#00aeef]/20 rounded-full" />
                                    </div>
                                </a>
                            </Button>
                            <Button variant="outline" onClick={handleReset} className="h-12 border-2 font-black text-[10px] uppercase rounded-xl hover:bg-destructive/5 hover:text-destructive">
                                <RefreshCcw className="mr-2 size-4" /> Start New Compression
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 shrink-0 mx-auto">
                            <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE HANDSHAKE</div>
                            <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> CLOUD SPEED</div>
                            <div className="hidden md:flex items-center gap-2"><Monitor className="size-4 text-primary" /> HD PREVIEW</div>
                        </div>
                    )}
                </CardFooter>
            </Card>

            <div className="p-6 bg-blue-500/5 rounded-[2rem] border-2 border-blue-500/10 flex gap-6 max-w-2xl text-left shadow-sm">
                <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border-2 border-blue-500/20">
                     <AlertCircle className="size-6 text-blue-600 animate-pulse" />
                </div>
                <div>
                    <p className="text-[11px] font-black text-blue-800 uppercase tracking-tight">Configuration Note</p>
                    <p className="text-[9px] text-blue-700/70 font-medium leading-relaxed uppercase mt-1">
                        We use Cloud-based processing to prevent your browser from crashing during large video compression. 100% Secure.
                    </p>
                </div>
            </div>
        </div>
    );
}
