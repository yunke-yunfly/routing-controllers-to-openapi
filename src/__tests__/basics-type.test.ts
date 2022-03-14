import * as path from 'path';

import { genTsApiDoc, getAst, openapiValidate } from '../index';

beforeAll(() => {
  // Clears the database and adds some testing data.
  // Jest will wait for this promise to resolve before running tests.
  console.log = console.error = console.warn = () => {};
});


test('test basics types', async () => {
  const file = path.join(__dirname, '../../test/SimpleController.ts');
  const { openapiv3 } = genTsApiDoc([file]);
  const res = await openapiValidate(openapiv3);
  expect(res).toBe(true);
});



