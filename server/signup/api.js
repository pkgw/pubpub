import app from '../server';
import { createSignup } from './queries';

app.post('/api/signup', (req, res) => {
	if (req.body.confirmEmail) {
		throw new Error('Not Authorized');
	}
	return createSignup(req.body, req.hostname)
		.then(() => {
			return res.status(201).json(true);
		})
		.catch((err) => {
			console.error('Error in postSignup: ', err);
			return res.status(500).json(err.message);
		});
});
