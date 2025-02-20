let btnCalc = document.querySelector('#btn-calc');
let btnFile = document.querySelector('#btn-file');
let txtResult = document.querySelector('#txt-result');

let tokens = [];

function calcLoad(event) {
	let stream = event.target.result;
	let pattern = /(\x20|\x09|\x0A|\x0D)/g;
	stream = stream.replaceAll(pattern, '');
	console.log(stream);
}

btnCalc.onclick = () => {
	let upload = btnFile.files[0];
	let reader = new FileReader();
	reader.readAsText(upload, 'UTF-8');
	reader.onload = calcLoad;
}