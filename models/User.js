const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new Schema({
	username: {
		type: String,
		lowecase: true,
		required: true,
	},
	email: {
		type: String,
		lowecase: true,
		required: true,
		unique: true,
		index: { unique: true },
	},
	password: {
		type: String,
		required: true,
	},
	tokenConfirm: {
		type: String,
		default: null,
	},
	cuentaConfirmada: {
		type: Boolean,
		default: false,
	},
	imagen: {
		type: String,
		default: null,
	},
});

/* ::esto lo hace previo o antes que se guarde el User en la db:: */
userSchema.pre('save', async function (next) {
	const user = this; //this -> hace referencia a cada una de las propiedades del userSchema

	/*::si la contra del usuario ya fue hasheada, no es necesario volver a hashearlo, next() -> omitir:: */
	if (!user.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		const passHash = await bcrypt.hash(user.password, salt);

		user.password = passHash; //establecer la contraseña hasheada

		next();
	} catch (err) {
		throw new Error('Error al codificar la contraseña');
	}
});

/* ::verificar si la contraseña que puso el usuario coincida con el password encryptado de la db:: */
userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
