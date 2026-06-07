const fs = require('fs');
let c = fs.readFileSync('src/firebase/db.js', 'utf-8');

if (c.includes('hsp_products_version')) {
  console.log('already patched');
  process.exit(0);
}

const old = `// Seed initial state in local storage helper\r\nconst initLocalStorageDB = () => {\r\n  if (!localStorage.getItem('hsp_products')) {\r\n    localStorage.setItem('hsp_products', JSON.stringify(INITIAL_PRODUCTS));\r\n  }`;

const rep = `// Seed initial state in local storage helper\r\nconst DB_PRODUCTS_VERSION = 'v4';\r\nconst initLocalStorageDB = () => {\r\n  const storedVer = localStorage.getItem('hsp_products_version');\r\n  if (!localStorage.getItem('hsp_products') || storedVer !== DB_PRODUCTS_VERSION) {\r\n    localStorage.setItem('hsp_products', JSON.stringify(INITIAL_PRODUCTS));\r\n    localStorage.setItem('hsp_products_version', DB_PRODUCTS_VERSION);\r\n  }`;

c = c.replace(old, rep);
fs.writeFileSync('src/firebase/db.js', c);
console.log('done');
