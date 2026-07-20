# WitnessAI — Safe AI Enablement Platform

WitnessAI is an enterprise-grade **AI Guardrails, Security, and Governance Dashboard**. It is designed to act as a secure proxy between enterprise users and large language models (LLMs), providing real-time data loss prevention (DLP), sensitive data masking, custom policy enforcement, and detailed compliance audit trails.

With WitnessAI, enterprises can confidently enable AI adoption while preventing the accidental leak of confidential information, PII (Personally Identifiable Information), or violation of compliance frameworks (like GDPR, HIPAA, and PCI-DSS).

---

## 🚀 Key Features

### 1. Interactive Secure LLM Playground Proxy
*   **Real-Time Data Masking**: Automatically detects and masks PII (e.g., names, credit cards, SSNs, API keys, email addresses) before sending requests to the LLM.
*   **Safety Score & Risk Level Analysis**: Scores each outgoing prompt on security risk and highlights any triggered policy violations.
*   **Redacted Payload Previews**: Shows exactly what information is being masked, allowing users to understand how their raw input is sanitized.
*   **Gemini-Powered Engine**: Leverages the high-performance, server-side Gemini API (`@google/genai` SDK) to deliver safe, governed AI responses.

### 2. Custom Security Policy Builder
*   **Granular Scanning Controls**: Configure rules for DLP detection (GDPR Compliance, HIPAA Compliance, Financial Data/PCI, Source Code leaks, and Custom Regex Rules).
*   **Dynamic Severity Scoring**: Assign risk severities (Low, Medium, High, Critical) and choose action states (e.g., *Mask and Proxy*, *Block Entire Prompt*, or *Log Audit Trail*).
*   **Compliance Presets**: Instantly apply industry-standard templates with a single click.

### 3. Live Analytics & Compliance Audit Trail
*   **Bento-Grid Dashboard**: Displays real-time charts powered by `recharts` to monitor prompt volume, block rates, PII leak distribution, and policy violations.
*   **Complete Log Transparency**: High-fidelity audit logs capture user prompts, security action histories, triggered rules, and final redacted model inputs.

### 4. Enterprise-Ready Architecture
*   **Dual-Persistence Mode**: Operates in a lightweight local simulation mode out-of-the-box or connects to fully persistent cloud infrastructure (**Firebase Authentication & Firestore**) in seconds.
*   **Compliance-Friendly UI Theme**: Includes a specialized high-contrast **Compliance/Accessibility Theme** alongside a sleek dark visual theme, complying with enterprise accessibility standards.

---

## 🛠️ Technology Stack

*   **Frontend Framework**: React 19 (Functional Components, Hooks, State Managers)
*   **Styling & Motion**: Tailwind CSS v4 (Modern Theme Variables), `motion/react` (Smooth, hardware-accelerated transitions)
*   **Visualizations**: Recharts (Dynamic Bar/Area/Pie Charts), Lucide React (Clean icon assets)
*   **Backend Server**: Express (NodeJS custom hybrid proxy)
*   **Language & Bundler**: TypeScript (Strict Typings), Vite 6 (Development middleware mode), Esbuild (CJS server production bundling)
*   **AI Integration**: `@google/genai` (Server-side Gemini SDK)
*   **Identity & DB**: Optional Firestore Database and Firebase Authentication Integration

---

## 🔑 Architecture & Security Design

WitnessAI follows a **strict security-first blueprint** to prevent key exposure and ensure data privacy:
1.  **Server-Side Proxy Pattern**: All LLM interactions and DLP scanning occur inside the Express backend (`server.ts`).
2.  **API Key Encapsulation**: The `GEMINI_API_KEY` is maintained **strictly server-side** as an environment variable and is **never** sent to or exposed within the user's browser.
3.  **Vite Middleware Integration**: In development, Vite is mounted directly into the Express server as a middleware, routing hot-reloaded client assets over a single unified port (`3000`), resolving common cross-origin request issues.

---

## 🏁 Getting Started & Running Locally

Follow these instructions to run the platform locally or deploy it to production.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   An active Google AI Studio Gemini API Key (get one [here](https://aistudio.google.com/))

### 1. Clone & Set Up Environment Variables
Create a `.env` file in the root directory (using `.env.example` as a template):
```env
# Google AI Studio Gemini API Key (Mandatory for LLM operations)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Firebase Server Credentials (if using persistent database integration)
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=your-client-email
# FIREBASE_PRIVATE_KEY=your-private-key
```

### 2. Install Dependencies
Run the installation process to pull the required frontend and backend npm packages:
```bash
npm install
```

### 3. Run in Development Mode
To boot up the unified development server:
```bash
npm run dev
```
*   This will launch the Express server and Vite asset-bundler concurrently on **http://localhost:3000**.
*   Any edits to client-side files will immediately hot-reload via the embedded Vite middleware layer.

### 4. Build & Compile for Production
To bundle and optimize the application for containerized environments or production servers:
```bash
npm run build
```
This multi-stage compilation script performs two actions:
1.  **Vite Static Compile**: Compiles all React, CSS, and asset files into static code in the `/dist` folder.
2.  **Esbuild Backend Bundle**: Bundles the TypeScript backend (`server.ts`) into a single standalone CommonJS file at `/dist/server.cjs`, preventing runtime import resolution overhead.

### 5. Start Production Server
Launch the pre-compiled server:
```bash
npm run start
```
The production build serves the frontend statically from the `/dist` folder and handles backend API routing natively from `/dist/server.cjs` on port `3000`.

---

## 📂 Project Structure

```
├── dist/                     # Optimized production outputs (Static client & compiled server)
├── src/
│   ├── components/           # UI Components (Playground, Analytics, Policies, etc.)
│   ├── lib/                  # Helper modules and Firebase configuration
│   ├── App.tsx               # Main React entry point & tab manager
│   ├── main.tsx              # React mounting file with WebSocket noise suppression
│   ├── types.ts              # Shareable TypeScript interfaces (Policy, Log, Analytics)
│   └── index.css             # Global Tailwind v4 CSS styles & theme declarations
├── server.ts                 # Full-stack Express server (API, Proxy, DLP scanner)
├── metadata.json             # AI Studio applet metadata config
├── vite.config.ts            # Vite asset & dev server compiler options
├── tsconfig.json             # Strict compiler rules
└── package.json              # Script paths and dependency listings
```
