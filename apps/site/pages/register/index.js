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

function generate_error_details(error) {
	if (error == 'access_denied') {
		return {
			message: 'Access denied',
			details: 'The request was cancelled.',
		};
	} else {
		return {
			message: 'An unexpected error occured...',
			details: 'Please contact an administrator.',
		};
	}
}

export async function getServerSideProps(context) {
	const { code, state, error } = context.query;

	if (error) {
		await fetch(`${process.env.NEXT_PUBLIC_API_URL}/state/${state}`, { method: 'DELETE' })
			.catch((error) => {
				console.error(error);
			});
		return {
			props: {
				is_error: true,
				data: generate_error_details(error),
			},
		};
	}
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

	let res;
	try {
		res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, config);
	} catch (error) {
		console.error(error);
		return {
			props: {
				is_error: true,
				data: generate_error_details(),
			}
		};
	}
	const data = await res.json();
	if (data.next != null) {
		return {
			redirect: {
				permanent: false,
				destination: data.next.location
			}
		}
	}
	return {
		props: {
			is_error: res.status >= 400,
			data
		}
	};
}

export default function index({ is_error, data }) {
	useEffect(() => {
		console.log(data);
	});

	return (
		<>
			<Head>
				<title>Alekol Registration</title>
        <meta name='robots' content='noindex' />
			</Head>
			<Container>
				<Header title='Alekol Registration'/>
				<StatusCard is_error={is_error} message={data.message} details={data.details} />
				<HowToDocs/>
			</Container>
		</>
	)
};
