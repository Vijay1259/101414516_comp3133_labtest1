const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Signup Route (Hash Password Before Saving)
router.post('/signup', async (req, res) => {
    const { username, firstname, lastname, password } = req.body;

    try {
        // Validate input
        if (!username || !firstname || !lastname || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

    
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with hashed password
        const user = new User({
            username,
            firstname,
            lastname,
            password: hashedPassword 
        });

        
        await user.save();
        res.json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Signup Error:", err); 
        res.status(500).json({ error: "Server error. Please try again." }); 
    }
});

// Login Route (Without JWT)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log(" Checking username:", username);

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            console.log(" User not found!");
            return res.status(400).json({ error: "Invalid credentials" });
        }

        console.log(" User found in DB:", user);

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔍 Password match result:", isMatch);

        if (!isMatch) {
            console.log(" Password does not match!");
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Login successful
        res.json({ message: "Login successful" }); 
    } catch (err) {
        console.error("Login Error:", err); 
        res.status(500).json({ error: "Server error. Please try again." });
    }
});

module.exports = router;
