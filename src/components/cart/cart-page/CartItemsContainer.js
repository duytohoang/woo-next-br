import Link from 'next/link';
import { useContext, useState } from 'react';
import { AppContext } from "../../context/AppContext";
import { getFormattedCart, getUpdatedItems, formatCurrency } from '../../../functions';
import CartItem from "./CartItem";
import { v4 } from 'uuid';
import { useMutation, useQuery } from '@apollo/client';
import UPDATE_CART from "../../../mutations/update-cart";
import GET_CART from "../../../queries/get-cart";
import CLEAR_CART_MUTATION from "../../../mutations/clear-cart";
import UPDATE_SHIPPING_METHOD from "../../../mutations/update-shipping-method";
import { isEmpty } from 'lodash'
import cx from 'classnames';
import EmptyCart from '../EmptyCart';
import ChooseShipping from '../ChooseShipping';
import { useRouter } from 'next/router';
import LoadingButton from '../../LoadingButton';

const CartItemsContainer = () => {


	// @TODO wil use it in future variations of the project.
	const [cart, setCart] = useContext(AppContext);
	const [requestError, setRequestError] = useState('');

	const needCartUpdateInit = {
		shipping: false,
		products: false,
	};
	const [needCartUpdate, setNeedCartUpdate] = useState(needCartUpdateInit);
	const router = useRouter();

	// Get Cart Data.
	const { loading, error, data, refetch } = useQuery(GET_CART, {
		notifyOnNetworkStatusChange: true,
		onCompleted: () => {

			// Update cart in the localStorage.
			const updatedCart = getFormattedCart(data);
			localStorage.setItem('woo-next-cart', JSON.stringify(updatedCart));

			console.log('cart', data, updatedCart);
			// Update cart data in React Context.
			setCart(updatedCart);
			setNeedCartUpdate(needCartUpdateInit);
		}
	});

	const defaultOptions = {
		onCompleted: () => {
			console.log("completed");
			refetch();
			// setRequestError('');
		},
		onError: (error) => {
			if (error) {
				const errorMessage = !isEmpty(error?.graphQLErrors?.[0])
					? error.graphQLErrors[0]?.message
					: '';
				setRequestError(errorMessage);
			}
		}
	};

	// Update Cart Mutation.
	const [updateCart, {
		data: updateCartResponse,
		loading: updateCartProcessing,
		error: updateCartError
	}] = useMutation(UPDATE_CART, defaultOptions);

	// Update Cart Mutation.
	const [clearCart, {
		data: clearCartRes,
		loading: clearCartProcessing,
		error: clearCartError
	}] = useMutation(CLEAR_CART_MUTATION, defaultOptions);

	// Update Shipping Method.
	const [chooseShippingMethod, {
		data: chosenShippingData,
		loading: choosingShippingMethod,
		error: chooseShippingError
	}] = useMutation(UPDATE_SHIPPING_METHOD, defaultOptions);

	/*
	 * Handle remove product click.
	 *
	 * @param {Object} event event
	 * @param {Integer} Product Id.
	 *
	 * @return {void}
	 */
	const handleRemoveProductClick = (event, cartKey, products) => {

		event.stopPropagation();
		if (products.length) {

			// By passing the newQty to 0 in updateCart Mutation, it will remove the item.
			const newQty = 0;
			const updatedItems = getUpdatedItems(products, newQty, cartKey);

			updateCart({
				variables: {
					input: {
						clientMutationId: v4(),
						items: updatedItems
					}
				},
			});
		}
	};

	// Clear the entire cart.
	const handleClearCart = (event) => {

		event.stopPropagation();

		if (clearCartProcessing) {
			return;
		}

		clearCart({
			variables: {
				input: {
					clientMutationId: v4(),
					all: true
				}
			},
		});
	};

	const updateRemoteCart = async () => {
		if (needCartUpdate?.products) {
			console.log("mutate products in cart");
			await updateCart({
				variables: {
					input: {
						clientMutationId: v4(),
						items: getUpdatedItems(cart.products, 1, 1)
					}
				},
			});
		}
		if (needCartUpdate?.shipping) {
			console.log("mutate shipping method");
			await chooseShippingMethod({
				variables: {
					input: {
						clientMutationId: v4(),
						shippingMethods: [cart.shippingMethod],
					}
				},
			});
		}
	}

	const handleCheckout = async () => {
		await updateRemoteCart();
		router.push('/checkout');
	};

	return (
		<div className="cart product-cart-container mx-auto my-10 px-4 xl:px-0">
			{cart ? (
				<div className="woo-next-cart-wrapper container">
					<div className="border border-solid p-4">
						<div className="cart-header flex flex-wrap justify-between">
							<h1 className="text-2xl mb-5">
								Você possui {cart.totalProductsCount} itens no Carrinho
							</h1>
							{/*Clear entire cart*/}
							<div className="clear-cart text-right mb-2">
								<button
									className="px-4 py-1 bg-gray-500 text-white rounded-sm w-auto"
									onClick={(event) => handleClearCart(event)}
									disabled={clearCartProcessing}
								>
									<span className="woo-next-cart">Esvaziar Carrinho</span>
									<i className="fa fa-arrow-alt-right" />
								</button>
								{clearCartProcessing ? <p>Esvaziando...</p> : ''}
								{updateCartProcessing ? <p>Atualizando...</p> : null}
							</div>
						</div>
						<hr />
						<div className="grid grid-cols-1 gap-0 xl:gap-4 mb-5">
							<table className="cart-products table-auto col-span-3 mb-5">
								<thead className="text-left hidden sm:table-header-group">
									<tr className="woo-next-cart-head-container">
										<th className="woo-next-cart-heading-el" scope="col">Produto</th>
										<th className="woo-next-cart-heading-el" scope="col">Preço</th>
										<th className="woo-next-cart-heading-el" scope="col">Quantidade</th>
										<th className="woo-next-cart-heading-el" scope="col">Subtotal</th>
										<th className="woo-next-cart-heading-el" scope="col" />
									</tr>
								</thead>
								<tbody>
									{cart.products.length && (
										cart.products.map(item => (
											<CartItem
												key={item.productId}
												item={item}
												updateCartProcessing={updateCartProcessing}
												products={cart.products}
												handleRemoveProductClick={handleRemoveProductClick}
												cart={cart}
												setCart={setCart}
												needCartUpdate={needCartUpdate}
												setNeedCartUpdate={setNeedCartUpdate}
											/>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>

					{/* Shipping Calculator */}
					<div className="pt-8 flex flex-wrap gap-2 justify-between">
						<ChooseShipping
							cart={cart}
							requestDefaultOptions={defaultOptions}
							needCartUpdate={needCartUpdate}
							setNeedCartUpdate={setNeedCartUpdate}
						/>
						{/*Cart Total*/}
						<div className="p-4 border flex-grow">
							<h2 className="self-center text-xl text-bold">Total no Carrinho</h2>
							<hr className="my-4 " />
							<div className="flex justify-between">
								<h3 className="text-xl">Subtotal</h3>
								<div className="font-bold">
									{formatCurrency(cart.productsTotal)}
								</div>
							</div>
							{cart?.needsShippingAddress
								&& cart?.shippingMethods?.length
								&& cart?.shippingMethod
								&& <div className="flex justify-between">
									<h3 className="text-xl">Entrega</h3>
									<div className="font-bold">
										{formatCurrency(cart.shippingTotal)}
									</div>
								</div>
							}
							<hr className="my-4 " />
							<div className="mb-6 flex justify-between">
								<h3 className="text-xl">Total</h3>
								<div className="font-bold text-green-600">
									{formatCurrency(cart.total)}
								</div>
							</div>
							<div className="flex flex-wrap justify-end ">
								{(needCartUpdate?.products || needCartUpdate.shipping)
									&& <LoadingButton
										loading={updateCartProcessing || choosingShippingMethod}
										handleClick={updateRemoteCart}
										label={"Atualizar Carrinho"}
									/>
								}
								<LoadingButton
									loading={updateCartProcessing || choosingShippingMethod}
									handleClick={handleCheckout}
									label={"Finalizar Compra"}
								/>
							</div>
						</div>
					</div>

					{/* Display Errors if any */}
					{requestError
						? <div className="row woo-next-cart-total-container mt-5 text-red-700">
							{requestError}
						</div>
						: ''
					}
				</div>
			) : <EmptyCart />}
		</div>

	);
};

export default CartItemsContainer;
