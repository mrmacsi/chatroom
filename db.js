var mysql = require('mysql');
var dbConfig = {
    host        :  '127.0.0.1',
    user        :  'root',
    password    :  '',
    database    :  'chatapp'
};

var connection = mysql.createConnection(dbConfig);
connection.connect(function (err) {
    if(err){
        console.log('Database Connection Error : ' + err);
    }
});

module.exports = connection;