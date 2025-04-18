const Category = require("../models/category.model")
const categoryData = require("../category.json")
const {asyncHandler} = require("../utils/asyncHandler")
const {ApiError} = require("../utils/ApiError")
const {ApiResponse} = require("../utils/ApiResponse")

const fetchAllCategories = asyncHandler(async(req,res,next)=>{
    try {
        console.log('Fetching all categories...');
        const categories = await Category.find().select('label _id');
        console.log(`Found ${categories.length} categories`);
        
        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return next(new ApiError(500, "Error fetching categories"));
    }
})

const addCategory = asyncHandler((async(req,res,next)=>{
    const {label} = req.body

    const ifAlreadyExist = await Category.find({label})

    if(ifAlreadyExist.length){
        return next(new ApiError(409,"Category already exists"))
    }

    const newCategory = await Category.create({
        label
    })

    return res.status(200).json(new ApiResponse(200,"Category Added successfully",newCategory))

}))


const seedCategory = async(req,res)=>{
    try{
        await Category.create(categoryData)
    }catch(err){
        console.log({err})
        return res.status(500).json({success:false , message : "Something went wrong "})
    }
}

module.exports= {
    fetchAllCategories,
    seedCategory,
    addCategory
}