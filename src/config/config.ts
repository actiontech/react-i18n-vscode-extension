import core from '../core/core';
import VscodeEvent from '../event/VscodeEvent';
import plugin from '../plugin/plugin';
import { SupportConfigKey } from './enum';

class Config {
  public supportFileType = [
    'typescriptreact',
    'javascript',
    'typescript',
    'javascriptreact',
  ];
  public localePath = VscodeEvent.getConfig<string>(
    SupportConfigKey.languagePackagePath,
    ''
  );
  public localeExcludePath = VscodeEvent.getConfig<string>(
    SupportConfigKey.languagePackageExcludePath,
    ''
  );
  public i18nKeyPrefix = VscodeEvent.getConfig<string>(
    SupportConfigKey.languageKeyPrefix,
    ''
  );
  public i18nObjectName = VscodeEvent.getConfig<string>(
    SupportConfigKey.i18nObjectName,
    ''
  );
  public translateFunctionName = VscodeEvent.getConfig<string>(
    SupportConfigKey.translateFunctionName,
    ''
  );
  public pluginPath = VscodeEvent.getConfig<string>(
    SupportConfigKey.pluginPath,
    ''
  );

  public registerConfigChange() {
    return VscodeEvent.subscribeConfigChange((e) => {
      if (
        e.affectsConfiguration(SupportConfigKey.languagePackagePath) ||
        e.affectsConfiguration(SupportConfigKey.languagePackageExcludePath)
      ) {
        this.localePath = VscodeEvent.getConfig<string>(
          SupportConfigKey.languagePackagePath,
          ''
        );
        this.localeExcludePath = VscodeEvent.getConfig<string>(
          SupportConfigKey.languagePackageExcludePath,
          ''
        );
        core.findAllLanguageDictionary();
        core.insertI18nChinese();
      }

      if (e.affectsConfiguration(SupportConfigKey.languageKeyPrefix)) {
        this.i18nKeyPrefix = VscodeEvent.getConfig<string>(
          SupportConfigKey.languageKeyPrefix,
          ''
        );
        core.findAllLanguageDictionary();
        core.insertI18nChinese();
      }

      if (e.affectsConfiguration(SupportConfigKey.i18nObjectName)) {
        this.i18nObjectName = VscodeEvent.getConfig<string>(
          SupportConfigKey.i18nObjectName,
          ''
        );
        core.insertI18nChinese();
      }

      if (e.affectsConfiguration(SupportConfigKey.translateFunctionName)) {
        this.translateFunctionName = VscodeEvent.getConfig<string>(
          SupportConfigKey.translateFunctionName,
          ''
        );
        core.insertI18nChinese();
      }

      if (e.affectsConfiguration(SupportConfigKey.pluginPath)) {
        this.translateFunctionName = VscodeEvent.getConfig<string>(
          SupportConfigKey.pluginPath,
          ''
        );
        plugin.registerPlugin();
      }
    });
  }
}

export default new Config();
