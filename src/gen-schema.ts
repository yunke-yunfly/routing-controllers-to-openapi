import traverse from '@babel/traverse';
import genTypeSchema, { genAst } from 'fast-typescript-to-jsonschema';
import * as _ from 'lodash';
import { genOpenapiv3 } from './gen-openapi';
// types
import type {
  AnyOpt,
  AstType,
  DynamicRoutingConfig,
  GenOpenApiOption,
  Openapiv3Response,
  ParamType,
  ParamTypesConfig,
  RequiredType,
  TraverseAstConfig,
} from './types';

const chalk = require('chalk');
const path_ = require('path')

/** 
 * 生成apidoc
 *
 * @export
 * @param {string} file
 */
export function genTsApiDoc(files: string[], option?: GenOpenApiOption): Openapiv3Response {
  if (!files || !files.length) {
    throw Error('files参数有误!');
  }

  const { routePrefix = '', filterFiles = [], servers, responseSchema, requiredType = 'typescript' } = option || {};

  const result = files.reduce((prev: TraverseAstConfig[], file: string) => {
    return [...prev, genTsApiDocForOneFile(file, requiredType, Array.from(new Set([...filterFiles, 'grpcObj', 'getGrpcClient', 'serviceWrapper'])))];
  }, []);

  // 生成openapi数据格式
  return genOpenapiv3(result, { routePrefix, servers, responseSchema });
}

/**
 * 单个文件解析
 *
 * @param {string} file
 */
function genTsApiDocForOneFile(
  file: string,
  requiredType: RequiredType,
  filterFiles?: string[]
) {
  const ast = genAst(file);

  // 生成当前文件所有type类对应的jsonschema
  genTypeSchema.genJsonDataFormFile(file, ast, filterFiles);

  // 遍历ast生成doc
  const result = traverseAst(ast, requiredType, file);

  let { paths = [] } = result;


  // 处理参数与返类型
  paths = paths.map((path: any) => {
    return {
      ...path,
      // 处理所有参数
      parameters: handleParamTypes(path, file),
      // 处理返类型
      returnType: handleReturnType(path, file),
    }
  })

  // 处理参数注释 和 example 值
  paths = paths.map((path: AnyOpt) => {
    path = handleMethodDesc(path);
    delete path.methodDescription;
    return path;
  });

  return {
    ...result,
    paths,
  };
}

/**
 * 获取ast
 * @export
 * @param {string} file
 * @return {*}  {AstType}
 */
export function getAst(file: string): AstType {
  return genAst(file);
}

/**
 * 处理Class定义
 *
 * @param {AnyOpt} path
 * @param {AnyOpt} json
 */
function classDeclaration(path: AnyOpt, json: AnyOpt, file?: string) {
  // 处理controller Decorator
  const decorators = path.get('decorators');
  if (!Array.isArray(decorators)) {
    return;
  }

  // 函数名
  json.className = _.get(path.get('id'), 'node.loc.identifierName') || '';
  if (!json.className) {
    const { name = '' } = path_.parse(file || '');
    if (name) json.className = name;
  }

  decorators.map((item: AnyOpt) => {
    const decoratorKey = _.get(item, 'node.expression.callee.name');
    const decoratorVal = _.get(item, 'node.expression.arguments[0].value');
    if ((decoratorKey === 'Controller' || decoratorKey === 'JsonController') && decoratorVal) {
      const { isDynamicRouting, path: paths } = handleRouterPath(decoratorVal);
      if (isDynamicRouting) {
        console.warn(
          chalk.red(`错误：%s类中，%s路由注解请不要使用动态路由，它可能会带来一些解析上的异常。`),
          json.className,
          decoratorKey,
        );
      }
      json.controllerPrefix = paths;
    }
  });

  // 注释 只获取函数前注释,取最近的注释
  json.description = genTypeSchema.getSimpleDescription(path.node);
}

/**
 * 处理每个Method方法
 *
 * @param {AnyOpt} path
 * @param {AnyOpt} json
 */
