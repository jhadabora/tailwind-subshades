import * as mod_common from './common';
import * as mod_v3 from './v3';
import * as mod_v4 from './v4';

export const common = Object.freeze({...mod_common})
export const v3 = mod_v3.plugin
export const v4 = mod_v4.plugin

export default v4