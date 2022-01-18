import { DOMComponentProps } from "@refactor/types";
import App from "@refactor/components/App";
import Main from "@refactor/components/Main";

export async function getStaticProps() {
  return {
    props: { refactored: true },
  };
}

type PageProps = {};

export function Home(props: DOMComponentProps<PageProps, "div">) {
  return (
    <App>
      <Main></Main>
    </App>
  );
}
