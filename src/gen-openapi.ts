import * as path from 'path';
import * as _ from 'lodash';
import { randomString } from './util';
// types
import type {
  AnyOpt,
  GenOpenApiOption,
  GenOpenapiv3Config,
  InterfaceSchema,
  MethodConfig,
  Openapiv3Config,
  Openapiv3Info,
  Openapiv3ParametersConfig,
  Openapiv3Paths,
  Openapiv3RequestBodyConfig,
  Openapiv3Response,
  Openapiv3ReturnTypeConfig,
  Openapiv3SchemasConfig,
  Openapiv3Tags,
  PropertiesConfigItem,
  TraverseAstConfig,
} from './types';
// require
const SwaggerParser = require('@apidevtools/swagger-parser');
const chalk = require('chalk');

/**
 * openapi 数据验证
 *
 * @export
 * @param {Openapiv3Config} openapi
 */
export function openapiValidate(openapi: Openapiv3Config): Promise<boolean> {
  return new Promise((resolve: any) => {
    SwaggerParser.validate(openapi, (err: any, api: Openapiv3Config) => {
      if (err) {
        if(!process.env.JEST) console.error('\n', chalk.red(err.message), '\n');
        resolve(false);
      } else {
        if(!process.env.JEST) console.info(
          chalk.green('\n Openapi data validation passed! \n API name: %s, Openapi Version: %s.'),
          api.info.title,
          api.openapi,
          '\n',
        );
        resolve(true);
      }
    });
  });
}

/**
 * 生成openapi数据
 *
 * @return {*}  {Openapiv3Config}
 */
export function genOpenapiv3(
  data: GenOpenapiv3Config[],
  option?: GenOpenApiOption,
): Openapiv3Response {
  const { routePrefix, servers, responseSchema } = option as GenOpenApiOption;
  const info = genInfo();
  const tags = genTags(data);
  const { paths, schemas } = genPaths(data, routePrefix, responseSchema);

  // openapiv3
  const openapiv3: Openapiv3Config = {
    openapi: '3.0.3',
    info,
    tags,
    paths,
    components: {
      schemas,
    },
  };

  if (servers && servers.length) {
    openapiv3.servers = servers;
  }

  return {
    openapiv3,
    tsTransfromData: data,
  };
}

/**
 * gen info
 *
 * @return {*}  {Openapiv3Info}
 */
function genInfo(): Openapiv3Info {
  return {
    title: getPackageJson().name,
    description: 'Buildtime OpenAPI v3 spec generation for routing-controllers',
    version: '1.0.0',
  };
}

/**
 * gen tags
 *
 * @param {TraverseAstConfig[]} paths
 * @return {*}  {Openapiv3Tags[]}
 */
function genTags(paths: TraverseAstConfig[]): Openapiv3Tags[] {
  if (!paths || !paths.length) {
    return [];
  }
  const cache: Record<string, number> = {};

  return paths.reduce((prev: Openapiv3Tags[], path: TraverseAstConfig) => {
    if (!cache[path.className] && path.className) {
      cache[path.className] = 1;
      return [
        ...prev,
        {
          name: path.className,
          description: path.description,
        },
      ];
    }
    return prev;
  }, []);
}

/**
 * gen paths
 *
 * @param {TraverseAstConfig[]} data
 * @return {*}  {Openapiv3Paths}
 */
