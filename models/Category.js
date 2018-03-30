var mongoose = require('mongoose')

var CategorySchema = require('../schemas/categories');
//模型类的创建
module.exports = mongoose.model('Category',CategorySchema);