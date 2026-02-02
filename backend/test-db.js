require('dotenv').config();
const mysql = require('mysql2');

// Manual configuration for testing - EDIT THESE IF NEEDED
const config = {
    host: 'mysql.us.stackcp.com', // The hostname you are using
    user: 'admin-da97',            // The user you created
    password: 'database1997',      // The password you set
    database: 'media-portal-353039365d6d',
    port: 41992,
    ssl: { rejectUnauthorized: false }, // Try with/without this if it fails
    connectTimeout: 10000
};

console.log('Testing connection to:', config.host);
console.log('User:', config.user);
console.log('Port:', config.port);

const connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.error('❌ Connection Failed!');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        console.error('Stack:', err.stack);
    } else {
        console.log('✅ Connection SUCCESSFUL!');
        console.log('You can connect from this computer.');
        connection.end();
    }
});
