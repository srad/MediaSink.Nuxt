import path from "node:path";
import {generateApi} from "swagger-typescript-api";
import _ from "lodash";

const methodAliases = {
  get: (pathName, hasPathInserts) =>
    _.camelCase(`${pathName}_${hasPathInserts ? "detail" : "list"}`),
  post: (pathName, hasPathInserts) => _.camelCase(`${pathName}_create`),
  put: (pathName, hasPathInserts) => _.camelCase(`${pathName}_update`),
  patch: (pathName, hasPathInserts) => _.camelCase(`${pathName}_partial_update`),
  delete: (pathName, hasPathInserts) => _.camelCase(`${pathName}_delete`),
};

const createCustomOperationId = (method, route, moduleName) => {
  const hasPathInserts = /\{(\w){1,}\}/g.test(route);
  const splitedRouteBySlash = _.compact(_.replace(route, /\{(\w){1,}\}/g, "").split("/"));

  const routeParts = (splitedRouteBySlash.length > 1
      ? splitedRouteBySlash.splice(1)
      : splitedRouteBySlash
  ).join("_");

  /*
  const ret = routeParts.length > 3 && methodAliases[method]
    ? methodAliases[method](routeParts, hasPathInserts)
    : _.camelCase(_.lowerCase(method) + "_" + [moduleName].join("_")) || "index";

  console.log("------------------------------------------------------------------");
  console.log(method, route, moduleName);
  console.log(splitedRouteBySlash);
  console.log(routeParts, routeParts.length, methodAliases[method](routeParts, hasPathInserts));
  console.log(ret);
  console.log("------------------------------------------------------------------");

  return  ret;
   */

  return methodAliases[method](routeParts, hasPathInserts);
};

/* NOTE: all fields are optional expect one of `input`, `url`, `spec` */
await generateApi({
  name: "StreamSinkClient.ts",
  apiClassName: "StreamSinkClient",
  // set to `false` to prevent the tool from writing to disk
  output: path.join(process.cwd(), "services", "api", "v1"),
  url: "http://localhost:3000/swagger/doc.json",
  //templates: path.resolve(path.join(process.cwd(), ".", "services", "api", "v1", "templates")),
  httpClientType: "fetch", // or "axios"
  defaultResponseAsSuccess: false,
  generateClient: true,
  generateRouteTypes: true,
  generateResponses: true,
  toJS: false,
  extractRequestParams: true,
  extractRequestBody: true,
  extractEnums: true,
  extractResponseError: false,
  unwrapResponseData: true,
  prettier: {
    printWidth: 240,
    tabWidth: 4,
    trailingComma: "all",
    parser: "typescript",
  },
  defaultResponseType: "void",
  singleHttpClient: true,
  cleanOutput: false,
  enumNamesAsValues: false,
  moduleNameFirstTag: false,
  generateUnionEnums: false,
  typePrefix: "",
  typeSuffix: "",
  enumKeyPrefix: "",
  enumKeySuffix: "",
  addReadonly: false,
  sortTypes: true,
  sortRouters: true,
  extractingOptions: {
    requestBodySuffix: ["Payload", "Body", "Input"],
    requestParamsSuffix: ["Params"],
    responseBodySuffix: ["Data", "Result", "Output"],
    responseErrorSuffix: [
      "Error",
      "Fail",
      "Fails",
      "ErrorData",
      "HttpError",
      "BadResponse",
    ],
  },
  /** allow to generate extra files based with this extra templates, see more below */
  extraTemplates: [],
  anotherArrayType: false,
  fixInvalidTypeNamePrefix: "Type",
  fixInvalidEnumKeyPrefix: "Value",
  codeGenConstructs: (constructs) => ({
    ...constructs,
    RecordType: (key, value) => `MyRecord<key, value>`,
  }),
  primitiveTypeConstructs: (constructs) => ({
    ...constructs,
    string: {
      "date-time": "Date",
    },
  }),
  hooks: {
    onCreateComponent: (component) => {
    },
    onCreateRequestParams: (rawType) => {
    },
    onCreateRoute: (routeData) => {
    },
    onCreateRouteName: (routeNameInfo, rawRouteInfo,) => {
    },
    onFormatRouteName: (routeInfo, templateRouteName) => {
      const operationId = routeInfo.operationId;
      const method = routeInfo.method;
      const route = routeInfo.route;
      const moduleName = routeInfo.moduleName;

      if (operationId)
        return _.camelCase(operationId);
      if (route === "/")
        return _.camelCase(`${_.lowerCase(method)}Root`);

      return createCustomOperationId(method, route, moduleName);
    },
    onFormatTypeName: (typeName, rawTypeName, schemaType) => {
    },
    onInit: (configuration) => {
    },
    onPreParseSchema: (originalSchema, typeName, schemaType) => {
    },
    onParseSchema: (originalSchema, parsedSchema) => {
    },
    onPrepareConfig: (currentConfiguration) => {
    },
  },
});
