# react-i18n-prompt README

This is a extension that allows vscode to prompt a languages tips in tsx,jsx,ts and js file.

## Features

After you install this extension in your vscode. vscode will prompt the content of the i18n key.like:
![preview img](/assets/preview.png)

## Extension Settings

- `react-i18n-prompt.language-package-path`: the extension will find language content by this path. the default value is `src/locale/zh-cn/**/*.{ts,js,tsx,jsx}`
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

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

**Note:** You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
- Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
- Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
