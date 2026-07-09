# SocialPilot
Social Media Scheduler &amp; Campaign Management Platform

# SocialPilot - Frontend

SocialPilot is a comprehensive Social Media Scheduler & Campaign Management Platform. This repository contains the frontend implementation built with Next.js 16 and Tailwind CSS.
# Features

    Authentication: Complete user flows for Login, Register, Forgot Password, and Reset Password.

    State Management: Global authentication state managed via AuthProvider.

    Architecture: Clean folder structure using src/app/(auth) for authentication routes.

    Performance: Optimized with Next.js Turbopack and font-optimized via next/font.

# Tech Stack

    Framework: Next.js (App Router)

    Language: JavaScript (with TypeScript-based path aliases)

    Styling: Tailwind CSS

    Fonts: Poppins (Google Fonts)

# Getting Started
    1. Prerequisites

    Ensure you have Node.js installed (v18 or higher recommended).
    2. Installation
    Bash

# Clone the repository
    git clone https://github.com/Prathiba-hub/SocialPilot.git

# Navigate to the frontend directory
    cd SocialPilot

# Install dependencies
    npm install

# Environment Variables

    Create a .env.local file in the root directory and add the following:
    Code snippet

    NEXT_PUBLIC_API_URL=your_api_url_here

# Running the Development Server
    Bash

    npm run dev

    Open http://localhost:3000 in your browser.
    📂 Project Structure

        src/app/(auth): Authentication pages (Login, Register, etc.)

        src/context: React Context Providers for global state.

        src/components: Reusable UI components.

        src/lib: Utility functions and shared libraries.