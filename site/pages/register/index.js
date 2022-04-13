import Head from 'next/head';
import Header from '../../components/Header';
import StatusCard from '../../components/StatusCard';
import HowToDocs from '../../components/HowToDocs';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Container = styled.div`
	display: flex;
	align-items: center;
	flex-direction: column;
	margin: 0 auto;
	width: 90%;
	overflow: hidden;

	@media only screen and (min-width: 570px) {
		width: 80%;
	}

	@media only screen and (min-width:820px) {
		width: 656px;
	}
`;

export default function index() {
	const [status, setStatus] = useState(0);
	const [title, setTitle] = useState("");
	const [details, setDetails] = useState("")
	const router = useRouter();
	const { code } = router.query;
	const { state } = router.query;

	useEffect(() => {
		if (!router.isReady) {
			return ;
		}
		console.log(code);
		const config = {
			method: 'POST',
			body: JSON.stringify({
				state: state,
				code: code
			}),
			headers: {
				"content-type": "application/json"
			}
		};
		fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, config)
			.then((response) => {
				setStatus(response.status);
				return (response.json());
			})
			.then((data) => {
				if (data.next != null) {
					router.push(data.next.location);
				}
				setTitle(data.message);
				setDetails(data.details);
			})
	}, [router.isReady]);
	if (!code || !state) {
		return <></>;
	}
	return (
		<>
			<Head>
				<title>Alekol Registration</title>
				<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👀</text></svg>" />
			</Head>
			<Header title='👀 Alekol Registration'/>
			<Container>
				<StatusCard code={status} title={title} details={details}/>
        <HowToDocs/>
			</Container>
		</>
	)
};
