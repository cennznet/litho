export default function parseDescriptionForViewStoryLink(
	description: string
): [string, string, string] {
	const regex =
		/(\shere)*:\s[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
	const matches = [...Array.from(description.matchAll(regex))];

	if (!matches?.length) return [description, null, null];

	const [match0] = matches[0];

	const [startDescription, endDescription] = description.split(match0);

	return [startDescription, match0.replace(/(\shere)*:\s/, ""), endDescription];
}
