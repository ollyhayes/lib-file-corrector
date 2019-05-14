import * as vscode from 'vscode';
import {basename} from 'path';
import {makeDisableable} from './disabler';

let disposable: vscode.Disposable;

const libFolderFinder = /packages\/([^\/]*)\/lib\/(.*)/;
const disableableRedirect = makeDisableable(redirect);

const stateCommands: [string, () => {}][] = [
	['lib-src-redirect.disableOnce', disableableRedirect.disableOnce],
	['lib-src-redirect.disable', disableableRedirect.disable],
	['lib-src-redirect.enable', disableableRedirect.enable]
];

export function activate(context: vscode.ExtensionContext) {

	disposable = vscode.window.onDidChangeActiveTextEditor(async textEditor => {
		if (textEditor && libFolderFinder.test(textEditor.document.uri.path)) {
			disableableRedirect(textEditor);
		}
	});

	stateCommands.map(([command, func]) => 
		context.subscriptions.push(vscode.commands.registerCommand(command, func)));
}

export function deactivate() {
	if (disposable) {
		disposable.dispose();
	}
}

async function redirect(textEditor: vscode.TextEditor) {
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
}

// todo:
// 		handle the new file not being found (open the old one again?)
// 		the wrong one will still be present in recent editors list and will show up still in searches and stuff, maybe there's a way to remove that?
// 		find a way of putting the cursor in correct place (using find text maybe)
