import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en">
			<Head>
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
