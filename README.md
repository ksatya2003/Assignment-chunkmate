# 📄 CHUNKMATE  App

A full-stack web application to upload Markdown (`.md`) files, chunk their content into meaningful sections (paragraphs, tables, and links), and store them in a PostgreSQL database with contextual headings.

## 🌐 Live Demo
Coming soon or run locally following the steps below.

---

## 🚀 Features

- Upload Markdown files
- Automatically chunk content by:
  - Paragraphs
  - Tables (each row is a chunk with headers)
  - Hyperlinks (stored separately)
- Headings (up to 10 levels) repeated with each chunk for full context
- View uploaded files and their chunked content
- Downloadable reference of hyperlinks
- Delete uploaded files

---

## 🛠️ Tech Stack

### Frontend:
- React.js
- HTML5
- CSS3
- Axios

### Backend:
- Node.js
- Express.js

### Database:
- PostgreSQL

### File Upload:
- Multer

---

## 🗃️ Database Design

### 1. `documents`
- `id` (PK)
- `filename`
- `upload_time`

### 2. `chunks`
- `id` (PK)
- `document_id` (FK to documents.id)
- `chunk_number`
- `content`

### 3. `document_links`
- `id` (PK)
- `document_id` (FK to documents.id)
- `chunk_number`
- `url`

---

## 📦 Installation


1. **Clone the Repository**

```bash
git clone https://github.com/your-username/Assignment-chunkmate.git
cd chunkmate-frontend

# Install Backend Dependencies
cd public
cd backend
npm install

# Install Frontend Dependencies
cd public
cd backend
npm install

# Configure PostgreSQL
# (Update db.js file with your PostgreSQL credentials)

# Start Backend Server
node app.js

# Start Frontend
npm run dev
----

## 📁** Folder Structure**
Assignment-chunkmate/
├── backend/
│   ├── app.js
│   ├── routes/
│   │   └── uploadRoutes.js
│   ├── controllers/
│   │   └── UploadController.js
│   ├── models/
│   │   └── db.js
│   └── uploads/
└── src/
    ├── App.jsx
    ├── App.css
    ├── components/
    │   └── UploadDocument.jsx




