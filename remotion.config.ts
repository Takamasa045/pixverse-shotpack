import {Config} from '@remotion/cli/config';

Config.setEntryPoint('./src/index.ts');
Config.setChromiumOpenGlRenderer('angle-egl');
