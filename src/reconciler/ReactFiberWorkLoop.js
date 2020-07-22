import {createWorkInProgress,createFiberFromElement} from '../reactDom/ReactFiber'
import {
	IndeterminateComponent,
	FunctionComponent,
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
	MemoComponent,
	SimpleMemoComponent,
	LazyComponent,
	IncompleteClassComponent,
	FundamentalComponent,
	ScopeComponent,
	Block,
} from '../reactDom/ReactWorkTags';

import {REACT_ELEMENT_TYPE,REACT_PORTAL_TYPE,REACT_FRAGMENT_TYPE} from '../react/reactSymbols'

import { Placement } from '../reactDom/ReactSideEffectTags'

import {beginWork} from './ReactFiberBeginWork'

let workInProgressRoot;
let workInProgress;

const isArray = Array.isArray;


function ChildReconciler(shouldTrackSideEffects) {

	function placeSingleChild(newFiber) {
		// This is simpler for the single child case. We only need to do a
		// placement for inserting new children.
		if (shouldTrackSideEffects && newFiber.alternate === null) {
			newFiber.effectTag = Placement;
		}
		return newFiber;
	}

	function reconcileSingleElement(
		returnFiber,
		currentFirstChild,
		element,
	) {
		// const key = element.key;
		// let child = currentFirstChild;
		// while (child !== null) {
			// TODO: If key === null and child.key === null, then this only applies to
			// the first item in the list.
			// if (child.key === key) {
			// 	switch (child.tag) {
			// 		case Fragment: {
			// 			if (element.type === REACT_FRAGMENT_TYPE) {
			// 				deleteRemainingChildren(returnFiber, child.sibling);
			// 				const existing = useFiber(child, element.props.children);
			// 				existing.return = returnFiber;
			// 				if (__DEV__) {
			// 					existing._debugSource = element._source;
			// 					existing._debugOwner = element._owner;
			// 				}
			// 				return existing;
			// 			}
			// 			break;
			// 		}
			// 		case Block:
			// 			if (enableBlocksAPI) {
			// 				if (
			// 					element.type.$$typeof === REACT_BLOCK_TYPE &&
			// 					element.type.render === child.type.render
			// 				) {
			// 					deleteRemainingChildren(returnFiber, child.sibling);
			// 					const existing = useFiber(child, element.props);
			// 					existing.type = element.type;
			// 					existing.return = returnFiber;
			// 					if (__DEV__) {
			// 						existing._debugSource = element._source;
			// 						existing._debugOwner = element._owner;
			// 					}
			// 					return existing;
			// 				}
			// 			}
			// 		// We intentionally fallthrough here if enableBlocksAPI is not on.
			// 		// eslint-disable-next-lined no-fallthrough
			// 		default: {
			// 			if (
			// 				child.elementType === element.type ||
			// 				// Keep this check inline so it only runs on the false path:
			// 				(__DEV__
			// 					? isCompatibleFamilyForHotReloading(child, element)
			// 					: false)
			// 			) {
			// 				deleteRemainingChildren(returnFiber, child.sibling);
			// 				const existing = useFiber(child, element.props);
			// 				existing.ref = coerceRef(returnFiber, child, element);
			// 				existing.return = returnFiber;
			// 				return existing;
			// 			}
			// 			break;
			// 		}
			// 	}
			// 	// Didn't match.
			// 	deleteRemainingChildren(returnFiber, child);
			// 	break;
			// } else {
			// 	deleteChild(returnFiber, child);
			// }
			// child = child.sibling;
		// }

		// if (element.type === REACT_FRAGMENT_TYPE) {
		// 	const created = createFiberFromFragment(
		// 		element.props.children,
		// 		returnFiber.mode,
		// 		expirationTime,
		// 		element.key,
		// 	);
		// 	created.return = returnFiber;
		// 	return created;
		// } else {
			const created = createFiberFromElement(
				element,
				returnFiber.mode,
				// expirationTime,
			);
			// created.ref = coerceRef(returnFiber, currentFirstChild, element);
			created.return = returnFiber;
			return created;
		// }
	}

	function reconcileChildrenArray(
		returnFiber,
		currentFirstChild,
		newChildren,
		// expirationTime: ExpirationTime,
	){
		// This algorithm can't optimize by searching from both ends since we
		// don't have backpointers on fibers. I'm trying to see how far we can get
		// with that model. If it ends up not being worth the tradeoffs, we can
		// add it later.

		// Even with a two ended optimization, we'd want to optimize for the case
		// where there are few changes and brute force the comparison instead of
		// going for the Map. It'd like to explore hitting that path first in
		// forward-only mode and only go for the Map once we notice that we need
		// lots of look ahead. This doesn't handle reversal as well as two ended
		// search but that's unusual. Besides, for the two ended optimization to
		// work on Iterables, we'd need to copy the whole set.

		// In this first iteration, we'll just live with hitting the bad case
		// (adding everything to a Map) in for every insert/move.

		// If you change this code, also update reconcileChildrenIterator() which
		// uses the same algorithm.

		let resultingFirstChild: Fiber | null = null;
		let previousNewFiber: Fiber | null = null;

		let oldFiber = currentFirstChild;
		let lastPlacedIndex = 0;
		let newIdx = 0;
		let nextOldFiber = null;
		for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
			if (oldFiber.index > newIdx) {
				nextOldFiber = oldFiber;
				oldFiber = null;
			} else {
				nextOldFiber = oldFiber.sibling;
			}
			const newFiber = updateSlot(
				returnFiber,
				oldFiber,
				newChildren[newIdx],
				expirationTime,
			);
			if (newFiber === null) {
				// TODO: This breaks on empty slots like null children. That's
				// unfortunate because it triggers the slow path all the time. We need
				// a better way to communicate whether this was a miss or null,
				// boolean, undefined, etc.
				if (oldFiber === null) {
					oldFiber = nextOldFiber;
				}
				break;
			}
			if (shouldTrackSideEffects) {
				if (oldFiber && newFiber.alternate === null) {
					// We matched the slot, but we didn't reuse the existing fiber, so we
					// need to delete the existing child.
					deleteChild(returnFiber, oldFiber);
				}
			}
			lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
			if (previousNewFiber === null) {
				// TODO: Move out of the loop. This only happens for the first run.
				resultingFirstChild = newFiber;
			} else {
				// TODO: Defer siblings if we're not at the right index for this slot.
				// I.e. if we had null values before, then we want to defer this
				// for each null value. However, we also don't want to call updateSlot
				// with the previous one.
				previousNewFiber.sibling = newFiber;
			}
			previousNewFiber = newFiber;
			oldFiber = nextOldFiber;
		}

		if (newIdx === newChildren.length) {
			// We've reached the end of the new children. We can delete the rest.
			deleteRemainingChildren(returnFiber, oldFiber);
			return resultingFirstChild;
		}

		if (oldFiber === null) {
			// If we don't have any more existing children we can choose a fast path
			// since the rest will all be insertions.
			for (; newIdx < newChildren.length; newIdx++) {
				const newFiber = createChild(
					returnFiber,
					newChildren[newIdx],
					expirationTime,
				);
				if (newFiber === null) {
					continue;
				}
				lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
				if (previousNewFiber === null) {
					// TODO: Move out of the loop. This only happens for the first run.
					resultingFirstChild = newFiber;
				} else {
					previousNewFiber.sibling = newFiber;
				}
				previousNewFiber = newFiber;
			}
			return resultingFirstChild;
		}

		// Add all children to a key map for quick lookups.
		const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

		// Keep scanning and use the map to restore deleted items as moves.
		for (; newIdx < newChildren.length; newIdx++) {
			const newFiber = updateFromMap(
				existingChildren,
				returnFiber,
				newIdx,
				newChildren[newIdx],
				expirationTime,
			);
			if (newFiber !== null) {
				if (shouldTrackSideEffects) {
					if (newFiber.alternate !== null) {
						// The new fiber is a work in progress, but if there exists a
						// current, that means that we reused the fiber. We need to delete
						// it from the child list so that we don't add it to the deletion
						// list.
						existingChildren.delete(
							newFiber.key === null ? newIdx : newFiber.key,
						);
					}
				}
				lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
				if (previousNewFiber === null) {
					resultingFirstChild = newFiber;
				} else {
					previousNewFiber.sibling = newFiber;
				}
				previousNewFiber = newFiber;
			}
		}

		if (shouldTrackSideEffects) {
			// Any existing children that weren't consumed above were deleted. We need
			// to add them to the deletion list.
			existingChildren.forEach(child => deleteChild(returnFiber, child));
		}

		return resultingFirstChild;
	}


	function reconcileChildFibers(
		returnFiber,
		currentFirstChild,
		newChild,
	){
		// This function is not recursive.
		// If the top level item is an array, we treat it as a set of children,
		// not as a fragment. Nested arrays on the other hand will be treated as
		// fragment nodes. Recursion happens at the normal flow.

		// Handle top level unkeyed fragments as if they were arrays.
		// This leads to an ambiguity between <>{[...]}</> and <>...</>.
		// We treat the ambiguous cases above the same.


		// Handle object types
		const isObject = typeof newChild === 'object' && newChild !== null;

		if (isObject) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(
							returnFiber,
							currentFirstChild,
							newChild,
							// expirationTime,
						),
					);
				case REACT_PORTAL_TYPE:
					// return placeSingleChild(
					// 	reconcileSinglePortal(
					// 		returnFiber,
					// 		currentFirstChild,
					// 		newChild,
					// 		expirationTime,
					// 	),
					// );
			}
		}
		//
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			// return placeSingleChild(
			// 	reconcileSingleTextNode(
			// 		returnFiber,
			// 		currentFirstChild,
			// 		'' + newChild,
			// 		expirationTime,
			// 	),
			// );
		}
		//
		if (isArray(newChild)) {
			return reconcileChildrenArray(
				returnFiber,
				currentFirstChild,
				newChild,
				expirationTime,
			);
		}
		//
		// if (getIteratorFn(newChild)) {
		// 	return reconcileChildrenIterator(
		// 		returnFiber,
		// 		currentFirstChild,
		// 		newChild,
		// 		expirationTime,
		// 	);
		// }
		//
		// if (isObject) {
		// 	throwOnInvalidObjectType(returnFiber, newChild);
		// }
		//
		// if (__DEV__) {
		// 	if (typeof newChild === 'function') {
		// 		warnOnFunctionType();
		// 	}
		// }
		// if (typeof newChild === 'undefined' && !isUnkeyedTopLevelFragment) {
		// 	// If the new child is undefined, and the return fiber is a composite
		// 	// component, throw an error. If Fiber return types are disabled,
		// 	// we already threw above.
		// 	switch (returnFiber.tag) {
		// 		case ClassComponent: {
		// 			if (__DEV__) {
		// 				const instance = returnFiber.stateNode;
		// 				if (instance.render._isMockFunction) {
		// 					// We allow auto-mocks to proceed as if they're returning null.
		// 					break;
		// 				}
		// 			}
		// 		}
		// 		// Intentionally fall through to the next case, which handles both
		// 		// functions and classes
		// 		// eslint-disable-next-lined no-fallthrough
		// 		case FunctionComponent: {
		// 			const Component = returnFiber.type;
		// 			invariant(
		// 				false,
		// 				'%s(...): Nothing was returned from render. This usually means a ' +
		// 				'return statement is missing. Or, to render nothing, ' +
		// 				'return null.',
		// 				Component.displayName || Component.name || 'Component',
		// 			);
		// 		}
		// 	}
		// }
		//
		// // Remaining cases are all treated as empty.
		// return deleteRemainingChildren(returnFiber, currentFirstChild);
	}

	return reconcileChildFibers;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);

