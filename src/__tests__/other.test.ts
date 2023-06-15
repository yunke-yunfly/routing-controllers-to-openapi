import * as path from 'path';

import { genTsApiDoc, getAst, openapiValidate } from '../index';

beforeAll(() => {
  // Clears the database and adds some testing data.
  // Jest will wait for this promise to resolve before running tests.
  process.env.REQUIRE_TYPE = 'routing-controllers';
});

test('ast生成', async () => {
  const file = path.join(__dirname, '../../test/SimpleController.ts');
  expect(getAst(file)).not.toBe(null);
});

test('过滤信息filterFiles', async () => {
  const file = path.join(__dirname, '../../test/SimpleController.ts');
  const { openapiv3 } = genTsApiDoc([file], {
    filterFiles: ['koa'],
  });
  const res = await openapiValidate(openapiv3);
  expect(res).toBe(true);
});

test('接口servers', async () => {
  const file = path.join(__dirname, '../../test/SimpleController.ts');
  const { openapiv3 } = genTsApiDoc([file], {
    servers: [
      {
        url: 'http://127.0.0.1:3000',
        description: '开发环境域名前缀',
      },
    ],
  });
  const res = await openapiValidate(openapiv3);
  expect(res).toBe(true);
});



