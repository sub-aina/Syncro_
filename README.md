
# Syncro

**A full-stack collaboration platform for university teams and small groups.**
Built independently, Syncro is an experiment in real-time systems, file handling, and end-to-end development — created without coursework, deadlines, or grades.

## 🔍 Overview

Syncro is designed to help student teams stay organized and aligned while working on academic projects, group assignments, or society tasks.
It tackles common collaboration challenges like:

* Lack of visibility into progress
* Difficulty managing shared resources
* Unclear task ownership
* Team members being unresponsive or misaligned

## 🎯 Features

* **Daily Check-ins**: Share mood, blockers, and progress
* **Shared Resource Hub**: Upload and categorize files, links, and documents
* **Kanban Taskboard**: Assign and track tasks in real-time
* **Team Analytics**: Visualize team engagement and collaboration patterns (powered by Recharts)
* **Real-Time Notifications**: Instant feedback on updates, uploads, and activity via Socket.io
* **Smooth File Uploads**: Organized by folders and timestamps using `multer`
* **Reusable Team Templates**: Create new projects with pre-saved team configurations
* **Lightweight Collaboration Tracking**: View who’s active and how teammates are working together

## 🧪 Tech Stack

**Frontend**: React.js, Tailwind CSS
**Backend**: Node.js, Express, MongoDB
**Real-Time Layer**: Socket.io
**File Uploads**: Multer
**Authentication**: JWT + bcrypt
**Data Visualization**: Recharts
**Hosting**: Vercel (frontend), Render (backend)

## 🧠 Key Learning Highlights

This project was a deep dive into:

* Building real-time systems from scratch with Socket.io
* Managing socket rooms and multi-user state updates
* Handling secure file uploads and organizing them at scale
* Designing a full-stack app from UI to database with intention, not just functionality
* Troubleshooting complex deployment issues including:

  * MongoDB IP whitelisting
  * CORS configuration
  * Static file handling in production
  * Real-time sockets across distributed services

## 🌐 Live Demo

🔗 **Website**: [https://syncro-delta.vercel.app](https://syncro-delta.vercel.app)
> Best experienced on a laptop or desktop browser.

## 📌 Future Improvements


* Live team chat
* AI-based summarization of check-ins and task blockers
* Improved mobile experience
* Smarter resource search and filtering
