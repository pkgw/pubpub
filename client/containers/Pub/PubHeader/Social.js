import React from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem } from '@blueprintjs/core';
import { Icon } from 'components';
import { usePageContext } from 'utils/hooks';

require('./social.scss');

const propTypes = {
	pubData: PropTypes.object.isRequired,
	// loginData: PropTypes.object.isRequired,
	// setPubData: PropTypes.func.isRequired,
};

const Social = (props) => {
	const { communityData } = usePageContext();
	const pubData = props.pubData;
	const communityHostname = communityData.domain || `${communityData.subdomain}.pubpub.org`;
	const pubLink = `https://${communityHostname}/pub/${pubData.slug}/${
		pubData.isDraft ? 'draft' : ''
	}`;
	const pubTitle = pubData.title;
	const links = [
		{
			title: 'Twitter',
			icon: <Icon icon="twitter" />,
			url: `https://twitter.com/intent/tweet?url=${pubLink}&text=${pubTitle}`,
		},
		{
			title: 'Reddit',
			icon: <Icon icon="reddit" />,
			url: `https://reddit.com/submit?url=${pubLink}&title=${pubTitle}`,
		},
		{
			title: 'Facebook',
			icon: <Icon icon="facebook" />,
			url: `https://www.facebook.com/sharer.php?u=${pubLink}`,
		},
		// {
		// 	title: 'Google+',
		// 	icon: <Icon icon="google-plus" />,
		// 	url: `https://plus.google.com/share?url=${pubLink}`,
		// },
		{
			title: 'LinkedIn',
			icon: <Icon icon="linkedin" />,
			url: `https://www.linkedin.com/shareArticle?url=${pubLink}&title=${pubTitle}`,
		},
		{
			title: 'Email',
			icon: <Icon icon="envelope" />,
			url: `mailto:?subject=${pubTitle}&body=${pubLink}`,
		},
	];
	return (
		<div className="pub-social-component">
			<Menu vertical={true}>
				{links.map((link) => {
					return (
						<MenuItem
							key={link.title}
							labelElement={link.icon}
							text={link.title}
							href={link.url}
							rel="noopener noreferrer"
							target="_blank"
						/>
					);
				})}
			</Menu>
		</div>
	);
};

Social.propTypes = propTypes;
export default Social;
