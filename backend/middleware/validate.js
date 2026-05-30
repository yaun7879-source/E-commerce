const { validationResult } = require('express-validator');
const { registerValidation, loginValidation, profileUpdateValidation } = require('../validation/userValidation');

const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    };
};

exports.registerValidator = validate(registerValidation);
exports.loginValidator = validate(loginValidation);
exports.profileUpdateValidator = validate(profileUpdateValidation);
