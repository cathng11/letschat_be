const express = require('express');
var mysql = require('mysql');
const dbRoute = express.Router();

var con = mysql.createConnection({
  host: 'db4free.net',
  port:3306,
  user: 'cathng11',
  password: 'nguyenhavinh',
  database: 'letschatpbl',
  dateStrings: true,
  charset : 'utf8mb4'
});
con.connect(function (err) {
    if (err) throw err.stack;
    console.log('Connect to MySql successfully!');
  });
module.exports = {dbRoute, con};