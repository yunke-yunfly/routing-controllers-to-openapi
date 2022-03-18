
interface ParamsOption {
    // @param {string} [name='zane'] 姓名  
    name: string;
    /**
     * 年龄
     * @param {number} [age=25]
     */
    age: number;
}

/**
 * @Body
 *
 * @export
 * @class TestController
 */
@JsonController('/node')
export default class NoteController {


    /**
     * 简单注释
     * @param {string} name 姓名
     * @param {number} age 年龄
     */
    @Get('/node_1')
    async Note_1(
        @QueryParam("name") name: string,
        @QueryParam("age") age: number,
    ): Promise<{ name: string }> { }


    /**
     * 复杂注释
     * @param {string} [name='zane'] 姓名
     * @param {number} [age=25] 年龄
     */
    @Get('/node_2')
    async Note_1(
        @QueryParam("name") name: string,
        @QueryParam("age") age: number,
    ): Promise<{ name: string }> { }


    // 行内简单注释
    @Get('/node_3')
    async Note_3(
        // 姓名
        @QueryParam("name") name: string,
        /**
         * 年龄
         */
        @QueryParam("age") age: number,
    ): Promise<{ name: string }> { }


    // 行复杂单注释
    @Get('/node_4')
    async Note_4(
        // @param {string} [name='zane'] 姓名  
        @QueryParam("name") name: string,
        /**
         * 年龄
         * @param {number} [age=25]
         */
        @QueryParam("age") age: number,
    ): Promise<{ name: string }> { }


    // interface 注释
    @Get('/node_5')
    async Note_4(
        @QueryParams() params: ParamsOption,
    ): Promise<{ name: string }> { }

}
