
  
  /**
   * @Body
   *
   * @export
   * @class TestController
   */
  @JsonController('/cookie-params')
  export default class CookieParamsController {
    @Get('/jest')
    async jest(
      @CookieParams('other8') other8: string,
    ): Promise<{ name: string }> {
      return name || 'success';
    }
  }
  