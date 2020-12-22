var router = require('express').Router();
var conn = require('./DB').con;
const bcrypt = require('bcryptjs');

router.route('/update')
    .post((req, res) => {
        console.log('api/user/update called!!!!');
        const user = req.body.user;
        var bitmap = Buffer.from(req.body.user.Avatar, 'base64');
        var bitmap_hex = bitmap.toString('hex')===''?'':(",Avatar=0x"+bitmap.toString('hex'));
        conn.connect(function (err) {
            var sql = "UPDATE tbl_user SET Firstname='" + user.Firstname + "',Lastname='" + user.Lastname
                + "',DateOfBirth='" + user.DateOfBirth + "',Phone='" + user.Phone + "',Email='" + user.Email
                + "',Address='" + user.Address + "',City='" + user.City
                + "'" + bitmap_hex + ",Gender=" + user.Gender + " WHERE Username='" + user.Username + "'";
            conn.query(sql, function (err, results) {
                if (err) throw err;
                if (results.affectedRows)
                    res.send({ result: "Update profile successfully!" });
                else
                    res.send({ result: "Cannot update profile" });
            })
        });
    })

router.route('/updatePass')
    .post((req, res) => {
        console.log('api/user/updatePass called!!!!');
        //var sql = "SELECT * FROM tbl_user WHERE Username='" + req.body.username + "' AND Password='" + req.body.oldpass + "'";
        var sql = "SELECT * FROM tbl_user WHERE Username='" + req.body.username + "'";
        conn.query(sql, function (err, results) {
            // if (!results[0]) res.json({ result: "Old password is incorrect" });
            // else {
            //     var sqlupdate = "UPDATE tbl_user SET Password='" + req.body.newpass + "' WHERE Username='" + req.body.username + "'";
            //     console.log(sqlupdate);
            //     conn.query(sqlupdate, function (err, resultUp) {
            //         if (err) throw err;
            //         if (resultUp.affectedRows)
            //             res.send({ result: "Change password successfully!" });
            //         else
            //             res.send({ result: "Cannot change password" });
            //     });
            // }
            if (results[0]) {
                var string = JSON.parse(JSON.stringify(results));   
                bcrypt.compare(req.body.oldpass, string[0].Password).then(re => {
                    if (re) {
                        const salt = bcrypt.genSaltSync(10);
                        const hash = bcrypt.hashSync(req.body.newpass, salt);
                        var sqlupdate = "UPDATE tbl_user SET Password='" + hash + "' WHERE Username='" + req.body.username + "'";
                        conn.query(sqlupdate, function (error, resultUp) {
                            if (error) throw error;
                            if (resultUp.affectedRows)
                                res.send({ result: "Change password successfully!" });
                            else
                                res.send({ result: "Cannot change password" });
                        });
                    }
                    else res.json({ result: "Old password is incorrect" });
                });
            }
        });
    })

router.route('/search')
    .post((req, res) => {
        console.log('api/user/search called!!!!');
        var sql = "SELECT * FROM tbl_user WHERE Phone='" + req.body.phone + "'";
        conn.query(sql, function (err, results) {
            if (err) throw err;
            if (Object.keys(results).length !== 0) {
                var string = JSON.parse(JSON.stringify(results[0]));
                string.Avatar.data = (new Buffer.from(string.Avatar.data)).toString('base64');

                res.send({ string, result: "Phone number is existing" });
            }
            else {
                var string = 0;
                res.send({ string, result: "Phone number does not exist" })
            }

        });
    })
module.exports = router;