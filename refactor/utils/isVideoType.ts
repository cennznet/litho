export default function isVideoType(extension: string): boolean {
	switch (extension) {
		case "mov":
		case "webm":
		case "mp4":
		case "ogv":
			return true;
		default:
			return false;
	}
}
