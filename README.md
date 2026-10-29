# SHELVI React Starter

A responsive React + TypeScript dashboard starter based on the SHELVI proposal.

## Requirements
- Node.js 20.19+ or 22.12+ recommended
- npm

## Run locally
1. Extract the ZIP.
2. Open the extracted `shelvi-react-starter` folder in VS Code.
3. Open Terminal > New Terminal.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open the local URL shown by Vite (usually `http://localhost:5173`).

## Included
- Responsive business dashboard
- Campaign summary cards and illustrative chart
- Recent campaigns with search and status filter
- Create campaign modal (client-side demo only)
- Wallet overview (sample values)
- Navigation placeholders for marketplace modules

## Important
This is a front-end starter using sample data. It does not implement authentication, persistent database storage, payment processing, real analytics, fraud checks, or secure role permissions. Campaigns created in the modal live only in React state and reset on refresh. Add a NestJS API and PostgreSQL before using real customer data or money.
