# react-i18n-prompt README

This is a extension that allows vscode to prompt a languages tips in tsx,jsx,ts and js file.

## Requirements

This extension only support your project export language package like following:

```js
export default {
  key: object | string;
}
```

if your language package is not export by this type. you should provide a plugin script to tell extension how to get all language key and value.

## Features

After you install this extension in your vscode. vscode will prompt the content of the i18n key. like:
![preview img](/assets/preview.png)

vscode will prompt the i18n path when you input a i18n key. like:
![preview img](/assets/prompt-preview.gif)

## Extension Settings

- `react-i18n-prompt.language-package-path`: the extension will find language content by this path. the default value is `src/locale/zh-cn/**/*.{ts,js,tsx,jsx}`
  - if you set this item ike `src/locale/en/**/*.{ts,js,tsx,jsx}`. you can take english language tips.like:
    ![preview-en](/assets/preview-en.png)
  - so, you can modify this item to support any language you want.
- `react-i18n-prompt.language-package-exclude-path`: the extension will exclude this path when extension find language content. default value is `src/locale/zh-cn/**/index.{ts,js,tsx,jsx}`
- `react-i18n-prompt.language-key-prefix`: the extension will add the prefix path of i18n key. example:
  - if your language file is like following:
    ![locale folder](/assets/folder.png)
    and the content of `common.ts` is like:
    ![locale folder](/assets/locale-content.png)
    the extension will find i18n key is
    - `${language-key-prefix}.submit` => `提交`
    - `${language-key-prefix}.cancel` => `取消`
    - `${language-key-prefix}.reset` => `重复`
  - this item support variable, current support:
    - `${fileName}`: current locale file name.
  - the default value of this item is: `${fileName}`
    - so, the above example will find following key by default:
      - `common.submit` => `提交`
      - `common.cancel` => `取消`
      - `common.reset` => `重复`
- `react-i18n-prompt.i18n-name`: default value is `i18n`
- `react-i18n-prompt.translate-function-name`: default value is `t`
  - the above tow config is the extension will add language tips after `${react-i18n-prompt.i18n-name}.${react-i18n-prompt.translate-function-name}` and `${react-i18n-prompt.translate-function-name}` function params. so the extension will add language tips like following by default:
  - `i18n.t(params {add tips in here})`
  - `t(params {add tips in here})`
- `react-i18n-prompt.plugin-path`: the plugin script path.
  - if this item is start with '/', the extension will load plugin script by absolute path.
  - if this item is start with other, the extension will load plugin script by relative path which base from current workspace.

## Plugin

the plugin must be a javascript file. and now plugin support following method.

```js
module.exports = {
  fileName: (fileName: string) => string;
  getAllI18nKeyAndValue: () => Map<string, string>;
};
```

- `fileName`
  - if you have some prefix of i18n key is not equal fileName: For example:
    - the locale language file name is `a.ts`, and the file content is:
    ```ts
    export default {
      test: '测试',
    };
    ```
    - but in the i18n register language package is:
    ```js
    import a from './zh-cn/a.ts';
    export default {
      translation: {
        b: a,
      },
    };
    ```
    - then i18n will generator `b.test => 测试` key. but extension will find `a.test => 测试` by default. so, you can provide a plugin like following to fix this question:
    ```js
    module.exports = {
      fileName(fileName) {
        if (fileName === 'a') {
          return 'b';
        }
        return fileName;
      },
    };
    ```
    - after this change. the extension will find `b.test => 测试` too.
- `getAllI18nKeyAndValue`
  - if your project export locale language package is not by following type:
  ```js
  export default {
    key: object | string;
  }
  ```
  the extension will can't find any key or value of i18n. but you can provide this method to tell extension how to find the key.
  - tips:
    - this item must be a function.
    - the function which this item provide must return a Map<string, string>.the key of Map is the i18n key. the value of Map is the tips when the key appear
  - if you provide this method, extension will show following tips when extension load plugin successfully.
    ![preview-en](/assets/plugin-tips.png)

## Release Notes

TODO:

- [v] vscode can prompt the language detail value of i18n key.
- [v] prompt all related i18n key when user input i18n key.
- [v] prompt all related i18n key when user input language value if language value exist in locale language package.
- [] vscode will throw a error when user input a i18n key which not exist locale language package.
- [] i18n key can click and jump to locale language file.

### 0.0.1

- [feature]: vscode can prompt the language detail value of i18n key.
