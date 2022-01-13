// import 'tailwindcss/tailwind.css';
import '../styles/global.css';
import '../styles/legal.css';

function MyApp({ Component, pageProps }) {
  return (
    <div className="font-default">
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
