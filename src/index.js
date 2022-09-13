// @ts-check
const {
  filenameToPascalCase,
  filenameToTypingsFilename,
  getCssModuleKeys,
  generateGenericExportInterface,
} = require("./utils")
const persist = require("./persist")
const verify = require("./verify")
const { getOptions } = require("loader-utils")
const validateOptions = require("schema-utils")

const schema = {
  type: "object",
  properties: {
    eol: {
      description:
        "Newline character to be used in generated d.ts files. Uses OS default. This option is overridden by the formatter option.",
      type: "string",
    },
    banner: {
      description: "To add a 'banner' prefix to each generated `*.d.ts` file",
      type: "string",
    },
    formatter: {
      description:
        "Possible options: none and prettier (requires prettier package installed). Defaults to prettier if `prettier` module can be resolved",
      enum: ["prettier", "none"],
    },
    disableLocalsExport: {
      description: "Disable the use of locals export. Defaults to `false`",
      type: "boolean",
    },
    verifyOnly: {
      description:
        "Validate generated `*.d.ts` files and fail if an update is needed (useful in CI). Defaults to `false`",
      type: "boolean",
    },
    prettierConfigFile: {
      description:
        "Path to prettier config file",
      type: "string",
    },
    lazy: {
      description: "Emit 'use()' & 'unuse()' for *.lazy.css. Defaults to `true`",
      type: "boolean",
    }
  },
  additionalProperties: false,
}

/** @type {any} */
const configuration = {
  name: "typings-for-css-modules-loader",
  baseDataPath: "options",
}

/** @type {((this: import('webpack').loader.LoaderContext, ...args: any[]) => void) & {pitch?: import('webpack').loader.Loader['pitch']}} */
module.exports = function (content, ...args) {
  const options = getOptions(this) || {}
  if (typeof options.lazy === 'undefined') options.lazy = true

  validateOptions(schema, options, configuration)

  if (this.cacheable) {
    this.cacheable()
  }

  // let's only check `exports.locals` for keys to avoid getting keys from the sourcemap when it's enabled
  // if we cannot find locals, then the module only contains global styles
  const indexOfLocals = content.indexOf(".locals")
  const cssModuleKeys =
    indexOfLocals === -1
      ? []
      : getCssModuleKeys(content.substring(indexOfLocals))

  /** @type {any} */
  const callback = this.async()

  const successfulCallback = () => {
    callback(null, content, ...args)
  }

  if (cssModuleKeys.length === 0) {
    // no css module output found
    successfulCallback()
    return
  }

  const filename = this.resourcePath

  const cssModuleInterfaceFilename = filenameToTypingsFilename(filename)
  const cssModuleDefinition = generateGenericExportInterface(
    cssModuleKeys,
    filenameToPascalCase(filename),
    options.disableLocalsExport,
    options.lazy && filename.toLowerCase().includes('.lazy.')
  )

  applyFormattingAndOptions(cssModuleDefinition, options)
    .then((output) => {
      if (options.verifyOnly === true) {
        return verify(cssModuleInterfaceFilename, output)
      } else {
        persist(cssModuleInterfaceFilename, output)
      }
    })
    .catch((err) => {
      this.emitError(err)
    })
    .then(successfulCallback)
}

/**
 * @param {string} cssModuleDefinition
 * @param {any} options
 */
async function applyFormattingAndOptions(cssModuleDefinition, options) {
  if (options.banner) {
    // Prefix banner to CSS module
    cssModuleDefinition = options.banner + "\n" + cssModuleDefinition
  }

  if (
    options.formatter === "prettier" ||
    (!options.formatter && canUsePrettier())
  ) {
    cssModuleDefinition = await applyPrettier(cssModuleDefinition, options)
  } else {
    // at very least let's ensure we're using OS eol if it's not provided
    cssModuleDefinition = cssModuleDefinition.replace(
      /\r?\n/g,
      options.eol || require("os").EOL
    )
  }

  return cssModuleDefinition
}

/**
 * @param {string} input
 * @param {any} options
 * @returns {Promise<string>}
 */
async function applyPrettier(input, options) {
  const prettier = require("prettier")

  const configPath = options.prettierConfigFile ? options.prettierConfigFile : "./"
  const config = await prettier.resolveConfig(configPath, {
    editorconfig: true,
  })

  return prettier.format(
    input,
    Object.assign({}, config, { parser: "typescript" })
  )
}

let isPrettierInstalled
/**
 * @returns {boolean}
 */
function canUsePrettier() {
  if (typeof isPrettierInstalled !== "boolean") {
    try {
      require.resolve("prettier")
      isPrettierInstalled = true
    } catch (_) {
      isPrettierInstalled = false
    }
  }

  return isPrettierInstalled
}
