const inputBox = document.getElementById('input');
const outputBox = document.getElementById('output');
const argsBox = document.getElementById('args');

inputBox.addEventListener('input', () => execute(inputBox.value));
argsBox.addEventListener('input', () => execute(inputBox.value));

const escapeRegex = /\[ ?[\|{}] ?\]/g; // I know the regex is weird, I'm mimicking the behavior of actual custom commands
const responseRegex = /{[^{}]*}/g;

// objects as maps to mimic the insane objects as maps behavior of custom commands
let variables = {};

const responses = { // cramped section hopefully you can manage
	choose: (...things) => things[Math.floor(Math.random() * things.length)],
	var: (vname, value) => {
		variables[vname] = value;
		return '';
	},
	args: (start, end) => {
		if (start) return ccEscape(argsBox.value);
		const arguments = ccEscape(argsBox.value).split(/ +/g); // splitting on all whitespace is the way I'd do it but robotop does not do that

		if (start == '#') return arguments.length;
		start = +start;
		
		if (end == '#') end = arguments.length;
		end &&= +end;

		return ccEscape((end) ? arguments.slice(start-1, end).join(' ') : arguments.slice(start-1, start).join(''));
	},
	test: (thing, otherThing, theyTheSame, theyDifferent) => {
		if (thing == otherThing) return theyTheSame;
		else return theyDifferent;
	},
	lower: (text) => text?.toLowerCase(),
	upper: (text) => text?.toUpperCase(),
	length: (text) => text?.length,
	__proto__: () => 'unknown' // I refuse to change how my system works just to deal with __proto__ right
};

function execute(input) {
	input = ccEscape(input);
	let step = 0;
	let prevStep = null;

	variables = {};

	while (step <= 250 && input != prevStep) { // nah we'll put no comments here
		step++;
		prevStep = input;
		
		input = input.replaceAll(responseRegex, responseText => {
			const responseArgs = responseText.slice(1, -1).split('|');
			const responseName = responseArgs.shift();

			const response = responses[responseName.toLowerCase()] && String(responses[responseName.toLowerCase()](...responseArgs) ?? '');
			const variable = variables[responseName] && variables[responseName];

			return response ?? variable ?? responseText;
		});
	};

	
	outputBox.innerText = input;
};

function ccEscape(input) {
	return input.replaceAll(escapeRegex, match => {
		const symbol = match.slice(1, -1).trim();

		if (symbol == '{') return '❴'; // I could use switch but there's only three symbols who cares
		else if (symbol == '|') return '⏐';
		else if (symbol == '}') return '❵';
	});
};