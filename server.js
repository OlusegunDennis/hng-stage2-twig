import express from "express";
import twig from "twig";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware - Production ready configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ticketapp-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === "production", 
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    name: 'sessionId' // Custom cookie name
  })
);

// Add helmet for security (optional but recommended for production)
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
}

// Twig template engine
app.set("view engine", "twig");
app.set("views", path.join(__dirname, "views"));

// Disable twig cache in development, but conditionally enable in production
if (process.env.NODE_ENV !== "production") {
  twig.cache(false);
} else {
  twig.cache(true); // Enable cache in production for better performance
}

// Serve static assets
app.use(express.static(path.join(__dirname, "public"), {
  maxAge: process.env.NODE_ENV === "production" ? '1y' : '1d' // Cache in production
}));

// In-memory demo data (for development purposes)
// In a real application, you'd want to use a persistent database
let users = [
  { id: 1, name: "John Doe", email: "john@example.com", password: "password123" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", password: "password123" },
];

let tickets = [
  { id: "1", title: "Fix login page issue", description: "Users cannot login", status: "open", priority: "high", userId: 1 },
  { id: "2", title: "Update documentation", description: "Docs need update", status: "in_progress", priority: "medium", userId: 1 },
  { id: "3", title: "Add dark mode", description: "Dark mode toggle", status: "open", priority: "low", userId: 2 },
];

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    // For AJAX requests, return JSON error
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ error: "Authentication required" });
    }
    return res.redirect("/auth/login");
  }
  next();
};

// Routes
app.get("/", (req, res) => {
  // If user is logged in, redirect to dashboard
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.render("index", { title: "Ticket App - Home" });
});

// Auth routes
app.get("/auth/login", (req, res) => res.render("auth/login", { title: "Login" }));
app.get("/auth/signup", (req, res) => res.render("auth/signup", { title: "Sign Up" }));

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    req.session.user = { id: user.id, name: user.name, email: user.email };
    return res.redirect("/dashboard");
  }
  res.render("auth/login", { error: "Invalid credentials", title: "Login" });
});

app.post("/auth/signup", (req, res) => {
  const { name, email, password } = req.body;
  
  // Basic validation
  if (!name || !email || !password) {
    return res.render("auth/signup", { error: "All fields are required", title: "Sign Up" });
  }
  
  if (users.find((u) => u.email === email)) {
    return res.render("auth/signup", { error: "User already exists", title: "Sign Up" });
  }
  
  const newUser = { id: users.length + 1, name, email, password };
  users.push(newUser);
  req.session.user = { id: newUser.id, name: newUser.name, email: newUser.email };
  res.redirect("/dashboard");
});

app.get("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/");
  });
});

// Dashboard helper
const getTicketStats = (userId) => {
  const userTickets = tickets.filter((t) => t.userId === userId);
  return {
    total: userTickets.length,
    open: userTickets.filter((t) => t.status === "open").length,
    closed: userTickets.filter((t) => t.status === "closed").length,
    in_progress: userTickets.filter((t) => t.status === "in_progress").length,
  };
};

// Dashboard
app.get("/dashboard", requireAuth, (req, res) =>
  res.render("dashboard", { 
    user: req.session.user, 
    stats: getTicketStats(req.session.user.id),
    title: "Dashboard"
  })
);

// Tickets CRUD
app.get("/tickets", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  res.render("tickets/list", {
    user: req.session.user,
    tickets: tickets.filter((t) => t.userId === userId),
    stats: getTicketStats(userId),
    title: "My Tickets"
  });
});

app.get("/tickets/create", requireAuth, (req, res) =>
  res.render("tickets/create", { 
    user: req.session.user,
    title: "Create Ticket"
  })
);

app.post("/tickets/create", requireAuth, (req, res) => {
  const { title, description, status, priority } = req.body;
  
  // Validation
  if (!title || !status) {
    return res.render("tickets/create", {
      user: req.session.user,
      error: "Title and status are required",
      title: "Create Ticket"
    });
  }

  tickets.push({
    id: (tickets.length + 1).toString(),
    title,
    description: description || "",
    status,
    priority: priority || "medium",
    userId: req.session.user.id,
  });
  res.redirect("/tickets");
});

app.get("/tickets/edit/:id", requireAuth, (req, res) => {
  const ticket = tickets.find((t) => t.id === req.params.id && t.userId === req.session.user.id);
  if (!ticket) return res.status(404).render("404", { title: "Ticket Not Found" });
  res.render("tickets/edit", { 
    user: req.session.user, 
    ticket,
    title: "Edit Ticket"
  });
});

app.post("/tickets/edit/:id", requireAuth, (req, res) => {
  const index = tickets.findIndex((t) => t.id === req.params.id && t.userId === req.session.user.id);
  if (index === -1) return res.status(404).render("404", { title: "Ticket Not Found" });

  const { title, description, status, priority } = req.body;
  if (!title || !status) {
    return res.render("tickets/edit", {
      user: req.session.user,
      ticket: tickets[index],
      error: "Title and status are required",
      title: "Edit Ticket"
    });
  }

  tickets[index] = { ...tickets[index], title, description: description || "", status, priority: priority || "medium" };
  res.redirect("/tickets");
});

// AJAX delete ticket
app.post("/tickets/delete/:id", requireAuth, (req, res) => {
  const index = tickets.findIndex((t) => t.id === req.params.id && t.userId === req.session.user.id);
  if (index === -1) return res.status(404).json({ error: "Ticket not found" });
  tickets.splice(index, 1);
  res.json({ success: true });
});

// Catch-all route for 404 errors - this should be last
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", { title: "Server Error", error: err });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Application URL: http://localhost:${PORT}`);
});

export default app;