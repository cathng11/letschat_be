var router = require('express').Router();
var conn = require('./DB').con

router.route('/add')
    .post((req, res) => {
        console.log('api/participants/add called!!!!');
        conn.connect(function (err) {
            for (var i = 0; i < Object.keys(req.body.list).length; i++) {

                var sql = "INSERT INTO tbl_participants VALUES ('" + req.body.id + i + "','" + req.body.id_room + "','" + req.body.list[i] + "')";
                conn.query(sql, function (err, results) {
                    if (err) throw err;
                })
                if(i===Object.keys(req.body.list).length-1)
                res.send({result:'Create group successfully'})
            }
        })
    })
router.route('')
.post((req, res) => {
    console.log('api/participants called!!!!');
    conn.connect(function (err) {
        var sql = `SELECT * FROM tbl_user WHERE Username IN 
        (SELECT tbl_participants.Username FROM tbl_participants WHERE ID_Room='${req.body.idRoom}')`;
        conn.query(sql, function (err, results) {
            if (err) throw err;
            var string = JSON.parse(JSON.stringify(results));
            for (var index in string) {
              string[index].Avatar.data = (new Buffer.from(string[index].Avatar.data)).toString('base64');
            }
            res.send(string);
        })
    })
})
module.exports = router;