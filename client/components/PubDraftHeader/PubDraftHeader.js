import React, { Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import { Button, Tooltip } from '@blueprintjs/core';
import Avatar from 'components/Avatar/Avatar';
import Icon from 'components/Icon/Icon';
import DropdownButton from 'components/DropdownButton/DropdownButton';

require('./pubDraftHeader.scss');

const propTypes = {
	pubData: PropTypes.object.isRequired,
	loginData: PropTypes.object.isRequired,
	// locationData: PropTypes.object,
	editorChangeObject: PropTypes.object.isRequired,
	setOptionsMode: PropTypes.func.isRequired,
	onRef: PropTypes.func.isRequired,
	bottomCutoffId: PropTypes.string,
	collabStatus: PropTypes.string.isRequired,
	activeCollaborators: PropTypes.array.isRequired,
};

const defaultProps = {
	// locationData: { params: {} },
	bottomCutoffId: '',
};

class PubDraftHeader extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isFixed: false,
		};

		this.calculateIfFixed = this.calculateIfFixed.bind(this);
		this.headerRef = React.createRef();
		this.bottomCutoffElem = null;
		this.handleScroll = throttle(this.calculateIfFixed, 50, { leading: true, trailing: true });
	}

	componentDidMount() {
		this.calculateIfFixed();
		window.addEventListener('scroll', this.handleScroll);
		this.bottomCutoffElem = document.getElementById(this.props.bottomCutoffId);
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll);
	}

	calculateIfFixed() {
		/* 73 is the height of .wrapper */
		const isOverBottom = this.bottomCutoffElem && this.bottomCutoffElem.getBoundingClientRect().top < 73;
		if (!this.state.isFixed) {
			const isAboveTop = this.headerRef.current.getBoundingClientRect().top < 0;
			if (isAboveTop && !isOverBottom) {
				this.setState({ isFixed: true });
			}
		} else {
			const isBelowTop = this.headerRef.current.getBoundingClientRect().top > 0;
			if (isBelowTop || isOverBottom) {
				this.setState({ isFixed: false });
			}
		}
	}

	render() {
		const pubData = this.props.pubData;
		const uniqueActiveCollaborators = {};
		this.props.activeCollaborators.forEach((item)=> {
			if (item.initials !== '?') {
				uniqueActiveCollaborators[item.id] = item;
			}
		});
		const numAnonymous = this.props.activeCollaborators.reduce((prev, curr)=> {
			if (curr.initials === '?') { return prev + 1; }
			return prev;
		}, 0);
		if (numAnonymous) {
			uniqueActiveCollaborators.anon = {
				backgroundColor: 'rgba(96,96,96, 0.2)',
				cursorColor: 'rgba(96,96,96, 1.0)',
				id: 'anon',
				initials: numAnonymous,
				name: `${numAnonymous} anonymous user${numAnonymous === 1 ? '' : 's'}`,
			};
		}
		const menuItems = this.props.editorChangeObject.menuItems || [];
		const menuItemsObject = menuItems.reduce((prev, curr)=> {
			return { ...prev, [curr.title]: curr };
		}, {});

		const formattingItems = [
			{
				key: 'header1',
				icon: <Icon icon="header-one" />
			},
			{
				key: 'header2',
				icon: <Icon icon="header-two" />
			},
			{
				key: 'strong',
				icon: <Icon icon="bold" />
			},
			{
				key: 'em',
				icon: <Icon icon="italic" />
			},
			{
				key: 'code',
				icon: <Icon icon="code" />
			},
			{
				key: 'subscript',
				icon: <Icon icon="subscript" />
			},
			{
				key: 'superscript',
				icon: <Icon icon="superscript" />
			},
			{
				key: 'strikethrough',
				icon: <Icon icon="strikethrough" />
			},
			{
				key: 'blockquote',
				icon: <Icon icon="citation" />
			},
			{
				key: 'bullet-list',
				icon: <Icon icon="list-ul" />
			},
			{
				key: 'numbered-list',
				icon: <Icon icon="list-ol" />
			},
			{
				key: 'link',
				icon: <Icon icon="link" />
			},
		];

		const insertFunctions = this.props.editorChangeObject.insertFunctions || {};
		const insertItems = [
			{
				key: 'citation',
				title: 'Citation',
				icon: <Icon icon="bookmark" />
			},
			{
				key: 'citation_list',
				title: 'Citation List',
				icon: <Icon icon="numbered-list" />
			},
			{
				key: 'code_block',
				title: 'Code Block',
				icon: <Icon icon="code" />
			},
			{
				key: 'discussion_thread',
				title: 'Discussion Thread',
				icon: <Icon icon="chat" />
			},
			{
				key: 'equation',
				title: 'Equation',
				icon: <Icon icon="function" />
			},
			{
				key: 'file',
				title: 'File',
				icon: <Icon icon="document" />
			},
			{
				key: 'footnote',
				title: 'Footnote',
				icon: <Icon icon="asterisk" />
			},
			{
				key: 'footenote_list',
				title: 'Footnote List',
				icon: <Icon icon="numbered-list" />
			},
			{
				key: 'horizontal_rule',
				title: 'Horizontal Line',
				icon: <Icon icon="minus" />
			},
			{
				key: 'iframe',
				title: 'Iframe',
				icon: <Icon icon="code-block" />
			},
			{
				key: 'image',
				title: 'Image',
				icon: <Icon icon="media" />
			},
			{
				key: 'table',
				title: 'Table',
				icon: <Icon icon="th" />
			},
			{
				key: 'video',
				title: 'Video',
				icon: <Icon icon="video" />
			},
		];
		return (
			<div className="pub-draft-header-component" ref={this.headerRef}>
				<div className={`wrapper ${this.state.isFixed ? 'fixed' : ''}`}>
					<div className="container pub">
						<div className="row">
							<div className="col-12">
								<div className="left-section">
									<span className={`collab-status ${this.props.collabStatus}`}>
										<span>Working Draft </span>
										{this.props.collabStatus}
										{this.props.collabStatus === 'saving' || this.props.collabStatus === 'connecting' ? '...' : ''}
									</span>
								</div>
								<div className="right-section">
									<button className="pt-button pt-intent-primary pt-small" type="button" onClick={()=> { this.props.setOptionsMode('saveVersion'); }}>Save Version</button>
								</div>
							</div>
							<div className="col-12">
								<div className="left-section">
									{formattingItems.map((item)=> {
										const menuItem = menuItemsObject[item.key] || {};
										return (
											<Button
												key={item.key}
												className="pt-minimal menu-button"
												icon={item.icon}
												active={menuItem.isActive}
												onClick={menuItem.run}
												onMouseDown={(evt)=> {
													evt.preventDefault();
												}}
											/>
										);
									})}
									<DropdownButton
										label="Insert"
										isSmall={true}
										isMinimal={true}
									>
										{insertItems.map((item)=> {
											return (
												<div
													className="pt-menu-item pt-popover-dismiss insert-menu-item"
													key={item.key}
													onClick={insertFunctions[item.key]}
												>
													{item.icon}
													<span>{item.title}</span>
												</div>
											);
										})}
									</DropdownButton>
								</div>
								<div className="right-section">
									{Object.keys(uniqueActiveCollaborators).map((key)=> {
										return uniqueActiveCollaborators[key];
									}).filter((item)=> {
										return item && item.id !== this.props.loginData.id;
									}).map((collaborator)=> {
										return (
											<div className="avatar-wrapper" key={`present-avatar-${collaborator.id}`}>
												<Tooltip
													content={collaborator.name}
													tooltipClassName="pt-dark"
												>
													<Avatar
														/* Cast userInitials to string since
														the anonymous Avatar is a int count */
														userInitials={String(collaborator.initials)}
														userAvatar={collaborator.image}
														borderColor={collaborator.cursorColor}
														borderWidth="2px"
														width={24}
													/>
												</Tooltip>
											</div>
										);
									})}
									{/* <button className="pt-button pt-small" type="button">
										Editing
										<span className="pt-icon-standard pt-icon-caret-down pt-align-right" />
									</button> */}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

PubDraftHeader.propTypes = propTypes;
PubDraftHeader.defaultProps = defaultProps;
export default PubDraftHeader;
