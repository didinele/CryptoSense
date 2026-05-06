# 🤖 Copilot Instructions for CryptoSense

Welcome to the CryptoSense codebase! This file outlines the architectural standards and strict rules for coding agents to follow when making changes or suggesting code.

## 🏗️ Architecture & Monorepo Overview

This project uses **Yarn Workspaces (Yarn v4)** and **Turborepo** to manage multiple packages. It represents a microservices-driven approach heavily inspired by the `SimplyChords` architecture.

- **Frontend (`apps/dashboard`)**: Next.js 15 App router app using React Compiler and Tailwind CSS v4.
- **Backend (`services/api`)**: Node.js APIs built with `polka`. It imports shared logic from packages.
- **Database (`packages/db`)**: Raw postgres connections using `porsager/postgres`. Migrations should be handled via `ley`.
- **Shared Core (`packages/core`)**: Domain logic and types, shared seamlessly between frontend and backend.
- **Configs (`packages/config`)**: TS, Next, and Node TS configurations.

## ⚖️ Strict Rules for the AI Agent

1. **Package Manager**: ONLY USE **YARN** (Yarn v4).
   - 🚫 Do not run `npm install`, `pnpm add`, etc.
   - ✅ Always use `yarn add <pkg>` or `yarn workspace <name> add <pkg>`.
2. **Linting & Formatting**:
   - The project uses **ESLint v9** specifically with `eslint-config-neon` and `typescript-eslint`.
   - Never override the ESLint file completely on a whim. The rules are designed to be extremely strict (e.g., interface enforcement, PascalCase type definitions).
3. **Tests**:
   - We use **Vitest**, not Jest.
   - When a component or utility is written, consider writing a `.test.ts` or `.test.tsx` file alongside it.
   - The lab requires _Teste automate (inclusiv evals pt agenți)_. Make sure tests are robust and cover edge cases.
4. **Agent Implementations (For MDS Grading)**:
   - Part of the system logic inherently involves 2 functional AI agents analyzing data.
   - Place AI integrations inside the `services/api` folder under structured controllers. Do not accidentally mix frontend presentation logic with AI evaluation logic.
   - Utilize small local models or simple API calls with comprehensive prompts. Ensure you plan "eval" queries as Vitest tests.
5. **Project Progression**:
   - When suggesting new systems, make sure they tie into the user stories.
   - Whenever an integration breaks, verify the `turbo` build or `yarn lint` to ensure strict types were not violated during AI generations.
