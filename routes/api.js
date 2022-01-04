const express = require('express');
const { getAllPages, getOverallMetrics } = require('../db/mongo-client');

const router = express.Router();

router.get('/pages', async (req, res, next) => {
	const pagesResults = await getAllPages();

	res.json(pagesResults);
});

router.get('/pages/:page', async (req, res, next) => {
	const pagesResults = await getAllPages();

	res.json(await pagesResults.toArray());
});

router.get('/overall-metrics', async (req, res, next) => {
	const dateQuery = {};

	if (!!req.query.startDate) {
		dateQuery.startDate = req.query.startDate;
	}

	if (!!req.query.endDate) {
		dateQuery.endDate = req.query.endDate;
	}

	const overallMetricsResults = await getOverallMetrics(dateQuery);

	res.json(await overallMetricsResults.toArray());
});

module.exports = router;
