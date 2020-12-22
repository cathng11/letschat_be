const express = require('express');
var mysql = require('mysql');
const dbRoute = express.Router();

var con = mysql.createConnection({
  host: 'freedb.tech',
  port:3306,
  user: 'freedbtech_cathng11',
  password: 'nguyenhavinh',
  database: 'freedbtech_letschat',
  dateStrings: true,
  charset : 'utf8mb4'
});
con.connect(function (err) {
    if (err) throw err.stack;
    console.log('Connect to MySql successfully!');
  });
module.exports = {dbRoute, con};