# CV Resume Creation App — Technical Specifications

## Overview

A full-stack web application that allows users to build a professional CV/resume by filling in structured form sections. Upon completion, the app compiles the generated LaTeX (`.tex`) code directly into a downloadable PDF document (`.pdf`) using a backend compiler, saving the user from manually converting files.

The application also supports uploading a professional profile image which is dynamically embedded in the final PDF CV.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React (Vite), TailwindCSS         |
| Backend    | Node.js, Express.js (REST API)    |
| Database   | PostgreSQL                        |
| ORM        | Prisma (or pg/node-postgres raw)  |
| LaTeX Gen  | Python script (renders `.tex` markup from Jinja2 templates) |
| PDF Comp   | Server-side compiler (e.g., `pdflatex` or `tectonic` spawned by Node.js service) |
| Auth       | JWT (optional, for saving drafts) |

---

## 1. Frontend Specifications

### 1.1 Application Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx           # Section navigation & add-section buttons
│   │   ├── Header.jsx
│   │   └── PreviewPanel.jsx      # Live CV preview (optional)
│   ├── sections/
│   │   ├── PersonalDetails.jsx
│   │   ├── Experience.jsx
│   │   ├── Education.jsx
│   │   ├── Awards.jsx
│   │   ├── Projects.jsx
│   │   ├── Skills.jsx
│   │   ├── Characteristics.jsx
│   │   ├── Certifications.jsx
│   │   └── ResearchPublications.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── InputField.jsx
│   │   ├── TextArea.jsx
│   │   ├── TagInput.jsx          # For skills/characteristics
│   │   ├── DateRangePicker.jsx
│   │   └── SectionCard.jsx       # Wrapper with add/remove/reorder controls
│   └── modals/
│       └── ExportModal.jsx       # Download options
├── pages/
│   ├── BuilderPage.jsx           # Main builder UI
│   └── LandingPage.jsx           # Optional intro page
├── hooks/
│   ├── useCVStore.jsx             # Zustand or Context state
│   └── useAutoSave.jsx
├── services/
│   └── api.jsx                    # Axios instance & API calls
└── utils/
    └── validators.jsx
