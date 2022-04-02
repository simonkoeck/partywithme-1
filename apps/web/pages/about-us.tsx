import useTranslation from 'next-translate/useTranslation';
import React, { ReactElement } from 'react';
import Alert from '../components/alert';
import Layout from '../components/layout';
import Meta from '../components/meta';
import H1 from '../components/text/h1';
import SubTitle from '../components/text/subtitle';

export default function AboutUsPage(): ReactElement {
  const { t, lang } = useTranslation('about-us');
  return (
    <Layout>
      <Meta title={'Party With Me | ' + t('title')} description="" />
      <H1 text={t('title')} />
      {lang != 'de' && (
        <Alert
          text={t('common:not_available_in_current_language')}
          type="INFO"
        />
      )}
      <div className="my-5 text-gray-600">{t('pre_text')}</div>
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: t('text') }}
      ></article>
    </Layout>
  );
}
