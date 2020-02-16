import React from 'react';
import Html from '../Html';
import app from '../server';
import { renderToNodeStream, getInitialData, handleErrors, generateMetaComponents } from '../utils';

app.get('/tos', (req, res, next) => {
	return getInitialData(req)
		.then((initialData) => {
			return renderToNodeStream(
				res,
				<Html
					chunkName="Terms"
					initialData={initialData}
					headerComponents={generateMetaComponents({
						initialData: initialData,
						title: `Terms of Service · ${initialData.communityData.title}`,
						description: initialData.communityData.description,
					})}
				/>,
			);
		})
		.catch(handleErrors(req, res, next));
});
