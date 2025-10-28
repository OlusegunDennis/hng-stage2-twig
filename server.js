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
  cookie: { secure: process.env.NODE_ENV === 'production' } // true only in production with HTTPS
}));

// Twig setup
app.set("view engine", "twig");
app.set("views", path.join(__dirname, "templates"));

// Static assets
app.use(express.static(path.join(__dirname, "public")));

// In-memory demo data
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', password: 'password123' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', password: 'password123' }
];

let tickets = [
  { id: '1', title: 'Fix login page', description: 'Users cannot login', status: 'open', priority: 'high', userId: 1 },
  { id: '2', title: 'Update docs', description: 'API docs need update', status: 'in_progress', priority: 'medium', userId: 1 },
  { id: '3', title: 'Add dark mode', description: 'UX improvement', status: 'open', priority: 'low', userId: 2 }
];

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
};

// Routes
app.get("/", (req, res) => res.render("index"));

// Auth routes
app.get("/auth/login", (req, res) => res.render("auth/login"));
app.get("/auth/signup", (req, res) => res.render("auth/signup"));

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    req.session.user = { id: user.id, email: user.email, name: user.name }; // include id!
    return res.redirect('/dashboard');
  } else {
    return res.render('auth/login', { error: 'Invalid credentials' });
  }
});

app.post("/auth/signup", (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = users.find(u => u.email === email);
  if (existingUser) return res.render('auth/signup', { error: 'User already exists' });

  const newUser = { id: users.length + 1, name, email, password };
  users.push(newUser);
  req.session.user = { id: newUser.id, email: newUser.email, name: newUser.name };
  return res.redirect('/dashboard');
});

app.get("/auth/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/');
  });
});

// Dashboard
const getTicketStats = (userId) => {
  const userTickets = tickets.filter(t => t.userId === userId);
  return {
    total: userTickets.length,
    open: userTickets.filter(t => t.status === 'open').length,
    closed: userTickets.filter(t => t.status === 'closed').length
  };
};

app.get("/dashboard", requireAuth, (req, res) => {
  const stats = getTicketStats(req.session.user.id);
  res.render("dashboard", { user: req.session.user, stats });
});

// Ticket routes
app.get("/tickets", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const userTickets = tickets.filter(t => t.userId === userId);
  const stats = getTicketStats(userId);
  res.render("tickets/list", { user: req.session.user, tickets: userTickets, stats });
});

app.get("/tickets/create", requireAuth, (req, res) => {
  res.render("tickets/create", { user: req.session.user });
});

app.post("/tickets/create", requireAuth, (req, res) => {
  const { title, description, status, priority } = req.body;
  if (!title || !status) return res.render("tickets/create", { user: req.session.user, error: 'Title and status are required' });

  tickets.push({
    id: (tickets.length + 1).toString(),
    title,
    description: description || '',
    status,
    priority: priority || 'medium',
    userId: req.session.user.id
  });
  res.redirect('/tickets');
});

app.get("/tickets/edit/:id", requireAuth, (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id && t.userId === req.session.user.id);
  if (!ticket) return res.status(404).send('Ticket not found');
  res.render("tickets/edit", { user: req.session.user, ticket });
});

app.post("/tickets/edit/:id", requireAuth, (req, res) => {
  const ticketIndex = tickets.findIndex(t => t.id === req.params.id && t.userId === req.session.user.id);
  if (ticketIndex === -1) return res.status(404).send('Ticket not found');

  const { title, description, status, priority } = req.body;
  if (!title || !status) return res.render("tickets/edit", { user: req.session.user, ticket: tickets[ticketIndex], error: 'Title and status are required' });

  tickets[ticketIndex] = { ...tickets[ticketIndex], title, description: description || '', status, priority: priority || 'medium' };
  res.redirect('/tickets');
});

// AJAX routes
app.post("/tickets/:id/update", requireAuth, (req, res) => {
  const ticketIndex = tickets.findIndex(t => t.id === req.params.id && t.userId === req.session.user.id);
  if (ticketIndex === -1) return res.status(404).json({ error: 'Ticket not found' });

  const { title, description, status, priority } = req.body;
  if (!title || !status) return res.status(400).json({ error: 'Title and status are required' });

  tickets[ticketIndex] = { ...tickets[ticketIndex], title, description: description || '', status, priority: priority || 'medium' };
  res.json({ success: true, ticket: tickets[ticketIndex] });
});

app.delete("/tickets/:id", requireAuth, (req, res) => {
  const ticketIndex = tickets.findIndex(t => t.id === req.params.id && t.userId === req.session.user.id);
  if (ticketIndex === -1) return res.status(404).json({ error: 'Ticket not found' });

  tickets.splice(ticketIndex, 1);
  res.json({ success: true });
});

// Catch-all 404
app.use((req, res) => res.status(404).render('404'));

// Use dynamic port for Render
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
