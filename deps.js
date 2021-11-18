console.info(require('child_process').execSync('npm ci --ignore-scripts', { cwd: __dirname }).toString());
