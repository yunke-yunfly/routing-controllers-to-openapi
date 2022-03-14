import * as path from 'path';

import { genTsApiDoc, getAst, openapiValidate } from '../index';

beforeAll(() => {
    // Clears the database and adds some testing data.
    // Jest will wait for this promise to resolve before running tests.
    console.log = console.error = console.warn = () => { };
});

test('test Openapi错误数据格式验证', async () => {
    const res = await openapiValidate({});
    expect(res).toBe(false);
});

test('test ts文件地址有误', async () => {
    expect(() => genTsApiDoc([])).toThrowError(/files参数有误/);
});
