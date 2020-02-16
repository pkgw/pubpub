import { useContext } from 'react';

// TODO(ian): Move this here?
// import { PageContext } from 'utils/hooks';
import { PubContext } from './PubSyncManager';

// export const usePageContext = () => {
// 	return useContext(PageContext);
// };

export const usePubContext = () => {
	return useContext(PubContext);
};

export const useCollab = () => {
	const { collabData } = useContext(PubContext);
	return collabData;
};

export const usePubHistory = () => {
	const { historyData } = useContext(PubContext);
	return historyData;
};

export const usePubData = () => {
	const { pubData } = useContext(PubContext);
	return pubData;
};
