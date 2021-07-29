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

class Core {
  private _activeEditor?: vscode.TextEditor;
  private _astTool = AstTool.getInstance();
  private _languageDictionary = new Map<string, string>();
  private _textChangeTimer: NodeJS.Timer | undefined;
  private _statusBarItem: VscodeStatusBarItem;
  private _localeLanguageFileWatcher: vscode.FileSystemWatcher | undefined;

  constructor() {
    this._statusBarItem = new VscodeStatusBarItem(
      SupportCommand.refreshLanguage
    );
  }

  public setActiveEditor(editor?: vscode.TextEditor) {
    this._activeEditor = editor;
    this.insertI18nChinese();
  }

  public insertI18nChinese() {
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

    const paramsLocations = this._astTool.getAllParamsFromAst(
      ast,
      this._languageDictionary
    );
    VscodeEvent.insertI18nChinese(this._activeEditor, paramsLocations);
  }

  public async findAllLanguageDictionary() {
    this._statusBarItem.notify('eye', 'Looking for i18n path...', false);
    const pluginFind = plugin.getAllI18nKeyAndValue();
    if (pluginFind !== undefined) {
      this._languageDictionary = pluginFind;
      this._statusBarItem.notify(
        'eye',
        `Looking for i18n path complete and find ${this._languageDictionary.size} keys from plugin`
      );
      return;
    }
    this._languageDictionary = new Map();
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
      this._astTool.getAllI18nKeyAndValue(
        ast,
        prefix,
        this._languageDictionary
      );
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

  public dispose() {
    if (this._localeLanguageFileWatcher) {
      this._localeLanguageFileWatcher.dispose();
    }
  }
}

export default new Core();
