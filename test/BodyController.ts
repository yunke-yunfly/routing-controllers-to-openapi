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
@JsonController('/body')
export default class BodyController {
  @Post('/test')
  async jest(
    @Body('simple18') simple18: any,
    @Body('simple0') simple0: string,
    @Body('simple1') simple1: string | number,
    @Body('simple2') simple2: number[],
    @Body('simple3') simple3: (number | string)[],
    @Body('simple4') simple4: Array<number>,
    @Body('simple5') simple5: Array<number | string>,
    @Body('simple6') simple6: Array<BBB>,
    @Body('simple15') simple15: Array<BBB & CCC>,
    @Body('simple7') simple7: Array<BBB | CCC>,
    @Body('simple8') simple8: BBB[],
    @Body('simple9') simple9: (BBB | CCC)[],
    @Body('simple16') simple16: (BBB & CCC)[],
    @Body('simple10') simple10: AAA,
    @Body('simple17') simple17: BBB | CCC,
    @Body('simple18') simple18: BBB & CCC,
    @Body('simple11') simple11: Label,
    @Body('simple12') simple12: Label[],
    @Body('simple13') simple13: Array<Label | BBB>,
    @BodyParam('simple14') simple14: string,
  ): Promise<{ name: string }> {
    return name || 'success';
  }
}
