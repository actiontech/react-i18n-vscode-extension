import { PluginLanguageValue } from './common';

export type PluginInstance = {
  fileName: (fileName: string) => string;
  getAllI18nKeyAndValue: () => Map<string, PluginLanguageValue>;
};
