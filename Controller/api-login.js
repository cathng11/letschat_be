var db = require('./DB.js');
const express = require('express');
const login = express.Router();
const bcrypt = require('bcryptjs');

var con = db.con;

login.route('').post((req, res) => {
    console.log('api/login called!!!!');
    con.connect(function (err) {
        if (req.body.check === 'logged-in') {
            var sql = `select * from tbl_user where Username = '${req.body.username}' and Password = '${req.body.password}'`;
            con.query(sql, function (error, results) {
                if (results[0]) {
                    var sqlOnline = `update tbl_onlineuser set Time_Offline = NULL, Time_Online = '${req.body.timeOnline}' where Username = '${req.body.username}'`;
                    con.query(sqlOnline);
                    res.json(results[0]);
                }
                else res.json(null);
            });
        }
        else {
            sql = `select * from tbl_user where Username = '${req.body.username}'`;
            con.query(sql, function(error, results) {
                if (results[0]) {
                    var string = JSON.parse(JSON.stringify(results));
                    bcrypt.compare(req.body.password, string[0].Password).then(re => {
                        if (re) {
                            var sqlOnline = `update tbl_onlineuser set Time_Offline = NULL, Time_Online = '${req.body.timeOnline}' where Username = '${req.body.username}'`;
                            con.query(sqlOnline);
                            res.json(results[0]);
                        } 
                        else res.json(null);
                    });
                }
                else res.json(null);
            });
        }
    });
});

login.route('/logout').post((req, res) => {
    console.log('api/login/logout called!!!!');
    con.connect(function (err) {
        var sql = `update tbl_onlineuser set Time_Offline = '${req.body.time}' where Username = '${req.body.username}'`;
        con.query(sql);
    });
});

module.exports = login;