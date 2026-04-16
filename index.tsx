/*
 * ZhuyinTranslate — a Vencord userplugin.
 * Auto-translates Taiwanese Zhuyin keyboard strings and raw Bopomofo into
 * Traditional Chinese Hanzi, rendered as a small line below each message.
 *
 * Copyright (c) 2026 Henry Lai
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { addMessageAccessory, removeMessageAccessory } from "@api/MessageAccessories";
import { React } from "@webpack/common";

import {
    BOPOMOFO_CHARSET,
    ZHUYIN_KEYSTROKE_CHARSET,
    keystrokesToBopomofo,
} from "./keymap";
import { bopomofoToHanzi } from "./translate";

/* ------------------------------------------------------------------ *
 * Detection
 * ------------------------------------------------------------------ */

// Match runs of Bopomofo symbols (≥ 2).
const BOPOMOFO_RE = new RegExp(`[${BOPOMOFO_CHARSET}]{2,}`, "gu");
// Test whether a single token *is* Bopomofo (no global flag; safe to re-use).
const BOPOMOFO_ONLY_RE = new RegExp(`^[${BOPOMOFO_CHARSET}]+$`, "u");

/**
 * Match runs of Zhuyin keystrokes. We require:
 *   - length ≥ 4 (avoid matching normal English words)
 *   - contains at least one tone digit (3/4/6/7) OR one medial (u/j/m)
 *     followed by a final, to reduce false positives.
 *
 * Simpler heuristic used here: ≥ 4 chars from the charset AND contains a
 * digit tone mark. This is very reliable in practice.
 */
const KEYSTROKE_RE = new RegExp(
    `(?:[${ZHUYIN_KEYSTROKE_CHARSET}]*[3467][${ZHUYIN_KEYSTROKE_CHARSET}]*){1,}`,
    "g",
);

/** Extract candidate Zhuyin segments from a message. */
function extractSegments(text: string): string[] {
    const segments: string[] = [];

    // Raw bopomofo (already-converted zhuyin text).
    for (const m of text.matchAll(BOPOMOFO_RE)) {
        segments.push(m[0]);
    }

    // Keystroke sequences. Split on whitespace first so we don't glue
    // separate words together.
    for (const token of text.split(/\s+/)) {
        if (token.length < 4) continue;
        // Must be entirely within the zhuyin charset.
        let allIn = true;
        for (const ch of token.toLowerCase()) {
            if (!ZHUYIN_KEYSTROKE_CHARSET.includes(ch)) { allIn = false; break; }
        }
        if (!allIn) continue;
        // Must contain a tone digit to count as zhuyin (not a random number).
        if (!/[3467]/.test(token)) continue;
        // Must contain at least one letter (not purely digits).
        if (!/[a-z,.;/-]/i.test(token)) continue;
        segments.push(token);
    }

    return segments;
}

/* ------------------------------------------------------------------ *
 * React component
 * ------------------------------------------------------------------ */

function TranslationLine({ content }: { content: string }) {
    const segments = React.useMemo(() => extractSegments(content), [content]);
    const [translated, setTranslated] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;
        if (segments.length === 0) { setTranslated(null); return; }

        (async () => {
            const parts: string[] = [];
            for (const seg of segments) {
                const bopo = BOPOMOFO_ONLY_RE.test(seg)
                    ? seg
                    : keystrokesToBopomofo(seg);
                const hanzi = await bopomofoToHanzi(bopo);
                parts.push(hanzi ?? bopo);
            }
            if (!cancelled) setTranslated(parts.join("  "));
        })();

        return () => { cancelled = true; };
    }, [content]);

    if (!translated) return null;

    return (
        <div
            style={{
                fontSize: "0.9em",
                color: "#ffffff",
                marginTop: 2,
                fontStyle: "italic",
            }}
        >
            🀄 {translated}
        </div>
    );
}

/* ------------------------------------------------------------------ *
 * Plugin definition
 * ------------------------------------------------------------------ */

export default definePlugin({
    name: "ZhuyinTranslate",
    description:
        "Auto-translates Taiwanese Zhuyin (注音) keystrokes and raw Bopomofo into Traditional Chinese Hanzi, shown inline under each message.",
    authors: [{ name: "Henry Lai", id: 0n }],

    start() {
        addMessageAccessory("zhuyin-translate", props => {
            const content: string | undefined = props?.message?.content;
            if (!content) return null;
            return <TranslationLine content={content} />;
        });
    },

    stop() {
        removeMessageAccessory("zhuyin-translate");
    },
});
