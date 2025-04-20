# MCQ Practice App

A modern MCQ practice application for students, featuring God Mode, Practice Mode, and Debug Mode for database management.

## Overview

This application allows students to practice multiple-choice questions organized by courses and weeks. It includes various modes:

- **Practice Mode**: Regular quiz practice with standard feedback
- **God Mode**: Intensive testing with detailed analytics (up to 50 questions per session)
- **Debug Mode**: Database explorer for viewing and managing quiz files

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS, DaisyUI
- **Backend**: Node.js, Express
- **State Management**: React Context API
- **UI Components**: React Icons, Framer Motion
- **Styling**: Tailwind CSS with dark/light mode support

## Setup & Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables in `.env` file
4. Start the development server:
   ```
   npm run dev
   HOST=0.0.0.0 DANGEROUSLY_DISABLE_HOST_CHECK=true npm start
   ```

This will start both the React frontend and the Express backend concurrently.

## Available Scripts

- `npm start`: Starts the React frontend only (on port 3001)
- `npm run server`: Starts the Express backend only (on port 3001)
- `npm run dev`: Starts both frontend and backend concurrently (recommended for development)
- `npm run build`: Builds the React app for production
- `npm run prod`: Builds the React app and starts the server in production mode
- `npm run tunnel`: Exposes your local server via Cloudflare Tunnel

## Quick Start Guide

1. Run the application with `npm run dev`
2. Access the application at http://localhost:3001
3. Navigate to Practice Mode to complete regular quizzes
4. Try God Mode for intensive testing sessions
5. Access Debug Mode by visiting http://localhost:3001/debug?admin=true

## Running with Cloudflare Tunnel

This application is configured to work with Cloudflare Tunnel, allowing you to expose your local development environment to the internet securely.

### Prerequisites

1. Install cloudflared: [Cloudflare Tunnel installation guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)

### Running with Tunnel

1. Start the application server:
   ```
   npm run server
   ```

2. In a separate terminal, start the Cloudflare Tunnel:
   ```
   cloudflared tunnel --url http://localhost:3001
   ```

3. Cloudflare will provide a public URL that you can share with others to access your application.

## Configuration

The application's configuration is managed through environment variables in the `.env` file:

```
# Server configuration
HOST=0.0.0.0      # The IP address the server will bind to
PORT=3001         # The port the server will listen on

# React app configuration
REACT_APP_API_URL=http://localhost:3001  # URL for API requests

# Set to 'production' when deploying
NODE_ENV=development
```

### IP Address Configuration

- For local development: `HOST=127.0.0.1` or `HOST=localhost`
- For Cloudflare Tunnel: `HOST=0.0.0.0` (binds to all network interfaces)

## Features

- Multiple choice question practice organized by courses and weeks
- God Mode for intensive testing with detailed performance analytics
- Debug Mode for database exploration (access via `/debug?admin=true`)
- Light/Dark theme support with system preference detection
- Mobile-responsive design with Tailwind CSS
- API endpoints for file management and quiz data persistence
- JSON-based database for simple deployment and management

## Project Structure

```
├── public/             # Static files and database
│   └── db/             # JSON database files
│       └── courses/    # Course-specific quiz data
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── pages/          # Application pages/routes
│   └── index.js        # Application entry point
└── server.js           # Express backend server
```

## Accessing Debug Mode

To access the Debug Mode and view database files, navigate to `/debug?admin=true` in your browser. 