'use strict'

const User = require('../model/user.model')
const personAdapter = require('./person.adapter')
const constantFile = require('../utils/Constant')

function userDataAdapter(params){
	let usuario = params.usuario
	let user = new User()
	user.stn_username = usuario.nombreUsuario
	user.stn_password = usuario.password
	user.stn_reminderPhrase = usuario.fraseRecordatorio
	user.stn_state = usuario.estado
	user.stn_role = constantFile.functions.ROL_USER
	user.stn_person = personAdapter.personDataAdapter(params.persona)
	return user
}

// eslint-disable-next-line no-undef
module.exports = {
	userDataAdapter
}