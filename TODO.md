# CV Resume Creation App — Development TODO

> Ordered by dependency. Complete phases sequentially; items within a phase can be parallelized.

---

## Phase 0 — Project Setup

### Repository & Tooling
- [ ] Initialize monorepo structure:
  ```
  /
  ├── client/   (React + Vite)
  └── server/   (Node.js + Express)
  ```
- [ ] Add root `package.json` with workspaces (or use separate repos)
- [ ] Add `.gitignore` for `node_modules`, `.env`, `tmp/`, `dist/`
- [ ] Add `README.md` with setup instructions

### Backend Bootstrap
- [ ] `cd server && npm init -y`
- [ ] Install dependencies: `express`, `pg`, `dotenv`, `cors`, `helmet`, `joi`, `uuid`
- [ ] Install dev dependencies: `nodemon`, `jest`, `supertest`
- [ ] Create `.env` from `.env.example`
- [ ] Set up `src/app.js` with Express instance and middleware (cors, helmet, json parser)
- [ ] Set up `src/index.js` entry point with port binding
- [ ] Confirm server starts: `npm run dev`

### Frontend Bootstrap
- [ ] `cd client && npm create vite@latest . -- --template react`
- [ ] Install dependencies: `axios`, `zustand`, `react-router-dom`, `@dnd-kit/core`
- [ ] Install TailwindCSS and configure `tailwind.config.js`
- [ ] Remove Vite boilerplate (App.css, logo, etc.)
- [ ] Confirm app renders: `npm run dev`

### Database Setup
- [ ] Install and start PostgreSQL locally (or provision via Docker)
- [ ] Create database: `createdb cvapp`
- [ ] Write `db/migrations/001_create_users.sql`
- [ ] Write `db/migrations/002_create_cvs.sql`
- [ ] Run migrations manually or via a migration script
- [ ] Create `src/db/pool.js` with `pg.Pool` using `DATABASE_URL`
- [ ] Test DB connection from Node.js

---

## Phase 1 — Backend: Core API

### CV CRUD Endpoints
- [ ] Create `src/routes/cv.routes.js` and mount at `/api/cv`
- [ ] **POST `/api/cv`** — Save new CV draft
  - [ ] Validate request body (Joi schema: personal + sections)
  - [ ] Insert into `cvs` table (personal_data, sections as JSONB)
  - [ ] Return `{ id, createdAt }`
- [ ] **GET `/api/cv/:id`** — Fetch CV by ID
  - [ ] Validate UUID format
  - [ ] Return full CV JSON or 404
- [ ] **PUT `/api/cv/:id`** — Update CV draft
  - [ ] Validate body and UUID
  - [ ] Update row, set `updated_at = NOW()`
  - [ ] Return updated CV
- [ ] **DELETE `/api/cv/:id`** — Delete CV
  - [ ] Return 204 on success

### Validation Middleware
- [ ] Create `src/middleware/validate.js` using Joi
- [ ] Define Joi schemas for personal details and each section type
- [ ] Apply validation middleware to all POST/PUT routes

### Error Handling
- [ ] Create `src/middleware/errorHandler.js`
- [ ] Wrap all controllers in try/catch
- [ ] Return consistent error shape: `{ error: true, message, statusCode }`

---

## Phase 2 — Backend: LaTeX Export

### Python Script
- [ ] Create `server/python/generate_latex.py`
  - [ ] Read CV JSON from stdin (`import sys, json; data = json.load(sys.stdin)`)
  - [ ] Install Jinja2: `pip install jinja2`
  - [ ] Create `templates/resume.tex.j2` — base LaTeX template
  - [ ] Implement rendering for each section type:
    - [ ] Personal details (header block)
    - [ ] Experience entries
    - [ ] Education entries
    - [ ] Awards entries
    - [ ] Projects entries
    - [ ] Skills (grouped tag list)
    - [ ] Characteristics (tag list)
    - [ ] Certifications entries
    - [ ] Research Publications entries
  - [ ] Handle optional sections (skip if not present in JSON)
  - [ ] Output rendered `.tex` to stdout
  - [ ] Test script independently: `echo '{"personal": {...}}' | python3 generate_latex.py`

### LaTeX Service (Node.js)
- [ ] Create `src/services/latex.service.js`
  - [ ] Spawn Python script via `child_process.spawn`
  - [ ] Write CV JSON to stdin
  - [ ] Collect stdout into string buffer
  - [ ] Reject promise on non-zero exit code
  - [ ] Log stderr for debugging

### Export Endpoint
- [ ] **POST `/api/cv/export`** — Generate `.tex` from request body
  - [ ] Validate request body
  - [ ] Call `latex.service.generateLatex(cvData)`
  - [ ] Set response headers:
    - `Content-Type: application/x-tex`
    - `Content-Disposition: attachment; filename="resume.tex"`
  - [ ] Stream `.tex` content in response
- [ ] **POST `/api/cv/:id/export`** — Export saved CV by ID
  - [ ] Fetch CV from DB, then call same latex service
- [ ] Add rate limiting to export endpoints (`express-rate-limit`)

### Temp File Cleanup (if writing to disk instead of streaming)
- [ ] Create `src/utils/fileCleanup.js`
- [ ] Delete temp `.tex` files after response is sent

---

## Phase 3 — Frontend: State & Layout

### Global State (Zustand)
- [ ] Create `src/hooks/useCVStore.js`
- [ ] Define store shape:
  ```js
  { personal: {}, sections: [], addSection, removeSection,
    updatePersonal, addEntry, updateEntry, removeEntry, reorderSections }
  ```
