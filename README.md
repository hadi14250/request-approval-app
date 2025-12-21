### Pending tasks:
- Seeding scripts to seed sample requests
- add approved by in single request page, right now user can't see who approved or rejected

# Request & Approval Workflow System

A simple request approval workflow application built with React and Node.js, where users can submit requests and approvers can review them.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)

---

## Overview

This is a workflow management system with two user roles:
- **Requesters**: Can create, edit, submit, and view their own requests
- **Approvers**: Can view submitted requests and approve or reject them

Requests follow a lifecycle: **Draft** → **Submitted** → **Approved/Rejected**

---

## Features

### For Requesters
- Create new requests with title, description, and type
- Save requests as drafts
- Edit or delete draft requests
- Submit requests for approval
- View all their requests with status
- See approver comments on approved/rejected requests

### For Approvers
- View all requests submitted by Requesters
- Approve requests with optional comments
- Reject requests with optional comments
- See who created each request

### Business Rules Enforced
- Only Draft requests can be edited or deleted
- Once submitted, requests are locked from editing
- Only users with Approver role can approve/reject
- Rejected requests cannot be re-submitted
- All status transitions are validated server-side

---

## Tech Stack

### Frontend
- **React 19.2** - UI library
- **React Router DOM 7.11** - Client-side routing
- **Vite 7.2** - Build tool and dev server
- **CSS** - Styling (no framework, custom styles)

### Backend
- **Node.js** - Runtime environment
- **Express 5.2** - Web framework
- **better-sqlite3 12.5** - Database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Testing
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library

---

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd request-approval-app
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file (optional - you can copy from .env.example)
cp .env.example .env

# Start the server (database will be created automatically on first run)
npm start
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
# Navigate to frontend folder (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Running Tests

```bash
# In the backend folder
npm test
```

### 5. Access the Application

Open your browser and navigate to `http://localhost:5173`

**Default Users:**
- Hadi (Requester only)
- Haneen (Approver only)
- Lama (Both Requester and Approver)

Use the dropdown in the top-right corner to switch between users.

---

## Project Structure

```
request-approval-workflow/
├── backend/
│   ├── server.js                    # Express server entry point
│   ├── app.js                       # Express app setup and routes
│   ├── db.js                        # Database setup and initialization
│   ├── tests/
│   │   └── requests.test.js         # API tests
│   ├── .env.example                 # Environment variables example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UserSelector.jsx     # User switcher dropdown
│   │   │   └── RequestForm.jsx      # Create/edit request form
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Requests.jsx         # User's requests list
│   │   │   ├── Pending.jsx          # Pending approvals (for approvers)
│   │   │   └── RequestDetails.jsx   # Single request view
│   │   ├── context/
│   │   │   └── UserContext.jsx      # Global user state management
│   │   ├── hooks/
│   │   │   └── useMakeRequest.jsx   # Custom hook for API calls
│   │   ├── App.jsx                  # Main app with routing
│   │   ├── App.css                  # Component styles
│   │   ├── index.css                # Global styles
│   │   └── main.jsx                 # Entry point
│   ├── .env.example                 # Environment variables example
│   └── package.json
│
└── README.md
```

---