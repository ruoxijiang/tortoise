import {Env} from "../index";
let envs: Env| {} = {};
export const initEnvs = (env: Env) => {
    envs = env
};
export const getEnvs = () => {
    return envs;
};