```

### 1.2 CV Sections & Fields

#### Personal Details *(always visible, required)*
| Field         | Type   | Notes                         |
|---------------|--------|-------------------------------|
| Full Name     | text   | Required                      |
| Job Title     | text   | e.g. "Software Engineer"      |
| Profile Photo | string | Base64 encoded image (PNG/JPEG) data URL |
| Location      | text   | City, Country                 |
| Email (Gmail) | email  | Validated format              |
| Phone Number  | tel    | With country code             |
| LinkedIn URL  | url    |                               |
| GitHub URL    | url    |                               |
| Website       | url    | Optional                      |

#### Experience *(repeatable)*
| Field        | Type      |
|--------------|-----------|
| Job Title/Position    | text      |
| Company/Org      | text      |
| Location     | text      |
| Start Date   | month/yr  |
| End Date     | month/yr or "Present" |
| Description1  | textarea (bullet points) |
| Description2  | textarea (bullet points) |

#### Education *(repeatable)*
| Field        | Type      |
|--------------|-----------|
| Degree       | text      |
| Institution  | text      |
| Location     | text      |
| Start Date   | month/yr  |
| End Date     | month/yr or "Present" |
| GPA          | text (optional) |
| Notes        | textarea  |

#### Awards *(repeatable)*
| Field        | Type      |
|--------------|-----------|
| Award Title  | text      |
| Issuer       | text      |
| Date         | month/yr  |
| Description  | textarea  |

#### Projects *(repeatable)*
| Field         | Type      |
|---------------|-----------|
| Project Name  | text      |
| Tech Stack    | tag input |
| Start Date    | month/yr  |
| End Date      | month/yr  |
| Description   | textarea  |
| URL / Repo    | url       |

#### Skills *(tag-based)*
| Field        | Type      |
|--------------|-----------|
| Skill Groups | key-value (e.g. "Languages: Python, JS") |

#### Characteristics *(tag-based)*
| Field           | Type     |
|-----------------|----------|
| Characteristic  | tags     |

#### Certifications *(repeatable)*
| Field           | Type      |
|-----------------|-----------|
| Cert Name       | text      |
| Issuing Body    | text      |
| Date Issued     | month/yr  |
| Expiry Date     | month/yr (optional) |
| Credential ID   | text      |
| URL             | url       |

#### Research Publications *(repeatable)*
| Field       | Type      |
|-------------|-----------|
| Title       | text      |
| Authors     | text      |
| Journal/Conf| text      |
| Date        | month/yr  |
| DOI / URL   | url       |
| Abstract    | textarea  |

---

### 1.3 Section Management

- A **sidebar or top toolbar** lists all possible sections.
- Sections not yet added show an **"Add Section" button**.
- Added sections appear in the main builder area as collapsible cards.
- Each section card has:
  - Collapse/expand toggle
  - Delete section button
  - Drag-to-reorder handle (optional v2)
- Repeatable sections (Experience, Education, etc.) have an **"Add Entry"** button that appends a new blank entry form.

### 1.4 State Management

- Use **Zustand** (recommended) or React Context + useReducer.
- CV state shape:

```js
{
  personal: { name, title, location, email, phone, linkedin, github, website },
  sections: [
    { id: uuid, type: "experience", order: 0, entries: [...] },
    { id: uuid, type: "education", order: 1, entries: [...] },
    // ...
  ]
}
```

- Auto-save to `localStorage` on every change (debounced 1s).
- Optional: sync to backend DB (requires auth).

### 1.5 Export Flow

1. User clicks **"Generate PDF"** button.
2. Frontend POSTs full CV JSON (including base64 profile photo data) to `POST /api/cv/export`.
3. Backend parses request, decodes the base64 image (if present), and writes it to a temporary compilation directory.
4. Backend runs Python script to generate the raw LaTeX code with appropriate template layout (including the image include path).
5. Backend writes the `.tex` file to the temporary directory.
6. Backend spawns a child process to run `pdflatex` or `tectonic` over the temporary `.tex` file to build `resume.pdf`.
7. Backend returns the compiled `resume.pdf` file as a download stream.
8. Frontend triggers browser download.
9. Backend removes all temporary files (the `.tex`, `.pdf`, `.aux`, `.log`, and decoded image file) from the system.

---

## 2. Backend Specifications

### 2.1 Project Structure

```
server/
├── src/
│   ├── routes/
│   │   ├── cv.routes.jsx         # CV CRUD & export
│   │   └── user.routes.jsx       # Auth (optional)
│   ├── controllers/
│   │   ├── cv.controller.jsx
│   │   └── export.controller.jsx
│   ├── services/
│   │   ├── cv.service.jsx        # Business logic
│   │   └── latex.service.jsx     # Calls Python script
│   ├── middleware/
│   │   ├── validate.jsx          # Joi/Zod request validation
│   │   └── errorHandler.jsx
│   ├── db/
│   │   ├── pool.jsx              # pg Pool instance
│   │   └── migrations/          # SQL migration files
│   ├── utils/
│   │   └── fileCleanup.jsx       # Remove temp .tex files
│   └── app.jsx
├── python/
│   └── generate_latex.py        # LaTeX generation script
├── .env
└── package.json
```

### 2.2 REST API Endpoints

#### CV Resource

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| POST   | `/api/cv`             | Save a new CV draft                |
| GET    | `/api/cv/:id`         | Retrieve a saved CV by ID          |
| PUT    | `/api/cv/:id`         | Update a CV draft                  |
| DELETE | `/api/cv/:id`         | Delete a CV                        |
| POST   | `/api/cv/export`      | Generate and download compiled `.pdf` file |
| POST   | `/api/cv/:id/export`  | Export a saved CV by ID as a `.pdf` file   |

#### Request Body — Save/Update CV

```json
{
  "personal": {
    "name": "Juan dela Cruz",
    "title": "Software Engineer",
    "location": "Davao City, Philippines",
    "email": "juan@gmail.com",
    "phone": "+63 912 345 6789",
    "linkedin": "https://linkedin.com/in/juan",
    "github": "https://github.com/juan",
    "website": ""
  },
  "sections": [
    {
      "type": "experience",
      "order": 0,
      "entries": [
        {
          "title": "Backend Developer",
          "company": "Acme Corp",
          "location": "Remote",
          "startDate": "2022-06",
          "endDate": "Present",
          "description": "Built REST APIs...\nManaged PostgreSQL databases..."
        }
      ]
    }
  ]
}
```

#### Response — Export

- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="resume.pdf"`
- Body: raw `.pdf` binary stream

### 2.3 Database Schema (PostgreSQL)

