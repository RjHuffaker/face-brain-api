const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'test',
    database : 'face-brain'
  }
});

/*
db.select('*').from('users')
	.then(data => console.log(data));
*/

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
	db.select('*').from('users')
	.then(users => console.log(users));
});

app.post('/signin', (req, res) => {
	db.select('email', 'hash').from('login')
		.where('email', '=', req.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
			if(isValid){
				return db.select('*').from('users')
					.where('email', '=', req.body.email)
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.status(400).json('unable to get user'));
			} else {
				res.status(400).json('wrong credentials');
			}
		})
		.catch(err => res.status(400).json('wrong credentials'));;
});

app.post('/register', (req, res) => {
	const { name, email, password } = req.body;
	const hash = bcrypt.hashSync(password);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
				.returning('*')
				.insert({
					name: name,
					email: loginEmail[0].email,
					joined: new Date()
				})
				.then(user => {
					res.json(user[0]);
				})
				.catch(err => res.status(400).json('unable to register'));
		})
		.then(trx.commit)
		.catch(trx.rollback);
	});
});

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db.select('*').from('users').where({id})
		.then(user => {
			if(user.length){
				res.json(user[0]);
			} else {
				res.status(400).json('Not found');
			}
		})
		.catch(err => res.status(400).json('Not found'));
});

app.put('/image', (req, res) => {
	const { id } = req.body;
	db('users').where('id', '=', id)
	 	.increment('entries', 1)
	 	.returning('entries')
	 	.then(entries => {
	 		console.log(entries);
	 		res.json(entries[0].entries);
	 	})
	 	.catch(err => res.status(400).json('unable to get entries'));
})

app.listen('3000', () => {
	console.log('App is running');
});