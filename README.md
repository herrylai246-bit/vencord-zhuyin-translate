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

### One-line install (Windows, recommended)

Open **PowerShell** and paste:

```powershell
iwr -useb https://raw.githubusercontent.com/herrylai246-bit/vencord-zhuyin-translate/main/install.ps1 | iex
```

That script will:

1. Check you have `git` and Node.js ≥ 18 (links you to installers if not).
2. Clone Vencord into `%LOCALAPPDATA%\VencordZhuyin\Vencord`.
3. Drop this plugin in as a userplugin.
4. Install dependencies and build.
5. Close Discord, patch it, deploy the bundle, and relaunch.

Re-run the same command any time to update.

After it finishes: open Discord → Settings → **Vencord → Plugins** → enable
**ZhuyinTranslate**.

### Manual install

Prerequisite: a [Vencord dev build](https://docs.vencord.dev/installing/custom-plugins/)
(clone Vencord, `pnpm install`).

```bash
cd <Vencord>/src/userplugins
git clone https://github.com/herrylai246-bit/vencord-zhuyin-translate.git zhuyinTranslate
cd ../..
pnpm build
pnpm inject
```

Restart Discord, then enable **ZhuyinTranslate** in Settings → Vencord →
Plugins.

To update later: `cd <Vencord>/src/userplugins/zhuyinTranslate && git pull`,
then `pnpm build` in the Vencord root (and `Ctrl+R` inside Discord).

## Files

- `index.tsx` — plugin entry + UI
- `keymap.ts` — QWERTY → Bopomofo map
- `pinyin.ts` — Bopomofo → Pinyin syllabifier
- `translate.ts` — renderer-side translator (calls the native bridge)
- `native.ts` — Electron-main-process fetch to Google Input Tools
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