export function reconcileChildren(
	current,
	workInProgress,
	nextChildren
) {
	debugger
	if (current === null) {
		// If this is a fresh new component that hasn't been rendered yet, we
		// won't update its child set by applying minimal side-effects. Instead,
		// we will add them all to the child before it gets rendered. That means
		// we can optimize this reconciliation pass by not tracking side-effects.


		workInProgress.child = mountChildFibers(
			workInProgress,
			null,
			nextChildren,
		);
	} else {
		// If the current child is the same as the work in progress, it means that
		// we haven't yet started any work on these children. Therefore, we use
		// the clone algorithm to create a copy of all the current children.

		// If we had any progressed work already, that is invalid at this point so
		// let's throw it out.
		workInProgress.child = reconcileChildFibers(
			workInProgress,
			current.child,
			nextChildren,
		);
	}
}


function performUnitOfWork(unitOfWork){
	// The current, flushed, state of this fiber is the alternate. Ideally
	// nothing should rely on this, but relying on it here means that we don't
	// need an additional field on the work in progress.
	const current = unitOfWork.alternate;

	// let next;
	// if (enableProfilerTimer && (unitOfWork.mode & ProfileMode) !== NoMode) {
	// 	startProfilerTimer(unitOfWork);
	// 	next = beginWork(current, unitOfWork, renderExpirationTime);
	// 	stopProfilerTimerIfRunningAndRecordDelta(unitOfWork, true);
	// } else {
	// 	next = beginWork(current, unitOfWork, renderExpirationTime);
	// }

	let next = beginWork(current, unitOfWork);

	// resetCurrentDebugFiberInDEV();
	unitOfWork.memoizedProps = unitOfWork.pendingProps;
	if (!next) {
		// If this doesn't spawn new work, complete the current work.
		// next = completeUnitOfWork(unitOfWork);
		console.log(workInProgressRoot,'workInProgressRoot');
	}

	// ReactCurrentOwner.current = null;
	return next;
}

