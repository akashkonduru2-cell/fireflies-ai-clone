import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.transcript import TranscriptSegment
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.action_item import ActionItem

NOW = datetime.utcnow()

SAMPLE_MEETINGS = [
    {
        "title": "Product Planning Meeting — Q4 Roadmap & AI Features",
        "meeting_date": NOW - timedelta(hours=3),
        "duration": 1800,  # 30 mins
        "participants": [
            {"name": "Sarah Chen", "email": "sarah.chen@techcorp.io"},
            {"name": "Alex Rivera", "email": "alex.rivera@techcorp.io"},
            {"name": "David Kim", "email": "david.kim@techcorp.io"},
            {"name": "Elena Rostova", "email": "elena.rostova@techcorp.io"}
        ],
        "topics": ["Q4 Roadmap", "AI Transcription", "Mobile Onboarding", "Beta Launch"],
        "summary": {
            "overview": "The team reviewed priorities for the upcoming Q4 product cycle, with a central focus on integrating automated AI meeting transcription and optimizing the mobile onboarding conversion funnel. David presented mobile drop-off analytics, while Alex demonstrated the latency improvements in the speech-to-text pipeline. Consensus was reached to ship the private beta by mid-November.",
            "key_takeaways": [
                "Prioritize the mobile onboarding redesign to reduce initial setup drop-off by 25%.",
                "Integrate real-time audio streaming into the transcription pipeline for sub-second latency.",
                "Target November 15 for closed beta release to 250 enterprise design partners.",
                "Elena to coordinate security compliance audits for customer meeting data retention."
            ]
        },
        "action_items": [
            {
                "task": "Draft finalized Q4 roadmap specification and circulate to engineering leads",
                "assignee": "Sarah Chen",
                "due_date": "Oct 12, 2026",
                "completed": False
            },
            {
                "task": "Benchmark WebSocket latency vs HTTP chunked transfer for live transcripts",
                "assignee": "Alex Rivera",
                "due_date": "Oct 14, 2026",
                "completed": True
            },
            {
                "task": "Create Figma prototypes for new mobile 3-step onboarding flow",
                "assignee": "David Kim",
                "due_date": "Oct 16, 2026",
                "completed": False
            },
            {
                "task": "Review SOC2 compliance checklists for encrypted transcript storage",
                "assignee": "Elena Rostova",
                "due_date": "Oct 18, 2026",
                "completed": False
            }
        ],
        "transcript": [
            {"speaker": "Sarah Chen", "start_time": 0.0, "end_time": 12.0, "text": "Good morning everyone. Thanks for jumping on. Today we need to lock down our Q4 product roadmap, specifically our AI transcription rollout and mobile onboarding."},
            {"speaker": "Alex Rivera", "start_time": 13.0, "end_time": 24.5, "text": "Morning Sarah. On the backend, we finished stress-testing the speech recognition pipeline. We managed to bring median transcription latency down to 420 milliseconds."},
            {"speaker": "David Kim", "start_time": 25.5, "end_time": 38.0, "text": "That's huge for user perception. On mobile, our analytics from the last two weeks showed a 32% drop-off during the permission grant step for calendar access."},
            {"speaker": "Elena Rostova", "start_time": 39.0, "end_time": 52.0, "text": "Before we roll out deeper calendar integrations, enterprise clients are asking whether audio snippets are stored in temporary caches or persisted in encrypted S3 buckets."},
            {"speaker": "Sarah Chen", "start_time": 53.0, "end_time": 68.0, "text": "Great point Elena. Security is non-negotiable for enterprise deals. Let's make sure our data retention policy explicitly states zero permanent audio retention unless opted in."},
            {"speaker": "Alex Rivera", "start_time": 69.0, "end_time": 82.0, "text": "Agreed. We can support customer-managed encryption keys for transcript storage. That will satisfy the compliance team at Fortune 500 prospects."},
            {"speaker": "David Kim", "start_time": 83.5, "end_time": 98.0, "text": "I will redesign the mobile onboarding flow into a 3-step progressive disclosure so users understand the value before we request microphone and calendar permissions."},
            {"speaker": "Sarah Chen", "start_time": 99.0, "end_time": 112.5, "text": "Love that approach. What timeline are we thinking for the private beta release to our first batch of design partners?"},
            {"speaker": "Alex Rivera", "start_time": 113.5, "end_time": 126.0, "text": "If David has the mockups by Friday and we freeze backend API contracts by next Tuesday, mid-November is very realistic."},
            {"speaker": "Elena Rostova", "start_time": 127.0, "end_time": 140.0, "text": "I will get the legal agreements and pilot SLAs drafted so customers can sign electronically without delaying their onboarding."},
            {"speaker": "Sarah Chen", "start_time": 141.0, "end_time": 155.0, "text": "Awesome. Let's recap: Alex finalizes API benchmarks, David shares mobile mockups, Elena preps agreements, and I will publish the master roadmap."}
        ]
    },
    {
        "title": "Weekly Engineering Sync — Database Scalability & API V2",
        "meeting_date": NOW - timedelta(days=1, hours=2),
        "duration": 2700,  # 45 mins
        "participants": [
            {"name": "Marcus Vance", "email": "marcus.v@techcorp.io"},
            {"name": "Priya Patel", "email": "priya.p@techcorp.io"},
            {"name": "Liam Connor", "email": "liam.c@techcorp.io"}
        ],
        "topics": ["Postgres Migration", "API V2 Rate Limits", "Redis Caching", "Read Replicas"],
        "summary": {
            "overview": "The engineering team evaluated database performance under peak concurrency loads and established the migration blueprint for read replica provisioning. Priya shared query profiler metrics highlighting bottlenecks in transcript full-text search, while Liam presented the new token-bucket rate limiter architecture for public API endpoints.",
            "key_takeaways": [
                "Implement database read-replicas for read-heavy transcript search queries.",
                "Introduce Redis caching layer for meeting metadata and participant rosters.",
                "Deploy token-bucket rate limiting (120 req/min) across public REST endpoints.",
                "Run dry-run migration scripts on the staging cluster this Thursday."
            ]
        },
        "action_items": [
            {
                "task": "Configure read replica connection pool in SQLAlchemy engine config",
                "assignee": "Marcus Vance",
                "due_date": "Oct 11, 2026",
                "completed": False
            },
            {
                "task": "Index transcript search queries with GIN/trigram search vectors",
                "assignee": "Priya Patel",
                "due_date": "Oct 13, 2026",
                "completed": True
            },
            {
                "task": "Implement Redis-backed sliding window rate limiter middleware",
                "assignee": "Liam Connor",
                "due_date": "Oct 15, 2026",
                "completed": False
            }
        ],
        "transcript": [
            {"speaker": "Marcus Vance", "start_time": 0.0, "end_time": 14.0, "text": "Welcome team. Let's look at last week's traffic spikes. During Tuesday morning standup peaks, P95 database query times climbed to 850 milliseconds."},
            {"speaker": "Priya Patel", "start_time": 15.0, "end_time": 28.5, "text": "I analyzed the slow query log. 70% of those spikes were unindexed full-text searches across meeting transcript segments when multiple users searched simultaneously."},
            {"speaker": "Liam Connor", "start_time": 29.5, "end_time": 44.0, "text": "We also had third-party integration webhooks hitting our API without adequate backpressure, which starved the connection pool of worker threads."},
            {"speaker": "Marcus Vance", "start_time": 45.0, "end_time": 58.0, "text": "That confirms we need two immediate fixes: a read replica dedicated to search queries and a strict rate limiter on API ingress points."},
            {"speaker": "Priya Patel", "start_time": 59.0, "end_time": 73.0, "text": "For the queries, adding composite indexes on meeting_id and start_time, plus trigram indexing on segment text, will bring lookup times under 25 milliseconds."},
            {"speaker": "Liam Connor", "start_time": 74.0, "end_time": 89.0, "text": "On rate limiting, I've got a token-bucket implementation ready using Redis. We can set sensible defaults like 120 requests per minute per authenticated API key."},
            {"speaker": "Marcus Vance", "start_time": 90.0, "end_time": 105.0, "text": "Sounds solid. How long will the read replica setup take to spin up in our infrastructure as code repo?"},
            {"speaker": "Liam Connor", "start_time": 106.0, "end_time": 118.0, "text": "Terraform modules are already defined. I just need to update the instance count and apply the plan to staging for verification."},
            {"speaker": "Priya Patel", "start_time": 119.0, "end_time": 132.0, "text": "I will run our simulated load test script against staging once Liam deploys the replica to make sure failover works cleanly."},
            {"speaker": "Marcus Vance", "start_time": 133.0, "end_time": 148.0, "text": "Great. Let's aim to have staging validation wrapped up by Thursday afternoon so we can schedule the production maintenance window for Saturday."}
        ]
    },
    {
        "title": "Marketing Strategy Review — Growth Funnel & Paid Ads",
        "meeting_date": NOW - timedelta(days=2, hours=5),
        "duration": 2100,  # 35 mins
        "participants": [
            {"name": "Jessica Taylor", "email": "jessica.t@techcorp.io"},
            {"name": "Carlos Gomez", "email": "carlos.g@techcorp.io"},
            {"name": "Maya Lin", "email": "maya.l@techcorp.io"}
        ],
        "topics": ["Paid Acquisition", "SEO Content", "Conversion Rate", "CAC Reduction"],
        "summary": {
            "overview": "The growth and marketing team reviewed customer acquisition channels and paid campaign ROAS. Organic SEO traffic expanded 45% month-over-month following the publication of comparison guides. The team agreed to reallocate budget away from underperforming LinkedIn sponsored posts toward Google Search intent campaigns.",
            "key_takeaways": [
                "Reallocate 35% of LinkedIn paid budget into high-intent Google Search keywords.",
                "Publish 4 new competitor comparison teardowns targeting 'meeting notes' search volume.",
                "Revamp the landing page hero value proposition to highlight zero-configuration setup.",
                "Launch referral incentive program offering extended AI transcript credits."
            ]
        },
        "action_items": [
            {
                "task": "Adjust Google Ads budget allocation and set negative keywords for Q4 campaigns",
                "assignee": "Carlos Gomez",
                "due_date": "Oct 10, 2026",
                "completed": True
            },
            {
                "task": "Complete SEO draft for 'Best AI Meeting Assistant for Remote Engineering Teams'",
                "assignee": "Maya Lin",
                "due_date": "Oct 14, 2026",
                "completed": False
            },
            {
                "task": "A/B test hero headline on primary landing page using Split.io",
                "assignee": "Jessica Taylor",
                "due_date": "Oct 16, 2026",
                "completed": False
            }
        ],
        "transcript": [
            {"speaker": "Jessica Taylor", "start_time": 0.0, "end_time": 13.0, "text": "Hi team. Let's dive into our monthly acquisition metrics. Our organic inbound signups are up 45%, but paid CAC has risen slightly over the past three weeks."},
            {"speaker": "Carlos Gomez", "start_time": 14.0, "end_time": 27.5, "text": "The main culprit for the CAC spike was LinkedIn sponsored content. Cost-per-click was averaging $9.40 with only a 1.8% conversion rate to free trial."},
            {"speaker": "Maya Lin", "start_time": 28.5, "end_time": 42.0, "text": "Meanwhile, our blog comparison posts like 'How automated notes save 5 hours per week' brought in over 3,000 organic visits with a 6.2% signup rate."},
            {"speaker": "Jessica Taylor", "start_time": 43.0, "end_time": 56.0, "text": "That is an unmistakable signal. Users searching with intent convert three times better than users scrolling passive feeds."},
            {"speaker": "Carlos Gomez", "start_time": 57.0, "end_time": 71.0, "text": "I suggest shifting $12,000 from LinkedIn over to Google Search for high-intent queries like 'meeting transcription software' and 'automated meeting summaries'."},
            {"speaker": "Maya Lin", "start_time": 72.0, "end_time": 86.5, "text": "I have four additional content pieces ready to publish this month targeting specific industry verticals, such as legal consultancies and dev agencies."},
            {"speaker": "Jessica Taylor", "start_time": 87.5, "end_time": 101.0, "text": "Terrific. Also, on the homepage hero, let's test a more direct tagline: 'Instant meeting notes, zero awkward bots in your calls.'"},
            {"speaker": "Carlos Gomez", "start_time": 102.0, "end_time": 115.0, "text": "That highlights our biggest technical differentiator. Customers hate when bots disrupt call dynamics or require host permission."},
            {"speaker": "Maya Lin", "start_time": 116.0, "end_time": 129.0, "text": "I will coordinate with the design team to make sure the supporting illustrations match the new copy tone before we go live."},
            {"speaker": "Jessica Taylor", "start_time": 130.0, "end_time": 144.0, "text": "Perfect. Let's make the budget swap immediately and review early Google Search metrics at next Monday's standup."}
        ]
    },
    {
        "title": "Client Discovery Call — Meridian Healthcare Systems",
        "meeting_date": NOW - timedelta(days=3, hours=4),
        "duration": 3600,  # 60 mins
        "participants": [
            {"name": "Sarah Chen", "email": "sarah.chen@techcorp.io"},
            {"name": "Dr. Robert Sterling", "email": "rsterling@meridianhealth.org"},
            {"name": "Ananya Sharma", "email": "asharma@meridianhealth.org"}
        ],
        "topics": ["HIPAA Compliance", "EHR Integration", "Clinical Notes", "Data Residency"],
        "summary": {
            "overview": "Discovery consultation with Meridian Healthcare to assess enterprise requirements for clinical and administrative meeting documentation. The client emphasized strict HIPAA compliance standards, role-based access control, and integration compatibility with Epic and Cerner EHR architectures.",
            "key_takeaways": [
                "Execute Business Associate Agreement (BAA) with Meridian Healthcare legal team.",
                "Verify audit logging for any staff accessing transcription records or summary outputs.",
                "Schedule a technical sandbox session demonstrating webhook delivery to Epic HL7 endpoints.",
                "Prepare enterprise pilot proposal for 50 initial clinical administrators."
            ]
        },
        "action_items": [
            {
                "task": "Transmit standard enterprise BAA agreement to Meridian legal counsel",
                "assignee": "Sarah Chen",
                "due_date": "Oct 12, 2026",
                "completed": False
            },
            {
                "task": "Prepare technical documentation for EHR HL7 / FHIR data export capabilities",
                "assignee": "Alex Rivera",
                "due_date": "Oct 17, 2026",
                "completed": False
            },
            {
                "task": "Draft pilot pricing proposal for 50 administrative seats",
                "assignee": "Sarah Chen",
                "due_date": "Oct 19, 2026",
                "completed": False
            }
        ],
        "transcript": [
            {"speaker": "Sarah Chen", "start_time": 0.0, "end_time": 15.0, "text": "Good afternoon Dr. Sterling and Ananya. Thank you for your time. Today our goal is to understand Meridian's internal communication workflows and compliance requirements."},
            {"speaker": "Dr. Robert Sterling", "start_time": 16.0, "end_time": 30.5, "text": "Thanks Sarah. Our department heads spend between 8 to 12 hours every week in administrative and clinical board reviews, manually writing minutes and follow-up delegations."},
            {"speaker": "Ananya Sharma", "start_time": 31.5, "end_time": 46.0, "text": "Our primary hurdle is security. Any platform capturing spoken dialog must be fully HIPAA compliant, with zero training on client data and encrypted rest storage."},
            {"speaker": "Sarah Chen", "start_time": 47.0, "end_time": 62.0, "text": "Understood completely. We sign standard BAAs with all healthcare accounts. We do not use customer meeting audio or transcripts to train public models, and data is encrypted with AES-256."},
            {"speaker": "Dr. Robert Sterling", "start_time": 63.0, "end_time": 76.5, "text": "That is reassuring. What about action items? Can action items extracted from clinical committees be exported directly into our task management system?"},
            {"speaker": "Sarah Chen", "start_time": 77.5, "end_time": 91.0, "text": "Yes, we support native webhooks and REST endpoints. You can map action items to Jira, Asana, or internal tools via Zapier and custom webhooks."},
            {"speaker": "Ananya Sharma", "start_time": 92.0, "end_time": 106.0, "text": "In phase two, we would also be interested in exporting clinical note summaries into our FHIR-compatible EHR repository."},
            {"speaker": "Sarah Chen", "start_time": 107.0, "end_time": 121.5, "text": "We have an open API schema designed precisely for structured JSON extraction. We can review that in a sandbox demo with your engineering lead."},
            {"speaker": "Dr. Robert Sterling", "start_time": 122.5, "end_time": 136.0, "text": "That sounds very promising. If you can provide the BAA draft and a pilot scope for 50 users, we can review it with the steering committee next Monday."},
            {"speaker": "Sarah Chen", "start_time": 137.0, "end_time": 150.0, "text": "I will prepare the proposal and BAA this afternoon. Thank you both for your time and thoughtful questions."}
        ]
    },
    {
        "title": "Sprint Retrospective — Sprint 42 Velocity & Lessons",
        "meeting_date": NOW - timedelta(days=5, hours=1),
        "duration": 2400,  # 40 mins
        "participants": [
            {"name": "Liam Connor", "email": "liam.c@techcorp.io"},
            {"name": "Priya Patel", "email": "priya.p@techcorp.io"},
            {"name": "Marcus Vance", "email": "marcus.v@techcorp.io"},
            {"name": "Sarah Chen", "email": "sarah.chen@techcorp.io"}
        ],
        "topics": ["Sprint Velocity", "CI/CD Pipeline", "Test Flakiness", "Standup Efficiency"],
        "summary": {
            "overview": "The engineering squad reflected on Sprint 42 deliverables, celebrating the completion of the real-time audio waveform visualizer while diagnosing workflow slowdowns caused by flaky end-to-end browser tests in the GitHub Actions CI pipeline.",
            "key_takeaways": [
                "Sprint velocity was 88 story points against a 92 point target (95.6% completion rate).",
                "Quarantine 4 flaky Cypress integration tests causing false-positive CI build failures.",
                "Cap daily morning standup duration at 12 minutes to protect deep focus blocks.",
                "Introduce automated PR preview environments using ephemeral Docker containers."
            ]
        },
        "action_items": [
            {
                "task": "Investigate and rewrite flaky Cypress test fixtures for auth redirection",
                "assignee": "Liam Connor",
                "due_date": "Oct 11, 2026",
                "completed": True
            },
            {
                "task": "Set up GitHub Actions matrix cache to speed up Next.js build times",
                "assignee": "Priya Patel",
                "due_date": "Oct 13, 2026",
                "completed": False
            },
            {
                "task": "Update team sprint board templates with explicit acceptance criteria checklists",
                "assignee": "Marcus Vance",
                "due_date": "Oct 15, 2026",
                "completed": False
            }
        ],
        "transcript": [
            {"speaker": "Liam Connor", "start_time": 0.0, "end_time": 12.0, "text": "Alright team, welcome to the Sprint 42 retrospective. Let's start with what went well before we analyze bottlenecks."},
            {"speaker": "Priya Patel", "start_time": 13.0, "end_time": 25.5, "text": "Shipping the synchronized audio player and transcript click-to-seek functionality ahead of schedule was huge. QA gave it a big thumbs up."},
            {"speaker": "Sarah Chen", "start_time": 26.5, "end_time": 39.0, "text": "Customer feedback on the prototype preview was phenomenal. The smooth auto-scroll when the audio plays is exactly what people expect."},
            {"speaker": "Marcus Vance", "start_time": 40.0, "end_time": 54.0, "text": "On the frustrating side, our pull request build times in GitHub Actions averaged 28 minutes this sprint because of flaky end-to-end tests."},
            {"speaker": "Liam Connor", "start_time": 55.0, "end_time": 69.0, "text": "Yeah, two specific tests waiting on network timeouts failed intermittently, forcing developers to re-run entire workflow matrices."},
            {"speaker": "Priya Patel", "start_time": 70.0, "end_time": 84.0, "text": "We should quarantine those two tests into a nightly non-blocking suite until we refactor them with deterministic mock servers."},
            {"speaker": "Marcus Vance", "start_time": 85.0, "end_time": 98.0, "text": "Agreed. Also, how do people feel about our morning standups? A couple days they ran over 25 minutes discussing deep architectural nuances."},
            {"speaker": "Sarah Chen", "start_time": 99.0, "end_time": 112.0, "text": "Let's enforce a strict 12-minute cap. If two engineers need to debate an implementation detail, take it to a post-standup huddle."},
            {"speaker": "Liam Connor", "start_time": 113.0, "end_time": 125.0, "text": "That will definitely protect morning focus time. I will handle quarantining the tests right after this session."},
            {"speaker": "Marcus Vance", "start_time": 126.0, "end_time": 139.0, "text": "Awesome. Sprint 43 planning starts tomorrow at 10 AM. Thanks everyone for the candid feedback."}
        ]
    },
    {
        "title": "Hiring Discussion — Senior Fullstack & AI Engineers",
        "meeting_date": NOW - timedelta(days=6, hours=3),
        "duration": 3000,  # 50 mins
        "participants": [
            {"name": "Sarah Chen", "email": "sarah.chen@techcorp.io"},
            {"name": "Marcus Vance", "email": "marcus.v@techcorp.io"},
            {"name": "Rachel Zane", "email": "rachel.zane@talentpartners.co"}
        ],
        "topics": ["Technical Interviews", "Candidate Pipeline", "Compensation Bands", "Take-home Assignment"],
        "summary": {
            "overview": "Evaluation of current engineering recruiting pipeline and interview stages for Senior Fullstack and Machine Learning roles. The hiring committee calibrated evaluation rubrics, decided to replace generic algorithmic questions with realistic take-home coding challenges, and approved revised compensation bands.",
            "key_takeaways": [
                "Replace LeetCode-style puzzle interviews with a realistic 2-hour fullstack take-home challenge.",
                "Calibrate scoring rubric focusing on modular code architecture and UX attention to detail.",
                "Advance 3 strong candidates for the Staff Backend position to executive interviews.",
                "Review remote candidate timezone overlap expectations (minimum 4 hours core overlap)."
            ]
        },
        "action_items": [
            {
                "task": "Design realistic take-home repository with starter Next.js and FastAPI scaffolding",
                "assignee": "Marcus Vance",
                "due_date": "Oct 11, 2026",
                "completed": True
            },
            {
                "task": "Schedule final round interviews for backend candidate finalists",
                "assignee": "Rachel Zane",
                "due_date": "Oct 12, 2026",
                "completed": False
            },
            {
                "task": "Publish updated job descriptions reflecting modern tech stack requirements",
                "assignee": "Sarah Chen",
                "due_date": "Oct 14, 2026",
                "completed": False
            }
        ],
        "transcript": [
            {"speaker": "Rachel Zane", "start_time": 0.0, "end_time": 14.0, "text": "Thanks for joining Sarah and Marcus. We have 14 active candidates in the pipeline for the Senior Fullstack and Backend roles."},
            {"speaker": "Marcus Vance", "start_time": 15.0, "end_time": 29.0, "text": "Looking at candidate feedback from round two, several senior engineers mentioned our live coding puzzle felt disconnected from actual daily product engineering."},
            {"speaker": "Sarah Chen", "start_time": 30.0, "end_time": 45.0, "text": "I completely agree with them. Inverting a binary tree doesn't prove someone can build a synchronized audio transcript interface or write clean SQLAlchemy models."},
            {"speaker": "Rachel Zane", "start_time": 46.0, "end_time": 59.5, "text": "Top candidates love realistic practical challenges. What if we provide a starter project and ask them to build an interactive feature with proper API separation?"},
            {"speaker": "Marcus Vance", "start_time": 60.5, "end_time": 74.0, "text": "That's infinitely better. We can evaluate code readability, schema design, error handling, and component modularity instead of obscure trivia."},
            {"speaker": "Sarah Chen", "start_time": 75.0, "end_time": 89.0, "text": "Let's also pay candidates a stipend for their time if the take-home takes more than two hours. It signals respect for their effort."},
            {"speaker": "Rachel Zane", "start_time": 90.0, "end_time": 103.5, "text": "Candidates will love that. On compensation, our revised equity and base salary bands for Senior Fullstack are fully competitive with Series B market rates."},
            {"speaker": "Marcus Vance", "start_time": 104.5, "end_time": 118.0, "text": "I will put together the sample repo and grading rubric this afternoon so we can roll it out to our upcoming cohort next week."},
            {"speaker": "Sarah Chen", "start_time": 119.0, "end_time": 132.0, "text": "Great. Rachel, please let the three finalists know we are excited to move them to the final leadership conversation."}
        ]
    },
    {
        "title": "Project Kickoff — Real-Time Collaborative Workspace",
        "meeting_date": NOW - timedelta(days=8, hours=4),
        "duration": 3300,  # 55 mins
        "participants": [
            {"name": "Sarah Chen", "email": "sarah.chen@techcorp.io"},
            {"name": "Alex Rivera", "email": "alex.rivera@techcorp.io"},
            {"name": "David Kim", "email": "david.kim@techcorp.io"},
            {"name": "Priya Patel", "email": "priya.p@techcorp.io"}
        ],
        "topics": ["Collaborative Editing", "WebSockets", "CRDT Architecture", "Milestones"],
        "summary": {
            "overview": "Official kickoff session for the multi-user collaborative workspace initiative. The team established core technical architecture principles, evaluating Conflict-Free Replicated Data Types (CRDTs) versus Operational Transformation (OT) for simultaneous note editing, and established key milestone delivery deadlines.",
            "key_takeaways": [
                "Select Yjs CRDT protocol for client-side document convergence and presence indicators.",
                "Build state persistence engine with snapshotting every 30 seconds to SQLite/Postgres.",
                "Deliver internal working prototype for dogfooding by end of Sprint 44.",
                "Ensure live cursor presence displays each teammate's active cursor color and name tag."
            ]
        },
        "action_items": [
            {
                "task": "Prototype Yjs WebSocket provider with FastAPI WebSocket endpoint",
                "assignee": "Alex Rivera",
                "due_date": "Oct 18, 2026",
                "completed": False
            },
            {
                "task": "Design multi-cursor avatar presence UI components in Tailwind CSS",
                "assignee": "David Kim",
                "due_date": "Oct 20, 2026",
                "completed": False
            },
            {
                "task": "Draft stress test plan for 100 concurrent typists on a single meeting document",
                "assignee": "Priya Patel",
                "due_date": "Oct 22, 2026",
                "completed": False
            }
        ],
        "transcript": [
            {"speaker": "Sarah Chen", "start_time": 0.0, "end_time": 13.5, "text": "Welcome to the kickoff for our real-time collaborative workspace! Our vision is to let multiple meeting attendees co-edit meeting notes while the audio transcribes live."},
            {"speaker": "Alex Rivera", "start_time": 14.5, "end_time": 28.0, "text": "From an engineering standpoint, handling simultaneous typing without race conditions requires either OT or CRDTs. Yjs is the industry gold standard right now."},
            {"speaker": "David Kim", "start_time": 29.0, "end_time": 42.0, "text": "From a design perspective, users should see real-time cursor tags showing who is highlighting what section of the transcript or typing an action item."},
            {"speaker": "Priya Patel", "start_time": 43.0, "end_time": 56.5, "text": "For data persistence, we can retain Yjs state updates in memory and periodically flush serialized snapshots to the database every 30 seconds."},
            {"speaker": "Sarah Chen", "start_time": 57.5, "end_time": 71.0, "text": "That prevents database thrashing while guaranteeing no notes are lost if a user accidentally closes their tab."},
            {"speaker": "Alex Rivera", "start_time": 72.0, "end_time": 86.0, "text": "I will build a minimal proof-of-concept WebSocket server hooked into our FastAPI backend to test awareness state and document syncing."},
            {"speaker": "David Kim", "start_time": 87.0, "end_time": 101.0, "text": "I will deliver the component library for teammate cursor badges and selection highlights by the middle of next week."},
            {"speaker": "Priya Patel", "start_time": 102.0, "end_time": 115.5, "text": "And I will write the automated concurrency test using simulated browser agents to test for split-brain sync anomalies."},
            {"speaker": "Sarah Chen", "start_time": 116.5, "end_time": 129.0, "text": "Fantastic kickoff. Let's reconvene on Friday for a demo of the initial prototype. Excited for this one!"}
        ]
    }
]


