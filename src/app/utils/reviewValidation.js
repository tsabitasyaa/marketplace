function validateReview(email, rating) {
  if (!email.includes("@")) {
    return {
      success: false,
      message: "Format email tidak valid"
    };
  }

  if (rating < 1 || rating > 5) {
    return {
      success: false,
      message: "Rating harus antara 1 sampai 5"
    };
  }

  return {
    success: true,
    message: "Validasi berhasil"
  };
}

module.exports = {
  validateReview
};