function workLoopSync() {
	// Already timed out, so perform work without checking if we need to yield.
	// while (workInProgress !== null) {
	// 	workInProgress = performUnitOfWork(workInProgress);
	// }

	while (!!workInProgress) {
		workInProgress = performUnitOfWork(workInProgress);
	}
}

function prepareFreshStack(root) {
	root.finishedWork = null;

	workInProgressRoot = root;
	workInProgress = createWorkInProgress(root.current, null);
	// renderExpirationTime = expirationTime;
	// workInProgressRootExitStatus = RootIncomplete;
	// workInProgressRootFatalError = null;
	// workInProgressRootLatestProcessedExpirationTime = Sync;
	// workInProgressRootLatestSuspenseTimeout = Sync;
	// workInProgressRootCanSuspendUsingConfig = null;
	// workInProgressRootNextUnprocessedUpdateTime = NoWork;
	// workInProgressRootHasPendingPing = false;

}

function performSyncWorkOnRoot(root) {
	// Check if there's expired work on this root. Otherwise, render at Sync.
	if (root !== workInProgressRoot) {
		prepareFreshStack(root);
		// startWorkOnPendingInteractions(root);
	}
	// If we have a work-in-progress fiber, it means there's still work to do
	// in this root.
	if (workInProgress !== null) {
		// const prevExecutionContext = executionContext;
		// executionContext |= RenderContext;
		// const prevDispatcher = pushDispatcher(root);
		// const prevInteractions = pushInteractions(root);
		// startWorkLoopTimer(workInProgress);

		do {
			try {
				workLoopSync();
				break;
			} catch (thrownValue) {
				// handleError(root, thrownValue);
			}
		} while (true);
		// resetContextDependencies();
		// executionContext = prevExecutionContext;
		// popDispatcher(prevDispatcher);
		// if (enableSchedulerTracing) {
		// 	popInteractions(((prevInteractions: any): Set<Interaction>));
		// }

		// if (workInProgressRootExitStatus === RootFatalErrored) {
		// 	const fatalError = workInProgressRootFatalError;
		// 	stopInterruptedWorkLoopTimer();
		// 	prepareFreshStack(root, expirationTime);
		// 	markRootSuspendedAtTime(root, expirationTime);
		// 	ensureRootIsScheduled(root);
		// 	throw fatalError;
		// }

		if (workInProgress !== null) {
			// // This is a sync render, so we should have finished the whole tree.
			// invariant(
			// 	false,
			// 	'Cannot commit an incomplete root. This error is likely caused by a ' +
			// 	'bug in React. Please file an issue.',
			// );
		} else {
			// We now have a consistent tree. Because this is a sync render, we
			// will commit it even if something suspended.
			// stopFinishedWorkLoopTimer();
			root.finishedWork = root.current.alternate;
			// root.finishedExpirationTime = expirationTime;
			//渲染
			// finishSyncRender(root);
		}

		// Before exiting, make sure there's a callback scheduled for the next
		// pending level.
		// ensureRootIsScheduled(root);
	}

	return null;
}

