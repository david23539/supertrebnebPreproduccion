'use strict'

const validationPerson = require('../Validation/person.validation')
const Person = require('../model/personData.model')
const validateDireccion = require('../Validation/direccionIp.validation')
const adapterPerson = require('../adapter/person.adapter')
const constantFile = require('../utils/Constant')
const validationGlobal = require('../Validation/global.validation')
const auditoriaController = require('./saveLogs.controller')
const userController = require('./user.controller')
const providerController = require('./provider.controller')
const adapterProvider = require('../adapter/provider.adapter')
const serviceProduct = require('../service/product.service')


// const userService = require('../service/user.service')

const emailService = require('../service/email.service')
const emailAdapter = require('../adapter/email.adapter')
const htmlrenderService = require('../service/htmlCodeVerification.service')
function sendCodeActivation(req, res) {
	const params = req.body
	const ip = req.connection.remoteAddress
	if(validationPerson.validateDataPersonEmail(params)){
		Person.find({stn_email:params.persona.email.toLowerCase()}, (err, personStorage)=>{
			if(err){
				auditoriaController.saveLogsData('undefined', constantFile.api.ERROR_REQUEST + err, ip, params.navegador)
				res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message : constantFile.api.ERROR_REQUEST})
			}else if(personStorage.length === 0){
				auditoriaController.saveLogsData('undefined',constantFile.functions.EMAIL_NO_EXIT + params.persona.email, ip, params.navegador)
				res.status(constantFile.httpCode.PETITION_CORRECT).send({message : constantFile.api.ERROR_REQUEST})
			}else{
				userController.getUserByPersonId(personStorage[0]._id, (err, userStorage)=>{
					if(err){
                        auditoriaController.saveLogsData('undefined', constantFile.api.ERROR_REQUEST + err, ip, params.navegador)
                        res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message : constantFile.api.ERROR_REQUEST})
					}

                    else if(userStorage.length !== 0){
						let codeVerification = (Math.random()* (Math.random() *100)).toString().replace('.','')
						// userService.encriptCodeVerification(codeVerification, (err, encriptCode)=>{
						// 	if(encriptCode){
						userController.setCodeValidation(codeVerification, userStorage[0]._id, (err, userUpdateStorage)=>{
							if(err || userUpdateStorage.length === 0){
								auditoriaController.saveLogsData('undefined', constantFile.api.ERROR_REQUEST + err, ip, params.navegador)
								res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message : constantFile.functions.ERROR_GENERATE_CODE})
							}else{
								emailService.sendMails(emailAdapter.adapterParamsEmail(userStorage[0]._doc.stn_username, ip, params.navegador), htmlrenderService.getHtmlCodeVerification(codeVerification), params.persona.email)//nos envia un correo con la clave y deja constacia en los logs
								res.status(constantFile.httpCode.PETITION_CORRECT).send({message : constantFile.functions.EMAIL_SEND})
							}
						})
						/*}else{
							auditoriaController.saveLogsData('undefined', constantFile.api.ERROR_REQUEST + err, ip, params.navegador)
							res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message : constantFile.functions.ERROR_GENERATE_CODE})
						}*/
					// })


					}else{
						auditoriaController.saveLogsData('undefined', constantFile.api.ERROR_REQUEST + err, ip, params.navegador)
						res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message : constantFile.functions.ERROR_GENERATE_CODE})
					}
				})
			}
		})
	}else{
		auditoriaController.saveLogsData('undefined', constantFile.api.ERROR_REQUEST + params.persona.email, ip, params.navegador)
		res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message : constantFile.functions.ERROR_PARAMETROS_ENTRADA})
	}
}

function deletePerson(personId, cb){
	Person.findByIdAndUpdate(personId, {stn_status:false}, {new: true}, cb)

}



function deletedPrevPerson(req, res){
	let personId = req.params.id
	if(validationGlobal.validateId(personId)){
		deletePerson(personId, (err, deletePerson_OUT)=>{
			if(err || !deletePerson_OUT){
				auditoriaController.saveLogsData(req.user.name,err, req.connection.remoteAddress, 'deletePerson')
				res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message: constantFile.functions.PERSONA_DELETED_FAIL})
			}else{
				auditoriaController.saveLogsData(req.user.name,constantFile.functions.PERSON_DELETED_SUCCESS,  req.connection.remoteAddress, 'deletePerson')
				res.status(constantFile.httpCode.PETITION_CORRECT).send({message: constantFile.functions.PERSON_DELETED_SUCCESS})
			}
		})
	}else{
		paramsIvalids(res)
	}

}



