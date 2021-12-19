const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

module.exports.getGreetings = async function() {
	try {
		await client.connect();

		const db = client.db('Test');
		const greetings = db.collection('test');

		return greetings.find();
	} catch (e) {
		// Ensures that the client will close when you finish/error
		console.error(e);
		await client.close();
	}
}
