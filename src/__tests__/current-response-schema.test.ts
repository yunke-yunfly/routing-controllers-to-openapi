import * as path from 'path';

import { genTsApiDoc, getAst, openapiValidate } from '../index';

beforeAll(() => {
  // Clears the database and adds some testing data.
  // Jest will wait for this promise to resolve before running tests.
  console.log = console.error = console.warn = () => {};
});

test('test current response schema', async () => {
  const file = path.join(__dirname, '../../test/SimpleController.ts');
  const { openapiv3 } = genTsApiDoc([file], {
    responseSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
          description: '返回code码',
        },
        data: {
          $ref: '#Response',
        },
      },
      required: ['code', 'data'],
    },
  });
  const res = await openapiValidate(openapiv3);
  expect(res).toBe(true);
});


