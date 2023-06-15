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
@JsonController('/queryparams')
export default class QueyParamsController {
  // 方法单行注释级别
  @Get('/jest')
  async jest(
    @QueryParams('simple1', { required: true }) simple1: string | number,
    @QueryParams('simple2') simple2: number[],
    @QueryParams('simple3') simple3: (number | string)[],
    @QueryParams('simple4') simple4: Array<number>,
    @QueryParams('simple5') simple5: Array<number | string>,
    @QueryParams('simple6') simple6: Array<BBB>,
    @QueryParams('simple15') simple15: Array<BBB & CCC>,
    @QueryParams('simple7') simple7: Array<BBB | CCC>,
    @QueryParams('simple8') simple8: BBB[],
    @QueryParams('simple9') simple9: (BBB | CCC)[],
    @QueryParams('simple10') simple10: AAA,
    @QueryParams('simple11') simple11: Label,
    @QueryParams('simple12') simple12: Label[],
    @QueryParams('simple13') simple13: Array<Label | BBB>,
    @QueryParams('simple14') simple14: string,
  ): Promise<{ name: string }> {
    return name || 'success';
  }
}
