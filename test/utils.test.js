// @ts-check
const { filenameToPascalCase } = require("../src/utils");

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
