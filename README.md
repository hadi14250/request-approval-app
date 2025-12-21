# Request & Approval Workflow System

A simple request approval workflow application built with React and Node.js, where users can submit requests and approvers can review them.

## Table of Contents
- [Overview](#overview)
- [Features](#features)

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
