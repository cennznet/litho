import { Api } from "@cennznet/api";
import { DOMComponentProps, NFTData, NFTId, NFTListing } from "@refactor/types";
import { fetchAllOpenListingIds } from "@refactor/utils/fetchLatestOpenListingIds";
import fetchAppProps from "@refactor/utils/fetchAppProps";
import fetchListingItem from "@refactor/utils/fetchListingItem";
import fetchNFTData from "@refactor/utils/fetchNFTData";
import findListingIdByTokenId from "@refactor/utils/findListingIdByTokenId";
import Breadcrumb from "@refactor/components/Breadcrumb";
import Link from "@refactor/components/Link";
import NFTDetail from "@refactor/components/NFTDetail";
import { indexAllOpenListingItems } from "@refactor/utils/findListingIdByTokenId";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Main from "@refactor/components/Main";
import isFinite from "lodash/isFinite";
import { NextSeo } from "next-seo";
import isVideoType from "@refactor/utils/isVideoType";
import { useEffect, useState } from "react";

const bem = createBEMHelper(require("./[serialNumber].module.scss"));

export async function getStaticPaths() {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});

	await indexAllOpenListingItems(api);

	const allOpenListingIds = await fetchAllOpenListingIds(api);

	const paths = (
		await Promise.all(
			allOpenListingIds
				.map(([, listingIds]) =>
					listingIds.slice(0, 3).map((listingId) =>
						fetchListingItem(api, listingId).then((listing) => {
							if (!listing?.tokenId) return;
							const tokenId = listing.tokenId;
							return {
								params: {
									collectionId: tokenId[0].toString(),
									seriesId: tokenId[1].toString(),
									serialNumber: tokenId[2].toString(),
								},
							};
						})
					)
				)
				.flat()
		)
	).filter(Boolean);

	return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});

	const { collectionId, seriesId, serialNumber } = params;
	const tokenId: NFTId = [
		parseInt(collectionId, 10),
		parseInt(seriesId, 10),
		parseInt(serialNumber, 10),
	];
	const listingId = await findListingIdByTokenId(api, tokenId);
	const listing = isFinite(listingId)
		? await fetchListingItem(api, listingId)
		: null;

	const data = await fetchNFTData(api, tokenId);

	if (!data?.metadata)
		return {
			notFound: true,
			props: {
				refactored: true,
			},
		};

	return {
		props: {
			refactored: true,
			appProps: await fetchAppProps(api),
			listingItem: { ...listing, ...data, tokenId },
		},
		revalidate: 60,
	};
}

type PageProps = {
	listingItem: NFTData & Partial<NFTListing>;
};

export function NFTSingle({
	listingItem,
}: DOMComponentProps<PageProps, "div">) {
	const { tokenId, metadata, metadataIPFSUrl, imageIPFSUrl } = listingItem;
	const isVideo = isVideoType(metadata.properties.extension);
	const [tweetUrl, setTweetUrl] = useState<string>(
		"https://twitter.com/intent/tweet"
	);
	const title = `${metadata.name} #${tokenId[2]}`;

	useEffect(() => {
		const { href } = window.location;

		setTweetUrl(
			`https://twitter.com/intent/tweet?text=${encodeURIComponent(
				title
			)}&url=${encodeURIComponent(href)}`
		);
	}, [title]);

	return (
		<Main>
			<NextSeo
				title={title}
				description={metadata?.description}
				twitter={{ cardType: "summary" }}
				openGraph={{
					images: [!isVideo && { url: `${metadata.image}?tr=w-800` }].filter(
						Boolean
					),
				}}
			/>
			<div className={bem("content")}>
				<Breadcrumb className={bem("breadcrumb")}>
					<Link href="/marketplace">Marketplace</Link>
					<Link href={`/collection/${tokenId[0]}`}>
						Collection #{tokenId[0]}
					</Link>
					<span>{metadata.name}</span>
				</Breadcrumb>

				<NFTDetail listingItem={listingItem} className={bem("detail")} />

				<nav className={bem("externalLinks")}>
					{!!imageIPFSUrl && <Link href={imageIPFSUrl}>View on IPFS</Link>}
					{!!metadataIPFSUrl && (
						<Link href={metadataIPFSUrl}>Metadata IPFS</Link>
					)}
					<Link className={bem("tweet")} href={tweetUrl}>
						Share on Twitter
					</Link>
				</nav>
			</div>
		</Main>
	);
}
