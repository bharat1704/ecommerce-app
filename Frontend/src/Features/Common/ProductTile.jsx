import { useDispatch } from "react-redux";
import {
  addItemToCartAsync,
  reduceCartItemQuantityAsync,
  removeCartItemAsync,
} from "../Cart/CartSlice";

export function ProductTile({ color, colorCode, product, quantity, size }) {
  const { _id, thumbnail, price, title, description, discountPercentage } =
    product;

  const dispatch = useDispatch();

  function addQuantityHandler(e) {
    if (quantity === 5) {
      console.log("MAX LIMIT REACHED ");
    } else {
      const productDetails = {
        productId: _id || useParams().productId,
        size,
        color,
        colorCode,
        quantity: 1,
      };
      dispatch(addItemToCartAsync({ productDetails }));
      // setCurrentQuantity(prev => prev+1)
    }
  }

  function reduceQuantityHandler() {
    const productDetails = {
      productId: _id || useParams().productId,
      size,
      color,
      colorCode,
      quantity: 1,
    };
    dispatch(reduceCartItemQuantityAsync({ productDetails }));
  }

  function removeItemHandler() {
    const productDetails = {
      productId: _id || useParams().productId,
      size,
      color,
      colorCode,
    };
    dispatch(removeCartItemAsync({ productDetails }));
  }

  return (
    <>
      <div className="productTile-wrapper w-full flex flex-row  items-center p-2 py-6 border-b-2  min-h-[120px] ">
        {/* image */}
        <div className="image h-[100px] w-[100px] rounded-md overflow-hidden flex flex-shrink-0">
          <img src={thumbnail} alt={title} className="h-full w-full " />
        </div>

        {/* details */}
        <div className="details w-[calc(100%-100px)] flex flex-col gap-1 ml-3">
          <div className="flex flex-row justify-between">
            <span>{title}</span>
            <span>
              ${Math.floor(((100 - discountPercentage) / 100) * price)}
            </span>
          </div>
          <div className=" w-[90%] whitespace-nowrap overflow-hidden text-ellipsis">
            {description}
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-1 items-center ">
              <label htmlFor="quantity" className="mr-1">
                Qty
              </label>
              <button
                className={`border-2 p-3 py-0.5 `}
                onClick={reduceQuantityHandler}
              >
                -
              </button>
              {quantity}
              <button
                className={`border-2 p-3 py-0.5 ${
                  quantity === 5 ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={(e) => addQuantityHandler(e)}
                disabled={quantity === 5}
              >
                +
              </button>
            </div>
            <span
              className=" font-semibold text-center text-sm text-[rgb(79,70,229)] hover:text-[#6366F1] hover:cursor-pointer"
              onClick={removeItemHandler}
            >
              Remove
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
