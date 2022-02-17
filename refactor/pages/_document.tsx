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

          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.twttr = (function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0],
    t = window.twttr || {};
  if (d.getElementById(id)) return t;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);

  t._e = [];
  t.ready = function(f) {
    t._e.push(f);
  };

  return t;
}(document, "script", "twitter-wjs"));
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
