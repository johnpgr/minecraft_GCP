const functions = require('@google-cloud/functions-framework');
const AUTHORIZE_URL = process.env.AUTHORIZE_URL;

const template = `<!DOCTYPE html>
<html lang="en">
<head>
	<title>Autorizacao - Basico do cs</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<script src="https://code.jquery.com/jquery-3.7.1.min.js"
		integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
	<script>
		$.getJSON("https://api.ipify.org?format=json",
			function (data) {
				window.location.replace("${AUTHORIZE_URL}?ipv4_addr=" + data.ip);
			});
	</script>
</head>
<body>
	<div>
		Aguarde...
	</div>
</body>
</html>
`

functions.http('get-ipv4', (req, res) => {
    res.set({
        'Content-Type': 'text/html'
    }).send(template)
});
