var express = require("express")
//引入模板
var swig = require('swig')
//用来处理post提交过来的数据
var bodyParser = require('body-parser')
//引入cookie来存登录用户信息
var cookies = require('cookies')
var User = require('./models/User')
//创建app
var app = express()
//加载数据库
var mongoose = require('mongoose')
//定义应用使用模板，第一个参数：模板名称，同时也是模板文件后缀
//第二个参数表示解析出来模板的方法
app.engine('html',swig.renderFile);
//设置模板文件存放目录，第一个参数必须是views不能变更
app.set('views','./views')
//设置模板引擎，第一个参数是view engine必须不能改，第二个参数和app.engine这个方法中定义的模板引擎的名称（第一个参数）是一致的
app.set('view engine','html')
//在开发过程中，需要取消模板缓存
swig.setDefaults({cache:false})
//静态文件托管方式请求,当用户url中以/public开始，那么直接返回对于__dirname+'/public'下的文件
app.use('/public',express.static(__dirname + '/public'))
//bodyParser设置使用
app.use( bodyParser.urlencoded({extended:true}) )
// app.get('/',function(req,res,next) {
//     //res.send('<h1>欢迎光临我的博客</h1>')
//     //读取views目录下的指定文件，解析返回给客户端
//     //第一个参数表示模板文件，相对于views目录 views/index.html
//     res.render('index')
// })

//设置cookies
app.use(function(req,res,next){
    req.cookies = new cookies(req,res);
    //解析登录用户cookies信息
    req.userInfo = {};
    if(req.cookies.get('userInfo')){
        try{
            req.userInfo =JSON.parse(req.cookies.get('userInfo')) 
            console.log(req.userInfo)
            //获取当前登录用户类型，是否为管理员
            // User.findById(req.userInfo._id).then(function(result){
            //     req.userInfo.isAdmin = Boolean(result.isAdmin)
            // })

        }catch(error) {
            console.log(error)
        }
    }
    next()
});
app.use('/logo',require('./routers/logo'))
app.use('/',require('./routers/main/index'))
app.use('/admin',require('./routers/admin/admin'))
app.use('/api',require('./routers/user'))

//连接数据库
mongoose.connect('mongodb://localhost:27018/blog',function(err){
    if(err) {
        console.log("数据库连接失败")
    }else{
        console.log("数据库连接成功")
        console.log("server runing at port http://localhost:8081")
        //监听http端口
        app.listen(8081)
    }
})


