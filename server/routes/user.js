import Promise from 'bluebird';
import React from 'react';
import { isPubPublic } from 'shared/pub/permissions';
import { formatAndAuthenticatePub } from '../utils/formatPub';
import Html from '../Html';
import app from '../server';
import {
	Branch,
	Community,
	Pub,
	PubAttribution,
	User,
	CommunityAdmin,
	PubManager,
	BranchPermission,
} from '../models';
import { renderToNodeStream, getInitialData, handleErrors, generateMetaComponents } from '../utils';

app.get(['/user/:slug', '/user/:slug/:mode'], (req, res, next) => {
	const getUserData = User.findOne({
		where: {
			slug: req.params.slug.toLowerCase(),
		},
		attributes: {
			exclude: ['salt', 'hash', 'email', 'updatedAt'],
		},
		include: [
			{
				model: PubAttribution,
				as: 'attributions',
				required: false,
				include: [
					{
						model: Pub,
						as: 'pub',
						attributes: ['id', 'title', 'description', 'slug', 'avatar', 'communityId'],
						include: [
							{
								// separate: true,
								model: Branch,
								as: 'branches',
								// required: true,
								include: [
									{
										model: BranchPermission,
										as: 'permissions',
										separate: true,
										required: false,
									},
								],
							},
							{
								model: PubManager,
								as: 'managers',
								separate: true,
								// required: false,
							},
							{
								model: Community,
								as: 'community',
								attributes: [
									'id',
									'subdomain',
									'domain',
									'title',
									'accentColorLight',
									'accentColorDark',
									'headerLogo',
									'headerColorType',
								],
							},
						],
					},
				],
			},
		],
	});

	return Promise.all([getInitialData(req), getUserData])
		.then(([initialData, userData]) => {
			if (!userData) {
				throw new Error('User Not Found');
			}

			const userDataJson = userData.toJSON();

			if (userDataJson.attributions) {
				userDataJson.attributions = userDataJson.attributions.filter((attribution) => {
					const isOwnProfile = userDataJson.id === initialData.loginData.id;
					if (isOwnProfile) {
						return true;
					}
					const formattedPub = formatAndAuthenticatePub(
						{
							pub: {
								...attribution.pub,
								attributions: [{ ...attribution, user: userDataJson }],
							},
							loginId: initialData.loginData.id,
							scopeData: initialData.scopeData,
							req: { query: {}, params: {} },
						},
						false,
					);
					return formattedPub && isPubPublic(formattedPub, initialData.scopeData);
				});
			}

			const isNewishUser = Date.now() - userData.createdAt.valueOf() < 1000 * 86400 * 30;

			return renderToNodeStream(
				res,
				<Html
					chunkName="User"
					initialData={initialData}
					viewData={{ userData: userDataJson }}
					headerComponents={generateMetaComponents({
						initialData: initialData,
						title: `${userDataJson.fullName} · PubPub`,
						description: userDataJson.bio,
						image: userDataJson.avatar,
						canonicalUrl: `https://www.pubpub.org/user/${userDataJson.slug}`,
						unlisted: isNewishUser,
					})}
				/>,
			);
		})
		.catch(handleErrors(req, res, next));
});
