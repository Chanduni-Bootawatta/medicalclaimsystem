# User-Centered Web-Based Medical Claim System with Hybrid Fraud Detection for People's Bank Staff and Pensioners

## 📌 Project Overview

This project presents a user-centered web-based medical claim management system designed for People's Bank staff and pensioners. The system aims to improve the efficiency, transparency, and accuracy of the medical claim approval process by reducing manual work and introducing a hybrid fraud detection approach.

The system combines rule-based validation techniques with intelligent fraud detection methods to identify suspicious medical claim patterns while supporting reliable decision-making.

## 🎯 Research Objectives

- To develop a user-friendly web-based medical claim submission and approval system.
- To digitize the existing manual medical claim workflow.
- To improve fraud detection accuracy using a hybrid detection approach.
- To enhance transparency between claim applicants and approval officers.
- To evaluate the usability of the developed system using user-centered design principles.

## ✨ Main Features

### 👤 Claim Applicant (Staff/Pensioner)
- Submit medical claim applications online.
- Upload supporting documents.
- Track claim status.
- View claim history.

### 👨‍💼 Staff Officer
- Review submitted claims.
- Validate claim information.
- Manage claim approval workflow.

### 👨‍💼 Manager
- Review and approve/reject claims.
- Monitor claim activities.

### 🔍 Hybrid Fraud Detection
- Rule-based validation for suspicious claim patterns.
- Detection of abnormal claim behaviors.
- Support for accurate and explainable fraud identification.

## 🛠️ Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- Figma (UI/UX Design)

### Backend
- Flask / Python
- REST API

### Database
- MySQL

Database Tables

-users
-claims
-claim_reviews
-attachments
-fraud_checks
-approvals
-notifications
-payments

### Data Processing & Detection
- Python
- Scikit-learn
- Synthetic dataset generation

## 📂 Project Structure
medicalclaimsystem
│
├── src                         # React Frontend
│   ├── components
│   ├── pages
│   ├── assets
│   ├── styles
│   ├── App.jsx
│   └── main.jsx
│
├── backend                     # Flask Backend
│   │
│   ├── app.py                  # Flask application entry point
│   ├── database.py             # MySQL database connection
│   │
│   └── routes
│       ├── auth.py             # Login and authentication APIs
│       ├── claims.py           # Claim submission APIs
│       ├── approvals.py         # Approval workflow APIs
│       └── users.py             # User management APIs
│
├── public
├── package.json
├── vite.config.js
└── README.md


 # Approval Workflow

APPLIER (Staff / Pensioner)
          |
          | Submit Medical Claim
          ↓
    STAFF OFFICER
          |
          | Check documents
          | Run fraud detection
          |
          | If suspicious → Reject claim
          |
          | If valid → Send to Manager
          ↓
        MANAGER
          |
          | Approve claim
          ↓
   STAFF OFFICER
          |
          | Check claim category/grade
          |
          | Send for A/B approval
          ↓
A OFFICER / B OFFICER
          |
          | Approve according to grade
          ↓
      PAYMENT
          |
          ↓
        PAID

## 🚀 Installation and Setup

Clone the repository:

```bash
git clone https://github.com/Chanduni-Bootawatta/medicalclaimsystem.git
```

Navigate to the project folder:

```bash
cd medicalclaimsystem
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```
📊 Research Scope

The system focuses on medical claim processing within selected People's Bank branches in Central Province, Sri Lanka.

🔒 Data Privacy

The dataset used for system development is prepared for research purposes. No confidential personal information is included.

👩‍💻 Author

Chanduni Bootawatta

Final Year Research Project
Software Engineering Undergraduate
