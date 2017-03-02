
var mongo = require('./db');
var markdown = require('markdown').markdown;

function Post(name,title,tags,post,picUrl) {
    this.name = name;
    this.title = title;
    this.post = post;
    this.tags = tags;
    this.picUrl = picUrl;
}

module.exports = Post;
// 发表文章
Post.prototype.save  = function(callback){
    var date = new Date();
    //保存当前时间的各种格式
    var time = {
        date:date,
        year:date.getFullYear(),
        month:date.getFullYear() + '-' + (date.getMonth() + 1),
        day:date.getFullYear() + '-' +
        (date.getMonth() + 1) + '-' + date.getDate(),
        minute:date.getFullYear() + '-' +
        (date.getMonth() + 1) + '-' + date.getDate() + ' ' +
        date.getHours() + ':' +
        (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() + ':' +
        date.getSeconds())
    };
    //我们要保存的数据
    var post = {
        name:this.name,
        time:time,
        title:this.title,
        //接收一下标签信息
        tags:this.tags,
        post:this.post,
        // 上传头像
        picUrl:this.picUrl,
        //新增的留言字段
        comments:[],
        //新增访问量
        pv:0
    }
    //接下来就是常规的打开数据库->读取posts集合->内容插入->关闭数据库
    mongo.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.insert(post,{safe:true},function(err){
                mongo.close();
                if(err){
                    return callback(err);
                }
                //如果没有错的情况下,保存文章，不需要返回数据.
                callback(null);
            })
        })
    })
}

//获取文章
Post.getArticle = function(name,page,callback){
    mongo.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongo.close();
                return callback(err);
            }
            var query = {};
            if(name){
                query.name = name;
            }
            collection.count(query,function (err,total) {
                //total是查询的文章总数量
                collection.find(query,{
                    skip:(page - 1) * 7,
                    limit:7
                }).sort({
                    time:-1
                }).toArray(function(err,docs){
                    mongo.close();
                    if(err){
                        return callback(err); // 失败，返回 err
                    }
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    })
                    callback(null,docs,total); // 成功，以数组形式返回
                })
            })
        })
    })
}

// 获取其中一篇文章
Post.getOne = function (name,minute,title,callback) {
    mongo.open(function (err,db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if (err) {
                mongo.close();
                return callback(err);
            }
            // 根据用户名、发表日期以及文章名进行查询
            collection.findOne({
                "name":name,
                "time.minute":minute,
                "title":title
            },function(err,doc) {
                if(err) {
                    mongo.close();
                    return callback(err);
                }
                if (doc) {
                    collection.update({
                        "name": name,
                        "time.minute": minute,
                        "title": title
                    }, {
                        $inc: {'pv': 1}
                    }, function (err) {
                        mongo.close();
                        if (err) {
                            return callback(err);
                        }
                    })
                }
                doc.post = markdown.toHTML(doc.post);
                doc.comments.forEach(function (comment) {
                    comment.content = markdown.toHTML(comment.content);
                });
                callback(null,doc); // 返回查询的某一篇文章
            })
        })
    })
}

// 编辑文章
Post.edit = function (name,minute,title,callback) {
    mongo.open(function (err,db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if (err) {
                mongo.close();
                return callback(err);
            }
            collection.findOne({
                "name":name,
                "time.minute":minute,
                "title":title
            },function (err,doc) {
                mongo.close();
                if (err) {
                    return callback(err);
                }
                return callback(null,doc) // 返回查询的一篇文章
            })
        })
    })
}

// 更新文章
Post.update = function (name,minute,title,post,callback) {
    mongo.open(function (err,db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if (err) {
                mongo.close();
                return callback(err);
            }
            collection.update({
                "name":name,
                "time.minute":minute,
                "title":title
            },{$set:{post:post}},function (err) {
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}
// 更新头像
Post.updatepic = function (name,picUrl,callback) {
    console.log('666' + picUrl);
    console.log('555' + typeof picUrl);
    mongo.open(function (err,db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if (err) {
                mongo.close();
                return callback(err);
            }
            collection.update({name:name},{$set:{picUrl:picUrl}},{multi:true},function (err) {
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}

// 删除一篇文章
Post.remove = function (name,minute,title,callback) {
    mongo.open(function (err,db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if (err) {
                mongo.close();
                return callback(err);
            }
            // 根据用户名、日期和标题查找并删除一篇文章
            collection.remove({
                "name":name,
                "time.minute":minute,
                "title":title
            },{w:1},function (err) {
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}

// 存档
Post.getArchive = function (callback) {
    mongo.open(function (err,db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if (err) {
                mongo.close();
                return callback(err);
            }
            collection.find({},{
                "name":1,
                "time":1,
                "title":1
            }).sort({
                time:-1
            }).toArray(function (err,docs) {
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null,docs);
            })
        })
    })
}


// 搜索功能
Post.search = function (keyword,callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err) {
                mongo.close();
                return callback(err);
            }
            var patten = new RegExp(keyword,'i');
            collection.find({
                "title":patten
            },{
                "name":1,
                "time":1,
                "title":1
            }).sort({
                time:-1
            }).toArray(function (err,docs) {
                mongo.close();
                if(err) {
                    return callback(err);
                }
                callback(null,docs);
            })
        })
    })
}




