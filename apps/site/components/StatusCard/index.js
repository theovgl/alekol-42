import styled from "styled-components"
import Loader from "../Loader"

const Card = styled.div`
	border-radius: 9px;
	padding: 8px 30px;
	margin: 0px 30px;
	box-sizing: border-box;
	width: 100%;

	background: ${
		props => props.success ?
		"linear-gradient(0deg, rgba(0,93,201,1) 0%, rgba(13,124,255,1) 80%)" : "linear-gradient(0deg, rgba(196,23,0,1) 0%, rgba(221,59,0,1) 85%)"
	};

	box-shadow: 0px 4px 14px ${
		props => props.success ?
		"rgba(0, 108, 235, 0.38)" : "rgba(196, 23, 0, 0.38)"
	};

	@media only screen and (max-width:820px) {
		margin: 0px 25px;
	}
`;

const H2 = styled.h2`
	font-size: 20px;

	@media only screen and (max-width :570px) {
		font-size: 18px;
	}
`;

export default function StatusCard(props) {
	if (props.status == 0) {
		return (
			<Loader />
		)
	}
	else if (props.status == 200) {
		return (
			<Card success>
				<H2>Successfully registered</H2>
			</Card>
		)
	}
	else {
		return (
			<Card>
				<H2>{props.message}</H2>
				<p>{props.details}</p>
			</Card>
		)
	}
};
