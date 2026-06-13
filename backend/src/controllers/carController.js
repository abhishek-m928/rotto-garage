const Car = require('../models/Car');

//Added - needed for active booking check in deleteCar

const Booking = require('../models/Booking');
/**
 * POST /api/cars — create a car for the authenticated user.
 */
const createCar = async (req, res, next) => {

  // ADDED — extract fields from request body
  try {
    const { make, model, year, fuelType, registrationNumber } = req.body;

// ADDED — validate required fields, was empty before
if (!make || !model || !year) {
  return res.status(400).json({
    success: false,
    error: { code: 'VALIDATION_ERROR', message: 'make, model and year are required' },
  });
}

// ADDED — actually create the car in DB, was empty before
const car = await Car.create({
  userId: req.user.id, // taken from logged in user's token
  make,
  model,
  year,
  fuelType,
  registrationNumber,
});

// ADDED — return created car
res.status(201).json({ success: true, data: car }); 
  } catch (err) {
    next(err);
  }
};


/**
 * GET /api/cars — list all cars belonging to the authenticated user.
 */
const getMyCars = async (req, res, next) => {

  // ADDED — find only this user's cars, sorted newest first, was empty before
  try { 
    const cars = await Car.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: cars });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cars/:id — get a single car (must belong to the authenticated user).
 */
const getCarById = async (req, res, next) => {
  // TODO

  try {
    // ADDED — match both _id and userId so user can't access someone else's car
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });

    // ADDED — return 404 if not found
    if (!car) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAR_NOT_FOUND', message: 'Car not found' },
      });
    }

    // ADDED — return the car
    res.json({ success: true, data: car }); 
  } catch (err) {
    next(err);
  }
};


/**
 * PUT /api/cars/:id — update a car (make, model, year, fuelType only).
 */
const updateCar = async (req, res, next) => {

  try {
    const { make, model, year, fuelType } = req.body; // ADDED — extract only allowed fields

    // ADDED — find and update in one query, checks userId for security
    const car = await Car.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, // userId check — can't update someone else's car
      { make, model, year, fuelType },
      { new: true, runValidators: true } // new:true returns updated doc, runValidators runs schema checks
    );

    // ADDED — return 404 if not found
    if (!car) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAR_NOT_FOUND', message: 'Car not found' },
      });
    }

    res.json({ success: true, data: car }); // ADDED — return updated car
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cars/:id — delete a car.
 * Return 409 if any active bookings exist for this car.
 */
const deleteCar = async (req, res, next) => {
  try {
    // ADDED — first check car exists and belongs to user
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });

    if (!car) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAR_NOT_FOUND', message: 'Car not found' },
      });
    }

    // ADDED — check for active bookings before deleting
    const activeBooking = await Booking.findOne({
      carId: req.params.id,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }, // these 3 statuses = active
    });

    // ADDED — block delete if active bookings exist, return 409 conflict
    if (activeBooking) {
      return res.status(409).json({
        success: false,
        error: { code: 'BOOKING_CONFLICT', message: 'Cannot delete car with active bookings' },
      });
    }

    await car.deleteOne(); //  ADDED — actually delete the car
    res.json({ success: true, message: 'Car deleted successfully' }); // ADDED — return success
  } catch (err) {
    next(err);
  }
};

module.exports = { createCar, getMyCars, getCarById, updateCar, deleteCar };

