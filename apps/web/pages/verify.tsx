import axios from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/dist/client/router';
import React, { ReactElement, useEffect, useState } from 'react';
import Alert from '../components/alert';
import H1 from '../components/text/h1';
import SubTitle from '../components/text/subtitle';
import { API_BASE_URL } from '../helpers/config';

export default function VerifyPage(): ReactElement {
  const router = useRouter();

  const { t } = useTranslation('verify');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const token = router.query.token;
    if (typeof token == 'undefined' || token == null) return;

    axios
      .post(
        API_BASE_URL + '/auth/verify',
        {
          verification_token: token,
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then((r) => {
        if (r.status == 200) {
          setSuccess(true);
        }
      })
      .catch((e) => {
        if (!e.response) return setError('Network Error');
        setError(e.response.data.error);
      });
  }, [router]);

  return (
    <div className="p-4">
      <SubTitle text="PARTY WITH ME" />
      <H1 text={t('title')}></H1>
      {error ? (
        <Alert
          text={
            error == 'VERIFICATION_TOKEN_NOT_FOUND'
              ? t('verification_token_not_found')
              : t('common:unknown_error')
          }
          type="DANGER"
        />
      ) : null}
      {success ? <Alert text={t('success')} type="SUCCESS" /> : null}
    </div>
  );
}
