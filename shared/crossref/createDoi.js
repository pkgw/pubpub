const PUBPUB_DOI_PREFIX = '10.21428';
const MITP_DOI_PREFIX = '10.1162';
const IASTATE_DOI_PREFIX = '10.31274';
const APA_DOI_PREFIX = '10.3847';
const MEDIASTUDIES_DOI_PREFIX = '10.32376';
const splitId = (item) => item.id.split('-')[0];

const choosePrefixForCommunity = (community) => {
	if (
		communityId === '99608f92-d70f-46c1-a72c-df272215f13e' //HDSR
		||
		communityId === '00c13b77-f067-4b53-8f11-c97aa4b024ff' //Projections
	) {
		return MITP_DOI_PREFIX;
	}
	if (community.id === '3d9ea6a4-25b9-42d3-8ceb-22459c649096') {
		return IASTATE_DOI_PREFIX;
	}
	return PUBPUB_DOI_PREFIX;
};

export const makeComponentId = (community, collection, pub) =>
	[community && splitId(community), collection && splitId(collection), pub && splitId(pub)]
		.map((result) => result || 'none')
		.join('-');

export default ({ community, target }) => {
	const communityPart = splitId(community);
	const targetPart = target ? `.${splitId(target)}` : '';
	const component = communityPart + targetPart;
	return `${choosePrefixForCommunity(community)}/${component}`;
};
