var db = require('./DB.js');
const express = require('express');
const noti = express.Router();

var con = db.con;

noti.route('').post((req, res) => {
    console.log('api/notifications called!!!!');
    con.connect(function (err) {
        var sql = ` SELECT tbl_friend.*, tbl_user.Firstname, tbl_user.Lastname FROM tbl_friend ` 
                + " JOIN tbl_user on tbl_user.Username = tbl_friend.ID_Sender "
                + ` WHERE ID_Receiver = '${req.body.username}' AND IsFriend = 1 `
                + " UNION "
                + ` SELECT tbl_friend.*, tbl_user.Firstname, tbl_user.Lastname FROM tbl_friend `
                + " JOIN tbl_user on tbl_user.Username = tbl_friend.ID_Receiver "
                + `WHERE ID_Sender = '${req.body.username}' AND IsRead = 1 AND IsFriend = 0`;
        con.query(sql, function (err, results) {
            if (results) res.json(results);
            else res.json(null);
        })
    });
});

noti.route('/read').post((req, res) => {
    console.log('api/notifications/read called!!!!');
    con.connect(function (err) {
        var sql = `update tbl_friend set IsRead = 0 where ID_Sender = '${req.body.username}' and IsRead = 1`;
        con.query(sql);
    });
});

module.exports = noti;