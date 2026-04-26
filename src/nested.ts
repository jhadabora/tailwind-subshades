import v3 from "./v3"
import v4 from "./v4"
import * as lib from "./lib"
import * as libv3 from "./lib/v3"
import * as libv4 from "./lib/v4"
import * as libutil from "./lib/util"
import * as libformula from "./lib/formula"

export default Object.freeze({
    v3: v3,
    v4: v4,
    lib: Object.freeze({
        ...lib,
        v3: Object.freeze({...libv3}),
        v4: Object.freeze({...libv4}),
        util: Object.freeze({...libutil}),
        formula: Object.freeze({...libformula}),
    })
})