function classMethod(path: AnyOpt, json: AnyOpt, requiredType: RequiredType, file?: string) {
  let methodDescription: AnyOpt = {};

  // method name
  const operationId = (path.get('key') || '').toString();
  const allowMethod = ['get', 'post', 'put', 'delete', 'options', 'patch', 'head'];

  // path params
  const pathParams: ParamTypesConfig[] = [];
  // 标识是否有@Param|@Params装饰器已定义，如果未定义的则拼接到最终的param参数数组中
  const useDynamicRoutingKeys: string[] = [];

  // 处理 Method Decorator
  let decorators = path.get('decorators');
  decorators = Array.isArray(decorators) ? decorators : [];
  const paths: AnyOpt[] = decorators.reduce((prev: AnyOpt[], item: AnyOpt) => {
    const method = (_.get(item, 'node.expression.callee.name') || '').toLowerCase();
    // 剔除非http类型
    if (!allowMethod.includes(method)) {
      return prev;
    }

    let {
      isDynamicRouting,
      dynamicKey,
      path: routerPath,
    } = handleRouterPath(_.get(item, 'node.expression.arguments[0].value'));

    // 动态路由参数处理
    if (isDynamicRouting && dynamicKey?.length) {
      dynamicKey.forEach((item: string) => {
        pathParams.push({
          name: item,
          name_: item,
          schema: { type: 'string' },
          required: true,
          in: 'path',
          decoratorType: 'Param',
        });
      })
    }

    // 拼接controller级别router前缀
    routerPath = json.controllerPrefix ? `${json.controllerPrefix}${routerPath}` : routerPath;
    // 注释
    const description = genTypeSchema.getDescAndExampleFromJsDoc(path.node);
    methodDescription = description;
    // 赋值
    return [
      ...prev,
      {
        method,
        routerPath,
        operationId,
      },
    ];
  }, []);

  // params
  let params = path.get('params');
  params = Array.isArray(params) ? params : [];
  const parameters: ParamTypesConfig[] = params.reduce((prev: any[], item: AnyOpt) => {
    // 如果参数有附默认值则需要特殊处理 例如: @BodyParam('pager1') pager1: number | string = '0',
    let paramsDefaultVal = '';
    if (item.type === 'AssignmentPattern') {
      paramsDefaultVal = (_.get(item.get('right'), 'node.value') || '').toString();
      item = item.get('left');
    }

    const required = requiredType === 'typescript' && !_.get(item, 'node.optional');

    const name = _.get(item, 'node.name');

    const schema = genTypeSchema.transformTypeAnnotation({
      typeAnnotation: item.node.typeAnnotation,
      file,
      attrKey: `${operationId}方法下的${name}`,
    });

    const parameter: ParamTypesConfig = {
      name,
      name_: name,
      schema,
      required,
    } as ParamTypesConfig;

    // Decorator
    const decorators = _.get(item, ['node', 'decorators', '0']);
    // decorato type
    const decoratorType = _.get(decorators, 'expression.callee.name');
    const decoratorArguments = _.get(decorators, 'expression.arguments') || [];

    // 只解析routing-controllers的注解
    if (
      ![
        'Param',
        'Params',
        'QueryParam',
        'QueryParams',
        'HeaderParam',
        'HeaderParams',
        'CookieParam',
        'CookieParams',
        'Session',
        'SessionParam',
        'State',
        'Body',
        'BodyParam',
        'UploadedFile',
        'UploadedFiles',
      ].includes(decoratorType)
    ) {
      return prev;
    }

    // params key
    const decoratorVal = _.get(decoratorArguments, '[0].value');
    const result = genTypeSchema.getDescAndExampleFromJsDoc(decorators) || {};

    // 解析routing-controllers {required: true} 参数是否必填
    let requiredArguments: null | AnyOpt = null;
    decoratorArguments.forEach((item: AnyOpt) => { if (item.type === 'ObjectExpression') requiredArguments = item; })
    if (requiredArguments && (process.env.REQUIRE_TYPE || requiredType === 'routing-controllers')) {
      const objectItem: AnyOpt[] = _.get(requiredArguments, 'properties') || [];
      // 参数是否必填
      objectItem.map((item: AnyOpt) => {
        const name = _.get(item, 'key.name');
        const value = _.get(item, 'value.value');
        if (name === 'required' && value) {
          parameter.required = true;
        }
      });
    }
    // 装饰器类型
    parameter.decoratorType = decoratorType;
    // 更准确的key
    if (decoratorVal) parameter.name = decoratorVal;
    if (result.description) parameter.description = result.description;
    // example value
    if (paramsDefaultVal || _.get(result, [name || decoratorVal, 'example'])) {
      parameter.example = paramsDefaultVal || _.get(result, [name || decoratorVal, 'example']);
    }

    // 检测参数是否是动态路由
    if (pathParams.length && (decoratorType === 'Param' || decoratorType === 'Params')) {
      pathParams.forEach((item: ParamTypesConfig) => {
        if (parameter.name_ === item.name_) {
          useDynamicRoutingKeys.push(item.name_ as string);
          parameter.required = true;
          parameter.in = 'path';
        }
      });
    }

    return [...prev, parameter];
  }, []);

  // 合并动态路由参数
  if (useDynamicRoutingKeys.length <= pathParams.length) {
    if (!useDynamicRoutingKeys.length) {
      parameters.push(...pathParams);
    } else {
      pathParams.forEach((item: ParamTypesConfig) => {
        if (!useDynamicRoutingKeys.includes(item.name_ as string)) {
          parameters.push(item);
        }
      });
    }
  }

  // returnType
  const returnTypeAnnotation = path.get('returnType');
  const returnType = genTypeSchema.transformTypeAnnotation({
    typeAnnotation: _.get(returnTypeAnnotation, 'node.typeAnnotation'),
    file,
    attrKey: `${operationId}方法下的Response返回字段`,
  });

  json.paths.push({
    paths,
    parameters,
    methodDescription,
    returnType,
  });
}

