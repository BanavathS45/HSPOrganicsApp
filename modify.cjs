const fs = require('fs');
let c = fs.readFileSync('src/firebase/db.js', 'utf-8');
c = c.replace(`    bestSeller: true\r\n  },\r\n  {\r\n    id: 'prod-veg-2'`, `    bestSeller: true,\r\n    discountType: 'percentage',\r\n    discountValue: 20,\r\n    offerPrice: 36\r\n  },\r\n  {\r\n    id: 'prod-veg-2'`);
c = c.replace(`    bestSeller: true\r\n  },\r\n  {\r\n    id: 'prod-oil-2'`, `    bestSeller: true,\r\n    discountType: 'flat',\r\n    discountValue: 40,\r\n    offerPrice: 300\r\n  },\r\n  {\r\n    id: 'prod-oil-2'`);
fs.writeFileSync('src/firebase/db.js', c);
