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
- express-session
- dotenv

## How to Run

```bash
npm install
node server.js
```

## Running in Development

```bash
npm run dev
```

## Running in Production

```bash
npm run prod
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
- `/tickets/edit/:id` - Edit ticket
- `/tickets/delete/:id` - Delete ticket (POST request)

## Features

- Responsive design that works on all device sizes
- Authentication pages (login and signup)
- Dashboard with ticket statistics
- Full CRUD functionality for tickets
- Consistent styling across all pages

## Deployment

### Deploying on Railway

This application is configured for deployment on Railway. See the [Railway.md](./Railway.md) file for detailed instructions on how to deploy your application on Railway.

### Environment Variables Required for Production

- `NODE_ENV` - Set to "production" for production environment
- `SESSION_SECRET` - Secret key for session encryption

### Railway Specific Configuration

- The application automatically uses the `PORT` environment variable provided by Railway
- Session configuration is optimized for production
- Static assets are cached in production for better performance
- Security headers are automatically added in production

## Running on Railway

1. Create a Railway account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm install -g @railway/cli`
3. Login: `railway login`
4. Initialize: `railway init`
5. Add environment variables in the Railway dashboard
6. Deploy: `railway up`