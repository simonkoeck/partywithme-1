import { useRouter } from 'next/dist/client/router';
import React, { ReactElement, useEffect } from 'react';
import Meta from '../components/meta';
import useMobileDetect from '../hooks/useMobileDetect';
import playButton from '../public/assets/images/google_play.png';
import Image from 'next/image';
import H1 from '../components/text/h1';
import useTranslation from 'next-translate/useTranslation';
import Layout from '../components/layout';

export default function DownloadPage(): ReactElement {
  const { isAndroid, isIos } = useMobileDetect();
  const router = useRouter();

  const { t } = useTranslation('download');

  useEffect(() => {
    if (isAndroid())
      router.replace(
        'https://play.google.com/store/apps/details?id=com.simplifysoftware.partywithme'
      );
  }, [isAndroid, router]);

  return (
    <>
      <Meta title="Party With Me | Download" description={t('title')}></Meta>
      <Layout>
        <H1 text={t('title')} />
        <div className="w-1/3 m-auto mt-8">
          <Image
            src={playButton}
            alt="Play Store"
            className="cursor-pointer"
            onClick={(e) => {
              window.location.href =
                'https://play.google.com/store/apps/details?id=com.simplifysoftware.partywithme';
            }}
          />
        </div>
      </Layout>
    </>
  );
}
