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

app.get('/pricing', (req, res, next) => {
	if (!hostIsValid(req, 'pubpub')) {
		return next();
	}

	return getInitialData(req)
		.then((initialData) => {
			return renderToNodeStream(
				res,
				<Html
					chunkName="Pricing"
					initialData={initialData}
					headerComponents={generateMetaComponents({
						initialData: initialData,
						title: 'Pricing · PubPub',
					})}
				/>,
			);
		})
		.catch(handleErrors(req, res, next));
});
