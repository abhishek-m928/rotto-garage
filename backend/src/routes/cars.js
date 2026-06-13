const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createCar,
  getMyCars,
  getCarById,
  updateCar,
  deleteCar,
} = require('../controllers/carController');

// TODO: wire up routes

router .use(authenticate);

router .post('/', createCar)
router .get('/', getMyCars)
router .get('/:id', getCarById)
router .put('/:id', updateCar)
router .delete('/:id', deleteCar)

module.exports = router;
