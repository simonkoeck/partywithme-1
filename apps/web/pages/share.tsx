import { useRouter } from 'next/dist/client/router';
import React, { ReactElement, useEffect } from 'react';
import Meta from '../components/meta';
import H1 from '../components/text/h1';
import SubTitle from '../components/text/subtitle';
import playButton from '../public/assets/images/google_play.png';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

export default function SharePage(): ReactElement {
  const router = useRouter();
  const { type, id } = router.query;

  const { t } = useTranslation('share');

  useEffect(() => {
    if (typeof type != 'undefined') {
      if (type != 'user' && type != 'party') router.replace('/');
      else {
        window.location.href = `pwm://partywithme/${type}?id=${id}`;
      }
    }
  }, [type, id, router]);

  return (
    <>
      <Meta title="Party With Me" description="Finde Parties in deiner Nähe!" />
      <div className="p-3 flex h-screen w-screen">
        <div className="m-auto">
          <div className="w-screen md:w-auto">
            <SubTitle text="Party With Me" />
            <H1 text={t('title', { type: t('common:' + type) })} />
            <div className="w-11/12 mt-14">
              <a
                className="font-bold text-white bg-primary py-2 px-5 rounded-md block text-center"
                href={`pwm://partywithme/${type}?id=${id}`}
              >
                {t('open_in_app')}
              </a>
            </div>
            <hr className="my-4" />
            <div className="w-11/12">
              <p className="text-center text-gray-500 mb-3 italic">
                {t('not_downloaded_yet')}
              </p>
              <div className="w-1/2 m-auto">
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

              {/* <a
                className="font-bold text-white bg-primary py-2 px-5 rounded-md block text-center"
                href=
              >
                Im Play Store downloaden
              </a> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
