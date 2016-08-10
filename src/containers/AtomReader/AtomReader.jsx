import React, { PropTypes } from 'react';
import {connect} from 'react-redux';
import Radium, {Style} from 'radium';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import {getAtomData, submitAtomToJournals} from './actions';
import {toggleVisibility, follow, unfollow} from 'containers/Login/actions';
// import {createHighlight} from 'containers/MediaLibrary/actions';
import {safeGetInToJS} from 'utils/safeParse';
import dateFormat from 'dateformat';

import {HorizontalNav, License} from 'components';
import AtomReaderAnalytics from './AtomReaderAnalytics';
import AtomReaderCite from './AtomReaderCite';
import AtomReaderContributors from './AtomReaderContributors';
import AtomReaderExport from './AtomReaderExport';
import AtomReaderHeader from './AtomReaderHeader';
import AtomReaderJournals from './AtomReaderJournals';
import AtomReaderVersions from './AtomReaderVersions';
import AtomReaderFollowers from './AtomReaderFollowers';

import AtomViewerPane from './AtomViewerPane';
import { StickyContainer as UnwrappedStickyContainer, Sticky } from 'react-sticky';
const StickyContainer = Radium(UnwrappedStickyContainer);
import smoothScroll from 'smoothscroll';

import {Discussions} from 'containers';

import {globalStyles} from 'utils/styleConstants';

import {generateTOC} from 'utils/generateTOC';

// import {globalMessages} from 'utils/globalMessages';

import {FormattedMessage} from 'react-intl';

let styles = {};

