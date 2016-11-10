'use strict';
var ctrls = angular.module('controllers', []);

/**************** MainCtrl ****************/
ctrls.controller('MainCtrl', function(SessionService, socket) {
	var self = this;
	self.MESSAGES = [];

	self.text = "Mesaj Yazıldı";
	self.send = function () {
		socket.emit("chat:send", {text: self.text, username: SessionService.username})
	};

	socket.on("chat:newmsg", function (data) {
		self.MESSAGES.push(data)
	});

	socket.on("chat:allmsgs", function (data) {
		self.MESSAGES = data
	});

	socket.emit("chat:allmsgs:request")
});


/**************** LoginCtrl ****************/
ctrls.controller('UserCtrl', function(SessionService, socket) {
	var self = this;
	self.login = function() {
		socket.emit("user:login", {username: self.username, password: self.password})
	};

	socket.on("user:login:result", function (data) {
		if(data.code == 200) {
			SessionService.logToken(data.message);
			SessionService.logUser(self.username);
			document.location.href = "/";
		} else {
			self.message = message(data.code,data.message);
		}
	});


	self.register = function() {
		socket.emit("user/register", {username: self.username, password: self.password})
	};

	socket.on("user/register/result", function (data) {
		if(data.code == 200) {
			SessionService.logToken(data.message);
			SessionService.logUser(self.username);
			document.location.href = "/";
		} else {
			self.message = message(data.code,data.message);
		}
	})

});

function message(state,message) {
	if(state==200)
	return '<div class="notification is-success"></button>'+message+'</div>';
	else if(state==400)
	return '<div class="notification is-warning"></button>'+message+'</div>';
	else
	return '<div class="notification is-danger"></button>'+message+'</div>';
}
