'use strict'
const constantFile = require('../utils/Constant')
const jimp = require('jimp')
const auditoriaController = require('../controller/saveLogs.controller')
const fs = require('fs')

function validateImageFile(file){
	const file_path = file.path
	console.log("el path "+ file_path)
	const file_split = file_path.split('/')
	console.log("array "+ file_split)
	const file_name = file_split[3]
	// const file_name = file_split[4] desarrollo
	// eslint-disable-next-line no-useless-escape
    console.log("el nombre "+file_name);
	const ext_split = file_name.split('.')
	const file_ext = ext_split[1]
	if(file_ext === constantFile.extensions.JPEG ||file_ext === constantFile.extensions.JPG || file_ext === constantFile.extensions.PNG){
		return file_name
	}else{
		fs.unlink(file_path,(err)=>{
			if (err){
				return false
			}else{
				return false
			}
		})

	}

}

function resizeImage(req, res, routeOriginal, routeResized){
	jimp.read(routeOriginal,(err, image)=>{
		if(err || !image){
			auditoriaController.saveLogsData(req.user.name,err, req.connection.remoteAddress, 'image fail')
			res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message: constantFile.functions.PRODUCT_GET_ERROR})
		}else{
			return image.resize(32,32).write(routeResized)

		}
	})
}
// eslint-disable-next-line no-undef
module.exports={
	validateImageFile,
	resizeImage
}