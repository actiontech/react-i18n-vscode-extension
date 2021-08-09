# Change Log

All notable changes to the react-i18n-prompt extension will be documented in this file.

### [0.0.3]

- [bugfix]: the link of i18n key is not working in windows operator system.

### [0.0.2]

- [feature]: you can click i18n key and jump to language package file.
- [feature]: add config item to switch prompt of input i18n key.
- [feature]: extension will show error message when extension not find appear i18n key.
  - this feature is disable by default. because extension not find i18n key is not represent this key is not exist in package, maybe extension has some bug. or plugin script has some bug. so if you really want to use this feature. you should modify `react-i18n-prompt.show-not-exist-tips` to `true`.

#### Breaking change

- the `getAllI18nKeyAndValue` method of plugin if must return a Map<string, string> in version 0.0.1. but now this function must return a Map<string, object>, and the object type is `{ value: string; line?: number; languageFilePath?: string; }`. this change is for support add link for i18n key. if you function is not return field `line` or `languageFilePath`. the appear i18n key will can't click...

## [0.0.1]

- vscode can prompt the language detail value of i18n key.
- prompt all related i18n key when user input i18n key.
- prompt all related i18n key when user input language value if language value exist in locale language package.
