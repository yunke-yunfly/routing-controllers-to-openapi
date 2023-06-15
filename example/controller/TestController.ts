import { HeaderParam, JsonController, BodyParam, Post } from 'routing-controllers';
export interface Response {
  // code返回码
  code: number;
  // 返回信息
  message: string;
}

export enum Label {
  LABEL_OPTIONAL = 1,
  LABEL_REQUIRED = 2,
  LABEL_REPEATED = 3,
}

interface Aaa {
  code: 'a' | 'b';
}

/**
 * 测试案例controller
 *
 * @export
 * @class TestController
 */
@JsonController('/example')
export default class ExampleController {
  /**
   * do something
   *
   * @param {string} orgcode 租户号
   * @param {string} name 姓名
   * @param {number} age 年龄
   * @returns {Promise<Response>}
   * @memberof ExampleController
   */
  @Post('/test/:id/:name')
  async getTest(
    @BodyParam('params') params: { name: string, age: Aaa },
  ): Promise<Response> {
    return {
      code: 0,
      message: 'success'
    }
  }
}