module.exports = (req, res, next) => {
	/* ::verificar si el usuario tiene una session activa con passport:: */
	if (req.isAuthenticated()) {
		return next(); //en caso tenga una session activa , sigua con el siguiente middleware
	}

	res.redirect('/auth/login');
};
