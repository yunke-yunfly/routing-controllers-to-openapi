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
@JsonController('/other-params')
export default class OtherParamController {
  @Get('/jest')
  async jest(
    @UploadedFile('other1') other1: string,
    @UploadedFiles('other2') other2: string,
  ): Promise<{ name: string }> {
    return name || 'success';
  }
}
