// test/sortProductsByRatingDesc.test.js

const { sortProductsByRatingDesc } = require('../src/app/utils/sortProductsByRatingDesc');

function testDUPLUNIT11() {
  const inputProducts = [
    { id: "1", name: "Tas Kulit", rating: "3.5" },
    { id: "2", name: "Sepatu Olahraga", rating: "5.0" },
    { id: "3", name: "Kemeja Batik", rating: "4.2" }
  ];

  const result = sortProductsByRatingDesc(inputProducts);

  console.log(`   ${JSON.stringify(result, null, 2)}`);
}

testDUPLUNIT11();