// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// const disposable = vscode.workspace.onDidOpenTextDocument(textDocument => 
	// better to use window rather than workspace because for workspace it's too early to close the newly opening file
	const disposable = vscode.window.onDidChangeActiveTextEditor(async textEditor => 
	{
		if (textEditor) {
			const editors = vscode.window.visibleTextEditors.map(editor => editor.document.fileName);
			console.log(`Document opened: ${textEditor.document.fileName}, Editors: ${editors}`);

			if (textEditor.document.fileName === "c:\\Users\\ohayes\\tools\\lerna-test\\packages\\library\\src\\library.js") {
				await vscode.commands.executeCommand("workbench.action.closeActiveEditor");

				// next open the correct one
				vscode.window.showTextDocument()

				// the wrong one will still be present in recent editors though and will show up still in searches and stuff, maybe there's a way to remove that?
			}

		}
	});

	console.log('Congratulations, your extension "package-definitions" is now active!');
	 let providerActive = false;

	const provider = vscode.languages.registerDefinitionProvider('javascript', {
		async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {

			if (providerActive) {
				return null;
			}
			
			providerActive = true;
			console.log("definition provider invoked!");

			const definitionLocations = await vscode.commands.executeCommand<vscode.Location[]>('vscode.executeDefinitionProvider', document.uri, position);

			if (!definitionLocations || definitionLocations.length === 0) {
				return null;
			}

			const location = definitionLocations[0];
			const locationPath = location.uri.path;

			const libFolderFinder = /packages\/([^\/]*)\/lib\/(.*)/;

			if (libFolderFinder.test(locationPath)) {
				const scrPath = locationPath.replace(libFolderFinder, "packages/$1/src/$2");

				const newUri = vscode.Uri.file(scrPath);
				
				providerActive = false;

				return [
					{
						range: location.range,
						uri: newUri
					}
				];
			}

			providerActive = false;
			return definitionLocations;
		}
	})

	context.subscriptions.push(provider);

	//vscode.window.showInformationMessage('Hello World!');

}

// this method is called when your extension is deactivated
export function deactivate() {}
