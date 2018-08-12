'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const helmet = require('helmet');
const path = require('path')
const compression = require('compression');





//rutas
const user_routes = require('./routes/user.route')
const category_routes = require('./routes/category.route')
const product_routes = require('./routes/product.router')
const person_router = require('./routes/person.route')
const direcctionIp_router = require('./routes/direcctionIp.route')
const provider_router = require('./routes/provider.router')
const address_router = require('./routes/address.route')
const bill_router = require('./routes/bill.route')
const notification_router = require('./routes/notifications.route')

//configurar middlewares de body-pare
app.use(bodyParser.urlencoded({extend: false}))
app.use(bodyParser.json());
app.use(helmet());
app.use(helmet.noCache());
app.use(helmet.dnsPrefetchControl());
app.use(helmet({
    frameguard: {
        action: 'deny'
    }
}));

app.disable('x-powered-by');

//configurar cabeceras y cors
app.use((req,res,next)=>{
	// res.header('Access-Control-Allow-Origin', '159.89.25.242');
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method')
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
	res.header('Allow', 'GET, POST, PUT, DELETE')
	next()
});

//rutas base
app.use('/', express.static('client', {redirect:false}))
app.use('/api', user_routes)
app.use('/api', person_router)
app.use('/api', direcctionIp_router)
app.use('/api', category_routes)
app.use('/api', product_routes)
app.use('/api', provider_router)
app.use('/api', address_router)
app.use('/api', bill_router)
app.use('/api', notification_router)

app.get('*', function(req, res, next){
	res.sendFile(path.resolve('client/index.html'))
});

app.use(compression());

//rutas body-parse


// eslint-disable-next-line no-undef
module.exports = app;