import Head from 'next/head';
import Header from '../../components/Header';
import StatusCard from '../../components/StatusCard';
import styled from 'styled-components';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Container = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
`;

export default function index() {
	let [status, setStatus] = useState(0);
	const router = useRouter();
	const { code } = router.query;
	const { state } = router.query;

	useEffect(() => {
		axios.post('https://jsonplaceholder.typicode.com/users')
			.then(res => {
				setStatus(res.status);
				console.log(status);
			})
	})

	return (
		<>
			<Head>
				<title>Alekol Registration</title>
				<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👀</text></svg>" />
			</Head>
			<Header title='👀 Alekol Registration'/>
			<Container>
				<StatusCard code={status} />
			</Container>
		</>
	)
};
