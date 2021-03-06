import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SHA3 from 'crypto-js/sha3';
import encHex from 'crypto-js/enc-hex';
import { AnchorButton, Button, NonIdealState } from '@blueprintjs/core';
import { Avatar, GridWrapper, InputField, PageWrapper } from 'components';
import { apiFetch, hydrateWrapper } from 'utils';

require('./login.scss');

const propTypes = {
	communityData: PropTypes.object.isRequired,
	loginData: PropTypes.object.isRequired,
	locationData: PropTypes.object.isRequired,
};

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginLoading: false,
			loginError: undefined,
			logoutLoading: false,
		};
		/* We use refs rather than state to manage email */
		/* and password form values because browser autocomplete */
		/* does not play nicely with onChange events as of Oct 31, 2018 */
		this.emailRef = React.createRef();
		this.passwordRef = React.createRef();
		this.onLoginSubmit = this.onLoginSubmit.bind(this);
		this.onLogoutSubmit = this.onLogoutSubmit.bind(this);
	}

	onLoginSubmit(evt) {
		evt.preventDefault();
		if (
			!this.emailRef.current ||
			!this.emailRef.current.value ||
			!this.passwordRef.current ||
			!this.passwordRef.current.value
		) {
			return this.setState({ loginLoading: false, loginError: 'Invalid Email or Password' });
		}

		this.setState({ loginLoading: true, loginError: undefined });
		return apiFetch('/api/login', {
			method: 'POST',
			body: JSON.stringify({
				email: this.emailRef.current.value.toLowerCase(),
				password: SHA3(this.passwordRef.current.value).toString(encHex),
			}),
		})
			.then(() => {
				window.location.href = this.props.locationData.query.redirect || '/';
			})
			.catch(() => {
				this.setState({ loginLoading: false, loginError: 'Invalid Email or Password' });
			});
	}

	onLogoutSubmit() {
		this.setState({ logoutLoading: true });
		apiFetch('/api/logout').then(() => {
			window.location.href = '/';
		});
	}

	render() {
		return (
			<div id="login-container">
				<PageWrapper
					loginData={this.props.loginData}
					communityData={this.props.communityData}
					locationData={this.props.locationData}
					hideNav={true}
					hideFooter={true}
				>
					<GridWrapper containerClassName="small" columnClassName="bp3-elevation">
						{!this.props.loginData.id && (
							<div>
								<h1>Login</h1>
								{!this.props.locationData.isBasePubPub && (
									<p>
										Login to <b>{this.props.communityData.title}</b> using your{' '}
										<a href="https://www.pubpub.org">PubPub</a> account.
									</p>
								)}
								<form onSubmit={this.onLoginSubmit}>
									<InputField
										label="Email"
										placeholder="example@email.com"
										autocomplete="username"
										inputRef={this.emailRef}
									/>
									<InputField
										label="Password"
										type="password"
										autocomplete="current-password"
										helperText={<a href="/password-reset">Forgot Password</a>}
										inputRef={this.passwordRef}
									/>
									<InputField error={this.state.loginError}>
										<Button
											name="login"
											type="submit"
											className="bp3-button bp3-intent-primary"
											onClick={this.onLoginSubmit}
											text="Login"
											loading={this.state.loginLoading}
										/>
									</InputField>
								</form>

								<a href="/signup" className="switch-message">
									Don&apos;t have a PubPub account? Click to Signup
								</a>
							</div>
						)}
						{this.props.loginData.id && (
							<NonIdealState
								visual={
									<Avatar
										userInitials={this.props.loginData.initials}
										userAvatar={this.props.loginData.avatar}
										width={100}
									/>
								}
								title="Already Logged In"
								action={
									<div>
										<AnchorButton
											className="bp3-large action-button"
											text="View Profile"
											href={`/user/${this.props.loginData.slug}`}
										/>
										<Button
											className="bp3-large action-button"
											text="Logout"
											onClick={this.onLogoutSubmit}
											loading={this.state.logoutLoading}
										/>
									</div>
								}
							/>
						)}
					</GridWrapper>
				</PageWrapper>
			</div>
		);
	}
}

Login.propTypes = propTypes;
export default Login;

hydrateWrapper(Login);
