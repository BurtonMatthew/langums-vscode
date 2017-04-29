import * as vscode from 'vscode';
import { spawn } from 'child_process';


class CompletionProvider implements vscode.CompletionItemProvider 
{
    private fs = require('fs');
    public completionItems:vscode.CompletionItem[] = [];

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
            for(var i in obj.unit)
            {
                this.completionItems.push(new vscode.CompletionItem(obj.unit[i]));
            }
        }
    }

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken)
    {
        return this.completionItems;
    }
}

export default CompletionProvider;