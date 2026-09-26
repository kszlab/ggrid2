# Translating GGrid

This guide is for a human or an AI translator. One language is one JSON file. You only need to translate that single file.

## Files
- `locales/hu.json` is the **source** (Hungarian). Every key has a note for the translator, stored under the same name with an `@` prefix: `"@toast.bombDone": {"context": "...", "maxLength": 34}`.
- `locales/en.json`, `locales/<code>.json`: the translations, with the same keys and **without** the `@` notes.
- `locales/index.json` lists the available languages: `code`, the language's own `name` (as shown in the language menu), and `intl` (the locale used for number formatting, e.g. `de-DE`).

## Adding a new language
1. Copy `locales/en.json` to `locales/<code>.json` (e.g. `de.json`) and set `"@@locale": "<code>"`.
2. Translate every value from the **source** meaning in `hu.json`. `en.json` can help, but `hu.json` is authoritative, and its `@` notes tell you where each text appears.
3. Add the language to `locales/index.json`, e.g. `{"code":"de","name":"Deutsch","intl":"de-DE"}`.
4. Run `node tools/check-locales.mjs`. It must print `"locales":"passed"`.
5. Open the game, choose the language under Settings → Language, and look at the main menu, the level select, a level, the settings and the help, preferably on a phone-sized screen.

## Rules
- **Never change or remove keys.** Only translate values.
- **Keep placeholders exactly**, e.g. `{n}`, `{cost}`, `{earned}`. You may move them within the sentence, but do not translate, drop or add them.
- **Plural forms:** a value may be an object whose categories follow the language's plural rules (`Intl.PluralRules`), e.g. `{"one": "{n} level", "other": "{n} levels"}`. `other` is always required. Languages without plural inflection can use a plain string.
- **HTML is only allowed in `help.*` keys**, and only these tags: `<h3>`, `<p>`, `<strong>`, `<em>`, `<br>`, with no attributes. Keep one `<h3>` title at the start of each help section. Any other markup is removed at runtime and rejected by the checker.
- **Respect `maxLength`** where it is given. These texts appear on small buttons or in the narrow top bar. The checker warns if a text is longer.
- Keep symbols and icons as they are (`▶`, `⚙`, `❔`, `↶`, `⟳`, `▦`, `❄`, `💣`, `💡`, `●●`, `→`, `·`, `–`). Upper case in the source (e.g. `SOLVED`, `EXIT`) is intentional: keep it upper case.
- Game terms: **Freeze** and **BOMB** are names; they stay as they are in every language. `D1`–`D10` are difficulty classes.
- Theme keys (`theme.<id>.shortName`, `.tag`, `.description`) are shown in the level select's theme preview. Theme names that are English in the source (e.g. `NEON RAIN`, `SHOWCASE WORLD`) may stay English.
- A missing key falls back to Hungarian, with a warning in the browser console, so a half-finished file never shows empty labels. The checker still reports every missing key.

## Not translated (on purpose)
Developer and research tools stay Hungarian: the scenario editor (`editor.html`), Theme Lab, Theme Studio, and the motion measurement screen (Settings → Motion measurement). The small scene captions on some theme boards (e.g. `MOON GARDEN // 静 水`) are part of the artwork and stay in their original wording.

## How the game picks the language
1. The player's choice (Settings → Language).
2. On "Automatic": the system language (`navigator.languages`, e.g. `de-AT` → `de`).
3. If the system language is not available: English.

Changing the language reloads the page.
