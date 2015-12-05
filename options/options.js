
console.time('Options init');

function ready() {
	document.body.classList.remove('loading');
	console.timeEnd('Options init');
}

function init() {
	var $patterns = document.querySelector('#patterns');
	var $form = $patterns.form;
	var savedTimer;

	// Load
	xb.load(function(patterns) {
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

		// Save & propagate
		xb.save(patterns, function() {
			xb.propagate();

			// Notify user
			$form.classList.add('saved');
			clearTimeout(savedTimer);
			savedTimer = setTimeout(function() {
				$form.classList.remove('saved');
			}, 1500);
		});

		// Put cleaned up patterns back into textarea
		$patterns.value = patterns.join("\n");
	})
}
