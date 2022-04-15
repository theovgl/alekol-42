import styled from 'styled-components';
import Header from '../components/Header';
import Head from 'next/head';
import LinkButton from '../components/LinkButton';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-align: center;
	width: 100%;
`;

const LinkContainer = styled.div `
	display: flex;

	@media only screen and (max-width: 480px) {
		flex-direction: column;
		width: 100%;
		box-sizing: border-box;
		align-items: center;
	}
`;

const HeroDescription = styled.p `
	margin: 50px 20px 80px 20px;

	@media only screen and (max-width: 480px) {
		margin: 50px 20px 50px 20px;
	}
`

export default function Home() {
	const invitationLink = "https://discord.com/api/oauth2/authorize?client_id=935192175908651058&permissions=268437504&scope=applications.commands%20bot";
	const repoLink = "https://github.com/theovgl/bot_alekol";

	return (
		<>
			<Head>
				<title>Alekol</title>
				<meta name='description' content='Alekol is a Discord bot to automatically add or remove a role whether you are logged at 42 school.'/>
			</Head>
			<Header title="Alekol" />
			<Container>
				<HeroDescription>Alekol is a Discord bot to automatically add or remove a role whether you are logged at 42 school.</HeroDescription>
				<LinkContainer>
					<LinkButton logoPath="./images/discord-logo.svg" text="Invite me" href={invitationLink} bgColor="#404EED" shadowColor="rgba(64, 78, 237, 0.4)" />
					<LinkButton logoPath="./images/github-logo.svg" text="Github" href={repoLink} bgColor="rgba(22, 27, 34, 1)" shadowColor="rgba(22, 27, 34, 0.4)" />
				</LinkContainer>
			</Container>
		</>
	)
};
