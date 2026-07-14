# Geo Spoofing Extension

A browser extension that allows you to spoof your geographic location seamlessly. 

## Features

- **Location Override**: Set custom GPS coordinates to simulate being anywhere in the world.
- **Easy Toggle**: Turn the spoofing on or off with a single click.
- **Privacy Focused**: Operates entirely locally in your browser.

---

## How to Install the Extension in Chrome

Follow these steps to install the extension directly from the latest GitHub release.

### Step 1: Go to Releases
On the right side of this repository, click on the **[Releases](../../releases)** section.

### Step 2: Download the ZIP
On the Releases page, locate the latest release and download the `extension.zip` file under the "Assets" section.

### Step 3: Extract the ZIP
Locate the downloaded `extension.zip` on your computer and extract it. This will typically create a folder containing the extension's files (most importantly, the `manifest.json`).

### Step 4: Install in Chrome
To load this extracted folder into Chrome, please follow this detailed guide:  
**[How to Install an Unpacked Extension in Chrome](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/)**

---

## Local Development Setup

If you want to build this extension from the source code, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/athulkrishnama/geo-spoofing-extension.git
   cd geo-spoofing-extension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```
   *This will generate the built extension inside the `dist` directory.*

4. **Load into Chrome**: Follow the link provided in Step 4 above, but select the newly generated `dist` folder.
