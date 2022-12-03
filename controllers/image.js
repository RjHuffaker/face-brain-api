const Clarifai = require('clarifai');

const app = new Clarifai.App({
  apiKey: "5675b0b21b9f45eda84cc78380127fd1"
});

const handleApiCall = (req, res) => {
	app.models
		.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
		.then(data => {
			res.json(data);
		})
		.catch(err => res.status(400).json('unable to work with api'));
}

const handleImage = (db) => (req, res) => {
	const { id } = req.body;
		db('users').where('id', '=', id)
		 	.increment('entries', 1)
		 	.returning('entries')
		 	.then(entries => {
		 		console.log(entries);
		 		res.json(entries[0].entries);
		 	})
		 	.catch(err => res.status(400).json('unable to get entries'));
}

module.exports = {
	handleApiCall: handleApiCall,
	handleImage: handleImage
};