export const AtomReader = React.createClass({
	propTypes: {
		atomData: PropTypes.object,
		authorsData: PropTypes.object,
		loginData: PropTypes.object,
		slug: PropTypes.string,
		query: PropTypes.object, // version: integer
		meta: PropTypes.string,
		metaID: PropTypes.string,
		inviteStatus: PropTypes.string,
		dispatch: PropTypes.func
	},

	getDefaultProps: function() {
		return {
			query: {},
		};
	},

	statics: {
		fetchData: function(getState, dispatch, location, routeParams) {
			return dispatch(getAtomData(routeParams.slug, routeParams.meta, location.query.version ));
			// return dispatch(getAtomData(routeParams.slug, location.query.referrer, getState().router.params.meta, location.query.version));
		}
	},

	getInitialState() {
		return {
			TOC: [],
			showTOC: false,
			showDiscussions: true,
			lastClicked: undefined,
			rightBarMode: 'discussions',
		};
	},


	toggleTOC: function() {
		const showingTOC = this.state.showTOC && !this.state.showDiscussions || this.state.showTOC && this.state.lastCliked === 'toc';
		if (showingTOC) {
			this.setState({
				showTOC: false,
				lastCliked: 'toc'
			});
		} else {
			this.setState({
				showTOC: true,
				lastCliked: 'toc'
			});
		}
	},
	toggleDiscussions: function() {
		const showingDiscussions = this.state.showDiscussions && !this.state.showTOC || this.state.showDiscussions && this.state.lastCliked === 'discussions';
		if (showingDiscussions) {
			this.setState({
				showDiscussions: false,
				lastCliked: 'discussions'
			});
		} else {
			this.setState({
				showDiscussions: true,
				lastCliked: 'discussions'
			});
		}

	},
	handleJournalSubmit: function(journalIDs) {
		const atomID = safeGetInToJS(this.props.atomData, ['atomData', '_id']);
		return this.props.dispatch(submitAtomToJournals(atomID, journalIDs));
	},

	setRightBarMode: function(mode) {
		this.setState({rightBarMode: mode});
	},

	// addSelection: function(newSelection) {
	// 	newSelection.sourcePub = this.props.pubData.getIn(['pubData', '_id']);
	// 	newSelection.sourceVersion = this.props.query.version !== undefined && this.props.query.version > 0 && this.props.query.version < (this.props.pubData.getIn(['pubData', 'history']).size - 1) ? this.props.query.version : this.props.pubData.getIn(['pubData', 'history']).size;

	// 	const newHighLight = {};
	// 	newHighLight.assetType = 'highlight';
	// 	newHighLight.label = newSelection.text.substring(0, 15);
	// 	newHighLight.assetData = newSelection;

	// 	this.props.dispatch(createHighlight(newHighLight));
	// },
	handleScroll: function(id) {
		const destination = document.getElementById(id);
		if (!destination) { return undefined; }
		smoothScroll(destination);
	},

	render: function() {
		// const pubData = this.props.pubData.get('pubData').toJS();
		// const versionIndex = this.props.query.version !== undefined && this.props.query.version > 0 && this.props.query.version <= (this.props.pubData.getIn(['pubData', 'history']).size - 1)
		// 	? this.props.query.version - 1
		// 	: this.props.pubData.getIn(['pubData', 'history']).size - 1;
		const atomData = safeGetInToJS(this.props.atomData, ['atomData']) || {};

		const metaData = {
			title: atomData.title + ' · PubPub',
			meta: [
				{property: 'og:title', content: atomData.title},
				{property: 'og:type', content: 'article'},
				{property: 'og:description', content: atomData.description},
				{property: 'og:url', content: 'https://www.pubpub.org/pub/' + atomData.slug},
				{property: 'og:image', content: atomData.previewImage},
				{property: 'og:image:url', content: atomData.previewImage},
				{property: 'og:image:width', content: '500'},
				{property: 'article:published_time', content: atomData.lastUpdated || atomData.createDate},
				{property: 'article:modified_time', content: atomData.lastUpdated},
				{name: 'twitter:card', content: 'summary'},
				{name: 'twitter:site', content: '@pubpub'},
				{name: 'twitter:title', content: atomData.title},
				{name: 'twitter:description', content: atomData.description || atomData.title},
				{name: 'twitter:image', content: atomData.previewImage},
				{name: 'twitter:image:alt', content: 'Preview image for ' + atomData.title}
			]
		};


		const showDiscussions = !this.props.meta && (this.state.showDiscussions && !this.state.showTOC || this.state.showDiscussions && this.state.lastCliked === 'discussions');
		const showTOC = !this.props.meta && (this.state.showTOC && !this.state.showDiscussions || this.state.showTOC && this.state.lastCliked === 'toc');

		
		const contributorsData = safeGetInToJS(this.props.atomData, ['contributorsData']) || [];
		const currentVersionContent = safeGetInToJS(this.props.atomData, ['currentVersionData', 'content']) || {};
		const currentVersionDate = safeGetInToJS(this.props.atomData, ['currentVersionData', 'createDate']);
		const toc = generateTOC(currentVersionContent.markdown).full;
		const versionQuery = this.props.query && this.props.query.version ? '?version=' + this.props.query.version : '';
		const permissionType = safeGetInToJS(this.props.atomData, ['atomData', 'permissionType']) || [];

		const mobileNavButtons = [
			{ type: 'link', mobile: true, text: 'Discussions', link: '/pub/' + this.props.slug + '/discussions' },
			{ type: 'button', mobile: true, text: 'Menu', action: undefined },
		];
		if (this.props.meta === 'discussions') {
			mobileNavButtons[0] = { type: 'link', mobile: true, text: 'View', link: '/pub/' + this.props.slug };
		}


		const leftNav = [
			{link: '/pub/' + this.props.slug, text: 'View', active: !this.props.meta},
		];
		if (permissionType === 'author' || permissionType === 'editor') {
			leftNav.push({link: '/pub/' + this.props.slug + '/edit', text: 'Edit'});
		}
		const navItems = [
			// ...leftNav,
			{text: 'Contents', action: this.setRightBarMode.bind(this, 'contents'), active: this.state.rightBarMode === 'contents'},
			{text: 'Discussions', action: this.setRightBarMode.bind(this, 'discussions'), active: this.state.rightBarMode === 'discussions'},
			{text: 'Contributors', action: this.setRightBarMode.bind(this, 'contributors'), active: this.state.rightBarMode === 'contributors'},
			{text: 'Versions', action: this.setRightBarMode.bind(this, 'versions'), active: this.state.rightBarMode === 'versions'},
			{text: 'Journals', action: this.setRightBarMode.bind(this, 'journals'), active: this.state.rightBarMode === 'journals'},
			{text: 'Analytics', action: this.setRightBarMode.bind(this, 'analytics'), active: this.state.rightBarMode === 'analytics'},

			// {link: '/pub/' + this.props.slug, text: 'Contents', active: !this.props.meta},
			// {link: '/pub/' + this.props.slug + '/contributors', text: 'Contributors', active: this.props.meta === 'contributors'},
			// {link: '/pub/' + this.props.slug + '/versions', text: 'Versions', active: this.props.meta === 'versions'},
			// {link: '/pub/' + this.props.slug + '/journals', text: 'Journals', active: this.props.meta === 'journals'},
			// {link: '/pub/' + this.props.slug + '/analytics', text: 'Analytics', active: this.props.meta === 'analytics'},
			// {link: '/pub/' + this.props.slug + '/cite' + versionQuery, text: 'Cite', active: this.props.meta === 'cite'},
			// {link: '/pub/' + this.props.slug + '/followers', text: 'Followers', active: this.props.meta === 'followers'},
			// {link: '/pub/' + this.props.slug + '/export' + versionQuery, text: 'Export', active: this.props.meta === 'export'},
		];

		// Remove Export option if the atom type is not a doc
		// In the future, we may add export for datasets, images, etc.
		// But for now that's ill defined
		if (atomData.type !== 'document') { navItems.pop(); }

		const authorsData = safeGetInToJS(this.props.atomData, ['authorsData']) || [];
		const authorList = atomData.customAuthorString ? [<Link to={'/pub/' + this.props.slug + '/contributors'} key={'author-0'}>{atomData.customAuthorString}</Link>] : authorsData.map((item, index)=> {
			return <Link to={'/user/' + item.source.username} key={'author-' + index} className={'author'}>{item.source.name}</Link>;
		});

		// return (
		// 	<div style={styles.container}>

		// 		<Helmet {...metaData} />

		// 		<Style rules={{
		// 			'.pagebreak': { opacity: '0', },
		// 		}} />

		// 		{/* Table of Contents Section */}
		// 		<StickyContainer style={[styles.tocSection, !showTOC && {display: 'none'}]}>
		// 			<Sticky style={styles.tocContent}>	
		// 				{toc.map((object, index)=>{
		// 					return <div key={'toc-' + index} className={'underlineOnHover'} style={[styles.tocItem, styles.tocLevels[object.level - 1]]} onClick={this.handleScroll.bind(this, object.id)}>{object.title}</div>;
		// 				})}
		// 			</Sticky>
		// 		</StickyContainer>

		// 		{/* Pub Section */}
		// 		<div style={styles.pubSection}>
		// 			<div className={'opacity-on-hover'} style={styles.iconLeft} onClick={this.toggleTOC}></div>
		// 			<div className={'opacity-on-hover'} style={styles.iconRight} onClick={this.toggleDiscussions}></div>

		// 			<HorizontalNav navItems={navItems} mobileNavButtons={mobileNavButtons}/>

		// 			{/* <div style={styles.buttonWrapper}>
		// 				<div className={'button'} style={styles.button} onClick={()=>{}}>Follow</div>
		// 			</div> */}

		// 			<div className={!this.props.meta && safeGetInToJS(this.props.atomData, ['atomData', 'type']) === 'document' ? 'atom-reader atom-reader-meta' : 'atom-reader-meta'}>

		// 				<AtomReaderHeader
		// 					title={atomData.title}
		// 					authors={authorList}
		// 					versionDate={currentVersionDate}
		// 					lastUpdated={atomData.lastUpdated}
		// 					slug={atomData.slug}
		// 					titleOnly={!!this.props.meta}
		// 					atomID={atomData._id}
		// 					isFollowing={atomData.isFollowing} />

		// 				{(()=>{
		// 					switch (this.props.meta) {
		// 					case 'contributors':
		// 						return <AtomReaderContributors atomData={this.props.atomData} contributorsData={contributorsData}/>;
		// 					case 'versions':
		// 						return <AtomReaderVersions atomData={this.props.atomData}/>;
		// 					case 'journals':
		// 						return <AtomReaderJournals atomData={this.props.atomData} handleJournalSubmit={this.handleJournalSubmit}/>;
		// 					case 'analytics':
		// 						return <AtomReaderAnalytics atomData={this.props.atomData}/>;
		// 					case 'cite':
		// 						return <AtomReaderCite atomData={this.props.atomData} authorsData={this.props.authorsData} versionQuery={versionQuery}/>;
		// 					case 'export':
		// 						return <AtomReaderExport atomData={this.props.atomData}/>;
		// 					case 'discussions':
		// 						return <StickyContainer><Discussions/></StickyContainer>;
		// 					case 'followers':
		// 						return <AtomReaderFollowers atomData={this.props.atomData}/>;
		// 					default:
		// 						return (
		// 							<div>
		// 								<AtomViewerPane atomData={this.props.atomData} />
		// 								{atomData.isPublished &&
		// 									<License />
		// 								}
		// 							</div>
		// 						);
		// 					}
		// 				})()}
		// 			</div>

		// 			{/* License will go here */}

		// 		</div>

		// 		{/* Discussion Section */}
		// 		<StickyContainer style={[styles.discussionSection, !showDiscussions && {display: 'none'}]}>
		// 			{!this.props.meta &&
		// 				<Discussions/>
		// 			}
		// 		</StickyContainer>


		// 	</div>
		// );
		return (
			<div style={styles.container}>

				<Helmet {...metaData} />

				<Style rules={{
					'.pagebreak': { opacity: '0', },
				}} />

				{/* Pub Section */}
				<div style={[styles.pubSection, !showDiscussions && styles.pubSectionFull]}>
					<div className={'opacity-on-hover'} style={styles.iconRight} onClick={this.toggleDiscussions}></div>

					<div className={!this.props.meta && safeGetInToJS(this.props.atomData, ['atomData', 'type']) === 'document' ? 'atom-reader atom-reader-meta' : 'atom-reader-meta'}>

						<AtomReaderHeader
							title={atomData.title}
							authors={authorList}
							versionDate={currentVersionDate}
							lastUpdated={atomData.lastUpdated}
							slug={atomData.slug}
							titleOnly={!!this.props.meta}
							atomID={atomData._id}
							isFollowing={atomData.isFollowing} />
						
						<AtomViewerPane atomData={this.props.atomData} />
						
						{atomData.isPublished &&
							<License />
						}

						
					</div>

					{/* License will go here */}

				</div>

				{/* Discussion Section */}
				<StickyContainer style={[styles.discussionSection, !showDiscussions && styles.hideDiscussion]}>
					<Sticky>
						<HorizontalNav navItems={navItems} mobileNavButtons={mobileNavButtons}/>
						
						<div className={'contenty'} style={styles.contenty}>
							{(()=>{
								switch (this.state.rightBarMode) {
								case 'contributors':
									return <AtomReaderContributors atomData={this.props.atomData} contributorsData={contributorsData}/>;
								case 'versions':
									return <AtomReaderVersions atomData={this.props.atomData}/>;
								case 'journals':
									return <AtomReaderJournals atomData={this.props.atomData} handleJournalSubmit={this.handleJournalSubmit}/>;
								case 'analytics':
									return <AtomReaderAnalytics atomData={this.props.atomData}/>;
								case 'cite':
									return <AtomReaderCite atomData={this.props.atomData} authorsData={this.props.authorsData} versionQuery={versionQuery}/>;
								case 'export':
									return <AtomReaderExport atomData={this.props.atomData}/>;
								case 'discussions':
									return <StickyContainer><Discussions/></StickyContainer>;
								case 'followers':
									return <AtomReaderFollowers atomData={this.props.atomData}/>;
								case 'contents':
									return toc.map((object, index)=>{
										return <div key={'toc-' + index} className={'underlineOnHover'} style={[styles.tocItem, styles.tocLevels[object.level - 1]]} onClick={this.handleScroll.bind(this, object.id)}>{object.title}</div>;
									});
								default:
									return <Discussions/>;
								}
							})()}
						</div>
						
					</Sticky>
				</StickyContainer>


			</div>
		);
	}

});