function genPaths(
  data: TraverseAstConfig[],
  routePrefix?: string,
  responseSchema?: InterfaceSchema,
): { paths: Openapiv3Paths; schemas: Openapiv3SchemasConfig } {
  if (!data || !data.length) {
    return { paths: {}, schemas: {} };
  }

  let componentSchemas: Openapiv3SchemasConfig = {};

  const paths = data.reduce((prev: Openapiv3Paths, next: TraverseAstConfig) => {
    const paths = next.paths || [];
    const result = paths.reduce((prevPath: AnyOpt, itemPath: AnyOpt) => {
      // 获取params中的properties
      const { parameters = [], requestBody = {}, schemas = {} } = genPathParameters(itemPath, next);

      // 获取return中的properties
      const { responses, schemas: schemas_ } = genResponses(itemPath.returnType, responseSchema);

      // 处理路由
      const res = (itemPath.paths || []).reduce((childPrevPath: AnyOpt, childItemPath: AnyOpt) => {
        const method = (childItemPath.method || '').toLowerCase();
        const methodJson: MethodConfig = {
          tags: [next.className],
          summary: itemPath.description || childItemPath.operationId || '',
          description: `${next.className}.${childItemPath.operationId} ${next.description} `,
          operationId: `${next.className}.${method}.${childItemPath.operationId}.${randomString(10)}`,
          responses,
        };
        if (parameters.length) methodJson.parameters = parameters;
        // 只有post，put，delete 请求有body请求体
        if (Object.keys(requestBody).length && ['post', 'put', 'delete'].includes(method)) {
          methodJson.requestBody = requestBody;
        }

        const json = {
          [`${routePrefix}${childItemPath.routerPath}`]: {
            [method]: methodJson,
          },
        };
        // 合并params与return中的properties
        componentSchemas = { ...componentSchemas, ...schemas, ...schemas_ };
        return _.merge(childPrevPath, json);
      }, {});
      return _.merge(prevPath, res);
    }, {});
    return _.merge(prev, result);
  }, {});

  return { paths, schemas: componentSchemas };
}

/**
 * gen method params
 *
 * @param {AnyOpt[]} pathParameters
 * @return {*}  {Openapiv3ParametersConfig[]}
 */
