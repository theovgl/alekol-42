import styled, { keyframes } from "styled-components";

const StareAnimation = keyframes`
	0% { transform: translate(0); }
	20% { transform: translate(50px); }
	40% { transform: translate(50px); }
	55% { transform: translate(50px); }
	75% { transform: translate(0); }
	100% { transform: translate(0); }
`;

const Pupils = styled.g`
	animation-name: ${StareAnimation};
	animation-duration: 3.5s;
	animation-iteration-count: infinite;
`;

const Svg = styled.svg`
	width = 100px;
`;

function Loader() {
	return (
		<Svg width="65" version="1.1" viewBox="0 0 588.58 475" xmlns="http://www.w3.org/2000/svg">
			<g transform="translate(-1010.8 -230.23)">
				<g transform="translate(685.28 563.99)" fill="#aeaeae">
				<rect x="325.57" y="-333.76" width="330" height="475" ry="163.01"/>
				<rect x="584.15" y="-333.76" width="330" height="475" ry="163.01"/>
				</g>
				<g transform="translate(32.867 -40.858)">
					<rect x="997.98" y="291.09" width="290" height="435" ry="149.28" fill="#ddd"/>
					<path d="m1143 291.09c80.33 0 100.32 66.579 100.32 149.28v136.44c0 82.701-19.986 149.28-100.32 149.28s-145-66.579-145-149.28v-136.44c0-82.701 64.67-149.28 145-149.28z" fill="#fefefe" strokeLinecap="round" strokeLinejoin="round" strokeWidth="18.914"/>
					<rect x="1256.6" y="291.09" width="290" height="435" ry="149.28" fill="#ddd"/>
					<path d="m1401.6 291.09c80.33 0 100.32 66.579 100.32 149.28v136.44c0 82.701-19.986 149.28-100.32 149.28s-145-66.579-145-149.28v-136.44c0-82.701 64.67-149.28 145-149.28z" fill="#fefefe" strokeLinecap="round" strokeLinejoin="round" strokeWidth="18.914"/>
				</g>
				<Pupils>
					<g transform="translate(-76.706 -3.1937)">
					<rect x="1125.6" y="366.93" width="145" height="235" ry="72.5" fill="#311c40"/>
					<ellipse transform="rotate(135)" cx="-570.37" cy="-1173.5" rx="18.179" ry="22.709" fill="#fff"/>
					</g>
					<g transform="translate(181.88 -3.1937)">
						<rect x="1125.6" y="366.93" width="145" height="235" ry="72.5" fill="#311c40"/>
						<ellipse transform="rotate(135)" cx="-570.37" cy="-1173.5" rx="18.179" ry="22.709" fill="#fff"/>
					</g>
				</Pupils>
			</g>
		</Svg>
	)
};

export default Loader;
