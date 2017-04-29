import * as vscode from 'vscode';
import CompletionProvider from './Providers/Completion/index';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) 
{
	const config = vscode.workspace.getConfiguration('langums');
	if (config['codeCompletion'] === true) {
		context.subscriptions.push(vscode.languages.registerCompletionItemProvider('langums', new CompletionProvider(context), '.', '\"'));
	}
}