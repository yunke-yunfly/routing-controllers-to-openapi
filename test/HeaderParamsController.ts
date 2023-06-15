interface AAA {
    aaa: string;
    bbb: BBB;
  }
  
  interface BBB {
    ccc: string;
  }
  
  interface CCC {
    ddd: string;
  }
  
  export enum Label {
    LABEL_OPTIONAL = 1,
    LABEL_REQUIRED = 2,
    LABEL_REPEATED = 3,
  }
  
  /**
   * @Body
   *
   * @export
   * @class TestController
   */
  @JsonController('/header-params')
  export default class HeaderParamsController {
    @Get('/jest')
    async jest(
      @HeaderParams('other3') other3: string,
    ): Promise<{ name: string }> {
      return name || 'success';
    }
  }
  