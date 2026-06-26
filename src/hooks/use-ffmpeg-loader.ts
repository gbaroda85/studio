'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * @fileOverview High-performance Runtime FFmpeg Loader for Next.js 15.
 * Bypasses fetch errors and build errors by using manual CORS fetches and runtime script injection.
 * 100% Secure and compatible with COOP/COEP headers.
 */
export function useFfmpegLoader() {
  const [ffmpeg, setFfmpeg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    // Helper: Manual fetch as blob URL to bypass strict COEP fetch issues
    async function fetchAsBlobURL(url: string, type: string): Promise<string> {
        try {
            const res = await fetch(url, { 
                mode: 'cors', 
                credentials: 'omit',
                cache: 'force-cache'
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            return URL.createObjectURL(new Blob([blob], { type }));
        } catch (e: any) {
            console.error(`Fetch failed for ${url}:`, e);
            throw new Error(`Failed to fetch dependency from CDN: ${url}`);
        }
    }

    const loadScript = (src: string, timeout = 30000): Promise<void> =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.crossOrigin = "anonymous";
        
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
        
        // 1. Load UMD bundles from unpkg
        await loadScript('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js');
        setLoaderProgress(30);
        await loadScript('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js');
        setLoaderProgress(50);

        const win = window as any;
        const FFmpegClass = win.FFmpegWASM?.FFmpeg || win.FFmpegWasm?.FFmpeg || win.FFmpeg?.FFmpeg || win.FFmpeg;

        if (!FFmpegClass) {
            throw new Error('FFmpeg engine not found in global namespace.');
        }

        const ff = new FFmpegClass();
        setLoaderProgress(60);

        // 2. Manual blob fetch for core/wasm/worker to handle COEP require-corp
        // This is the most robust way to load ffmpeg.wasm in Next.js 15
        const coreURL = await fetchAsBlobURL(
          'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
          'text/javascript'
        );
        setLoaderProgress(70);

        const wasmURL = await fetchAsBlobURL(
          'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
          'application/wasm'
        );
        setLoaderProgress(80);

        const workerURL = await fetchAsBlobURL(
          'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg-worker.js',
          'text/javascript'
        );
        setLoaderProgress(90);

        // 3. Load the engine
        await ff.load({ coreURL, wasmURL, workerURL });
        setLoaderProgress(100);
        
        setFfmpeg(ff);
        setLoading(false);
      } catch (err: any) {
        console.error("FFmpeg Runtime Load Error:", err);
        setError(err.message || 'Failed to load video processing engine');
        setLoading(false);
      }
    })();
  }, []);

  return { ffmpeg, loading, error, loaderProgress };
}
