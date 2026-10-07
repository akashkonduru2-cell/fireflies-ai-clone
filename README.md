# FireNotes AI — Meeting Intelligence & Transcription Platform

A full-stack, production-quality Meeting Intelligence Workspace inspired by **Fireflies.ai**, engineered with **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS v4**, **FastAPI**, **SQLAlchemy 2.0**, and **SQLite**.

The platform enables teams to review recorded discussions, navigate synchronized audio and transcripts with bi-directional scrub and seek capabilities, edit individual transcript dialogue lines with instant persistence, inspect AI-generated executive summaries, manage extracted action items, and perform global full-text search across dialogue and deliverables.

---

## 🌟 Key Features

### 1. Meeting Dashboard & Library (`/` and `/meetings`)
- **Seeded Data**: Starts populated with realistic meetings (*Product Planning*, *Engineering Sync*, *Marketing Review*, *Client Discovery Call*, *Sprint Retrospective*, *Hiring Discussion*, *Project Kickoff*) without dummy lorem ipsum.
- **Instant Search**: Debounced search across meeting titles and participant names.
- **Date Filters**: Filter meetings by *All*, *Today*, *This Week*, or *Older*.
- **Multi-criteria Sorting**: Sort by *Newest First*, *Oldest First*, *Longest Duration*, or *Shortest Duration*.
- **Metrics Bar**: Live KPIs for Total Meetings, Cumulative Audio Hours, Open Action Items, and Transcript Segments.
- **Meeting Cards**:
  - Semantic `#tag` topic badges with an expandable `+N more` pill for meetings with extensive topics.
  - Clear bottom metrics: `{N} lines`, `{N} tasks`, `AI Summary` indicator badge, and `Open →` action link.
- **Full Meeting CRUD**: Create new meetings with custom transcripts, edit metadata (title, date, duration, participants), and cascade-delete meetings with confirmation dialogs.

