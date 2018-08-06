/* eslint-disable no-console */
import { Sequelize } from 'sequelize';
import { sequelize, Pub, Version, PubManager, Collaborator, VersionPermission, PubAttribution, Collection, Page } from './models';
import { generateHash } from './utilities';

console.log('Beginning Migration');


new Promise((resolve)=> {
	return resolve();
})
// .then(()=> {
// 	return sequelize.queryInterface.addColumn('Pubs', 'isCommunityAdminManaged', { type: Sequelize.BOOLEAN });
// })
// .then(()=> {
// 	return sequelize.queryInterface.addColumn('Pubs', 'communityAdminDraftPermissions', {
// 		type: Sequelize.ENUM,
// 		values: ['none', 'view', 'edit'],
// 		defaultValue: 'none',
// 	});
// })
// .then(()=> {
// 	return sequelize.queryInterface.addColumn('Pubs', 'draftPermissions', {
// 		type: Sequelize.ENUM,
// 		values: ['private', 'publicView', 'publicEdit'],
// 		defaultValue: 'private',
// 	});
// })
// .then(()=> {
// 	/* Migrate to isCommunityAdminManaged property */
// 	return Pub.findAll({
// 		where: {
// 			adminPermissions: 'manage'
// 		}
// 	})
// 	.then((pubsData)=> {
// 		const pubIds = pubsData.map((pubData)=> {
// 			return pubData.id;
// 		});
// 		return Pub.update({ isCommunityAdminManaged: true }, {
// 			where: {
// 				id: { $in: pubIds }
// 			}
// 		});
// 	});
// })
// .then(()=> {
// 	/* Migrate to communityAdminDraftPermissions edit property */
// 	return Pub.findAll({
// 		where: {
// 			adminPermissions: 'edit'
// 		}
// 	})
// 	.then((pubsData)=> {
// 		const pubIds = pubsData.map((pubData)=> {
// 			return pubData.id;
// 		});
// 		return Pub.update({ communityAdminDraftPermissions: 'edit' }, {
// 			where: {
// 				id: { $in: pubIds }
// 			}
// 		});
// 	});
// })
// .then(()=> {
// 	/* Migrate to communityAdminDraftPermissions view property */
// 	return Pub.findAll({
// 		where: {
// 			adminPermissions: 'view'
// 		}
// 	})
// 	.then((pubsData)=> {
// 		const pubIds = pubsData.map((pubData)=> {
// 			return pubData.id;
// 		});
// 		return Pub.update({ communityAdminDraftPermissions: 'view' }, {
// 			where: {
// 				id: { $in: pubIds }
// 			}
// 		});
// 	});
// })
// .then(()=> {
// 	/* Migrate to draftPermissions publicView property */
// 	return Pub.findAll({
// 		where: {
// 			collaborationMode: 'publicView'
// 		}
// 	})
// 	.then((pubsData)=> {
// 		const pubIds = pubsData.map((pubData)=> {
// 			return pubData.id;
// 		});
// 		return Pub.update({ draftPermissions: 'publicView' }, {
// 			where: {
// 				id: { $in: pubIds }
// 			}
// 		});
// 	});
// })
// .then(()=> {
// 	/* Migrate to draftPermissions publicEdit property */
// 	return Pub.findAll({
// 		where: {
// 			collaborationMode: 'publicEdit'
// 		}
// 	})
// 	.then((pubsData)=> {
// 		const pubIds = pubsData.map((pubData)=> {
// 			return pubData.id;
// 		});
// 		return Pub.update({ draftPermissions: 'publicEdit' }, {
// 			where: {
// 				id: { $in: pubIds }
// 			}
// 		});
// 	});
// })
// .then(()=> {
// 	return sequelize.queryInterface.renameColumn('Pubs', 'editHash', 'draftEditHash');
// })
// .then(()=> {
// 	return sequelize.queryInterface.renameColumn('Pubs', 'viewHash', 'draftViewHash');
// })
// .then(()=> {
// 	return sequelize.queryInterface.addColumn('Versions', 'isPublic', { type: Sequelize.BOOLEAN });
// })
// .then(()=> {
// 	/* Set all versions to be public, since that is what they were when published */
// 	return Version.update({ isPublic: true }, {
// 		where: { isPublic: null }
// 	});
// })
// .then(()=> {
// 	return sequelize.queryInterface.addColumn('Versions', 'isCommunityAdminShared', { type: Sequelize.BOOLEAN });
// })
// .then(()=> {
// 	/* Set isCommunityAdminShared for all versions of pubs which had adminPermissions !== none */
// 	return Pub.findAll({
// 		where: {
// 			adminPermissions: { $ne: 'none' }
// 		}
// 	})
// 	.then((pubsData)=> {
// 		const pubIds = pubsData.map((pubData)=> {
// 			return pubData.id;
// 		});
// 		return Version.update({ isCommunityAdminShared: true }, {
// 			where: {
// 				pubId: { $in: pubIds }
// 			}
// 		});
// 	});
// })
// .then(()=> {
// 	return sequelize.queryInterface.addColumn('Versions', 'viewHash', { type: Sequelize.STRING });
// })
// .then(()=> {
// 	/* Set viewHash for all versions */
// 	return Version.findAll()
// 	.then((versionsData)=> {
// 		const versionEvents = versionsData.map((versionData)=> {
// 			return Version.update({ viewHash: generateHash(8) }, {
// 				where: { id: versionData.id }
// 			});
// 		});
// 		return Promise.all(versionEvents);
// 	});
// })
// .then(()=> {
// 	/* Create PubManager items */
// 	return Collaborator.findAll({
// 		where: { permissions: 'manage' }
// 	})
// 	.then((collaboratorsData)=> {
// 		const newPubManagers = collaboratorsData.map((collaboratorData)=> {
// 			return { userId: collaboratorData.userId, pubId: collaboratorData.pubId };
// 		});
// 		return PubManager.bulkCreate(newPubManagers);
// 	});
// })
// .then(()=> {
// 	/* Create VersionPermission items for edit and view */
// 	return Collaborator.findAll({
// 		where: { permissions: { $in: ['edit', 'view'] } }
// 	})
// 	.then((collaboratorsData)=> {
// 		const pubIds = collaboratorsData.map((collaboratorData)=> {
// 			return collaboratorData.pubId;
// 		});
// 		const findVersions = Version.findAll({
// 			where: {
// 				pubId: { $in: pubIds }
// 			}
// 		});
// 		return Promise.all([collaboratorsData, findVersions]);
// 	})
// 	.then(([collaboratorsData, versionsData])=> {
// 		const userIdByPubId = {};
// 		collaboratorsData.forEach((item)=> {
// 			userIdByPubId[item.pubId] = item.userId;
// 		});

