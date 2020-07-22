import {ContentReset} from '../reactDom/ReactSideEffectTags'
import {reconcileChildren} from './ReactFiberWorkLoop'
import {processUpdateQueue} from "./ReactUpdateQueue";
import {HostComponent, HostRoot, HostText} from "../reactDom/ReactWorkTags";

function shouldSetTextContent(type, props) {
	return type === 'textarea' || type === 'option' || type === 'noscript' || typeof props.children === 'string' || typeof props.children === 'number' || typeof props.dangerouslySetInnerHTML === 'object' && props.dangerouslySetInnerHTML !== null && props.dangerouslySetInnerHTML.__html != null;
}

function updateHostComponent(current, workInProgress, renderExpirationTime) {
	// pushHostContext(workInProgress);
	//
	// if (current === null) {
	// 	tryToClaimNextHydratableInstance(workInProgress);
	// }

	const type = workInProgress.type;
	const nextProps = workInProgress.pendingProps;
	const prevProps = current !== null ? current.memoizedProps : null;

	let nextChildren = nextProps.children;
	const isDirectTextChild = shouldSetTextContent(type, nextProps);

	if (isDirectTextChild) {
		// We special case a direct text child of a host node. This is a common
		// case. We won't handle it as a reified child. We will instead handle
		// this in the host environment that also has access to this prop. That
		// avoids allocating another HostText fiber and traversing it.
		nextChildren = null;
	} else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
		// If we're switching from a direct text child to a normal child, or to
		// empty, we need to schedule the text content to be reset.
		workInProgress.effectTag |= ContentReset;
	}

	// markRef(current, workInProgress);

	// Check the host config to see if the children are offscreen/hidden.
	// if (
	// 	workInProgress.mode & ConcurrentMode &&
	// 	renderExpirationTime !== Never &&
	// 	shouldDeprioritizeSubtree(type, nextProps)
	// ) {
	// 	if (enableSchedulerTracing) {
	// 		markSpawnedWork(Never);
	// 	}
	// 	// Schedule this fiber to re-render at offscreen priority. Then bailout.
	// 	workInProgress.expirationTime = workInProgress.childExpirationTime = Never;
	// 	return null;
	// }

	reconcileChildren(
		current,
		workInProgress,
		nextChildren,
		renderExpirationTime,
	);
	return workInProgress.child;
}


function updateHostRoot(current, workInProgress, renderExpirationTime) {
	// pushHostRootContext(workInProgress);

	const nextProps = workInProgress.pendingProps;
	const prevState = workInProgress.memoizedState;
	// const prevChildren = prevState !== null ? prevState.element : null;
	// cloneUpdateQueue(current, workInProgress);
	processUpdateQueue(workInProgress, nextProps, null, renderExpirationTime);
	const nextState = workInProgress.memoizedState;
	// Caution: React DevTools currently depends on this property
	// being called "element".
	const nextChildren = nextState.element;
	// if (nextChildren === prevChildren) {
	// 	// If the state is the same as before, that's a bailout because we had
	// 	// no work that expires at this time.
	// 	resetHydrationState();
	// 	return bailoutOnAlreadyFinishedWork(
	// 		current,
	// 		workInProgress,
	// 		renderExpirationTime,
	// 	);
	// }
	reconcileChildren(
		current,
		workInProgress,
		nextChildren,
	);
	return workInProgress.child;
}

