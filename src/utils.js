// @ts-check
const path = require("path");
const camelCase = require("camelcase");

/**
 * @param {RegExp} keyRegex
 * @returns {(content: string) => string[]}
 */
const getCssModuleKeys = (keyRegex) => (content) => {
  let match;
  const cssModuleKeys = [];

  while ((match = keyRegex.exec(content))) {
    if (cssModuleKeys.indexOf(match[1]) < 0) {
      cssModuleKeys.push(match[1]);
    }
  }
  return cssModuleKeys;
};

/** @type {(content: string) => string[]} */
const getCssModuleKeysForLocalExport = getCssModuleKeys(/"([\w-]+)":/g);

/** @type {(content: string) => string[]} */
const getCssModuleKeysForNamedExport = getCssModuleKeys(/export const ([\w-]+) =/g);

/**
 * @param {string} filename
 */
const filenameToPascalCase = (filename) => {
  return camelCase(path.basename(filename), { pascalCase: true });
};

/**
 * @param {string[]} cssModuleKeys
 * @param {string=} indent
 */
const cssModuleToTypescriptInterfaceProperties = (cssModuleKeys, indent) => {
  return [...cssModuleKeys]
    .sort()
    .map((key) => `${indent || ""}'${key}': string;`)
    .join("\n");
};

const filenameToTypingsFilename = (filename) => {
  const dirName = path.dirname(filename);
  const baseName = path.basename(filename);
  return path.join(dirName, `${baseName}.d.ts`);
};

/**
 * @param {string[]} cssModuleKeys
 * @param {string} pascalCaseFileName
 */
const generateGenericExportInterface = (
  cssModuleKeys,
  pascalCaseFileName,
  disableLocalsExport
) => {
  const interfaceName = `I${pascalCaseFileName}`;
  const moduleName = `${pascalCaseFileName}Module`;
  const namespaceName = `${pascalCaseFileName}Namespace`;

  const localsExportType = disableLocalsExport
    ? ``
    : ` & {
  /** WARNING: Only available when \`css-loader\` is used without \`style-loader\` or \`mini-css-extract-plugin\` */
  locals: ${namespaceName}.${interfaceName};
}`;

  const interfaceProperties = cssModuleToTypescriptInterfaceProperties(
    cssModuleKeys,
    "    "
  );
  return `declare namespace ${namespaceName} {
  export interface I${pascalCaseFileName} {
${interfaceProperties}
  }
}

declare const ${moduleName}: ${namespaceName}.${interfaceName}${localsExportType};

export = ${moduleName};`;
};

module.exports = {
  getCssModuleKeysForLocalExport,
  getCssModuleKeysForNamedExport,
  filenameToPascalCase,
  filenameToTypingsFilename,
  generateGenericExportInterface,
};
