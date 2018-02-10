'use strict'
const auditoriaController = require('./saveLogs.controller')
const DirectionIp = require('../model/direcctionIp.model')
const constantFile = require('../utils/Constant')
const serviceIp = require('../service/directionIp.service')
const emailService = require('../service/email.service')
// const userController = require('./user.controller')
const User = require('../model/user.model')
function registerNewIp(params, userStorage){
	let ipObject = new DirectionIp()
	ipObject = serviceIp.seteoDataIp(params,userStorage)
	ipObject.save((err, ipObject)=>{
		registerData(err, ipObject, params)
	})
}

function addIpForUser(ipObject, ips, params){
	let direcctionIp = new DirectionIp()
	direcctionIp = ipObject

	DirectionIp.findByIdAndUpdate({_id:direcctionIp._id}, {$set:{stn_directionIp : ips}}, {new: true}).populate('stn_user').exec((err,data)=>{
		registerData(err, data, params)

	})
}

function registerData(err, data, params){//data es una instancia de la coleccion direccionIp
	if(err){
		auditoriaController.saveLogsData(params.usuario.nombreUsuario, err,params.direccionIp.direccionData, params.direccionIp.navegador)
	}else if(!data){
		auditoriaController.saveLogsData(params.usuario.nombreUsuario, constantFile.messageLog.ERROR_IP,params.direccionIp.direccionData, params.direccionIp.navegador)
	}else{
		auditoriaController.saveLogsData(params.usuario.nombreUsuario, constantFile.messageLog.SUCCESS_REGISTER_IP,params.direccionIp.direccionData, params.direccionIp.navegador)
		//recuperar correo del usuario para pasarlo por parametros a la funcion que envia email

		User.findById(data._doc.stn_user[0].id).populate({path:'stn_person'}).exec((err, data)=>{
			if(!err && data){
				emailService.sendMailChangeIp(params, constantFile.urls.CHANGE_IP, data._doc.stn_person.stn_email)
			}
		})
		/*userController.userObject(data._doc.stn_user[0], function(err, data){
			if(!err && data){
				emailService.sendMailChangeIp(params, constantFile.urls.CHANGE_IP, data._doc.stn_person.stn_email)
			}else if(err){
				console.log(err)
			}
		})*/

	}
}

function registerNewIpAnonimus(objectIp, cb){
	objectIp.save(cb)
}

function resetCount(idIp, params){
	DirectionIp.update({_id:idIp}, { $set: { stn_tryNumber: 0}},(err,data)=>{
		if(!err && data){
			auditoriaController.saveLogsData(params.usuario.nombreUsuario, constantFile.messageLog.SUCCESS_COUNT_IP,params.direccionIp.direccionData, params.direccionIp.navegador)
		}
	})
}

function resetCountByIp(idIp){
	DirectionIp.update({stn_directionIp:idIp}, { $set: { stn_tryNumber: 0}}).exec()
}

function updateRecordIpAnonimus(ipObject, cb){
	DirectionIp.findByIdAndUpdate(ipObject._id, ipObject, {new: true}, cb)
}

function findIp(ip, cb){
	DirectionIp.find({stn_directionIp:ip}, cb)
}


function checkIpForBlock(req, res){
	const ip = req.connection.remoteAddress
	DirectionIp.findOne({stn_status:false, stn_directionIp:ip}, (err, dataIp)=>{
		if(err){
			res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message : constantFile.api.ERROR_REQUEST})
		}else if(!dataIp){
			res.status(constantFile.httpCode.PETITION_CORRECT).send({status : true})
		}else{
			res.status(constantFile.httpCode.PETITION_CORRECT).send({status : false})
		}
	})
}

// eslint-disable-next-line no-undef
module.exports = {
	registerNewIp,
	addIpForUser,
	resetCount,
	findIp,
	registerNewIpAnonimus,
	updateRecordIpAnonimus,
	checkIpForBlock,
	resetCountByIp
}