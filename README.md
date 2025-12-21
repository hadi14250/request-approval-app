### Pending tasks:
- Seeding scripts to seed sample requests
- add seed.js instructions
- add section to explain that users are in code and do not need seeding
- update file structure of read me to include seed.js

# Request & Approval Workflow System

A simple request approval workflow application built with React and Node.js, where users can submit requests and approvers can review them.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [API Backend Endpoints](#api-backend-endpoints)
- [Key Decisions & Tradeoffs](#key-decisions--tradeoffs)
- [Assumptions](#assumptions)
- [Future Improvements](#future-improvements)

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

## API Backend Endpoints

- **POST** `/requests` – Create request (Draft)
- **PATCH** `/requests/:id/edit` – Edit draft request
- **POST** `/requests/:id/submit` – Submit request
- **GET** `/requests` – View own requests
- **GET** `/requests/pending` – View pending approvals
- **POST** `/requests/:id/approve` – Approve request
- **POST** `/requests/:id/reject` – Reject request
- **DELETE** `/requests/:id` – Delete draft request

**Note:** All endpoints validate input and return appropriate HTTP status codes (200, 201, 400, 401, 403, 404).

---

## Key Decisions & Tradeoffs

### 1. SQLite vs PostgreSQL
**Decision:** Used SQLite with better-sqlite3

**Reasoning:**
- **Pros:**
  - Zero configuration - no database server to set up
  - Perfect for development and this assignment scope
  - File-based, portable database
  - Synchronous API is simpler to work with
  - Fast for small to medium datasets

- **Cons:**
  - Not suitable for production with concurrent writes
  - Limited scalability compared to PostgreSQL
  - No built-in user management or advanced features

**Tradeoff:** Chose simplicity and ease of setup over production-ready scalability. For a real application, I would use PostgreSQL with proper connection pooling and migrations.

### 2. Context API vs Redux
**Decision:** Used React Context API for user state

**Reasoning:**
- **Pros:**
  - Built into React, no extra dependencies
  - Simple global state for current user
  - Sufficient for this application's state complexity

- **Cons:**
  - Can cause unnecessary re-renders in larger apps
  - No built-in dev tools like Redux DevTools

**Tradeoff:** The app has minimal global state (just current user), so Context API is appropriate. Redux would be overkill.

### 3. Custom Hook vs Data Fetching Library
**Decision:** Built custom `useMakeRequest` hook instead of using React Query or SWR

**Reasoning:**
- **Pros:**
  - No additional dependencies
  - Full control over fetch logic

- **Cons:**
  - Missing features like caching, automatic refetching, optimistic updates
  - More boilerplate code

**Tradeoff:** For this assignment, showing I understand how to build a custom hook was valuable. In production, I'd use React Query for better UX and less code.

### 4. Simulated Authentication vs Real Auth
**Decision:** User dropdown to simulate authentication

**Reasoning:**
- **Pros:**
  - Fast to implement and test different roles
  - Assignment focused on workflow logic, not auth
  - Easy to switch users during development

- **Cons:**
  - Not production-ready
  - No security

**Tradeoff:** Assignment scope prioritized workflow logic. Real auth would require JWT tokens, password hashing, sessions, etc.

### 5. Synchronous Database Queries vs Async
**Decision:** Used better-sqlite3's synchronous API

**Reasoning:**
- **Pros:**
  - Simpler code, no async/await needed in database layer
  - Better performance for SQLite (no overhead of promises)
  - Easier to reason about

- **Cons:**
  - Blocks the event loop (not ideal for high concurrency)
  - Different from typical Node.js async patterns

**Tradeoff:** SQLite is single-threaded anyway, so synchronous API is actually more efficient here. Would use async with PostgreSQL.

---

## Assumptions

### 1. Request Creation
**Assumption:** When a request is created via POST `/requests`, it is automatically saved as a **Draft** status.

**Reasoning:** This allows users to create a request and decide later whether to submit it. They can edit or delete drafts before submitting.

### 2. Request Creation Permissions
**Assumption:** Only users with the **Requester** role can create requests.

**Reasoning:** If a user only has the Approver role, attempting to create a request will return a `403 Unauthorized` response. This enforces role-based access control.

### 3. Approver Comments
**Assumption:** Approver comments are mandatory in the backend when approving or rejecting.

**Reasoning:** If no comment is provided by frontend, the system defaults to "Approved" or "Rejected". While the UI prompts for a comment, the backend does not accept empty comments, so if the approver leaves the comment empty, react defaults  the comments "Approver". or "Rejected"

**Note:** The assignment mentioned comments should be available, but didn't specify if they're mandatory. I implemented them as manadatory in the backend, and optional in frontend as they default to "Approved" or "Rejected" before sending the POST request.

### 4. User Authentication
**Assumption:** User authentication is **simulated** using a dropdown selector.

**Reasoning:** The assignment focused on workflow logic, not authentication systems. Both backend and frontend have hardcoded users (same users, names and roles), and the backend uses a `user-id` header to identify the current user.

### 5. Request Type
**Assumption:** Request types (Access, Finance, General) are for **categorization only**.

**Reasoning:** Types don't affect workflow or permissions in this implementation. In a real system, different types might route to different approvers or require different approval levels.

### 6. Users Cannot Approve Their Own Requests
**Assumption:** Users with both approver and requester roles shouldn't approve their own requests.

**Reasoning:** For a user with both Requester and Approver roles (like Lama), they could theoretically approve their own requests. This is handled in backend and will return 403 status code.

---

## Future Improvements

### Backend Improvements

1. **Input Validation**
   - Add length limits for title (e.g., max 200 characters)
   - Add length limits for description (e.g., max 2000 characters)
   - Add length limits for approver comments

2. **Real Authentication System**
   - Implement JWT-based authentication
   - Add user registration and login endpoints
   - Hash passwords
   - Add session management
   - Implement refresh tokens for long sessions

3. **Database Improvements**
   - Migrate to PostgreSQL for production

4. **API Enhancements**
   - Add endpoint to fetch one single request
   - Add pagination for request lists (limit/offset)
   - Add filtering (by status, type, date range)
   - Add sorting options (by date, status, type)
   - Return total count in list responses
   - Add rate limiting to prevent abuse

5. **Testing**
   - Add edge case testing
   - Add isolated test databse (test.db)

6. **Business Logic**
   - Add request history/audit trail
   - Add request assignment (assign to specific approver)
   - Support multiple approval levels
   - Add request due dates

### Frontend Improvements

1. **User Experience**
   - Toast notifications for success/error messages
   - Confirmation modals instead of browser alerts
   - Add approved or rejected by fields for single requests page

2. **Form Improvements**
   - Real-time validation with error messages
   - Character count for text fields
   - Form field hints and tooltips
   - Auto-save drafts (save while typing)
   - Rich text editor for description

3. **Styling & Responsiveness**
   - Mobile-responsive design (currently semi-responsive)
   - Use a CSS framework (Tailwind CSS or Material-UI)
   - Consistent design system
   - Dark mode support

4. **Features**
   - Search and filter requests
   - Sort requests by date, status, type
   