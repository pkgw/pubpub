export const getDashUrl = ({ collectionSlug, pubSlug, mode, submode }) => {
	let baseHref = '/dash';
	if (collectionSlug) {
		baseHref = `/dash/collection/${collectionSlug}`;
	}
	if (pubSlug) {
		baseHref = `/dash/pub/${pubSlug}`;
	}

	let baseQuery = '';
	if (collectionSlug && pubSlug) {
		baseQuery = `?collectionSlug=${collectionSlug}`;
	}

	const modeString = mode ? `/${mode.toLowerCase().replace(/ /gi, '-')}` : '';
	const submodeString = submode ? `/${submode.toLowerCase().replace(/ /gi, '-')}` : '';

	return `${baseHref}${modeString}${submodeString}${baseQuery}`;
};

export const groupPubs = ({ pubs, collections }) => {
	const groupedCollections = {};
	const basePubs = [];
	pubs.forEach((pub) => {
		if (!pub.collectionPubs.length) {
			basePubs.push(pub);
		} else {
			pub.collectionPubs.forEach((collectionPub) => {
				const groupedCollectionPubs = groupedCollections[collectionPub.collectionId] || [];
				groupedCollections[collectionPub.collectionId] = [...groupedCollectionPubs, pub];
			});
		}
	});
	return {
		collections: collections.map((collection) => {
			return { ...collection, pubs: groupedCollections[collection.id] || [] };
		}),
		pubs: basePubs,
	};
};

export const getDashboardModes = (locationData) => {
	const activeSubMode = locationData.params.subMode;
	const activeModeSlice = activeSubMode ? -2 : -1;
	const activeMode = locationData.path.split('/').slice(activeModeSlice)[0];
	return {
		mode: activeMode,
		subMode: activeSubMode,
	};
};
