export default function trackPageview(url: string) {
	if (!window.gtag) return;

	console.log("trackPageview", { url });

	window.gtag("config", process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
		page_path: url,
	});
}
