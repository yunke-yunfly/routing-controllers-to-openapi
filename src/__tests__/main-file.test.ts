import * as path from 'path';

import {
  genOpenapiv3FromRoutingControllers,
  getConfig,
  getFilesFromControllersConfig,
  verificationResponseSchema,
  verificationServers,
  genOpenapiv3Files,
} from '../main';
import { openapiValidate } from '../index';
const fs = require('fs-extra')

beforeAll(() => {
  // Clears the database and adds some testing data.
  // Jest will wait for this promise to resolve before running tests.
  console.log = console.error = console.warn = () => { };
  process.env.TEST_ENV = 'test';
});

// getConfig
test('responseSchema.servers 正常空字段', async () => {
  expect(getConfig()).not.toBe(null);
});

test('test: 只采用用户传入的controllers配置', async () => {
  const config = getConfig({
    controllers: path.join(process.cwd(), './example/controller/*')
  })
  expect(config).not.toBe(null);
});

// verificationResponseSchema
test('responseSchema参数不为真', async () => {
  expect(verificationResponseSchema()).toBe(true);
});

test('responseSchema正常测试', async () => {
  expect(
    verificationResponseSchema({
      type: 'object',
      properties: {
        code: {
          type: 'number',
          description: '返回code码',
        },
        data: {
          $ref: '#Response',
        },
        message: {
          type: 'string',
          description: '描述信息',
        },
      },
      required: ['code', 'data'],
    }),
  ).toBe(true);
});

test('responseSchema.properties 参数不为真', async () => {
  expect(() =>
    verificationResponseSchema({
      type: 'object',
    }),
  ).toThrow(Error);
});

test('responseSchema.properties 参数不为object', async () => {
  expect(() =>
    verificationResponseSchema({
      type: 'object',
      properties: [],
    }),
  ).toThrow(Error);
});

test('responseSchema.properties 参数为object，但为空对象', async () => {
  expect(() =>
    verificationResponseSchema({
      type: 'object',
      properties: {},
    }),
  ).toThrow(Error);
});

test('responseSchema.properties.item 中无type或$ref字段', async () => {
  expect(() =>
    verificationResponseSchema({
      type: 'object',
      properties: {
        name: {
          description: '',
        },
      },
    }),
  ).toThrow(Error);
});

test('responseSchema.properties.item 中无有$ref字段，但值不等于#Response', async () => {
  expect(() =>
    verificationResponseSchema({
      type: 'object',
      properties: {
        name: {
          $ref: 'AAA',
          description: '',
        },
      },
    }),
  ).toThrow(Error);
});

test('responseSchema.required 为空数组', async () => {
  expect(() =>
    verificationResponseSchema({
      type: 'object',
      properties: {
        name: {
          $ref: '#Response',
          description: '',
        },
      },
      required: [],
    }),
  ).toThrow(Error);
});

test('responseSchema.required 为非字符串数组', async () => {
  expect(() =>
    verificationResponseSchema({
      type: 'object',
      properties: {
        name: {
          $ref: '#Response',
          description: '',
        },
      },
      required: [1],
    }),
  ).toThrow(Error);
});

test('responseSchema.required 正常字符串数组', async () => {
  expect(
    verificationResponseSchema({
      type: 'object',
      properties: {
        name: {
          $ref: '#Response',
          description: '',
        },
      },
      required: ['name'],
    }),
  ).toBe(true);
});

test('responseSchema.required 空数组', async () => {
  expect(
    verificationResponseSchema({}),
  ).toBe(true);
});

// verificationServers
test('responseSchema.servers 正常空字段', async () => {
  expect(verificationServers()).toBe(true);
});

test('responseSchema.servers 正常有时间传入', async () => {
  expect(
    verificationServers([
      {
        url: 'http://127.0.0.1:3000',
      },
    ]),
  ).toBe(true);
});

test('responseSchema.servers.item 没有url字段，或者url为空', async () => {
  expect(() =>
    verificationServers([
      {
        url: '',
      },
    ]),
  ).toThrow(Error);
});

