import styled from 'styled-components';

const Container = styled.code`
	border-radius: 4px;
	padding: 4px;

	background-color: #232323;
`;

export default function InlineCode(props) {
	return (
		<Container>
			{props.children}
		</Container>
	);
}