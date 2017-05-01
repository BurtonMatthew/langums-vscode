import * as vscode from 'vscode';
import { spawn } from 'child_process';
import Chk from 'bw-chk' 


class CompletionProvider implements vscode.CompletionItemProvider 
{
    private fs = require('fs');
    private createExtractor = require('scm-extractor');
    private concat = require('concat-stream');
    private completionItems:vscode.CompletionItem[] = [];
    private locations:vscode.CompletionItem[] = [];
    private config = vscode.workspace.getConfiguration('langums');

    constructor(context:vscode.ExtensionContext) 
    {
        this.parseCompletionTokens = this.parseCompletionTokens.bind(this);
        this.parseLocationTokens = this.parseLocationTokens.bind(this);

        this.fs.readFile(context.extensionPath + '/src/Providers/Completion/completion.json', this.parseCompletionTokens);
        
        if(this.fs.existsSync(this.config['mapPath']))
        {
            this.fs.createReadStream(this.config['mapPath'])
                .pipe(this.createExtractor())
                .pipe(this.concat(this.parseLocationTokens));
        }
    }

    private parseLocationTokens(data)
    {
        var map = new Chk(data);
        for(var i in map.locations)
        {
            var newItem:vscode.CompletionItem = new vscode.CompletionItem(map.locations[i].name);
            newItem.detail = "Location"
            newItem.kind = vscode.CompletionItemKind.Constant;
            this.locations.push(newItem);
        }
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

    private prevChar(document: vscode.TextDocument, position: vscode.Position): String
    {
        if(position.character == 0)
            return "\n";
        else
            return document.lineAt(position.line).text[position.character-1];
    }

    private isOpeningQuote(document: vscode.TextDocument, position: vscode.Position):boolean
    {
        var line:String = document.lineAt(position.line).text;
        var occurances:number = 0;
        for(var i=0; i<position.character; ++i)
        {
            if(line[i] == "\"")
                ++occurances;
        }

        return occurances % 2 == 1;
    }

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken)
    {
        if(this.prevChar(document,position) != '\"')
            return this.completionItems;
        else if(this.isOpeningQuote(document,position))
            return this.locations;
        else
            return [];
    }
}

export default CompletionProvider;