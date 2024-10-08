const Category = require("../models/category.model");
const { successResponse } = require("../utils/responseHelpers");

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    successResponse(res, categories, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    successResponse(res, category, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  const category = new Category({
    name: req.body.name,
    description: req.body.description,
  });
  try {
    await category.save();
    successResponse(res, category, "Category created successfully");
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    category.name = req.body.name;
    category.description = req.body.description;

    await category.save();
    successResponse(res, category, "Category updated successfully");
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    successResponse(res, null, "Category deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
