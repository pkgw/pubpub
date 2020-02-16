import React from 'react';
import Promise from 'bluebird';
import Html from '../Html';
import app from '../server';
import {
	hostIsValid,
	renderToNodeStream,
	getInitialData,
	handleErrors,
	generateMetaComponents,
} from '../utils';
import { findPage } from '../utils/pageQueries';

app.get(['/', '/:slug'], (req, res, next) => {
	if (!hostIsValid(req, 'community')) {
		return next();
	}

	return getInitialData(req)
		.then((initialData) => {
			const pageId = initialData.communityData.pages.reduce((prev, curr) => {
				if (curr.slug === '' && req.params.slug === undefined) {
					return curr.id;
				}
				if (curr.slug === req.params.slug) {
					return curr.id;
				}
				return prev;
			}, undefined);

			if (!pageId) {
				throw new Error('Page Not Found');
			}

			return Promise.all([initialData, findPage(pageId, true, initialData)]);
		})
		.then(([initialData, pageData]) => {
			const pageTitle = !pageData.slug
				? initialData.communityData.title
				: `${pageData.title} · ${initialData.communityData.title}`;
			return renderToNodeStream(
				res,
				<Html
					chunkName="Page"
					initialData={initialData}
					viewData={{ pageData: pageData }}
					headerComponents={generateMetaComponents({
						initialData: initialData,
						title: pageTitle,
						description: pageData.description,
						image: pageData.avatar,
						unlisted: !pageData.isPublic,
					})}
				/>,
			);
		})
		.catch(handleErrors(req, res, next));
});
