import api from "../api/axiosClient";

export const rentalService = {
  getAvailableLaptops(params?: { labLocation?: string; status?: string }) {
    return api.get("/rentals/available-laptops", { params }).then((r) => r.data);
  },

  bookLaptop(data: { laptopId: string; duration: string; startTime: string }) {
    return api.post("/rentals/book", data).then((r) => r.data);
  },

  getBookingHistory() {
    return api.get("/rentals/my-bookings").then((r) => r.data);
  },

  verifyPayment(data: { bookingId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    return api.post("/rentals/verify-payment", data).then((r) => r.data);
  },
};
