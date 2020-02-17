import React from 'react';
import Html from '../Html';
import app from '../server';
import {
	hostIsValid,
	renderToNodeStream,
	getInitialData,
	handleErrors,
	generateMetaComponents,
} from '../utils';
// import { getReviews } from '../utils/queryHelpers';

app.get(
	['/dash/reviews', '/dash/collection/:collectionSlug/reviews', '/dash/pub/:pubSlug/reviews'],
	async (req, res, next) => {
		try {
			if (!hostIsValid(req, 'community')) {
				return next();
			}
			const initialData = await getInitialData(req, true);
			// const reviewsData = await getReviews(initialData);
			const reviewsData = {};
			return renderToNodeStream(
				res,
				<Html
					chunkName="DashboardReviews"
					initialData={initialData}
					viewData={{ reviewsData: reviewsData }}
					headerComponents={generateMetaComponents({
						initialData: initialData,
						title: `Reviews · ${initialData.scopeData.elements.activeTarget.title}`,
						unlisted: true,
					})}
				/>,
			);
		} catch (err) {
			return handleErrors(req, res, next)(err);
		}
	},
);