export function scheduleUpdateOnFiber(fiber) {
	// const root = markUpdateTimeFromFiberToRoot(fiber, expirationTime);
	const root = fiber.stateNode;
	performSyncWorkOnRoot(root);

	// if (expirationTime === Sync) {
	// 	if (
	// 		// Check if we're inside unbatchedUpdates
	// 		(executionContext & LegacyUnbatchedContext) !== NoContext &&
	// 		// Check if we're not already rendering
	// 		(executionContext & (RenderContext | CommitContext)) === NoContext
	// 	) {
	// 		// Register pending interactions on the root to avoid losing traced interaction data.
	// 		schedulePendingInteractions(root, expirationTime);
	//
	// 		// This is a legacy edge case. The initial mount of a ReactDOM.render-ed
	// 		// root inside of batchedUpdates should be synchronous, but layout updates
	// 		// should be deferred until the end of the batch.
	// 		performSyncWorkOnRoot(root);
	// 	} else {
	// 		ensureRootIsScheduled(root);
	// 		schedulePendingInteractions(root, expirationTime);
	// 		if (executionContext === NoContext) {
	// 			// Flush the synchronous work now, unless we're already working or inside
	// 			// a batch. This is intentionally inside scheduleUpdateOnFiber instead of
	// 			// scheduleCallbackForFiber to preserve the ability to schedule a callback
	// 			// without immediately flushing it. We only do this for user-initiated
	// 			// updates, to preserve historical behavior of legacy mode.
	// 			flushSyncCallbackQueue();
	// 		}
	// 	}
	// } else {
	// 	ensureRootIsScheduled(root);
	// 	schedulePendingInteractions(root, expirationTime);
	// }
	//
	// if (
	// 	(executionContext & DiscreteEventContext) !== NoContext &&
	// 	// Only updates at user-blocking priority or greater are considered
	// 	// discrete, even inside a discrete event.
	// 	(priorityLevel === UserBlockingPriority ||
	// 		priorityLevel === ImmediatePriority)
	// ) {
	// 	// This is the result of a discrete event. Track the lowest priority
	// 	// discrete update per root so we can flush them early, if needed.
	// 	if (rootsWithPendingDiscreteUpdates === null) {
	// 		rootsWithPendingDiscreteUpdates = new Map([[root, expirationTime]]);
	// 	} else {
	// 		const lastDiscreteTime = rootsWithPendingDiscreteUpdates.get(root);
	// 		if (lastDiscreteTime === undefined || lastDiscreteTime > expirationTime) {
	// 			rootsWithPendingDiscreteUpdates.set(root, expirationTime);
	// 		}
	// 	}
	// }
}
export const scheduleWork = scheduleUpdateOnFiber;
