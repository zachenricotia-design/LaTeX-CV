const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function generatePdf(cvData) {
  return new Promise((resolve, reject) => {
    const runId = uuidv4();
    const tempDir = path.join(process.env.TEMP_DIR || './tmp', runId);
    
    // 1. Setup workspace directory
    fs.mkdirSync(tempDir, { recursive: true });

    const renderData = {
      ...cvData,
      personal: {
        ...cvData.personal
      }
    };

    // 2. Generate LaTeX code via Python script
    const py = spawn(process.env.PYTHON_PATH || 'python3', ['./python/generate_latex.py']);
    let texContent = '';
    let pyError = '';
    
    py.stdin.write(JSON.stringify(renderData));
    py.stdin.end();
    
    py.stdout.on('data', chunk => texContent += chunk);
    py.stderr.on('data', chunk => pyError += chunk);
    
    py.on('close', code => {
      if (code !== 0) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        return reject(new Error(`LaTeX template generation failed: ${pyError}`));
      }
      
      const texPath = path.join(tempDir, 'resume.tex');
      fs.writeFileSync(texPath, texContent);
      
      // 3. Compile .tex to .pdf using pdflatex
      // Execute in tempDir so generated build artifacts stay contained
      const compiler = spawn('pdflatex', [
        '-interaction=nonstopmode',
        '-halt-on-error',
        'resume.tex'
      ], { cwd: tempDir });
      
      let compilerLog = '';
      compiler.stdout.on('data', chunk => compilerLog += chunk);
      
      compiler.on('close', compileCode => {
        if (compileCode !== 0) {
          fs.rmSync(tempDir, { recursive: true, force: true });
          return reject(new Error(`PDF compilation failed. Log: ${compilerLog}`));
        }
        
        const pdfPath = path.join(tempDir, 'resume.pdf');
        if (fs.existsSync(pdfPath)) {
          const pdfBuffer = fs.readFileSync(pdfPath);
          // Delete temp files asynchronously to free disk space
          fs.rm(tempDir, { recursive: true, force: true }, () => {});
          resolve(pdfBuffer);
        } else {
          fs.rmSync(tempDir, { recursive: true, force: true });
          reject(new Error('PDF file not found after successful compile run.'));
        }
      });
    });
  });
}