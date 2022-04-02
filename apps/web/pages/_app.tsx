// import 'tailwindcss/tailwind.css';
import '../styles/global.css';
import '../styles/legal.css';
import NextNProgress from 'nextjs-progressbar';

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <NextNProgress
        height={3}
        color="var(--primary-color)"
        options={{ showSpinner: false }}
      />
      <div className="font-default">
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
