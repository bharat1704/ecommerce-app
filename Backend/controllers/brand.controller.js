const Brand = require("../models/brand.model")
const brandData = require('../brand.json')
const {asyncHandler} = require("../utils/asyncHandler")
const {ApiError} = require("../utils/ApiError")
const {ApiResponse} = require("../utils/ApiResponse")

const fetchAllBrands = asyncHandler(async(req,res,next)=>{
    try {
        console.log('Fetching all brands...');
        const brands = await Brand.find().select('label _id');
        console.log(`Found ${brands.length} brands`);
        
        return res.status(200).json({
            success: true,
            message: "Brands fetched successfully",
            data: brands
        });
    } catch (error) {
        console.error('Error fetching brands:', error);
        return next(new ApiError(500, "Error fetching brands"));
    }
})

const addBrand = asyncHandler((async(req,res,next)=>{
    const {label} = req.body
    const ifAlreadyExist = await Brand.find({label})
    if(ifAlreadyExist.length){
        return next(new ApiError(409,"Brand already exists"))
    }

    const newBrand = await Brand.create({
        label 
    })

    return res.status(200).json(new ApiResponse(200,"Brand Added successfully",newBrand))

}))


const seedBrand = async(req,res)=>{
    try{
        await Brand.create(brandData)
    }catch(err){
        console.log({err})
        return res.status(500).json({success:false , message : "Something went wrong "})
    }
}


module.exports= {
    fetchAllBrands,
    seedBrand,
    addBrand
}