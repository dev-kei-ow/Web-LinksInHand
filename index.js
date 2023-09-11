const express = require('express');
const session = require('express-session');
const mongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const csurf = require('csurf');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const { create } = require('express-handlebars');
const User = require('./models/User');
require('dotenv').config();
// require('./database/db');
const dbCnxPromise = require('./database/db');

/*=========================================================*/

const app = express();
const PORT = process.env.PORT || 5000; //Heroku tiene configurado el puerto como PORT

const corsOptions = {
	credentials: true,
	origin: process.env.PATH_RENDER || '*',
	methods: ['GET', 'POST'], //solo los verbos GET y POST, xq estamos trabajando directamente con los forms
};

app.use(cors());

/*====================:::HANDLEBARS:::=====================*/

const hbs = create({
	extname: '.hbs', //para cambiar la extension a hbs
	partialsDir: ['views/components'], //para poder insertar componentes en otros archivos
});

app.engine('hbs', hbs.engine); //decirle que hbs es el motor de plantillas
app.set('view engine', '.hbs'); //la extension se establece en .hbs
app.set('views', './views'); //los archivos van a estar dentro de la carpeta views

/*====================:::MIDDLEWARES:::=====================*/
/*::son los interceptores que intervienen en la req antes de enviar la res::*/

app.use(express.static(__dirname + '/public/assets'));
app.use(express.urlencoded({ extended: true })); //para poder leer (req.body) de un formulario
app.use(
	session({
		/* ::las sessiones se almacenan en la memoria de express por default, pero tbn se pueden config en la db:: */
		secret: process.env.SECRET_SESSION,
		resave: false,
		saveUninitialized: false,
		name: 'USER_SESSION',
		store: mongoStore.create({
			clientPromise: dbCnxPromise,
			dbName: process.env.DB_NAME,
		}),
		cookie: {
			secure: process.env.MODO === 'production', //en production secure:true(https); en developer secure:false(http=localhost)
			maxAge: 30 * 24 * 60 * 60 * 1000, //3600000, // 1 hora en milisegundos
		},
	})
);
app.use(flash()); //flash -> es una session que solo vive una vez(requiere de express-session)

app.use(passport.initialize());
app.use(passport.session());

/* ::crear la session req.user y manejarlo con passport:: */
passport.serializeUser((user, done) => done(null, { id: user._id, username: user.username }));
passport.deserializeUser(async (user, done) => {
	//TODO es necesario revisar la bd?
	const userDb = await User.findById(user.id); //verificar en la db al usuario en la db si existe vuelve a crear la session
	return done(null, { id: userDb._id, username: userDb.username });
});

/* ::middleware csurf:: */
app.use(csurf());
app.use(mongoSanitize()); //para prevenir las inyecciones NOSQL

app.use((req, res, next) => {
	res.locals.csrfToken = req.csrfToken(); //mandar el csrfToken de forma global para enviar a todos los forms
	res.locals.mensajes = req.flash('mensajes'); //mandar los mensajes de req.flash de manera global
	next();
});

// const csrfProtection = csurf({ cookie: true });
// app.use(csrfProtection);

// app.get('/rutaprotegida', (req, res) => {
// 	res.json(req.session.usuario || 'Sin sesion de usuario');
// });

// app.get('/crearsession', (req, res) => {
// 	req.session.usuario = 'dev-kei-ow';
// 	res.redirect('/rutaprotegida');
// });

// app.get('/destruirsession', (req, res) => {
// 	req.session.destroy();
// 	res.redirect('/rutaprotegida');
// });

// app.get('/mensajeflash', (req, res) => {
// 	res.json(req.flash('mensaje'));
// });

// app.get('/crearmsjflash', (req, res) => {
// 	req.flash('mensaje', 'Este es un mensaje de error');
// 	res.redirect('/mensajeflash');
// });

app.use('/', require('./routes/homes'));
app.use('/auth', require('./routes/auths'));

/*==========================================================*/

app.listen(PORT, () => console.log(`open page in server💻: 'http://localhost:${PORT}'`));
