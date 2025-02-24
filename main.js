let btnCalc = document.querySelector('#btn-calc');
let btnFile = document.querySelector('#btn-file');
let txtResult = document.querySelector('#txt-result');

const ID_DEFAULT = 0;
const ID_NUMBER = 1;
const ID_OPERATOR = 2;

let mapOperatorPriority = {
	'+': 0,
	'-': 0,
	'*': 1,
	'/': 1,
	'^': 2,
};

let mapValidSymbols = {
	'\x20': true,
	'\x09': true,
	'\x0A': true,
	'\x0D': true,
	'.': true,
};
for (let i = 0; i < 10; i++) {
	mapValidSymbols[i.toString()] = true;
}
for (let [k, v] of Object.entries(mapOperatorPriority)) {
	mapValidSymbols[k] = true;
}

function docError(msg) {
	console.log(msg);
	txtResult.innerHTML = msg;
}

function createToken(value, id, ln0, cl0) {
	return {
		'value': value,
		'id': id,
		'ln0': ln0,
		'cl0': cl0,
		'ln1': ln0,
		'cl1': cl0 + value.length,
	};
}

function runLexer(stream) {
	let lnCount = 1;
	let clCount = 1;
	let ln0 = 1;
	let cl0 = 1;
	let value = '';
	let id = ID_DEFAULT;
	for (let i = 0; i < stream.length; i++) {
		let char = stream.substring(i, i+1);
		if (mapValidSymbols[char] !== true) {
			let hexCode = char.charCodeAt(0).toString(16).toUpperCase();
			docError(`Invalid symbol (0x${hexCode}) detected.`);
		}
	}
	let splitPattern = /(\+|\-|\*|\/|\^)/;
	let tokens = stream.split(splitPattern);
	return tokens;
}

// EM PROGRESSO
function runSyntax(tokens) {
	let neutralZeroPattern = /(\+|\-)/;
	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i].length === 0) {
			let closestOperator = i+1;
			if (closestOperator >= tokens.length) {
				closestOperator = i-1;
			}
			if (tokens[closestOperator].match(neutralZeroPattern) !== null) {
				tokens[i] = '0';
			} else {
				tokens[i] = '1';
			}
		}

	}
	console.log(tokens);
}

function calcLoad(event) {
	let stream = event.target.result;
	//let pattern = /(\x20|\x09|\x0A|\x0D)/g;
	//stream = stream.replaceAll(pattern, '');
	//console.log(stream);
	let tokens = runLexer(stream);
	runSyntax(tokens);
}

function calcError(event) {
	docError('There was a problem loading the file.')
}

btnCalc.onclick = () => {
	let upload = btnFile.files[0];
	let reader = new FileReader();
	reader.readAsText(upload, 'UTF-8');
	reader.onload = calcLoad;
	reader.onerror = calcError;
}