def seed_database(db: Session = None):
    """
    Populates database with realistic meetings, participants,
    transcripts, summaries, topics, and action items.
    """
    should_close = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True

    try:
        # Check if already seeded
        existing_count = db.query(Meeting).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} meetings. Skipping seed.")
            return

        print("Seeding database with realistic meeting data...")
        for m_data in SAMPLE_MEETINGS:
            meeting = Meeting(
                title=m_data["title"],
                meeting_date=m_data["meeting_date"],
                duration=m_data["duration"],
                audio_url=None
            )
            db.add(meeting)
            db.flush()

            # Add participants
            for p in m_data["participants"]:
                db.add(Participant(meeting_id=meeting.id, name=p["name"], email=p.get("email")))

            # Add topics
            for t in m_data["topics"]:
                db.add(Topic(meeting_id=meeting.id, name=t))

            # Add summary
            sum_data = m_data["summary"]
            db.add(
                Summary(
                    meeting_id=meeting.id,
                    overview=sum_data["overview"],
                    key_takeaways=json.dumps(sum_data["key_takeaways"])
                )
            )

            # Add action items
            for act in m_data["action_items"]:
                db.add(
                    ActionItem(
                        meeting_id=meeting.id,
                        task=act["task"],
                        assignee=act["assignee"],
                        due_date=act["due_date"],
                        completed=act["completed"]
                    )
                )

            # Add transcript segments
            for seg in m_data["transcript"]:
                db.add(
                    TranscriptSegment(
                        meeting_id=meeting.id,
                        speaker=seg["speaker"],
                        start_time=seg["start_time"],
                        end_time=seg["end_time"],
                        text=seg["text"]
                    )
                )

        db.commit()
        print(f"Successfully seeded {len(SAMPLE_MEETINGS)} meetings with full details!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    seed_database()
