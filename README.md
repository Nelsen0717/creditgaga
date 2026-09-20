# CreditGaga 刷神卡卡

**Point your phone at what you're about to buy. It tells you which of your credit cards to pay with.**
Built for Taipei Claude Code Build Day (2026-09-20). Taiwan cards, Traditional Chinese + English.

Live: https://nelsen0717.github.io/creditgaga/  ·  one self-contained `index.html`, no libraries, no server.

## What it does
- **Viewfinder first.** Full-screen camera, your real card faces fanned at the bottom. Tap the shutter: Claude reads the merchant, price, place and payment options from the photo; the phone's rules engine computes every number; the winning card rises out of the stack with the rate as the biggest thing on screen, the money back, the one condition that matters, and the single action that unlocks more (plan switch / registration / auto-pay).
- **Add a card by photo.** Rub the number out with your thumb on-device; only then does the masked image leave the phone. Claude matches the card from its artwork alone. Unknown card → Claude web-searches the issuer's official page and writes a rules entry with sources, flagged "AI researched".
- **Statement autopsy.** Photograph a monthly statement; see one big number (what you left on the table) and the three fixes ranked by gain.
- **Game layer.** XP, levels (卡卡新手 → 卡卡大師), quests for every unregistered bonus, monthly "extra earned" counter, confetti when you commit.
- **Claude reads; code computes.** Every rate, cap, threshold and NT$ figure comes from `CATALOG` in the file, with the bank's official URL and the verification date. The model never invents a number.

## Run it
1. Open the live URL on an iPhone (camera needs HTTPS) — or open `index.html` locally.
2. ⚙ → paste an Anthropic API key (stored in the browser only; calls go straight to `api.anthropic.com` with `anthropic-dangerous-direct-browser-access`).
3. No key? Turn on **demo mode** in ⚙: the sample scenes, sample cards and the sample statement run through the same UI with pre-recorded readings.

## Data
Seven Taiwan cards (合庫 御璽愛家卡、國泰世華 CUBE、富邦 J 卡、台灣大哥大 Open Possible、中信 LINE Pay JCB Precious、元大 商務御璽卡、星展 everyday). Rules were taken from the issuer pages listed in the app; CUBE plan coverage, the 合庫 14-store list and the CTBC JCB 9-store list were re-verified against the official pages on 2026-09-20. Promo rules expire (most 2026-12-31) — treat as a snapshot, not financial advice.

## Build
`src/` holds the readable parts; `python3 build.py` concatenates them and inlines the card art into `index.html`.
