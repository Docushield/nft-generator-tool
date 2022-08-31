import "../styles/globals.css";
import AppWrapper from "@/state/AppWrapper";

function App({ Component, pageProps }) {
  return (
    <>
    <AppWrapper>
      <Component {...pageProps} />
    </AppWrapper>
    </>
  );
}

export default App;
