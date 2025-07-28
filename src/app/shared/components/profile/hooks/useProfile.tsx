import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProfile, switchBusiness } from '../service/profile.service';
import { ApiResponse, User } from '@/app/shared/model/model';
import toast from 'react-hot-toast';
import { ApiError } from 'next/dist/server/api-utils';
import { useRouter } from 'next/navigation';

export function useProfile<T>() {
	const { isLoading, data, error } = useQuery({
		queryKey: ['profile'],
		queryFn: () => fetchProfile<ApiResponse<T>>()
	});

	return {
		isLoading,
		error,
		data: data?.data
	};
}

export function useSwitchBusiness() {
	const queryClient = useQueryClient();
	const router = useRouter();
	const { isPending: isSwitching, mutate: handleSwitchCurrentBusiness } =
		useMutation<{ data: User }, ApiError, { currentBusiness: string }>({
			mutationFn: switchBusiness,

			onSuccess: ({ data }) => {
				toast.success('Business switched successfully');

				const currentMembership = data.memberships.find(
					(m) => m.business === data.currentBusiness
				);

				const role = currentMembership?.role;

				// Navigate based on role
				const prefix = role === 'USER' ? '' : role?.toLowerCase();

				const route = `/${prefix ? prefix + '/' : ''}dashboard`;
				router.push(route);

				queryClient.invalidateQueries();

				// router.refresh();
			},
			onError: (err: ApiError) => toast.error(err.message)
		});

	return { isSwitching, handleSwitchCurrentBusiness };
}
