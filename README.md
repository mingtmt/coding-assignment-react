## Overview
This project is a full-stack ticket management application built with a modern web stack. It demonstrates best practices in frontend and backend development, modular architecture, and code sharing between client and server.

## Features
- Ticket listing, creation, and detail view
- User management
- State management with custom stores
- API integration between client and server
- Modular monorepo structure using Nx
- Unit and integration tests with Jest

## Tech Stack

### Frontend
- React (with TypeScript)
- CSS Modules for styling
- Zustand for state management: A small, fast, and scalable state-management solution for React.
- Ky for HTTP requests: A tiny and elegant HTTP client based on the browser Fetch API.
- Zod for schema validation: TypeScript-first schema declaration and validation library.
- Jest for testing

## Getting Started
1. Install dependencies:
  ```bash
  yarn install
  ```
2. Run the development servers:
  ```bash
  yarn start
  ```
3. Run tests:
  ```bash
  yarn test
  ```

## Folder Structure
- `client/` - Frontend React app
- `server/` - Backend API
- `shared-models/` - Shared TypeScript models

## Contact
For any questions, contact [btminh.dev@gmail.com](mailto:btminh.dev@gmail.com).
