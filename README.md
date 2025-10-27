# Ticket App - Twig Version

A multi-framework ticket application using Twig templating engine.

## Setup

1. Make sure you have Node.js installed
2. Run `npm install` to install dependencies
3. Run `node server.js` to start the server
4. Visit `http://localhost:4000` in your browser

## Dependencies

- express
- twig

## How to Run

```bash
npm install
node server.js
```

## Project Structure

```
ticket-app-twig/
├── templates/
│   ├── layout.twig
│   ├── index.twig
│   ├── auth/
│   │   ├── login.twig
│   │   └── signup.twig
│   ├── dashboard.twig
│   └── tickets/
│       ├── list.twig
│       ├── create.twig
│       └── edit.twig
├── public/
│   ├── css/
│   │   ├── style.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── main.js
│   │   └── auth.js
│   └── assets/
│       ├── wave.svg
│       └── circles.svg
├── README.md
└── server.js
```

## Available Routes

- `/` - Home/Landing page
- `/auth/login` - Login page
- `/auth/signup` - Sign up page
- `/dashboard` - User dashboard
- `/tickets` - List all tickets
- `/tickets/create` - Create new ticket
- `/tickets/edit` - Edit ticket

## Features

- Responsive design that works on all device sizes
- Authentication pages (login and signup)
- Dashboard with ticket statistics
- Full CRUD functionality for tickets
- Consistent styling across all pages