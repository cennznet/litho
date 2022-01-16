import { DOMComponentProps } from "@refactor/custom";
import App from "@refactor/components/App";
import Main from "@refactor/components/Main";

export async function getStaticProps() {
  return {
    props: { refactored: true },
  };
}

type HomeProps = {};

export function Home(props: DOMComponentProps<HomeProps, "div">) {
  return (
    <App>
      <Main></Main>
    </App>
  );
}
