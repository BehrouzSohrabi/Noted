(function () {
	const status = document.getElementById('permission-status');

	function setStatus(message) {
		if (status) status.textContent = message;
	}

	function postPermissionResult(payload) {
		window.parent.postMessage({
			source: 'noted-microphone-permission',
			...payload,
		}, window.location.origin);
	}

	function closePermissionPage() {
		if (window.parent !== window) return;
		window.setTimeout(() => {
			window.close();
		}, 1000);
	}

	if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
		setStatus('Microphone access is not supported in this browser.');
		postPermissionResult({
			ok: false,
			name: 'NotSupportedError',
			message: 'Microphone access is not supported in this browser.',
		});
		return;
	}

	window.setTimeout(() => {
		navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
			stream.getTracks().forEach(track => track.stop());
			setStatus('Microphone access granted. Returning to Noted...');
			postPermissionResult({ ok: true });
			closePermissionPage();
		}).catch(error => {
			setStatus('Microphone access was not granted. Check Chrome site settings for this extension.');
			postPermissionResult({
				ok: false,
				name: error && error.name ? error.name : 'PermissionError',
				message: error && error.message ? error.message : 'Microphone permission was denied.',
			});
		});
	}, 1000);
}());
