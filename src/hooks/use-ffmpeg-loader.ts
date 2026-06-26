
'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * @fileOverview High-performance Runtime FFmpeg Loader for Next.js 15.
 * Bypasses build errors by loading UMD bundles from CDN at runtime.
 * Uses explicit blob URLs to avoid CORS and dynamic resolution issues.
 */
export function useFfmpegLoader() {
  const [ffmpeg, setFfmpeg] = useState<any>(null);
  const [util, setUtil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const loadScript = (src: string, timeout = 25000): Promise<void> =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        
        const timer = setTimeout(() => {
          reject(new Error(`Script load timeout: ${src}`));
        }, timeout);

        script.onload = () => {
          clearTimeout(timer);
          resolve();
        };
        
        script.onerror = () => {
          clearTimeout(timer);
          reject(new Error(`Failed to load script: ${src}`));
        };
        
        document.head.appendChild(script);
      });

    (async () => {
      try {
        setLoaderProgress(10);
        
        // 1. Load UMD builds (These create window.FFmpegWasm and window.FFmpegUtil)
        await loadScript('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js');
        setLoaderProgress(30);
        await loadScript('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js');
        setLoaderProgress(50);

        // Robust lookup for different UMD namespaces
        const FFmpegClass = 
            (window as any).FFmpegWasm?.FFmpeg || 
            (window as any).FFmpeg?.FFmpeg || 
            (window as any).FFmpeg;
        
        const FFmpegUtil = 
            (window as any).FFmpegUtil || 
            (window as any).FFmpeg?.util;

        if (!FFmpegClass) throw new Error('FFmpeg global engine not found');
        if (!FFmpegUtil?.toBlobURL) throw new Error('FFmpeg Utility logic not found');

        const ff = new FFmpegClass();
        setLoaderProgress(60);

        // 2. Load core files via explicit blob URLs (Crucial for bypass)
        const coreURL = await FFmpegUtil.toBlobURL(
          'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
          'text/javascript'
        );
        setLoaderProgress(70);

        const wasmURL = await FFmpegUtil.toBlobURL(
          'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
          'application/wasm'
        );
        setLoaderProgress(80);

        // 3. Initialize with blob URLs
        await ff.load({ coreURL, wasmURL });
        setLoaderProgress(100);
        
        setFfmpeg(ff);
        setUtil(FFmpegUtil);
        setLoading(false);
      } catch (err: any) {
        console.error("FFmpeg Runtime Load Error:", err);
        setError(err.message || 'Failed to load video processing engine');
        setLoading(false);
      }
    })();
  }, []);

  return { ffmpeg, util, loading, error, loaderProgress };
}
