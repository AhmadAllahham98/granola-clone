# Granola Clone - Meeting Notes App

A full-stack, AI-powered meeting notes application built as a portfolio piece for the Granola Product Engineer interview. This project demonstrates end-to-end full-stack capabilities, focusing on type safety, modern React patterns, and LLM integrations.

## 🛠️ Tech Stack

### Frontend

- **Framework:** React 19 + TypeScript + Vite
- **Routing:** React Router v7
- **Data Fetching:** TanStack React Query (`@tanstack/react-query`)
- **Styling:** Tailwind CSS v4, Radix UI Primitives, `clsx`
- **Animations:** Framer Motion (`motion`)
- **Editor:** Markdown editor (`@uiw/react-md-editor`)

### Backend

- **Framework:** Express.js (v5) + Node.js + TypeScript
- **Database:** PostgreSQL with Prisma ORM (`@prisma/client`)
- **Validation:** Zod
- **Authentication:** JSON Web Tokens (JWT) + bcrypt
- **AI Integration:** OpenAI API (`openai`) for summarization and feature extraction
- **Testing:** Vitest, Supertest

---

## 🏗️ Architecture Decisions

### 1. Monorepo-style Structure

The project is logically divided into `frontend` and `backend` directories. This separation of concerns allows the frontend and backend to scale dynamically and be deployed independently (e.g., Frontend on Vercel, Backend on an AWS EC2 instance or Lambda/API Gateway). Both strictly use TypeScript for cross-boundary type safety.

### 2. Frontend: Data Fetching Pattern

**Decision:** Used `TanStack React Query` over raw `useEffect`/`fetch` loops.
**Rationale:** React Query provides built-in caching, automatic background refetching, and simplified loading/error state management. It optimally reduces redundant API calls when navigating back and forth between note lists and note details, which is crucial for a snappy, responsive user experience.

### 3. Frontend: Component Architecture (Atomic Design & Radix UI)

**Decision:** Leveraged Headless UI Primitives (Radix UI) combined with Tailwind CSS.
**Rationale:** Granola requires a highly polished, accessible interface. Radix UI handles the complex accessibility semantics (ARIA attributes, keyboard navigation, focus traps) for Modals, Popovers, and Dropdowns, leaving total stylistic control to Tailwind CSS. This effectively balances developer velocity with a premium user experience. Animations and page transitions are smoothly handled by Framer Motion.

### 4. Backend: Relational Database & ORM

**Decision:** PostgreSQL + Prisma ORM.
**Rationale:** Notes, users, and action items share highly relational logic boundaries. PostgreSQL provides robust transactional guarantees and complex querying capabilities. Prisma bridges the gap between the database and TypeScript by auto-generating type definitions from the database schema, minimizing runtime errors and simplifying complex JOIN operations.

### 5. Backend: API Design & Validation

**Decision:** RESTful API architecture with `Zod` validation.
**Rationale:** `Zod` securely parses incoming payloads at the edge (in route middlewares) before processing business logic touching the database. This ensures strict runtime type safety that perfectly aligns with TypeScript's compile-time verification.

### 6. AI Integration & Streaming

**Decision:** Proxy OpenAI interactions through the backend using Server-sent Streams / WebSockets to the UI.
**Rationale:** Directly exposing OpenAI keys on the client is totally insecure. By proxying the LLM requests through the Backend, the system is able to validate user authorization and rate-limit the requests. By streaming the completion via the new OpenAI Responses API directly to the client UI, we significantly reduce Time to First Byte (TTFB), offering users an immediate, real-time feedback loop reminiscent of the actual Granola application.