function genPathParameters(
  paths: AnyOpt,
  path: TraverseAstConfig,
): {
  parameters: Openapiv3ParametersConfig[];
  schemas: Openapiv3SchemasConfig;
  requestBody: Openapiv3RequestBodyConfig;
} {
  const { parameters: pathParameters } = paths || {};

  if (!pathParameters || !pathParameters.length) {
    return [] as any;
  }

  let componentSchemas_: Openapiv3SchemasConfig = {};
  const parameters: Openapiv3ParametersConfig[] = [];
  const requestBodyParamProperties: AnyOpt = {
    type: 'object',
    properties: {},
  };
  let requestBodyProperties: AnyOpt | null = null;
  let haveBodyDecorator: boolean = false;

  const bodyParamWarn = (): void => {
    if (haveBodyDecorator) {
      console.warn(
        chalk.yellow(
          `警告：%s 中的 %s 方法，不推荐同时使用@Body与@BodyParam装饰器，请单独使用@Body或@BodyParam装饰器。`,
        ),
        _.get(path, 'className'),
        _.get(paths, ['paths', '0', 'operationId']),
      );
    }
  };

  pathParameters.forEach((next: AnyOpt) => {
    // 忽略any,never 等不知道类型的字段
    if (!_.get(next, 'schema') || !Object.keys(_.get(next, 'schema')).length) {
      return;
    }

    if (next.in === 'body') {
      // 类型警告提示
      if (_.get(next, 'decoratorType') === 'BodyParam' && _.get(next, 'schema.type') === 'object') {
        console.warn(
          chalk.yellow(
            `警告：%s 中的%s 方法，@BodyParam 装饰器不推荐定义为【接口|any|never类型】，推荐使用基础类型。`,
          ),
          _.get(path, 'className'),
          _.get(paths, ['paths', '0', 'operationId']),
        );
      } else if (_.get(next, 'decoratorType') === 'Body' && _.get(next, 'schema.enum')) {
        console.warn(
          chalk.yellow(
            `警告：%s 中的%s 方法，@Body 装饰器不推荐定义为【枚举类型】，推荐使用interface接口类型。`,
          ),
          _.get(path, 'className'),
          _.get(paths, ['paths', '0', 'operationId']),
        );
      }

      // 字段描述、默认值、必填
      const getDescAndDefaultValueAndRequired = (next: AnyOpt) => {
        if (next.example) requestBodyParamProperties.properties[next.name].default = next.example;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        if (next.required) requestBodyParamProperties.required ? requestBodyParamProperties.required.push(next.name) : (requestBodyParamProperties.required = [next.name]);
        requestBodyParamProperties.properties[next.name].description = next.description ? `@${next.decoratorType}: ${next.description}` : `@${next.decoratorType}`;
      }

      // 处理body参数
      if (next.decoratorType === 'Body') {
        // @Body注释优先
        haveBodyDecorator = true;

        // 枚举类型处理
        if (_.get(next, 'schema.enum')) {
          requestBodyProperties = _.get(next, 'schema');
          return;
        }
        // 处理必填
        const schemas: AnyOpt = _.get(next, 'schema') || {};
        if (!next.required) { delete schemas.required };

        const { schemas: schema, componentSchemas } = handleSchema(schemas);
        requestBodyProperties = schema;
        componentSchemas_ = { ...componentSchemas_, ...componentSchemas };
      }
      // @BodyParam 复杂类型
      else if (
        _.get(next, 'schema.type') === 'object' || // object类型
        _.get(next, 'schema.type') === 'array' || // array类型
        _.get(next, 'schema.anyOf') || // 联合类型
        _.get(next, 'schema.allOf') // 交叉类型
      ) {
        bodyParamWarn();
        const { schemas: schema, componentSchemas } = handleSchema(next.schema);
        componentSchemas_ = { ...componentSchemas_, ...componentSchemas };
        requestBodyParamProperties.properties[next.name] = schema;
        getDescAndDefaultValueAndRequired(next);
      }
      // @BodyParam枚举类型
      else if (_.get(next, 'schema.enum')) {
        bodyParamWarn();
        requestBodyParamProperties.properties[next.name] = _.get(next, 'schema');
        getDescAndDefaultValueAndRequired(next);
      } else {
        // @BodyParam注释进行合并
        bodyParamWarn();
        requestBodyParamProperties.properties[next.name] = {
          type: next.schema.type,
        };
        getDescAndDefaultValueAndRequired(next);
      }
    } else {

      const paramArr = [
        'UploadedFile',
        'QueryParam',
        'Param',
        'HeaderParam',
        'SessionParam',
        'CookieParam',
      ];
      // 类型警告提示
      if (paramArr.includes(_.get(next, 'decoratorType'))) {
        let str = '';
        if (_.get(next, 'schema.type') === 'object') {
          str = '接口';
        }
        if (str) {
          console.warn(
            chalk.yellow(
              `警告：%s 中的%s 方法，@%s 装饰器不推荐使用【%s类型】，推荐使用基础类型。`,
            ),
            _.get(path, 'className'),
            _.get(paths, ['paths', '0', 'operationId']),
            _.get(next, 'decoratorType'),
            str,
          );
        }
      }

      // 处理复杂类型的 querys,paths,headers,cookies， 且为interface类型时 打平为一维数组
      if (
        !paramArr.includes(_.get(next, 'decoratorType')) &&
        (_.get(next, 'schema.type') === 'object' && (_.get(next, 'schema.properties')))
      ) {
        const { componentSchemas = {}, schema } = tileJsonSchema(next);
        componentSchemas_ = { ...componentSchemas_, ...componentSchemas };
        parameters.push(...schema)
      }
      else {
        // 处理其他的 query,path,header,cookie参数
        const { schema, componentSchemas } = functionParamsCommonHandle(next);
        componentSchemas_ = { ...componentSchemas_, ...componentSchemas };
        parameters.push(schema);
      }
    }
  });

  // @Body @BodyParam 合并处理
  let schema: AnyOpt = {};
  if (requestBodyProperties && Object.keys(requestBodyParamProperties.properties).length) {
    schema = {
      anyOf: [
        requestBodyProperties,
        requestBodyParamProperties
      ]
    }
  }
  else if (requestBodyProperties) {
    schema = requestBodyProperties;
  }
  else if (Object.keys(requestBodyParamProperties.properties).length) {
    schema = requestBodyParamProperties;
  }

  const requestBody: Openapiv3RequestBodyConfig = Object.keys(schema).length ? {
    description: '',
    content: {
      'application/json': {
        schema,
      },
    },
  } : {};

  return {
    parameters,
    requestBody,
    schemas: componentSchemas_,
  };
}


/**
 * params 公共处理逻辑
 *
 * @param {AnyOpt} parames
 * @param {AnyOpt} componentSchemas_
 * @return {*} 
 */
