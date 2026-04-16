/*
 * Quick standalone test — run with: npx tsx test/decode.test.ts
 * Verifies the keymap + API round-trip on your example strings.
 */
import { keystrokesToBopomofo } from "../keymap";
import { bopomofoToPinyin } from "../pinyin";

// Inline translator that calls Google directly (bypasses the Vencord native
// bridge we use in production, since this test runs under plain Node).
async function bopomofoToHanzi(bp: string): Promise<string | null> {
    const pinyin = bopomofoToPinyin(bp).trim();
    if (!pinyin) return null;
    const url =
        `https://inputtools.google.com/request?text=${encodeURIComponent(pinyin)}` +
        `&itc=zh-hant-t-i0-pinyin&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
    const res = await fetch(url);
    const data: any = await res.json();
    return data?.[1]?.[0]?.[1]?.[0] ?? null;
}

const samples = [
    "su3a8n3xk7",
    "e04",
    "su3ap7fu",
    "zj4j94eji6bp6",
    "su3ap7ul4g4ao6u3ul41",
    "ru41j6ul4y945k4xu3u",
    "56gji",
    "cj84",
];

(async () => {
    for (const s of samples) {
        const bopo = keystrokesToBopomofo(s);
        const hanzi = await bopomofoToHanzi(bopo);
        console.log(`${s.padEnd(25)} -> ${bopo.padEnd(18)} -> ${hanzi}`);
    }
})();
