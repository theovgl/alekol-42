import styled from "styled-components";
import Loader from "../Loader";

const Header_container = styled.header`
	display: flex;
	justify-content: center;
	width: 100%;
	box-sizing: border-box;

	h1 {
		margin-left: 20px;
	}

	@media only screen and (min-width: 570px) {
		font-size: 23px;
		padding: 10px 0px;
		margin-bottom: 40px;
	}

	@media only screen and (max-width: 570px) {
		font-size: 17px;
		text-align: center;
		padding: 10px 20px;
		margin-bottom: 30px;
	}
`

export default function Header(props) {
	return (
		<Header_container>
			<Loader />
			<h1>{props.title}</h1>
		</Header_container>
	)
}
