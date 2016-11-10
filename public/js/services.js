'use strict';
var services = angular.module('services', []);

services.service('SessionService', function ($cookies) {

	this.isLogged = ($cookies.get("token") != null);

	this.username = $cookies.get("username");

	this.logToken		= function (token) {
		$cookies.put("token", token);
		this.isLogged = ($cookies.get("token") != null);
	};

	this.logUser		= function (username) {
		console.log(username);
		$cookies.put("username", username);
		this.username = $cookies.get("username");
		this.isLogged = ($cookies.get("token") != null);
	};

	this.deleteToken	= function () {
		$cookies.remove("token");
		$cookies.remove("username");
		this.username = ($cookies.get("username") != null);
		this.isLogged = ($cookies.get("token") != null);
	};

});

services.factory('socket', function (socketFactory) {
  return socketFactory();
});