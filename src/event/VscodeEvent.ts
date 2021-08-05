import * as vscode from 'vscode';
import core from '../core/core';
import { ParamsLocation } from '../types/common';

class VscodeEvent {
  private _tempDecorationType = vscode.window.createTextEditorDecorationType(
    {}
  );

  public registerEditorChange() {
    return vscode.window.onDidChangeActiveTextEditor((editor) => {
      core.setActiveEditor(editor);
    });
  }

  public createChineseTips(desc: string) {
    return {
      contentText: `> ${desc}`,
      color: '#807f7e',
      textDecoration: `;
        font-size: 12px;
        margin-left: 5px;
        margin-right: 5px;
      `,
    };
  }

  public createErrorTips(desc: string) {
    return {
      contentText: `> ${desc}`,
      color: '#ff0000',
      textDecoration: `;
        font-size: 12px;
        margin-left: 5px;
        margin-right: 5px;
      `,
    };
  }

  public insertI18nChinese(
    activeEditor: vscode.TextEditor,
    params: ParamsLocation[]
  ) {
    const languageFunctions: vscode.DecorationOptions[] = [];

    params.forEach((param) => {
      const start = new vscode.Position(param.start.line, param.start.column);
      const end = new vscode.Position(param.end.line, param.end.column);

      languageFunctions.push({
        range: new vscode.Range(start, end),
        renderOptions: {
          after: param.notFind
            ? this.createErrorTips(param.desc)
            : this.createChineseTips(param.desc),
        },
      });
    });

    activeEditor.setDecorations(this._tempDecorationType, languageFunctions);
  }

  public getFiles(path: string, excludePath?: string): Thenable<vscode.Uri[]> {
    return vscode.workspace.findFiles(path, excludePath);
  }

  public getConfig<T = any>(path: string, defaultValue: T): T;
  public getConfig<T = any>(path: string): T | undefined;
  public getConfig<T = any>(path: string, defaultValue?: T): T | undefined {
    return vscode.workspace.getConfiguration().get<T>(path) ?? defaultValue;
  }

  public createVscodeBarItem(
    ...params: Parameters<typeof vscode.window.createStatusBarItem>
  ) {
    return vscode.window.createStatusBarItem(...params);
  }

  public subscribeConfigChange(
    cb: (e: vscode.ConfigurationChangeEvent) => any
  ) {
    return vscode.workspace.onDidChangeConfiguration(cb);
  }

  public subscribeTextChange(cb: (e: vscode.TextDocumentChangeEvent) => any) {
    return vscode.workspace.onDidChangeTextDocument(cb);
  }

  public subscribeFileOnSave(cb: (e: vscode.TextDocument) => any) {
    return vscode.workspace.onDidSaveTextDocument(cb);
  }

  public registerCommand(command: string, cb: (...args: any[]) => any) {
    return vscode.commands.registerCommand(command, cb);
  }

  public getWorkspacePath() {
    const temp = vscode.workspace.workspaceFolders;
    if (!temp || temp.length === 0) {
      return;
    }
    return temp[0].uri.path;
  }

  public watchFileChanged(path: string) {
    return vscode.workspace.createFileSystemWatcher(path);
  }

  public registerLanguageCompletion(
    selector: vscode.DocumentSelector,
    provider: vscode.CompletionItemProvider<vscode.CompletionItem>,
    ...triggerCharacters: string[]
  ) {
    return vscode.languages.registerCompletionItemProvider(
      selector,
      provider,
      ...triggerCharacters
    );
  }
}

export default new VscodeEvent();
