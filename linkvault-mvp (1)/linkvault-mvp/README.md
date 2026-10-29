# LinkVault MVP

A responsive React + TypeScript bookmark manager. Uses plain CSS and media queries (no CSS framework).

## Features
- Create, view, edit, and delete saved links
- Search title, URL, description, and tags
- Favorite links and browse by tag
- Data persists in browser `localStorage`
- Import/export JSON backups
- Responsive layout for 320px through desktop breakpoints
- Form validation, confirmation prompts, and toast notifications
- Accessible labels, keyboard Escape-to-close, visible focus states, and reduced-motion support

## Run locally
Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL Vite prints in your terminal.

## Production build
```bash
npm run build
npm run preview
```
The production site is generated in `dist/`.

## Host it for free with Vercel
1. Create a GitHub repository and push this project.
2. Sign in at https://vercel.com and import the repository.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Deploy.

Alternative: Netlify can deploy the repository with build command `npm run build` and publish directory `dist`.

## Important persistence note
`localStorage` belongs to a specific browser profile on a specific device. It does **not** sync between devices or browsers, and clearing browser data can remove saved links. Use Export backup regularly. For genuine access from anywhere, add authentication and a hosted database/API (for example, Supabase or Firebase).

## Demo content
The first launch seeds a few example links into local storage to make the interface easy to evaluate. You can delete them and start with an empty collection.