function functionParamsCommonHandle(parames: AnyOpt): { schema: Openapiv3ParametersConfig, componentSchemas: AnyOpt } {

  let componentSchemas: AnyOpt = {};
  let schema = parames.schema || {};

  if (!_.get(parames, 'schema.$ref')) {
    const { schemas = {}, componentSchemas: componentSchemas_ = {} } = handleSchema(parames.schema || {});
    schema = schemas;
    componentSchemas = componentSchemas_;
  }

  const typeStr = _.get(schema, 'schema.type') || _.get(schema, 'type') || 'object';
  const description = parames.description ?
    `${parames.description || ''} (@${parames.decoratorType}, 类型：${typeStr})` :
    `@${parames.decoratorType}, 类型：${typeStr}`;
  const required = ['Params', 'Param'].includes(_.get(parames, 'decoratorType')) ? true : parames.required

  const json: Openapiv3ParametersConfig = {
    name: parames.name,
    in: parames.in,
    description,
    required,
    schema,
  };
  // example
  if (parames.example) json.example = parames.example;

  return {
    schema: json,
    componentSchemas
  };
}


/**
 * jsonschema 处理为openapi格式
 *
 * @param {AnyOpt} schema
 * @return {*}  {AnyOpt}
 */
function handleSchema(schemas: AnyOpt): {
  schemas: AnyOpt;
  componentSchemas: Openapiv3SchemasConfig;
} {
  if (!schemas) {
    return {
      schemas: {},
      componentSchemas: {},
    };
  }

  // 处理 interface 类型
  if (schemas.$ref) {
    schemas = schemas.schema || {};
  }
  // 处理{ name: string, age: EEE} 这种类型
  else if (schemas.schema) {
    schemas = schemas.schema || {};
  }

  // 偷懒处理
  schemas = JSON.parse(
    JSON.stringify(schemas).replace(/#\/definitions\//g, '#/components/schemas/'),
  );

  const definitions = schemas.definitions || {};
  delete schemas.definitions;

  return {
    schemas,
    componentSchemas: definitions,
  };
}

/**
 * jsonschema 转换为一维对象
 *
 * @param {AnyOpt} jsonSchema
 * @return {*}  {AnyOpt}
 */
export function tileJsonSchema(parames: AnyOpt): { componentSchemas: AnyOpt; schema: Openapiv3ParametersConfig[] } {
  let { schema, decoratorType, in: in_ } = parames || {};

  // 多维jsonschema组装为一维jsonschema
  const { schemas, componentSchemas } = handleSchema(schema);
  let componentSchemas_: AnyOpt = componentSchemas;

  schema = schemas;
  const properties = schema.properties || {};

  const res = Object.keys(properties).reduce((prev: any[], next: string) => {
    const newNext: AnyOpt = properties[next];
    // 参数必填与接口必填的并集
    const required = (schema.required || []).includes(next) && parames.required;

    const { schema: result, componentSchemas } = functionParamsCommonHandle({
      name: next,
      in: in_,
      description: newNext.description,
      required,
      decoratorType,
      schema: newNext,
      example: newNext.default || ""
    })

    componentSchemas_ = { ...componentSchemas_, ...componentSchemas };

    return [
      ...prev,
      result
    ]
  }, []);

  return {
    componentSchemas: componentSchemas_,
    schema: res,
  }
}

/**
 * gen response
 *
 * @param {AnyOpt} returnType
 * @return {*}  {{ responses: Openapiv3ReturnTypeConfig; schemas: Openapiv3SchemasConfig }}
 */
function genResponses(
  returnType: AnyOpt = {},
  responseSchema?: InterfaceSchema,
): { responses: Openapiv3ReturnTypeConfig; schemas: Openapiv3SchemasConfig } {
  const { schemas: schema, componentSchemas } = handleSchema(returnType);

  let newResponseSchema: AnyOpt | null = null;
  // response 合并
  if (responseSchema && typeof responseSchema === 'object') {
    newResponseSchema = _.cloneDeep(responseSchema);
    const { properties = {} } = newResponseSchema;
    Object.keys(properties).forEach((key: string) => {
      const propItem: PropertiesConfigItem = properties[key];
      if (propItem.$ref) {
        properties[key] = schema as any;
      }
    });
  }

  const responses = {
    '200': {
      description: '',
      content: {
        'application/json': {
          schema: newResponseSchema || schema,
        },
      },
    },
  };

  return {
    responses,
    schemas: componentSchemas,
  };
}

/**
 * 获得package.json信息
 *
 * @return {*}
 */
export function getPackageJson(): AnyOpt {
  const packagejson = path.join(process.cwd(), './package.json');
  return require(packagejson) || {};
}
