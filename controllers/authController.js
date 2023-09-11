const User = require('../models/User');
const { validationResult } = require('express-validator');
const { nanoid } = require('nanoid');
const nodemailer = require('nodemailer');
require('dotenv').config();

const registerForm = (req, res) => {
	// res.render('register', { mensajes: req.flash('mensajes') });
	res.render('register');
};

const registerUser = async (req, res) => {
	const errors = validationResult(req); //en errors se almacenan todas las validaciones

	/* ::si errors tiene algo de errores:: */
	if (!errors.isEmpty()) {
		// return res.json(errors);
		req.flash('mensajes', errors.array());

		return res.redirect('/auth/register');
	}

	const { username, email, password } = req.body; //destructuring del body del body en el form(los name del form register)

	try {
		/* ::buscar al usuario por el email:: */
		let user = await User.findOne({ email: email });

		if (user) throw new Error('ya existe el usuario'); //si existe el usuario hacemos que salte al error

		user = new User({ username, email, password, tokenConfirm: nanoid() }); //si no existe el usuario,instanciamos al Schema

		await user.save(); //metodo que guarda al user en la db

		/* ::enviar correo electronico con la confirmacion de la cuenta del usuario:: */
		const transport = nodemailer.createTransport({
			host: 'sandbox.smtp.mailtrap.io',
			port: 2525,
			auth: {
				user: process.env.USER_EMAIL,
				pass: process.env.PASS_EMAIL,
			},
		});

		await transport.sendMail({
			from: '"LinksInHand 👻" <dev_kei_ow@example.com>', // sender address
			to: user.email,
			subject: 'Verifica tu cuenta de correo ✔', // Subject line
			html: `<a href="${process.env.PATH_RENDER || 'http://localhost:5000'}/auth/confirm/${
				user.tokenConfirm
			}">Verifica aquí</a>`, // html body
		});

		req.flash('mensajes', [{ msg: 'Revisa tu correo electronico y valida cuenta' }]);

		res.redirect('/auth/login');
	} catch (err) {
		req.flash('mensajes', [{ msg: err.message }]);

		return res.redirect('/auth/register');
		// res.json({ error: err.message });
	}
};

const confirmCuenta = async (req, res) => {
	const { token } = req.params; //recuperamos el parametro token de la url

	try {
		const user = await User.findOne({ tokenConfirm: token });

		if (!user) throw new Error('No existe este usuario'); //si no existe el usuario con el token respectivo

		user.cuentaConfirmada = true; //en caso si exista el user entonces cambiamos a true cuentaConfirmada
		user.tokenConfirm = null; //reiniciar el token, despues lo podemos utilizar si en el caso quiera reestablecer su password

		await user.save();

		req.flash('mensajes', [{ msg: 'Cuenta verificada puedes iniciar sesión' }]);

		res.redirect('/auth/login');
	} catch (err) {
		req.flash('mensajes', [{ msg: err.message }]);

		return res.redirect('/auth/login');
		// return res.json({ error: err.message });
	}

	// res.json(token); //con json podemos mandar una res en json al navegador
};

const loginForm = async (req, res) => {
	res.render('login');
};

const loginUser = async (req, res) => {
	const errors = validationResult(req); //aki se almacenan todas las validaciones

	if (!errors.isEmpty()) {
		req.flash('mensajes', errors.array());

		return res.redirect('/auth/login');
	}

	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email: email }); //buscamos al User a travez del email, para ver si existe ese email

		if (!user) throw new Error('No existe este email');

		if (!user.cuentaConfirmada) throw new Error('Falta confirmar cuenta'); //si la cuenta esta en false

		if (!(await user.comparePassword(password))) throw new Error('Contraseña no correcta');

		/* ::se esta creando la sesion de usuario con login() a travez de passport:: */
		req.login(user, function (err) {
			if (err) throw new Error('Error al crear la session');
			return res.redirect('/');
		});

		// res.redirect('/'); //ERROR: no se puede enviar dos respuestas a la misma ruta /
	} catch (err) {
		req.flash('mensajes', [{ msg: err.message }]);

		return res.redirect('/auth/login');

		// return res.send(err.message);
	}
};

const cerrarSession = async (req, res) => {
	/* ::se esta cerrando la sesion de usuario con logout() a travez de passport:: */
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		return res.redirect('/auth/login');
	});
};

module.exports = {
	registerForm,
	registerUser,
	confirmCuenta,
	loginForm,
	loginUser,
	cerrarSession,
};
