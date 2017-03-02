
var mongo = require('./db');

function Comment(name,minute,title,comment) {
    this.name = name;
    this.minute = minute;
    this.title = title;
    this.comment = comment;
}

Comment.prototype.save = function (callback) {
    var name = this.name;
    var minute = this.minute;
    var title = this.title;
    var comment = this.comment;

    mongo.open(function (err,db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if (err) {
                mongo.close();
                return callback(err);
            }
            // 保存留言到对应的文章的 comments 里
            collection.update({
                "name":name,
                "time.minute":minute,
                "title":title
            },{
                $push:{'comments':comment},
            },function (err) {
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}

module.exports = Comment;