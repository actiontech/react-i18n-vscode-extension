export type PluginInstance = {
  fileName: (fileName: string) => string;
  getAllI18nKeyAndValue: () => Map<string, string>;
};