```sql
-- Users (optional, for saved drafts)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CV Drafts
CREATE TABLE cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'My Resume',
  personal_data JSONB NOT NULL DEFAULT '{}',
  sections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX idx_cvs_user_id ON cvs(user_id);
```

> All structured section data is stored as **JSONB** for flexibility, avoiding the need for many joined tables.

### 2.4 Python LaTeX Generation

**Script:** `python/generate_latex.py`

- Accepts CV JSON via **stdin** or as a **CLI argument** (`--json`).
- Outputs a valid `.tex` markup to **stdout**.
- Uses Jinja2 templating for `.tex` template rendering.
- Handles embedding the profile photo if `profilePhotoPath` (the path to the temporary image file on the backend host) is defined in the JSON metadata.
- Node.js calls this script and compiles the PDF using a sub-process wrapper.

```js
// latex.service.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function generatePdf(cvData) {
  return new Promise((resolve, reject) => {
    const runId = uuidv4();
    const tempDir = path.join(process.env.TEMP_DIR || './tmp', runId);
    
    // 1. Setup workspace directory
    fs.mkdirSync(tempDir, { recursive: true });
    
    let imageFilename = null;
    if (cvData.personal?.profilePhoto) {
      // Decode profilePhoto data URL if present
      const matches = cvData.personal.profilePhoto.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1];
        const base64Data = matches[2];
        imageFilename = `profile.${ext}`;
        fs.writeFileSync(path.join(tempDir, imageFilename), Buffer.from(base64Data, 'base64'));
      }
    }
    
    const renderData = {
      ...cvData,
      personal: {
        ...cvData.personal,
        profilePhotoPath: imageFilename // File name of the image relative to compilation folder
      }
    };

    // 2. Generate LaTeX code via Python script
    const py = spawn(process.env.PYTHON_PATH || 'python3', ['./python/generate_latex.py']);
    let texContent = '';
    let pyError = '';
    
    py.stdin.write(JSON.stringify(renderData));
    py.stdin.end();
    
    py.stdout.on('data', chunk => texContent += chunk);
    py.stderr.on('data', chunk => pyError += chunk);
    
    py.on('close', code => {
      if (code !== 0) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        return reject(new Error(`LaTeX template generation failed: ${pyError}`));
      }
      
      const texPath = path.join(tempDir, 'resume.tex');
      fs.writeFileSync(texPath, texContent);
      
      // 3. Compile .tex to .pdf using pdflatex
      // Execute in tempDir so generated build artifacts stay contained
      const compiler = spawn('pdflatex', [
        '-interaction=nonstopmode',
        '-halt-on-error',
        'resume.tex'
      ], { cwd: tempDir });
      
      let compilerLog = '';
      compiler.stdout.on('data', chunk => compilerLog += chunk);
      
      compiler.on('close', compileCode => {
        if (compileCode !== 0) {
          fs.rmSync(tempDir, { recursive: true, force: true });
          return reject(new Error(`PDF compilation failed. Log: ${compilerLog}`));
        }
        
        const pdfPath = path.join(tempDir, 'resume.pdf');
        if (fs.existsSync(pdfPath)) {
          const pdfBuffer = fs.readFileSync(pdfPath);
          // Delete temp files asynchronously to free disk space
          fs.rm(tempDir, { recursive: true, force: true }, () => {});
          resolve(pdfBuffer);
        } else {
          fs.rmSync(tempDir, { recursive: true, force: true });
          reject(new Error('PDF file not found after successful compile run.'));
        }
      });
    });
  });
}
```

### 2.5 Environment Variables

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/cvapp
JWT_SECRET=your_secret_here
PYTHON_PATH=python3
TEMP_DIR=./tmp
```

---

## 3. Security Considerations

- Sanitize all inputs before passing to the Python script (prevent shell injection).
- Use parameterized queries or an ORM for all DB operations.
- Rate-limit the `/api/cv/export` endpoint (expensive operation).
- Clean up temporary `.tex` files after serving the download.
- CORS configured to allow only the frontend origin.

---

## 4. Non-Functional Requirements

| Requirement    | Target                            |
|----------------|-----------------------------------|
| LaTeX export   | < 3 seconds response              |
| Auto-save      | Debounced, every 1s of inactivity |
| Accessibility  | WCAG 2.1 AA compliance            |
| Mobile Support | Responsive down to 375px          |
| Browser Support| Chrome, Firefox, Safari, Edge     |
