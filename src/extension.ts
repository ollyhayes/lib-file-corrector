import * as vscode from 'vscode';

let disposable: vscode.Disposable;

export function activate(context: vscode.ExtensionContext) {
	const libFolderFinder = /packages\/([^\/]*)\/lib\/(.*)/;

	disposable = vscode.window.onDidChangeActiveTextEditor(async textEditor => 
	{
		if (textEditor && libFolderFinder.test(textEditor.document.uri.path)) {
			// close the newly opening incorrect 'lib' version of the file
			await vscode.commands.executeCommand("workbench.action.closeActiveEditor");

			// find and open the correct version
			const srcPath = textEditor.document.uri.path.replace(libFolderFinder, "packages/$1/src/$2");
			await vscode.window.showTextDocument(vscode.Uri.file(srcPath));

			// todo:
			// handle the new file not being found (open the old one again?)
			// the wrong one will still be present in recent editors list and will show up still in searches and stuff, maybe there's a way to remove that?
			// find a way of putting the cursor in correct place (using find text maybe)
		}
	});
}

export function deactivate() {
	if (disposable) {
		disposable.dispose();
	}
}