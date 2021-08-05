import * as vscode from 'vscode';
import config from '../config/config';
import VscodeEvent from '../event/VscodeEvent';
import AstTool from '../tool/AstTool';
import * as fs from 'fs';
import * as path from 'path';
import plugin from '../plugin/plugin';
import { setTimeout } from 'timers';
import VscodeStatusBarItem from '../tool/VscodeStatusBarItem';
import { SupportCommand } from '../config/enum';
import { getRealPath } from '../tool/Tool';
import { TextDocument } from 'vscode';

class Core {
  private _activeEditor?: vscode.TextEditor;
  private _astTool = AstTool.getInstance();
  private _languageDictionary = new Map<string, string>();
  private _languageFile = new Map<string, vscode.Uri>();
  private _textChangeTimer: NodeJS.Timer | undefined;
  private _statusBarItem: VscodeStatusBarItem;
  private _localeLanguageFileWatcher: vscode.FileSystemWatcher | undefined;

  constructor() {
    this._statusBarItem = new VscodeStatusBarItem(
      SupportCommand.refreshLanguage
    );
  }

  public getLanguageDictionary() {
    return this._languageDictionary;
  }

  public getLanguageFile() {
    return this._languageFile;
  }

  public setActiveEditor(editor?: vscode.TextEditor) {
    this._activeEditor = editor;
    this.insertI18nChinese(true);
  }

  public insertI18nChinese(showErrorMessage: boolean = false) {
    if (!this._activeEditor) {
      return;
    }
    const currentFileType = this._activeEditor.document.languageId;
    if (!config.supportFileType.includes(currentFileType)) {
      return;
    }
    const ast = this._astTool.parse(this._activeEditor.document.getText());
    if (AstTool.astParseError(ast)) {
      return;
    }
    let showError = showErrorMessage;
    if (!config.unExistTipsVisible) {
      showError = false;
    }
    const paramsLocations = this._astTool.getAllParamsFromAst(
      ast,
      this._languageDictionary,
      showError
    );
    VscodeEvent.insertI18nChinese(this._activeEditor, paramsLocations);
  }

  public async findAllLanguageDictionary() {
    this._statusBarItem.notify('eye', 'Looking for i18n path...', false);
    const pluginFind = plugin.getAllI18nKeyAndValue();
    if (pluginFind !== undefined) {
      this._languageDictionary = new Map<string, string>();
      this._languageFile = new Map<string, vscode.Uri>();
      for (const [key, value] of pluginFind.entries()) {
        if (!!value.value) {
          this._languageDictionary.set(key, value.value);
        }
        if (!!value.line && !!value.languageFilePath) {
          this._languageFile.set(
            key,
            vscode.Uri.parse(`${value.languageFilePath}#${value.line}`)
          );
        }
      }
      this._statusBarItem.notify(
        'eye',
        `Looking for i18n path complete and find ${this._languageDictionary.size} keys from plugin`
      );
      return;
    }
    this._languageDictionary = new Map();
    this._languageFile = new Map();
    const uris = await VscodeEvent.getFiles(
      config.localePath,
      config.localeExcludePath
    );
    for (const uri of uris) {
      const fileContent = await fs.promises.readFile(uri.fsPath);
      const ast = this._astTool.parse(fileContent.toString());
      if (AstTool.astParseError(ast)) {
        continue;
      }
      let fileName = path.parse(uri.fsPath).name;
      fileName = plugin.fileName(fileName);
      let prefix = config.i18nKeyPrefix;
      prefix = prefix.replace('${fileName}', fileName);
      const currentMap = this._astTool.getAllI18nKeyAndValue(ast, prefix);
      for (const [key, value] of currentMap.entries()) {
        this._languageDictionary.set(key, value.value);
        const fsPath = uri.fsPath;
        const newUri = vscode.Uri.parse(`${fsPath}#${value.line}`);
        this._languageFile.set(key, newUri);
      }
    }
    this._statusBarItem.notify(
      'eye',
      `Looking for i18n path complete and find ${this._languageDictionary.size} keys`
    );
  }

  public registerTextChange() {
    return VscodeEvent.subscribeTextChange((e) => {
      if (this._activeEditor && e.document === this._activeEditor.document) {
        if (this._textChangeTimer) {
          clearTimeout(this._textChangeTimer);
          this._textChangeTimer = undefined;
        }
        this._textChangeTimer = setTimeout(() => {
          this.insertI18nChinese();
        }, 100);
      }
    });
  }

  public registerOnSave() {
    return VscodeEvent.subscribeFileOnSave(() => {
      if (this._activeEditor) {
        setTimeout(() => {
          this.insertI18nChinese(true);
        }, 500);
      }
    });
  }

  public registerRefreshCommand() {
    const _this = this;
    return VscodeEvent.registerCommand(SupportCommand.refreshLanguage, () => {
      _this.findAllLanguageDictionary();
    });
  }

  public watchLanguagePackageChanged() {
    if (this._localeLanguageFileWatcher) {
      this._localeLanguageFileWatcher.dispose();
    }
    const watcher = VscodeEvent.watchFileChanged(
      getRealPath(config.localePath)
    );
    watcher.onDidChange(() => {
      this.findAllLanguageDictionary();
    });
    watcher.onDidDelete(() => {
      this.findAllLanguageDictionary();
    });
    this._localeLanguageFileWatcher = watcher;
  }

  public registerLanguageCompletion(): vscode.Disposable[] {
    const disposable: vscode.Disposable[] = [];
    const _this = this;
    for (let i = 0; i < config.supportFileType.length; i++) {
      disposable.push(
        VscodeEvent.registerLanguageCompletion(
          {
            scheme: 'file',
            language: config.supportFileType[i],
          },
          {
            provideCompletionItems(
              document: TextDocument,
              position: vscode.Position
            ): Thenable<vscode.CompletionItem[]> {
              if (!config.languageTipsVisible) {
                return Promise.resolve([]);
              }
              const start = new vscode.Position(position.line, 0);
              const end = new vscode.Position(position.line, 99999);
              const range: vscode.Range = new vscode.Range(start, end);
              const text: string = document.getText(range).trim();
              const rawText: RegExpMatchArray | null = text.match(
                /(?<![\w]+)t\(\'(.*)\'\)/
              );
              if (!rawText) {
                return Promise.resolve([]);
              }
              const items = [];
              for (const [key, value] of _this._languageDictionary.entries()) {
                const item = new vscode.CompletionItem(
                  `${key} - ${value}`,
                  vscode.CompletionItemKind.Field
                );
                item.filterText = `${key} - ${value}`;
                item.insertText = key;
                item.detail = value;
                items.push(item);
              }
              return Promise.resolve(items);
            },
          },
          "'"
        )
      );
    }
    return disposable;
  }

  public dispose() {
    if (this._localeLanguageFileWatcher) {
      this._localeLanguageFileWatcher.dispose();
    }
  }
}

export default new Core();
