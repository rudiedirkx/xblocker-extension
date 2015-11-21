
console.time('Options init');

function ready() {
	document.body.classList.remove('loading');
	console.timeEnd('Options init');
}

function init() {
	var $patterns = document.querySelector('#patterns');
	var $form = $patterns.form;

	// Load
	xb.load(function(patterns) {
		console.log(patterns);
		$patterns.value = patterns.join("\n");

		ready();
	});

	// Save
	$form.addEventListener('submit', function(e) {
		e.preventDefault();

		// Clean up
		var patterns = $patterns.value.split(/[\r\n]+/).reduce(function(patterns, pattern) {
			if ( pattern = pattern.trim() ) {
				patterns.push(pattern);
			}
			return patterns;
		}, []);
		console.log(patterns);

		// Save & propagate
		xb.save(patterns, function() {
			xb.propagate();
		});

		// Put cleaned up patterns back into textarea
		$patterns.value = patterns.join("\n");
	})
}
