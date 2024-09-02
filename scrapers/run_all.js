import { exec } from 'child_process';

// List of scripts to run
const scripts = [
    'scraper_ft.js',
    'scraper_hn.js',
    'scraper_lobsters.js',
    'scraper_nikkei.js'
];

// Run each script
scripts.forEach(script => {
    exec(`node scrapers/${script}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing ${script}: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error output from ${script}: ${stderr}`);
            return;
        }
        console.log(`Output from ${script}: ${stdout}`);
    });
});