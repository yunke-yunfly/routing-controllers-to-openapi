interface AAA {
  aaa: string;
  bbb: BBB;
}

interface BBB {
  // 注释
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
@JsonController('/response')
export default class ResponseController {
  // 单行注释
  @Get('/response0')
  async jest1(): Promise<any> {
    return name || 'success';
  }

  /**
   * 多行注释
   *
   * @return {*}  {Promise<never>}
   * @memberof TestController
   */
  @Get('/response1')
  async jest2(): Promise<never> {
    return name || 'success';
  }

  @Get('/response2')
  async jest3(): Promise<string> {
    return name || 'success';
  }

  @Get('/response3')
  async jest4(): Promise<string | number> {
    return name || 'success';
  }

  @Get('/response4')
  async jest5(): Promise<string[]> {
    return name || 'success';
  }

  @Get('/response5')
  async jest6(): Promise<(string | number)[]> {
    return name || 'success';
  }

  @Get('/response6')
  async jest7(): Promise<Array<string>> {
    return name || 'success';
  }

  @Get('/response7')
  async jest8(): Promise<Array<string | number>> {
    return name || 'success';
  }

  @Get('/response8')
  async jest9(): Promise<Label> {
    return name || 'success';
  }

  @Get('/response9')
  async jest10(): Promise<AAA> {
    return name || 'success';
  }

  @Get('/response10')
  async jest11(): Promise<BBB | CCC> {
    return name || 'success';
  }

  @Get('/response11')
  async jest12(): Promise<BBB & CCC> {
    return name || 'success';
  }

  @Get('/response12/:id')
  jest13(@QueryParam('id') id: string): string {
    return name || 'success';
  }
}
