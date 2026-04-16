/**
 * Bopomofo -> toneless Hanyu Pinyin (letters only).
 *
 * Processed syllable-by-syllable so we get real pinyin spellings (e.g.
 * ㄨㄞ -> "wai", not "uai"). Syllables are split on tone marks; any trailing
 * untoned run is split by scanning for fresh initial consonants.
 */

const INITIAL: Record<string, string> = {
    ㄅ: "b", ㄆ: "p", ㄇ: "m", ㄈ: "f",
    ㄉ: "d", ㄊ: "t", ㄋ: "n", ㄌ: "l",
    ㄍ: "g", ㄎ: "k", ㄏ: "h",
    ㄐ: "j", ㄑ: "q", ㄒ: "x",
    ㄓ: "zh", ㄔ: "ch", ㄕ: "sh", ㄖ: "r",
    ㄗ: "z", ㄘ: "c", ㄙ: "s",
};

const SIBILANT = new Set(["zh", "ch", "sh", "r", "z", "c", "s"]);
const TONES = new Set(["ˊ", "ˇ", "ˋ", "˙", " "]);

const RIME_WITH_INITIAL: Record<string, string> = {
    "": "", // handled specially for sibilants
    ㄧ: "i", ㄧㄚ: "ia", ㄧㄛ: "io", ㄧㄝ: "ie", ㄧㄞ: "iai",
    ㄧㄠ: "iao", ㄧㄡ: "iu", ㄧㄢ: "ian", ㄧㄣ: "in",
    ㄧㄤ: "iang", ㄧㄥ: "ing",
    ㄨ: "u", ㄨㄚ: "ua", ㄨㄛ: "uo", ㄨㄞ: "uai", ㄨㄟ: "ui",
    ㄨㄢ: "uan", ㄨㄣ: "un", ㄨㄤ: "uang", ㄨㄥ: "ong",
    ㄩ: "u", ㄩㄝ: "ue", ㄩㄢ: "uan", ㄩㄣ: "un", ㄩㄥ: "iong",
    ㄚ: "a", ㄛ: "o", ㄜ: "e", ㄝ: "e",
    ㄞ: "ai", ㄟ: "ei", ㄠ: "ao", ㄡ: "ou",
    ㄢ: "an", ㄣ: "en", ㄤ: "ang", ㄥ: "eng",
    ㄦ: "er",
};

const RIME_NO_INITIAL: Record<string, string> = {
    ㄧ: "yi", ㄧㄚ: "ya", ㄧㄛ: "yo", ㄧㄝ: "ye", ㄧㄞ: "yai",
    ㄧㄠ: "yao", ㄧㄡ: "you", ㄧㄢ: "yan", ㄧㄣ: "yin",
    ㄧㄤ: "yang", ㄧㄥ: "ying",
    ㄨ: "wu", ㄨㄚ: "wa", ㄨㄛ: "wo", ㄨㄞ: "wai", ㄨㄟ: "wei",
    ㄨㄢ: "wan", ㄨㄣ: "wen", ㄨㄤ: "wang", ㄨㄥ: "weng",
    ㄩ: "yu", ㄩㄝ: "yue", ㄩㄢ: "yuan", ㄩㄣ: "yun", ㄩㄥ: "yong",
    ㄚ: "a", ㄛ: "o", ㄜ: "e", ㄝ: "e",
    ㄞ: "ai", ㄟ: "ei", ㄠ: "ao", ㄡ: "ou",
    ㄢ: "an", ㄣ: "en", ㄤ: "ang", ㄥ: "eng",
    ㄦ: "er",
};

function convertSyllable(syl: string): string {
    if (!syl) return "";
    let initial = "";
    let rest = syl;
    const first = syl[0];
    if (first in INITIAL) {
        initial = INITIAL[first];
        rest = syl.slice(1);
    }

    if (rest === "") {
        // Bare consonant — sibilants get 'i', others are invalid but return as-is.
        return initial + (SIBILANT.has(initial) ? "i" : "");
    }

    const table = initial ? RIME_WITH_INITIAL : RIME_NO_INITIAL;
    const body = table[rest];
    if (body !== undefined) return initial + body;

    // Fallback: piece by piece.
    return initial + rest.split("").map(c => table[c] ?? "").join("");
}

export function bopomofoToPinyin(bp: string): string {
    const syllables: string[] = [];
    let buf = "";
    for (const c of bp) {
        if (TONES.has(c)) {
            if (buf) syllables.push(buf);
            buf = "";
        } else {
            buf += c;
        }
    }
    if (buf) {
        // Untoned trailing run: split whenever a new initial consonant appears.
        let cur = "";
        for (const c of buf) {
            if (c in INITIAL && cur) {
                syllables.push(cur);
                cur = "";
            }
            cur += c;
        }
        if (cur) syllables.push(cur);
    }
    return syllables.map(convertSyllable).join("");
}
