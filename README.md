\# Rotto Garage — Car Service Booking App



A full-stack web application for managing car service bookings. Users can register, add their cars, book services, and track booking status. Admins can view aggregated statistics across all bookings.



\## Live Demo



\- \*\*Frontend\*\*: https://rotto-garage-alpha.vercel.app

\- \*\*Backend API\*\*: https://rotto-garage-api.onrender.com



> Note: the backend is on Render's free tier and may take \~50 seconds to wake up on the first request after inactivity.



\## Tech Stack



\- \*\*Frontend\*\*: Next.js 14, React, TypeScript, Tailwind CSS

\- \*\*Backend\*\*: Node.js, Express, MongoDB (Mongoose)

\- \*\*Auth\*\*: JWT-based authentication

\- \*\*Deployment\*\*: Vercel (frontend), Render (backend), MongoDB Atlas (database)



\## Features



\- User registration and login

\- Add, view, and remove cars

\- Book services for a car with date and notes

\- View booking history with pagination

\- Dashboard with stats overview

\- Admin aggregation stats endpoint (booking counts by status/service type, recent bookings, total revenue)



\## Local Setup



\### Prerequisites

\- Node.js 18+

\- MongoDB running locally (or a MongoDB Atlas connection string)



\### Backend



\\`\\`\\`bash

cd backend

npm install

cp .env.example .env

\# fill in ROTTO\_MONGO\_URI and ROTTO\_JWT\_SECRET in .env

npm run dev

\\`\\`\\`



Backend runs on `http://localhost:5000`



\### Frontend



\\`\\`\\`bash

cd frontend

npm install

cp .env.example .env.local

\# set NEXT\_PUBLIC\_API\_URL=http://localhost:5000/api in .env.local

npm run dev

\\`\\`\\`



Frontend runs on `http://localhost:3000`



\## Environment Variables



\### Backend (`.env`)

\\`\\`\\`

PORT=5000

FRONTEND\_URL=http://localhost:3000

ROTTO\_MONGO\_URI=<your MongoDB connection string>

ROTTO\_JWT\_SECRET=<your JWT secret>

NODE\_ENV=development

\\`\\`\\`



\### Frontend (`.env.local`)

\\`\\`\\`

NEXT\_PUBLIC\_API\_URL=http://localhost:5000/api

\\`\\`\\`

