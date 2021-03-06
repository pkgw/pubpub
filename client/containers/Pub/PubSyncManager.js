import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import { loginDataProps } from 'types/base';
import { apiFetch, getRandomColor } from 'utils';
import { initFirebase } from 'utils/firebaseClient';
import { getPubPageTitle } from 'shared/utils/pubPageTitle';

export const PubContext = React.createContext({
	pubData: {},
	collabData: {},
	historyData: {},
	firebaseBranchRef: null,
	updateLocalData: null,
});

const propTypes = {
	pubData: PropTypes.object.isRequired,
	children: PropTypes.func.isRequired,
	locationData: PropTypes.object.isRequired,
	communityData: PropTypes.object.isRequired,
	loginData: loginDataProps.isRequired,
};

const fetchVersionFromHistory = (pubData, historyKey, accessHash) =>
	apiFetch(
		'/api/pubHistory?' +
			queryString.stringify({
				pubId: pubData.id,
				communityId: pubData.communityId,
				branchId: pubData.activeBranch.id,
				historyKey: historyKey,
				accessHash: accessHash,
			}),
	);

const getLocalCollabUser = (pubData, loginData) => {
	const userColor = getRandomColor(loginData.id);
	return {
		id: loginData.id,
		backgroundColor: `rgba(${userColor}, 0.2)`,
		cursorColor: `rgba(${userColor}, 1.0)`,
		image: loginData.avatar || null,
		name: loginData.fullName || 'Anonymous',
		initials: loginData.initials || '?',
		canEdit: !!pubData.canEditBranch,
	};
};

const idleStateUpdater = (boundSetState, timeout = 50) => {
	let queue = [];
	let idleCallback = null;

	const setStateNow = () =>
		boundSetState((prevState) => {
			idleCallback = null;
			let state = prevState;
			const itemsInQueue = queue.length;
			queue.forEach(([update, maybeCallback]) => {
				const partial = typeof update === 'function' ? update(state) : update;
				state = {
					...state,
					...partial,
				};
				if (maybeCallback) {
					maybeCallback(state);
				}
			});
			queue = queue.slice(itemsInQueue);
			return state;
		});

	const setState = (...args) => {
		queue.push(args);
		if (!idleCallback) {
			idleCallback = requestIdleCallback(setStateNow, { timeout: timeout });
		}
	};

	return { setState: setState };
};
class PubSyncManager extends React.Component {
	constructor(props) {
		super(props);
		const { historyData } = this.props.pubData;
		this.state = {
			firebaseRootRef: undefined,
			firebaseBranchRef: undefined,
			pubData: this.props.pubData,
			collabData: {
				editorChangeObject: {},
				status: 'connecting',
				localCollabUser: getLocalCollabUser(this.props.pubData, this.props.loginData),
				remoteCollabUsers: [],
			},
			historyData: {
				...historyData,
				outstandingRequests: 0,
				isViewingHistory: false,
			},
		};
		this.idleStateUpdater = idleStateUpdater(this.setState.bind(this));
		this.syncRemoteCollabUsers = this.syncRemoteCollabUsers.bind(this);
		this.syncMetadata = this.syncMetadata.bind(this);
		this.syncDiscussionsContent = this.syncDiscussionsContent.bind(this);
		this.updatePubData = this.updatePubData.bind(this);
		this.updateCollabData = this.updateCollabData.bind(this);
		this.updateLocalData = this.updateLocalData.bind(this);
	}

	componentDidMount() {
		const rootKey = `pub-${this.props.pubData.id}`;
		const branchKey = `branch-${this.props.pubData.activeBranch.id}`;
		initFirebase(rootKey, this.props.pubData.firebaseToken).then(([rootRef, connectionRef]) => {
			this.setState(
				{
					firebaseRootRef: rootRef,
					firebaseBranchRef: rootRef.child(branchKey),
				},
				() => {
					this.state.firebaseRootRef
						.child('metadata')
						.on('child_changed', this.syncMetadata);

					this.state.firebaseBranchRef
						.child('discussionsContentLive')
						.on('value', this.syncDiscussionsContent);

					this.state.firebaseBranchRef
						.child('cursors')
						.on('value', this.syncRemoteCollabUsers);

					connectionRef.on('value', (snapshot) => {
						if (snapshot.val() === true) {
							this.updateLocalData('collab', { status: 'connected' });
						} else {
							this.updateLocalData('collab', { status: 'disconnected' });
						}
					});
				},
			);
		});
	}

	componentWillUnmount() {
		if (this.state.firebaseRootRef) {
			this.state.firebaseRootRef.child('metadata').off('child_changed', this.syncMetadata);
		}
		if (this.state.firebaseBranchRef) {
			this.state.firebaseBranchRef
				.child('discussionsContentLive')
				.off('child_changed', this.syncDiscussionsContent);
		}
	}

	syncMetadata(snapshot) {
		this.setState((prevState) => {
			/* Firebase erases empty arrays, so empty arrays we sync up have */
			/* to be manually reconstructed here */
			let newVal = snapshot.val();
			if (snapshot.key === 'branches') {
				newVal = newVal.map((branch) => {
					return {
						...branch,
						permissions: branch.permissions || [],
					};
				});
			}

			return {
				pubData: {
					...prevState.pubData,
					[snapshot.key]: newVal,
				},
			};
		});
	}

