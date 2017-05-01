import * as vscode from 'vscode';
import { spawn } from 'child_process';


class CompletionProvider implements vscode.CompletionItemProvider 
{
    private fs = require('fs');
    private completionItems:vscode.CompletionItem[] = [];
    private config = vscode.workspace.getConfiguration('langums');

    constructor(context:vscode.ExtensionContext) 
    {
        this.parseCompletionTokens = this.parseCompletionTokens.bind(this);
        this.fs.readFile(context.extensionPath + '/src/Providers/Completion/completion.json', this.parseCompletionTokens);
    }

    private parseCompletionTokens(err,data)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            var obj = JSON.parse(data);
            for(var i in obj.completionCategories)
            {
                for(var j in obj.completionCategories[i].tokens)
                {
                    var newItem:vscode.CompletionItem = new vscode.CompletionItem(obj.completionCategories[i].tokens[j].token);
                    switch(obj.completionCategories[i].kind)
                    {
                        case 'Constant':
                            newItem.kind = vscode.CompletionItemKind.Constant;
                            break;
                        case 'Function':
                            newItem.kind = vscode.CompletionItemKind.Function;
                            break;
                        case 'Condition':
                            newItem.kind = vscode.CompletionItemKind.Method;
                            break;
                    }
                    newItem.detail = obj.completionCategories[i].type;
                    newItem.documentation = obj.completionCategories[i].tokens[j].documentation;
                    if (this.config['codeCompletion'] === true) {
                        newItem.insertText = obj.completionCategories[i].tokens[j].snippet;
                    }
                    this.completionItems.push(newItem);
                }
            }
        }
    }

    public prevChar(document: vscode.TextDocument, position: vscode.Position): String
    {
        if(position.character == 0)
            return "\n";
        else
            return document.lineAt(position.line).text[position.character-1];
    }

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken)
    {
        if(this.prevChar(document,position) != '\"')
            return this.completionItems;
        else
            return [];
    }
}

export default CompletionProvider;