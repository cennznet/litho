import NextDocument, { Html, Head, Main, NextScript } from "next/document";

const gaID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;

export class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head>
          {!!gaID && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${gaID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaID}', {
                page_path: window.location.pathname,
              });
            `,
                }}
              />
            </>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
