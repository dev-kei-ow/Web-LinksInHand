// console.log('Hola soy frontend');

document.addEventListener('click', (e) => {
	if (e.target.dataset.short) {
		const url = `${window.location.origin}/${e.target.dataset.short}`;

		navigator.clipboard
			.writeText(url)
			.then(() => {
				console.log('Copiado en el portapapeles...');
			})
			.catch(() => {
				console.log('Sucedio algún error', err);
			});
	}
});
