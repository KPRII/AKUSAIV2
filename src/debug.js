require('dotenv').config();
console.log('Environment variables:', {
    token: process.env.token,
    clientId: process.env.clientId
});
