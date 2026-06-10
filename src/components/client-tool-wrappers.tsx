
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Client-side wrappers for heavy AI/PDF tools to prevent SSR errors in Next.js 15.
 */

const LoadingState = ({ message }: { message: string }) => (
  <div className="w-full max-w-2xl h-[400px] flex flex-col items-center justify-center bg-muted/20 rounded-[2.5rem] border-2 border-dashed mx-auto">
    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-40">{message}</p>
  </div>
);

export const BackgroundRemoverClient = dynamic(() => import('@/components/background-remover'), {
  ssr: false,
  loading: () => <LoadingState message="Initializing Neural Studio..." />
});

export const PdfPageNumbererClient = dynamic(() => import('@/components/pdf-page-numberer'), {
  ssr: false,
  loading: () => <LoadingState message="Initializing Page Studio..." />
});

export const DocumentScannerClient = dynamic(() => import('@/components/document-scanner'), {
  ssr: false,
  loading: () => <LoadingState message="Initializing Capture Studio..." />
});

export const PassportPhotoMakerClient = dynamic(() => import('@/components/passport-photo-maker'), {
  ssr: false,
  loading: () => <LoadingState message="Initializing Studio Engine..." />
});

export const PdfCropperClient = dynamic(() => import('@/components/pdf-cropper'), {
  ssr: false,
  loading: () => <LoadingState message="Initializing Crop Studio..." />
});

export const AiUpscalerClient = dynamic(() => import('@/components/ai-upscaler'), {
  ssr: false,
  loading: () => <LoadingState message="Initializing AI Engine..." />
});
