# ZhuyinTranslate — Vencord Userplugin

Auto-translates Taiwanese Zhuyin (注音) keyboard strings like `su3a8n3xk7` and raw
Bopomofo like `ㄋㄧˇㄇㄚ` into Traditional Chinese characters, shown inline below
each Discord message.

Useful for Hong Kongers / Cantonese speakers (or anyone) who can read Hanzi but
can't parse Zhuyin keyboard output.

![screenshot placeholder — add one before publishing](./screenshot.png)

## How the decoding works

Taiwanese users type on a standard US QWERTY keyboard while their OS runs a
Zhuyin IME. Each QWERTY key maps to a Bopomofo symbol (e.g. `s`→`ㄋ`, `u`→`ㄧ`,
digits `3/4/6/7` are tone marks). The IME normally converts the accumulated
Bopomofo into Hanzi. When the recipient has no IME, they just see the raw
keystrokes.

This plugin reverses that: **keystrokes → Bopomofo → Pinyin → Hanzi**, using
Google Input Tools for the final step (free, no API key required).

## Installation

Standard Vencord userplugin install — see
<https://docs.vencord.dev/installing/custom-plugins/>.

1. Set up a Vencord dev build (clone `Vendicated/Vencord`, run `pnpm install`).
2. Copy `src/userplugins/zhuyinTranslate/` into `<Vencord>/src/userplugins/`.
3. In the Vencord folder run `pnpm build` then `pnpm inject`.
4. Restart Discord and enable **ZhuyinTranslate** in Vencord → Plugins.

## Files

- `src/userplugins/zhuyinTranslate/index.tsx` — plugin entry, UI
- `src/userplugins/zhuyinTranslate/keymap.ts` — QWERTY → Bopomofo map
- `src/userplugins/zhuyinTranslate/pinyin.ts` — Bopomofo → Pinyin
- `src/userplugins/zhuyinTranslate/translate.ts` — renderer-side translator
- `src/userplugins/zhuyinTranslate/native.ts` — Electron-main-process fetch
  (bypasses renderer CORS)

## Notes / limitations

- Zhuyin → Hanzi is ambiguous (homophones). The plugin picks the top candidate
  from Google Input Tools; it's usually right for casual chat but can pick the
  wrong homophone for short snippets.
- Detection triggers on tokens ≥ 4 chars composed entirely of Zhuyin-keyboard
  characters **and** containing a tone digit. This avoids false positives on
  normal English words.
- Requires network access to `inputtools.google.com`. No API key needed.

## License

GPL-3.0-or-later (required because this links against Vencord, which is GPL).
See `LICENSE`.
