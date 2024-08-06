const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let CodeVolume = {};
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

function activate(context) {
    console.log('Congratulations, your extension "code-counter" is now active!');

    initializeDataFile();

    const showCodeCounterCommand = vscode.commands.registerCommand('code-counter.showCounter', () => {
        const counts = Object.entries(CodeVolume)
            .map(([language, count]) => `${language}: ${count}`)
            .join(', ');
        vscode.window.showInformationMessage(`已记录代码量: ${counts}行`);
    });
    context.subscriptions.push(showCodeCounterCommand);

    vscode.workspace.onDidChangeTextDocument(event => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || event.document !== activeEditor.document) {
            return; // 如果事件的文档不是活动编辑器的文档，则不统计
        }
    
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

function deactivate() {}

module.exports = {
    activate,
    deactivate
};