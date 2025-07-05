import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '../service/profile.service';
import { ApiResponse } from '@/shared/model/model';

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
