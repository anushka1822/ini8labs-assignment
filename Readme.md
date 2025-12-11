# MediVault - Patient Portal Application

A full-stack healthcare application allowing users to securely upload, manage, and view medical documents. This solution uses a **Proxy Architecture** where the backend securely streams files from AWS S3, ensuring robust security and preventing direct public access to the storage bucket.

## 🚀 Tech Stack
* **Frontend:** React + Vite + Tailwind CSS
* **Backend:** Python FastAPI
* **Database:** PostgreSQL (Neon DB)
* **Storage:** AWS S3 (Object Storage)

## 📂 Project Structure
```text
/
├── backend/            # FastAPI Application
│   ├── main.py         # API Endpoints & Logic
│   ├── database.py     # DB Connection
│   ├── models.py       # SQLAlchemy Models
│   └── requirements.txt
├── frontend/           # React Application
│   ├── src/            # Components & Styles
│   └── package.json
└── design.md           # Architecture & Decisions