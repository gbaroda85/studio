
'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * @fileOverview High-performance Runtime FFmpeg Loader for Next.js 15.
 * Bypasses build errors by loading UMD bundles from CDN at runtime.
 * Uses crossorigin attributes and explicit blob URLs to handle COEP/COOP requirements.
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
        // CRITICAL: Must be anonymous for COEP require-corp compatibility
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
        
        // 1. Load UMD builds (These create window.FFmpegWASM and window.FFmpegUtil)
        // Using stable v0.12.x series
        await loadScript('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js');
        setLoaderProgress(30);
        await loadScript('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js');
        setLoaderProgress(50);

        // 2. Access Classes from UMD Namespaces (checking multiple common naming variants)
        const win = window as any;
        const FFmpegClass = win.FFmpegWASM?.FFmpeg || win.FFmpegWasm?.FFmpeg || win.FFmpeg?.FFmpeg || win.FFmpeg;
        const FFmpegUtil = win.FFmpegUtil || win.FFmpegWASM?.util || win.FFmpegWasm?.util || win.FFmpeg?.util;

        if (!FFmpegClass) {
            throw new Error('FFmpeg engine not found in global namespace.');
        }
        if (!FFmpegUtil?.toBlobURL) {
            throw new Error('FFmpeg Utility logic not found in global namespace.');
        }

        const ff = new FFmpegClass();
        setLoaderProgress(60);

        // 3. Load core files and WORKER via explicit blob URLs
        // Note: fetch occurs internally in toBlobURL, crossorigin is handled by unpkg
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

        const workerURL = await FFmpegUtil.toBlobURL(
          'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg-worker.js',
          'text/javascript'
        );
        setLoaderProgress(90);

        // 4. Initialize the engine
        await ff.load({ coreURL, wasmURL, workerURL });
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
