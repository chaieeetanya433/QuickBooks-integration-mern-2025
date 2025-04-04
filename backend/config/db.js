const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB connected");

        // Handle index cleanup after connection
        mongoose.connection.once('open', async () => {
            try {
                // Check if index exists before trying to drop it
                const indexes = await mongoose.connection.collection('chartofaccounts').indexes();
                const hasQboIdIndex = indexes.some(index => index.name === 'qboId_1');

                if (hasQboIdIndex) {
                    await mongoose.connection.collection('chartofaccounts').dropIndex('qboId_1');
                    console.log("Successfully dropped outdated qboId_1 index");
                }
            } catch (err) {
                console.warn("Warning - issue with indexes:", err.message);
            }
        });
    } catch (err) {
        console.error("Fatal MongoDB connection error:", err);
        process.exit(1); // Exit application if DB connection fails
    }
};

module.exports = { connectDB };