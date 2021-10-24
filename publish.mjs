import { readFile, writeFile } from "fs/promises";
import semver from "semver";

import fetch from "node-fetch";
import execa from "execa";
import slugify from "slugify";

(async () => {
  const packageJson = JSON.parse(await readFile("./package.json"));
  const response = await fetch("https://www.caniemail.com/api/data.json");
  const data = await response.json();
  await writeFile("./data.json", JSON.stringify(data, null, 2));

  const internalTagName = slugify(`internal-${data.last_update_date}`, {
    remove: /:+/g, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  }).replace("-+0000", "");

  const tags = await getPackageTags(packageJson.name);

  // no update to publish
  if (tags[internalTagName]) {
    console.log("No update to publish. Exiting...");
    return;
  }

  const newVersion = semver.inc(tags["latest"], "minor");
  console.log("Publishing new version: ", newVersion);

  console.log("Updating package.json...");
  await writeFile(
    "./package.json",
    JSON.stringify(
      {
        ...packageJson,
        version: newVersion,
      },
      null,
      2
    )
  );

  console.log("Publishing to NPM...");
  console.log(
    (await execa("npm", ["publish", "--tag latest", "--access public"])).stdout
  );

  console.log("Adding internal tracking tag:", internalTagName);
  await execa("npm", [
    "dist-tag",
    "add",
    `${packageJson.name}@${newVersion}`,
    internalTagName,
  ]);

  console.log("Pushing update to GitHub");
  await execa("git", ["add", "./package.json"]);
  await execa("git", [
    "commit",
    "-m",
    `[chore] published version ${newVersion}`,
  ]);
  await execa("git", ["push"]);
})();

async function getPackageTags(name) {
  const { stdout } = await execa("npm", ["dist-tag", "ls", name]);
  const tags = {};
  for (const line of stdout.split("\n")) {
    const [tag, version] = line.split(":");
    tags[tag] = version;
  }

  return tags;
}
