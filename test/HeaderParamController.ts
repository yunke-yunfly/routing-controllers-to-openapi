
  /**
   * @Body
   *
   * @export
   * @class TestController
   */
  @JsonController('/header-param')
  export default class HeaderParamController {
    @Get('/jest')
    async jest(
      @HeaderParam('other4') other4: string,
    ): Promise<{ name: string }> {
      return name || 'success';
    }
  }
  