function createPerson(req, res){
	const paramsIN = req.body
	let person_IN = new Person
	person_IN = adapterPerson.personDataAdapterIN(paramsIN.dataPerson)
	if(validationPerson.validateAllDataPerson(person_IN) && validateDireccion.validateDirection(paramsIN.direccionIp)){
		person_IN.save((err, person_OUT)=>{
			if(err || !person_OUT){
				auditoriaController.saveLogsData(req.user.name,err, req.connection.remoteAddress, paramsIN.direccionIp.navegador)
				res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message: constantFile.functions.PERSONA_REGISTER_FAIL})
			}else{
				auditoriaController.saveLogsData(req.user.name,constantFile.functions.PERSON_REGISTER_SUCCESS,  req.connection.remoteAddress, paramsIN.direccionIp.navegador)
				res.status(constantFile.httpCode.PETITION_CORRECT).send({message: constantFile.functions.PERSON_REGISTER_SUCCESS, id: person_OUT._doc._id})
			}
		})

	}else{
		paramsIvalids(res)
	}

}

function updatePerson(req, res){
	let paramsIN = req.body
	const personId = req.params.id
	let person_IN = new Person()
	person_IN = adapterPerson.personDataAdapterIN(paramsIN.dataPerson)
	if(validationPerson.validateAllDataPerson(person_IN) && validationGlobal.validateId(personId) && validateDireccion.validateDirection(paramsIN.direccionIp)){
		person_IN._doc._id = personId
		Person.findByIdAndUpdate(personId, person_IN, {new:true}, (err, person_OUT)=>{
			if(err || !person_OUT){
				auditoriaController.saveLogsData(req.user.name,err, req.connection.remoteAddress, paramsIN.direccionIp.navegador)
				res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message: constantFile.functions.PERSON_UPDATE_ERROR})
			}else{
				auditoriaController.saveLogsData(req.user.name,constantFile.functions.PERSON_UPDATE_SUCCESS, req.connection.remoteAddress, paramsIN.direccionIp.navegador)
				res.status(constantFile.httpCode.PETITION_CORRECT).send({message: constantFile.functions.PERSON_UPDATE_SUCCESS})
			}
		})
	}else{
		paramsIvalids(res)
	}

}

function checkProviderByPerson(req, res){
	const personId = req.params.id
	if(validationGlobal.validateId(personId)){
		providerController.searchProviderByPersonId(personId, (err, providersList_OUT)=>{
			if(err){
				res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message: constantFile.functions.PERSON_ERROR})
			}else if(providersList_OUT.length === 0){
				res.status(constantFile.httpCode.PETITION_CORRECT).send({message: constantFile.functions.NO_PROVIDERS_AVAIBLE})
			}else{
				res.status(constantFile.httpCode.PETITION_CORRECT).send({providerList: adapterProvider.adapterOUTListByPerson(providersList_OUT)})
			}
		})
	}else{
		paramsIvalids(res)

	}
}

function reassigmentsPersonOfProvider(req, res){
	let params_IN = req.body
	if(validationGlobal.validateId(params_IN.dataReasignedPerson.personaAntigua) && validationGlobal.validateId(params_IN.dataReasignedPerson.personaNueva) && validateDireccion.validateDirection(params_IN.direccionIp)){
		providerController.reassigmentPersonToProvider(params_IN.dataReasignedPerson.personaNueva,params_IN.dataReasignedPerson.personaAntigua, (err, numAffected)=>{
			if(err){
				auditoriaController.saveLogsData(req.user.name,err, req.connection.remoteAddress, params_IN.direccionIp.navegador)
				res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message: constantFile.functions.PERSON_ERROR})
				sendInformationUpdateProvider(res)
			}else if(numAffected.nModified === 0){
				auditoriaController.saveLogsData(req.user.name,constantFile.messageLog.PROVIDER_RELATION_RESPONSIBLE+ numAffected, req.connection.remoteAddress, params_IN.direccionIp.navegador)
				privateUpdateProviderByPersonContact(numAffected, params_IN, res, req)
			}else{
				auditoriaController.saveLogsData(req.user.name,constantFile.messageLog.PROVIDER_RELATION_RESPONSIBLE+ numAffected, req.connection.remoteAddress, params_IN.direccionIp.navegador)
				privateUpdateProviderByPersonContact(numAffected, params_IN, res, req)
			}
		})

	}else{
		paramsIvalids(res)
	}

}

function privateUpdateProviderByPersonContact(responsibleAffected, params_IN, res, req){
	providerController.reassigmentContactPersonToProvider(params_IN.dataReasignedPerson.personaNueva,params_IN.dataReasignedPerson.personaAntigua, (err, numContAffected)=>{
		if(err){
			auditoriaController.saveLogsData(req.user.name,err, req.connection.remoteAddress, params_IN.direccionIp.navegador)
			sendInformationUpdateProvider(res)

		}else if(numContAffected.nModified === 0){
			auditoriaController.saveLogsData(req.user.name,constantFile.messageLog.PROVIDER_RELATION_CONTACT+ numContAffected, req.connection.remoteAddress, params_IN.direccionIp.navegador)
			let message = {
				responsible:responsibleAffected,
				contact:numContAffected
			}
			sendInformationUpdateProvider(res, message, false)
		}else{
			auditoriaController.saveLogsData(req.user.name,constantFile.messageLog.PROVIDER_RELATION_CONTACT+ numContAffected, req.connection.remoteAddress, params_IN.direccionIp.navegador)
			let message = {
				responsible:responsibleAffected,
				contact:numContAffected
			}
			sendInformationUpdateProvider(res, message, false)
		}
	})
}

