
console.time('Options init');

function ready() {
	document.body.classList.remove('loading');
	console.timeEnd('Options init');
}

function init() {
	var $patterns = document.querySelector('#patterns');
	var $form = $patterns.form;
	var $instructions = document.querySelector('details');
	var $formTest = document.querySelector('#form-test');
	var $inpTestUrl = document.querySelector('#inp-test-url');
	var $msgTestResult = document.querySelector('#msg-test-result');
	var savedTimer, testTimer;

	// Open INSTRUCTIONS
	if (parseFloat($instructions.dataset.version) > parseFloat(localStorage.instructionsVersion || '0')) {
		$instructions.open = true;
	}
	$instructions.addEventListener('toggle', function(e) {
		// User closed it, so remember that
		if (!this.open) {
			localStorage.instructionsVersion = parseFloat($instructions.dataset.version);
		}
	});

	// Load
	xb.load().then(function(patterns) {
		$patterns.value = patterns.join("\n");

		ready();
	});

	// Save
	function savePatterns() {
		// Extract lines
		var patterns = $patterns.value.trim();
		if (patterns.length) {
			patterns = patterns.replace(/\r\n/g, "\n").replace(/\r/g, "\n"); // Enforce \n
			patterns = patterns.replace(/\n{2,}/, "\n\n"); // Max 1 open line
			patterns = patterns.split(/\n/); // Split to lines
			patterns = patterns.map(pattern => pattern.trim()); // Trim every line
		}
		else {
			patterns = [];
		}

		// Save & propagate
		xb.save(patterns, function() {
			xb.loadPatterns().then(rules => console.log(rules));

			// Notify user
			$form.classList.add('saved');
			clearTimeout(savedTimer);
			savedTimer = setTimeout(function() {
				$form.classList.remove('saved');
			}, 1500);
		});

		// Put cleaned up patterns back into textarea
		$patterns.value = patterns.join("\n");
	}
	$form.addEventListener('submit', function(e) {
		e.preventDefault();
		savePatterns();
	});
	$form.addEventListener('keydown', function(e) {
		if (e.ctrlKey && !e.shiftKey && !e.altKey && e.code === 'KeyS') {
			e.preventDefault();
			savePatterns();
		}
	});

	// Test a URL
	$formTest.addEventListener('submit', async function(e) {
		e.preventDefault();

		function notify(msg) {
			$formTest.classList.add('result');
			$msgTestResult.innerHTML = msg;

			clearTimeout(testTimer);
			testTimer = setTimeout(function() {
				$formTest.classList.remove('result');
			}, 3000);
		}

		var url = $inpTestUrl.value;
		var result = await xb.testURL(url);
		if ( result ) {
			notify(`Match (${result.action.toUpperCase()}) for <code>${result.pattern}</code> on line ${result.line}`);
		}
		else {
			notify('No match: pass');
		}
	});
}
