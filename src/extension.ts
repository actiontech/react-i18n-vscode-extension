// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import config from './config/config';
import core from './core/core';
import VscodeEvent from './event/VscodeEvent';
import plugin from './plugin/plugin';
import I18nLinkProvider from './link/I18nLinkProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // const hintDecorationType = vscode.window.createTextEditorDecorationType({});

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  // let disposable = vscode.commands.registerCommand('i18n-actionsky.helloWorld', () => {
  // 	// The code you place here will be executed every time your command is executed
  // 	// Display a message box to the user
  // 	vscode.window.showInformationMessage('Hello World from i18n-actionsky!');

  // });

  const activeEditor = vscode.window.activeTextEditor;
  plugin.registerPlugin();
  plugin.watchPluginFileChange();
  core.watchLanguagePackageChanged();
  await core.findAllLanguageDictionary();
  if (activeEditor) {
    core.setActiveEditor(activeEditor);
  }
  context.subscriptions.push(VscodeEvent.registerEditorChange());
  context.subscriptions.push(config.registerConfigChange());
  context.subscriptions.push(core.registerTextChange());
  context.subscriptions.push(core.registerOnSave());
  context.subscriptions.push(core.registerRefreshCommand());
  context.subscriptions.push(...core.registerLanguageCompletion());

  const provider = new I18nLinkProvider();
  config.supportFileType.forEach((fileType) => {
    VscodeEvent.registerDocumentLinkProvider(fileType, provider);
  });
  // context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
  core.dispose();
  plugin.dispose();
}
