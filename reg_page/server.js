const express = require("express");
const passport = require("passport");
const session = require("express-session");
const flash = require("express-flash");
const bcrypt = require("bcrypt");
const initializePassport = require("./passport-config");
const methodOverride = require("method-override");
const fs = require("fs");

const app = express();

function loadUsers() {
    const data = fs.readFileSync("users.json", "utf8");
    return JSON.parse(data);
}

function saveUsers(users) {
    const data = JSON.stringify(users, null, 2);
    fs.writeFileSync("users.json", data, "utf8");
}

let users = loadUsers();

initializePassport(passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}), (req, res) => {
    if (req.user) {
        // Successful login
        const logMessage = `${new Date().toISOString()} - User ${req.user.email} logged in successfully.`;
        updateUserLog(req.user.email, logMessage, true);
    } else {
        // Failed login
        const logMessage = `${new Date().toISOString()} - Failed login attempt for ${req.body.email}.`;
        updateUserLog(req.body.email, logMessage, false);
    }
});


app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        const passwordValidation = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordValidation.test(password)) {
            return res.status(400).send("Password must be at least 8 characters long, contain a mix of uppercase and lowercase letters, a number, and a special character.");
        }

        if (password !== confirmPassword) {
            return res.status(400).send("Passwords do not match.");
        }

        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).send("Email is already registered.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: hashedPassword,
        };

        users.push(newUser);
        saveUsers(users);

        console.log(users); // Display in the console
        res.redirect("/login");

    } catch (e) {
        console.log(e);
        res.redirect("/register");
    }
});

app.post("/logout", (req, res) => {
    req.session.isLoggingOut = true;  // Set flag for logout
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');  // Redirect after logout
    });
});


app.get("/check-email", (req, res) => {
    const email = req.query.email;
    const users = loadUsers();
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        res.json({ exists: true });
    } else {
        res.json({ exists: false });
    }
});


app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs");
});

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs");
});

app.get('/', checkAuthenticated, (req, res) => {
    res.render("index.ejs", { name: req.user.name });
});

app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    next();
}

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
