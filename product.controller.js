// Please don't change the pre-written code
// Import the necessary modules here

import { resolveContent } from "nodemailer/lib/shared/index.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import {
  addNewProductRepo,
  deleProductRepo,
  findProductRepo,
  getAllProductsRepo,
  getProductDetailsRepo,
  getTotalCountsOfProduct,
  updateProductRepo,
  searchProductKeyword
} from "../model/product.repository.js";
import ProductModel from "../model/product.schema.js";

export const addNewProduct = async (req, res, next) => {
  try {
    const product = await addNewProductRepo({
      ...req.body,
      createdBy: req.user._id,
    });
    if (product) {
      res.status(201).json({ success: true, product });
    } else {
      return next(new ErrorHandler(400, "some error occured!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getAllProducts = async (req, res, next) => {
  // Implement the functionality for search, filter and pagination this function.
  try{
  const page=req.query.page;
  const limit=5;
  //1)suppose page==1 skip documents=0 and reterive first 5 documents
  //2)suppose page==2 skip document=5 and reterive next 5 documents(5-10)
  //3)supposr page==3 skip document=10 and reterve document 11-15

  const skip=(page-1)*limit;
  const allProductsOnSpecificPage=await getAllProductsRepo(skip,limit);
  res.status(200).json({sucess:true,allProducts:allProductsOnSpecificPage});
  }catch(err){
    return next(new ErrorHandler(400,err));
  }


};

export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await updateProductRepo(req.params.id, req.body);
    if (updatedProduct) {
      res.status(200).json({ success: true, updatedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    //1)here we delete the product
    const deletedProduct = await deleProductRepo(req.params.id);
    if (deletedProduct) {
      res.status(200).json({ success: true, deletedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    //1)here getProductDetails
    //2)add one commit
    //3)third change i did
    //4)i add fourth comment
    //5)i add fifth commit
    const productDetails = await getProductDetailsRepo(req.params.id);
    if (productDetails) {
      res.status(200).json({ success: true, productDetails });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const rateProduct = async (req, res, next) => {
  try {
    console.log(req.body);
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const user = req.user._id;
    const name = req.user.name;
    const review = {
      user,
      name,
      rating: Number(rating),
      comment,
    };
    if (!rating) {
      return next(new ErrorHandler(400, "rating can't be empty"));
    }
    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    const findRevieweIndex = product.reviews.findIndex((rev) => {
      return rev.user.toString() === user.toString();
    });
    if (findRevieweIndex >= 0) {
      product.reviews.splice(findRevieweIndex, 1, review);
    } else {
      product.reviews.push(review);
    }
    let avgRating = 0;
    product.reviews.forEach((rev) => {
      avgRating += rev.rating;
    });
    const updatedRatingOfProduct = avgRating / product.reviews.length;
    product.rating = updatedRatingOfProduct.toFixed(2);
    await product.save({ validateBeforeSave: false });
    res
      .status(201)
      .json({ success: true, msg: "thx for rating the product", product });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(500, error));
  }
};

export const getAllReviewsOfAProduct = async (req, res, next) => {
  try {
    const product = await findProductRepo(req.params.id);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteReview = async (req, res, next) => {
  // Insert the essential code into this controller wherever necessary to resolve issues related to removing reviews and updating product ratings.
  try {
    const { productId, reviewId } = req.query;
    console.log(req.query);
    const userId=req.user._id;
    console.log("userId");
    console.log(userId);
    if (!productId || !reviewId) {
      return next(
        new ErrorHandler(
          400,
          "pls provide productId and reviewId as query params"
        )
      );
    }
    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    const reviews = product.reviews;

    const isReviewExistIndex = reviews.findIndex((rev) => {
      console.log(typeof rev._id)
      return rev._id.toString() === reviewId;
    });
    if (isReviewExistIndex < 0) {
      return next(new ErrorHandler(400, "review doesn't exist"));
    }
    //1)reviewIndex found
    console.log("reviews user");
    console.log(reviews[isReviewExistIndex].user);
    console.log(reviews[isReviewExistIndex].user.toString()===userId.toString());
    if(reviews[isReviewExistIndex].user.toString()===userId.toString()){
    const reviewToBeDeleted = reviews[isReviewExistIndex];
    reviews.splice(isReviewExistIndex, 1);

    
    //1)additional changes in the avgRating of the product
    let avgRating=0;
    reviews.forEach((rev)=>{
      avgRating=avgRating+rev.rating;
    });
    console.log("avgRating");
    console.log(avgRating);
    console.log(reviews.length);
    if(reviews.length==0){
    product.rating=0;
    }else{
      const updateRating=avgRating/reviews.length;
      product.rating=updateRating.toFixed(2);
    }
    console.log("product.rating");
    console.log(product.rating);
    
    await product.save({ validateBeforeSave:false });
    console.log(product.rating);
    res.status(200).json({
      success: true,
      msg: "review deleted successfully",
      deletedReview: reviewToBeDeleted,
      product,
    });

  }else{
    return res.status(404).send("You can only delete your own reviews.");
  }
    
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }

};
export const searchProduct=async (req,res,next)=>{
  try{
    const {keyword,page}=req.query;
    // console.log(keyword);
    // console.log(page);
    const formattedKeywod=keyword.charAt(0).toUpperCase()+keyword.slice(1);
    // console.log(formattedKeywod);
    const allKeywordMatchingProduct=await searchProductKeyword(keyword,page);
    if(allKeywordMatchingProduct.length>0){
    return res.status(200).json({success:true,allProducts:allKeywordMatchingProduct});
    }else{
      return res.status(404).json({success:false,message:`No products found for ${formattedKeywod} on Page no ${page} . Try a different search term.`})
    }
  }catch(err){
    console.log(err);
    return next(new ErrorHandler(500,err));
  }
  // next();
}