### 2. Interactive Meeting Workspace (`/meetings/[id]`)
- **Controlled Media Player**:
  - Play / Pause with live animated audio waveform.
  - Interactive scrub slider (seek bar) synchronized with audio elapsed time.
  - Variable playback speed (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`).
  - Quick skip (`-10s` / `+10s`), volume slider, and audio mute toggle.
- **Bi-Directional Player ↔ Transcript Synchronization**:
  - **Player → Transcript**: As playback time advances, the active speaker segment highlights dynamically in purple and smoothly auto-scrolls into focus.
  - **Transcript → Player**: Clicking any speaker timestamp or dialog line instantly seeks the media player to that precise second.
- **Inline Transcript Line Editing**:
  - Hover over any spoken dialogue line and click `[Edit]`.
  - Edit dialogue text in an inline auto-focused textarea.
  - Click `[Save]` to persist updates immediately to SQLite via `PATCH /api/meetings/{id}/transcript/{segment_id}` with live toast confirmation.
  - Click `[Cancel]` to discard changes without affecting playback.
- **Transcript Import / Replacement**:
  - Click `[Import/Edit]` in the transcript header to paste or replace dialogue formatted as `Speaker|MM:SS|Text`.
- **In-Transcript Search**:
  - Case-insensitive search bar above the transcript.
  - In-place text highlighting with match counter (`Match X of Y`).
  - Next / Previous match navigation buttons with scroll-to-match.
- **AI Summary Panel**:
  - Executive Overview paragraph.
  - Bulleted Key Takeaways with status markers.
  - Key Topics tags.
  - Inline editor to update takeaways with instant SQLite persistence.
  - One-click copy summary to clipboard.
- **Action Items Tracker**:
  - Mark deliverables complete/incomplete with visual strikethrough.
  - Add, edit, and delete action items with assignees and due dates.

### 3. Consolidated Action Items Workspace (`/action-items`)
- Organization-wide view of deliverables across all recorded meetings.
- Filter by *All*, *Pending*, or *Completed* tasks.
- Search tasks by description or assignee.
- Inline status toggling and quick navigation to the origin meeting.

### 4. Global Search (`/search`)
- Unified multi-entity search querying across meeting titles, attendee rosters, spoken dialogue, topic tags, and action items simultaneously.

### 5. Profile & Account Page (`/profile`)
- Dedicated user profile overview displaying authenticated evaluator session, job role, email, and workspace affiliation.
- Interactive form to update profile information with live toast feedback.
- Workspace security governance badges (SQLite storage, single-user session, development environment).

### 6. Workspace Settings & Appearance (`/settings`)
- **Global Theme Persistence**: Switch between Light Mode and Dark Mode with `localStorage` persistence.
- **Zero Theme Flashing**: Early inline `<script>` in the document `<head>` prevents theme flicker on page reloads.
- **Tailwind v4 Scoped Variants**: Configured with `@custom-variant dark (&:where(.dark, .dark *));` to respect explicit user selection rather than OS defaults.
- Settings tabs for *Appearance & Theme*, *Profile & Account*, *Notifications*, *Integrations*, and *Security & Retention*.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | **Next.js 16** (App Router, Turbopack) |
| **UI Library** | **React 19**, TypeScript, Lucide React Icons |
| **Styling** | **Tailwind CSS v4** (Modern CSS variables, scoped dark mode) |
| **Backend Framework** | **Python 3.11+**, **FastAPI** |
| **ORM & Database** | **SQLAlchemy 2.0**, **SQLite** (Foreign keys with cascading deletes) |
| **Data Validation** | **Pydantic v2** |
| **Testing** | **Pytest**, FastAPI TestClient (HTTPX) |

---

## 🏛 Architecture & Folder Structure

```
SP Project 1/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx            # Global HTML layout with Theme & Toast providers, anti-flash script
│   │   ├── page.tsx              # Meeting Library Dashboard & KPI cards
│   │   ├── globals.css           # Tailwind v4 theme tokens & custom dark variant
│   │   ├── action-items/         # Consolidated Action Items Workspace
│   │   │   └── page.tsx
│   │   ├── meetings/             # Meetings routing
│   │   │   ├── page.tsx          # Dashboard alias
│   │   │   └── [id]/             # Meeting Detail Workspace (Player, transcript, summary)
│   │   │       └── page.tsx
│   │   ├── profile/              # Dedicated User Profile & Account page
│   │   │   └── page.tsx
│   │   ├── search/               # Global multi-entity search page
│   │   │   └── page.tsx
│   │   └── settings/             # Workspace settings & theme toggle
│   │       └── page.tsx
│   ├── components/               # Modular UI components
│   │   ├── Sidebar.tsx           # Collapsible SaaS navigation with theme switch & profile link
│   │   ├── Header.tsx            # Sticky header with quick actions & search
│   │   ├── MeetingCard.tsx       # Meeting card with tag pills (+N more) and bottom metrics
│   │   ├── MeetingSearch.tsx     # Debounced search input
│   │   ├── MeetingFilters.tsx    # Date filters & sort selectors
│   │   ├── MeetingPlayer.tsx     # Controlled audio player with waveform & speed
│   │   ├── Transcript.tsx        # Scrollable transcript container with auto-scroll & search
│   │   ├── TranscriptSegment.tsx # Spoken segment with inline line editing ([Edit], [Save], [Cancel])
│   │   ├── TranscriptSearch.tsx  # In-transcript search toolbar
│   │   ├── SummaryPanel.tsx      # AI Overview & Takeaways editor card
│   │   ├── ActionItems.tsx       # Meeting action items manager
│   │   ├── ActionItemModal.tsx   # Modal for adding/editing tasks
│   │   ├── CreateMeetingModal.tsx# Modal with raw transcript parser
│   │   ├── EditMeetingModal.tsx  # Modal for editing meeting metadata
│   │   └── DeleteMeetingModal.tsx# Confirmation modal for cascading deletion
│   ├── context/
│   │   ├── ToastContext.tsx      # Global toast notifications
│   │   └── ThemeContext.tsx      # Global light/dark theme context
│   ├── lib/
│   │   ├── api.ts                # Centralized backend HTTP client
│   │   └── utils.ts              # Duration, timestamp, and avatar helpers
│   ├── types/
│   │   └── index.ts              # Strict TypeScript definitions
│   ├── eslint.config.mjs         # ESLint 9 flat configuration
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI application, CORS, lifespan startup & auto-seeding
│   │   ├── database.py           # SQLAlchemy engine & SessionLocal dependency
│   │   ├── seed.py               # Seed script with 7 realistic sample meetings
│   │   ├── models/               # SQLAlchemy ORM models
│   │   │   ├── meeting.py
│   │   │   ├── participant.py
│   │   │   ├── transcript.py
│   │   │   ├── summary.py
│   │   │   ├── topic.py
│   │   │   └── action_item.py
│   │   ├── schemas/              # Pydantic validation schemas
│   │   │   ├── meeting.py
│   │   │   ├── participant.py
│   │   │   ├── transcript.py     # Includes TranscriptSegmentUpdate schema
│   │   │   ├── summary.py
│   │   │   ├── topic.py
│   │   │   └── action_item.py
│   │   ├── services/             # Business logic layer
│   │   │   ├── meeting_service.py
│   │   │   ├── transcript_service.py # Parser & segment update service
│   │   │   ├── summary_service.py
│   │   │   └── action_item_service.py
│   │   └── routers/              # FastAPI REST routers
│   │       ├── meetings.py
│   │       ├── transcript.py     # Includes segment PATCH/PUT endpoints
│   │       ├── summary.py
│   │       ├── action_items.py
│   │       └── search.py
│   ├── tests/                    # Pytest test suite (13 passing tests)
│   │   ├── conftest.py           # In-memory SQLite test fixtures
│   │   ├── test_meetings.py      # Meetings, CRUD, and transcript line editing tests
│   │   └── test_action_items.py  # Action items & global search tests
│   └── requirements.txt
│
├── README.md
└── .gitignore
```

---

## 🗄 Relational Database Schema

All tables enforce foreign keys with `ON DELETE CASCADE` to guarantee referential integrity:

```mermaid
erDiagram
    MEETINGS ||--o{ PARTICIPANTS : has
    MEETINGS ||--o{ TRANSCRIPT_SEGMENTS : contains
    MEETINGS ||--o| SUMMARIES : generates
    MEETINGS ||--o{ TOPICS : tags
    MEETINGS ||--o{ ACTION_ITEMS : assigns

    MEETINGS {
        int id PK
        string title
        datetime meeting_date
        int duration
        string audio_url
        datetime created_at
        datetime updated_at
    }

    PARTICIPANTS {
        int id PK
        int meeting_id FK
        string name
        string email
    }

    TRANSCRIPT_SEGMENTS {
        int id PK
        int meeting_id FK
        string speaker
        float start_time
        float end_time
        text text
    }

    SUMMARIES {
        int id PK
        int meeting_id FK
        text overview
        text key_takeaways
        datetime created_at
        datetime updated_at
    }

    TOPICS {
        int id PK
        int meeting_id FK
        string name
    }

    ACTION_ITEMS {
        int id PK
        int meeting_id FK
        string task
        string assignee
        string due_date
        boolean completed
        datetime created_at
        datetime updated_at
    }
```

### Table Breakdown
1. **`meetings`**: Core meeting entity storing meeting title, scheduled date, duration in seconds, optional audio URL, and audit timestamps.
2. **`participants`**: Meeting attendees associated with `meetings.id`.
3. **`transcript_segments`**: Individual dialogue segments storing `speaker`, `start_time` (seconds), `end_time` (seconds), and spoken `text`.
4. **`summaries`**: AI executive digest for the meeting with `overview` and serialized `key_takeaways` JSON list.
5. **`topics`**: Categorical tags and subject keywords identified during the discussion.
6. **`action_items`**: Deliverables with `task`, `assignee`, optional `due_date`, and `completed` status flag.

---

## 🔌 API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and root information |
| `GET` | `/health` | API health check endpoint |
| `GET` | `/api/meetings` | List meetings with `?search=...`, `?filter=all\|today\|week\|older`, and `?sort=newest\|oldest\|longest\|shortest` |
| `GET` | `/api/meetings/{id}` | Full meeting details including participants, transcript, summary, topics, and action items |
| `POST` | `/api/meetings` | Create meeting (supports raw transcript parsing formatted as `Speaker\|MM:SS\|Text`) |
| `PUT` | `/api/meetings/{id}` | Update title, date, duration, or participants |
| `DELETE` | `/api/meetings/{id}` | Permanently delete meeting with cascading removal of all related records |
| `GET` | `/api/meetings/{id}/transcript` | Fetch ordered transcript segments for a meeting |
| `POST` | `/api/meetings/{id}/transcript` | Append multiple transcript segments to a meeting |
| `PATCH` | `/api/meetings/{id}/transcript/{segment_id}` | **Update individual transcript line text or speaker with instant persistence** |
| `PUT` | `/api/meetings/{id}/transcript/{segment_id}` | Full update of an individual transcript segment |
| `POST` | `/api/meetings/{id}/transcript/parse` | Parse raw text string and replace meeting transcript segments |
| `GET` | `/api/meetings/{id}/summary` | Retrieve meeting AI summary |
| `PUT` | `/api/meetings/{id}/summary` | Update summary overview and key takeaways list |
| `GET` | `/api/action-items` | Get all action items across all meetings |
| `GET` | `/api/meetings/{id}/action-items` | Get action items for a specific meeting |
| `POST` | `/api/meetings/{id}/action-items` | Add a new action item to a meeting |
| `PUT` | `/api/action-items/{id}` | Update action item (mark complete, change task, reassign) |
| `DELETE` | `/api/action-items/{id}` | Remove action item |
| `GET` | `/api/search?q={query}` | Global search across meetings, dialogue, action items, and topics |

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env.local` or environment)
| Variable | Default Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Base URL for FastAPI backend endpoints |

### Backend (`backend/.env` or environment)
| Variable | Default Value | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./meeting_intelligence.db` | SQLAlchemy database connection URI |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000,*` | Comma-separated CORS allowed origins |

---

## 🚀 Local Setup Instructions

### Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+

---

### Step 1: Backend Setup (FastAPI)

1. Open a terminal and navigate into the `backend` folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the database seed script:
   ```bash
   python -m app.seed
   ```
   *(Note: The server also auto-seeds the SQLite database on startup if empty!)*

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - Swagger Interactive API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - API Root: [http://localhost:8000/](http://localhost:8000/)

---

### Step 2: Frontend Setup (Next.js)

1. Open a second terminal window and navigate into the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Running Automated Tests

Run backend tests using pytest:

```bash
cd backend
.\venv\Scripts\pytest -v
```

The 13 automated tests cover:
- Root endpoint verification (`/`)
- Meetings retrieval with participants and segment counts
- Search by meeting title and search by participant name
- Duration and date sorting
- Meeting detail extraction
- Raw transcript parsing and automatic timestamp calculations
- Metadata updates preserving transcript records
- Cascading deletion across foreign key relationships
- **Individual transcript segment editing and persistence** (`PATCH`)
- **Independent multi-segment editing isolation**
- Action item CRUD lifecycle (creation, toggle completed, deletion)
- Global search queries

---

## 🚢 Deployment Considerations

### Frontend → Vercel
1. Set the Root Directory to `frontend`.
2. Configure Environment Variable:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com
   ```
3. Deploy directly via GitHub.

### Backend → Render / Railway
1. Set Build Command: `pip install -r requirements.txt`
2. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Configure Environment Variables:
   ```env
   ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
   ```
4. For multi-replica production environments, set `DATABASE_URL=postgresql://user:pass@host:5432/dbname` (SQLAlchemy seamlessly switches from SQLite to PostgreSQL with zero code changes).

---

## 💡 Engineering Assumptions & Design Choices

1. **Mocked Authentication**: User session is assumed active (`Akash K. - Fullstack Software Engineer`) to prioritize meeting intelligence workflows over login flows.
2. **Deterministic Audio Clock**: To provide an instant, reliable experience without requiring heavy external media file downloads, the player uses a high-precision internal playback clock that smoothly coordinates audio time with transcript segments and ambient tone synthesis.
3. **Flexible Transcript Parser**: The transcript ingestion engine supports flexible formats:
   - Pipe format: `Speaker|00:15|Meeting note text here`
   - Bracket format: `[00:15] Speaker: Meeting note text here`
   - Colon format: `Speaker (00:15): Meeting note text here`
4. **Relational Integrity**: Foreign keys with `cascade="all, delete-orphan"` ensure that when a meeting is deleted, all orphan segments, summaries, and action items are purged automatically.
5. **Safe Transitive Dependency Overrides**: The npm `overrides` field explicitly pins internal dependencies (`braces: 3.0.3`) to prevent security vulnerabilities without triggering breaking version downgrades.
