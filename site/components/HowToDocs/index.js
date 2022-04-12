import InlineCode from '../InlineCode';
import InfoBox from '../InfoBox';
import styled from 'styled-components';

const Container = styled.div`
	margin: 40px 0;
	width: 600px;
`;

export default function HowToDocs() {
	return (
		<Container>
			<h2>How do I use Alekol?</h2>
			<p>Alekol automatically adds or removes a <b>role</b> whether you are <b>logged at school</b>.</p>
			<p>It provides a bunch of <b>commands</b>.</p>
			<h3><InlineCode>/auth</InlineCode></h3>
			<p>This command is used to <b>authenticate</b> yourself with the bot. You will be able to either register or unregister.</p>
			<h3><InlineCode>/ping</InlineCode></h3>
			<p>Pong.</p>
			<h3><InlineCode>/role</InlineCode></h3>
			<p>This command allows you to change the <b>handled role</b> (the role being added or removed by the bot).</p>
			<InfoBox>
				<p>It is reserved for admins or users with the <i>Manage server</i> permission.</p>
				<p>The role needs to exist, and both the user and the bots must have rights over it (otherwise it won't even appear in the list).</p>
			</InfoBox>
			<h3><InlineCode>/spy login</InlineCode></h3>
			<p>This command returns the <b>location</b> of the user with the matching login.</p>
			<InfoBox><p>You need to be registered to the bot in at least one server or in private messages.</p></InfoBox>
		</Container>
	);
}