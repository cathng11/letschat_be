var db=require('./DB');
const express=require('express');
let router=express.Router();
const bcrypt = require('bcryptjs');

var conn=db.con;

router.route('')
.post((req,res)=>
{
    console.log('/api/register called!!!!');
    const user = req.body.user;
    const salt = bcrypt.genSaltSync(10)
    const hashPassword = bcrypt.hashSync(user.pass, salt);
    var usersql = "SELECT * FROM tbl_user WHERE Username='" + user.username + "'";
    conn.query(usersql, function (err, results) 
    {
      if (err) throw err;
      var existUser = JSON.parse(JSON.stringify(results));
      if (Object.keys(existUser).length==0) 
      {
        var phonesql = "SELECT * FROM tbl_user WHERE Phone='" + user.phone + "'";
        conn.query(phonesql, function (err, results) 
        {
          if (err) throw err;
          var existPhone = JSON.parse(JSON.stringify(results));
          if (Object.keys(existPhone).length==0) {
            var register = "INSERT INTO tbl_user VALUES ('"
              + user.username + "','" + hashPassword + "','','','','" + user.phone + "','','','','','')";
            conn.query(register, function (err, results) {
              if (err) throw err;
              if(results.affectedRows)
                res.send({result: "Register successfully"});
              else
                res.send({result: "Cannot register new account!"})
            });
          }
          else {
            res.send({result:"Existing phone"});
          }
        })
      } else {
        res.send({result:"Existing username"});
      }
  
    });
})

module.exports=router;