import styled from 'styled-components';
import Header from '../components/Header';
import Head from 'next/head';

const Title = styled.h1`
  font-size: 50px;
  color: ${({ theme }) => theme.colors.primary};
`

export default function Home() {
	return (
		<>
			<Head>
				<title>Alekol</title>
				<meta name='description' content=''/>
			</Head>
			<Header title="Alekol" />
		</>
	)
}
