"use client";

import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
  });
  const name = file.name.replace(/\.[^.]+$/, ".webp");
  return new File([compressed], name, { type: "image/webp" });
}

export async function compressVideo(
  file: File,
  onProgress: (pct: number) => void,
): Promise<File> {
  const [{ FFmpeg }, { fetchFile, toBlobURL }] = await Promise.all([
    import("@ffmpeg/ffmpeg"),
    import("@ffmpeg/util"),
  ]);

  const ffmpeg = new FFmpeg();
  ffmpeg.on("progress", ({ progress }: { progress: number }) => {
    onProgress(Math.round(Math.min(progress, 1) * 100));
  });

  // Load single-threaded core from CDN — no SharedArrayBuffer/COOP headers required.
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.9/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  const ext = file.name.slice(file.name.lastIndexOf(".")) || ".mp4";
  const inputName = `input${ext}`;
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const exitCode = await ffmpeg.exec([
    "-i", inputName,
    "-vf", "scale='min(1280,iw)':-2",
    "-c:v", "libx264",
    "-crf", "28",
    "-preset", "fast",
    "-c:a", "aac",
    "output.mp4",
  ]);

  if (exitCode !== 0) {
    throw new Error(`FFmpeg exited with code ${exitCode}`);
  }

  const data = (await ffmpeg.readFile("output.mp4")) as Uint8Array;
  const name = file.name.replace(/\.[^.]+$/, ".mp4");
  return new File([new Blob([data], { type: "video/mp4" })], name, {
    type: "video/mp4",
  });
}
