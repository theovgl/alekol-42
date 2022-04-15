import { createGlobalStyle, ThemeProvider } from 'styled-components'
import 'normalize.css/normalize.css';

const GlobalStyle = createGlobalStyle`
	body {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		background-color: #090909;
		color: white;
		font-family: Inter;
	}

	h1 {
		font-weight: 900;
	}

	@font-face {
		font-family: "Inter";
		src: url("/fonts/Inter/static/Inter-Black.ttf");
		font-weight: 900;
		font-style: black;
	}

	@font-face {
		font-family: "Inter";
		src: url("/fonts/Inter/static/Inter-Regular.ttf");
		font-weight: 400;
		font-style: regular;
	}

	@font-face {
		font-family: "Inter";
		src: url("/fonts/Inter/static/Inter-Bold.ttf");
		font-weight: 700;
		font-style: bold;
	}
`

const theme = {
	colors: {
		primary: '#0070f3',
	},
}

export default function App({ Component, pageProps }) {
	return (
		<>
			<GlobalStyle />
			<ThemeProvider theme={theme}>
				<Component {...pageProps} />
			</ThemeProvider>
		</>
	)
}
