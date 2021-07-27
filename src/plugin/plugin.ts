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
      if (!this.checkPluginInstance(plugin)) {
        return;
      }
      this.pluginInstance = plugin;
    } catch (error) {
      console.error(error);
    }
  }

  public checkPluginInstance(plugin: PluginInstance): boolean {
    if (plugin.fileName && typeof plugin.fileName !== 'function') {
      return false;
    }
    return true;
  }

  public fileName(fileName: string): string {
    if (this.pluginInstance?.fileName) {
      return this.pluginInstance.fileName(fileName);
    }
    return fileName;
  }
}

export default new Plugin();
