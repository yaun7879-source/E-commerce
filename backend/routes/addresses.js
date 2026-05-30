const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const addressController = require('../controllers/addressController');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', verifyToken, asyncHandler(addressController.getAddresses));
router.get('/:id', verifyToken, asyncHandler(addressController.getAddress));
router.post('/', verifyToken, asyncHandler(addressController.createAddress));
router.put('/:id', verifyToken, asyncHandler(addressController.updateAddress));
router.delete('/:id', verifyToken, asyncHandler(addressController.deleteAddress));

module.exports = router;