- [ ] Implement all actions
- [ ] Add `localStorage` persistence middleware (Zustand persist)
- [ ] Add auto-save hook `useAutoSave.js` (debounced sync to backend)

### App Layout
- [ ] Create `src/pages/BuilderPage.jsx` as main layout
- [ ] Create `src/components/layout/Sidebar.jsx`
  - [ ] List all 9 possible sections
  - [ ] Show "Add" button for sections not yet added
  - [ ] Show "Added ✓" state for active sections
- [ ] Create `src/components/layout/Header.jsx`
  - [ ] App logo/name
  - [ ] "Generate LaTeX" CTA button
- [ ] Set up routing in `App.jsx` (react-router-dom)

---

## Phase 4 — Frontend: Section Components

### Shared UI Components
- [ ] `InputField.jsx` — label + input with validation state
- [ ] `TextArea.jsx` — label + textarea with character hint
- [ ] `TagInput.jsx` — comma-separated tag entry with pill display
- [ ] `DateRangePicker.jsx` — start/end month-year selectors + "Present" checkbox
- [ ] `SectionCard.jsx` — collapsible card with remove button and entry list

### Personal Details Section
- [ ] `PersonalDetails.jsx`
  - [ ] Fields: name, title, location, email, phone, linkedin, github, website
  - [ ] Always rendered (cannot be removed)
  - [ ] Inline validation (email format, URL format)

### Repeatable Entry Sections
For each: Experience, Education, Awards, Projects, Certifications, Research Publications:
- [ ] Create `{SectionName}.jsx` component
- [ ] Render list of entry cards from store
- [ ] Each entry card shows all relevant fields (see SPECS.md §1.2)
- [ ] "Add Entry" button appends blank entry to store
- [ ] Each entry has a "Remove Entry" button
- [ ] Entries are individually collapsible

#### Specific Sections
- [ ] `Experience.jsx` — title, company, location, dates, description textarea
- [ ] `Education.jsx` — degree, institution, location, dates, GPA, notes
- [ ] `Awards.jsx` — title, issuer, date, description
- [ ] `Projects.jsx` — name, tech stack (tags), dates, description, URL
- [ ] `Certifications.jsx` — name, issuer, issue date, expiry, credential ID, URL
- [ ] `ResearchPublications.jsx` — title, authors, journal, date, DOI/URL, abstract

### Tag-Based Sections
- [ ] `Skills.jsx`
  - [ ] Allow multiple skill groups (e.g. "Languages", "Frameworks")
  - [ ] Each group: label input + TagInput for skills
  - [ ] "Add Group" button
- [ ] `Characteristics.jsx`
  - [ ] Single TagInput for personal traits/soft skills

---

## Phase 5 — Frontend: Export Flow

- [ ] Create `src/services/api.js`
  - [ ] Axios instance with `baseURL` from env
  - [ ] `exportCV(cvData)` — POST to `/api/cv/export`, receive blob
  - [ ] `saveCV(cvData)` — POST to `/api/cv`
  - [ ] `loadCV(id)` — GET `/api/cv/:id`
- [ ] Create `src/components/modals/ExportModal.jsx`
  - [ ] Show on "Generate LaTeX" click
  - [ ] Display loading spinner during API call
  - [ ] On success: trigger browser file download
  - [ ] On error: show error message with retry option
- [ ] Wire "Generate LaTeX" button in `Header.jsx` to open modal and trigger export

---

## Phase 6 — Polish & QA

### Validation & UX
- [ ] Add required field indicators and inline error messages
- [ ] Prevent export if Personal Details are incomplete (name + email minimum)
- [ ] Show unsaved changes indicator
- [ ] Add empty state illustrations for sections with no entries

### Accessibility
- [ ] All inputs have associated `<label>` elements
- [ ] Focus management when adding/removing entries
- [ ] Keyboard navigable section cards
- [ ] ARIA labels on icon-only buttons (remove, collapse)

### Responsive Design
- [ ] Test and fix layout on mobile (375px)
- [ ] Sidebar collapses to bottom drawer on mobile
- [ ] Entry forms stack vertically on small screens

### Testing
- [ ] Backend: write Jest + Supertest tests for all API endpoints
- [ ] Backend: write unit tests for `latex.service.js` (mock child_process)
- [ ] Frontend: write React Testing Library tests for key components
- [ ] Integration: test full export flow end-to-end
- [ ] Test Python script with minimal, partial, and full CV JSON

---

## Phase 7 — Optional Enhancements (v2)

- [ ] User authentication (JWT) — save/load multiple CV drafts
- [ ] Drag-and-drop section reordering (`@dnd-kit/core`)
- [ ] Live LaTeX preview panel (render PDF in-browser via PDF.js)
- [ ] Multiple LaTeX template styles (modern, classic, academic)
- [ ] Export to PDF directly (call `pdflatex` on server, return `.pdf`)
- [ ] Share CV via public link
- [ ] Import from LinkedIn (scrape or OAuth)
- [ ] Dark mode toggle

---

## Quick Reference: Definition of Done

| Item         | Done When                                                        |
|--------------|------------------------------------------------------------------|
| Backend endpoint | Returns correct status codes, validated inputs, tested        |
| Section component | Renders, updates Zustand store, validates required fields    |
| Python script | Produces valid compilable `.tex` for all section combinations   |
| Export flow  | `.tex` file downloads correctly in Chrome, Firefox, Safari       |
| Overall app  | All sections can be added, filled, and exported without errors   |
