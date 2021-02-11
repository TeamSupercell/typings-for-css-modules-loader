// @ts-check
const {
  filenameToPascalCase,
  getCssModuleKeysForLocalExport,
  getCssModuleKeysForNamedExport,
} = require("../src/utils");

describe("filenameToPascalCase", () => {
  it("camelCase", () => {
    const actual = filenameToPascalCase("reactDatePicker");
    expect(actual).toBe("ReactDatePicker");
  });

  it("PascalCase", () => {
    const actual = filenameToPascalCase("reactDatePicker");
    expect(actual).toBe("ReactDatePicker");
  });

  it("snake_case", () => {
    const actual = filenameToPascalCase("_React_date_picker");
    expect(actual).toBe("ReactDatePicker");
  });

  it("_mixed-case", () => {
    const actual = filenameToPascalCase("_React-date_picker");
    expect(actual).toBe("ReactDatePicker");
  });
});

describe.each`
  description      | fn
  ${"localExport"} | ${getCssModuleKeysForLocalExport}
  ${"namedExport"} | ${getCssModuleKeysForNamedExport}
`("getCssModuleKeys / common / $description", ({ fn }) => {
  it("empty CSS module", () => {
    const content = `
      exports = module.exports = require("../node_modules/css-loader/dist/runtime/api.js")(false);
      // Module
      exports.push([module.id, "", ""]);
    `;
    const actual = fn(content);
    expect(actual).toEqual([]);
  });

  it("CSS module with :root pseudo-class only", () => {
    const content = `
      exports = module.exports = require("../node_modules/css-loader/dist/runtime/api.js")(false);
      // Module
      exports.push([module.id, ":root {\n  --background: green; }\n", ""]);
    `;
    const actual = fn(content);
    expect(actual).toEqual([]);
  });
});

describe("getCssModuleKeysForLocalExport", () => {
  it("CSS module with one class", () => {
    const content = `exports.locals = {
      "test": "test"
    };`;
    const actual = getCssModuleKeysForLocalExport(content);
    expect(actual).toEqual(["test"]);
  });

  it("CSS module with multiple classes", () => {
    const content = `exports.locals = {
      "test1": "test1",
      "test2": "test2"
    };`;
    const actual = getCssModuleKeysForLocalExport(content);
    expect(actual).toEqual(["test1", "test2"]);
  });
});

describe("getCssModuleKeysForNamedExport", () => {
  it("CSS module with one class", () => {
    const content = `
      export const test = "test";
    `;
    const actual = getCssModuleKeysForNamedExport(content);
    expect(actual).toEqual(["test"]);
  });

  it("CSS module with multiple classes", () => {
    const content = `
      export const test1 = "test1";
      export const test2 = "test2";
    `;
    const actual = getCssModuleKeysForNamedExport(content);
    expect(actual).toEqual(["test1", "test2"]);
  });
});
