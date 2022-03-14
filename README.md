### DEMO

用于开发 npm 包的模板

## Feature

- Typescript 开箱即用
- 支持 commonjs 和 esm 两种模块输出
- CI 自动发包
- 拼写检查
- 代码格式化
- eslint 检查
- jest 测试
- commit 检查
- changelog 生成

## Usage

- 修改 `package.json` 中 `name`、`main`、`module`、`repository`、`author` 的值，其中 `main`、`module` 可不改；
- 删除原 README.md 内容，书写自己的 README.md；

### 说明

目录结构

```bash
|- dist // build生成目录
    |- xxx.cjs.js
    |- xxx.esm.js
    |- xxx.d.ts
|- src
    |- index.ts
    |- __tests__ # 测试目录
        |- index.test.ts
|- .babelrc
|- .editorconfig
|- .eslintignore
|- .eslintrc
|- .gitignore
|- .gitlab-ci.yml
|- commitlint.config.js // commit信息检查
|- package.json
|- README.md
|- rollup.config.js
|- tsconfig.json
```

```
"scripts": {
  "build": "rollup --config",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s", // 根据commit信息生成changelog
  "prepublishOnly": "npm run build" // 发布之前触发一次构建
},
```

### tsconfig.json

```
{
  "compilerOptions": {
    "rootDir": "./src", // 根目录
    "outDir": "./dist/", // 输出目录
    "module": "es2015", // 用来指定要使用的模板标准
    "target": "es5", // 用于指定编译之后的版本
    "strict": true, // 严格模式
    "allowJs": false, // 当为 false 时，不允许引入 .js 文件
    "noUnusedLocals": true, // 检查未使用的局部变量
    "removeComments": true, // 是否移除注释
    "declaration": true, // 生成声明文件
    "skipLibCheck": true, // 跳过 node_modules 中的声明文件检查
    "importHelpers": true, // 通过 tslib 引入 helper 函数，而不是内置到文件中，有利于减少代码体积
    "esModuleInterop": true, // 通过导入内容创建命名空间，实现 CommonJS 和 ES 模块之间的互操作性
    "resolveJsonModule": true, // 解析 json
    "moduleResolution": "node", // 按照 node 的规则去找文件
    "experimentalDecorators": true, // 装饰器
    "forceConsistentCasingInFileNames": true, // 文件名是否区分大小写，引入 foo.ts 和 引入 Foo.ts 不一样
    "emitDecoratorMetadata": true, // 参数 metadata
    "noEmitOnError": true, // 当出错时，则不编译
    "noUnusedParameters": false, // 未使用的参数
    "strictPropertyInitialization": false, // class 中属性声明必须赋值
    "sourceMap": false, // sourceMap 为 false
    "declarationDir": "." // .d.ts输出目录
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "src/__tests__"]
}
```

### 注意事项

使用 rollup 进行打包构建

```
export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        exports: 'named',
      },
      {
        file: pkg.module,
        format: 'es',
        exports: 'named',
      },
    ],
    plugins: [
      resolve(), // 用于帮助解析引入的第三方npm包，从node_modules下找模块
      json(), // 帮助解析json文件
      commonjs(), // 帮助将commonjs的npm转化成 es module 便于rollup进行处理，注意rollup只处理esm模块
      typescript({
        tsconfig: './tsconfig.json', // 解决插件没有应用tsconfig内的配置
      }),
      babel({ babelHelpers: 'bundled' }),
    ],
    external: [], // 默认引入的第三方库，会被打包到 bundle.js内，通过external['axios']可以将第三方包不打入 bundle.js，还是以外部依赖的方式引入
  },
];
```

输出 commonjs 与 esm 的目的是 esm 用于 web 端支持 tree-shaking 的构建工具

注意 output exports 这个参数，有不同的值，每个值控制的 export default 导出模块方式不一样

```
output: [
  {
    file: pkg.main,
    format: 'cjs',
    exports: 'named',
  },
  {
    file: pkg.module,
    format: 'es',
    exports: 'named',
  },
],
```

当我们有通过 exports default 导出的模块时，在 rollup 处理输出的时候会根据 exports 参数的值来进行不同的输出

```
// index.ts

export default demo;
```

exports: 'named' 输出：

```
// dist/index.cjs.js

Object.defineProperty(exports, '__esModule', { value: true });
exports.default = demo;
```

exports: 'default' 输出：

```
// dist/index.cjs.js

module.exports = demo;
```

这两种输出方式的包，在引入的时候是有区别的，具体如下

js 环境下

```
module.exports = demo导出的包
通过require('xxx') 引入，可以直接引入
而通过import导入则是undefined

exports.demo = demo导出的包
通过require('xxx').default 引入
import可以直接导入
```

ts 的环境下

typescript 是按 es 模块的方式来解析模块，如果依赖的模块是 commonjs 规范模块

```
esModuleInterop: false

module.exports = demo导出的包
通过require('xxx') 可以直接引入
而通过import导入则是undefined

exports.demo = demo导出的包
通过require('xxx').default 通过default引入
而通过import可以直接导入

esModuleInterop: true 开启参数，会将commonjs模块转化为es模块

module.exports = demo导出的包
通过require('xxx') 可以直接引入
而通过import也是可以直接导入

exports.demo = demo导出的包
通过require('xxx').default 通过default引入
而通过import可以直接导入
```

总结：如果在 ts 环境中能够控制 esModuleInterop 是为 true 的设置，则发布的 npm 包推荐通过 module.exports = demo 的方式导出；如果不能控制则推荐通过 exports.default = demo 方式导出;另外 exports: 'default'只允许模块有一个默认导出，不允许其它的 export 导出
