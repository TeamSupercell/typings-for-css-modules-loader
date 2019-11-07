// @ts-check
const path = require("path");
const camelCase = require("camelcase");

/**
 * @param {string} content
 * @returns {string[]}
 */
const getCssModuleKeys = content => {
  const keyRegex = /"([^\\"]+)":/g;
  let match;
  const cssModuleKeys = [];

  while ((match = keyRegex.exec(content))) {
    if (cssModuleKeys.indexOf(match[1]) < 0) {
      cssModuleKeys.push(match[1]);
    }
  }
  return cssModuleKeys;
};

/**
 * @param {string} filename
 */
const filenameToInterfaceName = filename => {
  return "I" + camelCase(path.basename(filename), { pascalCase: true });
};

/**
 * @param {string[]} cssModuleKeys
 */
const cssModuleToTypescriptInterfaceProperties = cssModuleKeys => {
  return [...cssModuleKeys]
    .sort()
    .map(key => `  '${key}': string;`)
    .join("\n");
};

const filenameToTypingsFilename = filename => {
  const dirName = path.dirname(filename);
  const baseName = path.basename(filename);
  return path.join(dirName, `${baseName}.d.ts`);
};

/**
 * @param {string[]} cssModuleKeys
 * @param {string} interfaceName
 */
const generateGenericExportInterface = (cssModuleKeys, interfaceName) => {
  const interfaceProperties = cssModuleToTypescriptInterfaceProperties(
    cssModuleKeys
  );
  return `export interface ${interfaceName} {
${interfaceProperties}
}

export const locals: ${interfaceName};
export default locals;`;
};

module.exports = {
  getCssModuleKeys,
  filenameToInterfaceName,
  filenameToTypingsFilename,
  generateGenericExportInterface
};
