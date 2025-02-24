let btnCalc = document.querySelector('#btn-calc');
let btnFile = document.querySelector('#btn-file');
let txtResult = document.querySelector('#txt-result');

let mapOperatorPriority = {
	'+': 0,
	'-': 0,
	'*': 1,
	'/': 1,
	'^': 2,
};

let mapValidSymbols = {
	'.': true,
};
for (let i = 0; i < 10; i++) {
	mapValidSymbols[toString(i)] = true;
}
for (let [k, v] of Object.entries(mapOperatorPriority)) {
	mapValidSymbols[k] = true;
}

function runLexer(stream) {
	let splitPattern = /(\+|\-|\*|\/|\^)/;
	let tokens = stream.split(splitPattern);
	console.log(tokens);
}

function calcLoad(event) {
	let stream = event.target.result;
	let pattern = /(\x20|\x09|\x0A|\x0D)/g;
	stream = stream.replaceAll(pattern, '');
	console.log(stream);
	runLexer(stream);
}

function calcError(event) {
	console.log('Failed to load input file');
}

btnCalc.onclick = () => {
	let upload = btnFile.files[0];
	let reader = new FileReader();
	reader.readAsText(upload, 'UTF-8');
	reader.onload = calcLoad;
	reader.onerror = calcError;
}