	syncDiscussionsContent(snapshot) {
		this.idleStateUpdater.setState((prevState) => {
			const val = snapshot.val();
			if (val) {
				const syncedDiscussions = Object.values(val);
				const newSyncedDiscussions = syncedDiscussions.filter((item) => {
					const exists = prevState.pubData.discussions.find((existingItem) => {
						return item.id === existingItem.id;
					});
					return !exists;
				});
				const updatedDiscussions = prevState.pubData.discussions.map(
					(existingDiscussion) => {
						const syncedContent = syncedDiscussions.find((item) => {
							return item.id === existingDiscussion.id;
						});
						return {
							...existingDiscussion,
							...(syncedContent || {}),
						};
					},
				);
				return {
					pubData: {
						...prevState.pubData,
						discussions: [...newSyncedDiscussions, ...updatedDiscussions],
					},
				};
			}
			return null;
		});
	}

	syncRemoteCollabUsers(snapshot) {
		const { loginData } = this.props;
		const users = snapshot.val();
		if (users) {
			this.updateCollabData({
				remoteCollabUsers: Object.values(users).filter((user) => user.id !== loginData.id),
			});
		}
	}

	updatePubData(newPubData) {
		/* First, set the local state. */
		/* Then, sync appropriate data to firebase. */
		/* Other clients will receive updates which */
		/* triggers the syncMetadata function. */
		this.idleStateUpdater.setState(
			(prevState) => {
				const nextData =
					typeof newPubData === 'function' ? newPubData(prevState.pubData) : newPubData;
				return {
					pubData: {
						...prevState.pubData,
						...nextData,
					},
				};
			},
			() => {
				const keysToSync = [
					'attributions',
					'avatar',
					'branches',
					'citationData',
					'collectionPubs',
					'description',
					'doi',
					'downloads',
					'isCommunityAdminManaged',
					'labels',
					'managers',
					'reviews',
					'slug',
					'title',
					'useHeaderImage',
				];
				const firebaseSyncData = {};
				keysToSync.forEach((key) => {
					if (key in newPubData) {
						firebaseSyncData[key] = newPubData[key];
					}
				});
				const hasUpdates = Object.keys(firebaseSyncData).length;
				if (this.state.firebaseRootRef && hasUpdates) {
					this.state.firebaseRootRef.child('metadata').update(firebaseSyncData);
				}
				document.title = getPubPageTitle(this.state.pubData, this.props.communityData);
			},
		);
	}

	updateCollabData(newCollabData) {
		this.idleStateUpdater.setState((prevState) => {
			return {
				collabData: {
					...prevState.collabData,
					...newCollabData,
				},
			};
		});
	}

	updateHistoryData(newHistoryData) {
		const { pubData, locationData } = this.props;
		const { historyData: prevHistoryData } = this.state;
		this.idleStateUpdater.setState(
			{
				historyData: {
					...prevHistoryData,
					...newHistoryData,
				},
			},
			() => {
				const { historyData: nextHistoryData } = this.state;
				if (prevHistoryData.currentKey !== nextHistoryData.currentKey) {
					// First, check to see whether we have an editorChangeObject corresponding to
					// the most recent document. If so, we don't need to do a fetch from the server
					// for this version, because we already have it stored locally.
					const {
						collabData: { editorChangeObject },
					} = this.state;
					const currentCollabDoc =
						editorChangeObject &&
						editorChangeObject.view &&
						editorChangeObject.view.state &&
						editorChangeObject.view.state.doc;
					if (
						nextHistoryData.currentKey === nextHistoryData.latestKey &&
						currentCollabDoc
					) {
						this.setState(({ historyData }) => {
							const nextTimestamp =
								historyData.timestamps[nextHistoryData.currentKey] || Date.now();
							return {
								historyData: {
									...historyData,
									historyDoc: currentCollabDoc.toJSON(),
									historyDocKey: `history-${nextHistoryData.currentKey}`,
									timestamps: {
										...historyData.timestamps,
										[nextHistoryData.currentKey]: nextTimestamp,
									},
								},
							};
						});
					} else {
						// The new state wants a document from somewhere in the history other than
						// the most recent version. We'll have to fetch that with the API.
						this.setState(
							({ historyData }) => ({
								historyData: {
									...historyData,
									outstandingRequests: historyData.outstandingRequests + 1,
								},
							}),
							() =>
								fetchVersionFromHistory(
									pubData,
									newHistoryData.currentKey,
									locationData.query.access,
								).then(({ content, historyData: { timestamps } }) => {
									this.setState(({ historyData }) => ({
										historyData: {
											...historyData,
											historyDoc: content,
											historyDocKey: `history-${nextHistoryData.currentKey}`,
											outstandingRequests:
												historyData.outstandingRequests - 1,
											timestamps: {
												...historyData.timestamps,
												...timestamps,
											},
										},
									}));
								}),
						);
					}
				}
			},
		);
	}

	updateLocalData(type, data) {
		if (type === 'pub') {
			this.updatePubData(data);
		}
		if (type === 'collab') {
			this.updateCollabData(data);
		}
		if (type === 'history') {
			this.updateHistoryData(data);
		}
	}

	render() {
		const context = {
			pubData: this.state.pubData,
			collabData: this.state.collabData,
			historyData: this.state.historyData,
			firebaseBranchRef: this.state.firebaseBranchRef,
			updateLocalData: this.updateLocalData,
		};
		return (
			<PubContext.Provider value={context}>
				{this.props.children(context)}
			</PubContext.Provider>
		);
	}
}

PubSyncManager.propTypes = propTypes;
export default PubSyncManager;
