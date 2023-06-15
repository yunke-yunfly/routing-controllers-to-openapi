import * as path from 'path';

import { handleMethodDesc, handleReturnType } from '../gen-schema';

test('test handleMethodDesc 空数据返回情况 ', async () => {
  const result = handleMethodDesc({})
  expect(result).toStrictEqual({});
});

test('test handleReturnType 入参格式错误情况 ', async () => {
  const result = handleReturnType({ returnType: '' }, '')
  expect(result).toStrictEqual({});
});



