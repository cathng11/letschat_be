var db = require('./DB.js');
const express = require('express');
const messages = express.Router();

var con = db.con;

messages.route('').post((req, res) => {
    console.log('api/messages called!!!!');
    con.connect(function (err) {
        var sql = `select * from tbl_messages where ID_Room = '${req.body.idRoom}' order by TimeSend`;
        con.query(sql, function (err, results) {
            if (results) res.json(results);
            else res.json(null);
        })
    });
});

messages.route('/add').post((req, res) => {
    console.log('api/messages/add called!!!!');
    var random_id = Math.floor((1+Math.random())*0x10000).toString(16).substring(1);
    con.connect(function (err) {
        var sqlLastestMess = `update tbl_messages set IsLatestMes=1 where ID_Room = '${req.body.idRoom}' and IsLatestMes=0`;
        con.query(sqlLastestMess);
        var sqlInsert = `insert into tbl_messages values ('${random_id}' , '${req.body.username}', '${req.body.idRoom}', '${req.body.message}', '${req.body.time}', 0)`;
        con.query(sqlInsert);
    });
});

module.exports = messages;