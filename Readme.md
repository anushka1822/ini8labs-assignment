# MediVault - Patient Portal Application

A full-stack healthcare application allowing users to securely upload, manage, and view medical documents. This solution uses a **Proxy Architecture** where the backend securely streams files from AWS S3, ensuring robust security and preventing direct public access to the storage bucket.

## 🚀 Tech Stack
* **Frontend:** React + Vite + Tailwind CSS
* **Backend:** Python FastAPI
* **Database:** PostgreSQL (Neon DB)
* **Storage:** AWS S3 (Object Storage)

## Live links

Backend : https://ini8labs-assignment-q829.onrender.com/docs

Frontend : https://ini8labs-assignment-xi.vercel.app/

Github : https://github.com/anushka1822/ini8labs-assignment/

## Instructions to use the app locally.

1. Clone the repository form github : [https://github.com/anushka1822/ini8labs-assignment/](Github)
bash
git clone https://github.com/anushka1822/ini8labs-assignment.git

2. Go inside the **Backend** directory.
bash
cd Backend

3. Install the requirements.
bash
pip install -r requirement.txt

4. add a .env file and add the following : DATABASE_URL,AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY,AWS_REGION,S3_BUCKET_NAME
5. Run the backend using uvicorm main:app --reload
6. Go to the **Frontend** directory.
bash
cd Frontend

7. Install the dependencies.
bash
npm install

8. Run the frontend
bash
npm run dev

9. Use the application in https://localhost:5173/.


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


