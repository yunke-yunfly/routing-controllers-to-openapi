/**
 * yundoc 生成api文档配置项
 *
 */
const path = require('path');

export default {
  routePrefix: '',
  controllers: [
    path.join(process.cwd(), process.env.TEST_ENV === 'test' ? 
    './example/controller/*' : 
    './src/controller/*'),
  ],
  outfile: path.join(process.cwd(), './openapi/openapiv3.json'),
  requiredType: 'typescript', // typescript | routing-controllers
  filterFiles: [],
  // responseSchema: {
  //   type: 'object',
  //   properties: {
  //     code: {
  //       type: 'number',
  //       description: '接口返回code码',
  //     },
  //     data: {
  //       $ref: '#Response',
  //     },
  //     msg: {
  //       type: 'string',
  //       description: '接口描述信息',
  //     },
  //   },
  //   required: ['code', 'data'],
  // },
};
