import { REACT_ELEMENT_TYPE } from './reactSymbols'

const hasOwnProperty = Object.prototype.hasOwnProperty;

const RESERVED_PROPS = {
	key: true,
	ref: true,
	__self: true,
	__source: true,
};

/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, instanceof check
 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
 00.000 if something is a React Element.
 *
 * @param {*} type
 * @param {*} props
 */
const ReactElement = function(type, props) {
	const element = {
		// This tag allows us to uniquely identify this as a React Element
		$$typeof: REACT_ELEMENT_TYPE,
		// Built-in properties that belong on the element
		type: type,
		props: props,
	};


	return element;
};



/**
 * Create and return a new ReactElement of the given type.
 * See https://reactjs.org/docs/react-api.html#createelement
 */
export function createElement(type, config, children) {
	let propName;

	// Reserved names are extracted
	const props = {};

	if (config != null) {
		// if (hasValidRef(config)) {
		// 	ref = config.ref;
		// }
		// if (hasValidKey(config)) {
		// 	key = '' + config.key;
		// }

		for (propName in config) {
			if (
				hasOwnProperty.call(config, propName) &&
				!RESERVED_PROPS.hasOwnProperty(propName)
			) {
				props[propName] = config[propName];
			}
		}
	}

	// Children can be more than one argument, and those are transferred onto
	// the newly allocated props object.
	const childrenLength = arguments.length - 2;
	if (childrenLength === 1) {
		props.children = children;
	} else if (childrenLength > 1) {
		const childArray = Array(childrenLength);
		for (let i = 0; i < childrenLength; i++) {
			childArray[i] = arguments[i + 2];
		}
		props.children = childArray;
	}

	// Resolve default props
	if (type && type.defaultProps) {
		const defaultProps = type.defaultProps;
		for (propName in defaultProps) {
			if (props[propName] === undefined) {
				props[propName] = defaultProps[propName];
			}
		}
	}


	return ReactElement(
		type,
		props,
	);
}

export default {
	createElement
}
