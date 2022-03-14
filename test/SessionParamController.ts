
  
  /**
   * @Body
   *
   * @export
   * @class TestController
   */
  @JsonController('/session-param')
  export default class SessionParamController {
    @Get('/jest')
    async jest(
      @SessionParam('other6') other6: string,
    ): Promise<{ name: string }> {
      return name || 'success';
    }
  }
  