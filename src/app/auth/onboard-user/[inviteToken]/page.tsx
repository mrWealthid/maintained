import React, { FC } from 'react';
import OnboardingForm from './onboarding-form';

const Page: FC<{ params: Promise<{ inviteToken: string }> }> = async ({
	params
}) => {
	const { inviteToken } = await params;

	return <OnboardingForm inviteToken={inviteToken} />;
};

export default Page;
