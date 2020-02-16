import Promise from 'bluebird';
import React from 'react';
import algoliasearch from 'algoliasearch';
import Html from '../Html';
import app from '../server';
import { renderToNodeStream, getInitialData, handleErrors, generateMetaComponents } from '../utils';
import { User, Community } from '../models';

const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_KEY);
const searchId = process.env.ALGOLIA_ID;
const searchKey = process.env.ALGOLIA_SEARCH_KEY;

app.get('/search', (req, res, next) => {
	return getInitialData(req)
		.then((initialData) => {
			const findUser = User.findOne({
				where: { id: initialData.loginData.id },
				attributes: ['id'],
				include: [
					{
						model: Community,
						as: 'communities',
						required: false,
						attributes: ['id'],
						through: { attributes: [] },
					},
				],
			});
			return Promise.all([initialData, findUser]);
		})
		.then(([initialData, userData]) => {
			const userCommunities = (userData && userData.communities) || [];
			const communityFilter = initialData.locationData.isBasePubPub
				? ''
				: `communityId:${initialData.communityData.id} AND `;
			const pubCommunityAccessFilterString = userCommunities.reduce((prev, curr) => {
				return `${prev} OR branchAdminAccessId:${curr.id}`;
			}, '');
			const pubUserFilterString = initialData.loginData.id
				? ` OR branchAccessIds:${initialData.loginData.id}`
				: '';
			const pubSearchParams = {
				filters: `${communityFilter}(branchIsPublic:true${pubCommunityAccessFilterString}${pubUserFilterString})`,
			};

			const pageCommunityAccessFilterString = userCommunities.reduce((prev, curr) => {
				return `${prev} OR communityId:${curr.id}`;
			}, '');
			const pageSearchParams = {
				filters: `${communityFilter}(isPublic:true${pageCommunityAccessFilterString})`,
			};
			const searchData = {
				searchId: searchId,
				pubsSearchKey: client.generateSecuredApiKey(searchKey, pubSearchParams),
				pagesSearchKey: client.generateSecuredApiKey(searchKey, pageSearchParams),
			};

			return renderToNodeStream(
				res,
				<Html
					chunkName="Search"
					initialData={initialData}
					viewData={{ searchData: searchData }}
					headerComponents={generateMetaComponents({
						initialData: initialData,
						title: `Search · ${initialData.communityData.title}`,
						description: `Search for pubs in ${initialData.communityData.title}`,
					})}
				/>,
			);
		})
		.catch(handleErrors(req, res, next));
});
