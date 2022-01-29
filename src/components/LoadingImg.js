import Image from "./image";


const LoadingImg = (props) => {

	return (
		<span className="align-middle" {...props} >
			<Image src='/cart-spinner.gif' width="54px" height="54px" />
		</span>
	);
};

export default LoadingImg;
