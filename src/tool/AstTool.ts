import { parse } from '@babel/parser';
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { LanguageValue, ParamsLocation } from '../types/common';
import config from '../config/config';

class AstTool {
  private static _instance: AstTool;
  private constructor() {}
  public static parseError = 'PARSE_ERROR';

  public static getInstance() {
    if (!this._instance) {
      this._instance = new AstTool();
    }
    return this._instance;
  }

  public static astParseError(ast: string | t.File): ast is string {
    return ast === AstTool.parseError;
  }

  public parse(fileContent: string) {
    try {
      return parse(fileContent, {
        // sourceType: 'module',
        plugins: [
          'asyncGenerators',
          'bigInt',
          'classPrivateMethods',
          'classPrivateProperties',
          'classProperties',
          'decorators-legacy',
          'doExpressions',
          'dynamicImport',
          'exportDefaultFrom',
          'exportNamespaceFrom',
          'functionBind',
          'functionSent',
          'importMeta',
          'nullishCoalescingOperator',
          'numericSeparator',
          'objectRestSpread',
          'optionalCatchBinding',
          'optionalChaining',
          ['pipelineOperator', { proposal: 'minimal' }],
          'throwExpressions',
          'typescript',
          'jsx',
        ],
        sourceType: 'unambiguous',
        startLine: 1,
        strictMode: false,
        tokens: true,
      });
    } catch (error) {
      console.error('ast parse error');
      return AstTool.parseError;
    }
  }

  public createParamsLocation(
    languageDictionary: Map<string, string>,
    node: t.StringLiteral & { loc: t.SourceLocation }
  ) {
    const notFind = !languageDictionary.has(node.value);
    const languageValue = languageDictionary.get(node.value) ?? '';
    const desc = notFind ? 'Not find this key' : languageValue;
    const position: ParamsLocation = {
      paramsValue: node.value,
      notFind: notFind,
      desc: desc,
      start: {
        line: node.loc.start.line - 1,
        column: node.loc.start.column,
      },
      end: {
        line: node.loc.end.line - 1,
        column: node.loc.end.column,
      },
    };
    return position;
  }

  public getAllParamsFromAst(
    ast: t.File,
    languageDictionary: Map<string, string>,
    showErrorMessage: boolean = false
  ): ParamsLocation[] {
    const paramsLocations: ParamsLocation[] = [];
    const _this = this;
    traverse(ast, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      CallExpression(path) {
        const node = path.node;
        const callee = node.callee;
        if (_this.isI18nCallee(callee)) {
          const args = node.arguments;
          if (Array.isArray(args) && args.length > 0) {
            const arg = args[0];
            if (_this.isStringLiteral(arg) && arg.loc) {
              if (!languageDictionary.has(arg.value) && !showErrorMessage) {
                return;
              }
              paramsLocations.push(
                _this.createParamsLocation(languageDictionary, arg as any)
              );
            }
          }
        } else if (_this.isI18nHooksCallee(callee)) {
          const args = node.arguments;
          if (Array.isArray(args) && args.length > 0) {
            const arg = args[0];
            if (_this.isStringLiteral(arg) && arg.loc) {
              if (!languageDictionary.has(arg.value) && !showErrorMessage) {
                return;
              }
              paramsLocations.push(
                _this.createParamsLocation(languageDictionary, arg as any)
              );
            }
          }
        }
      },
    });
    return paramsLocations;
  }

  public getAllI18nKeyAndValue(
    ast: t.File | t.ObjectExpression,
    prefix: string
  ): Map<string, LanguageValue> {
    const _this = this;
    const map = new Map<string, LanguageValue>();
    traverse(ast, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ExportDefaultDeclaration(path) {
        const node = path.node;
        if (!_this.isObjectExpression(node.declaration)) {
          return;
        }
        _this.getAllI18nKeyAndValueFromObject(node.declaration, prefix, map);
        path.stop();
      },
    });
    return map;
  }

  public getAllI18nKeyAndValueFromObject(
    node: t.ObjectExpression,
    prefix: string,
    dictionary: Map<string, LanguageValue>
  ) {
    if (node.properties.length > 0) {
      node.properties.forEach((property) => {
        if (!this.isProperty(property)) {
          return;
        }
        let key = '';
        if (this.isIdentifier(property.key)) {
          key = property.key.name;
        } else {
          return;
        }
        if (this.isObjectExpression(property.value)) {
          let newKey = key;
          if (prefix.length > 0) {
            newKey = `${prefix}.${newKey}`;
          }
          this.getAllI18nKeyAndValueFromObject(
            property.value,
            newKey,
            dictionary
          );
        } else if (this.isStringLiteral(property.value)) {
          let value = property.value.value;
          if (value.includes('\n')) {
            value = value.replace('\n', '').replace('\r', '');
          }
          let newKey = key;
          if (prefix.length > 0) {
            newKey = `${prefix}.${newKey}`;
          }
          dictionary.set(newKey, {
            value,
            line: property.value.loc?.start.line ?? 1,
          });
        }
      });
    }
  }

  private isI18nCallee(callee: t.Expression | t.V8IntrinsicIdentifier) {
    if ('object' in callee && 'property' in callee) {
      if (
        this.isIdentifier(callee.object) &&
        callee.object.name === config.i18nObjectName &&
        this.isIdentifier(callee.property) &&
        callee.property.name === config.translateFunctionName
      ) {
        return true;
      }
    }
    return false;
  }

  private isI18nHooksCallee(
    callee: t.Expression | t.V8IntrinsicIdentifier
  ): callee is t.Identifier {
    if (this.isIdentifier(callee)) {
      return callee.name === config.translateFunctionName;
    }
    return false;
  }

  private isIdentifier(node: t.Node): node is t.Identifier {
    return t.isIdentifier(node);
  }

  private isStringLiteral(node: t.Node): node is t.StringLiteral {
    return t.isStringLiteral(node);
  }

  private isProperty(node: t.Node): node is t.ObjectProperty {
    return t.isObjectProperty(node);
  }

  private isObjectExpression(node: t.Node): node is t.ObjectExpression {
    return t.isObjectExpression(node);
  }
}

export default AstTool;
