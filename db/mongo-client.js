const { MongoClient } = require('mongodb');

const {
	DB_HOST,
	DB_PORT,
	DB_USERNAME,
	DB_PASSWORD,
	DB_QUERYSTRING,
} = process.env;

const connectionString = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_QUERYSTRING}`;

const client = new MongoClient(process.env.NODE_ENV === 'production' ? connectionString : 'mongodb://localhost:27017/');

module.exports.getPage = async function(pageId, options = {
	metrics: {
		fields: ['Visits'],
		dateRange: {
			startDate: new Date(),
			endDate: new Date(),
		}
	}
}) {
	const query = {};

	const { dateRange } = options.metrics;

	if (!!dateRange.startDate) {
		query.$gte = new Date(dateRange.startDate);
	}

	if (!!dateRange.endDate) {
		query.$lte = new Date(dateRange.endDate);
	}

	try {
		await client.connect();

		const db = client.db('upd-test');
		const pages = db.collection('pages');
		const metrics = db.collection('pages_metrics');

		// todo: use aggregation (or create a view) to reduce number of queries
		const pageData = await pages.findOne({ _id: pageId });

		query['Page URL (v12)'] = pageData.Url;

		const pageMetrics = await metrics.find(query).sort({ Date: 1 }).toArray();

		return {
			...pageData,
			metrics: pageMetrics,
		}
	} catch (e) {
		console.error(`Whoops, an error! Failed to get page metrics for: ${pageId}`)
	}
}

module.exports.getAllPages = async function() {
	try {
		await client.connect();

		const db = client.db('upd-test');
		const pages = db.collection('pages');

		return await pages.find().toArray();
	} catch (e) {
		// Ensures that the client will close when you finish/error
		console.error(e);
		await client.close();
	}
}

module.exports.getOverallMetrics =
	async function(dateRange = { startDate: undefined, endDate: undefined }) {
		const dateQuery = {};

		if (!!dateRange.startDate) {
			dateQuery.$gte = new Date(dateRange.startDate);
		}

		if (!!dateRange.endDate) {
			dateQuery.$lte = new Date(dateRange.endDate);
		}

		try {
			await client.connect();

			const db = client.db('upd-test');
			const overallMetrics = db.collection('overall_metrics');

			if (Object.keys(dateQuery).length > 0) {
				return overallMetrics.find({ Date: dateQuery }).sort({ Date: 1 });
			}

			return overallMetrics.find();
		} catch (e) {
			// Ensures that the client will close when you finish/error
			console.error(e);
			await client.close();
		}
	}
