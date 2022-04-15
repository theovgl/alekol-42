import styled from "styled-components";

const Button = styled.a`
	display: flex;
	align-items: center;
	justify-content: space-evenly;

	border-radius: 12px;
	background-color: ${props => props.bgColor};

	padding: 0px 20px;
	margin: 0px 15px;
	width: 160px;
	box-sizing: border-box;

	color: white;
	text-decoration: none;
	font-family: Inter;
	font-weight: 700;
	line-height: 1;

	transition: all 0.2s ease-out;

	@media only screen and (max-width: 480px) {
		width: 180px;
		margin: 10px 20px;
		box-sizing: border-box;
	}

	&:hover {
		box-shadow: 0px 4px 14px ${props => props.shadowColor};
		filter: brightness(120%);
	}
`

const Logo = styled.img`
	height: 25px;
	margin: 0px 15px 0px 0px;
`

function LinkButton(props) {
  return (
	<Button href={props.href} target="_blank" bgColor={props.bgColor} shadowColor={props.shadowColor}>
		<Logo src={props.logoPath} alt={props.logoAlt}/>
		<p>{props.text}</p>
	</Button>
  )
}

export default LinkButton;
