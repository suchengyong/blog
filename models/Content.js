var mongoose = require('mongoose')

var ContentSchema = require('../schemas/contents');
//模型类的创建
module.exports = mongoose.model('Content',ContentSchema);