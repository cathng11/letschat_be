const express = require('express'),
  app = express(),
  bodyParser = require("body-parser"),
  port = process.env.PORT || 3070;
const path = require('path');
const http = require('http').createServer(app);
const cors=require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  }
});
const dateformat = require('dateformat');

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use(express.static(path.join(__dirname,'./public')))

const conn=require('./Controller/DB').con;
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

//enable cors
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   // res.header("Access-Control-Allow-Headers", "Content-Type");
//   res.header("Access-Control-Allow-Headers", "Authorization");
//   res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
//   next();
// });
app.use(cors());
//Socket
io.on('connection', function (socket) {
  socket.on('joinRoom', (idRoom) => {
    socket.join(idRoom);
  });

  socket.on('joinUser', (username) => {
    console.log(`New user: ${username}`);
    var sqlOnline = `update tbl_onlineuser set Time_Offline = NULL, Time_Online = '${dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")}' where Username = '${username}' and Time_Offline is not null`;
    conn.query(sqlOnline);  
    socket.username = username;
    socket.join(username);
  });

  socket.on('newMessage', (data) => {
    socket.broadcast.to(data[0]).emit('newMessage', [data[1], data[2], data[3]]);
    var sql = `select Username from tbl_participants where ID_Room = '${data[0]}'`;
    conn.query(sql, function (errr, results) {
      if (errr) throw errr;
      var string = JSON.parse(JSON.stringify(results));
      string.forEach((username, index) => {
        io.to(username.Username).emit('onShowNewMessage', '');
      });
    });
  });

  socket.on('reloadHeader', (data) => {
    io.to(data).emit('to-friend-reloadHeader','');
  });
  socket.on('unfriend',(data)=>
  {
    var sql = `DELETE FROM tbl_friend WHERE ID_FriendRequest IN 
    (SELECT tbl_friend.ID_FriendRequest FROM tbl_friend WHERE ID_Sender='${data.user}' AND ID_Receiver='${data.friend}'
    UNION
    SELECT tbl_friend.ID_FriendRequest FROM tbl_friend WHERE ID_Sender='${data.friend}' AND ID_Receiver='${data.user}')`;
    conn.query(sql,function(err,result){
      if(err) throw err;
      if(result.affectedRows)
      {
        var upID=`UPDATE tbl_chatroom SET ID_Room='${data.idroom+'_temp'}' WHERE ID_Room='${data.idroom}'`
        conn.query(upID);
        io.to(data.user).emit('unfriend',{idroom:data.idroom,idroomTemp: data.idroom+'_temp'})
        io.to(data.friend).emit('unfriend',{idroom:data.idroom,idroomTemp: data.idroom+'_temp'})

      }
    })
  })
  socket.on('leavegroup',(data)=>
  {
    conn.query(`SELECT * FROM tbl_participants WHERE ID_Room='${data.idroom}'`,function(err,resultSLT)
    {
      if(err) throw err;
      if(Object.keys(resultSLT).length<=2)
      {
        var sql=`DELETE FROM tbl_chatroom WHERE ID_Room='${data.idroom}'`
        conn.query(sql,function(error,result){
          if(error) throw error;
          if(result.affectedRows)
          {
            for(var i in data.members)
            {
              io.to(data.members[i].Username).emit('removegroup',{idroom:data.idroom});  
            }
          }
        })
      }
      else
      {
        sql=`DELETE FROM tbl_participants WHERE ID_Room='${data.idroom}' AND Username='${data.user}'`
        conn.query(sql,function(error,result){
          if(error) throw error;
          if(result.affectedRows)
          {
            for(var i in data.members)
            {
              io.to(data.members[i].Username).emit('userleavedgr','');  
            }
          }
        })
      }
    })

  })
  socket.on('creategroup',(data)=>
  {
    var sql=`SELECT Username FROM tbl_participants WHERE ID_Room='${data.id}' `
    conn.query(sql,function(err,result){
      if(err) throw err;
      if(Object.keys(result).length!==0)
      {
        var string = JSON.parse(JSON.stringify(result));
        for(var i in string)
        {
          if(string[i].Username!==data.user)
            io.to(string[i].Username).emit('addgroup','');  
        }
      }
    })   
  })
  socket.on('updateroom',(data)=>
  {
    var sql=`SELECT Username FROM tbl_participants WHERE ID_Room='${data.id}' `
    conn.query(sql,function(err,result){
      if(err) throw err;
      if(Object.keys(result).length!==0)
      {
        var string = JSON.parse(JSON.stringify(result));
        for(var i in string)
        {
          io.to(string[i].Username).emit('updateroom','');  
        }
      }
    })   
  })
  socket.on('disconnect', () => {
    if (socket.username) {
      var sqlOffline = `update tbl_onlineuser set Time_Offline = '${dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")}' where Username = '${socket.username}'`;
      conn.query(sqlOffline);
      console.log(socket.username + ': disconnected');
    }
  });
});



app.use('/api/contact',require('./Controller/listContact'));

//List messages
const listMessages=require('./Controller/listMessages');
app.use('/api/listMessages',listMessages);

//List group
const listGroup=require('./Controller/listGroup');
app.use('/api/listGroup',listGroup);

//Register
app.use(express.json()); //middleware //recognize json object
const register=require('./Controller/register');
app.use('/api/register',register);

//Api login
const login = require('./Controller/api-login.js');
app.use('/api/login', login);

//Api messages
const messages = require('./Controller/api-messages.js');
const { get } = require('./Controller/api-login.js');
app.use('/api/messages', messages);

//Api notifications
const noti = require('./Controller/api-notifications.js');
app.use('/api/notifications', noti);

//User profile
app.use('/api/user',require('./Controller/user'));

//tbl friend
app.use('/api/friend',require('./Controller/friend'));

//tbl chatroom
app.use('/api/chatroom',require('./Controller/chatroom'));

//tbl participants
app.use('/api/participants',require('./Controller/participants'));

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

http.listen(process.env.PORT || 3070,  ()=> {
  console.log('listening on *:' + port);

});