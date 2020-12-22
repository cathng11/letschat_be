const express = require('express');
var mysql = require('mysql');
const dbRoute = express.Router();

var con = mysql.createConnection({
  host: 'sql12.freemysqlhosting.net',
  user: 'sql12383475',
  password: '2ufy78fXcA',
  database: 'sql12383475',
  dateStrings: true,
  charset : 'utf8mb4'
});
con.connect(function (err) {
    if (err) throw err.stack;
    console.log('Connect to MySql successfully!');
  });
module.exports = {dbRoute, con};