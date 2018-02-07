'use strict'
const constantFile = require('../utils/Constant')


function errorPeticion(res){
	res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({
		message:constantFile.functions.USER_REGISTER_ERROR
	})
}

function registerSuccess(res, object, message){
	res.status(constantFile.httpCode.PETITION_CORRECT).send({
		message: message,
		object
	})
}

// eslint-disable-next-line no-undef
module.exports = {
	errorPeticion,
	registerSuccess
}