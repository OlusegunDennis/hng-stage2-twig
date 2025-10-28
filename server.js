import express from "express";
import twig from "twig";
import path from "path";
import { fileURLToPath } from 'url';
import session from "express-session";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'ticketapp-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Setup Twig template engine
app.set("view engine", "twig");
app.set("views", path.join(__dirname, "templates"));

// Serve static assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Simple in-memory stores for demo purposes (in production, use a database)
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', password: 'password123' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', password: 'password123' }
];

// Default tickets
let tickets = [
  { id: '1', title: 'Fix login page issue', description: 'Users are unable to login to the application after the recent update.', status: 'open', priority: 'high', userId: 1 },
  { id: '2', title: 'Update documentation', description: 'Documentation needs to be updated to reflect the new API changes.', status: 'in_progress', priority: 'medium', userId: 1 },
  { id: '3', title: 'Add dark mode feature', description: 'Implement a dark mode toggle for better user experience.', status: 'open', priority: 'low', userId: 2 }
];

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

app.get("/", (req, res) => res.render("index"));
app.get("/auth/login", (req, res) => res.render("auth/login"));
app.get("/auth/signup", (req, res) => res.render("auth/signup"));

// Login route
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Store user info in session
    req.session.user = {
      email: user.email,
      name: user.name
    };
    return res.redirect('/dashboard');
  } else {
    res.render('auth/login', { error: 'Invalid credentials' });
  }
});

// Signup route
app.post("/auth/signup", (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  
  if (existingUser) {
    return res.render('auth/signup', { error: 'User already exists' });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password // In production, hash the password
  };
  
  users.push(newUser);
  
  // Store user info in session
  req.session.user = {
    email: newUser.email,
    name: newUser.name
  };
  
  res.redirect('/dashboard');
});

// Logout route
app.get("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// Calculate ticket stats
const getTicketStats = (userId) => {
  const userTickets = tickets.filter(ticket => ticket.userId == userId);
  return {
    total: userTickets.length,
    open: userTickets.filter(ticket => ticket.status === 'open').length,
    closed: userTickets.filter(ticket => ticket.status === 'closed').length
  };
};

// Dashboard route
app.get("/dashboard", requireAuth, (req, res) => res.render("dashboard", { 
  user: req.session.user 
}));

// Ticket management routes
app.get("/tickets", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const userTickets = tickets.filter(ticket => ticket.userId == userId);
  const stats = getTicketStats(userId);
  res.render("tickets/list", { 
    user: req.session.user,
    tickets: userTickets,
    stats: stats
  });
});

app.get("/tickets/create", requireAuth, (req, res) => {
  res.render("tickets/create", { user: req.session.user });
});

// Create new ticket
app.post("/tickets/create", requireAuth, (req, res) => {
  const { title, description, status, priority } = req.body;
  const userId = req.session.user.id;
  
  // Basic validation
  if (!title || !status) {
    return res.render("tickets/create", { 
      user: req.session.user,
      error: 'Title and status are required' 
    });
  }
  
  // Create new ticket
  const newTicket = {
    id: (tickets.length + 1).toString(),
    title,
    description: description || '',
    status,
    priority: priority || 'medium',
    userId
  };
  
  tickets.push(newTicket);
  res.redirect('/tickets');
});

app.get("/tickets/edit/:id", requireAuth, (req, res) => {
  const ticketId = req.params.id;
  const userId = req.session.user.id;
  const ticket = tickets.find(t => t.id === ticketId && t.userId == userId);
  
  if (!ticket) {
    return res.status(404).send('Ticket not found');
  }
  
  res.render("tickets/edit", { 
    user: req.session.user,
    ticket: ticket 
  });
});

// Update ticket
app.post("/tickets/edit/:id", requireAuth, (req, res) => {
  const ticketId = req.params.id;
  const userId = req.session.user.id;
  const ticketIndex = tickets.findIndex(t => t.id === ticketId && t.userId == userId);
  
  if (ticketIndex === -1) {
    return res.status(404).send('Ticket not found');
  }
  
  const { title, description, status, priority } = req.body;
  
  // Basic validation
  if (!title || !status) {
    const ticket = tickets[ticketIndex];
    return res.render("tickets/edit", { 
      user: req.session.user,
      ticket: ticket,
      error: 'Title and status are required' 
    });
  }
  
  // Update ticket
  tickets[ticketIndex] = {
    ...tickets[ticketIndex],
    title,
    description: description || '',
    status,
    priority: priority || 'medium'
  };
  
  res.redirect('/tickets');
});

// Update ticket via AJAX (for in-place editing)
app.post("/tickets/:id/update", requireAuth, (req, res) => {
  const ticketId = req.params.id;
  const userId = req.session.user.id;
  const ticketIndex = tickets.findIndex(t => t.id === ticketId && t.userId == userId);
  
  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  const { title, description, status, priority } = req.body;
  
  // Basic validation
  if (!title || !status) {
    return res.status(400).json({ error: 'Title and status are required' });
  }
  
  // Update ticket
  tickets[ticketIndex] = {
    ...tickets[ticketIndex],
    title,
    description: description || '',
    status,
    priority: priority || 'medium'
  };
  
  res.json({ success: true, ticket: tickets[ticketIndex] });
});

// Delete ticket
app.delete("/tickets/:id", requireAuth, (req, res) => {
  const ticketId = req.params.id;
  const userId = req.session.user.id;
  const ticketIndex = tickets.findIndex(t => t.id === ticketId && t.userId == userId);
  
  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  tickets.splice(ticketIndex, 1);
  res.json({ success: true });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));