# routing-controllers-to-openapi

## 支持的Api介绍

- [Controller装饰器支持](#Controller装饰器支持)
- [Method装饰器支持](#Method装饰器支持)
- [参数装饰器支持](#参数装饰器支持)
- [@Body装饰器支持类型](#@Body装饰器支持类型)
- [@BodyParam装饰器支持类型](#@BodyParam装饰器支持类型)
- [@Body,@BodyParam装饰器混用](#@Body,@BodyParam装饰器混用)
- [@QueryParams装饰器解析](#@QueryParams装饰架解析)
- [@QueryParam,@QueryParams混用](#@QueryParam,@QueryParams混用)
- [Response返回类型支持](#Response返回类型支持)
- [工具函数支持说明](#工具函数支持说明)
- [注释支持说明](#注释支持说明)
- [参数必填说明](#参数必填说明)
- [参数默认值说明](#参数默认值说明)
- [any|never|null类型说明](#any|never|null类型说明)
- [常见复杂类型解码](#常见复杂类型解码)
- [提示说明](#提示说明)

<br/>
<br/>

## Controller装饰器支持

1. 目前Controller装饰器只支持`Controller` 与 `JsonController` 装饰器。
2. Controller路由只支持静态路由，不支持动态路由。

- 支持

```ts
// 支持
@Controller('/main')

// 支持
@JsonController('/main')
```

- 不支持

```ts
// 动态Controller路由不支持
@JsonController('/main/:id')

// 非路由装饰器会被忽略
// 不支持
JWTMiddleware()
```

> 1. 非路由装饰器，则会被忽略

<br/>
<br/>

## Method装饰器支持

### * 仅支持以下请求装饰器

`@Get`、`@Post`、`@Put`、`@Patch`、`@Delete`、`@Head` <br/>

它们会会被相应的解析为以下HTTP请求类型

```js
@Get -> get
@Post -> post
@Put -> put
@Patch -> path
@Delete -> delete
@Head -> head
```

### * Method装饰器对动态路由的支持

```ts
// 支持
@Get('/test/:id')

// 支持
@Get('/test/:id/:name')

// 支持
@Get('/test/:id/com/:age')
```

备注：

> 1. 动态路由参数会动解析为path参数，并会被解析为必填参
> 2. 动态路由会跟`@Param`、`@Params`装饰器进行合并，从而解析出注释、默认值等信息

<br/>

### * 动态路由path参数展现形式

动态路由参数会被解析为`path`类型参数，展示形式为`路径参数`, 展示效果如下：

![](https://big-c.oss-cn-hangzhou.aliyuncs.com/cms/img/2021/08/05/aPWJ7xA52T1628146910290-1628146910290.png)

<br/>
<br/>

## 参数装饰器支持

### * 仅支持以下参数装饰器

1. `path`参数类型装饰器
`Param`、`Params`

2. `cookie`参数类型装饰器
`CookieParam`、`CookieParams`

3. `header`参数类型装饰器
`HeaderParam`、`HeaderParams`、`Session`、`SessionParam`

4. `query`参数类型装饰器
`QueryParam`、`QueryParams`、`State`、`UploadedFile`、`UploadedFiles`

5. `body`参数类型装饰器
`Body`、`BodyParam`

<br/>

### * 参数装饰器类别

参数装饰器会被分为 `path`、`cookie`、`header`、`query`、`body`

<br/>
<br/>

## @Body装饰器支持类型

> - 备注：以下内容同样适用于 `Params` `HeaderParams` `CookieParams` `Session` `State` `UploadedFiles`

<br/>

### * @Body装饰器（`强烈推荐`定义为`接口类型`）

```ts
interface BodyInterface{
    name: string;
    age: number;
}
// 支持 强烈推荐类型
@Body() body: BodyInterface             // 接口类型
```

<br/>

### * @Body装饰器支持以下类型，但`不推荐`使用

```ts
interface AAA {
    other1: string;
}
interface BBB {
    other2: string;
}

// 以下方式支持，但不推荐使用
@Body() body1: AAA | BBB,               // 联合类型
@Body() body2: AAA & BBB,               // 交叉类型
@Body() body3: Array<BBB>,              // 数组类型
@Body() body4: Array<BBB & AAA>,        // 数组类型
@Body() body5: Array<BBB | AAA>,        // 数组类型
@Body() body6: BBB[],                   // 数组类型
@Body() body7: (BBB | AAA)[],           // 数组类型
@Body() body8: (BBB & AAA)[],           // 数组类型
```

<br/>

### * @Body装饰器支持以下类型，但`强烈不推荐`使用

```ts
enum Label {
  LABEL_OPTIONAL = 1,
  LABEL_REQUIRED = 2,
  LABEL_REPEATED = 3,
}

// 以下方式支持，但强烈不推荐使用
@Body() body1: any,                          // any类型 它将被解析为object类型
@Body() body2: never,                        // never类型 它将被解析为object类型
@Body() body3: null,                         // null类型 它将被解析为object类型
@Body() body4: string,                       // 基础类型
@Body() body5: string | number,              // 基础类型
@Body() body6: Label,                        // 枚举类型
@Body() body7: number[],                     // 基础数组类型
@Body() body8: (number | string)[],          // 基础数组类型
@Body() body9: Array<number>,                // 基础数组类型
@Body() body10: Array<number | string>,      // 基础数组类型
@Body() body11: Label[],                     // 枚举数组类型
@Body() body12: Array<Label | string>,       // 枚举数组类型
```

<br/>
<br/>

## @BodyParam装饰器支持类型

> - 备注：以下内容同样适用于 `Param` `HeaderParam` `CookieParam` `SessionParam` `UploadedFile`

<br/>

### * @BodyParam装饰器（`强烈推荐`定义为`基础类型`）

```ts
type AAA = number;

// 支持 强烈推荐类型
@BodyParam('param1') param1: string,        // 基础类型string
@BodyParam('param2') param2: number,        // 基础类型number
@BodyParam('param3') param3: boolean,       // 基础类型boolean
@BodyParam('param4') param4: AAA,           // 基础类型number
```

<br/>

### * @BodyParam装饰器支持以下类型，但`不推荐`使用

```ts
enum Label {
  LABEL_OPTIONAL = 1,
  LABEL_REQUIRED = 2,
  LABEL_REPEATED = 3,
}

// 以下方式支持，但不推荐使用
@BodyParam('param1') param1: string | number,           // 联合类型
@BodyParam('param2') param2: Label,                     // 枚举类型
@BodyParam('param3') param3: Label|number,              // 基础联合类型
@BodyParam('param4') param4: string[],                  // 基础数组类型
@BodyParam('param5') param5: (string|boolean)[],        // 基础数组类型
@BodyParam('param6') param6: Array<string>,             // 基础数组类型
@BodyParam('param7') param7: Array<string|number>,      // 基础数组类型
```

<br/>

### * @BodyParam装饰器支持以下类型，但`强烈不推荐`使用

```ts
interface AAA {
    other1: string;
}
interface BBB {
    other2: string;
}

// 以下方式支持，但强烈不推荐使用
@BodyParam('param1') param1: any,                         // any类型 它将被解析为object类型
@BodyParam('param2') param2: never,                       // never类型 它将被解析为object类型
@BodyParam('param3') param3: null,                        // null类型 它将被解析为object类型
@BodyParam('param4') param4: AAA,                         // 接口类型
@BodyParam('param5') param5: AAA|BBB,                     // 接口联合类型
@BodyParam('param6') param6: AAA&BBB,                     // 接口交叉类型
@BodyParam('param7') param7: AAA[],                       // 接口数组类型
@BodyParam('param8') param8: (AAA|BBB)[],                 // 接口数组类型
@BodyParam('param9') param9: (AAA&BBB)[],                 // 接口数组类型
@BodyParam('param10') param10: Array<AAA>,                // 接口数组类型
@BodyParam('param11') param11: Array<AAA|BBB>,            // 接口数组类型
@BodyParam('param12') param12: Array<AAA&BBB>,            // 接口数组类型
```

<br/>
<br/>

## @Body,@BodyParam装饰器混用

- `@Body`装饰器实际上是`包含了` `@BoryParam`装饰器的参数，因此解析过程中会给出提示建议：`不推荐同时使用@Body与@BodyParam装饰器，请单独使用@Body或@BodyParam装饰器`。

- 实际处理过程中，会把所有的`@BoryParam`进行合并，合并为`interface`接口类型，再结合@Body参数处理为 `联合类型`。

处理案例：

```ts
interface AAA {
    param1: string;
    param2: string;
}
// method
@Post('/test')
async test(
    @Body() body1: AAA;
    @BodyParam("param1") param1: string,
    @BodyParam("param2") param2: string,
): Promise<string> {}

// 处理为
{
    "anyOf": [
        {
            "$ref": "#/definitions/AAA"
        },
        {
            "type": 'object',
            "properties": {
                "param1": {
                    "type":'string'
                },
                "param2": {
                    "type": 'string'
                } 
            }
        }
    ],
    "definitions": {
        "AAA": {
            "type": 'object',
            "properties": {
                "param1": {
                    "type":'string'
                },
                "param2": {
                    "type": 'string'
                } 
            }
        },
    }
}
```

- 备注

> 1. 对于同时使用`@Body`和`@BoryParam`，会被处理为联合类型，因此并`不推荐两者同时使用`，解析的`api参数会存在多余的情况`,从而带来困惑。

<br/>
<br/>

## @QueryParams装饰器解析

> - 备注：以下内容同样适用于 `Params` `HeaderParams` `CookieParams` `Session` `State` `UploadedFiles`

`非body类型参数`都会做`打平处理`，即`interface` 接口类型会被解析为`多个参数`。

### * 以下参数类型是等效的

```ts
interface AAA {
    param1: string;
    param2: string;
}

@Get('/test')
async test(
    @QueryParams() params: AAA,
): Promise<string> {}

// 等效于 

@Get('/test')
async test(
    @QueryParam('param1') param1: string,
    @QueryParam('param2') param2: string,
): Promise<string> {}
```

以上两种写法，解析出来的参数是等效的。

<br/>
<br/>

## @QueryParam,@QueryParams混用

- `@QueryParams` 装饰器 实际上是包含了`@QueryParam` 装饰器的参数, 由于`@QueryParams`装饰器会被打平，因此如果有相同的`参数key`,那么解析出来的数据参数就会有重复，从而导致数据校验不通过。

- 案例：

```ts
// 以下装饰器解析解析数据会报错，由于params2参数重复
interface AAA {
    params1: string;
    params2: string;    
}
@Get('/test')
async test(
    @QueryParams() params: AAA,
    @QueryParam('params2') params2: string,
    @QueryParam('params3') params3: string,
): Promise<string> {}
```

备注：
>
> - 当同时使用`@QueryParam`与 `@QueryParams` 装饰器时，不要有相同的`参数key`,不然会导致解析的数据校验不通过。

<br/>
<br/>

## Response返回类型支持

- 支持Promise与非Promise场景

```ts
interface Response {
    code: number;
    data: { name: string };
    msg: string;
}

// 支持非Promise场景解析
@Get('/test')
test(): Response {}                                   // 支持非Promise场景

// 支持Promise场景解析
@Get('/test')
async test(): Promise<Response> {}                    // 支持Promise场景
```

### * Response返回类型`强烈推荐`返回`接口类型`

```ts
interface Response {
    code: number;
    data: { name: string };
    msg: string;
}

// 支持 强烈推荐类型
@Get('/test')
async test(): Promise<Response> {}                      // 接口类型
```

<br/>

### * Response返回类型支持以下类型，但`不推荐`使用

```ts
interface AAA {
    other1: string;
}
interface BBB {
    other2: string;
}
enum Label {
  LABEL_OPTIONAL = 1,
  LABEL_REQUIRED = 2,
  LABEL_REPEATED = 3,
}

// 以下方式支持，但不推荐使用
async test(): Promise: <string> {}                          // 字符串类型
async test(): Promise: <string | number> {}                 // 基础联合类型
async test(): Promise: <Label> {}                           // 枚举类型
async test(): Promise: <number[]> {}                        // 基础数组类型
async test(): Promise: <(number | string)[]> {}             // 数组联合类型
async test(): Promise: <Array<number>> {}                   // 数组类型
async test(): Promise: <Array<number | string>> {}          // 数组类型
async test(): Promise: <Label[]> {}                         // 枚举数组类型
async test(): Promise: <Array<Label | string>> {}           // 枚举数组类型
async test(): Promise: <AAA | BBB> {}                       // 联合类型
async test(): Promise: <AAA & BBB> {}                       // 交叉类型
async test(): Promise: <Array<BBB>> {}                      // 数组类型
async test(): Promise: <Array<BBB & AAA>> {}                // 数组类型
async test(): Promise: <Array<BBB | AAA>> {}                // 数组类型
async test(): Promise: <BBB[]> {}                           // 数组类型
async test(): Promise: <(BBB | AAA)[]> {}                   // 数组类型
async test(): Promise: <(BBB & AAA)[]> {}                   // 数组类型
```

<br/>

### * Response返回类型支持以下类型，但`强烈不推荐`使用

```ts
// 以下方式支持，但强烈不推荐使用
async test(): Promise: <any>,                          // any类型 它将被解析为object类型
async test(): Promise: <never>,                        // never类型 它将被解析为object类型
async test(): Promise: <null>,                         // null类型 它将被解析为object类型
```

<br/>

### * Response 使用外层传入的Schema 嵌套

某些情况下routing-controllers搭建的Node框架，对`controller返回类型会做一个公共的处理`, 因此没有很好办法获取到准确的返回外层信息。 <br/>

在`yunke.config.js`中提供了`responseSchema`参数 [responseSchema详细配置说明](#使用)，来进行自定义的外层包裹。

### * 目前只支持成功状态下的type类型解析

<br/>
<br/>

## 工具函数支持说明

- 目前支持`Omit`,`Pick`,`Record`三个工具函数

<br/>
- `Omit`

```ts
type ToolFn_1 = Omit<{ a: number; b: string; c: boolean; }, "b">;

// 得到
{
  "type": "object",
  "properties": {
    "a": {
      "type": "number"
    },
    "c": {
      "type": "boolean"
    }
  },
  "required": [
    "a",
    "c"
  ]
}
```

<br/>

- `Pick`

```ts
type ToolFn_9 = Pick<{ a: number; b: string; c: boolean; }, "b">;

// 得到
{
  "type": "object",
  "properties": {
    "b": {
      "type": "string"
    }
  },
  "required": [
    "b"
  ]
}
```

<br/>

- `Record`

```ts
type ToolFn_13 = Record<"home" | "about" | "contact" | string, number>

// 得到
{
  "type": "object",
  "properties": {
    "home": {
      "type": "number"
    },
    "about": {
      "type": "number"
    },
    "contact": {
      "type": "number"
    }
  },
  "required": [
    "home",
    "about",
    "contact"
  ],
  "definitions": {},
  "additionalProperties": {
    "type": "number"
  }
}
```

<br/>
<br/>

## 注释支持说明

> - `vs code 编辑器`，推荐大家安装 `Document This` 插件，使用快捷键生成注释, 快捷键：Ctrl+Alt+D and again Ctrl+Alt+D 。

### 1. 注释支持类型

- 单行注释
- 多行注释

```ts
// 支持单行注释

/**
 * 
 * 支持多行注释
 * 
*/
```

### 2. interface 注释案例

```ts
interface AAA {
    // 姓名
    name: string;
    /**
     * 年龄
    */
    age: number;
}
```

### 3. interface 复杂注释

```ts
interface AAA {
    // @param {string} [name='zane'] 姓名
    name: string;
    /**
     * 年龄
     * @param {number} [age=25]
     */
    age: number;
}
```

### 4. method函数参数注释支持

- 行内注释

```ts
// -----简单注释----------

// 获得用户信息（方法名注释）
@Get('/test')
async getUserInfo(
    // 姓名  
    @QueryParam("name") name: string,
    /**
     * 年龄
     */
    @QueryParam("age") age: number,
): Promise<{name: string}> {}


// -----复杂注释----------

// 获得用户信息（方法名注释）
@Get('/test')
async getUserInfo(
    // @param {string} [name='zane'] 姓名  
    @QueryParam("name") name: string = 'zane',
    /**
     * 年龄
     * @param {number} [age=25]
     */
    @QueryParam("age") age: number = 25,
): Promise<{name: string}> {}
```

- 函数顶部注释

```ts
// -----简单注释----------

/**
 * 获得用户信息（方法名注释）
 * @param {string} name 姓名
 * @param {number} age 年龄
 */
@Get('/test')
async getUserInfo(
    @QueryParam("name") name: string,
    @QueryParam("age") age: number,
): Promise<{name: string}> {}


// -----复杂注释----------
/**
 * 获得用户信息（方法名注释）
 * @param {string} [name='zane'] 姓名
 * @param {number} [age=25] 年龄
 */
@Get('/test')
async getUserInfo(
    @QueryParam("name") name: string = 'zane',
    @QueryParam("age") age: number = 25,
): Promise<{name: string}> {}
```

### 5. 块级注释 method 描述支持

```ts
// -----简单注释----------

/**
 * 获得用户信息（方法名注释）
 * @description 方法级别的描述信息
 * @param {string} name 姓名
 * @param {number} age 年龄
 */
@Get('/test')
async getUserInfo(
    @QueryParam("name") name: string,
    @QueryParam("age") age: number,
): Promise<{name: string}> {}
```

### 6. 注释优先级说明

interface注释  > 函数顶部注释 > 方法行内注释

<br/>
<br/>

## 参数必填说明

- 参数必填支持两种模式

> 1. typescript
> 2. routing-controllers

### 1. 依赖于Ts `interface` 本身的必填与非必填

```ts
interface AAA {
    name: string;
    age?: number;
}
```

解析以上代码结果如下：

- name: 必填
- age: 非必填

<br/>

- 更复杂的常见

```ts
interface BBB {
    attr4: string;
    attr5?: string;
}
interface CCC {
    attr6: string;
    attr7?: string;
}
interface AAA {
    attr1: string;
    attr2: BBB;
    attr3?: CCC;
}
```

解析以上代码结果如下：

- attr1: 必填
- attr4：必填
- attr5：非必填
- attr6：非必填
- attr7：非必填

<br/>

### 2. 依赖于`routing-controllers`自带的`{required}`参数

```ts
@Get('/test')
async test(
    @QueryParam("name",{required: true}) name: string,
    @QueryParam("age") age: number,
): Promise<{name: string}> {}
```

解析以上代码结果如下：

- name: 必填
- age: 非必填

```ts
interface AAA {
  some1: string;
  some2?: number;
}

@Get('/test')
async test(
    @QueryParams() parames: AAA;
    @QueryParam("name",{required: true}) name: string,
    @QueryParam("age") age: number,
): Promise<{name: string}> {}
```

解析以上代码结果如下：

- some1: 必填
- some2: 非必填
- name: 必填
- age: 非必填

### 3. 必填优先级说明

interface > required

<br/>
<br/>

## 参数默认值说明

> - 默认值支持单行注释和多行注释

### 1. interface 赋默认值

```ts
interface AAA {
    // @param {string} [name='zane'] 用户
    name: string;
    /**
     * @param {number} [age=25] 年龄
     */
    age: number;
}
```

解析以上代码解析默认值结果如下：

- name: zane
- age: 25

### 2.  method函数行内参数默认值

```ts
@Get('/test')
async test(
    @QueryParam("name",{required: true}) name: string='zane',
    @QueryParam("age") age: number=25,
): Promise<{name: string}> {}
```

解析以上代码解析默认值结果如下：

- name: zane
- age: 25

### 3.  method函数行内参数备注获取默认值

```ts
@Get('/test')
async test(
    // @param {string} [name='zane'] 用户
    @QueryParam("name",{required: true}) name,
    /**
     * @param {number} [age=25] 年龄
     */
    @QueryParam("age") age,
): Promise<{name: string}> {}
```

解析以上代码解析默认值结果如下：

- name: zane
- age: 25

### 4. 函数顶部注释获得默认值

```ts
/**
 * 获得用户信息
 * @param {string} [name='zane'] 姓名
 * @param {number} [age=25] 年龄
 */
@Get('/test')
async getUserInfo(
    @QueryParam("name") name: string = 'zane',
    @QueryParam("age") age: number = 25,
): Promise<{name: string}> {}
```

解析以上代码解析默认值结果如下：

- name: zane
- age: 25

### 5. interface 获得默认值

```ts
interface AAA {
    // @param {string} [name='zane'] 用户
    name: string;
    /**
     * @param {number} [age=25] 年龄
     */
    age: number;
}
/**
 * 获得用户信息
 */
@Get('/test')
async getUserInfo(
    @QueryParams() name: AAA,
): Promise<{name: string}> {}
```

解析以上代码解析默认值结果如下：

- name: zane
- age: 25

### 5. 默认值优先级

参数默认赋值 > interface > 顶部注释 > 行内注释

<br/>
<br/>

## any|never|null类型说明

- `any`,`never`,`null` 三种类型都会被转换为`object`类型， 即`{type:'object'}`, 不会有属性。

### 1. `any` 类型

any类型代表任意类型，此种情况下，解释器并不知道你需要解析为什么类型，因此只能解析为object类型，解析为任意其他类型都会有误判。因此不建议 参数/返回值等出现any类型。

### 2. `never` 类型

`never` 类型代表从来不会出现的值的类型, 由于openapi中必须有一个类型，因此此处解析为 object 类型。不推荐项目中使用此类型。

### 3. `null` 类型

`null`类型本质上还是属于object, 由于openapi中不存在null类型，因此解析为object类型。不推荐项目中使用此类型。

<br/>
<br/>

## 常见复杂类型解码

### 1. 联合类型

```ts
interface A {
  name: string;
}
interface B {
  name1: string
}

interface SomeInterface {
  attr: A|B
}
```

将被解析为：

```ts
{
  "type": "object",
  "properties": {
    "attr": {
      "anyOf": [
        {
          "$ref": "#/definitions/A"
        },
        {
          "$ref": "#/definitions/B"
        }
      ]
    }
  },
  "required": [
    "attr"
  ],
  "definitions": {
    "A": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        }
      },
      "required": [
        "name"
      ]
    },
    "B": {
      "type": "object",
      "properties": {
        "name1": {
          "type": "string"
        }
      },
      "required": [
        "name1"
      ]
    }
  }
}
```

### 2. 交叉类型

```ts
interface A {
  name: string;
}
interface B {
  name1: string
}
interface SomeInterface {
  attr: A&B
}
```

将被解析为：

```ts
{
  "type": "object",
  "properties": {
    "attr": {
      "allOf": [
        {
          "$ref": "#/definitions/A"
        },
        {
          "$ref": "#/definitions/B"
        }
      ]
    }
  },
  "required": [
    "attr"
  ],
  "definitions": {
    "A": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        }
      },
      "required": [
        "name"
      ]
    },
    "B": {
      "type": "object",
      "properties": {
        "name1": {
          "type": "string"
        }
      },
      "required": [
        "name1"
      ]
    }
  }
}
```

### 3. 联合数组类型

```ts
interface A {
  name: string;
}
interface B {
  name1: string
}
interface SomeInterface {
  attr: Array<A&B>
}
```

将被解析为：

```ts
{
  "type": "object",
  "properties": {
    "attr": {
      "type": "array",
      "items": {
        "allOf": [
          {
            "$ref": "#/definitions/A"
          },
          {
            "$ref": "#/definitions/B"
          }
        ]
      }
    }
  },
  "required": [
    "attr"
  ],
  "definitions": {
    "A": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        }
      },
      "required": [
        "name"
      ]
    },
    "B": {
      "type": "object",
      "properties": {
        "name1": {
          "type": "string"
        }
      },
      "required": [
        "name1"
      ]
    }
  }
}
```

### 4. interface 深度嵌套

```ts
interface A {
  name: string;
  attr: B;
}
interface B {
  name1: string;
}
interface SomeInterface {
  attr: A
}
```

将被解析为：

```ts
{
  "type": "object",
  "properties": {
    "attr": {
      "$ref": "#/definitions/A"
    }
  },
  "required": [
    "attr"
  ],
  "definitions": {
    "A": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "attr": {
          "$ref": "#/definitions/B"
        }
      },
      "required": [
        "name",
        "attr"
      ]
    },
    "B": {
      "type": "object",
      "properties": {
        "name1": {
          "type": "string"
        }
      },
      "required": [
        "name1"
      ]
    }
  }
}
```

### 5. 枚举类型

#### 数字枚举

```ts
enum Enum_3 {
  Up = 1,
  Down,
  Left,
  Right,
}
```

将被解析为：

```ts
{
  "enum": [
    1,
    2,
    3,
    4,
  ],
  "type": "number",
}
```

#### 字符串枚举

```ts
enum Enum_1 {
  A = 'A',
  B = 'B',
  C = 'C',
}
```

将被解析为：

```ts
{
  "enum": [
    "A",
    "B",
    "C",
  ],
  "type": "string",
}
```

#### 计算枚举

```ts
enum Enum_6 {
  A = 1,
  B = A * 2,
  C = A * B + A,
  D = 1 << 2,
}
```

将被解析为：

```ts
{
  "enum": [
    1,
    2,
    3,
    4,
  ],
  "type": "number",
}
```

### 6. 类型为一个或多个固定值，将会被解析为枚举

单个值

```ts
interface SomeInterface {
  attr: '1'
}
```

将被解析为：

```ts
{
  "type": "object",
  "properties": {
    "attr": {
      "type": "string",
      "enum": [
        "1"
      ]
    }
  },
  "required": [
    "attr"
  ]
}
```

多个值

```ts
interface SomeInterface {
  attr: '1'|'2'|'3'
}
```

将被解析为：

```ts
{
  "type": "object",
  "properties": {
    "attr": {
      "type": "string",
      "enum": [
        "1",
        "2",
        "3"
      ]
    }
  },
  "required": [
    "attr"
  ]
}
```

### 7. 复杂类型的多值场景

```ts
interface A {
  name: string;
  attr: B;
}
interface B {
  name1: string;
}
enum Label {
  LABEL_OPTIONAL = 1,
  LABEL_REQUIRED = 2,
  LABEL_REPEATED = 3,
}

interface SomeInterface {
  attr: '1' | '2' | '3' | true | 1 | Label | Array<A | B>
}
```

将被解析为：

```ts
{
  "type": "object",
  "properties": {
    "attr": {
      "anyOf": [
        {
          "$ref": "#/definitions/Label"
        },
        {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "$ref": "#/definitions/A"
              },
              {
                "$ref": "#/definitions/B"
              }
            ]
          }
        },
        {
          "enum": [
            "1",
            "2",
            "3",
            true,
            1
          ]
        }
      ]
    }
  },
  "required": [
    "attr"
  ],
  "definitions": {
    "Label": {
      "type": "number",
      "enum": [
        1,
        2,
        3
      ]
    },
    "A": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "attr": {
          "$ref": "#/definitions/B"
        }
      },
      "required": [
        "name",
        "attr"
      ]
    },
    "B": {
      "type": "object",
      "properties": {
        "name1": {
          "type": "string"
        }
      },
      "required": [
        "name1"
      ]
    }
  }
}
```

### 8. namespace 的解析

```ts
export namespace NameSpaceParent {
  export namespace NameSpacechild {
    export namespace NameSpacechildren {
      export interface A {
        name: string;
        attr: NameSpaceParent.NameSpacechild.NameSpacechildren.B;
      }
      export interface B {
        name1: string;
      }
      export enum Label {
        LABEL_OPTIONAL = 1,
        LABEL_REQUIRED = 2,
        LABEL_REPEATED = 3,
      }
    }
  }
}
interface SomeInterface {
  attr: '1' | '2' | '3' | true | 1 | NameSpaceParent.NameSpacechild.NameSpacechildren.Label | Array<NameSpaceParent.NameSpacechild.NameSpacechildren.A | NameSpaceParent.NameSpacechild.NameSpacechildren.B>
}
```

将被解析为：

```ts
{
  "type": "object",
  "properties": {
    "attr": {
      "anyOf": [
        {
          "$ref": "#/definitions/NameSpaceParent.NameSpacechild.NameSpacechildren.Label"
        },
        {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "$ref": "#/definitions/NameSpaceParent.NameSpacechild.NameSpacechildren.A"
              },
              {
                "$ref": "#/definitions/NameSpaceParent.NameSpacechild.NameSpacechildren.B"
              }
            ]
          }
        },
        {
          "enum": [
            "1",
            "2",
            "3",
            true,
            1
          ]
        }
      ]
    }
  },
  "required": [
    "attr"
  ],
  "definitions": {
    "NameSpaceParent.NameSpacechild.NameSpacechildren.Label": {
      "type": "number",
      "enum": [
        1,
        2,
        3
      ]
    },
    "NameSpaceParent.NameSpacechild.NameSpacechildren.A": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "attr": {
          "$ref": "#/definitions/NameSpaceParent.NameSpacechild.NameSpacechildren.B"
        }
      },
      "required": [
        "name",
        "attr"
      ]
    },
    "NameSpaceParent.NameSpacechild.NameSpacechildren.B": {
      "type": "object",
      "properties": {
        "name1": {
          "type": "string"
        }
      },
      "required": [
        "name1"
      ]
    }
  }
}
```

<br/>
<br/>

## 提示说明

> - 框架会对常见的类型进行一定的提示，并推荐优化
> - 所有能提示的类型都会被正确解析，由于UI界面解析规则，或者业务逻辑本身的规则，某些提示类是无法正常的展示的。

<br/>

### 例如：`@QueryParams` 使用较复杂的数组类型

```ts
interface AAA {
    name: string;
}

@Get('/test')
async test(
  @QueryParam("name") name: AAA[],
): Promise<{name: string}> {}
```

此种场景能正确的解析， 但不能正常的UI展示，从逻辑层面来讲，`@QueryParam` 本身就应该是简单的基础类型。

<br/>

### 例如： `any`,`never` 类型将会被解析为 `object`

```ts
@Get('/test')
async test(
  @QueryParam("name") name: any,
): Promise<{name: string}> {}
```

此种情况下，解析器并不知道你需要把 `name` 定义为什么类型， 因此只能解析为`object`类型， 但从逻辑层面来讲，`@QueryParam` 本身就应该是简单的基础类型，不应该为`object`类型， 这会给查看该接口的人带来困惑。

<br/>

### `@Body` `@QueryParam` 等定义为基础类型

```ts
@Get('/test')
async test(
  @QueryParams() name: string,
): Promise<{name: string}> {}

@Post('/test')
async test(
  @Body() name: string,
): Promise<{name: string}> {}
```

从逻辑层面，routing-controllers 层面出发， `@QueryParams`,`@Body`装饰器本身就应该定义为复杂类型，或者interface类型，不应该定义为简单的基础类型， 这会给查看该接口的人带来困惑。

<br/>

### 还有很多其他场景

- `@Body`,`@BodyParam` 不应该混合使用， 原因：`@Body`本就应该包含所有的`@BodyParam`, 这会导致解析的接口有重复参数，进而给查看该接口的人带来困惑。

- 相同的道理 `Param`与`Params`, `QueryParam`与`QueryParams`, `HeaderParam`与`HeaderParams`, `CookieParam`与`CookieParams`, `Session`与`SessionParam`, `UploadedFile`与`UploadedFiles`。

还有其他等很多提示，这里就不一一列举，都会在编译过程中进行提示。

<br/>
<br/>

## 更多的Ts类型解析

参考：[`fast-typescript-to-jsonschema`](https://github.com/yunke-yunfly/fast-typescript-to-jsonschema)

<br/>
<br/>
