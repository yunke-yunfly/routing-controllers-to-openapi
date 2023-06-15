import * as path from 'path';

import { genPaths, genTags, handleSchema } from '../gen-openapi';

test('test genTags 空数组返回情况 ', async () => {
  const result = genTags([])
  expect(result).toStrictEqual([]);
});

test('test genPaths 空数组返回情况 ', async () => {
  const result = genPaths([])
  expect(result).toStrictEqual({ paths: {}, schemas: {} });
});

test('test handleSchema 空数参数返回情况', async () => {
  const result = handleSchema()
  expect(result).toStrictEqual({ schemas: {}, componentSchemas: {}, });
});

test('test handleSchema $ref 参数', async () => {
  const result = handleSchema({ $ref: 'aa' })
  expect(result).toStrictEqual({
    "componentSchemas": { },
    "schemas": {},
  });
});

test('test handleSchema schema 参数', async () => {
  const result = handleSchema({ schema: {} })
  expect(result).toStrictEqual({
    "componentSchemas":  {},
    "schemas":  {},
  });
});


