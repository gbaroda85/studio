
"use client";

import { useState, useRef, useEffect } from "react";
import { 
    Scissors, 
    UploadCloud, 
    Download, 
    Loader2, 
    RefreshCcw, 
    Eye, 
    Clock, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    CheckCircle2,
    Settings2,
    MonitorPlay,
    PlayCircle
} from "lucide-react";
import { CldUploadWidget } from 'next-cloudinary';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import confetti from 'canvas-confetti';

/**
 * @fileOverview Professional Video Splitter using Cloudinary.
 * Offloads trimming/splitting tasks to the cloud for high performance.
 */

export default function VideoSplitter() {
    const { toast } = useToast();
    const [publicId, setPublicId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [endTime, setEndtime] = useState<number>(10);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const cloudName = "dqwz8ynxb";
    const uploadPreset = "gr7_video_preset";

    const handleSuccess = (result: any) => {
        if (result?.info?.public_id) {
            setPublicId(result.info.public_id);
            setVideoUrl(result.info.secure_url);
            setEndtime(Math.floor(result.info.duration || 10));
            toast({ title: "Video Uploaded", description: "Ready for splitting." });
        }
    };

    const handleSplit = () => {
        if (!publicId) return;
        setIsGenerating(true);
        
        // Generate a Cloudinary Trimming URL
        // Format: .../so_{start},eo_{end}/v1/public_id.mp4
        const baseUrl = `https://res.cloudinary.com/${cloudName}/video/upload`;
        const transformations = `so_${startTime},eo_${endTime}`;
        const finalUrl = `${baseUrl}/${transformations}/${publicId}.mp4`;

        // Small simulation for industrial feel
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = finalUrl;
            link.download = `Split-Video-${Date.now()}.mp4`;
            link.click();
            
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Extraction Success", description: "Trimmed video download started." });
            setIsGenerating(false);
        }, 1200);
    };

    const handleReset = () => {
        setPublicId(null);
        setVideoUrl(null);
        setStartTime(0);
        setEndtime(10);
    };

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6 pb-20 mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-3 text-left">
                    <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                        <Scissors className="size-5 md:size-6" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter">Video <span className="text-primary">Splitter</span></h2>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Precision Trimming Engine</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-11 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5 transition-all">
                        <RefreshCcw className="mr-1.5 size-3 md:size-4" /> Start Over
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                        <CardHeader className="bg-muted/30 border-b p-5 md:p-7 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3 text-left">
                                <Eye className="size-5 text-primary" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preview Studio</CardTitle>
                            </div>
                            {publicId && <Badge className="bg-green-600 text-white font-black text-[9px] px-3 py-1 rounded-full border-2 border-white shadow-md animate-pulse">RENDER READY</Badge>}
                        </CardHeader>
                        <CardContent className="p-8 md:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[450px] flex flex-col items-center justify-center relative select-none">
                            {videoUrl ? (
                                <div className="w-full max-w-2xl animate-in zoom-in-95 duration-500">
                                    <video src={videoUrl} controls className="w-full rounded-2xl shadow-3xl border-4 border-white bg-black" />
                                    <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-black uppercase text-muted-foreground/40">
                                        <div className="flex items-center gap-2"><MonitorPlay className="size-4" /> 1080P SOURCE</div>
                                        <div className="flex items-center gap-2"><Zap className="size-4" /> CLOUD ENGINE</div>
                                    </div>
                                </div>
                            ) : (
                                <CldUploadWidget 
                                    cloudName={cloudName}
                                    uploadPreset={uploadPreset}
                                    onSuccess={handleSuccess}
                                    options={{ sources: ['local'], resourceType: 'video' }}
                                >
                                    {({ open }) => (
                                        <div 
                                            onClick={() => open?.()}
                                            className="border-4 border-dashed border-muted-foreground/20 rounded-[2.5rem] p-16 md:p-24 flex flex-col items-center justify-center space-y-6 bg-muted/30 group cursor-pointer hover:bg-muted/40 transition-all"
                                        >
                                            <div className="relative">
                                                <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                                <Zap className="absolute -top-1 -right-1 size-6 md:size-8 text-yellow-500 animate-pulse" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Video to Start</p>
                                                <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">Max 3GB. Private Workspace.</p>
                                            </div>
                                        </div>
                                    )}
                                </CldUploadWidget>
                            )}
                        </CardContent>
                        <CardFooter className="bg-white dark:bg-slate-950 border-t p-5 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 shrink-0">
                             <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE HANDSHAKE</div>
                             <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> HD EXTRACTION</div>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8 text-left">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                <Settings2 className="size-4 md:size-5 text-primary" /> Trimming Logic
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-8">
                             <div className="grid grid-cols-2 gap-6 text-left">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase opacity-60 flex items-center gap-2"><Clock className="size-3"/> Start Point (Sec)</Label>
                                    <Input type="number" value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} className="h-12 border-2 rounded-xl font-black text-lg bg-background/50 shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase opacity-60 flex items-center gap-2"><Clock className="size-3"/> End Point (Sec)</Label>
                                    <Input type="number" value={endTime} onChange={(e) => setEndtime(Number(e.target.value))} className="h-12 border-2 rounded-xl font-black text-lg bg-background/50 shadow-inner" />
                                </div>
                             </div>

                             <div className="p-5 bg-blue-500/5 rounded-[1.5rem] border-2 border-blue-500/10 flex gap-4 text-left shadow-sm">
                                <Info className="size-6 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] md:text-[11px] font-black text-blue-800 uppercase tracking-tight">Cloud Precision</p>
                                    <p className="text-[8px] md:text-[10px] text-blue-700/70 font-medium leading-tight mt-1 uppercase">
                                        Splitting is done at the bitstream level to ensure original HD quality is maintained.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-dashed border-white/10">
                                <Button 
                                    className="magic-button w-full h-16 md:h-20 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group flex items-center justify-center gap-4" 
                                    onClick={handleSplit}
                                    disabled={!publicId || isGenerating}
                                >
                                    <StarIcons />
                                    {isGenerating ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="size-7 md:size-8 animate-spin" />
                                            <span className="uppercase font-black text-sm md:text-base tracking-tighter">PROCESSING...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Scissors className="size-7 md:size-8 text-white/50 group-hover:scale-110 transition-transform" />
                                            <span className="uppercase tracking-tighter text-lg md:text-2xl font-black">EXTRACT PART</span>
                                        </div>
                                    )}
                                </Button>
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 text-center mt-4">Cloud-Powered API Active</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
