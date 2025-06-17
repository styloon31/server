const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const authenticate = require("../middleware/authMiddleware");

router.post("/", authenticate, async (req, res) => {
  const { listingId, startDate, endDate } = req.body;

  if (!listingId || !startDate || !endDate) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newBooking = new Booking({
      listing: listingId,
      user: req.user.id,
      checkIn: new Date(startDate),
      checkOut: new Date(endDate),
    });

    const savedBooking = await newBooking.save();
    res.json(savedBooking);
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
});


router.get("/", authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate("listing");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});


module.exports = router;
