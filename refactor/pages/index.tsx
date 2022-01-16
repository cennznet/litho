import { DOMComponentProps } from "@refactor/custom";
import App from "@refactor/components/App";
import Main from "@refactor/components/Main";
import Header from "@refactor/components/Header";
import Footer from "@refactor/components/Footer";

export async function getStaticProps() {
  return {
    props: { refactored: true },
  };
}

type HomeProps = {};

export function Home(props: DOMComponentProps<HomeProps, "div">) {
  return (
    <App>
      <Main>
        <Header />
        <Footer />
      </Main>
    </App>
  );
}