/**
 * ast遍历
 *
 * @export
 * @param {AstType} ast
 */
export function traverseAst(ast: AstType, requiredType: RequiredType, file?: string): TraverseAstConfig {
  const json: TraverseAstConfig = {
    controllerPrefix: '',
    className: '',
    description: '',
    paths: [],
  };
  traverse(ast as any, {
    ClassDeclaration: (path: AnyOpt) => classDeclaration(path, json, file),
    ClassMethod: (path: AnyOpt) => classMethod(path, json, requiredType, file),
  });

  return json;
}

/**
 * 动态路由处理
 *
 * @param {string} path
 * @return {*}  {string}
 */
function handleRouterPath(path: string = ''): DynamicRoutingConfig {
  const result: DynamicRoutingConfig = {
    isDynamicRouting: false,
    path,
    dynamicKey: [],
  };

  result.path = path.replace(/:([a-zA-Z0-9_-]+)/g, ($1, $2) => {
    result.isDynamicRouting = true;
    result.dynamicKey?.push($2);
    return `{${$2}}`;
  });

  return result;
}

/**
 * 处理所有Params的type类型
 *
 * @param {ParamTypesConfig} paramTypes
 */
export function handleParamTypes(path: AnyOpt, file: string): ParamTypesConfig[] {
  const { parameters: paramTypes } = path || {};
  if (!paramTypes || !paramTypes.length) {
    return [];
  }

  const result = paramTypes.map((param: ParamTypesConfig) => {
    const paramsArr = [
      'Body',
      'HeaderParams',
      'CookieParams',
      'QueryParams',
      'Params',
      'Session',
      'State',
      'Req',
      'Res',
      'UploadedFiles',
    ];

    console.log('333333333333333333',param)

    if (paramsArr.includes(param.decoratorType) || _.get(param, 'schema.$ref')) {
      console.log('1111111111111111111',param)
      // 复杂类型
      if (!param.schema) {
         /* istanbul ignore next */
        param.schema = {};
      } else if (typeof param.schema === 'object' && param.schema.$ref) {
        const type = param.schema.$ref.replace('#', '');
        const schema = genTypeSchema.getJsonSchema(file, type);

        if (_.get(schema, 'enum')) {
          const currentStr = '枚举';
          console.warn(
            chalk.yellow(
              `警告：%s 文件、%s 方法，@%s 装饰器不推荐定义为【%s类型】，推荐使用接口类型。`,
            ),
            file,
            _.get(path, ['paths', '0', 'operationId']),
            param.decoratorType,
            currentStr,
          );
        }

        param.schema = schema;
      } else {
        // 警告
        if (typeof _.get(param, 'schema') === 'object') {
          let currentStr = '';
          let useStr = '';

          if (_.get(param, 'schema.type') === 'array') {
            currentStr = '数组';
          } else if (_.get(param, 'schema.anyOf')) {
            currentStr = '联合';
          } else if (_.get(param, 'schema.allOf')) {
            currentStr = '交叉';
          } else if (_.get(param, 'schema.type') !== 'object') {
            currentStr = '基础';
          }

          if (paramsArr.includes(param.decoratorType)) {
            useStr = '接口';
          } else {
            /* istanbul ignore next */
            useStr = '基础';
          }
          if (currentStr && useStr) {
            console.warn(
              chalk.yellow(
                `警告：%s 文件、%s 方法，@%s 装饰器不推荐定义为【%s类型】，推荐使用%s类型。`,
              ),
              file,
              _.get(path, ['paths', '0', 'operationId']),
              param.decoratorType,
              currentStr,
              useStr,
            );
          }
        }

        // 非基础类型才做处理
        if (
          !(_.get(param, 'schema.type') === 'string' ||
            _.get(param, 'schema.type') === 'number' ||
            _.get(param, 'schema.type') === 'boolean')
        ) {
          const fileJson = _.get(genTypeSchema.genJsonData(), [file]) || {};
          const result = genTypeSchema.genJsonschema(fileJson, param.schema, { keySet: new Set(), refKeyTime: {} });
          param.schema = result as AnyOpt;
        }
      }
    }
    // 单个参数复杂类型处理
    else if (
      _.get(param, 'schema.type') === 'object' || // object类型
      _.get(param, 'schema.type') === 'array' || // array类型
      _.get(param, 'schema.anyOf') || // 联合类型
      _.get(param, 'schema.allOf') //  交叉类型
    ) {
      let currentStr = '';

      console.log('2222222222222222',param)

      if (_.get(param, 'schema.anyOf')) {
        currentStr = '联合';
      } else if (_.get(param, 'schema.allOf')) {
        currentStr = '交叉';
      } else if (_.get(param, 'schema.type') === 'array') {
        currentStr = '数组';
      } else if (_.get(param, 'schema.type') === 'object' && _.get(param, 'schema.properties')) {
        currentStr = '接口';
      } else if (_.get(param, 'schema.enum')) {
        /* istanbul ignore next */
        currentStr = '枚举';
      }

      if (currentStr) {
        console.warn(
          chalk.yellow(
            `警告：%s 文件、%s 方法，@%s 装饰器不推荐使用【%s类型】，推荐使用基础类型。`,
          ),
          file,
          _.get(path, ['paths', '0', 'operationId']),
          param.decoratorType,
          currentStr,
        );
      }

      const fileJson = _.get(genTypeSchema.genJsonData(), [file]) || {};
      const result = genTypeSchema.genJsonschema(fileJson, param.schema, { keySet: new Set(), refKeyTime: {} });
      param.schema = result as AnyOpt;
    }
    param.in = paramsIn(param.decoratorType);
    return param;
  });
  return result;
}

