
var settings = require('../setting');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

// 创建数据库连接对象
module.exports = new Db(settings.db,
    new Server(settings.host,settings.port),
    {safe:true}
)