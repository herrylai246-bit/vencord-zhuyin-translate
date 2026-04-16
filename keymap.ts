/**
 * Standard Taiwanese Zhuyin (大千 / Mingkwai) keyboard layout.
 * Maps US-QWERTY key -> Bopomofo symbol or tone mark.
 *
 * Tones: 1st tone = (space), 2nd = ˊ (6), 3rd = ˇ (3), 4th = ˋ (4), 5th/neutral = ˙ (7).
 */
export const QWERTY_TO_BOPOMOFO: Record<string, string> = {
    // Initials (consonants)
    "1": "ㄅ", q: "ㄆ", a: "ㄇ", z: "ㄈ",
    "2": "ㄉ", w: "ㄊ", s: "ㄋ", x: "ㄌ",
    e: "ㄍ", d: "ㄎ", c: "ㄏ",
    r: "ㄐ", f: "ㄑ", v: "ㄒ",
    "5": "ㄓ", t: "ㄔ", g: "ㄕ", b: "ㄖ",
    y: "ㄗ", h: "ㄘ", n: "ㄙ",

    // Medials
    u: "ㄧ", j: "ㄨ", m: "ㄩ",

    // Finals
    "8": "ㄚ", i: "ㄛ", k: "ㄜ", ",": "ㄝ",
    "9": "ㄞ", o: "ㄟ", l: "ㄠ", ".": "ㄡ",
    "0": "ㄢ", p: "ㄣ", ";": "ㄤ", "/": "ㄥ",
    "-": "ㄦ",

    // Tones
    "6": "ˊ",
    "3": "ˇ",
    "4": "ˋ",
    "7": "˙",
    " ": " ", // first tone stays as space; we'll strip before sending
};

/** All characters that can appear inside a Zhuyin-keystroke run. */
export const ZHUYIN_KEYSTROKE_CHARSET =
    "1qaz2wsxedcrfv5tgbyhnujmik,.ol;/-p0893467";

/** All Bopomofo symbols + tone marks (the output alphabet). */
export const BOPOMOFO_CHARSET =
    "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦˊˇˋ˙";

/** Convert a run of QWERTY keystrokes into Bopomofo symbols. */
export function keystrokesToBopomofo(input: string): string {
    let out = "";
    for (const ch of input.toLowerCase()) {
        const mapped = QWERTY_TO_BOPOMOFO[ch];
        if (mapped !== undefined) out += mapped;
        else out += ch; // passthrough (shouldn't happen if regex is correct)
    }
    return out;
}
