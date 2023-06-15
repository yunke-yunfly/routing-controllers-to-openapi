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
 * 基础类型测试 string|number|boolean|any|never
 *
 * @export
 * @class TestController
 */
@JsonController('/complex')
export default class ComplexController {
  @Post('/jest')
  async jest(
    @BodyParam('simple1', { required: true }) simple1: string | number,
    @BodyParam('simple2') simple2: number[],
    @BodyParam('simple3') simple3: (number | string)[],
    @BodyParam('simple4') simple4: Array<number>,
    @BodyParam('simple5') simple5: Array<number | string>,
    @BodyParam('simple6') simple6: Array<BBB>,
    @BodyParam('simple15') simple15: Array<BBB & CCC>,
    @BodyParam('simple7') simple7: Array<BBB | CCC>,
    @BodyParam('simple8') simple8: BBB[],
    @BodyParam('simple9') simple9: (BBB | CCC)[],
    @BodyParam('simple10') simple10: AAA,
    @BodyParam('simple11') simple11: Label,
    @BodyParam('simple12') simple12: Label[],
    @BodyParam('simple13') simple13: Array<Label | BBB>,
  ): Promise<{ name: string }> {
    return name || 'success';
  }
}
