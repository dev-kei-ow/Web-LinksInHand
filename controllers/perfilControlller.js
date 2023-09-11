const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const jimp = require('jimp');
const User = require('../models/User');

module.exports.formPerfil = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		res.render('perfil', { user: req.user, imagen: user.imagen });
	} catch (err) {
		req.flash('mensajes', [{ msg: 'Error al leer el usuario' }]);
		return res.redirect('/perfil');
	}
};

module.exports.editarFotoPerfil = async (req, res) => {
	const form = new formidable.IncomingForm();
	form.maxFileSize = 50 * 1024 * 1024; //50MB

	form.parse(req, async (err, fields, files) => {
		try {
			if (err) {
				//TODO SI NO MANDO NINGUN ARCHIVO, AVERIGUAR CON LA PROPIEDAD originalFilename de files
				throw new Error('por favor agregue una imagen');
			}
			// console.log(fields);
			// console.log(files);

			const file = files.myFile[0]; //acceder al primer obj del array myFile

			// console.log(file);

			const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

			if (!imageTypes.includes(file.mimetype)) {
				throw new Error('Por favor agrega una imagen .jpg o png');
			}

			if (file.size > 50 * 1024 * 1024) {
				throw new Error('Menos de 50MB	por favor');
			}

			const extension = file.mimetype.split('/')[1];
			const dirFile = path.join(
				__dirname,
				`../public/assets/img/perfiles/${req.user.id}.${extension}`
			);

			console.log(dirFile);

			fs.renameSync(file.filepath, dirFile);

			/* ::redimensionar y cambiar la calidad de la imagen con jimp:: */
			const image = await jimp.read(dirFile);
			image.resize(200, 200).quality(90).writeAsync(dirFile);

			/* ::buscamos al user por su id:: */
			const user = await User.findById(req.user.id);
			user.imagen = `${req.user.id}.${extension}`;
			await user.save();

			req.flash('mensajes', [{ msg: 'se subio la imagen correctamente' }]);
		} catch (err) {
			req.flash('mensajes', [{ msg: err.message }]);
		} finally {
			return res.redirect('/perfil');
		}
	});
};
