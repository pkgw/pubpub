/**
 * Utilities for providing canonical URLs for different entities
 */

export const communityUrl = (community) => {
	if (community.domain) {
		if (community.domain.includes('localhost:')) {
			return `http://${community.domain}`;
		}
		return `https://${community.domain}`;
	}
	return `https://${community.subdomain}.pubpub.org`;
};

export const collectionUrl = (community, collection) =>
	`${communityUrl(community)}/collection/${collection.id.slice(0, 8)}`;

export const pubUrl = (community, pub, branchShortId = null, versionInBranch = null) => {
	const baseUrl = `${communityUrl(community)}/pub/${pub.slug}`;
	if (branchShortId) {
		return (
			baseUrl + `/branch/${branchShortId}` + (versionInBranch ? `/${versionInBranch}` : '')
		);
	}
	return baseUrl;
};

export const doiUrl = (doi) => `https://doi.org/${doi}`;
