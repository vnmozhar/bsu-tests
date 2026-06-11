# Quiz App

Multiple-choice quiz app built with React, Vite, and Ant Design. Questions are from an International Economics question bank (127 questions in Russian).

## Features

- **Random question selection** — choose how many questions to practice (1–127)
- **Two feedback modes:**
  - **Live** — see correct/wrong immediately after each answer with color-coded options
  - **End** — all feedback shown only on the results screen
- **Moodle-like UI** — three-column layout with question info panel, navigation grid, and finish button
- **Results screen** — score percentage with grade, plus a full review of every question with highlighted correct/wrong answers

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

Output goes to `dist/`.

## Deploy to Vercel

Connect this repo in the Vercel dashboard — it auto-detects Vite. Or use the CLI:

```bash
npx vercel
```

The `vercel.json` is already configured with the correct build settings and SPA rewrite rule.

## Project Structure

```
src/
├── App.tsx               view router: setup → quiz → results
├── types.ts              Question and FeedbackMode types
├── index.css             option row and nav button styles
├── data/
│   └── questions.json    127 questions with options and correct answers
└── pages/
    ├── SetupPage.tsx     question count slider + feedback mode toggle
    ├── QuizPage.tsx      Moodle-style quiz layout with live/end modes
    └── ResultsPage.tsx   score summary + full Q&A review
```

## Tech Stack

- [React 18](https://react.dev)
- [Vite 5](https://vitejs.dev)
- [Ant Design 5](https://ant.design)
- TypeScript
