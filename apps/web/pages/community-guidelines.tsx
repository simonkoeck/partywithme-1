import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import Alert from '../components/alert';
import Layout from '../components/layout';
import Meta from '../components/meta';
import H1 from '../components/text/h1';

export default function CommunityGuidelines() {
  const { t, lang } = useTranslation('community-guidelines');

  return (
    <Layout>
      <Meta title={'Party With Me | ' + t('title')} description="" />
      <H1 text={t('title')} />
      {lang != 'en' && (
        <Alert
          text={t('common:not_available_in_current_language')}
          type="INFO"
        />
      )}
      <article
        className="prose"
        dangerouslySetInnerHTML={{
          __html: `<p>
          We define hate speech as content that does or intends to attack, threaten, incite violence against, or dehumanize an individual or a group of individuals on the basis of protected attributes. We also do not allow content that verbally or physically threatens violence or depicts harm to an individual or a group based on any of the following protected attributes:</p>
          <ul>
    <li>Race</li>
    <li>Ethnicity</li>
    <li>National origin</li>
    <li>Religion</li>
    <li>Caste </li>
    <li>Sexual orientation</li>
    <li>Sex</li>
    <li>Gender</li>
    <li>Gender identity</li>
    <li>Serious disease or disability</li>
    <li>Immigration status</li>
    </ul>

<p><b>Do not post:</b></p>

    Content that dehumanizes or incites violence or hatred against individuals or groups, based on the attributes listed above, including but not limited to: 
        claiming that they are physically or morally inferior
        calling for or justifying violence against them
        claiming that they are criminals 
        referring negatively to them as animals, inanimate objects, or other non-human entities 
        promoting or justifying exclusion, segregation, or discrimination against them
`,
        }}
      ></article>
    </Layout>
  );
}
