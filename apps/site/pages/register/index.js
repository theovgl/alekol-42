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
		max-width: 700px;
	}
`;

export async function getServerSideProps(context) {
	const { code } = context.query;
	const { state } = context.query;

	console.log(code, state);
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

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, config);
	const data = await res.json();
	if (data.next != null) {
		return {
			redirect: {
				permanent: false,
				destination: data.next.location
			}
		}
	}
	console.log(res.status);
	return {
		props: {
			status: res.status,
			data
		}
	};
}

export default function index({ status, data }) {
	useEffect(() => {
		console.log(data);
	});

	return (
		<>
			<Head>
				<title>Alekol Registration</title>
				<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👀</text></svg>" />
			</Head>
			<Container>
				<Header title='Alekol Registration'/>
				<StatusCard status={status} message={data.message} details={data.details} />
				<HowToDocs/>
			</Container>
		</>
	)
};
