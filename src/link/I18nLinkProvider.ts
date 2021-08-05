import {
  CancellationToken,
  DocumentLink,
  DocumentLinkProvider,
  Position,
  ProviderResult,
  Range,
  TextDocument,
} from 'vscode';
import core from '../core/core';
import AstTool from '../tool/AstTool';

class I18nLinkProvider implements DocumentLinkProvider {
  private _astTool = AstTool.getInstance();

  provideDocumentLinks(
    document: TextDocument,
    _: CancellationToken
  ): ProviderResult<DocumentLink[]> {
    const result: DocumentLink[] = [];
    console.log(1);
    const ast = this._astTool.parse(document.getText());
    if (AstTool.astParseError(ast)) {
      return;
    }

    const paramsLocations = this._astTool.getAllParamsFromAst(
      ast,
      core.getLanguageDictionary()
    );
    const languageFile = core.getLanguageFile();
    paramsLocations.forEach((param) => {
      if (!languageFile.has(param.paramsValue)) {
        return;
      }
      const start = new Position(param.start.line, param.start.column);
      const end = new Position(param.end.line, param.end.column);
      console.log(languageFile.get(param.paramsValue));
      result.push(
        new DocumentLink(
          new Range(start, end),
          languageFile.get(param.paramsValue)
        )
      );
    });
    return result;
  }
}

export default I18nLinkProvider;
