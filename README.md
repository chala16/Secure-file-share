# Secure File Sharing Backend

## Overview
A secure Node.js backend API for encrypted file sharing, built with JWT authentication and AWS S3 cloud storage.

## Features
* AES-256 encrypted file uploads
* JWT-based user registration & login
* AWS S3 cloud storage integration
* Time-limited, shareable download links
* Input validation & password hashing
* User file management (upload, list, share, download)

## Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (with Mongoose)
* **Authentication:** JWT & bcryptjs
* **File Upload:** Multer
* **Encryption:** AES-256-CBC via Node.js `crypto`
* **Cloud Storage:** AWS S3 (AWS SDK v3)

## Getting Started

### Prerequisites
* Node.js 16+
* MongoDB Atlas account
* AWS account with S3 access

### Installation

```bash
git clone https://github.com/yourusername/secure-file-share-backend.git
cd secure-file-share-backend
npm install
```

### Setup Environment
Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
ENCRYPTION_KEY=32_characters_encryption_key
```

### Run the Server

```bash
npm run dev     # Development mode
npm start       # Production mode
```

Server will run on: `http://localhost:5000`

## API Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login with credentials |

### File Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload file (authenticated) |
| GET | `/api/files/my-files` | Get list of user's files |
| POST | `/api/files/share/:fileId` | Generate expiring share link |
| GET | `/api/files/download/:token` | Download file via share token |

## Security Highlights
* Passwords hashed using bcrypt with 12 salt rounds
* AES-256-CBC file encryption
* JWT authentication with expiration
* Users can only access/manage their own files
* Time-limited tokens for shareable links
* Input validation and CORS protection

## Project Structure

```
secure-file-share-backend/
├── controllers/        # Route logic (auth, file)
├── middleware/         # JWT auth, input validation
├── models/             # User and File Mongoose models
├── routes/             # API route definitions
├── utils/              # S3 helper functions, encryption
├── .env                # Environment variables
├── server.js           # Entry point
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

## Author
**Chalana Kaveesha**  