// server/routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

// Base path is now /api/rooms
router.post('/', async (req, res, next) => {
  console.log('Creating room with data:', req.body);
  try {
    await roomController.createRoom(req, res);
  } catch (error) {
    next(error);
  }
});
router.get('/:roomId', roomController.findRoom);
router.put('/:roomId/product-info', roomController.updateProductInfo);
router.post('/:roomId/deposit', roomController.depositPayment);
router.post('/:roomId/verify', roomController.verifyProduct);
router.post('/:roomId/confirm', roomController.confirmTransaction);
router.put('/:roomId/role', roomController.updateRole);
router.put('/:roomId/status', roomController.updateRoomStatus);

module.exports = router; 