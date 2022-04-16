import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta property="og:title" content="Alekol" />
				<meta property="og:type" content="website" />
				<meta property="og:description" content="Alekol is a Discord bot to automatically add or remove a role whether you are logged at 42 school." />
				<meta property="og:url" content="https://alekol.42group.fr/" />
				<meta property="og:image" content="https://i.ibb.co/ydr94Nk/og-image.png" />
				<link rel='icon' href='/favicon.svg'/>
				<link rel='preload' href='/fonts/Inter/static/Inter-Black.ttf' as='font' crossOrigin='' type='font/ttf'/>
				<link rel='preload' href='/fonts/Inter/static/Inter-Regular.ttf' as='font' crossOrigin='' type='font/ttf'/>
				<link rel='preload' href='/fonts/Inter/static/Inter-Bold.ttf' as='font' crossOrigin='' type='font/ttf'/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}
