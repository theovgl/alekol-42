import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta property="og:title" content="Alekol" />
				<meta property="og:type" content="website" />
				<meta property="og:description" content="Alekol is a Discord bot to automatically add or remove a role whether you are logged at 42 school." />
				<meta property="og:url" content="https://alekol.42group.fr/" />
				<meta property="og:image" content="https://raw.githubusercontent.com/theovgl/alekol-42/opengraph/apps/site/public/og_image.png?token=GHSAT0AAAAAABTDX5Z76F35BW4PBZXV5EGWYS25ESA" />
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