// 		/* For all edit Collaborators, we need to create a record on the Draft with edit permissions */
// 		const newDraftPermissionsEdit = collaboratorsData.filter((item)=> {
// 			return item.permissions === 'edit';
// 		}).map((collaboratorData)=> {
// 			return {
// 				pubId: collaboratorData.pubId,
// 				permissions: 'edit',
// 				userId: collaboratorData.userId,
// 			};
// 		});

// 		/* For all view Collaborators, we need to create a record on the Draft with view permissions */
// 		const newDraftPermissionsView = collaboratorsData.filter((item)=> {
// 			return item.permissions === 'view';
// 		}).map((collaboratorData)=> {
// 			return {
// 				pubId: collaboratorData.pubId,
// 				permissions: 'view',
// 				userId: collaboratorData.userId,
// 			};
// 		});

// 		/* For all collaborators (view and edit) we need to create a record for the version with view permissions */
// 		const newVersionPermissions = versionsData.map((versionData)=> {
// 			return {
// 				pubId: versionData.pubId,
// 				permissions: 'view',
// 				userId: userIdByPubId[versionData.pubId],
// 				versionId: versionData.id
// 			};
// 		});
// 		return VersionPermission.bulkCreate([...newDraftPermissionsEdit, ...newDraftPermissionsView, ...newVersionPermissions]);
// 	});
// })
// .then(()=> {
// 	/* Create PubAttribution for all Collaborators with isAuthor or isContributor */
// 	return Collaborator.findAll({
// 		where: {
// 			$or: [
// 				{ isAuthor: true },
// 				{ isContributor: true }
// 			]
// 		}
// 	})
// 	.then((collaboratorsData)=> {
// 		const newPubAttributions = collaboratorsData.map((collaboratorData)=> {
// 			return {
// 				name: collaboratorData.name,
// 				order: collaboratorData.order,
// 				isAuthor: collaboratorData.isAuthor,
// 				roles: collaboratorData.roles,
// 				userId: collaboratorData.userId,
// 				pubId: collaboratorData.pubId,
// 			};
// 		});
// 		return PubAttribution.bulkCreate(newPubAttributions);
// 	});
// })
.then(()=> {
	/* Migrate Collections to Pages */
	return Collection.findAll({})
	.then((collectionsData)=> {
		const newPages = collectionsData.map((collection)=> {
			return {
				id: collection.id,
				title: collection.title,
				description: collection.description,
				slug: collection.slug,
				isPublic: collection.isPublic,
				viewHash: collection.createPubHash,
				layout: collection.layout,
				communityId: collection.communityId,
			};
		});
		return Page.bulkCreate(newPages);
	});
})
.catch((err)=> {
	console.log('Error with Migration', err);
})
.finally(()=> {
	console.log('Ending Migration');
	process.exit();
});

/* In case we need to remove an enum type again */
// .then(()=> {
// 	return sequelize.queryInterface.sequelize.query('DROP TYPE "enum_Pubs_communityAdminDraftPermissions";');
// })
