# FireNotes AI — Meeting Intelligence & Transcription Platform

A full-stack, production-quality Meeting Intelligence Workspace inspired by **Fireflies.ai**, engineered with **Next.js**, **TypeScript**, **Tailwind CSS**, **FastAPI**, **SQLAlchemy**, and **SQLite**.

The platform enables teams to review recorded discussions, navigate synchronized audio and transcripts with bi-directional scrub and seek capabilities, inspect AI-generated executive summaries, manage extracted action items, and perform global full-text search across dialogue and deliverables.

---

## 🌟 Key Features

### 1. Meeting Dashboard & Library (`/` and `/meetings`)
- **Seeded Data**: Starts populated with realistic meetings (Product Planning, Engineering Sync, Marketing Review, Client Discovery, Retrospective, Hiring Discussion) without dummy lorem ipsum.
- **Instant Search**: Debounced search across meeting titles and participant names.
- **Date Filters**: Filter by *All*, *Today*, *This Week*, or *Older*.
- **Multi-criteria Sorting**: Sort by *Newest First*, *Oldest First*, *Longest Duration*, or *Shortest Duration*.
- **Metrics Bar**: Live KPIs for Total Meetings, Cumulative Audio Hours, Open Action Items, and Transcript Segments.
- **Full CRUD**: Create, Edit metadata, and Cascading Delete with confirmation dialogs and toasts.

### 2. Interactive Meeting Workspace (`/meetings/[id]`)
- **Controlled Media Player**:
  - Play / Pause with live animated audio waveform.
  - Interactive scrub slider (seek bar).
  - Variable playback speed (0.75x, 1.0x, 1.25x, 1.5x, 2.0x).
  - Quick skip (-10s / +10s) and volume controls.
- **Bi-Directional Player ↔ Transcript Synchronization**:
  - **Player → Transcript**: As playback time advances, the active speaker segment highlights dynamically and smoothly auto-scrolls into focus.
  - **Transcript → Player**: Clicking any speaker timestamp or dialog line instantly seeks the media player to that precise second.
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
- Filter by All, Pending, or Completed tasks.
- Inline status toggling and quick navigation to the origin meeting.

### 4. Global Search (`/search`)
- Unified multi-entity search querying across meeting titles, attendee rosters, spoken dialogue, topic tags, and action items.

### 5. UI/UX Polish & Modern SaaS Styling
- Professional slate / purple / indigo design inspired by Fireflies.ai.
- Responsive layout supporting desktop, tablet, and mobile with a collapsible slide-over sidebar.
- Dark Mode / Light Mode with localStorage persistence.
- Toast notifications for every mutation (create, edit, delete, complete).

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy 2.0 (ORM), Pydantic v2 |
| **Database** | SQLite (relational schema with cascading deletes) |
| **Testing** | Pytest, FastAPI TestClient (HTTPX) |

---

## 🏛 Architecture & Folder Structure

```
SP Project 1/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx            # Global HTML layout with Theme & Toast providers
│   │   ├── page.tsx              # Meeting Library Dashboard & KPI cards
│   │   ├── globals.css           # Tailwind CSS imports & theme definitions
│   │   ├── action-items/         # Consolidated Action Items Workspace
│   │   │   └── page.tsx
│   │   ├── meetings/             # Meetings routing
│   │   │   ├── page.tsx          # Dashboard alias
│   │   │   └── [id]/             # Meeting Detail Workspace
│   │   │       └── page.tsx      # Player, synchronized transcript, AI summary
│   │   ├── search/               # Global multi-entity search page
│   │   │   └── page.tsx
│   │   └── settings/             # Workspace settings & theme toggle
│   │       └── page.tsx
│   ├── components/               # Modular UI components
│   │   ├── Sidebar.tsx           # Collapsible SaaS navigation
│   │   ├── Header.tsx            # Sticky header with quick actions & search
│   │   ├── MeetingCard.tsx       # Meeting tile with badges & menu
│   │   ├── MeetingSearch.tsx     # Debounced search input
│   │   ├── MeetingFilters.tsx    # Date filters & sort selectors
│   │   ├── MeetingPlayer.tsx     # Controlled audio player with waveform & speed
│   │   ├── Transcript.tsx        # Scrollable transcript container with auto-scroll
│   │   ├── TranscriptSegment.tsx # Clickable segment with highlight markers
│   │   ├── TranscriptSearch.tsx  # In-transcript search toolbar
│   │   ├── SummaryPanel.tsx      # AI Overview & Takeaways card
│   │   ├── ActionItems.tsx       # Meeting action items manager
│   │   ├── ActionItemModal.tsx   # Modal for adding/editing tasks
│   │   ├── CreateMeetingModal.tsx# Modal with raw transcript parser
│   │   ├── EditMeetingModal.tsx  # Modal for editing meeting metadata
│   │   └── DeleteMeetingModal.tsx# Confirmation modal for cascading deletion
│   ├── context/
│   │   ├── ToastContext.tsx      # Global toast notifications
│   │   └── ThemeContext.tsx      # Dark / Light theme switch
│   ├── lib/
│   │   ├── api.ts                # Centralized backend HTTP client
│   │   └── utils.ts              # Duration, timestamp, and avatar helpers
│   ├── types/
│   │   └── index.ts              # Strict TypeScript definitions
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI application, CORS, lifespan startup
│   │   ├── database.py           # SQLAlchemy engine & SessionLocal dependency
│   │   ├── seed.py               # Seed script with 6+ rich meetings
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
│   │   │   ├── transcript.py
│   │   │   ├── summary.py
│   │   │   ├── topic.py
│   │   │   └── action_item.py
│   │   ├── services/             # Business logic layer
│   │   │   ├── meeting_service.py
│   │   │   ├── transcript_service.py # Multi-format transcript parser
│   │   │   ├── summary_service.py
│   │   │   └── action_item_service.py
│   │   └── routers/              # FastAPI REST routers
│   │       ├── meetings.py
│   │       ├── transcript.py
│   │       ├── summary.py
│   │       ├── action_items.py
│   │       └── search.py
│   ├── tests/                    # Pytest test suite
│   │   ├── conftest.py           # In-memory SQLite test fixtures
│   │   ├── test_meetings.py      # Meetings & CRUD tests
│   │   └── test_action_items.py  # Action items & global search tests
│   └── requirements.txt
│
├── README.md
└── .gitignore
```

