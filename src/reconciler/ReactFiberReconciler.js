import { createUpdate, enqueueUpdate } from './ReactUpdateQueue'
import {scheduleWork} from './ReactFiberWorkLoop'
export function updateContainer(element, container){
	const current = container.current;
	// const currentTime = requestCurrentTimeForUpdate();
	// const currentTime = performance.now();
	//
	// const suspenseConfig = requestCurrentSuspenseConfig();
	// const expirationTime = computeExpirationForFiber(
	// 	currentTime,
	// 	current,
	// 	suspenseConfig,
	// );

	// const context = getContextForSubtree(parentComponent);
	// if (container.context === null) {
	// 	container.context = context;
	// } else {
	// 	container.pendingContext = context;
	// }

	const update = createUpdate();
	// Caution: React DevTools currently depends on this property
	// being called "element".
	update.payload = {element};

	enqueueUpdate(current, update);
	scheduleWork(current, 0);

	return 0;
}
