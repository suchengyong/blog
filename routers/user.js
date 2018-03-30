var express = require('express')
var router = express.Router();
//引入操作数据库模块
var User = require('../models/User')
//引入操作数据库文章模块
var Content = require('../models/Content')
//统一返回格式
var responseData;
router.use(function(req,res,next) {
    responseData = {
        code:0,
        data:'',
        message:'',
        success:true
    }
    next()
})
/*
**用户注册，与注册逻辑
*1，用户名不能为空，密码不能为空，两次密码一致，查询用户名是否存在
*/
router.post('/user/register',function(req,res,next) {
    //res.render('user')
    //console.log(req.body)
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    
    //用户名是否为空
    if(username == ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        responseData.success = false;
        responseData.data = '用户名不能为空';
        res.json(responseData)
        return false;
    }
    //密码是否为空
    if(password == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        responseData.success = false;
        responseData.data = '密码不能为空';
        res.json(responseData)
        return false;
    }
    //两次输入密码是否不一致
    if(password != repassword){
        responseData.code = 3;
        responseData.message = '两次输入密码不一致';
        responseData.success = false;
        responseData.data = '两次输入密码不一致';
        res.json(responseData)
        return false;
    }
    //严重数据库是否被注册过了
    User.findOne({//查找数据库中一条
        username:username
    }).then(function(userInfo){
        console.log(userInfo)
        if(userInfo){//表示查找数据库如果存在
            responseData.code = 2;
            responseData.message = '用户已经被注册';
            responseData.success = true;
            responseData.data = '用户已经被注册';
            res.json(responseData)
            return false;
        }
        //保存用户名到数据库中
        var user = new User({
            username:username,
            password:password
        });
        return user.save()
    }).then(function(newInfo){
        console.log(newInfo)
        responseData.code = 0;
        responseData.message = '注册成功';
        responseData.success = true;
        responseData.data = '注册成功';
         //给客户端返回一个cookies保存用户状态,就不需要再等录了
         req.cookies.set('userInfo',JSON.stringify({
            _id:newInfo._id,
            username:newInfo.username,
            isAdmin:newInfo.isAdmin
        }))
        res.json(responseData)
        return false
    })
    
})

//用户登录验证
router.post('/user/login',function(req,res,next) {
    var username = req.body.username;
    var password = req.body.password;
    if(username == '' || password == '') {
        responseData.code = 2;
        responseData.data = "用户名或者密码不能为空";
        responseData.message = '用户名或者密码不能为空';
        responseData.success = false;
        res.json(responseData);
        return false;
    }
    //查找数据库中相同用户名和密码一致
    User.findOne({
        username:username,
        password:password
    }).then(function(result){
        console.log(result)
        if(!result) {
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            responseData.success = false;
            responseData.data = '用户名或密码错误';
            res.json(responseData)
            return false
        }else{
            responseData.code = 0;
            responseData.message = '登录成功';
            responseData.success = true;
            responseData.data = {
                _id:result._id,
                username:result.username
            };
            //给客户端返回一个cookies保存用户状态
            req.cookies.set('userInfo',JSON.stringify({
                _id:result._id,
                username:result.username,
                isAdmin:result.isAdmin
            }))
            res.json(responseData)
            return false
        }

    })
})

/*
*登录退出按钮
*
*/
router.post('/user/logout',function(req,res,next) {
    req.cookies.set('userInfo',null)
    responseData.code = 0;
    responseData.message = '退出成功';
    responseData.success = true;
    res.json(responseData)
   
})
/*
*用户评论提交接口
*
*/
router.post('/comment/post',function(req,res,next){
    //内容的id
    var commentId = req.body.commentId || '';
    postData = {
        username:req.userInfo.username,
        postTime:new Date(),
        commentContent:req.body.commentContent
    };
    Content.findOne({
        _id:commentId
    }).then(function(content){
        content.comments.push(postData);
        return content.save();
    }).then(function(newcontent){
        responseData.code = 0;
        responseData.data = newcontent;
        responseData.message = '评论提交成功';
        responseData.success = true;
        res.json(responseData)
    })
})
/*
*用户评论获取
*
*/
router.get('/comment/get',function(req,res){
    var commentId = req.query.commentId || '';
    Content.findOne({
        _id:commentId
    }).then(function(newcontent){
        responseData.code = 0;
        responseData.data = newcontent;
        responseData.message = '获取评论成功';
        responseData.success = true;
        res.json(responseData)
    })
})
module.exports = router;