function sendInformationUpdateProvider(res, message, error = true){
	if(error){
		res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message: constantFile.functions.PERSON_ERROR})
	}else{
		res.status(constantFile.httpCode.PETITION_CORRECT).send({affectedResponsible: message.responsible.n, affectedContact: message.contact.n})
	}
}

function getPersonByPagination(req,res){
	const param = req.body
	if(validationGlobal.validationPage(param.pagination.page)){
		Person.find({stn_status:true})
			.skip(param.pagination.page)
			.limit(10)
			.populate('stn_fk_address')
			.exec((err, personList_OUT)=>{
				if(err){
					auditoriaController.saveLogsData(req.user.name,err, req.connection.remoteAddress, 'getPersonPaginations')
					res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message: constantFile.functions.PERSON_GET_ERROR})
				}else if(personList_OUT.length === 0){
					res.status(constantFile.httpCode.PETITION_CORRECT).send({message: constantFile.functions.NO_PERSON_AVAIBLE})
				}else{
					res.status(constantFile.httpCode.PETITION_CORRECT).send({persons: adapterPerson.personList_OUT_Adapter(personList_OUT)})
				}
			})
	}else{
		paramsIvalids(res)
	}
}

function filterPerson(req, res){
	const keyword = req.params.key
	if(validationGlobal.validateId(keyword)){
		Person.find({stn_name:{$regex: keyword, $options: 'i'}, stn_status:true})
			.limit(10)
			.populate('stn_fk_address')
			.exec((err, personList_OUT)=>{
				if(err){
					auditoriaController.saveLogsData(req.user.name,err, req.connection.remoteAddress, 'getPersonFilter')
					res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message: constantFile.functions.PERSON_GET_ERROR})
				}else if(personList_OUT.length === 0){
					res.status(constantFile.httpCode.PETITION_CORRECT).send({message: constantFile.functions.NO_PERSON_AVAIBLE})
				}else{
					res.status(constantFile.httpCode.PETITION_CORRECT).send({persons: adapterPerson.personList_OUT_Adapter(personList_OUT)})
				}
			})
	}else{
		paramsIvalids(res)
	}
}

function getCountPerson(req, res){
	Person.count({stn_status:true},(err, countPerson)=>{
		if(err || !countPerson){
			res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message: constantFile.functions.PERSON_GET_ERROR})
		}else{
			res.status(constantFile.httpCode.PETITION_CORRECT).send({count:countPerson})
		}
	})
}

function updatePersonImage(req, res){
    const personId = req.params.id
    if(validationGlobal.validateId(personId)){
        if(req.files.image){
            const filename = serviceProduct.validateImageFile(req.files.image)
            if(filename){

                serviceProduct.resizeImage(req, constantFile.urls.PRODUCT_IMG_ORIGINAL+filename, constantFile.urls.PRODUCT_IMG_RESIZE+filename)
                Person.findByIdAndUpdate(personId, {stn_image:filename, stn_imagePersonResize:filename}, {new:true},(err, personUpdate)=>{
                    if(err || !personUpdate){
                        auditoriaController.saveLogsData(req.user.name,err, req.connection.remoteAddress, 'image fail')
                        res.status(constantFile.httpCode.INTERNAL_SERVER_ERROR).send({message: constantFile.functions.PERSON_GET_ERROR})
                    }else{
                        res.status(constantFile.httpCode.PETITION_CORRECT).send({message: constantFile.functions.PERSON_UPDATE_SUCCESS})
                    }
                })
            }else{
                paramsIvalids(res)
            }

        }else{
            paramsIvalids(res)
        }
    }else{
        paramsIvalids(res)
    }
}

function paramsIvalids(res){
	res.status(constantFile.httpCode.PETITION_CORRECT).send({message: constantFile.functions.ERROR_PARAMETROS_ENTRADA})
}



// eslint-disable-next-line no-undef
module.exports ={
	sendCodeActivation,
	deletePerson,
	createPerson,
	updatePerson,
	deletedPrevPerson,
	getPersonByPagination,
	filterPerson,
	getCountPerson,
	checkProviderByPerson,
	reassigmentsPersonOfProvider,
    updatePersonImage


	//getUserByEmailPersona

}