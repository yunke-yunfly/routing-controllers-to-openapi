import { HeaderParam, JsonController, BodyParam, Post } from 'routing-controllers';
export interface Response {
  // code返回码
  code: number;
  // 返回信息
  message: string;
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
  @Post('/test')
  async getTest(
    @HeaderParam('orgcode') orgcode: string,
    @BodyParam('name') name: string,
    @BodyParam('age') age: number,
  ): Promise<Response> {
    return {
      code: 0,
      message: 'success'
    }
  }
}