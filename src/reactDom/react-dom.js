import { LegacyRoot } from './reactRootTags'
import { createFiberRoot } from './ReactFiberRoot'
import { updateContainer } from  '../reconciler/ReactFiberReconciler'

function ReactDOMBlockingRoot(container, tag) {
	this._internalRoot = createFiberRoot(container, tag);
}

export function createLegacyRoot(container){
	return new ReactDOMBlockingRoot(container, LegacyRoot);
}

function legacyCreateRootFromDOMContainer(container) {
	// First clear any existing content.
	let rootSibling;
	while ((rootSibling = container.lastChild)) {
		container.removeChild(rootSibling);
	}

	return createLegacyRoot(container);
}

function legacyRenderSubtreeIntoContainer(children, container) {
	// TODO: Without `any` type, Flow says "Property cannot be accessed on any
	// member of intersection type." Whyyyyyy.
	let root = container._reactRootContainer;
	let fiberRoot;
	if (!root) {
		// Initial mount
		root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container);
		fiberRoot = root._internalRoot;

		console.log(fiberRoot);
		// Initial mount should not be batched.
		// unbatchedUpdates(() => {
			updateContainer(children, fiberRoot);
		// });
	} else {
		// fiberRoot = root._internalRoot;
		// // Update
		// updateContainer(children, fiberRoot, parentComponent, callback);
	}
	// return getPublicRootInstance(fiberRoot);
}

export function render(element, container) {
	return legacyRenderSubtreeIntoContainer(
		element,
		container,
	);
}

export default {
	render
}
