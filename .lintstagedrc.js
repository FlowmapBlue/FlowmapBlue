module.exports = {
  '**/*.[jt]s?(x)': (filenames) =>
    `yarn workspace @flowmap.blue/app next lint --fix --file ${filenames
      .map((file) => file.split(process.cwd())[1])
      .join(' --file ')}`,
};
