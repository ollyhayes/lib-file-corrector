import * as vscode from 'vscode';
import {basename} from 'path';

let disposable: vscode.Disposable;

const state = {
	disabled: 0,
	enabled: 1,
	disabledOnce: 2
};

export function activate(context: vscode.ExtensionContext) {
	let currentState = state.enabled;
	const libFolderFinder = /packages\/([^\/]*)\/lib\/(.*)/;

	disposable = vscode.window.onDidChangeActiveTextEditor(async textEditor => {
		if (textEditor && libFolderFinder.test(textEditor.document.uri.path)) {

			switch (currentState) {
				case state.disabled:
					vscode.window.setStatusBarMessage('Ignoring lib/src redirection - disabled', 3000);
					return;
				case state.enabled:
					break;
				case state.disabledOnce:
					vscode.window.setStatusBarMessage('Ignoring lib/src redirection once', 3000);
					currentState = state.enabled;
					return;
			}

			// close the newly opening incorrect 'lib' version of the file
			await vscode.commands.executeCommand("workbench.action.closeActiveEditor");

			// find and open the correct version
			const srcPath = textEditor.document.uri.path.replace(libFolderFinder, "packages/$1/src/$2");

			try {
				vscode.window.setStatusBarMessage(`Redirecting to src/${basename(srcPath)}`, 3000);
				await vscode.window.showTextDocument(vscode.Uri.file(srcPath));
			} catch (error) {
				vscode.window.showErrorMessage(`Error opening ${srcPath}: ${error}`);
			}

			// todo:
			// 		handle the new file not being found (open the old one again?)
			// 		the wrong one will still be present in recent editors list and will show up still in searches and stuff, maybe there's a way to remove that?
			// 		find a way of putting the cursor in correct place (using find text maybe)
		}
	});

	const stateCommands: [string, number][] = [
		['lib-file-corrector.disableOnce', state.disabledOnce],
		['lib-file-corrector.disable', state.disabled],
		['lib-file-corrector.enable', state.enabled]
	];

	stateCommands.map(([command, state]) => 
		context.subscriptions.push(vscode.commands.registerCommand(command, () => currentState = state)));
}

export function deactivate() {
	if (disposable) {
		disposable.dispose();
	}
}