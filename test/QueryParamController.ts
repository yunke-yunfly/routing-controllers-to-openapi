interface AAA {
  // 单行注释
  aaa: string;
  bbb: BBB;
}

interface BBB {
  // 单行注释
  fff: string;
  /**
   * 多行注释
   *
   * @type {string}
   * @memberof BBB
   */
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
export default class QueryParamController {
  /**
   *
   *
   * @param {(string|number)} [simple1=1]  注释1
   * @param {number[]} simple2
   * @param {((number|string)[])} simple3
   * @param {Array<number>} simple4
   * @param {(Array<number|string>)} simple5
   * @param {Array<BBB>} simple6
   * @param {(Array<BBB&CCC>)} simple15
   * @param {(Array<BBB|CCC>)} simple7
   * @param {BBB[]} simple8
   * @param {((BBB|CCC)[])} simple9
   * @param {BBB} simple10 注释10
   * @param {Label} simple11
   * @param {Label[]} simple12
   * @param {(Array<Label|BBB>)} simple13
   * @param {string} simple14
   * @return {*}  {Promise<{name: string}>}
   * @memberof TestController
   */
  @Get('/queryparam/jest/:id')
  async jest(
    @QueryParam('simple1', { required: true }) simple1: string | number,
    @QueryParam('simple2') simple2: number[],
    @QueryParam('simple3') simple3: (number | string)[],
    @QueryParam('simple4') simple4: Array<number>,
    @QueryParam('simple5') simple5: Array<number | string>,
    @QueryParam('simple6') simple6: Array<BBB>,
    @QueryParam('simple15') simple15: Array<BBB & CCC>,
    @QueryParam('simple7') simple7: Array<BBB | CCC>,
    @QueryParam('simple8') simple8: BBB[],
    @QueryParam('simple9') simple9: (BBB | CCC)[],
    // 行内注释
    @QueryParam('simple10') simple10: BBB,
    @QueryParam('simple11') simple11: Label,
    @QueryParam('simple12') simple12: Label[],
    @QueryParam('simple13') simple13: Array<Label | BBB>,
    @QueryParam('simple14') simple14: string,
    @QueryParam('simple16') simple16: any,
    @QueryParam('sivmple17') simple17: never,
  ): Promise<{ name: string }> {
    return name || 'success';
  }

  @Get('/queryparam/jest1')
  async jest1(
    @QueryParam() params: any
  ): Promise<string> {
    return 'success';
  }

  @Get('/queryparam/enum')
  async jest2(
    @QueryParam() param1: CCC,
    @QueryParam() param2: Label
  ): Promise<string> {
    return 'success';
  }

  @Get('/queryparam/QueryParams')
  async jest3(
    @QueryParams() param: string,
  ): Promise<string> {
    return 'success';
  }

}
