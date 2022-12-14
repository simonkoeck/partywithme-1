import axios from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/dist/client/router';
import React, { ReactElement, useRef, useState } from 'react';
import Alert from '../components/alert';
import PrimaryButton from '../components/buttons/primary-button';
import Layout from '../components/layout';
import TextField from '../components/text-field';
import H1 from '../components/text/h1';
import { HiRefresh } from 'react-icons/hi';
import { API_BASE_URL } from '../helpers/config';
import Meta from '../components/meta';

export default function ResetPasswordPage(): ReactElement {
  const router = useRouter();
  const { token } = router.query;

  const { t } = useTranslation('reset-password');

  const password = useRef<HTMLInputElement>();
  const repeatPassword = useRef<HTMLInputElement>();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  async function submit() {
    if (password.current.value != repeatPassword.current.value) {
      setError('PASSWORDS_DONT_MATCH');
      return;
    }

    try {
      const r = await axios.post(
        API_BASE_URL + '/auth/reset_password',
        {
          password_reset_token: token,
          password: password.current.value,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (r.status == 200) setSuccess(true);
    } catch (e) {
      if (typeof e.response == 'undefined') setError('NETWORK_ERROR');
      setError(e.response.data.error);
    }
  }

  return (
    <Layout>
      <Meta title={'Party With Me | ' + t('title')} description="" />
      <div className="mb-5">
        <H1 text={t('title')}></H1>
      </div>

      {success ? (
        <Alert text={t('success')} type="SUCCESS" />
      ) : error ? (
        <Alert
          text={
            error == 'TOKEN_NOT_FOUND'
              ? t('token_not_found')
              : error == 'TOKEN_EXPIRED'
              ? t('token_expired')
              : error == 'SAME_PASSWORD'
              ? t('same_password')
              : error == 'PASSWORDS_DONT_MATCH'
              ? t('passwords_dont_match')
              : t('common:unknown_error')
          }
          type="DANGER"
        />
      ) : null}
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        method="POST"
      >
        <TextField
          inputType="password"
          reference={password}
          label={t('common:password')}
        />
        <TextField
          inputType="password"
          reference={repeatPassword}
          label={t('common:repeat_password')}
        />
        <br />
        <PrimaryButton
          icon={<HiRefresh />}
          text={t('submit_btn')}
          onClick={(e) => {
            submit();
          }}
        />
      </form>
    </Layout>
  );
}
