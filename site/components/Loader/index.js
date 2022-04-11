import styled from "styled-components";

const LoaderDiv = styled.div`
	// background-color: white;
	width: 25px;
	height: 25px;
	animation: linear 1.8s infinite rotation;
	border-radius: 10px;
	border: 3px solid white;

	@keyframes rotation {
		from { transform: rotate(0); }
		to { transform: rotate(360deg); }
	}
`

function Loader() {
	return (
		<LoaderDiv />
	)
}

export default Loader;
