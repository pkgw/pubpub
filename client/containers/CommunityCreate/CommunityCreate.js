import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, NonIdealState } from '@blueprintjs/core';
import { ColorInput, GridWrapper, InputField, ImageUpload, PageWrapper } from 'components';
import { hydrateWrapper, apiFetch, slugifyString } from 'utils';

require('./communityCreate.scss');

const propTypes = {
	communityData: PropTypes.object.isRequired,
	loginData: PropTypes.object.isRequired,
	locationData: PropTypes.object.isRequired,
};

class CommunityCreate extends Component {
	constructor(props) {
		super(props);
		this.state = {
			subdomain: '',
			title: '',
			description: '',
			heroLogo: '',
			accentColorDark: '#2D2E2F',
			accentColorLight: '#FFFFFF',
			createIsLoading: false,
			createError: undefined,
		};
		this.onCreateSubmit = this.onCreateSubmit.bind(this);
		this.onSubdomainChange = this.onSubdomainChange.bind(this);
		this.onTitleChange = this.onTitleChange.bind(this);
		this.onDescriptionChange = this.onDescriptionChange.bind(this);
		this.onHeroHeaderLogoChange = this.onHeroHeaderLogoChange.bind(this);
	}

	onCreateSubmit(evt) {
		evt.preventDefault();

		this.setState({ createIsLoading: true, createError: undefined });
		return apiFetch('/api/communities', {
			method: 'POST',
			body: JSON.stringify({
				subdomain: this.state.subdomain,
				title: this.state.title,
				description: this.state.description,
				headerLogo: this.state.heroLogo,
				heroLogo: this.state.heroLogo,
				accentColorLight: this.state.accentColorLight,
				accentColorDark: this.state.accentColorDark,
			}),
		})
			.then(() => {
				this.setState({ createIsLoading: false, createError: undefined });
				window.location.href = `https://${this.state.subdomain}.pubpub.org`;
			})
			.catch((err) => {
				this.setState({ createIsLoading: false, createError: err });
			});
	}

	onSubdomainChange(evt) {
		this.setState({ subdomain: slugifyString(evt.target.value) });
	}

	onTitleChange(evt) {
		this.setState({ title: evt.target.value });
	}

	onDescriptionChange(evt) {
		this.setState({ description: evt.target.value.substring(0, 280).replace(/\n/g, ' ') });
	}

	onHeroHeaderLogoChange(val) {
		this.setState({ heroLogo: val });
	}

	render() {
		return (
			<div id="community-create-container">
				<PageWrapper
					loginData={this.props.loginData}
					communityData={this.props.communityData}
					locationData={this.props.locationData}
					hideNav={true}
					hideFooter={true}
				>
					<GridWrapper containerClassName="small">
						{!this.props.loginData.id && (
							<NonIdealState
								title="To create your community, create an account or login."
								visual="error"
								action={
									<a
										href="/login?redirect=/community/create"
										className="bp3-button"
									>
										Login or Signup
									</a>
								}
							/>
						)}
						{this.props.loginData.id && (
							<div>
								<h1>Create Community</h1>
								<form onSubmit={this.onCreateSubmit}>
									<InputField
										label="URL"
										isRequired={true}
										value={this.state.subdomain}
										onChange={this.onSubdomainChange}
										helperText={`https://${this.state.subdomain ||
											'[URL]'}.pubpub.org`}
									/>
									<InputField
										label="Title"
										isRequired={true}
										value={this.state.title}
										onChange={this.onTitleChange}
									/>
									<InputField
										label="Description"
										isTextarea={true}
										value={this.state.description}
										onChange={this.onDescriptionChange}
										helperText={`${this.state.description.length}/280 characters`}
									/>
									<ImageUpload
										htmlFor="large-header-logo-upload"
										label="Community Logo"
										defaultImage={this.state.heroLogo}
										height={60}
										width={150}
										onNewImage={this.onHeroHeaderLogoChange}
										helperText="Used on the landing page. Suggested height: 200px"
									/>
									<InputField label="Light Accent Color">
										<ColorInput
											value={this.state.accentColorLight}
											onChange={(val) => {
												this.setState({
													accentColorLight: val.hex,
												});
											}}
										/>
									</InputField>
									<InputField label="Dark Accent Color">
										<ColorInput
											value={this.state.accentColorDark}
											onChange={(val) => {
												this.setState({ accentColorDark: val.hex });
											}}
										/>
									</InputField>
									<InputField error={this.state.createError}>
										<Button
											name="create"
											type="submit"
											className="bp3-button bp3-intent-primary create-account-button"
											onClick={this.onCreateSubmit}
											text="Create Community"
											disabled={!this.state.subdomain || !this.state.title}
											loading={this.state.createIsLoading}
										/>
									</InputField>
								</form>
							</div>
						)}
					</GridWrapper>
				</PageWrapper>
			</div>
		);
	}
}

CommunityCreate.propTypes = propTypes;
export default CommunityCreate;

hydrateWrapper(CommunityCreate);
