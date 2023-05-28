import { emptyDir } from 'fs-extra';
import gulp from 'gulp';

const { src, dest, task, series } = gulp;

function clean() {
  return emptyDir('dist');
}

function build() {
  return src('src/rule-providers/**/*.yaml').pipe(dest('dist/rule-providers'));
}
// Build
task('build', series(clean, build));
