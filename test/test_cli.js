const { spawn } = require('child_process');
const concat = require('concat-stream');
const assert = require('assert');

// Full path to the cli.js file
const cliPath = process.cwd() + '/cli.js'

function createProcess(args = [], env = null) {
  // args = [processPath].concat(args);

  return spawn('node', args, {
    env: {
      NODE_ENV: 'test',
      ...process.env,
    },
  });
}

function execute(processPath, args = [], opts = {}) {
  const { env = null } = opts;

  // Add script name as the first argument
  args = [processPath, ...args]

  const childProcess = createProcess(args, env);
  childProcess.stdin.setEncoding('utf-8');

  const promise = new Promise((resolve, reject) => {
    childProcess.stderr.once('data', (err) => {
      reject(err.toString());
    });
    childProcess.on('error', reject);
    childProcess.stdout.pipe(
      concat((result) => {
        resolve(result.toString());
      }),
    );
  });
  return promise;
}

describe('Test CLI: version and help', () => {
  it('version with --version', async () => {
    const response = await execute(
      cliPath,
      ['--version']
    );
    const versionPattern = new RegExp('^\\d\\.\\d\\.\\d.*', 'g');
    assert.match(response, versionPattern);
  });

  it('version with -v', async () => {
    const response = await execute(
      cliPath,
      ['-v']
    );
    const versionPattern = new RegExp('^\\d\\.\\d\\.\\d.*', 'g');
    assert.match(response, versionPattern);
  });

  it('No arg', async () => {
    let thrownError = false;
    try {
      await execute(
        cliPath,
        []
      );
    } catch (err) {
      thrownError = true;
      const helpPattern = new RegExp('^cli\.js <file>\\n.*', 'g');
      assert.match(err, helpPattern);
    }
    assert.strictEqual(thrownError, true);
  });

  it('Wrong argument', async () => {
    let thrownError = false;
    try {
      await execute(
        cliPath,
        ['-f']
      );
    } catch (err) {
      thrownError = true;
      const helpPattern = new RegExp('^cli\.js <file>\\n.*', 'g');
      assert.match(err, helpPattern);
    }
    assert.strictEqual(thrownError, true);
  });

  it('help with -h', async () => {
    const response = await execute(
      cliPath,
      ['-h']
    );
    const helpPattern = new RegExp('^cli\.js <file>\\n.*', 'g');
    assert.match(response, helpPattern);
  });

  it('help with --help', async () => {
    const response = await execute(
      cliPath,
      ['--help']
    );
    const helpPattern = new RegExp('^cli\.js <file>\\n.*', 'g');
    assert.match(response, helpPattern);
  });
});

describe('Test CLI: USFM parsing', () => {
  it('one file argument', async () => {
    const response = await execute(
      cliPath,
      ['./test/resources/small.usfm']
    );
    const jsonObj = JSON.parse(response);
    assert.strictEqual(Object.keys(jsonObj).includes('book'), true);
    assert.strictEqual(Object.keys(jsonObj).includes('chapters'), true);
  });

  it('with invalid file', async () => {
    let thrownError = false;
    try {
      await execute(
        cliPath,
        ['./test/test.js']
      );
    } catch (err) {
      thrownError = true;
      const errPattern = new RegExp('^Error parsing the input USFM.*', 'g');
      assert.match(err, errPattern);
    }
    assert.strictEqual(thrownError, true);
  });

  it('level relaxed, with --level=relaxed', async () => {
    const response = await execute(
      cliPath,
      ['./test/resources/small.usfm', '--level=relaxed']
    );
    const jsonObj = JSON.parse(response);
    assert.strictEqual(Object.keys(jsonObj).includes('book'), true);
    assert.strictEqual(Object.keys(jsonObj).includes('chapters'), true);
  });

  it('level relaxed,  with -l relaxed', async () => {
    const response = await execute(
      cliPath,
      ['./test/resources/small.usfm', '-l', 'relaxed']
    );
    const jsonObj = JSON.parse(response);
    assert.strictEqual(Object.keys(jsonObj).includes('book'), true);
    assert.strictEqual(Object.keys(jsonObj).includes('chapters'), true);
  });

  it('level relaxed, with --level relaxed', async () => {
    const response = await execute(
      cliPath,
      ['./test/resources/small.usfm', '--level', 'relaxed']
    );
    const jsonObj = JSON.parse(response);
    assert.strictEqual(Object.keys(jsonObj).includes('book'), true);
    assert.strictEqual(Object.keys(jsonObj).includes('chapters'), true);
  });

  it('level, without value', async () => {
    let thrownError = false;
    try {
      await execute(
        cliPath,
        ['--level']
      );
    } catch (err) {
      thrownError = true;
      const helpPattern = new RegExp('^cli\.js <file>\\n.*', 'g');
      assert.match(err, helpPattern);
    }
    assert.strictEqual(thrownError, true);
  });

  it('scripture filtered, with --filter scripture', async () => {
    const response = await execute(
      cliPath,
      ['./test/resources/small.usfm', '--filter', 'scripture']
    );
    const jsonObj = JSON.parse(response);
    assert.strictEqual(Object.keys(jsonObj).includes('book'), true);
    assert.strictEqual(Object.keys(jsonObj).includes('chapters'), true);
  });

  it('filter with wrong value', async () => {
    let thrownError = false;
    try {
      await execute(
        cliPath,
        ['./test/resources/small.usfm', '--level', 'bible']
      );
    } catch (err) {
      thrownError = true;
      const helpPattern = new RegExp('^cli\.js <file>\\n.*', 'g');
      assert.match(err, helpPattern);
    }
    assert.strictEqual(thrownError, true);
  });

  it('both filter and level arguments', async () => {
    const response = await execute(
      cliPath,
      ['./test/resources/small.usfm', '--filter', 'scripture', '--level', 'relaxed']
    );
    const jsonObj = JSON.parse(response);
    assert.strictEqual(Object.keys(jsonObj).includes('book'), true);
    assert.strictEqual(Object.keys(jsonObj).includes('chapters'), true);
  });

  it('output format specified, with --output==csv', async () => {
    const response = await execute(
      cliPath,
      ['./test/resources/small.usfm', '--output=csv']
    );
    const csvPattern = new RegExp('"Book","Chapter","Verse"\\n.*', 'g');
    assert.match(response, csvPattern);
  });

  it('output format specified, with -o csv', async () => {
    const response = await execute(
      cliPath,
      ['./test/resources/small.usfm', '-o', 'csv']
    );
    const csvPattern = new RegExp('"Book","Chapter","Verse"\\n.*', 'g');
    assert.match(response, csvPattern);
  });

  it('output format specified, with -o tsv', async () => {
    const response = await execute(
      cliPath,
      ['./test/resources/small.usfm', '-o', 'tsv']
    );
    const tsvPattern = new RegExp('Book	Chapter	Verse	Text\\nGEN	1	1	one verse\\n.*', 'g');
    assert.match(response, tsvPattern);
  });
});

describe('Test CLI: JSON parsing', () => {
  it('with one json file-path', async () => {
    const response = await execute(
      cliPath,
      ['./test/resources/small.json']
    );
    const usfmPattern = new RegExp('^\\\\id GEN A small sample usfm file\\n.*', 'g');
    assert.match(response, usfmPattern);
  });

  it('with additional arguments', async () => {
    const response = await execute(
      cliPath,
      ['./test/resources/small.json', '--filter', 'scripture']
    );
    const usfmPattern = new RegExp('^\\\\id GEN A small sample usfm file\\n.*', 'g');
    assert.match(response, usfmPattern);
  });
});
