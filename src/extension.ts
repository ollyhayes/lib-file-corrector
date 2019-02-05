import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.window.onDidChangeActiveTextEditor(async textEditor => 
	{
		if (textEditor) {
			const editors = vscode.window.visibleTextEditors.map(editor => editor.document.fileName);
			console.log(`Document opened: ${textEditor.document.fileName}, Editors: ${editors}`);

	 		const libFolderFinder = /packages\/([^\/]*)\/lib\/(.*)/;

			if (libFolderFinder.test(textEditor.document.uri.path)) {
				const srcPath = textEditor.document.uri.path.replace(libFolderFinder, "packages/$1/src/$2");

				await vscode.commands.executeCommand("workbench.action.closeActiveEditor");

				// next open the correct one
				vscode.window.showTextDocument(vscode.Uri.file(srcPath));

				// the wrong one will still be present in recent editors though and will show up still in searches and stuff, maybe there's a way to remove that?
			}

		}
	});

}

export function deactivate() {}