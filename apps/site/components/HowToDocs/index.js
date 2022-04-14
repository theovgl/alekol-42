import InlineCode from '../InlineCode';
import InfoBox from '../InfoBox';
import styled from 'styled-components';

const Container = styled.div`
	margin: 40px 0;
	width: 100%;

	@media only screen and (max-width: 570px) {
		margin: 30px 0;
	}
`;

const Anchor = styled.a`
	color: #83b2fb;

	&:visited {
		color: #a383fb;
	}
`;

const P = styled.p`
	font-size: 16px;

	@media only screen and (max-width: 570px) {
		font-size: 15px;
	}
`;

export default function HowToDocs() {
	return (
		<Container>
			<h2>How do I use Alekol?</h2>
			<P>Alekol automatically adds or removes a <b>role</b> whether you are <b>logged at school</b>.</P>
			<P>It provides a bunch of <b>commands</b>.</P>
			<h3><InlineCode>/auth</InlineCode></h3>
			<P>This command is used to <b>authenticate</b> yourself with the bot. You will be able to either register or unregister.</P>
			<InfoBox><P>If you call this command in private messages, you will be able to unregister from all the guilds you are in.</P></InfoBox>
			<h3><InlineCode>/ping</InlineCode></h3>
			<P>Pong.</P>
			<h3><InlineCode>/role</InlineCode></h3>
			<P>This command allows you to change the <b>handled role</b> (the role being added or removed by the bot).</P>
			<InfoBox>
				<P>It is reserved for admins or users with the <i>Manage server</i> permission.</P>
				<P>The role needs to exist, and both the user and the bots must have rights over it (otherwise it won't even appear in the list).</P>
			</InfoBox>
			<h3><InlineCode>/spy login</InlineCode></h3>
			<P>This command returns the <b>location</b> of the user with the matching login.</P>
			<InfoBox><P>You need to be registered to the bot in at least one server or in private messages.</P></InfoBox>
			<h3>Troubleshooting</h3>
			<h4>I don't see the role I want to use with the <InlineCode>/role</InlineCode> command</h4>
			<P>The <InlineCode>/role</InlineCode> command returns a list of roles that meet certain constraints:</P>
			<P>The role must be manageable by both the bot and the member (i.e. it must be lower than your highest role).</P>
			<P>The role cannot be <InlineCode>@everyone</InlineCode> or a managed one (e.g. <InlineCode>alekol</InlineCode>, which is managed by the bot).</P>
			<P>If you still don't see the role even though these constraints are met, please <Anchor href="https://github.com/theovgl/bot_alekol/issues/new">open an issue</Anchor>, this is likely a bug.</P>
			<h4>The registration process does not seem to be going as intended</h4>
			<P>If you think the registration process is broken, please <Anchor href="https://github.com/theovgl/bot_alekol/issues/new">open an issue</Anchor>.</P>
		</Container>
	);
}