export default connect( state => {
	return {
		atomData: state.atom,
		loginData: state.login,
		slug: state.router.params.slug,
		meta: state.router.params.meta,
		query: state.router.location.query,
	};
})( Radium(AtomReader) );

styles = {
	
	pubSection: {
		verticalAlign: 'top',
		padding: '0em 4em',
		position: 'relative',
		marginRight: '35vw',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			display: 'block',
			padding: '0em 1em',
			marginRight: '0vw',
		},
	},
	pubSectionFull: {
		marginRight: '0vw',
	},
	iconLeft: {
		position: 'absolute',
		width: '1.5em',
		height: '100%',
		cursor: 'pointer',
		top: 0,
		left: 0,
		opacity: 0,
		backgroundColor: '#F3F3F4',
		borderRight: '1px solid #E4E4E4',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			display: 'none',
		},
	},
	iconRight: {
		position: 'absolute',
		width: '1.5em',
		height: '100%',
		cursor: 'pointer',
		top: 0,
		right: 0,
		opacity: 0,
		backgroundColor: '#F3F3F4',
		borderLeft: '1px solid #E4E4E4',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			display: 'none',
		},
	},
	discussionSection: {
		verticalAlign: 'top',
		padding: '0em 0em',
		width: '35vw',
		height: '100%',
		backgroundColor: '#F3F3F4',
		borderLeft: '1px solid #E4E4E4',
		position: 'absolute',
		right: 0,
		top: 0,
		transition: '.15s ease-in-out transform',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			display: 'none',
		},
	},
	hideDiscussion: {
		transform: 'translate3d(100%, 0, 0)'
	},

	contenty: {
		// backgroundColor: 'green',
		height: 'calc(100vh - 40px)',
		width: 'calc(100% - 4em)',
		overflow: 'hidden',
		overflowY: 'scroll',
		padding: '0em 2em 1em',
	},

	
	pubBodyWrapper: {
		maxWidth: '650px',
		margin: '0 auto',
		padding: '0em 3em',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			maxWidth: 'auto',
			padding: '0em 0em',
		},
	},
	pubMetaWrapper: {
		maxWidth: '1024px',
		margin: '0 auto',
		padding: '2em 3em',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			maxWidth: 'auto',
			padding: '1em 0em',
		},
	},

	container: {
		width: '100%',
		overflow: 'hidden',
		minHeight: '100vh',
		position: 'relative',
	},

	
	noBottomMargin: {
		marginBottom: '0px',
	},
	buttonWrapper: {
		float: 'right',
		position: 'relative',
		top: '8px',
	},
	button: {
		fontSize: '.85em',
		padding: '.25em 1.5em',
	},
	tocItem: {
		display: 'block',
		textDecoration: 'none',
		color: 'inherit',
		paddingRight: '2em',
		paddingTop: '1em',
		paddingBottom: '1em',
		paddingLeft: '2em',
		cursor: 'pointer',
	},

	tocLevels: [
		{paddingLeft: '2em'},
		{paddingLeft: '4em'},
		{paddingLeft: '5em'},
		{paddingLeft: '6em'},
		{paddingLeft: '7em'},
		{paddingLeft: '8em'},
	],

};
