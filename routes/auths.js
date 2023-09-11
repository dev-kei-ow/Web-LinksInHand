const express = require('express');
const { body } = require('express-validator');
const {
	loginForm,
	registerForm,
	registerUser,
	confirmCuenta,
	loginUser,
	cerrarSession,
} = require('../controllers/authController');

const router = express.Router();

router.get('/register', registerForm);
router.post(
	'/register',
	[
		body('username', 'Ingrese un nombre válido').trim().notEmpty().escape(), //capturamos los name del form
		body('email', 'Ingrese un email válido').trim().isEmail().normalizeEmail(),
		body('password', 'Contraseña de min 6 carácteres')
			.trim()
			.isLength({ min: 6 })
			.escape()
			.custom((value, { req }) => {
				if (value !== req.body.confpassword) {
					throw new Error('No coindiden las contraseñas');
				} else {
					return value;
				}
			}),
	],
	registerUser
);
router.get('/confirm/:token', confirmCuenta);
router.get('/login', loginForm);
router.post(
	'/login',
	[
		body('email', 'Ingrese un email válido').trim().isEmail().normalizeEmail(),
		body('password', 'Contraseña de min 6 carácteres').trim().isLength({ min: 6 }).escape(),
	],
	loginUser
);
router.get('/logout', cerrarSession);

module.exports = router;
