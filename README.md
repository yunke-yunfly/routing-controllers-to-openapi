# routing-controllers-to-openapi

[![npm version](https://img.shields.io/npm/v/routing-controllers-to-openapi.svg)](https://www.npmjs.com/package/routing-controllers-to-openapi) 
![Test](https://github.com/yunke-yunfly/routing-controllers-to-openapi/workflows/Test/badge.svg)
[![codecov](https://codecov.io/gh/yunke-yunfly/routing-controllers-to-openapi/branch/master/graph/badge.svg)](https://codecov.io/gh/yunke-yunfly/routing-controllers-to-openapi)

routing-controllers项目构建时生成 openapi v3 schema。 <br/>
通过TS文件生成`AST语法树`，分析AST语法树生成`openapiv3`数据。进而导入到`postman`、`swagger` 等平台进行数据展示。

## 使用 

### 1. 安装依赖

```js
yarn add routing-controllers-to-openapi --dev
```

### 2. 新增script命令

```js
"scripts": {
  "gen-openapi": "gen-openapi",
}
```

### 3. 生成openapi数据

```js
yarn gen-openapi
```

## 案例

- Controller案例代码

```ts
import { HeaderParam, JsonController, BodyParam, Post } from 'routing-controllers';
export interface Response {
  // code返回码
  code: number;
  // 返回信息
  message: string;
}

/**
 * 测试案例controller
 *
 * @export
 * @class TestController
 */
@JsonController('/example')
export default class ExampleController {
  /**
   * do something
   *
   * @param {string} orgcode 租户号
   * @param {string} name 姓名
   * @param {number} age 年龄
   * @returns {Promise<Response>}
   * @memberof ExampleController
   */
  @Post('/test')
  async getTest(
    @HeaderParam('orgcode') orgcode: string,
    @BodyParam('name') name: string,
    @BodyParam('age') age: number,
  ): Promise<Response> {
    return {
      code: 0,
      message: 'success'
    }
  }
}
```

- generate openapi schema

```json
{
    "openapi": "3.0.3",
    "info": {
        "title": "routing-coontrollers-to-openapi-test",
        "description": "Buildtime OpenAPI v3 spec generation for routing-controllers",
        "version": "1.0.0"
    },
    "tags": [
        {
            "name": "ExampleController",
            "description": "测试案例controller"
        }
    ],
    "paths": {
        "/example/test": {
            "post": {
                "tags": [
                    "ExampleController"
                ],
                "summary": "do something",
                "description": "ExampleController.getTest 测试案例controller ",
                "operationId": "ExampleController.post.getTest.rhBCjZZSMY",
                "responses": {
                    "200": {
                        "description": "",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "code": {
                                            "type": "number",
                                            "description": "接口返回code码字段"
                                        },
                                        "data": {
                                            "type": "object",
                                            "properties": {
                                                "code": {
                                                    "type": "number",
                                                    "description": "code返回码"
                                                },
                                                "message": {
                                                    "type": "string",
                                                    "description": "返回信息"
                                                }
                                            },
                                            "required": [
                                                "code",
                                                "message"
                                            ],
                                            "additionalProperties": false
                                        },
                                        "msg": {
                                            "type": "string",
                                            "description": "接口返回信息字段"
                                        }
                                    },
                                    "required": [
                                        "code",
                                        "data"
                                    ]
                                }
                            }
                        }
                    }
                },
                "parameters": [
                    {
                        "name": "orgcode",
                        "in": "header",
                        "description": "租户号 (@HeaderParam, 类型：string)",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "requestBody": {
                    "description": "",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "type": "string",
                                        "description": "@BodyParam：姓名"
                                    },
                                    "age": {
                                        "type": "number",
                                        "description": "@BodyParam：年龄"
                                    }
                                },
                                "required": [
                                    "name",
                                    "age"
                                ]
                            }
                        }
                    }
                }
            }
        }
    },
    "components": {
        "schemas": {}
    }
}
```

## Config 配置

### 项目根目录下创建`yundoc.config.js`文件

```js
// yundoc.config.js
const path = require('path');
module.exports = {
  routePrefix: '/api', // routing-controllers路由前缀
  controllers: [path.join(process.cwd(), "./src/controller/*")],
  filterFiles: [],
  requiredType: 'typescript', // typescript | routing-controllers
  servers: [
    {
      url: 'http://127.0.0.1:3000',
      description: '开发环境域名前缀',
    }
  ],
  // 自定义统一 response 返回结构（可选）
  responseSchema: {
    type: 'object',
    properties: {
      code: {
        type: "number",
        description: "接口返回code码字段",
      },
      // data配置必填，格式固定请不要更改
      data: {
        $ref: "#Response",
      },
      msg: {
        type: "string",
        description: "接口返回信息字段",
      }
    },
    required: [
      "code",
      "data",
    ]
  }
}
```

## 参数说明

| 字段 | 类型 | 必填 |说明 |
| ------ | ------ |------ |------ |
| routePrefix | `string` | 否 | 路由前缀，跟`routing-controllers保持一致` |
| controllers | `string\|string[]` | 否 | 需要解析的controller文件或需要解析的controller文件夹，默认：`/src/controller/*`，可根据文件名匹配，例如: `/src/**/*Controller.ts`，备注： 必须是绝对路径 |
| requiredType | `typescript \| routing-controllers` | 否 | controller`参数必填`模式，默认使用`typescript` |
| filterFiles | `string[]` | 否 | 过滤解析的npm包或者ts文件 |
| outfile | `string` | 否 | openapi数据存放文件，备注：必须是绝对路径 |
| servers | `{url：string,description?:string}[]` | 否 | api根路由与描述 |
| responseSchema | `ResponseSchemaObject` | 否 | 返回数据包裹层数据格式，由于大部分BFF使用了内置的返回包裹，在controller级别无法解析，因此开发给使用方进行自定义。|
<br/>

### responseSchema 参数说明

responseSchema`严格遵循JsonSchema数据格式`

| 字段 | 类型 | 必填 |说明 |
| ------ | ------ |------ |------ |
| type | `string` | 是 | 值为`object`，固定值不要更改（描述当前schema数据类型） |
| properties | `{[prop:string]: {type?:string;$ref?:string;description?:string}}` | 否 | 当前对象的属性描述信息。 |
| required | `string[]` | 否 | 描述当前`object`的必填字段，若无必填字段则不需要此参数 |

<br/>

- properties 字段描述

| 字段 | 类型 | 必填 |说明 |
| ------ | ------ |------ |------ |
| type | `string` | 是 | 此处type只需要填写简单类型，例如：`string`,`number`,`boolean` |
| $ref | `string` | 是 | 此处为固定值：`#Response`, 不要更改 |
| description | `string` | 否 | 当前字段描述信息 |

> 备注： properties 中 `$ref` 和 `type`必须有一项为真。

<br/>

##  routing-controllers 支持项

[支持的类型解析列表](DOCS.md)

## 贡献

我们非常欢迎您的贡献，您可以通过以下方式与我们共建。

- 提交[GitHub 问题](https://github.com/yunke-yunfly/routing-controllers-to-openapi/issues)以报告错误或提出问题。
- 提出[拉取请求](https://github.com/yunke-yunfly/routing-controllers-to-openapi/pulls)以改进我们的代码。
- [贡献指南](CONTRIBUTING.md)。
