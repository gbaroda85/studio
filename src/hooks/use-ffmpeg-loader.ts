'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * @fileOverview Runtime FFmpeg Loader to bypass Next.js build errors.
 * Loads UMD bundles from CDN and initializes FFmpeg with blob URLs.
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

    const loadScript = (src: string, timeout = 20000): Promise<void> =>
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
        // Load UMD builds (namespaced to window.FFmpegWasm and window.FFmpegUtil)
        await loadScript('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js');
        setLoaderProgress(30);
        await loadScript('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js');
        setLoaderProgress(50);

        const FFmpegClass = (window as any).FFmpegWasm?.FFmpeg || (window as any).FFmpeg?.FFmpeg;
        const FFmpegUtil = (window as any).FFmpegUtil || (window as any).FFmpeg?.util;

        if (!FFmpegClass) throw new Error('FFmpeg global not found');
        if (!FFmpegUtil?.toBlobURL) throw new Error('FFmpegUtil not found');

        const ff = new FFmpegClass();
        setLoaderProgress(60);

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

        await ff.load({ coreURL, wasmURL });
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
