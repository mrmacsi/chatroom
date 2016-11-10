var express			= require("express");
var bodyParser		= require("body-parser");
var cookieParser	= require("cookie-parser");
var crypto			= require("crypto");
var app				= express();
var server			= require('http').Server(app);
var io				= require('socket.io')(server);
var db				= require('./db');
var port			= 2222;
var MESSAGES		= [];

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':true}));
app.use(express.static(__dirname + "/public"));

app.get("/",function (req, res) {
	res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", function (socket) {

	socket.on("chat:allmsgs:request", function () {
		return socket.emit("chat:allmsgs", MESSAGES)
	});

	socket.on("user:login", function (data) {
		try {
			var username	= data.username;
			var password	= data.password;
			if(!username || username==""){
				return socket.emit("user/register/result", {code: 400, message: "Please type an username"});
			}
			if(!password || password==""){
				return socket.emit("user/register/result", {code: 400, message: "Please type an password"});
			}
			var sql = "SELECT * FROM users WHERE username = ? AND password = ?";
			db.query(sql, [username, createToken(password)], function (err, result) {
				if(err){
					return socket.emit("user:login:result", {code: 400, message: "DB Error"});
				}
				if(result[0]) {
					var userID		= result[0].userID;
					var username	= result[0].username;
					var token		= createToken(username+userID);
					console.log(username+" Loggen In");
					return socket.emit("user:login:result", {code: 200, message: token});
				} else {
					return socket.emit("user:login:result", {code: 400, message: "User does not exists"});
				}
			});
		}
		catch(err) {
			return socket.emit("user:login:result", {code: 400, message: err});
		}
	});


	socket.on("user/register", function (data) {
		var username	= data.username;
		var password	= data.password;
		if(!username || username==""){
			return socket.emit("user/register/result", {code: 400, message: "Please type an username"});
		}
		if(!password || password==""){
			return socket.emit("user/register/result", {code: 400, message: "Please type an password"});
		}
		password		= createToken(password);

		var sql			= "SELECT * FROM users WHERE username = ?";
		db.query(sql, [data.username], function (err, result) {
			if(err) return socket.emit("user/register/result", {code: 400, message: "DB Error"});
			if(!result[0]) {
				sql	= "INSERT INTO users(username,password) VALUES(?,?)";
				db.query(sql, [username, password], function (err, result) {
					if(err) return socket.emit("user/register/result", {code: 400, message: "DB Error"});
					var userID	= result.insertId;
					var token	= createToken(username+userID);
					sql			= "INSERT INTO tokens(userID,token) VALUES(?,?)";
					db.query(sql, [userID, token], function (err, result) {
						if(err) return socket.emit("user/register/result", {code: 400, message: "DB Error"});
						return socket.emit("user/register/result", {code: 200, message: token});
					});
				});
			}else{
				return socket.emit("user/register/result", {code: 400, message: 'User already exists'});
			}
		});
	});


	socket.on("chat:send", function (data) {
		console.log(data);
		MESSAGES.push(data);
		return socket.emit("chat:newmsg", data);
	});
});

function createToken(string){
	return crypto.createHash('md5').update(string).digest('hex');
}


server.listen(port);
