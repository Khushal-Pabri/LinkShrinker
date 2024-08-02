const mongoose = require('mongoose');
require('dotenv').config()
mongoose.connect(process.env.MONGO_URI)

const connectToDatabase = async () => {
    let retries = 3;
    const delay = 5000;

    while (retries > 0) {
        try {
            await mongoose.connect(process.env.MONGO_URI)
            return;
        } catch (error) {
            console.error('Mongoose connection error:', error);
            retries -= 1;
            if (retries === 0) {
                console.error('Failed to connect to the database after multiple attempts.');
                process.exit(1);
            }
            console.log(`Retrying connection in ${delay / 1000} seconds...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

connectToDatabase();

const db = mongoose.connection;

db.on('connected', () => {
  console.log('Mongoose connected to the database');
});

db.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

db.on('disconnected', () => {
  console.log('Mongoose disconnected from the database');
});