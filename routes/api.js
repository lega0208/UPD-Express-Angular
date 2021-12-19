const express = require('express');
const { getGreetings } = require('../db/mongo-client');

const router = express.Router();

/* GET users listing. */
router.get('/', async (req, res, next) => {
	const greetingsResults = await getGreetings();

	res.json(await greetingsResults.toArray());
});

module.exports = router;
