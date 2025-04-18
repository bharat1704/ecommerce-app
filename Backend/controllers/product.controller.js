const productsData = require("../products.json");
const Product = require("../models/product.model");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");

const seedData = async () => {
  try {
    await Product.create(productsData);
  } catch (err) {
    console.log({ err });
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong " });
  }
};

const updateProduct = asyncHandler(async(req,res,next)=>{

    const { productId } = req.params;
    if(!productId){
      return next(new ApiError(400,"Product Id not passed"))
    }
    const {fieldsToBeUpdated} = req.body
    if(!fieldsToBeUpdated){
      return next(new ApiError(400,"No fields found"))
    }

    const productToBeUpdated = await Product.findByIdAndUpdate(productId, {...fieldsToBeUpdated} , {new:true})

    return res.status(200).json(new ApiResponse(200,"Updated Successfully"))
   
  
})

const fetchProductById = asyncHandler(async (req, res,next) => {
  
    const { productId } = req.params;
    if(!productId){
      return next(new ApiError(400,"Product Id not passed"))
    }
    const product = await Product.findOne({ _id: productId });

    return res.status(200).json(new ApiResponse(200,"Fetched successfully", product))
  
    
});

const fetchAllProducts = asyncHandler(async (req, res, next) => {  
  try {
    console.log('Fetching products with query:', req.query);
    let query = Product.find();
    let totalProductsQuery = Product.find();

    if (req.query.category) {
      const categories = Array.isArray(req.query.category) ? req.query.category : [req.query.category];
      query = query.find({ category: { $in: categories } });
      totalProductsQuery = totalProductsQuery.find({ category: { $in: categories } });
    }

    if (req.query.brand) {
      const brands = Array.isArray(req.query.brand) ? req.query.brand : [req.query.brand];
      query = query.find({ brand: { $in: brands } });
      totalProductsQuery = totalProductsQuery.find({ brand: { $in: brands } });
    }

    if (!req.query.admin) {
      query = query.where('deleted').ne(true);
      totalProductsQuery = totalProductsQuery.where('deleted').ne(true);
    }
    
    if (req.query.search && req.query.search?.trim() !== "") {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.find({ title: searchRegex });
      totalProductsQuery = totalProductsQuery.find({ title: searchRegex });
    }

    const sortField = req.query._sort;
    const sortOrder = parseInt(req.query._order, 10) || 1;

    if (sortField) {
      query = query.sort({ [sortField]: sortOrder });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const [totalDocs, products] = await Promise.all([
      totalProductsQuery.countDocuments(),
      query.exec()
    ]);

    console.log(`Found ${products.length} products out of ${totalDocs} total`);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: { 
        totalProducts: totalDocs, 
        products: products.map(p => ({
          ...p.toObject(),
          id: p._id
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return next(new ApiError(500, "Error fetching products"));
  }
})

const createProduct = asyncHandler(async(req,res,next)=>{
    const {product} = req.body
    if(!product){
      return next(new ApiError(400,"Product details not passed"))
    }

    const newProduct = await Product.create({...product})

    return res.status(200).json(new ApiResponse(200,"Added successfully"))
   
})

module.exports = {
  seedData,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
  createProduct
};
