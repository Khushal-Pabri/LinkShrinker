const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://khushal:Khush%4015@cluster0.jjdko6m.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0');

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