---

## 🗄 Relational Database Schema

All tables enforce foreign keys with `ON DELETE CASCADE`:

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
1. **`meetings`**: Core meeting entity storing meeting title, scheduled date, duration in seconds, optional audio URL, and timestamps.
2. **`participants`**: Meeting attendees associated with `meetings.id`.
3. **`transcript_segments`**: Granular spoken dialogue items with `speaker`, `start_time` (seconds), `end_time` (seconds), and spoken `text`.
4. **`summaries`**: Executive summary for the meeting with `overview` and serialized `key_takeaways`.
5. **`topics`**: Categorical tags and subject keywords identified during the discussion.
6. **`action_items`**: Deliverables with `task`, `assignee`, optional `due_date`, and `completed` status flag.

---

## 🔌 API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/meetings` | List meetings with `?search=...`, `?filter=all\|today\|week\|older`, and `?sort=newest\|oldest\|longest\|shortest` |
| `GET` | `/api/meetings/{id}` | Full meeting details including participants, transcript, summary, topics, and action items |
| `POST` | `/api/meetings` | Create meeting (supports raw transcript parsing formatted as `Speaker\|MM:SS\|Text`) |
| `PUT` | `/api/meetings/{id}` | Update title, date, duration, or participants without touching transcript audio |
| `DELETE` | `/api/meetings/{id}` | Permanently delete meeting with cascading removal of all related entities |
| `GET` | `/api/meetings/{id}/transcript` | Fetch ordered transcript segments |
| `POST` | `/api/meetings/{id}/transcript/parse` | Parse raw text string into timestamped segments |
| `GET` | `/api/meetings/{id}/summary` | Retrieve meeting summary |
| `PUT` | `/api/meetings/{id}/summary` | Update overview and key takeaways |
| `GET` | `/api/action-items` | Get all action items across all meetings |
| `GET` | `/api/meetings/{id}/action-items` | Get action items for a specific meeting |
| `POST` | `/api/meetings/{id}/action-items` | Add a new action item |
| `PUT` | `/api/action-items/{id}` | Update action item (mark complete, change task, reassign) |
| `DELETE` | `/api/action-items/{id}` | Remove action item |
| `GET` | `/api/search?q={query}` | Global search across meetings, dialogue, action items, and topics |
| `GET` | `/health` | API health check |

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
   *(Note: The server also auto-seeds the SQLite database on initial startup if empty!)*

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - API Docs will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)
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

The test suite covers:
- Root endpoint verification
- Meetings retrieval with participants and segment counts
- Search by meeting title and search by participant name
- Duration and date sorting
- Meeting detail extraction
- Raw transcript parsing and automatic timestamp calculations
- Metadata updates preserving transcript records
- Cascading deletion across foreign key relationships
- Action item CRUD lifecycle (creation, toggle completed, deletion)
- Global search queries

---

## 🚢 Deployment Considerations

### Frontend → Vercel
1. Set the Root Directory to `frontend`.
2. Configure Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com
   ```
3. Deploy directly via GitHub.

### Backend → Render / Railway
1. Set Build Command: `pip install -r requirements.txt`
2. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Configure Environment Variables:
   ```
   ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
   ```
4. For production persistence with multiple replica instances, set `DATABASE_URL=postgresql://user:pass@host:5432/dbname` (SQLAlchemy seamlessly switches from SQLite to PostgreSQL with zero code changes).

---

## 💡 Engineering Assumptions & Design Choices

1. **Mocked Authentication**: User session is assumed active (`Akash K. - Lead Engineer`) to prioritize meeting workspace functionality over login screens.
2. **Deterministic Audio Clock**: To provide an instant, reliable experience without requiring gigabytes of media file downloads, the player uses a high-precision internal playback clock that smoothly coordinates audio time with transcript segments.
3. **Flexible Transcript Parser**: The transcript ingestion engine supports flexible formats:
   - Pipe format: `Speaker|00:15|Meeting note text here`
   - Bracket format: `[00:15] Speaker: Meeting note text here`
   - Colon format: `Speaker (00:15): Meeting note text here`
4. **Relational Integrity**: Foreign keys with `cascade="all, delete-orphan"` ensure that when a meeting is deleted, all orphan segments, summaries, and action items are purged automatically.
