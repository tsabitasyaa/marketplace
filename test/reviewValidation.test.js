const { validateReview } = require("../src/app/utils/reviewValidation");

function testDUPLUNIT03() {
  const email = "cia41613@gmail.com";
  const rating = 5;

  const result = validateReview(email, rating);

  console.log("=== DUPL-UNIT-03 ===");
  console.log(JSON.stringify(result, null, 2));
}

testDUPLUNIT03();