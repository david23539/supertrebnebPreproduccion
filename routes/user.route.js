/* eslint-disable no-unused-vars */
'use strict'

const express = require('express')
const UserController = require('../controller/user.controller')
const api = express.Router()
const md_auth = require('../middleware/autenticate.middleware')

// api.post('/registerNewUser',md_auth.ensureAuth, UserController.registerUser)
api.post('/registerNewUser', UserController.registerUser)
api.post('/login', UserController.login)
api.post('/compareCode', UserController.compareCodeActivation)
api.post('/getDataUser', md_auth.ensureAuth,  UserController.getUserData)

//api.post('/newPass', UserController.changePassword)

// eslint-disable-next-line no-undef
module.exports = api