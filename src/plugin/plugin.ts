import { isMap, isString } from 'lodash';
import { FileSystemWatcher } from 'vscode';
import config from '../config/config';
import core from '../core/core';
import VscodeEvent from '../event/VscodeEvent';
import { PluginInstance } from '../types/plugin';
import { getRealPath } from '../tool/Tool';
import { LanguageValue, PluginLanguageValue } from '../types/common';

class Plugin {
  private _pluginFileWatcher?: FileSystemWatcher;
  public pluginInstance?: PluginInstance = undefined;

  public registerPlugin() {
    let path = config.pluginPath;
    if (typeof path !== 'string' || path.length === 0) {
      this.pluginInstance = undefined;
      return;
    }
    path = getRealPath(path);
    try {
      let plugin = require(path);
      if (plugin.default) {
        plugin = plugin.default;
      }
      if (!this.checkPluginIsFunction('fileName', plugin)) {
        return;
      }
      if (!this.checkPluginIsFunction('getAllI18nKeyAndValue', plugin)) {
        return;
      }
      this.pluginInstance = plugin;
    } catch (error) {
      console.error(error);
    }
  }

  public checkPluginIsFunction(
    methodName: keyof PluginInstance,
    plugin: PluginInstance
  ): boolean {
    if (plugin[methodName] && typeof plugin[methodName] !== 'function') {
      return false;
    }
    return true;
  }

  public fileName(fileName: string): string {
    if (this.pluginInstance?.fileName) {
      const result = this.pluginInstance.fileName(fileName);
      if (isString(result)) {
        return result;
      }
      return fileName;
    }
    return fileName;
  }

  public getAllI18nKeyAndValue(): Map<string, PluginLanguageValue> | undefined {
    if (this.pluginInstance?.getAllI18nKeyAndValue) {
      const result = this.pluginInstance.getAllI18nKeyAndValue();
      if (isMap(result)) {
        return result;
      }
      return undefined;
    }
    return undefined;
  }

  public watchPluginFileChange() {
    let path = config.pluginPath;
    path = getRealPath(path);
    if (this._pluginFileWatcher) {
      this._pluginFileWatcher.dispose();
    }
    if (path.length === 0) {
      return;
    }
    this._pluginFileWatcher = VscodeEvent.watchFileChanged(path);
    this._pluginFileWatcher.onDidChange(() => {
      delete require.cache[path];
      this.registerPlugin();
      core.findAllLanguageDictionary();
    });
  }

  public dispose() {
    this._pluginFileWatcher?.dispose();
  }
}

export default new Plugin();
