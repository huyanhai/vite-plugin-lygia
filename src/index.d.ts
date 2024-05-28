import { Plugin } from "vite";
interface IUserOptions {
    libraryPath?: string;
}
declare const lygiaPlugin: (userOptions?: IUserOptions) => Plugin;
export default lygiaPlugin;
