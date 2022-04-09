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
