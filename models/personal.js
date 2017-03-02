
var mongo = require('./db');
function Personal(name,personal){
    this.name = name;
    this.personal = personal;
}
module.exports = Personal;

Personal.update = function (name,personal,callback) {
    mongo.open(function (err,db) {
        if (err) {
            return callback(err);
        }
        db.collection('users',function (err,collection) {
            if (err) {
                return callback(err);
            }
            collection.update({name:name},{$set:{personal:personal}},{multi:true});
            // 查询数据
            collection.findOne({name:name},function (err,user) {
                mongo.close();
                if (err) {
                    return callback(err);
                }
                console.log('个性签名' + personal);
                return callback(null,personal);
            })
        })
    })
}



