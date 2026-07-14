const express = require("express");

const {
    getBookings,
    createBooking,
    updateBookingStatus,
    deleteBooking,
} = require("../controllers/bookingController");

const router = express.Router();

router.get("/", getBookings);
router.post("/", createBooking);
router.patch("/:id/status", updateBookingStatus);
router.delete("/:id", deleteBooking);

module.exports = router;