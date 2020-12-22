const express = require('express');
var mysql = require('mysql');
const dbRoute = express.Router();

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chat',
    dateStrings: true,
    charset : 'utf8mb4'
});
con.connect(function (err) {
    if (err) throw err.stack;
    console.log('Connect to MySql successfully!');
  });
module.exports = {dbRoute, con};