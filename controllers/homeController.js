const Url = require('../models/Url');
const { nanoid } = require('nanoid');

const agregarUrl = async (req, res) => {
	const { origin } = req.body; //destructurar y viene el (name=origin) del componente Form

	try {
		const url = new Url({ origin: origin, shortUrl: nanoid(8), user: req.user.id }); //guadar las URLs de un usuario especifico

		await url.save();

		req.flash('mensajes', [{ msg: 'Url agregada' }]);

		res.redirect('/'); //redirigirse a la pagina (home.hbs)
	} catch (err) {
		console.log(err);
		res.send('Error algo falló');
	}
};

const leerUrls = async (req, res) => {
	console.log(req.user); // lo que viene del middleware verificarUser con la session del user

	try {
		/* ::find() -> trae un Array de objetos de moongose, por eso le paso lean() para que devuelva un objeto JS tradicional:: */
		const urls = await Url.find({ user: req.user.id }).lean(); //solo las Urls que pertenecen a un usuario especifico
		res.render('home', { urls: urls });
	} catch (err) {
		req.flash('mensajes', [{ msg: err.message }]);

		return res.redirect('/');
	}
};

const editarUrlForm = async (req, res) => {
	const { id } = req.params;

	try {
		const url = await Url.findById(id).lean();

		if (!url.user.equals(req.user.id)) {
			throw new Error('No es tu Url');
		}

		res.render('home', { url });
	} catch (err) {
		req.flash('mensajes', [{ msg: err.message }]);

		return res.redirect('/');
	}
};

const editarUrl = async (req, res) => {
	const { id } = req.params;
	const { origin } = req.body;

	try {
		const url = await Url.findById(id);

		if (!url.user.equals(req.user.id)) {
			throw new Error('No es tu Url');
		}

		await Url.updateOne({ origin });

		req.flash('mensajes', [{ msg: 'Url editada' }]);

		//await Url.findByIdAndUpdate(id, { origin: origin });
		res.redirect('/');
	} catch (err) {
		req.flash('mensajes', [{ msg: err.message }]);

		return res.redirect('/');
	}
};

const eliminarUrl = async (req, res) => {
	const { id } = req.params; //recuperamos el :id del endpoint /eliminar/:id
	try {
		// await Url.findByIdAndDelete(id);

		const url = await Url.findById(id); //buscar la url que el usuario esta buscando para eliminarlo

		if (!url.user.equals(req.user.id)) {
			throw new Error('No es tu Url');
		}

		await url.deleteOne({ _id: id });

		req.flash('mensajes', [{ msg: 'Url eliminada' }]);

		res.redirect('/');
	} catch (err) {
		req.flash('mensajes', [{ msg: err.message }]);

		return res.redirect('/');
	}
};

const redireccionamiento = async (req, res) => {
	const { shortUrl } = req.params;

	try {
		const url = await Url.findOne({ shortUrl: shortUrl });

		res.redirect(url.origin);
	} catch (err) {
		req.flash('mensajes', [{ msg: 'No existe esta Url configurada' }]);
		return res.redirect('/auth/login');
	}
};

module.exports = {
	leerUrls,
	agregarUrl,
	editarUrlForm,
	editarUrl,
	eliminarUrl,
	redireccionamiento,
};
