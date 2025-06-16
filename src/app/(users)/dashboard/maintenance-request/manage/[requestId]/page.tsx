import MaintenanceForm from '@/components/shared/maintenance/form/MaintenanceRequest';
import { findData } from '@/utils/apiRequests';
import { FC } from 'react';

const Page: FC<{ params: { requestId: string } }> = async ({ params }) => {
	const requestId = params.requestId;
	const { data } = await findData('api/maintenance/request', requestId);

	return (
		<>
			<MaintenanceForm maintenanceRequest={requestId ? data : null} />
		</>
	);
};

export default Page;
