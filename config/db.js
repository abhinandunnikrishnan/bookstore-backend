const mongoose = require("mongoose");

const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4",
    "1.1.1.1"
]);

const connectionString = process.env.DBCONNECTIONSTRING;

mongoose.connect(connectionString)
    .then(() => {
        console.log("database connection successful");
    })
    .catch((error) => {
        console.log("database connection failed");
        console.log(error);
    });