import * as types from '../grpc-code-gen/yued/grpc-server-example/types';

export enum Label {
  LABEL_OPTIONAL = 1,
  LABEL_REQUIRED = 2,
  LABEL_REPEATED = 3,
}

/**
 * 测试controller
 *
 * @export
 * @class TestController
 */
@JsonController('/test')
export default class TestController {
  
  @Post('/jest/:id')
  async jest(
    @Params() id: any,
    @BodyParam('name1') name1: number | string,
  ): Promise<types.user.GetUserInfoResponse | string> {
    return name || 'success';
  }
}
