import { isMap, isString } from 'lodash';
import config from '../config/config';
import VscodeEvent from '../event/VscodeEvent';
import { PluginInstance } from '../types/plugin';

class Plugin {
  public pluginInstance?: PluginInstance = undefined;

  public registerPlugin() {
    let path = config.pluginPath;
    if (typeof path !== 'string' || path.length === 0) {
      return;
    }
    const workspaceUrl = VscodeEvent.getWorkspacePath();
    if (!path.startsWith('/')) {
      path = `${workspaceUrl}/${path}`;
    }
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

  public getAllI18nKeyAndValue(): Map<string, string> | undefined {
    if (this.pluginInstance?.getAllI18nKeyAndValue) {
      const result = this.pluginInstance.getAllI18nKeyAndValue();
      if (isMap(result)) {
        return result;
      }
      return undefined;
    }
    return undefined;
  }
}

export default new Plugin();
