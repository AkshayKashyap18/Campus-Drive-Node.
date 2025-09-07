# Campus Drive Event Management (Prototype)
## Overview
This is a backend prototype for a Campus Drive Event Management system.
It simulates event creation, student registrations, attendance, feedback collection, and reporting.

Stack: Node.js + Express + Sequelize + SQLite

Focus: Backend APIs only (no frontend required for this assignment)

Deliverables: Code + Design Document + Testing Report + AI Usage Proof

## Features
### Event Management

* Create, list, cancel, and delete events

### Student Registration

* Register students (auto-create if not found, prevent duplicates)

### Attendance Tracking

* Mark students present/absent/late

### Feedback Collection

* Collect ratings and comments (1–5 scale)

### Reports

* Event popularity (# of registrations)

* Attendance percentage

* Average feedback

* Student participation

* Top active students

## Project Structure
```
Campus-Drive-Node/
│
├── src/                     # Backend source code
│   ├── index.js             # Server entry point
│   ├── routes.js            # API routes
│   └── models.js            # Sequelize models
│
├── db.sqlite                # SQLite database file
├── seed.js                  # Seed script (sample data)
├── package.json             # Project dependencies
├── README.md                # Project instructions
│
└── docs/                    # Documentation
    ├── DesignDocument.pdf    # System design (schema, APIs, workflows, assumptions)
    ├── ReportDocument.pdf    # API testing report (cases + screenshots)
    ├── AI-Usage-Proof.png    # AI brainstorming proof
    └── UI-Wireframe.png      # (Optional) UI mockups
```
## Setup Instructions
1. Clone the repo
   ```
   git clone <your-repo-url>
   cd Campus-Drive-Node
2. Install dependencies
   ```
   npm install
3. Run server
   ```
   npm run dev
   Server runs at: http://localhost:5000
4. Seed sample data (optional)
   ```
   node seed.js

## API Endpoints (Summary)
### Event Management

* POST /api/events → Create new event

* GET /api/events → List events (filters: collegeId, state, type)

* DELETE /api/events/:id → Hard delete event

* POST /api/events/:id/cancel → Soft delete (mark as cancelled)

### Student Registration

* POST /api/register → Register student for an event

    * Auto-creates student if not found

    * Prevents duplicate registrations

    * Works only if event is published

### Attendance Tracking

* POST /api/attendance → Update attendance

     * Fields: eventId, studentRoll, collegeId, status (registered/present/absent/late)

### Feedback Collection

* POST /api/feedback → Submit feedback

     * Fields: eventId, studentRoll, collegeId, rating (1–5), comments?

### Reporting APIs

* GET /api/reports/event-popularity → Events by # of registrations

* GET /api/reports/attendance-percent → Attendance % per event

* GET /api/reports/avg-feedback → Avg rating & feedback count

* GET /api/reports/student-participation → Student participation (registered vs attended)

* GET /api/reports/top-active-students → Top N active students

## Documentation
* Design Document → docs/DesignDocument.pdf

* Report Document → docs/ReportDocument.pdf

* AI Usage Proof → docs/AI-Usage-Proof.pdf

* UI Wireframe (optional) → docs/UI-Wireframe.pdf

##.gitignore (if we want and avoid committing large/unnecessary files)
