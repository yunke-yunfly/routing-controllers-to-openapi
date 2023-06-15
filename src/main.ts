import * as path from 'path';
import _ from 'lodash';
import { strict as assert } from 'assert';
import type { AnyOpt, InterfaceConfig, InterfaceSchema, InterfaceServers, Openapiv3Config, PropertiesConfigItem } from './types';
import { genTsApiDoc, openapiValidate } from '.';
import type { AnyOption } from 'fast-typescript-to-jsonschema/dist/types';

const chalk = require('chalk');
const fs = require('fs-extra');
const glob = require('glob')


/**
 * openapi数据写入文件中
 *
 * @export
 * @param {Openapiv3Config} openapiv3
 */
export function genOpenapiv3Files(openapiv3: Openapiv3Config, outfile: string) {
  fs.outputJsonSync(outfile, openapiv3);
}

/**
 * 通过routing controller生成api文档
 *
 * @export
 */
export async function genOpenapiv3FromRoutingControllers(options: AnyOption = {}) {
  console.log(chalk.blue('\r\n### -------- Yundoc: 开始执行生成api文档数据。---------\r\n'));
  const begin = Date.now();

  const config = getConfig();
  // config 配置验证
  verificationDefaultConfig(config);

  const { routePrefix, controllers, responseSchema, servers, filterFiles, outfile, requiredType } = config;
  // responseSchema 参数校验
  verificationResponseSchema(responseSchema);
  // servers 参数验证
  verificationServers(servers);
  // 获得所有需要编译的router文件
  const files = await getFilesFromControllersConfig(controllers);

  // 生成openapi数据
  const result = genTsApiDoc(files, {
    routePrefix,
    responseSchema,
    filterFiles,
    servers,
    requiredType,
  });

  const time = Date.now() - begin;
  const consuming = time > 1000 ? `${parseInt(`${time / 1000}`, 10)}s` : `${time}ms`;
  console.log(chalk.blue(`\r\n### ----- Yundoc: openapiv3数据生成成功, 整体耗时: ${consuming}。-----\r\n`))

  // openapiv3数据验证
  const isCheck = await openapiValidate(_.cloneDeep(result.openapiv3));

  // 写入文件
  genOpenapiv3Files(result.openapiv3, outfile);

  return {
    isCheck,
    result
  };
}


/**
 * responseSchema 数据验证
 *
 * @param {InterfaceSchema} responseSchema
 * @return {*}  {boolean}
 */
export function verificationResponseSchema(responseSchema?: InterfaceSchema): boolean {
  if (!responseSchema) {
    return true;
  }

  assert.equal(
    Object.prototype.toString.call(responseSchema) !== '[object Object]',
    false,
    'responseSchema参数必须为对象!'
  )

  if (responseSchema && !Object.keys(responseSchema).length) {
    return true;
  }

  const { type, properties, required } = responseSchema;

  assert.equal(
    type !== 'object',
    false,
    'responseSchema.type 值必须为object!'
  )


  if (
    !properties ||
    Object.prototype.toString.call(properties) !== '[object Object]' ||
    !Object.keys(properties).length
  ) {
    throw Error(`responseSchema.properties 类型必须为object类型,且不能为空！`);
  }

  Object.keys(properties).forEach((item: string) => {
    const propItem: PropertiesConfigItem = properties[item];
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { type, $ref } = propItem;
    if (!type && !$ref) {
      throw Error(`responseSchema.properties 中每个item必须包含type或者$ref中的一个字段！`);
    }
    if ($ref && $ref !== '#Response') {
      throw Error(`responseSchema.properties 中$ref字段的值必须为#Response！`);
    }
  });

  if (required && !required.length) {
    throw Error(`responseSchema.required 不能为空数组！`);
  }

  if (required) {
    required.forEach((item) => {
      if (typeof item !== 'string') {
        throw Error(`responseSchema.required 必须为字符串数组！`);
      }
    });
  }

  return true;
}

/**
 * servers 数据验证
 *
 * @param {InterfaceServers} [servers]
 * @return {*}  {boolean}
 */
export function verificationServers(servers?: InterfaceServers[]): boolean {
  if (!servers) {
    return true;
  }

  assert.equal(
    servers && !Array.isArray(servers),
    false,
    'servers参数必须为数组类型!'
  )

  assert.equal(
    servers && !servers.length,
    false,
    'servers参数不能为空数组!'
  )

  servers.forEach((item: InterfaceServers) => {
    if (!item.url) {
      throw Error(`servers 中每个item url参数不能为空！`);
    }
    if (typeof item.url !== 'string') {
      throw Error(`servers 中每个item url参数必须为字符串！`);
    }
  });

  return true;
}


/**
 * 验证config配置
 *
 * @export
 * @param {InterfaceConfig} config
 */
export function verificationDefaultConfig(config: InterfaceConfig) {
  const { controllers, filterFiles, outfile, requiredType } = config;

  assert.equal(
    !outfile || typeof (outfile),
    'string',
    '请正确填写yundoc.config.js中的outfile配置!'
  )
  assert.equal(
    !controllers || (Array.isArray(controllers) && !controllers.length),
    false,
    '请正确填写yundoc.config.js中的controllers配置!'
  )
  assert.equal(
    filterFiles && !Array.isArray(filterFiles),
    false,
    '请正确填写yundoc.config.js中的filterFiles配置, filterFiles必须为字符串数组!'
  )
  assert.equal(
    typeof (requiredType) !== 'undefined' && !['typescript', 'routing-controllers'].includes(requiredType),
    false,
    '请正确填写yundoc.config.js中的requiredType配置有误!'
  )
}

/**
 * 获得yundoc配置项
 *
 * @return {*}
 */
export function getConfig(option: AnyOpt = {}): InterfaceConfig {
  let projectYundocConfig: AnyOpt = option;
  try {
    projectYundocConfig = require(path.join(process.cwd(), './yundoc.config.js'));
  } catch (err: any) {
    if (/Cannot.+find.+module.+yundoc\.config\.js/.test(err.details || err.message)) {
      console.warn(chalk.yellow(`没有：根目录/yundoc.config.js 文档配置文件（可忽略配置）`));
    }
    else {
      /* istanbul ignore next */
      throw err;
    }
  }

  const defaultYundocConfig = require(path.join(__dirname, './config/yundoc.config')).default;

  // 只采用用户传入的controllers配置
  if (projectYundocConfig.controllers) {
    delete defaultYundocConfig.controllers;
  }

  return _.merge(defaultYundocConfig, projectYundocConfig);
}

/**
 * 获得需要生成openapi文档的文件列表
 *
 * @param {(string | string[])} controllers
 * @return {*}  {Promise<string[]>}
 */
export async function getFilesFromControllersConfig(
  controllers: string | string[],
): Promise<string[]> {
  if (typeof controllers === 'string') {
    // eslint-disable-next-line no-param-reassign
    controllers = [controllers];
  }

  const result: string[] = controllers.reduce(
    (controllerPaths: string[], controllerConfigPath: string) => {
      if (typeof controllerConfigPath === 'string' && controllerConfigPath.length) {
        // eslint-disable-next-line no-param-reassign
        controllerPaths = controllerPaths.concat(glob.sync(controllerConfigPath));
      }
      return controllerPaths
    },
    []
  );

  return [...new Set(result)];
}
