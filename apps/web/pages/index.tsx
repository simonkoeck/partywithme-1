/* eslint-disable @next/next/no-img-element */
import PrimaryButton from '../components/buttons/primary-button';
import Layout from '../components/layout';
import { HiDownload } from 'react-icons/hi';
import { FaBirthdayCake, FaMap } from 'react-icons/fa';
import { useRouter } from 'next/router';
import SubTitle from '../components/text/subtitle';
import { ReactElement } from 'react';
import Meta from '../components/meta';
import H2 from '../components/text/h2';

export function Index() {
  const router = useRouter();

  return (
    <Layout contentPadding={false}>
      <Meta
        title="Party With Me"
        description="Create and find parties with your friends"
      />
      <div className="relative w-full">
        <img
          alt=""
          src="/images/dots.svg"
          className="absolute sm:top-[-3rem] right-0 sm:w-auto w-32 top-[-8rem]"
        />
        <div className="relative flex flex-row w-full gap-4 p-6 mx-auto my-16 justify-evenly sm:w-4/5">
          <div className="justify-center hidden w-full md:flex">
            <img
              alt="preview"
              src="/images/preview.png"
              className="w-2/5 rounded-lg drop-shadow-xl"
            />
          </div>
          <div className="w-full pt-24">
            <h1 className="text-6xl font-black">Party With Me</h1>
            <p className="mt-2 text-xl font-semibold text-gray-500">
              Create and find parties with your friends
            </p>
            <div className="mt-8">
              <PrimaryButton
                text="Download now"
                onClick={() => {
                  router.push('/download');
                }}
                icon={<HiDownload />}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="px-10 sm:px-24" id="features">
        <div className="">
          <SubTitle text="FEATURES" />
          <H2 text="What we offer" />
        </div>
        <div className="relative flex flex-row flex-wrap justify-center w-full my-10 gap-x-28 gap-y-10">
          <FeatureItem
            title="Parties"
            description="Create and manage all your parties at a glance."
            icon={<FaBirthdayCake />}
          />
          <FeatureItem
            title="Friends"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis tortor non ex suscipit scelerisque. Nam et pretium purus. Praesent tempor enim gravida leo lobortis molestie. Nulla et elementum velit. Morbi convallis magna faucibus dignissim faucibus."
            icon={<FaBirthdayCake />}
          />
          <FeatureItem
            title="Chat"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis tortor non ex suscipit scelerisque. Nam et pretium purus. Praesent tempor enim gravida leo lobortis molestie. Nulla et elementum velit. Morbi convallis magna faucibus dignissim faucibus."
            icon={<FaBirthdayCake />}
          />
          <FeatureItem
            title="Maps"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis tortor non ex suscipit scelerisque. Nam et pretium purus. Praesent tempor enim gravida leo lobortis molestie. Nulla et elementum velit. Morbi convallis magna faucibus dignissim faucibus."
            icon={<FaMap />}
          />
        </div>
      </div>
    </Layout>
  );
}

interface FeatureItemProps {
  title: string;
  description: string;
  icon: ReactElement;
}

function FeatureItem({ title, description, icon }: FeatureItemProps) {
  return (
    <div className="flex flex-row items-center w-full gap-10 md:w-2/5">
      <div className="bg-[#3b83f652] rounded-full p-5">
        <span className="text-3xl text-primary">{icon}</span>
      </div>
      <div>
        <h3 className="mb-2 text-2xl font-bold text-gray-800">{title}</h3>
        <p className="leading-relaxed text-gray-700">{description}</p>
      </div>
    </div>
  );
}

export default Index;
