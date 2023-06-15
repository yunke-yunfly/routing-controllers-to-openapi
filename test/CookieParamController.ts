
  /**
   * @Body
   *
   * @export
   * @class TestController
   */
  @JsonController('/cookie-param')
  export default class CookieParamController {
    @Get('/jest')
    async jest(
      @CookieParam('other7') other7: string,
    ): Promise<{ name: string }> {
      return name || 'success';
    }
  }
  