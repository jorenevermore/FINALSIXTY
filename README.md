# Alot Project

## Overview
The Alot project is a web application built using Next.js, TypeScript, Tailwind CSS, and Firebase. This project serves as a template for creating modern web applications with a focus on performance and scalability.

## Tech Stack
- **Next.js**: A React framework for building server-rendered applications.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Firebase**: A platform for building web and mobile applications, providing services like authentication and Firestore.
- **React Firebase Hooks**: A library of hooks for Firebase.

## Features
- User authentication (sign up, sign in, sign out)
- Todo list management with Firestore
- Responsive UI with Tailwind CSS
- Type-safe code with TypeScript
- Real-time data updates with Firebase

## Firebase Configuration
The application is already configured with the following Firebase project:
- Project ID: alot-83545
- Authentication: Email/Password
- Database: Firestore
- Storage: Firebase Storage

## Getting Started

### Prerequisites
- Node.js (version 14 or later)
- npm or yarn
- Google Maps API key (for location selection in the signup process)

### Installation
1. Clone the repository
2. Navigate to the project directory
3. Install the dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```
4. Create a `.env.local` file in the root directory with the following content:
   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDJz7-i1wKxVYzAT8HOar_UYZw34dZpNSw
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=alot-83545.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://alot-83545-default-rtdb.asia-southeast1.firebasedatabase.app
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=alot-83545
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=alot-83545.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=343816077312
   NEXT_PUBLIC_FIREBASE_APP_ID=1:343816077312:web:4d0ad356c862fe559658e5
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-H6R0SVK742

   # Google Maps API Key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
   ```
5. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual Google Maps API key. You can get one from the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/overview).

### Running the Application
To start the development server, run:
```
npm run dev
```
or
```
yarn dev
```
Open your browser and navigate to `http://localhost:3000` to view the application.

### Building for Production
To create an optimized production build, run:
```
npm run build
```
or
```
yarn build
```

To start the production server, run:
```
npm run start
```
or
```
yarn start
```

## Project Structure
- `src/components/` - React components
  - `Auth.tsx` - Authentication component
  - `TodoList.tsx` - Todo list component
- `src/lib/` - Utility functions and Firebase configuration
  - `firebase.ts` - Firebase configuration
- `src/pages/` - Next.js pages
  - `index.tsx` - Home page
  - `_app.tsx` - App component
- `src/styles/` - Global styles and Tailwind CSS configuration
  - `globals.css` - Global CSS
- `public/` - Static assets

## How to Use

### Authentication
1. Sign up with an email and password
2. Sign in with your credentials
3. Sign out when you're done

### Todo List
1. Add a new todo by typing in the input field and clicking "Add"
2. Delete a todo by clicking the "Delete" button next to it

## Deployment
This application can be deployed to Vercel, Netlify, or Firebase Hosting.

### Deploying to Vercel
1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Vercel will automatically deploy your application

### Deploying to Firebase Hosting
1. Install the Firebase CLI:
   ```
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```
   firebase login
   ```
3. Initialize Firebase Hosting:
   ```
   firebase init hosting
   ```
4. Build your application:
   ```
   npm run build
   ```
5. Deploy to Firebase Hosting:
   ```
   firebase deploy --only hosting
   ```