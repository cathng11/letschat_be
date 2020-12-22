var db=require('./DB');
var express=require('express');
var router=express.Router();

var conn=db.con;

router.route('').post((req,res)=>
{
    console.log('/api/listGroup called!!!!');
    const username=req.body.data[0];
    var txtSearch = req.body.data[1];
    // var sql = "SELECT tbl_chatroom.*,tbl_messages.Message,tbl_user.Firstname"
    //   + " FROM tbl_chatroom"
    //   + " INNER JOIN tbl_participants ON tbl_participants.ID_Room=tbl_chatroom.ID_Room"
    //   + " INNER JOIN tbl_messages ON tbl_messages.ID_Room=tbl_participants.ID_Room"
    //   + " INNER JOIN tbl_user ON tbl_user.Username=tbl_messages.ID_Sender"
    //   + " WHERE tbl_participants.Username='"+username+"' AND tbl_chatroom.IsGroupChat=0"
    //   + " AND tbl_messages.IsLatestMes=0 "
    //   + ` AND tbl_chatroom.NameRoom like '%${txtSearch}%'`;
    var sql = " SELECT tbl_chatroom.*, "
    +" CASE WHEN EXISTS (SELECT * FROM tbl_messages "
    +                " WHERE tbl_messages.ID_Room = tbl_chatroom.ID_Room)"
    +    " THEN 	(SELECT tbl_messages.Message FROM tbl_messages "
    +                " WHERE tbl_messages.ID_Room = tbl_chatroom.ID_Room AND tbl_messages.IsLatestMes = 0)"
    +    " ELSE 'Say Hi to everyone'"
    +" END as Message,"
    +" CASE WHEN EXISTS (SELECT * FROM tbl_messages "
    +                " WHERE tbl_messages.ID_Room = tbl_chatroom.ID_Room)"
    +    " THEN 	(SELECT tbl_messages.ID_Sender FROM tbl_messages "
    +                " WHERE tbl_messages.ID_Room = tbl_chatroom.ID_Room AND tbl_messages.IsLatestMes = 0)"
    +    " ELSE ''"
    +" END as ID_Sender,"
    +" CASE WHEN EXISTS (SELECT * FROM tbl_messages "
    +                " WHERE tbl_messages.ID_Room = tbl_chatroom.ID_Room)"
    +    " THEN 		(SELECT tbl_user.Firstname FROM tbl_user"
    +               " JOIN tbl_messages ON tbl_messages.ID_Sender = tbl_user.Username"
    +                " WHERE tbl_messages.ID_Room = tbl_chatroom.ID_Room AND tbl_messages.IsLatestMes = 0)"
    +    " ELSE 'Someone'"
    +" END as Firstname"
    +" FROM tbl_chatroom"
    +" INNER JOIN tbl_participants ON tbl_participants.ID_Room=tbl_chatroom.ID_Room"
    +` WHERE tbl_participants.Username='${username}' AND tbl_chatroom.IsGroupChat=0`
    +` AND tbl_chatroom.NameRoom like '%${txtSearch}%'`;
    conn.query(sql, function (err, results) {
      if (err) throw err;
      var string = JSON.parse(JSON.stringify(results));
      for (var index in string) {
        string[index].Avatar.data = (new Buffer.from(string[index].Avatar.data)).toString('base64');
      }
      res.send(string);
    });
})

router.route('/info').post((req,res)=>
{
    console.log('/api/listGroup/info called!!!!');
    const info = req.body.info;
    var sql = "SELECT * FROM tbl_user WHERE tbl_user.Username IN (SELECT tbl_participants.Username FROM tbl_participants WHERE tbl_participants.ID_Room='"
      + info + "')";
    conn.query(sql, function (err, results) {
      if (err) throw err;
      var string = JSON.parse(JSON.stringify(results));
      for (var index in string) {
        string[index].Avatar.data = (new Buffer.from(string[index].Avatar.data)).toString('base64');
      }
      res.send(string);
    });
})

module.exports=router;