/**
 * 参数属于
 *
 * @param {string} paramsType
 * @return {*}  {ParamType}
 */
function paramsIn(paramsType: string): ParamType {
  let result: ParamType = 'query';
  switch (paramsType) {
    case 'Body':
    case 'BodyParam':
      result = 'body';
      break;
    case 'Param':
    case 'Params':
      result = 'path';
      break;
    case 'UploadedFile':
    case 'UploadedFiles':
    case 'QueryParam':
    case 'QueryParams':
    case 'State':
      result = 'query';
      break;
    case 'HeaderParams':
    case 'HeaderParam':
    case 'Session':
    case 'SessionParam':
      result = 'header';
      break;
    case 'CookieParam':
    case 'CookieParams':
      // result = 'cookie'; // 此处本应该为cookie，但是middleman不支持 cookie的展示，所以放入header中
      result = 'header';
      break;
  }
  return result;
}

/**
 * 注释处理
 * 优先使用行内注释，其次取方法上的注释，通过query key进行注释匹配
 *
 * @param {AnyOpt} path
 * @return {*}  {AnyOpt}
 */
export function handleMethodDesc(path: AnyOpt): AnyOpt {
  let { parameters, methodDescription } = path || {};
  if (!methodDescription) {
    return path;
  }

  // 函数注释
  if (_.get(methodDescription, 'description')) {
    path.description = _.get(methodDescription, 'description');
  }

  if (!parameters || !parameters.length) {
    return path;
  }

  // 参数注释
  parameters = parameters.map((param: ParamTypesConfig) => {
    const description = _.get(methodDescription, [param.name_ || param.name, 'description']);
    const example = _.get(methodDescription, [param.name_ || param.name, 'example']);
    if (description) {
      param.description = description;
    }
    if (example) {
      param.example = example;
    }
    delete param.name_;
    return param;
  });

  return path;
}

