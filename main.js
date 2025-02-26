let btnCalc = document.querySelector('#btn-calc');
let btnFile = document.querySelector('#btn-file');
let txtResult = document.querySelector('#txt-result');
let tblTokens = document.querySelector('#token-table')

const ID_DEFAULT = 0;
const ID_INVALID = 1;
const ID_NUMBER = 2;
const ID_OPERATOR = 3;

let mapOperatorPriority = {
	'+': 0,
	'-': 0,
	'*': 1,
	'/': 1,
	'^': 2,
};

let mapBreakingSymbols = {
	'\x20': true,
	'\x09': true,
	'\x0A': true,
	'\x0D': true,
};

let mapValidSymbols = {
	'.': true,
	'(': true,
	')': true,
};
for (let i = 0; i < 10; i++) {
	mapValidSymbols[i.toString()] = true;
}
for (let [k, v] of Object.entries(mapOperatorPriority)) {
	mapValidSymbols[k] = true;
}
for (let [k, v] of Object.entries(mapBreakingSymbols)) {
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
	};
}

function updateDocTable(tokens) {
	let body = tblTokens.children[0];
	let rows = body.children;
	for (let i = rows.length-1; i < tokens.length; i++) {
		let r = document.createElement('tr');
		body.appendChild(r);
	}
	let clCount = rows[0].children.length;
	for (let i = 0; i < tokens.length; i++) {
		let r = rows[i+1];
		let columns = r.children;
		for (let j = columns.length; j < clCount; j++) {
			let c = document.createElement('td');
			r.appendChild(c);
		}
		columns[0].innerHTML = tokens[i].value;
		columns[1].innerHTML = tokens[i].id;
		columns[2].innerHTML = tokens[i].ln0;
		columns[3].innerHTML = tokens[i].cl0;
		columns[4].innerHTML = tokens[i].cl0 + tokens[i].value.length - 1;
	}
}

function runLexer(stream) {
	let column = 0;
	let id = ID_DEFAULT;
	let decimalFound = false;
	let tokens = [];
	let lines = stream.split(/\x0A/);
	for (let i = 0; i < lines.length; i++) {
		let row = lines[i];
		column = 0;
		let value = '';
		for (let j = 0; j < row.length; j++) {
			let char = row.substring(j, j+1);
			let isValidChar = `${char}` in mapValidSymbols;
			let isOperatorChar = `${char}` in mapOperatorPriority;
			if (id === ID_DEFAULT) {
				if (!isValidChar) {
					value = '';
					let hexCode = char.charCodeAt(0).toString(16).toUpperCase();
					docError(`Invalid symbol (0x${hexCode}) detected.`);
					tokens.push(createToken(char, ID_INVALID, i+1, j+1));
				} else if (isOperatorChar) {
					value = '';
					tokens.push(createToken(char, ID_OPERATOR, i+1, j+1));
				} else if (char.match(/([0-9])/) !== null) {
					column = j+1;
					id = ID_NUMBER;
					value = char;
					decimalFound = char.charCodeAt(0) === ('.').charCodeAt(0);
				}
			} else if (id === ID_NUMBER) {
				let isDecimalSymbol = char.charCodeAt(0) === ('.').charCodeAt(0);
				if (!isValidChar) {
					tokens.push(createToken(value, ID_NUMBER, i+1, column));
					id = ID_DEFAULT;
					value = '';

					let hexCode = char.charCodeAt(0).toString(16).toUpperCase();
					docError(`Invalid symbol (0x${hexCode}) detected.`);
					tokens.push(createToken(char, ID_INVALID, i+1, j+1));
				} else if (isOperatorChar) {
					tokens.push(createToken(value, ID_NUMBER, i+1, column));
					value = '';
					id = ID_DEFAULT;
					
					tokens.push(createToken(char, ID_OPERATOR, i+1, j+1));
				} else if (char.match(/([0-9])/) !== null) {
					value += char;
				} else if (isDecimalSymbol) {
					if (decimalFound) {
						tokens.push(createToken(value, ID_NUMBER, i+1, column));
						column = j+1;
						id = ID_NUMBER;
						value = char;
					} else {
						value += char;
					}
					decimalFound = true;
				}
			}
		}
		if (value.length > 0 && id === ID_NUMBER) {
			tokens.push(createToken(value, ID_NUMBER, i+1, column));
		}
	}
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
	updateDocTable(tokens);
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