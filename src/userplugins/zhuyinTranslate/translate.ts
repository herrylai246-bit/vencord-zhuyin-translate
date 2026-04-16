/**
 * Bopomofo -> Hanzi pipeline.
 *
 * 1. Bopomofo -> toneless Pinyin letters (local, deterministic).
 * 2. Pinyin letters -> Traditional Hanzi via Google Input Tools, called from
 *    the Electron main process so we bypass the renderer's CORS restrictions
 *    (inputtools.google.com does not send Access-Control-Allow-Origin).
 */

import { PluginNative } from "@utils/types";
import { bopomofoToPinyin } from "./pinyin";

const Native = VencordNative.pluginHelpers.ZhuyinTranslate as PluginNative<
    typeof import("./native")
>;

const cache = new Map<string, string>();

export async function bopomofoToHanzi(bopomofo: string): Promise<string | null> {
    const pinyin = bopomofoToPinyin(bopomofo).trim();
    if (!pinyin) return null;
    if (cache.has(pinyin)) return cache.get(pinyin)!;

    const result = await Native.fetchHanziFromPinyin(pinyin);
    if (result) cache.set(pinyin, result);
    return result;
}
