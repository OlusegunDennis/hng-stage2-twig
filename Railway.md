# Deploying on Railway

This guide explains how to deploy your Twig-based Express.js application on Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. Railway CLI installed (`npm install -g @railway/cli`)

## Step 1: Initialize Railway Project

1. Open your terminal in the project directory
2. Run `railway login`
3. Run `railway init` to create a new project
4. Select "Deploy from GitHub" or "Deploy from Local Directory"

## Step 2: Environment Variables

Add these environment variables in your Railway dashboard under "Variables":

```
NODE_ENV=production
SESSION_SECRET=your-super-secret-session-key-here
```

For SESSION_SECRET, generate a strong secret using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 3: Railway Configuration

The application is already configured for Railway deployment:

- Port is dynamically set using `process.env.PORT`
- Session configuration is production-ready
- Static assets are properly served
- Security headers are implemented for production
- Error handling is in place

## Step 4: Deployment

If using the Railway CLI:

1. Run `railway up` to deploy
2. Run `railway open` to open your deployed application

## Important Notes for Railway Deployment

1. **In-Memory Data**: This application uses in-memory data storage for users and tickets. In a production environment, you should implement a persistent database (like PostgreSQL) which Railway provides.

2. **Session Management**: Sessions are stored in memory. For production, consider using Railway's Redis add-on for session persistence.

3. **Static Assets**: All assets in the `public` directory are served correctly and cached in production.

4. **Routing**: All routes are properly defined and will work on Railway:
   - `/` - Home page
   - `/auth/login` - Login page
   - `/auth/signup` - Sign up page
   - `/dashboard` - User dashboard
   - `/tickets` - See all tickets
   - `/tickets/create` - Create ticket
   - `/tickets/edit/:id` - Edit ticket
   - API routes: `/tickets/delete/:id`

## Railway-Specific Optimizations

1. **Process Management**: Railway automatically handles process management
2. **SSL/TLS**: Railway provides SSL termination at the edge
3. **Static Asset Caching**: Assets are cached in production for better performance
4. **Security Headers**: Security headers are added in production environment

## Troubleshooting

### Common Issues:

1. **Application Crashes**: Check your Railway logs with `railway logs`
2. **Port Issues**: Ensure your app uses `process.env.PORT`
3. **Environment Variables**: Verify all required environment variables are set
4. **Database**: For persistent data, add PostgreSQL or another database service

### Useful Commands:

- `railway logs` - View application logs
- `railway shell` - Access a shell in your running container
- `railway up` - Deploy your application
- `railway open` - Open your application in the browser

## Next Steps for Production

For a production application, consider:

1. Adding a real database (PostgreSQL via Railway's Database Add-on)
2. Implementing user authentication with bcrypt password hashing
3. Adding input validation and sanitization
4. Setting up custom domains
5. Adding monitoring and error tracking

## Scaling

Railway makes scaling easy through the dashboard where you can:
- Adjust instance size (CPU/RAM)
- Set up auto-scaling
- Configure multiple instances for high availability