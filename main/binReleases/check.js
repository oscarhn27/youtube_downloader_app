import YTDlpWrapModule from "yt-dlp-wrap";
import { update } from "./update.js";

/** @type {typeof YTDlpWrapModule} */
// @ts-ignore
const YTDlpWrap = YTDlpWrapModule.default;

/**
 * @param {YTDlpWrapModule} ytDlpWrap
 */
/**
 * 
 * @param {*} ytDlpWrap 
 * @returns {Promise<{updated: boolean, lastVersion: string}>} true if is the latest version
 */
export async function checkLatestVersion(ytDlpWrap) {
  const ytDLPCurrentVersion = await ytDlpWrap.getVersion().then((v) => v.trim());
  /** @type {string} */
  const ytDLPLastRelease = await YTDlpWrap.getGithubReleases(1, 1).then((r) => r[0].tag_name);
  const updated = ytDLPCurrentVersion === ytDLPLastRelease;
  console.log({ ytDLPCurrentVersion, ytDLPLastRelease });
  return {updated, lastVersion: ytDLPLastRelease};
  
}
