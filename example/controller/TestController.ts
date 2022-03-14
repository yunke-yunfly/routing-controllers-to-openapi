
import * as jarviseServiceTypes from '../grpc-code-gen/yk-basis/jarvis-service/types';
import { ProjectData } from './type';


/**
 * 描述1
 * @export
 * @class TestController
 */
@JsonController('/test')
// @UseBefore(AuthoMiddleware(authoMiddlewareConfigs))
export default class TestController {
  @Post('/get-user-info')
  async getUserInfo(
    @Param('id') id: number,
    // @BodyParam('rule') rule: jarviseServiceTypes.jarvis_service.FlowRuleEntry
    // @QueryParams() params: GetProjectHouseTypeListRequest,
    // @QueryParam("user_id") userId: number=1,
    // @Body() body: {name: string},
    // @BodyParam('enum_') enum_: Label
  ): Promise<ProjectData[]> {

    return '';
  }


}


