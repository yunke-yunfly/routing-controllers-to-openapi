interface AAA {
    aaa: string;
    bbb: BBB;
}

interface BBB {
    ccc: string;
}

/**
 * @Body
 *
 * @export
 * @class TestController
 */
@JsonController('/session')
export default class SessionController {
    @Get('/jest')
    async jest(
        @Session('other5') other5: AAA,
    ): Promise<{ name: string }> {
        return name || 'success';
    }
}
