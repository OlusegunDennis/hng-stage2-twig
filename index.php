<?php
require_once __DIR__ . '/vendor/autoload.php';

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

session_start(); // Start session to handle user authentication

$loader = new FilesystemLoader(__DIR__ . '/templates');
$twig = new Environment($loader);

// Define simple in-memory users and tickets (for demo purposes)
$users = [
    ['id' => 1, 'name' => 'John Doe', 'email' => 'john@example.com', 'password' => 'password123'],
    ['id' => 2, 'name' => 'Jane Smith', 'email' => 'jane@example.com', 'password' => 'password123']
];

$tickets = [
    ['id' => '1', 'title' => 'Fix login page issue', 'description' => 'Users are unable to login to the application after the recent update.', 'status' => 'open', 'priority' => 'high', 'userId' => 1],
    ['id' => '2', 'title' => 'Update documentation', 'description' => 'Documentation needs to be updated to reflect the new API changes.', 'status' => 'in_progress', 'priority' => 'medium', 'userId' => 1],
    ['id' => '3', 'title' => 'Add dark mode feature', 'description' => 'Implement a dark mode toggle for better user experience.', 'status' => 'open', 'priority' => 'low', 'userId' => 2]
];

// Check if user is authenticated (for protected routes)
function is_authenticated() {
    return isset($_SESSION['user']);
}

// Get current user
function get_logged_in_user() {
    return isset($_SESSION['user']) ? $_SESSION['user'] : null;
}

// Calculate ticket stats for a user
function get_ticket_stats($user_id) {
    global $tickets;
    $user_tickets = array_filter($tickets, function($ticket) use ($user_id) {
        return $ticket['userId'] == $user_id;
    });
    
    return [
        'total' => count($user_tickets),
        'open' => count(array_filter($user_tickets, function($ticket) { return $ticket['status'] === 'open'; })),
        'closed' => count(array_filter($user_tickets, function($ticket) { return $ticket['status'] === 'closed'; }))
    ];
}

$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

