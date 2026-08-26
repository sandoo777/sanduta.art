import './src/__tests__/setup';if (typeof globalThis.TransformStream === 'undefined') {
	globalThis.TransformStream = class {
		constructor() {}
	} as typeof TransformStream;
}

import 'whatwg-fetch';
