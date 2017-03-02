// 登录和注册需要的 User 类
var User = require('../models/user');
// 引入一个加密模块
var crypto = require('crypto');
// 引入发表的 post 类
var Post = require('../models/post');
// 留言
var Comment = require('../models/comment');
var multer = require('multer');
var upload = require('../models/userpic');
// 个签
var Personal = require('../models/personal');

// 如果没有登录，无法访问发表和退出页面
function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', 'Darling,还未登录哦');
        res.redirect('/login');
    }
    next();
}

// 如果已登录，无法访问登录和注册页面
function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录');
        // 返回之前的页面
        res.redirect('back');
    }
    next();
}


module.exports = function (app) {
    // 首页
    app.get('/', function (req, res) {
        var postName = null;
        var picUrl = '';
        var page = parseInt(req.query.p) || 1;
        if (req.session.user) {
            postName = req.session.user.name;
            picUrl = 'images/' + req.session.user.picUrl;
        }
        Post.getArticle(null, page, function (err, posts, total) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '首页',
                posts: posts,
                page: page,
                total: total,
                userpic:picUrl,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 7 + posts.length) == total,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        })
    })
    // 注册
    app.get('/reg', checkNotLogin);
    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    })
    // 注册行为
    app.post('/reg', checkNotLogin);
    app.post('/reg', function (req, res) {
        var name = req.body.name;
        var password = req.body.password;
        var password_re = req.body['password-repeat'];

        var email = req.body.email;
        if (name == '' || password == '' || password_re == '' || email == '') {
            req.flash('error', '请正确填写信息');
            return res.redirect('/reg');
        }

        // 检查两次密码是否一致
        if (password_re != password) {
            req.flash('error', '两次输入的密码不一致');
            return res.redirect('/reg'); // 返回注册
        }
        // 生成一下密码的 md5 值
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');

        // 将注册信息传入 user 对象
        var newUser = new User({
            name: name,
            password: password,
            email: email
        });

        // 检查用户名是否已经存在
        User.get(newUser.name, function (err, user) {
            // 如果发生错误，跳转回首页
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            // 如果存在重复的用户名
            if (user) {
                req.flash('error', '用户名已存在');
                return res.redirect('/reg');
            }
            // 如果不存在则新增用户
            newUser.save(function (err) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                // 用户信息存入 session
                req.session.user = newUser;
                req.flash('success', '注册成功');
                res.redirect('/');
            });
        });
    });

    // 登录
    app.get('/login', checkNotLogin);
    app.get('/login', function (req, res) {
        res.render('login', {
            title: '登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    })
    // 登录行为
    app.post('/login', checkNotLogin);
    app.post('/login', function (req, res) {
        // 生成 md5 密码
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');

        // 检查用户名是否存在
        User.get(req.body.name, function (err, user) {
            if (!user) {
                req.flash('error', '用户名不存在,请先注册');
                return res.redirect('/login');
            }
            // 检查密码是否一致
            if (user.password != password) {
                req.flash('error', '用户名与密码不匹配');
                return res.redirect('/login');
            }
            // 都匹配了，将用户信息存入 session
            req.session.user = user;
            req.flash('success', '登录成功');
            res.redirect('/');
        })
    })

    // 发表
    app.get('/post', checkLogin);
    app.get('/post', function (req, res) {
        res.render('post', {
            title: '发表',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            userpic:'images/' + req.session.user.picUrl
        })
    })
    // 发表行为
    app.post('/', checkLogin);
    app.post('/', function (req, res) {
        var currentUser = req.session.user;
        if (req.body.title == '' || req.body.post == '') {
            req.flash('error', '内容不能为空');
            return res.redirect('/post');
        }
        //添加一下标签信息
        var tags = [req.body.tag1, req.body.tag2, req.body.tag3];
        console.log(tags);
        var post = new Post(currentUser.name, req.body.title, tags, req.body.post,req.session.user.picUrl);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '发布成功');
            res.redirect('/');
        })
    })

    // 上传头像
    app.get('/user',checkLogin);
    app.get('/user',function (req,res) {
        res.render('userinfo',{
            title:'个人中心',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString(),
            userpic:'images/' + req.session.user.picUrl
        })
    })
    // 上传头像行为
    app.post('/user',checkLogin);
    app.post('/user',upload.single('userpic'),function (req,res) {
        console.log(req.picUrl);
        User.update(req.session.user.name,req.picUrl,function (err,user) {
            if (err) {
                req.flash('err',err);
                res.redirect('/user');
            }
            Post.updatepic(req.session.user.name,req.picUrl,function (err) {
                if (err) {
                    req.flash('err',err);
                    res.redirect('/user');
                }
            })
            req.session.user = user;
            req.flash('success','头像更换成功');
            res.redirect('/user');
        })

    })

    // 编辑资料行为
    app.post('/user/:name', checkLogin);
    app.post('/user/:name', function (req, res) {
        Personal.update(req.session.user.name, req.body.personal, function (err,personal) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '编辑成功');
            req.session.user.personal = req.body.personal;
            return res.redirect('/');
        })
    })


    // 退出
    app.get('/logout',checkLogin);
    app.get('/logout', function (req, res) {
        // 清除 session
        req.session.user = null;
        // 给用户一个提示信息
        req.flash('success', '成功退出');
        // 跳转到首页
        res.redirect('/');
    })

    // 点击用户名，即可查看该用户的所有文章
    app.get('/u/:name', function (req, res) {
        var page = parseInt(req.query.p) || 1;
        User.get(req.params.name, function (err, user) {
            if (!user) {
                req.flash('error', '用户不存在');
                return res.redirect('/');
            }
            // 查询并返回该用户的所有文章
            Post.getArticle(user.name, page, function (err, posts, total) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    page: page,
                    total: total,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * 7 + posts.length) == total,
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });

    // 文章详情页面
    app.get('/u/:name/:minute/:title', function (req, res) {
        Post.getOne(req.params.name, req.params.minute, req.params.title,function (err, post) {
            if (err) {
                req.flash('error', '找不到当前文章');
                return res.redirect('/');
            }
            res.render('article', {
                title: req.params.title,
                user: req.session.user,
                post: post,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        })
    })

    // 留言
    app.post('/comment/:name/:minute/:title', function (req, res) {
        var date = new Date();
        var time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        var comment = {
            name: req.body.name,
            time: time,
            content: req.body.content,
            commentpic:req.session.user.picUrl
        }
        console.log('留言留言留言：' + comment.content);
        if (req.body.content == '') {
            req.flash('error', '留言内容不能为空');
            return res.redirect('back');
        }
        var newComment = new Comment(req.params.name, req.params.minute, req.params.title,comment);
        newComment.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '留言成功！');
            res.redirect('back');
        })
    })

    // 编辑文章
    app.get('/edit/:name/:minute/:title', checkLogin);
    app.get('/edit/:name/:minute/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.edit(currentUser.name, req.params.minute, req.params.title, function (err, post) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            res.render('edit', {
                title: '编辑文章',
                user: req.session.user,
                post: post,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                userpic:'/images/' + req.session.user.picUrl
            })
        })
    })

    // 编辑文章行为
    app.post('/edit/:name/:minute/:title', checkLogin);
    app.post('/edit/:name/:minute/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.update(req.params.name, req.params.minute, req.params.title, req.body.post, function (err) {
            var url = encodeURI('/u/' + req.params.name + '/' + req.params.minute + '/' + req.params.title);
            if (err) {
                req.flash('error', err);
                return res.redirect(url);
            }
            req.flash('success', '编辑成功');
            return res.redirect(url);
        })
    })

    // 文章存档
    app.get('/archive',function (req,res) {
        Post.getArchive(function (err,posts) {
            if (err) {
                req.flash('error',err);
                return res.redirect('/');
            }
            res.render('archive',{
                title:'最新文章',
                posts:posts,
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
                // userpic:'/images/' + req.session.user.picUrl
            })
        })
    })

    // 删除文章
    app.get('/remove/:name/:minute/:title', checkLogin);
    app.get('/remove/:name/:minute/:title', function (req, res) {
        Post.remove(req.params.name, req.params.minute, req.params.title, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '删除成功！');
            res.redirect('/');
        })
    })

    // 搜索
    app.get('/search', function (req, res) {
        Post.search(req.query.keyword, function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            if(!posts[0]) {
                req.flash('error', "Darling，sorry未找到符合条件的日志...")
            }
            res.render('search', {
                title: 'SEARCH:' + req.query.keyword,
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
                // userpic:'/images/' + req.session.user.picUrl
            })
        })
    })




}
