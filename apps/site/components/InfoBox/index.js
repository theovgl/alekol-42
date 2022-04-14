import styled from 'styled-components';

const Container = styled.div`
	border-left: solid 6px #3A3A3A;
	padding: 6px 18px;

	background-color: #232323;
`;

export default function InfoBox(props) {
	return (
		<Container>
			{props.children}
		</Container>
	);
}