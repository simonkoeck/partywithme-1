import useTranslation from 'next-translate/useTranslation';
import React, { ReactElement } from 'react';
import Layout from '../components/layout';
import H1 from '../components/text/h1';
import SubTitle from '../components/text/subtitle';

export default function AboutUsPage(): ReactElement {
  const { t } = useTranslation('about-us');
  return (
    <Layout>
      <H1 text={t('title')} />
      <div className="text-gray-600 my-5">{t('pre_text')}</div>
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: t('text') }}
      ></article>
    </Layout>
  );
}