test('responseSchema.servers.item url字段为真，但值不为字符串', async () => {
  expect(() =>
    verificationServers([
      {
        url: 1,
      },
    ]),
  ).toThrow(Error);
});

// getFilesFromControllersConfig
test('responseSchema.controllers 正常空字段', async () => {
  const file = path.join(__dirname, '../../test/**/*_Controller.ts');
  const paths = await getFilesFromControllersConfig(file);
  expect(paths.length).toBe(0);
});

test('responseSchema.controllers *正常路径', async () => {
  const file = path.join(__dirname, '../../test/*');
  const paths = await getFilesFromControllersConfig(file);
  expect(paths.length).toBe(16);
});

test('responseSchema.controllers 模糊匹配文件名为 Controller.ts 结尾', async () => {
  const file = path.join(__dirname, '../../test/**/*ParamsController.ts');
  const paths = await getFilesFromControllersConfig(file);
  expect(paths.length).toBe(3);
});

test('write OpenAPI data to file.', async () => {
  let openapidata = { "openapi": "3.0.3", "info": { "title": "routing-controllers-to-openapi", "description": "BFF端生成Api文档，并对接到middleman平台。", "version": "1.0.0", "contact": { "name": "zane", "email": "wangw19@mingyuanyun.com" } }, "tags": [{ "name": "ComplexController", "description": "基础类型测试 string|number|boolean|any|never" }, { "name": "SimpleController", "description": "基础类型测试 string|number|boolean|any|never" }, { "name": "TestController", "description": "描述1" }], "paths": { "/complex/jest": { "post": { "tags": ["ComplexController"], "summary": "jest", "description": "ComplexController.jest 基础类型测试 string|number|boolean|any|never ", "operationId": "ComplexController.post.jest.yxzdfsGKmD", "responses": { "200": { "description": "", "content": { "application/json": { "schema": { "type": "object", "properties": { "name": { "type": "string" } }, "required": ["name"] } } } } }, "parameters": [{ "name": "simple1", "in": "query", "description": "@QueryParam, 类型：object", "required": true, "schema": { "anyOf": [{ "type": "string" }, { "type": "number" }] } }, { "name": "simple2", "in": "query", "description": "@QueryParam, 类型：array", "required": true, "schema": { "type": "array", "items": { "type": "number" } } }, { "name": "simple3", "in": "query", "description": "@QueryParam, 类型：array", "required": true, "schema": { "type": "array", "items": { "anyOf": [{ "type": "number" }, { "type": "string" }] } } }, { "name": "simple4", "in": "query", "description": "@QueryParam, 类型：array", "required": true, "schema": { "type": "array", "items": { "type": "number" } } }, { "name": "simple5", "in": "query", "description": "@QueryParam, 类型：array", "required": true, "schema": { "type": "array", "items": { "anyOf": [{ "type": "number" }, { "type": "string" }] } } }, { "name": "simple6", "in": "query", "description": "@QueryParam, 类型：array", "required": true, "schema": { "type": "array", "items": { "$ref": "#/components/schemas/BBB" } } }, { "name": "simple15", "in": "query", "description": "@QueryParam, 类型：array", "required": true, "schema": { "type": "array", "items": { "allOf": [{ "$ref": "#/components/schemas/BBB" }, { "$ref": "#/components/schemas/CCC" }] } } }, { "name": "simple7", "in": "query", "description": "@QueryParam, 类型：array", "required": true, "schema": { "type": "array", "items": { "anyOf": [{ "$ref": "#/components/schemas/BBB" }, { "$ref": "#/components/schemas/CCC" }] } } }, { "name": "simple8", "in": "query", "description": "@QueryParam, 类型：array", "required": true, "schema": { "type": "array", "items": { "$ref": "#/components/schemas/BBB" } } }, { "name": "simple9", "in": "query", "description": "@QueryParam, 类型：array", "required": true, "schema": { "type": "array", "items": { "anyOf": [{ "$ref": "#/components/schemas/BBB" }, { "$ref": "#/components/schemas/CCC" }] } } }, { "name": "simple10", "in": "query", "description": "@QueryParam, 类型：object", "required": true, "schema": { "type": "object", "properties": { "aaa": { "type": "string" }, "bbb": { "$ref": "#/components/schemas/BBB" } }, "required": ["aaa", "bbb"], "additionalProperties": false } }, { "name": "simple11", "in": "query", "description": "@QueryParam, 类型：number", "required": true, "schema": { "type": "number", "enum": [1, 2, 3] } }, { "name": "simple12", "in": "query", "description": "@QueryParam, 类型：array", "required": true, "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Label" } } }, { "name": "simple13", "in": "query", "description": "@QueryParam, 类型：array", "required": true, "schema": { "type": "array", "items": { "anyOf": [{ "$ref": "#/components/schemas/Label" }, { "$ref": "#/components/schemas/BBB" }] } } }] } }, "/simple/jest/{id}": { "get": { "tags": ["SimpleController"], "summary": "jest方法", "description": "SimpleController.jest 基础类型测试 string|number|boolean|any|never ", "operationId": "SimpleController.get.jest.jaJSrPakNf", "responses": { "200": { "description": "", "content": { "application/json": { "schema": { "type": "object", "properties": { "name": { "type": "string" } }, "required": ["name"] } } } } }, "parameters": [{ "name": "simple1", "in": "query", "description": "简单注释1 (@QueryParam, 类型：string)", "required": true, "schema": { "type": "string" }, "example": "1" }, { "name": "simple2", "in": "query", "description": "@QueryParam, 类型：number", "required": true, "schema": { "type": "number" } }, { "name": "simple3", "in": "query", "description": "@QueryParam, 类型：boolean", "required": true, "schema": { "type": "boolean" } }, { "name": "simple4", "in": "query", "description": "@QueryParam, 类型：object", "required": true, "schema": { "type": "object" } }, { "name": "simple5", "in": "query", "description": "@QueryParam, 类型：object", "required": true, "schema": { "type": "object" } }, { "name": "id", "in": "path", "description": "@Param, 类型：string", "required": true, "schema": { "type": "string" } }] } }, "/test/get-user-info": { "post": { "tags": ["TestController"], "summary": "getUserInfo", "description": "TestController.getUserInfo 描述1 ", "operationId": "TestController.post.getUserInfo.YyMPabSrZG", "responses": { "200": { "description": "", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/ProjectData" } } } } } }, "parameters": [{ "name": "id", "in": "path", "description": "@Param, 类型：number", "required": true, "schema": { "type": "number" } }] } } }, "components": { "schemas": { "BBB": { "type": "object", "properties": { "ccc": { "type": "string" } }, "required": ["ccc"], "additionalProperties": false }, "CCC": { "type": "object", "properties": { "ddd": { "type": "string" } }, "required": ["ddd"], "additionalProperties": false }, "Label": { "type": "number", "enum": [1, 2, 3] }, "ProjectData": { "type": "object", "properties": { "id": { "type": "string" }, "unique_name": { "type": "string" }, "user_code": { "type": "string" }, "cache_control": { "type": "string" }, "name": { "type": "string" }, "create_time": { "type": "string" }, "update_time": { "type": "string" } }, "required": ["id", "unique_name", "user_code", "name", "create_time", "update_time"], "additionalProperties": false } } } }
  let outfile = path.join(__dirname, '../../openapi/test-openapiv3.json')
  genOpenapiv3Files(openapidata, outfile);
  const openapiv3 = fs.readJsonSync(outfile);
  const res = await openapiValidate(openapiv3);
  expect(res).toBe(true);
});

test('test controllers gen openapi.', async () => {
  process.env.TEST_ENV = 'test'
  const { isCheck } = await genOpenapiv3FromRoutingControllers()
  expect(isCheck).toBe(true);
});

