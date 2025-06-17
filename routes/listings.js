const express = require("express");
const router = express.Router();
const Listing = require("../models/Listings");
const authenticate = require("../middleware/authMiddleware");

// POST /api/listings — Create a listing
router.post("/", authenticate, async (req, res) => {
  try {
    const { title, description, price, location, image } = req.body;
    const listing = new Listing({
      title,
      description,
      price,
      location,
      image,
      host: req.user.id
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed to create listing" });
  }
});

// GET /api/listings — Get all listings
router.get("/", async (req, res) => {
  const listings = await Listing.find().populate("host", "name email");
  res.json(listings);
});

// GET /api/listings/:id — Get one listing
router.get("/:id", async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("host", "name email");
  if (!listing) return res.status(404).json({ message: "Listing not found" });
  res.json(listing);
});

// PUT /api/listings/:id
router.put("/:id", authenticate, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Only host can update
    if (listing.host.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(listing, req.body); // Merge updates
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed to update listing" });
  }
});

// DELETE /api/listings/:id
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.host.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete listing" });
  }
});

router.get("/listings", async (req, res) => {
  try {
    const { location, minPrice, maxPrice } = req.query;
    const filter = {};

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(filter).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
