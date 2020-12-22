var db=require('./DB');
const express=require('express');
const router=express.Router();

var conn=db.con;

router.route('').post((req,res)=>
{
    console.log('/api/listMessages called!!!!');
    var username = req.body.data[0];
    var txtSearch = req.body.data[1];
    var sql = "SELECT tbl_user.*, tbl_chatroom.ID_Room, tbl_onlineuser.Time_Online, tbl_onlineuser.Time_Offline, tbl_messages.Message, tbl_messages.ID_Sender"
    + " FROM tbl_user"
    + " INNER JOIN tbl_onlineuser ON tbl_user.Username=tbl_onlineuser.Username"
    + " INNER JOIN tbl_participants ON tbl_participants.Username=tbl_user.Username"
    + " INNER JOIN tbl_messages ON tbl_messages.ID_Room=tbl_participants.ID_Room"
    + " INNER JOIN tbl_chatroom ON tbl_messages.ID_Room=tbl_chatroom.ID_Room"
    + ` WHERE tbl_user.Firstname like '%${txtSearch}%' and tbl_user.Username IN (SELECT tbl_participants.Username`
    + " FROM tbl_participants"
    + " WHERE tbl_participants.ID_Room"
    + " IN ( SELECT tbl_chatroom.ID_Room"
    + " FROM tbl_chatroom"
    + " INNER JOIN tbl_participants ON tbl_participants.ID_Room=tbl_chatroom.ID_Room"
    + ` WHERE tbl_participants.Username='${username}'`
    + " AND tbl_chatroom.IsGroupChat=1 ) "
    + ` AND NOT tbl_participants.Username='${username}')`
    + " AND tbl_chatroom.ID_Room IN (SELECT tbl_chatroom.ID_Room"
    + " FROM tbl_chatroom "
    + " INNER JOIN tbl_participants ON tbl_participants.ID_Room=tbl_chatroom.ID_Room "
    + " WHERE tbl_chatroom.ID_Room "
    + " IN (SELECT tbl_chatroom.ID_Room "
    + " FROM tbl_chatroom"
    + " INNER JOIN tbl_participants ON tbl_participants.ID_Room=tbl_chatroom.ID_Room "
    + ` WHERE tbl_participants.Username='${username}' `
    + " AND tbl_chatroom.IsGroupChat=1) "
    + " AND tbl_participants.Username IN (SELECT tbl_participants.Username "
    + " FROM tbl_participants"
    + " WHERE tbl_participants.ID_Room"
    + " IN ( SELECT tbl_chatroom.ID_Room"
    + " FROM tbl_chatroom"
    + " INNER JOIN tbl_participants ON tbl_participants.ID_Room=tbl_chatroom.ID_Room"
    + ` WHERE tbl_participants.Username='${username}'`
    + " AND tbl_chatroom.IsGroupChat=1 ) "
    + ` AND NOT tbl_participants.Username='${username}'))`
    + " AND tbl_messages.IsLatestMes=0 ORDER BY tbl_messages.TimeSend DESC";
  
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