/*
 * Quick standalone test — run with: npx tsx test/decode.test.ts
 * Verifies the keymap + API round-trip on your example strings.
 */
import { keystrokesToBopomofo } from "../src/userplugins/zhuyinTranslate/keymap";
import { bopomofoToHanzi } from "../src/userplugins/zhuyinTranslate/translate";

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
