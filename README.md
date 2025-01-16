# User Registration and Authentication

This project is a fully working user registration and authentication system built with a hand-written backend and a frontend based on Bootstrap.

## Features
- **User Registration**: Users can register with an email and password.
- **Login/Logout**: Users can log in and log out securely.
- **Email & Password Validation**: The backend checks the validity of the email and password during registration and login.
- **Password Encryption**: Passwords are securely hashed before being stored in the database.
- **User Log Page**: A page to display the logged-in user's data.
- **Database**: A simple user database that stores user information and encrypted passwords.

## Technologies Used
- **Frontend**: Bootstrap for styling.
- **Backend**: Node.js with hand-written code to manage authentication and database operations.
- **Password Hashing**: Use of a secure hashing algorithm for password encryption (e.g., bcrypt).

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/project-name.git
   ```

2. Install dependencies:
   - Before running the server, you'll need to install `express` and other dependencies by running:
     ```bash
     cd project-name
     npm install express
     ```

3. Run the server:
   ```bash
   node server.js
   ```

4. Access the registration page and begin using the system.
