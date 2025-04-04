require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes.js");
const accountsRoutes = require("./routes/accountsRoutes.js");
const payeesRoutes = require("./routes/payeesRoutes.js");
const transactionsRoutes = require("./routes/transactionsRoutes.js");
const syncRoutes = require("./routes/syncRoutes.js");

const { connectDB } = require("./config/db.js");
const errorHandler = require("./middleware/errorHandler.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: `${process.env.CLIENT_URL}`, 
    credentials: true, 
    methods: 'GET,POST,PUT,DELETE'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Global error handler middleware
app.use(errorHandler);

connectDB();

// Routes
app.get("/", (req, res) => {
    res.send("QuickBooks Integration API - Please visit /auth to start OAuth flow");
});

// Initiate OAuth flow
app.use("/auth", authRoutes);
app.use("/sync/chart-of-accounts", accountsRoutes);
app.use("/sync/payees", payeesRoutes);
app.use("/sync/transactions", transactionsRoutes);
app.use("/sync", syncRoutes);

// Error handling for non-existent routes
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;