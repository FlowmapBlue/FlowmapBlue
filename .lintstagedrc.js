module.exports = {
  '**/*.[jt]s?(x)': (filenames) =>
    `next lint --fix ${filenames.map((file) => `--file ${JSON.stringify(file)}`).join(' ')}`,
};
