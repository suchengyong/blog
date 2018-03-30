var express = require('express')
var router = express.Router();
//引入通过id查找数据库数据
const ObjectID = require('mongodb').ObjectID;
//引入操作数据库模块
var User = require('../../models/User')
//引入操作分类数据库模块
var Category = require('../../models/Category')
//引入内容数据库模块
var Content = require('../../models/Content')
router.use(function(req,res,next) {
    // if(!req.userInfo.isAdmin) {
    //     res.send('<h1>对不起，只有管理员才能进入后台管理</h1>')
    //     return false;
    // }
    next()
})

router.get('',function(req,res,next){
    res.render('admin/index',{
        userInfo:req.userInfo
    })
})

//用户管理
router.get('/user',function(req,res,next){
    //从数据库中读取所有用户信息出来
    //limit(number):限制获取的数据条数
    //skip(number):忽略数据的条数
    //每页显示2条，第一页：1:1-2 skip:0 ->（当前页-1）*limit,
    //第二页：2:3-4 skip:2
    var page = Number(req.query.page) || 1;
    var limit = 2;
    var pages = 0;
    //获取数据库当中总条数用count()
    User.count().then(function(count){

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min(page,pages)
         //取值不能小于1
        page = Math.max(page,1)

        var skip = (page -1)*limit;
        User.find().limit(limit).skip(skip).then(function(users){
            res.render('admin/user_index',{//这里面的数据之间返回给html页面模板中使用
                userInfo:req.userInfo,
                users:users,
                page:page,
                count:count,
                limit:limit,
                pages:pages
            })
            
        }) 
    })
    next()
})

/*
**分类首页管理
**
*/

router.get('/category',function(req,res,next) {
    //从数据库中读取所有用户信息出来
    //limit(number):限制获取的数据条数
    //skip(number):忽略数据的条数
    //每页显示2条，第一页：1:1-2 skip:0 ->（当前页-1）*limit,
    //第二页：2:3-4 skip:2
    var page = Number(req.query.page) || 1;
    var limit = 2;
    var pages = 0;
    //获取数据库当中总条数用count()
    Category.count().then(function(count){

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min(page,pages)
         //取值不能小于1
        page = Math.max(page,1)
        //sort({})数据排序1表示升序，-1表示降序
        var skip = (page -1)*limit;

        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories){

            res.render('admin/category_index',{//这里面的数据之间返回给html页面模板中使用
                userInfo:req.userInfo,
                categories:categories,
                page:page,
                count:count,
                limit:limit,
                pages:pages
            })
            
        }) 
    })
    
})

/*
**
**添加分类
*/
router.get('/category/add',function(req,res,next){
    res.render("admin/category_add",{
        userInfo:req.userInfo
    })
})

/*
**
**分类添加保存
*/
router.post('/category/add',function(req,res,next){
   //获取post提交过来的名称
    var name = req.body.name || '';
    if(name == ""){
        res.render('admin/error',{
            userInfo:req.userInfo,
            errmessage:'名称不能为空'
        })
    }else{
        var category = new Category({
            name:name
        })
        category.save().then(function(result){
            res.render('admin/success',{
                userInfo:req.userInfo,
                errmessage:'添加成功',
                url:"/admin/category"
            })
        })
    }
})

/*
**
**分类修改
*/
router.get('/category/edit',function(req,res,next){
    //获取要修改的分类信息，并且用表单的形式展现出来
    var id = req.query.id || "";
    //获取要分类的信息
    Category.findOne({
        _id:ObjectID(id)
    }).then(function(result) {
        console.log(result)
        if(!result){
            res.render('admin/error',{
                userInfo:req.userInfo,
                errmessage:'分类信息不存在'
            })
        }else{
            res.render('admin/category_edit',{
                userInfo:req.userInfo,
                Category:result
            }) 
        }
    })
})
/*
**
**分类修改保存
*/
router.post('/category/edit',function(req,res,next){
     //获取要修改的分类信息，并且用表单的形式展现出来
     var id = req.query.id || "";
    //获取post提交过来的名称
     var name = req.body.name || '';
     //获取要分类的信息
    Category.findOne({
        _id:ObjectID(id)
    }).then(function(result) {
        if(!result){
            res.render('admin/error',{
                userInfo:req.userInfo,
                errmessage:'该条分类信息不存在'
            })
            return Promise.reject()
        }else{
            //当用户没有做任何处理就提交
           //获取用户要修改的分类名称是否在数据库中已经存在
           if(name == result.name){
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    errmessage:'分类信息修改成功',
                    url:"/admin/category"
                })
                return Promise.reject()
           }else{
            return Category.findOne({//表示查询数据库中有没有id不是我要修的这条记录，但是名称又是我想要修改的名称
                _id:{$ne:ObjectID(id)},//表示id不等于当前的Id
                name:name
            })
           }
        }
    }).then(function(samecategory){
        if(samecategory){
            res.render('admin/error',{
                userInfo:req.userInfo,
                errmessage:'数据库中已经存在相同的同名分类'
            })
            return Promise.reject()
        }else{
            return Category.update({
                _id:id
            },{
                name:name
            })
        }
    }).then(function(result){
        res.render('admin/success',{
            userInfo:req.userInfo,
            errmessage:'数据修改成功',
            url:"/admin/category"
        })
    })
})

