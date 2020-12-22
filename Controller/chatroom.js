var router = require('express').Router();
var conn = require('./DB').con

router.route('/add')
    .post((req, res) => {
        console.log('api/chatroom/add called!!!!');
        var bitmap = Buffer.from(req.body.avatar, 'base64');
        var bitmap_hex = bitmap.toString('hex')===''?"''":("0x"+bitmap.toString('hex'));
        conn.connect(function (err) {
            var sql = "INSERT INTO tbl_chatroom VALUES ('" + req.body.id + "','" + req.body.name + "',0," + bitmap_hex + ")";
            conn.query(sql, function (err, results) {
                if (err) throw err;
                if (results.affectedRows)  res.send({ result: "Inserted" ,id_room: req.body.id});
                else res.send({ result: "Error" ,id_room: -1});
            })
        });
    })
router.route('/update')
.post((req, res) => {
    console.log('api/chatroom/update called!!!!');
    var bitmap = Buffer.from(req.body.avatar, 'base64');
    var bitmap_hex = "0x"+bitmap.toString('hex');
    conn.connect(function (err) {
        var sql = "UPDATE tbl_chatroom SET Avatar="+bitmap_hex+" WHERE ID_Room='"+req.body.id+"' ";
        conn.query(sql, function (err, results) {
            if (err) throw err;
            if (results.affectedRows)  res.send({results:"Updated"});
        })
    });
})
router.route('')
.post((req, res) => {
    console.log('api/chatroom called!!!!');
    conn.connect(function (err) {
        var sql = "SELECT * FROM tbl_chatroom WHERE ID_Room='"+req.body.id+"' ";
        conn.query(sql, function (err, results) {
            if (err) throw err;
            var string = JSON.parse(JSON.stringify(results));
            for (var index in string) {
              string[index].Avatar.data = (new Buffer.from(string[index].Avatar.data)).toString('base64');
            }
            res.send(string);
          });
    });
})
module.exports = router;