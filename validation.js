const joi = require("joi");

const itemValidationObject = joi.object({
  itemName: joi.string().alphanum().min(3).max(25).trim(true).required(),
  price: joi.number().required(),
  stock: joi.number().required(),
});

const orderItemsValidationObject = joi.object({
  orderId: joi.number().required(),
  itemList: joi.array().items({
    itemId: joi.number().required(),
    quantity: joi.number().required(),
  }),
});

const itemValidation = (req, res, next) => {
  try {
    const payload = {
      itemName: req.body.itemName,
      price: req.body.price,
      stock: req.body.stock,
    };

    const { error } = itemValidationObject.validate(payload);
    if (error) {
      return res
        .status(406)
        .json({ errMsg: `Error in Item Data : ${error.message}` });
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in validating item request body.");
  }
};

const orderItemsValidation = (req, res, next) => {
  try {
    const payload = {
      orderId: req.body.orderId,
      itemList: req.body.itemList,

      //quantity: req.body.quantity,
    };

    const { error } = orderItemsValidationObject.validate(payload);
    if (error) {
      return res
        .status(406)
        .json({ errMsg: `Error in order items Data : ${error.message}` });
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in validating order item request body.");
  }
};

module.exports = { itemValidation, orderItemsValidation };
