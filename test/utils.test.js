const { filenameToInterfaceName } = require("../src/utils");

describe("filenameToInterfaceName", () => {
  it("camelCase", () => {
    const actual = filenameToInterfaceName("reactDatePicker");
    expect(actual).toBe("IReactDatePicker");
  });

  it("PascalCase", () => {
    const actual = filenameToInterfaceName("reactDatePicker");
    expect(actual).toBe("IReactDatePicker");
  });

  it("snake_case", () => {
    const actual = filenameToInterfaceName("_React_date_picker");
    expect(actual).toBe("IReactDatePicker");
  });
  
  it("_mixed-case", () => {
    const actual = filenameToInterfaceName("_React-date_picker");
    expect(actual).toBe("IReactDatePicker");
  });
});
