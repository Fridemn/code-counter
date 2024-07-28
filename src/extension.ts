import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let CodeVolume: { [language: string]: number } = {};
const dataFilePath = path.join(__dirname, 'codeVolume.json');


function initializeDataFile() {
    if (!fs.existsSync(dataFilePath)) {
        const initialData = {};
        fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
    } else {
        const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
        CodeVolume = data.CodeVolume || {};
    }
}


function updateDataFile() {
    const data = { CodeVolume };
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}


export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "code-counter" is now active!');

    initializeDataFile();

    const showCodeCounterCommand = vscode.commands.registerCommand('Code-counter.shCnt', () => {
        const counts = Object.entries(CodeVolume)
            .map(([language, count]) => `${language}: ${count}`)
            .join(', ');
        vscode.window.showInformationMessage(`已记录代码量: ${counts}行`);
    });
    context.subscriptions.push(showCodeCounterCommand);

    
    vscode.workspace.onDidChangeTextDocument(event => {
        const language = event.document.languageId;
        if (!CodeVolume[language]) {
            CodeVolume[language] = 0;
        }

        for (const change of event.contentChanges) {
            const text = change.text;
            for (const char of text) {
                if (char === '\n') {
                    CodeVolume[language]++;
                }
            }
        }
        updateDataFile();
    });
}

export function deactivate() {}