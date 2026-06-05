// test/filterLowStockProducts.test.js

const { filterLowStockProducts } = require('../src/app/utils/filterLowStockProducts');

function testDUPLUNIT12() {
  const inputProducts = [
    { id: "1", name: "Tas Kulit", stock: 5 },
    { id: "2", name: "Sepatu Olahraga", stock: 1 },
    { id: "3", name: "Kemeja Batik", stock: 0 }
  ];

  const result = filterLowStockProducts(inputProducts);

  console.log(`   ${JSON.stringify(result, null, 2)}`);
}

testDUPLUNIT12();