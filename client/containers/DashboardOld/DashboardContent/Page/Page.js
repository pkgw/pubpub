/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@blueprintjs/core';
import { ImageUpload, InputField, SettingsSection, ClickToCopyButton } from 'components';
import { getDefaultLayout, apiFetch, slugifyString } from 'utils';
import { communityUrl } from 'shared/utils/canonicalUrls';
import LayoutEditor from './LayoutEditor';

require('./page.scss');

const propTypes = {
	communityData: PropTypes.object.isRequired,
	locationData: PropTypes.object.isRequired,
	pageData: PropTypes.object.isRequired,
	setCommunityData: PropTypes.func.isRequired,
	setPageData: PropTypes.func.isRequired,
};

class Page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hasChanged: false,
			title: props.pageData.title,
			description: props.pageData.description || '',
			slug: props.pageData.slug,
			avatar: props.pageData.avatar,
			isNarrowWidth: props.pageData.isNarrowWidth,
			isPublic: props.pageData.isPublic,
			layout: props.pageData.layout || getDefaultLayout(),
			isLoading: false,
			error: undefined,
			deleteString: '',
			isLoadingDelete: false,
		};
		this.setTitle = this.setTitle.bind(this);
		this.setDescription = this.setDescription.bind(this);
		this.setSlug = this.setSlug.bind(this);
		this.setAvatar = this.setAvatar.bind(this);
		this.setNarrow = this.setNarrow.bind(this);
		this.setWide = this.setWide.bind(this);
		this.setPublic = this.setPublic.bind(this);
		this.setPrivate = this.setPrivate.bind(this);
		this.setLayout = this.setLayout.bind(this);
		this.handleWindowBeforeUnload = this.handleWindowBeforeUnload.bind(this);
		this.handleSaveChanges = this.handleSaveChanges.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	componentDidMount() {
		window.addEventListener('beforeunload', this.handleWindowBeforeUnload);
	}

	componentWillUnmount() {
		window.removeEventListener('beforeunload', this.handleWindowBeforeUnload);
	}

	setTitle(evt) {
		this.setState({ hasChanged: true, title: evt.target.value });
	}

	setDescription(evt) {
		this.setState({
			hasChanged: true,
			description: evt.target.value.substring(0, 280).replace(/\n/g, ' '),
		});
	}

	setSlug(evt) {
		this.setState({ hasChanged: true, slug: slugifyString(evt.target.value) });
	}

	setAvatar(value) {
		this.setState({ hasChanged: true, avatar: value });
	}

	setNarrow() {
		this.setState({ hasChanged: true, isNarrowWidth: true });
	}

	setWide() {
		this.setState({ hasChanged: true, isNarrowWidth: false });
	}

	setPublic() {
		this.setState({ hasChanged: true, isPublic: true });
	}

	setPrivate() {
		this.setState({ hasChanged: true, isPublic: false });
	}

	setLayout(newLayout) {
		this.setState({ hasChanged: true, layout: newLayout });
	}

	handleWindowBeforeUnload(evt) {
		if (this.state.hasChanged) {
			evt.preventDefault();
			evt.returnValue = '';
		}
	}

	handleSaveChanges() {
		const pageObject = {
			title: this.state.title,
			slug: this.state.slug,
			description: this.state.description,
			avatar: this.state.avatar,
			isNarrowWidth: this.state.isNarrowWidth,
			isPublic: this.state.isPublic,
			layout: this.state.layout,
		};
		this.setState({ isLoading: true, error: undefined });
		return apiFetch('/api/pages', {
			method: 'PUT',
			body: JSON.stringify({
				...pageObject,
				pageId: this.props.pageData.id,
				communityId: this.props.communityData.id,
			}),
		})
			.then((updatedValued) => {
				if (this.props.locationData.params.slug !== updatedValued.slug) {
					this.setState({ hasChanged: false });
					window.location.href = `/dashboard/pages/${updatedValued.slug}`;
					return null;
				}
				this.setState({ isLoading: false, error: undefined, hasChanged: false });
				this.props.setCommunityData({
					...this.props.communityData,
					pages: this.props.communityData.pages.map((page) => {
						if (page.id !== this.props.pageData.id) {
							return page;
						}
						return {
							...page,
							...pageObject,
						};
					}),
				});
				this.props.setPageData({
					...this.props.pageData,
					...pageObject,
				});
				return null;
			})
			.catch((err) => {
				console.error(err);
				this.setState({ isLoading: false, error: err });
			});
	}

	handleDelete() {
		this.setState({ isLoadingDelete: true });
		return apiFetch('/api/pages', {
			method: 'DELETE',
			body: JSON.stringify({
				pageId: this.props.pageData.id,
				communityId: this.props.communityData.id,
			}),
		})
			.then(() => {
				this.setState({ hasChanged: false });
				window.location.href = '/dashboard';
			})
			.catch((err) => {
				console.error(err);
				this.setState({ isLoadingDelete: false });
			});
	}

	render() {
		const pageData = this.props.pageData;

		return (
			<div className="dashboard-content_page-component">
				<div className="content-buttons">
					{this.state.hasChanged && (
						<a href={`/dashboard/pages/${pageData.slug}`} className="bp3-button">
							Cancel
						</a>
					)}
					<Button
						type="button"
						className="bp3-intent-primary"
						text="Save Changes"
						disabled={
							!this.state.hasChanged ||
							!this.state.title ||
							(pageData.slug && !this.state.slug)
						}
						loading={this.state.isLoading}
						onClick={this.handleSaveChanges}
					/>
					{this.state.error && <div className="error">Error Saving</div>}
				</div>

				<h1>
					{pageData.title}
					<a href={`/${pageData.slug}`}>Go to Page</a>
				</h1>

				<SettingsSection title="Details">
					<InputField
						label="Title"
						placeholder="Enter title"
						isRequired={true}
						value={this.state.title}
						onChange={this.setTitle}
						error={undefined}
					/>
					<InputField
						label="Description"
						placeholder="Enter description"
						isTextarea={true}
						helperText="Used for search results and social media cards. Max 180 characters."
						value={this.state.description}
						onChange={this.setDescription}
						error={undefined}
					/>
					<ImageUpload
						htmlFor="dashboard-page-avatar"
						label="Preview Image"
						defaultImage={this.state.avatar}
						onNewImage={this.setAvatar}
						canClear={true}
						helperText="Used in social media cards"
					/>
					{pageData.slug && (
						<InputField
							label="Link"
							placeholder="Enter link"
							isRequired={true}
							helperText={`Page URL will be https://${this.props.locationData.hostname}/${this.state.slug}`}
							value={this.state.slug}
							onChange={this.setSlug}
							error={undefined}
						/>
					)}

					<InputField label="Width">
						<div className="bp3-button-group">
							<Button
								className={this.state.isNarrowWidth ? '' : 'bp3-active'}
								onClick={this.setWide}
								text="Wide"
							/>
							<Button
								className={this.state.isNarrowWidth ? 'bp3-active' : ''}
								onClick={this.setNarrow}
								text="Narrow"
							/>
						</div>
					</InputField>

					{pageData.slug && (
						<InputField label="Privacy">
							<div className="bp3-button-group">
								<Button
									className={this.state.isPublic ? 'bp3-active' : ''}
									onClick={this.setPublic}
									text="Public"
									icon="globe"
								/>
								<Button
									className={this.state.isPublic ? '' : 'bp3-active'}
									onClick={this.setPrivate}
									text="Private"
									icon="lock"
								/>
								{!this.state.isPublic && (
									<ClickToCopyButton
										className="copy-button"
										icon="duplicate"
										beforeCopyPrompt="Anyone with this link can view the private Page."
										copyString={`${communityUrl(this.props.communityData)}/${
											pageData.slug
										}?access=${pageData.viewHash}`}
									>
										Copy shareable link
									</ClickToCopyButton>
								)}
							</div>
						</InputField>
					)}
				</SettingsSection>

				<SettingsSection title="Layout">
					<LayoutEditor
						onChange={this.setLayout}
						initialLayout={this.state.layout}
						pubs={pageData.pubs}
						communityData={this.props.communityData}
					/>
				</SettingsSection>
				{this.props.pageData.slug && (
					<SettingsSection title="Delete">
						<div className="bp3-callout bp3-intent-danger">
							<h5>Delete Page from Community</h5>
							<p>Deleting a Page is permanent.</p>
							<p>
								This will permanently delete <b>{pageData.title}</b>. This will not
								delete pubs that are included in this page&apos;s layout.
							</p>
							<p>
								Please type the title of the Page below to confirm your intention.
							</p>

							<InputField
								label={<b>Confirm Page Title</b>}
								value={this.state.deleteString}
								onChange={(evt) => {
									this.setState({ deleteString: evt.target.value });
								}}
							/>
							<div className="delete-button-wrapper">
								<Button
									type="button"
									className="bp3-intent-danger"
									text="Delete Page"
									disabled={this.state.deleteString !== pageData.title}
									loading={this.state.isLoadingDelete}
									onClick={this.handleDelete}
								/>
							</div>
						</div>
					</SettingsSection>
				)}
			</div>
		);
	}
}

Page.propTypes = propTypes;
export default Page;
