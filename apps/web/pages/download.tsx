import { useRouter } from 'next/dist/client/router';
import React, { ReactElement, useEffect } from 'react';
import Meta from '../components/meta';
import useMobileDetect from '../hooks/useMobileDetect';
import playButton from '../public/assets/images/google_play.png';
import Image from 'next/image';
import H1 from '../components/text/h1';
import SubTitle from '../components/text/subtitle';
import useTranslation from 'next-translate/useTranslation';

export default function DownloadPage(): ReactElement {
  const { isAndroid, isIos } = useMobileDetect();
  const router = useRouter();

  const { t } = useTranslation('download');

  useEffect(() => {
    if (isAndroid())
      router.replace(
        'https://play.google.com/store/apps/details?id=com.simplifysoftware.partywithme'
      );
  }, []);

  return (
    <>
      <Meta
        title="Party With Me | Download"
        description="Party With Me jetzt downloaden!"
      ></Meta>
      <div className="w-full md:w-1/2 p-3">
        <SubTitle text="Party with me" />
        <H1 text={t('title')} />
        <div className="w-1/2 m-auto mt-8">
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
      </div>
    </>
  );
}
