import * as vscode from 'vscode';

enum State {
	Disabled,
	Enabled,
	DisabledOnce
};

export function makeDisableable<T, R>(innerFunction: (...args: T[]) => R) {
	let currentState = State.Enabled;

	const ret = (...args: T[]) => {
		switch (currentState) {
			case State.Disabled:
				vscode.window.setStatusBarMessage('Ignoring lib/src redirection - disabled', 3000);
				return;

			case State.Enabled:
				return innerFunction(...args);

			case State.DisabledOnce:
				vscode.window.setStatusBarMessage('Ignoring lib/src redirection once', 3000);
				currentState = State.Enabled;
				return;
		}

	};

	ret.enable = () => currentState = State.Enabled;
	ret.disable = () => currentState = State.Disabled;
	ret.disableOnce = () => currentState = State.DisabledOnce;

	return ret;
}
