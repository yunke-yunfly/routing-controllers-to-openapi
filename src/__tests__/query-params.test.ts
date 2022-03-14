import * as path from 'path';

import { genTsApiDoc, openapiValidate } from '../index';

beforeAll(() => {
    // Clears the database and adds some testing data.
    // Jest will wait for this promise to resolve before running tests.
    console.log = console.error = console.warn = () => { };
});

test('test @QueryParams', async () => {
    const file = path.join(__dirname, '../../test/QueryParamsController.ts');
    const { openapiv3 } = genTsApiDoc([file]);
    const res = await openapiValidate(openapiv3);
    expect(res).toBe(true);
});
