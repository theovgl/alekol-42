import Head from 'next/head';
import Header from '../../components/Header';
import StatusCard from '../../components/StatusCard';
import HowToDocs from '../../components/HowToDocs';
import styled from 'styled-components';

const Container = styled.div`
	display: flex;
	align-items: center;
	flex-direction: column;
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
				<HowToDocs/>
			</Container>
		</>
	)
};
