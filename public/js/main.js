// Function to handle password visibility toggle
function togglePasswordVisibility(fieldId) {
  const passwordField = document.getElementById(fieldId);
  const eyeIcon = passwordField.parentElement.querySelector('.eye-icon');
  const eyeSlashIcon = passwordField.parentElement.querySelector('.eye-slash-icon');
  
  if (passwordField.type === 'password') {
    passwordField.type = 'text';
    eyeIcon.classList.add('hidden');
    eyeSlashIcon.classList.remove('hidden');
  } else {
    passwordField.type = 'password';
    eyeIcon.classList.remove('hidden');
    eyeSlashIcon.classList.add('hidden');
  }
}

// Form validation for auth forms
function validateAuthForms() {
  // Login form validation
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      let isValid = true;
      let errorMessages = [];

      // Clear previous errors
      document.querySelectorAll('.error-message').forEach(el => el.remove());
      document.querySelectorAll('.input-field').forEach(el => el.classList.remove('error'));

      // Validate email
      if (!email) {
        errorMessages.push('Email is required');
        document.getElementById('email').classList.add('error');
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errorMessages.push('Email address is invalid');
        document.getElementById('email').classList.add('error');
        isValid = false;
      }

      // Validate password
      if (!password) {
        errorMessages.push('Password is required');
        document.getElementById('password').classList.add('error');
        isValid = false;
      } else if (password.length < 6) {
        errorMessages.push('Password must be at least 6 characters');
        document.getElementById('password').classList.add('error');
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();
        
        // Reset button state if validation fails
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
          loginBtn.textContent = 'Sign In';
          loginBtn.disabled = false;
        }
        
        // Display error messages
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errorMessages[0]; // Show first error
        const formContainer = document.querySelector('.login-form-wrapper');
        formContainer.insertBefore(errorDiv, formContainer.firstChild);
      }
    });
  }

  // Signup form validation
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const confirmPassword = document.getElementById('confirmPassword').value.trim();
      let isValid = true;
      let errorMessages = [];

      // Clear previous errors
      document.querySelectorAll('.error-message').forEach(el => el.remove());
      document.querySelectorAll('.input-field').forEach(el => el.classList.remove('error'));

      // Validate name
      if (!name) {
        errorMessages.push('Name is required');
        document.getElementById('name').classList.add('error');
        isValid = false;
      }

      // Validate email
      if (!email) {
        errorMessages.push('Email is required');
        document.getElementById('email').classList.add('error');
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errorMessages.push('Email address is invalid');
        document.getElementById('email').classList.add('error');
        isValid = false;
      }

      // Validate password
      if (!password) {
        errorMessages.push('Password is required');
        document.getElementById('password').classList.add('error');
        isValid = false;
      } else if (password.length < 6) {
        errorMessages.push('Password must be at least 6 characters');
        document.getElementById('password').classList.add('error');
        isValid = false;
      }

      // Validate confirm password
      if (!confirmPassword) {
        errorMessages.push('Please confirm your password');
        document.getElementById('confirmPassword').classList.add('error');
        isValid = false;
      } else if (password !== confirmPassword) {
        errorMessages.push('Passwords do not match');
        document.getElementById('confirmPassword').classList.add('error');
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();
        
        // Reset button state if validation fails
        const signupBtn = document.getElementById('signupBtn');
        if (signupBtn) {
          signupBtn.textContent = 'Sign Up';
          signupBtn.disabled = false;
        }
        
        // Display error messages
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errorMessages[0]; // Show first error
        const formContainer = document.querySelector('.auth-card');
        formContainer.insertBefore(errorDiv, formContainer.firstChild);
      }
    });
  }
}

// Initialize form validation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  validateAuthForms();
});

// Function to handle ticket deletion
let ticketToDelete = null;

// Function to show delete confirmation modal
function showDeleteModal(ticketId, ticketTitle) {
  ticketToDelete = ticketId;
  document.getElementById('ticketTitle').textContent = ticketTitle;
  document.getElementById('deleteModal').style.display = 'flex';
}

// Function to cancel deletion
function cancelDelete() {
  document.getElementById('deleteModal').style.display = 'none';
  ticketToDelete = null;
}

// Confirm deletion
if (document.getElementById('confirmDeleteBtn')) {
  document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    if (ticketToDelete) {
      fetch(`/tickets/delete/${ticketToDelete}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Remove the ticket element from the page
          document.querySelector(`[data-ticket-id="${ticketToDelete}"]`).closest('.ticket-card').remove();
          cancelDelete();
        } else {
          alert('Error deleting ticket');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error deleting ticket');
      });
    }
  });
}

// Add event listeners to all delete buttons (if on the tickets list page)
document.querySelectorAll('.delete-ticket-btn').forEach(button => {
  button.addEventListener('click', function() {
    const ticketId = this.getAttribute('data-ticket-id');
    const ticketTitle = this.getAttribute('data-ticket-title');
    showDeleteModal(ticketId, ticketTitle);
  });
});

// Add event listeners to all edit buttons (if on the tickets list page)
document.querySelectorAll('.edit-ticket-btn').forEach(button => {
  button.addEventListener('click', function() {
    const ticketId = this.getAttribute('data-ticket-id');
    const ticketTitle = this.getAttribute('data-ticket-title');
    const ticketDescription = this.getAttribute('data-ticket-description');
    const ticketStatus = this.getAttribute('data-ticket-status');
    const ticketPriority = this.getAttribute('data-ticket-priority');
    
    // Fill in the form fields with the ticket data
    document.getElementById('title').value = ticketTitle;
    document.getElementById('description').value = ticketDescription;
    document.getElementById('status').value = ticketStatus;
    document.getElementById('priority').value = ticketPriority;
    
    // Change form action to update endpoint
    const form = document.querySelector('.ticket-form');
    form.action = `/tickets/edit/${ticketId}`;
    form.method = 'POST';
    
    // Change submit button text
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Update Ticket';
    
    // Add a cancel button if it doesn't exist
    if (!form.querySelector('.cancel-edit-btn')) {
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'btn btn-secondary cancel-edit-btn';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.onclick = resetForm;
      const formActions = form.querySelector('.form-actions');
      formActions.insertBefore(cancelBtn, submitButton);
    }
  });
});

// Function to reset the form to create mode
function resetForm() {
  // Reset form fields
  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('status').value = 'open';
  document.getElementById('priority').value = 'medium';
  
  // Change form back to create action
  const form = document.querySelector('.ticket-form');
  form.action = '/tickets/create';
  form.method = 'POST';
  
  // Reset button text
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.textContent = 'Create Ticket';
  
  // Remove cancel button
  const cancelBtn = form.querySelector('.cancel-edit-btn');
  if (cancelBtn) {
    cancelBtn.remove();
  }
}