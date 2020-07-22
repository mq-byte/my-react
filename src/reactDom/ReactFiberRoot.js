import { createHostRootFiber } from './ReactFiber'

function initializeUpdateQueue(fiber) {
	const queue = {
		baseState: fiber.memoizedState,
		baseQueue: null,
		shared: {
			pending: null
		},
		effects: null
	};
	fiber.updateQueue = queue;
}

function FiberRootNode(containerInfo, tag) {
	this.tag = tag;
	this.current = null;
	this.containerInfo = containerInfo;
	// this.pendingChildren = null;
	// this.pingCache = null;
	// this.finishedExpirationTime = NoWork;
	// this.finishedWork = null;
	// this.timeoutHandle = noTimeout;
	// this.context = null;
	// this.pendingContext = null;
	// this.callbackNode = null;
	// this.callbackPriority = NoPriority;
	// this.firstPendingTime = NoWork;
	// this.firstSuspendedTime = NoWork;
	// this.lastSuspendedTime = NoWork;
	// this.nextKnownPendingLevel = NoWork;
	// this.lastPingedTime = NoWork;
	// this.lastExpiredTime = NoWork;
	//
	// if (enableSchedulerTracing) {
	// 	this.interactionThreadID = unstable_getThreadID();
	// 	this.memoizedInteractions = new Set();
	// 	this.pendingInteractionMap = new Map();
	// }
	// if (enableSuspenseCallback) {
	// 	this.hydrationCallbacks = null;
	// }
}

export function createFiberRoot(containerInfo, tag){
	const root = new FiberRootNode(containerInfo);
	// if (enableSuspenseCallback) {
	// 	root.hydrationCallbacks = hydrationCallbacks;
	// }

	// Cyclic construction. This cheats the type system right now because
	// stateNode is any.
	const uninitializedFiber = createHostRootFiber(tag);
	root.current = uninitializedFiber;
	uninitializedFiber.stateNode = root;

	initializeUpdateQueue(uninitializedFiber);

	return root;
}
