const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUsers = async (email, password, done) => {
        const user = getUserByEmail(email);
        if (user == null) {
            return done(null, false, { message: "No user found with that email" });
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Password Incorrect" });
            }
        } catch (e) {
            console.log(e);
            return done(e);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUsers));

    passport.serializeUser((user, done) => {
        const logMessage = `Serializing user: ${JSON.stringify(user)}\n`;
        updateUserLog(user.email, logMessage, true);
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        const user = getUserById(id);
        const logMessage = `Deserializing user with ID: ${id}\n`;
        done(null, user);
    });

    const fs = require('fs');
const path = require('path');

let lastLogUpdateTime = 0; // Timestamp

function updateUserLog(email, message, isSuccessful) {
    try {
        // 1 second delay for the correct log
        const currentTime = Date.now();
        if (currentTime - lastLogUpdateTime < 1000) { // 1000ms = 1
            console.log("Waiting for 1 second before updating the log again...");
            return;
        }

        lastLogUpdateTime = currentTime;

        const logFilePath = path.join(__dirname, 'user-logs', `${email}.log`);
    
        if (!fs.existsSync(path.join(__dirname, 'user-logs'))) {
            fs.mkdirSync(path.join(__dirname, 'user-logs'));
        }
    
        let successfulLogins = 0;
        let unsuccessfulLogins = 0;
        let successfulTimes = [];
        let unsuccessfulTimes = [];
    
        if (fs.existsSync(logFilePath)) {
            const logData = fs.readFileSync(logFilePath, 'utf-8');
            const successMatch = logData.match(/Successful Logins: (\d+)/);
            const unsuccessfulMatch = logData.match(/Unsuccessful Logins: (\d+)/);
            const successTimesMatch = logData.match(/Successful Times: \[(.*?)\]/);
            const unsuccessfulTimesMatch = logData.match(/Unsuccessful Times: \[(.*?)\]/);
    
            if (successMatch) successfulLogins = parseInt(successMatch[1], 10);
            if (unsuccessfulMatch) unsuccessfulLogins = parseInt(unsuccessfulMatch[1], 10);
            if (successTimesMatch) successfulTimes = JSON.parse(`[${successTimesMatch[1]}]`);
            if (unsuccessfulTimesMatch) unsuccessfulTimes = JSON.parse(`[${unsuccessfulTimesMatch[1]}]`);
        }
    
        const currentDate = new Date().toISOString();
        if (isSuccessful) {
            successfulLogins += 1;
            successfulTimes.push(currentDate);
        } else {
            unsuccessfulLogins += 1;
            unsuccessfulTimes.push(currentDate);
        }
    
        const newLogContent = `
        Email: ${email}
        Successful Logins: ${successfulLogins}
        Successful Times: ${JSON.stringify(successfulTimes)}
        Unsuccessful Logins: ${unsuccessfulLogins}
        Unsuccessful Times: ${JSON.stringify(unsuccessfulTimes)}
        Last Activity: ${message.trim()}
        `.trim();
    
        // Overwrite the file
        fs.writeFileSync(logFilePath, newLogContent);
    
        console.log(`Log updated for user ${email}.`);
    } catch (err) {
        console.error(`Error updating log file for user ${email}:`, err);
    }
}

    
}

module.exports = initialize;
