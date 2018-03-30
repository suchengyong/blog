var express = require('express')
var router = express.Router();
//引入操作数据库模块
var User = require('../../models/User')
//引入操作分类数据库模块
var Category = require('../../models/Category')
//引入内容数据库模块
var Content = require('../../models/Content')
/*
*使用中间件处理通用数据
*/
var data = null;
router.use(function(req,res,next){
    data = {
        userInfo:req.userInfo,
        categories:[],
    }
    //读取所有的分类信息
    Category.find().then(function(result){
        data.categories = result;
        next();
    })
})

/*
*首页
*/
router.get('/',function(req,res,next) {
       
        data.categoryType = req.query.type || '';
        data.count = 0;
        data.page = Number(req.query.page || 1);
        data.limit = 3;
        data.pages = 0;
    //申明一个查询条件变量
    var where = {};
    if(data.categoryType != '') {
        where.category = data.categoryType
    } 
    Content.where(where).count().then(function(count){
        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count / data.limit);
        //取值不能超过pages
        data.page = Math.min(data.page,data.pages)
        //取值不能小于1
        data.page = Math.max(data.page,1)
        var skip = (data.page - 1) * data.limit;
        //where().find()是条件查询语句
        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category','user']).sort({
            addTime:-1
        })
    }).then(function(contents) {
        data.contents = contents;
        res.render('main/index',data)
        console.log(data)
    })
})
/*
*点击阅读文章
*/
router.get('/views',(req, res, next)=>{
    const _id = req.query.page;
    Content.findOne({_id:_id}).then((content)=>{
        content.views++;
        content.save();
        data.content = content;
        res.render('main/detail',data);
    })
    
})

module.exports = router;