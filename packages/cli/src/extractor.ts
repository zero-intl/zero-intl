import ts from "typescript";
import { readFileSync } from "fs";
import { ExtractedMessage } from "./types.js";

export class MessageExtractor {
  private componentNames = new Set(["T"]);

  extractFromFile(filePath: string): ExtractedMessage[] {
    const content = readFileSync(filePath, "utf-8");
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const messages: ExtractedMessage[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tagName = this.getTagName(node);
        if (tagName && this.componentNames.has(tagName)) {
          const message = this.extractMessageFromNode(node, filePath);
          if (message) {
            messages.push(message);
          }
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return messages;
  }

  private getTagName(node: ts.JsxElement | ts.JsxSelfClosingElement): string | null {
    const tagNameNode = ts.isJsxElement(node)
      ? node.openingElement.tagName
      : node.tagName;

    if (ts.isIdentifier(tagNameNode)) {
      return tagNameNode.text;
    }
    return null;
  }

  private extractMessageFromNode(
    node: ts.JsxElement | ts.JsxSelfClosingElement,
    filePath: string
  ): ExtractedMessage | null {
    const attributes = ts.isJsxElement(node)
      ? node.openingElement.attributes
      : node.attributes;

    let id: string | undefined;
    let defaultMessage: string | undefined;
    let description: string | undefined;

    attributes.properties.forEach(prop => {
      if (ts.isJsxAttribute(prop) && ts.isIdentifier(prop.name)) {
        const propName = prop.name.text;
        const value = this.getAttributeValue(prop);

        switch (propName) {
          case "id":
            id = value;
            break;
          case "defaultMessage":
            defaultMessage = value;
            break;
          case "description":
            description = value;
            break;
        }
      }
    });

    if (!id) {
      return null;
    }

    return {
      id,
      ...(defaultMessage && { defaultMessage }),
      ...(description && { description }),
      file: filePath
    };
  }

  private getAttributeValue(attribute: ts.JsxAttribute): string | undefined {
    if (!attribute.initializer) {
      return undefined;
    }

    if (ts.isStringLiteral(attribute.initializer)) {
      return attribute.initializer.text;
    }

    if (ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression) {
      if (ts.isStringLiteral(attribute.initializer.expression)) {
        return attribute.initializer.expression.text;
      }

      if (ts.isTemplateExpression(attribute.initializer.expression) || ts.isNoSubstitutionTemplateLiteral(attribute.initializer.expression)) {
        // For template literals, we'll extract the raw text
        return attribute.initializer.expression.getText();
      }

      // Handle simple identifier references (variables)
      if (ts.isIdentifier(attribute.initializer.expression)) {
        // For now, we'll try to resolve simple cases by looking at the variable name
        // This is a basic implementation - in a full implementation, you'd want
        // to do proper variable resolution
        return undefined; // Skip variable references for now
      }
    }

    return undefined;
  }
}
