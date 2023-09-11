const mongoose = require('mongoose');
require('dotenv').config();

const dbCnxPromise = mongoose
	.connect(process.env.URI)
	.then((m) => {
		console.log('db conectada 😎');
		return m.connection.getClient();
	})
	.catch((err) => console.log('fallo conexión con la db ❌ ' + err));

module.exports = dbCnxPromise;