/*
**
**分类删除
*/

router.get("/category/delect",function(req,res){
     //获取要删除的分类信息，并且用表单的形式展现出来
     var id = req.query.id || "";
    //获取post提交过来的名称
     var name = req.body.name || '';
     //删除要分类的信息
     Category.remove({
        _id:ObjectID(id)
     }).then(function(result){
        if(result){
            res.render('admin/success',{
                userInfo:req.userInfo,
                errmessage:'数据删除成功',
                url:"/admin/category"
            })
        }
     })
})
/*
**
**内容首页
*/
router.get('/content',function(req,res){
     //从数据库中读取所有用户信息出来
    //limit(number):限制获取的数据条数
    //skip(number):忽略数据的条数
    //每页显示2条，第一页：1:1-2 skip:0 ->（当前页-1）*limit,
    //第二页：2:3-4 skip:2
    var page = Number(req.query.page) || 1;
    var limit = 2;
    var pages = 0;
    //获取数据库当中总条数用count()
    Content.count().then(function(count){

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min(page,pages)
         //取值不能小于1
        page = Math.max(page,1)
        //sort({})数据排序1表示升序，-1表示降序
        var skip = (page -1)*limit;

        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).then(function(contents){
            console.log(contents)
            res.render('admin/content',{//这里面的数据之间返回给html页面模板中使用
                userInfo:req.userInfo,
                contents:contents,
                page:page,
                count:count,
                limit:limit,
                pages:pages
            })
            
        }) 
    })
})

/*
**
**内容添加
*/
router.get('/content/add',function(req,res){
    Category.find().sort({_id:-1}).then(function(result){
        if(result){
            res.render('admin/content_add',{
                userInfo:req.userInfo,
                categories:result
            })
        }
    })
    
})
/*
**
**内容保存
*/
router.post('/content/add',function(req,res){
    console.log(req.body)
    if(req.body.Category == ""){
        res.render('admin/error',{
            userInfo:req.userInfo,
            errmessage:'内容分类不能为空',
            url:"/admin/category"
        })
        return
    }
    if(req.body.title == ""){
        res.render('admin/error',{
            userInfo:req.userInfo,
            errmessage:'内容标题不能为空',
            url:"/admin/category"
        })
        return
    }
    //保存数据到数据库
    var content =new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        description:req.body.description,
        contents:req.body.contents
    })
    content.save().then(function(result){
        res.render('admin/success',{
            userInfo:req.userInfo,
            errmessage:'内容保存成功',
            url:"/admin/content"
        })
    })
})

/*
**
**内容修改
*/
router.get("/content/edit",function(req,res,next){
    var id = req.query.id || "";
    //读取所有分类数据
    var categories = [];
    Category.find().sort({_id:-1}).then(function(result){
         //获取内容的信息
        categories = result;
        return Content.findOne({
                _id:ObjectID(id)
            }).populate('category')
    }).then(function(result) {
    
        if(!result){
            res.render('admin/error',{
                userInfo:req.userInfo,
                errmessage:'内容信息不存在'
            });
            return 
        }else{
            res.render('admin/content_edit',{
                userInfo:req.userInfo,
                contents:result,
                categories:categories
            }) 
        }
    }); 
})
/*
**
**内容修改保存
*/
router.post('/content/edit',function(req,res,next){
    var id = req.query.id || '';

    if(req.body.title == ""){
        res.render('admin/error',{
            userInfo:req.userInfo,
            errmessage:'内容标题不能为空'
        });
        return
    }
    if(req.body.contents == ""){
        res.render('admin/error',{
            userInfo:req.userInfo,
            errmessage:'内容不能为空'
        });
        return
    }
    if(req.body.description == ""){
        res.render('admin/error',{
            userInfo:req.userInfo,
            errmessage:'内容描述不能为空'
        });
        return
    }
    Content.update({
        _id:id
    },{
        category:req.body.category,
        title:req.body.title,
        description:req.body.description,
        contents:req.body.contents
    }).then(function(result){
        console.log(result)
        res.render('admin/success',{
            userInfo:req.userInfo,
            errmessage:'内容修改成功',
            url:'/admin/content/edit?id='+id
        });
    })
});
/*
**
**内容删除
*/

router.get('/content/delect',function(req,res,next){
      //获取要删除的分类信息，并且用表单的形式展现出来
    var id = req.query.id || "";
    //删除要分类的信息
    Content.remove({
        _id:ObjectID(id)
    }).then(function(result){
        if(result){
            res.render('admin/success',{
                userInfo:req.userInfo,
                errmessage:'内容删除成功',
                url:"/admin/content"
            })
        }
    })
})
module.exports = router;