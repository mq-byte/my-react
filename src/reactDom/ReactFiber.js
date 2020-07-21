import { HostRoot } from './ReactWorkTags'
import { NoEffect } from './ReactSideEffectTags'

function FiberNode(tag) {
	// Instance
	this.tag = tag;
	// this.key = key;
	this.elementType = null;
	this.type = null;
	this.stateNode = null;

	// Fiber
	this.return = null;
	this.child = null;
	this.sibling = null;
	this.index = 0;
	//
	// this.ref = null;
	//
	// this.pendingProps = pendingProps;
	this.memoizedProps = null;
	this.updateQueue = null;
	this.memoizedState = null;
	this.dependencies = null;

	// this.mode = mode;

	// Effects
	this.effectTag = NoEffect;
	this.nextEffect = null;

	this.firstEffect = null;
	this.lastEffect = null;

	// this.expirationTime = NoWork;
	// this.childExpirationTime = NoWork;

	this.alternate = null;

	// if (enableProfilerTimer) {
	// 	// Note: The following is done to avoid a v8 performance cliff.
	// 	//
	// 	// Initializing the fields below to smis and later updating them with
	// 	// double values will cause Fibers to end up having separate shapes.
	// 	// This behavior/bug has something to do with Object.preventExtension().
	// 	// Fortunately this only impacts DEV builds.
	// 	// Unfortunately it makes React unusably slow for some applications.
	// 	// To work around this, initialize the fields below with doubles.
	// 	//
	// 	// Learn more about this here:
	// 	// https://github.com/facebook/react/issues/14365
	// 	// https://bugs.chromium.org/p/v8/issues/detail?id=8538
	// 	this.actualDuration = Number.NaN;
	// 	this.actualStartTime = Number.NaN;
	// 	this.selfBaseDuration = Number.NaN;
	// 	this.treeBaseDuration = Number.NaN;
	//
	// 	// It's okay to replace the initial doubles with smis after initialization.
	// 	// This won't trigger the performance cliff mentioned above,
	// 	// and it simplifies other profiler code (including DevTools).
	// 	this.actualDuration = 0;
	// 	this.actualStartTime = -1;
	// 	this.selfBaseDuration = 0;
	// 	this.treeBaseDuration = 0;
	// }
	//
	// // This is normally DEV-only except www when it adds listeners.
	// // TODO: remove the User Timing integration in favor of Root Events.
	// if (enableUserTimingAPI) {
	// 	this._debugID = debugCounter++;
	// 	this._debugIsCurrentlyTiming = false;
	// }
}

const createFiber = function(tag) {
	// $FlowFixMe: the shapes are exact here but Flow doesn't like constructors
	return new FiberNode(tag);
};

export function createHostRootFiber(tag) {
	// let mode;
	// if (tag === ConcurrentRoot) {
	// 	mode = ConcurrentMode | BlockingMode | StrictMode;
	// } else if (tag === BlockingRoot) {
	// 	mode = BlockingMode | StrictMode;
	// } else {
	// 	mode = NoMode;
	// }
	//
	// if (enableProfilerTimer && isDevToolsPresent) {
	// 	// Always collect profile timings when DevTools are present.
	// 	// This enables DevTools to start capturing timing at any point–
	// 	// Without some nodes in the tree having empty base times.
	// 	mode |= ProfileMode;
	// }

	// return createFiber(HostRoot, null, null, mode);
	return createFiber(HostRoot);
}
