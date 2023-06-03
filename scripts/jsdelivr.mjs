import chalk from 'chalk';
import {
  readFile,
  readFileSync,
  readdir,
  readdirSync,
  writeFileSync,
} from 'fs';
import { extname, join } from 'path';

// Paths
const directoryPath = './';
const blackListPath = './src/rule-providers';
const packagePath = 'package.json';
const readme = 'README.md';

/** `jsdelivr` root point */
const rootEndpoint = 'https://cdn.jsdelivr.net';
const keys = [{ key: 'npm', path: 'dist/rule-providers' }];

// Get package's name
const packageContent = readFileSync(packagePath);
const projectName = JSON.parse(packageContent).name + '@latest';

// Get rule-set's path
const ruleSetFile = readdirSync(blackListPath).filter(
  (f) => extname(f) === '.yaml'
);

// Generate full path
const linkList = ruleSetFile.map((fileName) => {
  return {
    type: getType(fileName),
    links: keys.map(
      ({ key, path }) =>
        new URL(join(rootEndpoint, key, projectName, path, fileName)).href
    ),
  };
});

// Generate jsdelivr link, and insert into README.md
readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory', err);
    return;
  }

  // Filter the files to include only .md files
  const mdFiles = files
    .filter((file) => extname(file) === '.md')
    .filter((f) => f === readme);

  // Read the content of each .md file
  mdFiles.forEach((mdFile) => {
    const filePath = join(directoryPath, mdFile);

    const linksStr = linkList
      .map(({ links, type }) => {
        const linkStr = links.join('\n\n');
        return `\/\/ ${type}\n${linkStr}`;
      })
      .join('\n\n');

    // console.log(linksStr);

    readFile(filePath, 'utf8', (err, mdContent) => {
      if (err) {
        console.error('Error reading file', filePath, err);
        return;
      }
      // # Rule sets
      const regex = /(?<=## jsDelivr links\n)[\s\S]*(?=\n\*\*)/;
      const replacedContent = mdContent.replace(
        regex,
        `\n\`\`\`javascript\n${linksStr}\n\`\`\`\n`
      );
      // console.log(replacedContent);
      writeFileSync(filePath, replacedContent, 'utf8');
      console.log(chalk.greenBright('Update readme successfully 🎉 ⚡️'));
    });
  });
});

function getType(str) {
  const match = str.match(/\.(\w+)\.yaml$/); // 匹配文件名中以 . 开头、以 .yaml 结尾的字段，例如 classical
  const extracted = match ? match[1] : ''; // 如果匹配成功，则提取匹配的内容；否则为 ''
  return extracted;
}

function getUpperCaseType(str) {
  const match = str.match(/\.(\w+)\.yaml$/); // 匹配文件名中以 . 开头、以 .yaml 结尾的字段，例如 classical
  const extracted = match ? match[1] : ''; // 如果匹配成功，则提取匹配的内容；否则为 ''

  return extracted.charAt(0).toUpperCase() + extracted.slice(1); // 将首字母大写
}
