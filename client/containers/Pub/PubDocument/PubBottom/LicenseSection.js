import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { LicenseSelect } from 'components';
import { PageContext } from 'components/PageWrapper/PageWrapper';
import { getLicenseBySlug } from 'shared/license';

import PubBottomSection, { SectionBullets, AccentedIconButton } from './PubBottomSection';

const propTypes = {
	pubData: PropTypes.shape({
		canManage: PropTypes.bool,
		licenseSlug: PropTypes.string,
	}).isRequired,
	updateLocalData: PropTypes.func.isRequired,
};

const LicenseSection = (props) => {
	const { pubData, updateLocalData } = props;
	const { communityData } = useContext(PageContext);
	const { link, full, short, version } = getLicenseBySlug(pubData.licenseSlug);

	return (
		<PubBottomSection
			accentColor={communityData.accentColorDark}
			isExpandable={false}
			className="pub-bottom-license"
			title="License"
			centerItems={
				<SectionBullets>
					<a target="_blank" rel="license noopener noreferrer" href={link}>
						{`${full} (${short} ${version})`}
					</a>
				</SectionBullets>
			}
			iconItems={({ iconColor }) => {
				if (pubData.canManage) {
					return (
						<LicenseSelect pubData={pubData} updateLocalData={updateLocalData}>
							{({ isPersisting }) => (
								<AccentedIconButton
									accentColor={iconColor}
									icon="edit"
									title="Select Pub license"
									loading={isPersisting}
								/>
							)}
						</LicenseSelect>
					);
				}
				return null;
			}}
		/>
	);
};

LicenseSection.propTypes = propTypes;
export default LicenseSection;
