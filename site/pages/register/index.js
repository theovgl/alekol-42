import Head from 'next/head';
import Header from '../../components/Header';
import StatusCard from '../../components/StatusCard';
import styled from 'styled-components';

const Container = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
`;

export default function index() {
	return (
		<>
			<Head>
				<title>Alekol Registration</title>
			</Head>
			<Header title='👀 Alekol Registration'/>
			<Container>
				<StatusCard status='failure'/>
			</Container>
		</>
	)
};
