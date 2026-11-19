import localFont from 'next/font/local';
import './globals.css';

const serif = localFont({
  src: [
    { path: '../public/fonts/instrument-serif.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/instrument-serif-italic.ttf', weight: '400', style: 'italic' },
  ],
  variable: '--font-serif', display: 'swap',
});
const sans = localFont({ src: '../public/fonts/dm-sans.ttf', variable: '--font-sans', display: 'swap' });

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3001'),
  title: 'Aqua Dynamics — Made for what moves you',
  description: 'Precision textile manufacturing for wind, water and the world beyond. Made in Sri Lanka. In motion everywhere.',
  icons: { icon: '/images/favicon.svg' },
  openGraph: { title: 'Aqua Dynamics', description: 'Made for what moves you.', images: ['/images/hero.jpg'] },
};

export default function RootLayout({ children }) {
  return <html lang="en" className={`${serif.variable} ${sans.variable}`}><body>{children}</body></html>;
}
