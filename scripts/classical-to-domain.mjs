import chalk from 'chalk';
import { readFileSync, readdir, readdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import YAML from 'yaml';

const RULES_DIR_PATH = 'src/rule-providers';

// `DOMAIN-KEYWORD` 类型暂时未进行转换
const ruleMapping = {
  DOMAIN: (rule) => rule,
  'DOMAIN-SUFFIX': (rule) => '+.' + rule,
};

// Get the names of rule files.
const fileNames = readdirSync(RULES_DIR_PATH).filter(
  (f) => extname(f) === '.yaml'
);

// Get the relative path of rule files.
const fileRelativePaths = fileNames.map((path) =>
  join(RULES_DIR_PATH, path).toString()
);

// Find the yaml file of classical.
const classicalFilePath = fileRelativePaths.find((f) =>
  f.includes('.classical.')
);

if (!classicalFilePath) {
  console.error(chalk.redBright('==> Can not get classical rules file'));
  process.exit();
}
// Get parsed yaml data
const classicalRuleFile = readFileSync(classicalFilePath, 'utf-8');
const parseData = YAML.parse(classicalRuleFile);

/**
 * Convert rules of classical type to rules of domain type.
 */
const domainFilePath = fileRelativePaths.find((f) => f.includes('.domain.'));

if (!domainFilePath) {
  console.error(chalk.redBright('==> Can not get domain rules file'));
  process.exit();
}

const filteredRules = parseData.payload.filter(
  (rule) => !rule.includes('DOMAIN-KEYWORD')
);

const payload = filteredRules.map((rule) => {
  const [type, content] = rule.split(',');
  const replacement = ruleMapping[type];
  return replacement ? replacement(content) : rule;
});

const domainFileData = YAML.stringify(
  { payload },
  { defaultKeyType: 'PLAIN', defaultStringType: 'QUOTE_SINGLE' }
);

writeFileSync(domainFilePath, domainFileData, 'utf-8');

console.log(
  chalk.greenBright('Transform classical to domain successfully 🎉 ⚡️')
);
