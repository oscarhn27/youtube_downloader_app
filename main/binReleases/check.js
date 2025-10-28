import YTDlpWrapModule from "yt-dlp-wrap";
import { update } from "./update.js";

/** @type {typeof YTDlpWrapModule} */
// @ts-ignore
const YTDlpWrap = YTDlpWrapModule.default;

/**
 * @param {YTDlpWrapModule} ytDlpWrap
 */
export async function checkLatestVersion(ytDlpWrap) {
  const ytDLPCurrentVersion = await ytDlpWrap.getVersion().then((v) => v.trim());
  const ytDLPLastRelease = await YTDlpWrap.getGithubReleases(1, 1).then((r) => r[0].tag_name);
  const updated = ytDLPCurrentVersion === ytDLPLastRelease;
  if (!updated) {
    console.log({ ytDLPCurrentVersion, ytDLPLastRelease });
    await update(ytDLPLastRelease);
  }
}
