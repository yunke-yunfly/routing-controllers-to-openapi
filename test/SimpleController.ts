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
    @Param('id', { required: true }) id: number,
    @UseMetadata() metadata: any,
  ): Promise<{ name: string }> {
    return name || 'success';
  }

  // 简单函数
  async jest1(): Promise<string> {
    return 'success';
  }
}