if ($request_method === 'POST') {
    // Handle POST routes
    if ($request_uri === '/auth/login') {
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        
        // Find user by email and password
        foreach ($users as $user) {
            if ($user['email'] === $email && $user['password'] === $password) {
                $_SESSION['user'] = [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email']
                ];
                header('Location: /dashboard');
                exit;
            }
        }
        
        // If login fails, show login page with error
        echo $twig->render('auth/login.twig', [
            'title' => 'Login - Ticket Management App',
            'error' => 'Invalid credentials'
        ]);
    } elseif ($request_uri === '/auth/signup') {
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        
        // Check if user already exists
        $email_exists = false;
        foreach ($users as $user) {
            if ($user['email'] === $email) {
                $email_exists = true;
                break;
            }
        }
        
        if ($email_exists) {
            echo $twig->render('auth/signup.twig', [
                'title' => 'Sign Up - Ticket Management App',
                'error' => 'User already exists'
            ]);
            exit;
        }
        
        // Create new user
        $new_user_id = count($users) + 1;
        $new_user = [
            'id' => $new_user_id,
            'name' => $name,
            'email' => $email,
            'password' => $password
        ];
        
        $users[] = $new_user;
        
        $_SESSION['user'] = [
            'id' => $new_user['id'],
            'name' => $new_user['name'],
            'email' => $new_user['email']
        ];
        
        header('Location: /dashboard');
        exit;
    } elseif (preg_match('/^\/tickets\/edit\/(\d+)$/', $request_uri, $matches)) {
        if (!is_authenticated()) {
            header('Location: /auth/login');
            exit;
        }
        
        $ticket_id = $matches[1];
        $current_user = get_logged_in_user();
        
        // Find the ticket to update
        $ticket_index = -1;
        foreach ($tickets as $index => $ticket) {
            if ($ticket['id'] == $ticket_id && $ticket['userId'] == $current_user['id']) {
                $ticket_index = $index;
                break;
            }
        }
        
        if ($ticket_index === -1) {
            // Ticket not found or not owned by user
            header('Location: /tickets');
            exit;
        }
        
        $title = $_POST['title'] ?? '';
        $description = $_POST['description'] ?? '';
        $status = $_POST['status'] ?? '';
        $priority = $_POST['priority'] ?? 'medium';
        
        // Basic validation
        if (empty($title) || empty($status)) {
            // Show edit page with error
            echo $twig->render('tickets/edit.twig', [
                'title' => 'Edit Ticket - Ticket Management App',
                'user' => $current_user,
                'ticket' => $tickets[$ticket_index],
                'error' => 'Title and status are required'
            ]);
        } else {
            // Update the ticket
            $tickets[$ticket_index] = [
                'id' => $ticket_id,
                'title' => $title,
                'description' => $description,
                'status' => $status,
                'priority' => $priority,
                'userId' => $current_user['id']
            ];
            
            header('Location: /tickets');
            exit;
        }
    } elseif ($request_uri === '/tickets/create') {
        if (!is_authenticated()) {
            header('Location: /auth/login');
            exit;
        }
        
        $title = $_POST['title'] ?? '';
        $description = $_POST['description'] ?? '';
        $status = $_POST['status'] ?? '';
        $priority = $_POST['priority'] ?? 'medium';
        
        // Basic validation
        if (empty($title) || empty($status)) {
            $current_user = get_logged_in_user();
            $stats = get_ticket_stats($current_user['id']);
            
            $user_tickets = array_filter($tickets, function($ticket) use ($current_user) {
                return $ticket['userId'] == $current_user['id'];
            });
            
            echo $twig->render('tickets/list.twig', [
                'title' => 'My Tickets - Ticket Management App',
                'user' => $current_user,
                'tickets' => array_values($user_tickets),
                'stats' => $stats,
                'error' => 'Title and status are required'
            ]);
        } else {
            // Create new ticket
            global $tickets;
            $new_ticket_id = (string)(count($tickets) + 1);
            $new_ticket = [
                'id' => $new_ticket_id,
                'title' => $title,
                'description' => $description,
                'status' => $status,
                'priority' => $priority,
                'userId' => get_logged_in_user()['id']
            ];
            $tickets[] = $new_ticket;
            
            header('Location: /tickets');
            exit;
        }
    } else {
        // If POST route not found, redirect to home
        header('Location: /');
        exit;
    }
} else {
    // Handle GET routes with pattern matching
    if ($request_uri === '/' || $request_uri === '/index.php') {
        // Render the main landing page
        echo $twig->render('index.twig', [
            'title' => 'Dennis Ticket Management App',
        ]);
    } elseif ($request_uri === '/auth/login') {
        echo $twig->render('auth/login.twig', [
            'title' => 'Login - Ticket Management App',
        ]);
    } elseif ($request_uri === '/auth/signup') {
        echo $twig->render('auth/signup.twig', [
            'title' => 'Sign Up - Ticket Management App',
        ]);
    } elseif ($request_uri === '/dashboard') {
        if (!is_authenticated()) {
            header('Location: /auth/login');
            exit;
        }
        echo $twig->render('dashboard.twig', [
            'title' => 'Dashboard - Ticket Management App',
            'user' => get_logged_in_user()
        ]);
    } elseif ($request_uri === '/tickets') {
        if (!is_authenticated()) {
            header('Location: /auth/login');
            exit;
        }
        
        $current_user = get_logged_in_user();
        $user_tickets = array_filter($tickets, function($ticket) use ($current_user) {
            return $ticket['userId'] == $current_user['id'];
        });
        
        $stats = get_ticket_stats($current_user['id']);
        
        echo $twig->render('tickets/list.twig', [
            'title' => 'My Tickets - Ticket Management App',
            'user' => $current_user,
            'tickets' => array_values($user_tickets),
            'stats' => $stats
        ]);
    } elseif ($request_uri === '/tickets/create') {
        if (!is_authenticated()) {
            header('Location: /auth/login');
            exit;
        }
        echo $twig->render('tickets/create.twig', [
            'title' => 'Create Ticket - Ticket Management App',
            'user' => get_logged_in_user()
        ]);
    } elseif (preg_match('/^\/tickets\/edit\/(\d+)$/', $request_uri, $matches)) {
        if (!is_authenticated()) {
            header('Location: /auth/login');
            exit;
        }
        
        $ticket_id = $matches[1];
        $current_user = get_logged_in_user();
        
        // Find the ticket
        $ticket = null;
        foreach ($tickets as $t) {
            if ($t['id'] == $ticket_id && $t['userId'] == $current_user['id']) {
                $ticket = $t;
                break;
            }
        }
        
        if (!$ticket) {
            // Ticket not found or not owned by user
            header('Location: /tickets');
            exit;
        }
        
        echo $twig->render('tickets/edit.twig', [
            'title' => 'Edit Ticket - Ticket Management App',
            'user' => $current_user,
            'ticket' => $ticket
        ]);
    } elseif ($request_uri === '/auth/logout') {
        session_destroy();
        header('Location: /');
        exit;
    } else {
        // If route not found, show the main landing page
        echo $twig->render('index.twig', [
            'title' => 'Dennis Ticket Management App',
        ]);
    }
}