import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import Layout from '../components/layout';
import H1 from '../components/text/h1';

export default function CommunityGuidelines() {
  const { t } = useTranslation('community-guidelines');

  return (
    <Layout>
      <H1 text={t('title')} />
      <article
        className="prose lg:prose-xl"
        dangerouslySetInnerHTML={{ __html: '<p>123</p>' }}
      ></article>
    </Layout>
  );
}
