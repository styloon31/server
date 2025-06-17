const express = require("express");
const Stripe = require("stripe");
const router = express.Router();
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  const { listing, startDate, endDate } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: listing.title,
              description: `${listing.description} — from ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}`,
              images: [listing.image],
            },
            unit_amount: listing.price * 100,
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
});


module.exports = router;
