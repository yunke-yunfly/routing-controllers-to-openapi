/**
 * 基础类型测试 string|number|boolean|any|never
 *
 * @export
 * @class TestController
 */
@JsonController('/simple')
export default class {
  /**
   * jest方法
   *
   */
  @Get('/jest/:id')
  @Middleware()
  async jest(
    // 简单注释1
    @QueryParam('simple1', { required: true }) simple1: string = '1',
    @QueryParam('simple2') simple2: number,
    @QueryParam('simple3') simple3: boolean,
    @QueryParam('simple4') simple4: any,
    @QueryParam('simple5', { required: true }) simple5: never,
    @QueryParam('simple6') simple6: {name: string},
    @Param('id', { required: true }) id: number,
    @UseMetadata() metadata: any,
  ): Promise<{ name: string }> {
    return name || 'success';
  }

  // 简单函数
  async jest1(
    @QueryParams() opt: string
  ): Promise<string> {
    return 'success';
  }


  @Get('/jest2/:id')
  async jest2(
    @Param() id: string
  ): Promise<string> {
    return 'success';
  }


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
    @Param() id: string,
    @HeaderParam('orgcode') orgcode: string,
    @BodyParam('name') name: string,
    @BodyParam('age', { required: true }) age: number,
  ): Promise<Response> {
    return {
      code: 0,
      message: 'success'
    }
  }

}


// 动态controller路由
@JsonController('/simple/:id')
export default class {
  // 简单函数
  async jest1(): Promise<string> {
    return 'success';
  }
}