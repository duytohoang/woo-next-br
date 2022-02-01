import { useState, useContext } from 'react';
import { v4 } from "uuid";
import { getUpdatedItems, calculateCartTotals, formatCurrency } from "../../../functions";
import { Cross, Loading } from "../../icons";
import Link from 'next/link';
import { AppContext } from "../../context/AppContext";
import QuantityInput from '../../QuantityInput';


const CartItem = ({
	item,
	products,
	updateCartProcessing,
	handleRemoveProductClick,
	setNeedCartUpdate
}) => {

	const [productCount, setProductCount] = useState(item.qty);
	const [cart, setCart, saveCartLocal] = useContext(AppContext);

	/*
	 * When user changes the qty from product input update the cart in localStorage
	 * Also update the cart in global context
	 *
	 * @param {Object} event event
	 *
	 * @return {void}
	 */
	const handleQtyChange = (event, cartKey) => {

		if (process.browser) {

			// event.stopPropagation();

			// If the previous update cart mutation request is still processing, then return.
			if (updateCartProcessing) {
				return;
			}

			// If the user tries to delete the count of product, set that to 1 by default ( This will not allow him to reduce it less than zero )
			const newQty = (event.target.value) 
				? parseInt(event.target.value) 
				: 1;


			if( productCount != newQty ) {
				setNeedCartUpdate(true);
			}
			// Set the new qty in state.
			setProductCount(newQty);

			const updatedCart = calculateCartTotals({
				...cart,
				products: products.map(prod => {
					if( prod.cartKey === cartKey ) {
						return {
							...prod,
							qty: newQty,
						}
					}
					else {
						return prod;
					}
				} ),
			});

			// localStorage.setItem('woo-next-cart', JSON.stringify(updatedCart));
			saveCartLocal(updatedCart);
			setCart(updatedCart);
		}
	};

	return (
		<tr className="woo-next-cart-item block relative sm:table-row" key={item.productId}>
			<td className="woo-next-cart-element block text-center w-full sm:table-cell">
				<Link href={`/product/${item?.slug}`} >
					<a className="flex flex-wrap justify-center items-center sm:flex-no-wrap sm:justify-start">
						<span className="my-4">
							<img
								className="w-full sm:w-24"
								width="90px"
								src={item.image.sourceUrl}
								srcSet={item.image.srcSet}
								alt={item.image.title}
							/>
						</span>
						<span className="m-4">
							{item.name}
						</span>
					</a>
				</Link>
			</td>
			<td className="woo-next-cart-element block text-center w-full sm:table-cell">
				{formatCurrency(item.price)}
			</td>

			{/* Qty Input */}
			<td className="woo-next-cart-element block text-center w-full sm:table-cell">
				<QuantityInput 
					data-cart-key={item.cartKey}
					value={productCount}
					handleChange={(event) => handleQtyChange(event, item.cartKey)}				
				/>
			</td>
			<td className="woo-next-cart-element block text-center w-full sm:table-cell">
				{formatCurrency(item.totalPrice)}
			</td>
			<td className="woo-next-cart-element block text-center w-full sm:table-cell">
				{/* Remove item */}
				<span className="woo-next-cart-close-icon mt-1 cursor-pointer text-green-500 absolute top-0 right-0 sm:relative"
					onClick={(event) => handleRemoveProductClick(event, item.cartKey, products)}>
					<Cross />
				</span>
			</td>
		</tr>
	)
};

export default CartItem;
