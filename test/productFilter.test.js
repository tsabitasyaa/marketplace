const { filterProducts } = require("../src/app/utils/productFilter");

function testDUPLUNIT04() {
  const products = [
    {
      id: 1,
      name: "Tas Kulit",
      category: "Fashion",
      storeName: "Loopy Store",
      city: "Semarang",
      province: "Jawa Tengah",
    },
    {
      id: 2,
      name: "Sepatu Olahraga",
      category: "Olahraga",
      storeName: "Sport Shop",
      city: "Bandung",
      province: "Jawa Barat",
    },
  ];

  const result = filterProducts(
    products,
    "tas",
    [],
    "",
    ""
  );

  console.log("=== DUPL-UNIT-04 ===");
  console.log(JSON.stringify(result, null, 2));
}

testDUPLUNIT04();