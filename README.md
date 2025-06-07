# Alseids Angular Frontend

This project is an Angular v19 app using PrimeNG for UI. It features authentication (login/register) and a user table fetched from a backend API.

## Features

- Login and registration forms
- User table with index and username columns
- Uses PrimeNG for UI components
- Communicates with backend API endpoints:
  - POST https://alseids-be.onrender.com/auth/login
  - POST https://alseids-be.onrender.com/auth/register
  - GET https://alseids-be.onrender.com/users

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

- `src/app/login.component.*` — Login and registration UI
- `src/app/home.component.*` — User table UI

## Build

```bash
   ng build --base-href /alseids/
```
