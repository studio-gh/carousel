# ⚡ Carousel Studio

> **The ultra-fast, zero-friction carousel generator for non-designers.** Create stunning, high-converting Instagram carousels in seconds — right from your browser, with absolutely **no accounts, no logins, and zero fluff**.

Live Platform: **[studio-gh.github.io/carousel](https://studio-gh.github.io/carousel/)**

---

## 🔥 Why Carousel Studio?

Most design tools are either too complex (Figma) or too cluttered and locked behind subscriptions (Canva). **Carousel Studio** was built for content creators, writers, and builders who want premium, editorial-grade designs without the technical overhead.

- 🛑 **No Accounts Required:** Just open the page, create your content, and export. Your data stays in your browser.
- 🦄 **Pure Client-Side Magic:** Built as a **single file (HTML + CSS + JS)**. No build steps, no heavy Node modules, no server dependency.
- 📱 **Mobile-First Editing:** Tweak fonts, edit text directly on the canvas, or use the responsive sidebar drawer directly from your phone.
- 📐 **Platform-Ready Ratios:** Instantly switch between **4:5 (Portrait)**, **1:1 (Square)**, and **9:16 (Stories/Reels)**.
- ↩️ **Native Undo/Redo:** Every edit is recoverable with `Ctrl/Cmd+Z` — mistakes are never final.

---

## ✨ Features

### Layout & Design
- **5 layouts per slide:** Full bleed, or split left/right/top/bottom — mix and match within the same carousel.
- **Dual image layers:** Stack a second image (texture, grain, double exposure) on top of your photo with independent opacity, blend mode, and positioning — up to 2 layers per slide.
- **Rounded corners:** Adjustable corner radius on images, consistent across the editor, PNG, and SVG exports.
- **Independent slide overlays:** Gradient direction and opacity, customizable per slide.

### Typography & Text
- **27 hand-curated Google Fonts**, filterable by category, with independent weight sliders for heading and body.
- **Per-slide font size control**, layered on top of an auto-shrink-to-fit safety net so text never overflows.
- **Resizable text box:** Drag the handle on the text box to control exactly how much room your copy has to wrap into.
- **Optional kicker/label** above the headline — great for a small eyebrow tag or category name.
- **Freely draggable text**, editable directly on the canvas or from the sidebar (great for mobile).

### Branding & Metadata
- **Small logo watermark:** upload once per slide, place it top, bottom, center, or in any of the four corners.
- **Dual signature bars:** top and bottom simultaneously, left + right text in each, with an optional divider line.
- **Page number badge:** top or bottom, fully recolorable.
- **"Swipe for more" footer:** a customizable line + arrow hint, with an option to auto-hide on the last slide.

### Workflow
- **Drag-and-drop slide reordering** directly on the thumbnail track.
- **Undo/Redo** with full history tracking.
- **Collapsible sidebar sections** so the editor never feels overwhelming, even with dozens of controls.

### Export
- **PNG** (flat, ready to publish) or **SVG** (fully layered, editable in Figma).
- Export the current slide, a `.zip` of the whole carousel, or **individual files one-by-one** — no unzipping required, ideal for mobile.

---

## 🛠️ The Tech Stack

Simplicity is our ultimate sophistication. Carousel Studio is engineered to be as lightweight and transportable as possible:

- **HTML5 / CSS3** (Vanilla architecture with native SVG filters for grain & texture)
- **Vanilla JavaScript** (Zero framework bloat)
- **JSZip via CDN** (For efficient multi-slide package compilation)
- **Google Fonts API**

---

## 🚀 How to Run Locally / Contribute

Because the app is a single standalone file, running it or tweaking it takes less than 3 seconds:

1. **Clone the repo:**
   ```
   git clone https://github.com/studio-gh/carousel.git
   ```
2. **Open the file:**
   Just double-click `index.html` (or the current build's `.html` file) to open it directly in Chrome, Safari, or Firefox. No `npm install`, no local servers required.

---

## 🗺️ Roadmap & Upcoming Improvements

We are constantly pushing the limits of what a single-file app can do. Here's what's next:

### 🌟 Experience Boosters
- [ ] **Editorial layout:** a large image up top with a two-column text arrangement (headline + body side by side) below it.
- [ ] **Project Save/Load:** quick `.json` state export/import to prevent losing progress on page refresh.
- [ ] **Color Palette Extraction:** drop an image and automatically get 3–4 cohesive background/overlay color suggestions.
- [ ] **"Story Mode" Auto-splitter:** paste a long piece of text, and watch the app intelligently chunk it into Hook → Value Points → CTA slides.
- [ ] Anti-collision logic between the logo, badge, and signature bars when they share the same corner.

### ✅ Recently shipped
- Dual image layers, rounded corners, resizable text box, per-slide font size, kicker labels, "swipe for more" footer, logo watermark with 7 placement options, drag-and-drop slide reordering, and native undo/redo.

---

## ☕ Support the Project

Carousel Studio is open-source, free, and will never track your data or sell you subscriptions. If this tool saved you time on your content creation workflow, consider buying me a coffee to keep the engine running!

---

Developed with ⚡ and (c)alma by Studio GH | [studio-gh.github.io/carousel](https://studio-gh.github.io/carousel/)
