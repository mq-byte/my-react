import { NoEffect } from './ReactSideEffectTags'
import {
	IndeterminateComponent,
	ClassComponent,
	HostRoot,
	HostComponent,
	HostText,
	HostPortal,
	ForwardRef,
	Fragment,
	Mode,
	ContextProvider,
	ContextConsumer,
	Profiler,
	SuspenseComponent,
	SuspenseListComponent,
	DehydratedFragment,
	FunctionComponent,
	MemoComponent,
	SimpleMemoComponent,
	LazyComponent,
	FundamentalComponent,
	ScopeComponent,
	Block,
} from '../reactDom/ReactWorkTags';


function FiberNode(tag,pendingProps) {
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
	this.pendingProps = pendingProps;
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

const createFiber = function(tag,pendingProps) {
	// $FlowFixMe: the shapes are exact here but Flow doesn't like constructors
	return new FiberNode(tag,pendingProps);
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


export function createWorkInProgress(current, pendingProps) {
	let workInProgress = current.alternate;
	debugger
	if (workInProgress === null || workInProgress === undefined) {
		// We use a double buffering pooling technique because we know that we'll
		// only ever need at most two versions of a tree. We pool the "other" unused
		// node that we're free to reuse. This is lazily created to avoid allocating
		// extra objects for things that are never updated. It also allow us to
		// reclaim the extra memory if needed.
		workInProgress = createFiber(
			current.tag,
			pendingProps,
			current.key,
			current.mode,
		);
		workInProgress.elementType = current.elementType;
		workInProgress.type = current.type;
		workInProgress.stateNode = current.stateNode;

		workInProgress.alternate = current;
		current.alternate = workInProgress;
	} else {
		workInProgress.pendingProps = pendingProps;

		// We already have an alternate.
		// Reset the effect tag.
		workInProgress.effectTag = NoEffect;

		// The effect list is no longer valid.
		workInProgress.nextEffect = null;
		workInProgress.firstEffect = null;
		workInProgress.lastEffect = null;
	}

	// workInProgress.childExpirationTime = current.childExpirationTime;
	// workInProgress.expirationTime = current.expirationTime;

	workInProgress.child = current.child;
	workInProgress.memoizedProps = current.memoizedProps;
	workInProgress.memoizedState = current.memoizedState;
	workInProgress.updateQueue = current.updateQueue;

	// Clone the dependencies object. This is mutated during the render phase, so
	// it cannot be shared with the current fiber.
	// const currentDependencies = current.dependencies;
	// workInProgress.dependencies =
	// 	currentDependencies === null
	// 		? null
	// 		: {
	// 			expirationTime: currentDependencies.expirationTime,
	// 			firstContext: currentDependencies.firstContext,
	// 			responders: currentDependencies.responders,
	// 		};

	// These will be overridden during the parent's reconciliation
	workInProgress.sibling = current.sibling;
	// workInProgress.index = current.index;
	// workInProgress.ref = current.ref;

	return workInProgress;
}

export function createFiberFromTypeAndProps(
	type, // React$ElementType
	// key,
	pendingProps,
	owner,
	mode,
	// expirationTime:,
) {
	let fiber;

	let fiberTag = IndeterminateComponent;
	// The resolved type is set if we know what the final type will be. I.e. it's not lazy.
	let resolvedType = type;
	if (typeof type === 'function') {
		// if (shouldConstruct(type)) {
		// 	fiberTag = ClassComponent;
		//
		// }
	} else if (typeof type === 'string') {
		fiberTag = HostComponent;
	} else {
		// getTag: switch (type) {
		// 	case REACT_FRAGMENT_TYPE:
		// 		return createFiberFromFragment(
		// 			pendingProps.children,
		// 			mode,
		// 			expirationTime,
		// 			key,
		// 		);
		// 	case REACT_CONCURRENT_MODE_TYPE:
		// 		fiberTag = Mode;
		// 		mode |= ConcurrentMode | BlockingMode | StrictMode;
		// 		break;
		// 	case REACT_STRICT_MODE_TYPE:
		// 		fiberTag = Mode;
		// 		mode |= StrictMode;
		// 		break;
		// 	case REACT_PROFILER_TYPE:
		// 		return createFiberFromProfiler(pendingProps, mode, expirationTime, key);
		// 	case REACT_SUSPENSE_TYPE:
		// 		return createFiberFromSuspense(pendingProps, mode, expirationTime, key);
		// 	case REACT_SUSPENSE_LIST_TYPE:
		// 		return createFiberFromSuspenseList(
		// 			pendingProps,
		// 			mode,
		// 			expirationTime,
		// 			key,
		// 		);
		// 	default: {
		// 		if (typeof type === 'object' && type !== null) {
		// 			switch (type.$$typeof) {
		// 				case REACT_PROVIDER_TYPE:
		// 					fiberTag = ContextProvider;
		// 					break getTag;
		// 				case REACT_CONTEXT_TYPE:
		// 					// This is a consumer
		// 					fiberTag = ContextConsumer;
		// 					break getTag;
		// 				case REACT_FORWARD_REF_TYPE:
		// 					fiberTag = ForwardRef;
		// 					if (__DEV__) {
		// 						resolvedType = resolveForwardRefForHotReloading(resolvedType);
		// 					}
		// 					break getTag;
		// 				case REACT_MEMO_TYPE:
		// 					fiberTag = MemoComponent;
		// 					break getTag;
		// 				case REACT_LAZY_TYPE:
		// 					fiberTag = LazyComponent;
		// 					resolvedType = null;
		// 					break getTag;
		// 				case REACT_BLOCK_TYPE:
		// 					fiberTag = Block;
		// 					break getTag;
		// 				case REACT_FUNDAMENTAL_TYPE:
		// 					if (enableFundamentalAPI) {
		// 						return createFiberFromFundamental(
		// 							type,
		// 							pendingProps,
		// 							mode,
		// 							expirationTime,
		// 							key,
		// 						);
		// 					}
		// 					break;
		// 				case REACT_SCOPE_TYPE:
		// 					if (enableScopeAPI) {
		// 						return createFiberFromScope(
		// 							type,
		// 							pendingProps,
		// 							mode,
		// 							expirationTime,
		// 							key,
		// 						);
		// 					}
		// 			}
		// 		}
		// 		let info = '';
		// 		if (__DEV__) {
		// 			if (
		// 				type === undefined ||
		// 				(typeof type === 'object' &&
		// 					type !== null &&
		// 					Object.keys(type).length === 0)
		// 			) {
		// 				info +=
		// 					' You likely forgot to export your component from the file ' +
		// 					"it's defined in, or you might have mixed up default and " +
		// 					'named imports.';
		// 			}
		// 			const ownerName = owner ? getComponentName(owner.type) : null;
		// 			if (ownerName) {
		// 				info += '\n\nCheck the render method of `' + ownerName + '`.';
		// 			}
		// 		}
		// 		invariant(
		// 			false,
		// 			'Element type is invalid: expected a string (for built-in ' +
		// 			'components) or a class/function (for composite components) ' +
		// 			'but got: %s.%s',
		// 			type == null ? type : typeof type,
		// 			info,
		// 		);
		// 	}
		// }
	}

	fiber = createFiber(fiberTag, pendingProps,
		// key,
		mode);
	fiber.elementType = type;
	fiber.type = resolvedType;
	// fiber.expirationTime = expirationTime;

	return fiber;
}

export function createFiberFromElement(
	element,
	mode,
	// expirationTime: ExpirationTime,
) {
	let owner = null;
	const type = element.type;
	// const key = element.key;
	const pendingProps = element.props;
	debugger
	const fiber = createFiberFromTypeAndProps(
		type,
		// key,
		pendingProps,
		owner,
		mode,
		// expirationTime,
	);
	return fiber;
}
