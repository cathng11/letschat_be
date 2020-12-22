var router = require('express').Router();
var conn = require('./DB').con

router.route('')
    .post((req, res) => {
        console.log('api/friend called!!!!');
        var sql = "SELECT * FROM tbl_friend WHERE ID_Sender='" + req.body.user1 + "'AND ID_Receiver='" + req.body.user2 + "'"
            + "UNION "
            + "SELECT * FROM tbl_friend WHERE ID_Sender='" + req.body.user2 + "' AND ID_Receiver='" + req.body.user1 + "'";
        conn.query(sql, function (err, results) {
            if (err) throw err;
            if (Object.keys(results).length !== 0) {
                var string = JSON.parse(JSON.stringify(results[0]));
                if (string.Time !== null && string.IsFriend === 1)
                    res.send({ result: "Waiting for accepting friend request" });
                if (string.Time !== null && string.IsFriend === 0)
                    res.send({ result: "Already friend" });
            }
            else {
                var string = 0;
                res.send({ result: "Not friend" })
            }

        });
    })
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
router.route('/add')
    .post((req, res) => {
        console.log('api/friend/add called!!!!');
        var del = `DELETE FROM tbl_participants WHERE ID_Par IN 
        (SELECT tbl_participants.ID_Par FROM tbl_participants WHERE ID_Room='${req.body.sender}-${req.body.receiver}_temp' 
        UNION 
        SELECT tbl_participants.ID_Par FROM tbl_participants WHERE ID_Room='${req.body.receiver}-${req.body.sender}_temp')`
        conn.query(del);
        var sql = "INSERT INTO tbl_friend VALUES ('" + getRandomInt(99999) + "','" + req.body.sender + "','" + req.body.receiver + "',1,'" + req.body.time + "',1)";
        conn.query(sql, function (err, results) {
            if (err) throw err;
            if (results.affectedRows) {
                var temp = `SELECT * FROM tbl_chatroom WHERE ID_Room='${req.body.sender + '-' + req.body.receiver + '_temp'}' UNION 
                SELECT * FROM tbl_chatroom WHERE ID_Room='${req.body.receiver + '-' + req.body.sender + '_temp'}'`;
                conn.query(temp, function (err, result) {
                    if (err) throw err;
                    var resultTemp = JSON.parse(JSON.stringify(result));
                    if (Object.keys(result).length !== 0) {
                        var sqlNext = `SELECT * FROM tbl_chatroom WHERE ID_Room='${req.body.sender + '-' + req.body.receiver}' UNION 
                    SELECT * FROM tbl_chatroom WHERE ID_Room='${req.body.receiver + '-' + req.body.sender}'`;
                        conn.query(sqlNext, function (err, result2) {

                            if (Object.keys(result2).length !== 0) {
                                var string = JSON.parse(JSON.stringify(result2));
                                conn.query(`UPDATE tbl_messages SET ID_Room='${string[0].ID_Room}' WHERE ID_Room='${resultTemp[0].ID_Room}'`);
                                conn.query(`DELETE FROM tbl_chatroom WHERE ID_Room='${resultTemp[0].ID_Room}'`)
                                res.send({idroom_temp: string[0].ID_Room})
                            }
                            else
                            {
                                res.send({ result: "Sent friend request" })
                            }

                        })
                    }
                })
            }
            else {
                res.send({ result: "Can not send request right now. Try again" })
            }
        });

    })

router.route('/accept').post((req, res) => {
    console.log('api/friend/accept called!!!!');
    var sender = req.body.data[0];
    var receiver = req.body.data[1];
    var isFriend = req.body.data[2];
    conn.connect(function (err) {
        if (!isFriend) {
            var sql = `update tbl_friend set IsFriend = 0 where ID_Sender = '${sender}' and ID_Receiver = '${receiver}'`;
        }
        else sql = `delete from tbl_friend where ID_Sender = '${sender}' and ID_Receiver = '${receiver}'`;
        conn.query(sql,function(err,result){
            if(err) throw err;
            if(result.affectedRows)
            {
                res.send({result: 'Queried'});
            }
        });
    });
});
module.exports = router;