export function beginWork(current, workInProgress) {
	// const updateExpirationTime = workInProgress.expirationTime;
	//
	// if (current !== null) {
	// 	const oldProps = current.memoizedProps;
	// 	const newProps = workInProgress.pendingProps;
	//
	// 	if (
	// 		oldProps !== newProps ||
	// 		hasLegacyContextChanged() ||
	// 		// Force a re-render if the implementation changed due to hot reload:
	// 		(__DEV__ ? workInProgress.type !== current.type : false)
	// 	) {
	// 		// If props or context changed, mark the fiber as having performed work.
	// 		// This may be unset if the props are determined to be equal later (memo).
	// 		didReceiveUpdate = true;
	// 	} else if (updateExpirationTime < renderExpirationTime) {
	// 		didReceiveUpdate = false;
	// 		// This fiber does not have any pending work. Bailout without entering
	// 		// the begin phase. There's still some bookkeeping we that needs to be done
	// 		// in this optimized path, mostly pushing stuff onto the stack.
	// 		switch (workInProgress.tag) {
	// 			case HostRoot:
	// 				pushHostRootContext(workInProgress);
	// 				resetHydrationState();
	// 				break;
	// 			case HostComponent:
	// 				pushHostContext(workInProgress);
	// 				if (
	// 					workInProgress.mode & ConcurrentMode &&
	// 					renderExpirationTime !== Never &&
	// 					shouldDeprioritizeSubtree(workInProgress.type, newProps)
	// 				) {
	// 					if (enableSchedulerTracing) {
	// 						markSpawnedWork(Never);
	// 					}
	// 					// Schedule this fiber to re-render at offscreen priority. Then bailout.
	// 					workInProgress.expirationTime = workInProgress.childExpirationTime = Never;
	// 					return null;
	// 				}
	// 				break;
	// 			case ClassComponent: {
	// 				const Component = workInProgress.type;
	// 				if (isLegacyContextProvider(Component)) {
	// 					pushLegacyContextProvider(workInProgress);
	// 				}
	// 				break;
	// 			}
	// 			case HostPortal:
	// 				pushHostContainer(
	// 					workInProgress,
	// 					workInProgress.stateNode.containerInfo,
	// 				);
	// 				break;
	// 			case ContextProvider: {
	// 				const newValue = workInProgress.memoizedProps.value;
	// 				pushProvider(workInProgress, newValue);
	// 				break;
	// 			}
	// 			case Profiler:
	// 				if (enableProfilerTimer) {
	// 					// Profiler should only call onRender when one of its descendants actually rendered.
	// 					const hasChildWork =
	// 						workInProgress.childExpirationTime >= renderExpirationTime;
	// 					if (hasChildWork) {
	// 						workInProgress.effectTag |= Update;
	// 					}
	// 				}
	// 				break;
	// 			case SuspenseComponent: {
	// 				const state: SuspenseState | null = workInProgress.memoizedState;
	// 				if (state !== null) {
	// 					if (enableSuspenseServerRenderer) {
	// 						if (state.dehydrated !== null) {
	// 							pushSuspenseContext(
	// 								workInProgress,
	// 								setDefaultShallowSuspenseContext(suspenseStackCursor.current),
	// 							);
	// 							// We know that this component will suspend again because if it has
	// 							// been unsuspended it has committed as a resolved Suspense component.
	// 							// If it needs to be retried, it should have work scheduled on it.
	// 							workInProgress.effectTag |= DidCapture;
	// 							break;
	// 						}
	// 					}
	//
	// 					// If this boundary is currently timed out, we need to decide
	// 					// whether to retry the primary children, or to skip over it and
	// 					// go straight to the fallback. Check the priority of the primary
	// 					// child fragment.
	// 					const primaryChildFragment: Fiber = (workInProgress.child: any);
	// 					const primaryChildExpirationTime =
	// 						primaryChildFragment.childExpirationTime;
	// 					if (
	// 						primaryChildExpirationTime !== NoWork &&
	// 						primaryChildExpirationTime >= renderExpirationTime
	// 					) {
	// 						// The primary children have pending work. Use the normal path
	// 						// to attempt to render the primary children again.
	// 						return updateSuspenseComponent(
	// 							current,
	// 							workInProgress,
	// 							renderExpirationTime,
	// 						);
	// 					} else {
	// 						pushSuspenseContext(
	// 							workInProgress,
	// 							setDefaultShallowSuspenseContext(suspenseStackCursor.current),
	// 						);
	// 						// The primary children do not have pending work with sufficient
	// 						// priority. Bailout.
	// 						const child = bailoutOnAlreadyFinishedWork(
	// 							current,
	// 							workInProgress,
	// 							renderExpirationTime,
	// 						);
	// 						if (child !== null) {
	// 							// The fallback children have pending work. Skip over the
	// 							// primary children and work on the fallback.
	// 							return child.sibling;
	// 						} else {
	// 							return null;
	// 						}
	// 					}
	// 				} else {
	// 					pushSuspenseContext(
	// 						workInProgress,
	// 						setDefaultShallowSuspenseContext(suspenseStackCursor.current),
	// 					);
	// 				}
	// 				break;
	// 			}
	// 			case SuspenseListComponent: {
	// 				const didSuspendBefore =
	// 					(current.effectTag & DidCapture) !== NoEffect;
	//
	// 				const hasChildWork =
	// 					workInProgress.childExpirationTime >= renderExpirationTime;
	//
	// 				if (didSuspendBefore) {
	// 					if (hasChildWork) {
	// 						// If something was in fallback state last time, and we have all the
	// 						// same children then we're still in progressive loading state.
	// 						// Something might get unblocked by state updates or retries in the
	// 						// tree which will affect the tail. So we need to use the normal
	// 						// path to compute the correct tail.
	// 						return updateSuspenseListComponent(
	// 							current,
	// 							workInProgress,
	// 							renderExpirationTime,
	// 						);
	// 					}
	// 					// If none of the children had any work, that means that none of
	// 					// them got retried so they'll still be blocked in the same way
	// 					// as before. We can fast bail out.
	// 					workInProgress.effectTag |= DidCapture;
	// 				}
	//
	// 				// If nothing suspended before and we're rendering the same children,
	// 				// then the tail doesn't matter. Anything new that suspends will work
	// 				// in the "together" mode, so we can continue from the state we had.
	// 				let renderState = workInProgress.memoizedState;
	// 				if (renderState !== null) {
	// 					// Reset to the "together" mode in case we've started a different
	// 					// update in the past but didn't complete it.
	// 					renderState.rendering = null;
	// 					renderState.tail = null;
	// 				}
	// 				pushSuspenseContext(workInProgress, suspenseStackCursor.current);
	//
	// 				if (hasChildWork) {
	// 					break;
	// 				} else {
	// 					// If none of the children had any work, that means that none of
	// 					// them got retried so they'll still be blocked in the same way
	// 					// as before. We can fast bail out.
	// 					return null;
	// 				}
	// 			}
	// 		}
	// 		return bailoutOnAlreadyFinishedWork(
	// 			current,
	// 			workInProgress,
	// 			renderExpirationTime,
	// 		);
	// 	} else {
	// 		// An update was scheduled on this fiber, but there are no new props
	// 		// nor legacy context. Set this to false. If an update queue or context
	// 		// consumer produces a changed value, it will set this to true. Otherwise,
	// 		// the component will assume the children have not changed and bail out.
	// 		didReceiveUpdate = false;
	// 	}
	// } else {
	// 	didReceiveUpdate = false;
	// }

	// Before entering the begin phase, clear pending update priority.
	// TODO: This assumes that we're about to evaluate the component and process
	// the update queue. However, there's an exception: SimpleMemoComponent
	// sometimes bails out later in the begin phase. This indicates that we should
	// move this assignment out of the common path and into each branch.
	// workInProgress.expirationTime = NoWork;

	switch (workInProgress.tag) {
		// case IndeterminateComponent: {
		// 	return mountIndeterminateComponent(
		// 		current,
		// 		workInProgress,
		// 		workInProgress.type,
		// 		renderExpirationTime,
		// 	);
		// }
		// case LazyComponent: {
		// 	const elementType = workInProgress.elementType;
		// 	return mountLazyComponent(
		// 		current,
		// 		workInProgress,
		// 		elementType,
		// 		updateExpirationTime,
		// 		renderExpirationTime,
		// 	);
		// }
		// case FunctionComponent: {
		// 	const Component = workInProgress.type;
		// 	const unresolvedProps = workInProgress.pendingProps;
		// 	const resolvedProps =
		// 		workInProgress.elementType === Component
		// 			? unresolvedProps
		// 			: resolveDefaultProps(Component, unresolvedProps);
		// 	return updateFunctionComponent(
		// 		current,
		// 		workInProgress,
		// 		Component,
		// 		resolvedProps,
		// 		renderExpirationTime,
		// 	);
		// }
		// case ClassComponent: {
		// 	const Component = workInProgress.type;
		// 	const unresolvedProps = workInProgress.pendingProps;
		// 	const resolvedProps =
		// 		workInProgress.elementType === Component
		// 			? unresolvedProps
		// 			: resolveDefaultProps(Component, unresolvedProps);
		// 	return updateClassComponent(
		// 		current,
		// 		workInProgress,
		// 		Component,
		// 		resolvedProps,
		// 		renderExpirationTime,
		// 	);
		// }
		case HostRoot:
			return updateHostRoot(current, workInProgress
				// , renderExpirationTime
			);
		case HostComponent:
			return updateHostComponent(current, workInProgress
				// , renderExpirationTime
			);
		case HostText:
		// return updateHostText(current, workInProgress);
		// case SuspenseComponent:
		// 	return updateSuspenseComponent(
		// 		current,
		// 		workInProgress,
		// 		renderExpirationTime,
		// 	);
		// case HostPortal:
		// 	return updatePortalComponent(
		// 		current,
		// 		workInProgress,
		// 		renderExpirationTime,
		// 	);
		// case ForwardRef: {
		// 	const type = workInProgress.type;
		// 	const unresolvedProps = workInProgress.pendingProps;
		// 	const resolvedProps =
		// 		workInProgress.elementType === type
		// 			? unresolvedProps
		// 			: resolveDefaultProps(type, unresolvedProps);
		// 	return updateForwardRef(
		// 		current,
		// 		workInProgress,
		// 		type,
		// 		resolvedProps,
		// 		renderExpirationTime,
		// 	);
		// }
		// case Fragment:
		// 	return updateFragment(current, workInProgress, renderExpirationTime);
		// case Mode:
		// 	return updateMode(current, workInProgress, renderExpirationTime);
		// case Profiler:
		// 	return updateProfiler(current, workInProgress, renderExpirationTime);
		// case ContextProvider:
		// 	return updateContextProvider(
		// 		current,
		// 		workInProgress,
		// 		renderExpirationTime,
		// 	);
		// case ContextConsumer:
		// 	return updateContextConsumer(
		// 		current,
		// 		workInProgress,
		// 		renderExpirationTime,
		// 	);
		// case MemoComponent: {
		// 	const type = workInProgress.type;
		// 	const unresolvedProps = workInProgress.pendingProps;
		// 	// Resolve outer props first, then resolve inner props.
		// 	let resolvedProps = resolveDefaultProps(type, unresolvedProps);
		// 	if (__DEV__) {
		// 		if (workInProgress.type !== workInProgress.elementType) {
		// 			const outerPropTypes = type.propTypes;
		// 			if (outerPropTypes) {
		// 				checkPropTypes(
		// 					outerPropTypes,
		// 					resolvedProps, // Resolved for outer only
		// 					'prop',
		// 					getComponentName(type),
		// 					getCurrentFiberStackInDev,
		// 				);
		// 			}
		// 		}
		// 	}
		// 	resolvedProps = resolveDefaultProps(type.type, resolvedProps);
		// 	return updateMemoComponent(
		// 		current,
		// 		workInProgress,
		// 		type,
		// 		resolvedProps,
		// 		updateExpirationTime,
		// 		renderExpirationTime,
		// 	);
		// }
		// case SimpleMemoComponent: {
		// 	return updateSimpleMemoComponent(
		// 		current,
		// 		workInProgress,
		// 		workInProgress.type,
		// 		workInProgress.pendingProps,
		// 		updateExpirationTime,
		// 		renderExpirationTime,
		// 	);
		// }
		// case IncompleteClassComponent: {
		// 	const Component = workInProgress.type;
		// 	const unresolvedProps = workInProgress.pendingProps;
		// 	const resolvedProps =
		// 		workInProgress.elementType === Component
		// 			? unresolvedProps
		// 			: resolveDefaultProps(Component, unresolvedProps);
		// 	return mountIncompleteClassComponent(
		// 		current,
		// 		workInProgress,
		// 		Component,
		// 		resolvedProps,
		// 		renderExpirationTime,
		// 	);
		// }
		// case SuspenseListComponent: {
		// 	return updateSuspenseListComponent(
		// 		current,
		// 		workInProgress,
		// 		renderExpirationTime,
		// 	);
		// }
		// case FundamentalComponent: {
		// 	if (enableFundamentalAPI) {
		// 		return updateFundamentalComponent(
		// 			current,
		// 			workInProgress,
		// 			renderExpirationTime,
		// 		);
		// 	}
		// 	break;
		// }
		// case ScopeComponent: {
		// 	if (enableScopeAPI) {
		// 		return updateScopeComponent(
		// 			current,
		// 			workInProgress,
		// 			renderExpirationTime,
		// 		);
		// 	}
		// 	break;
		// }
		// case Block: {
		// 	if (enableBlocksAPI) {
		// 		const block = workInProgress.type;
		// 		const props = workInProgress.pendingProps;
		// 		return updateBlock(
		// 			current,
		// 			workInProgress,
		// 			block,
		// 			props,
		// 			renderExpirationTime,
		// 		);
		// 	}
		// 	break;
		// }
	}
}
