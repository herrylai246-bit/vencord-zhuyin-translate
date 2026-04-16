/*
 * Runs in Electron main process — no CORS, can hit any URL.
 * Called via Vencord's IPC bridge from the renderer (see translate.ts).
 */
import { IpcMainInvokeEvent } from "electron";

export async function fetchHanziFromPinyin(
    _: IpcMainInvokeEvent,
    pinyin: string,
): Promise<string | null> {
    if (!pinyin) return null;
    const url =
        `https://inputtools.google.com/request?text=${encodeURIComponent(pinyin)}` +
        `&itc=zh-hant-t-i0-pinyin&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
    try {
        const res = await fetch(url, { method: "GET" });
        if (!res.ok) return null;
        const data: any = await res.json();
        if (!Array.isArray(data) || data[0] !== "SUCCESS") return null;
        const candidates: string[] | undefined = data[1]?.[0]?.[1];
        if (!candidates || candidates.length === 0) return null;
        return candidates[0];
    } catch {
        return null;
    }
}