/**
 * 处理函数返回类型
 *
 * @param {*} returnTypeSchema
 * @param {string} file
 */
export function handleReturnType(path: AnyOpt, file: string): AnyOpt {
  const { returnType: returnTypeSchema = {} } = path || {};

  if (!returnTypeSchema || typeof returnTypeSchema !== 'object') {
    return {};
  }

  if (returnTypeSchema.anyOf) {
    console.warn(
      chalk.yellow(
        `警告：%s 文件、%s 方法，不推荐使用【联合类型】做为返回类型，返回类型(returnType)推荐使用单个interface.`,
      ),
      file,
      _.get(path, ['paths', '0', 'operationId']),
    );
  } else if (returnTypeSchema.allOf) {
    console.warn(
      chalk.yellow(
        `警告：%s 文件、%s 方法，不推荐使用【交叉类型】做为返回类型，返回类型(returnType)推荐使用单个interface.`,
      ),
      file,
      _.get(path, ['paths', '0', 'operationId']),
    );
  } else if (returnTypeSchema.type === 'array') {
    console.warn(
      chalk.yellow(
        `警告：%s 文件、%s 方法，不推荐使用【数组类型】做为返回类型，返回类型(returnType)推荐使用单个interface.`,
      ),
      file,
      _.get(path, ['paths', '0', 'operationId']),
    );
  } else if (
    returnTypeSchema.type &&
    ['string', 'number', 'boolean'].includes(returnTypeSchema.type)
  ) {
    console.warn(
      chalk.yellow(
        `警告：%s 文件、%s 方法，不推荐使用【基础类型】做为返回类型，返回类型(returnType)推荐使用单个interface.`,
      ),
      file,
      _.get(path, ['paths', '0', 'operationId']),
    );
  }

  // 处理简单类型
  if (
    returnTypeSchema.type &&
    returnTypeSchema.type !== 'object' &&
    returnTypeSchema.type !== 'array'
  ) {
    return returnTypeSchema;
  }

  if (returnTypeSchema.$ref && !returnTypeSchema.$realRef) {
    const type = returnTypeSchema.$ref.replace(/#\/definitions|#/, '');
    const schema = genTypeSchema.getJsonSchema(file, type);

    if (_.get(schema, 'enum')) {
      console.warn(
        chalk.yellow(
          `警告：%s文件、%s方法,不推荐使用【枚举类型】做为返回类型，返回类型(returnType)推荐使用单个interface.`,
        ),
        file,
        _.get(path, ['paths', '0', 'operationId']),
      );
    }

    return schema;
  }

  const fileJson = _.get(genTypeSchema.genJsonData(), [file]) || {};
  const result = genTypeSchema.genJsonschema(fileJson, returnTypeSchema, { keySet: new Set(), refKeyTime: {} });

  return result as AnyOpt;
}
