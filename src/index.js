import { readFileSync } from "fs";
import { dirname, posix, resolve, sep } from "path";
import { createFilter } from "@rollup/pluginutils";
import { cwd } from "process";
/**
 * RegEx to match GLSL `#include` preprocessor instruction
 */
const include = /#include(\s+([^\s<>]+));?/gi;
/**
 * Lygia library directory
 */
let libraryPath = resolve(cwd(), "node_modules");
/**
 * Removes comments from shader source
 * code in order to avoid including commented chunks
 */
function removeSourceComments(source, triple = false) {
    if (source.includes("/*") && source.includes("*/")) {
        source = source.slice(0, source.indexOf("/*")) + source.slice(source.indexOf("*/") + 2, source.length);
    }
    const lines = source.split("\n");
    for (let l = lines.length; l--;) {
        const index = lines[l].indexOf("//");
        if (index > -1) {
            if (lines[l][index + 2] === "/" && !include.test(lines[l]) && !triple)
                continue;
            lines[l] = lines[l].slice(0, lines[l].indexOf("//"));
        }
    }
    return lines.join("\n");
}
const DEFAULT_SHADERS = Object.freeze(["**/*.glsl", "**/*.wgsl", "**/*.vert", "**/*.frag", "**/*.vs", "**/*.fs"]);
/**
 * reference by vite-plugin-glsl
 * https://github.com/UstymUkhman/vite-plugin-glsl/blob/main/src/loadShader.js#L238
 */
const loadChunks = (source, filePath) => {
    const unixPath = filePath.split(sep).join(posix.sep);
    // Remove annotate
    source = removeSourceComments(source);
    if (include.test(source)) {
        source = source.replace(include, (_, chunkPath) => {
            // Incoming file path
            // lygia/generative/fbm.glsl
            chunkPath = chunkPath.trim().replace(/^(?:"|')?|(?:"|')?;?$/gi, "");
            // The absolute path of the module currently imported into the file
            let chunkAbsolutePath = resolve(chunkPath.startsWith("lygia") ? libraryPath : unixPath, chunkPath.split(sep).join(posix.sep));
            // Directory corresponding to the current file
            const chunkDirectory = dirname(chunkAbsolutePath);
            return loadChunks(readFileSync(chunkAbsolutePath, "utf-8"), chunkDirectory);
        });
    }
    return source.trim().replace(/(\r\n|\r|\n){3,}/g, "$1\n");
};
const lygiaPlugin = (userOptions) => {
    const filter = createFilter(DEFAULT_SHADERS, undefined);
    if (userOptions?.libraryPath) {
        libraryPath = userOptions?.libraryPath;
    }
    return {
        enforce: "pre",
        name: "vite-plugin-lygia",
        transform(code, id) {
            // Perform conversion only on matching files
            if (!filter(id))
                return;
            return { code: loadChunks(code, id), id };
        },
    };
};
export default lygiaPlugin;
