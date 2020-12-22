var db = require('./DB');
const express = require('express');
const router = express.Router();

var conn = db.con;

router.route('').post((req, res) => {
  console.log('/api/contact called!!!!');
  var username = req.body.data[0];
  var txtSearch = req.body.data[1];
  var sql = "SELECT chat.ID_Room, friend.*, onl.Time_Online, onl.Time_Offline from tbl_chatroom as chat "
    + "JOIN tbl_participants as part on chat.ID_Room = part.ID_Room "
    + "JOIN  ((SELECT tbl_user.* FROM tbl_user "
    + "      JOIN tbl_friend on tbl_user.Username = tbl_friend.ID_Receiver "
    + `       WHERE tbl_friend.IsFriend = 0 and tbl_friend.ID_Sender = '${username}') `
    + "         UNION "
    + "      (SELECT tbl_user.* FROM tbl_user "
    + "       JOIN tbl_friend on tbl_user.Username = tbl_friend.ID_Sender "
    + `       WHERE tbl_friend.IsFriend = 0 and tbl_friend.ID_Receiver = '${username}')) as friend `
    + " on part.Username = friend.Username "
    + " JOIN tbl_onlineuser as onl on onl.Username = friend.Username "
    + ` WHERE friend.Firstname like '%${txtSearch}%' and chat.IsGroupChat = 1 and EXISTS `
    + ` (SELECT * FROM tbl_participants where tbl_participants.ID_Room = part.ID_Room and tbl_participants.Username = '${username}')`;
  conn.query(sql, function (err, results) {
    if (err) throw err;
    var string = JSON.parse(JSON.stringify(results));
    for (var index in string) {
      string[index].Avatar.data = (new Buffer.from(string[index].Avatar.data)).toString('base64');
    }
    res.send(string);
  });
})

module.exports = router;