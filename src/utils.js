// @ts-check
const path = require("path");

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
  return path
    .basename(filename)
    .replace(/^(\w)/, (_, c) => "I" + c.toUpperCase())
    .replace(/\W+(\w)/g, (_, c) => c.toUpperCase());
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
