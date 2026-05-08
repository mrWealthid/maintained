import { Fragment, useMemo, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { useAutoComplete } from './AutoCompleteHook';
import Label from '../form-elements/Label';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { useDebounce } from '@uidotdev/usehooks';
import { formatCurrency } from '@/utils/helper';
import { Loader2 } from 'lucide-react';
import { ApiResponse } from '../../model/model';

interface AutoCompleteProps<T> {
	service?: (query: string) => Promise<ApiResponse<T[]>>;
	queryKey: string;
	label: string;
	optionKey: string;
	displayValue: keyof T;
	handler: (value: Record<string, unknown>) => void;
	custom?: keyof T;
	initialValue?: T | null;
	required?: boolean;
	staticData?: T[];
}

export default function AutoComplete<T>({
	service,
	queryKey,
	label,
	optionKey = 'id',
	displayValue,
	handler,
	custom,
	required = true,
	initialValue,
	staticData
}: AutoCompleteProps<T>) {
	const [selected, setSelected] = useState<T | null>(initialValue ?? null);
	const [query, setQuery] = useState('');

	const debouncedSearchTerm = useDebounce(query, 1000);

	// If staticData is provided, filter it locally
	const filteredStaticData = useMemo(() => {
		if (!staticData) return [];
		if (!debouncedSearchTerm) return staticData;
		return staticData.filter((item) =>
			(item[displayValue] as string)
				.toLowerCase()
				.includes(debouncedSearchTerm.toLowerCase())
		);
	}, [staticData, debouncedSearchTerm, displayValue]);

	const {
		isRefetching,
		autoCompleteLoading,
		autoCompleteError,
		autoCompleteResult: data
	} = useAutoComplete<T>(debouncedSearchTerm, service!, queryKey);

	const options = staticData ? filteredStaticData : data;

	function handleChangeEvent(val: T) {
		setSelected(val);
		handler({ [queryKey]: val });
	}

	return (
		<div className=' w-full'>
			<Label name={queryKey} text={label} required={required} />
			<Combobox
				value={selected}
				onChange={(selected: T) => handleChangeEvent(selected)}>
				<div className='relative mt-1'>
					<div className=''>
						<Combobox.Input
							id={queryKey}
							className='w-full  input-style  py-2 pl-3 pr-10 text-sm leading-5 '
							displayValue={(result: T) =>
								result ? (result[displayValue] as string) : ''
							}
							onChange={(event) => setQuery(event.target.value)}
						/>
						<Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>
							{isRefetching ? (
								<Loader2 className='h-3 w-3 animate-spin' />
							) : (
								<SelectorIcon
									className='h-5 w-5 '
									aria-hidden='true'
								/>
							)}
						</Combobox.Button>
					</div>
					<Transition
						as={Fragment}
						leave='transition ease-in duration-100'
						leaveFrom='opacity-100'
						leaveTo='opacity-0'
						afterLeave={() => setQuery('')}>
						<Combobox.Options className='absolute bg-card z-50 mt-1 max-h-60 w-full overflow-auto rounded-sm py-1 shadow-xs ring-1 focus:outline-hidden sm:text-sm'>
							{options?.length === 0 && query !== '' ? (
								<div className='relative cursor-default select-none py-2 px-4'>
									Nothing found.
								</div>
							) : (
								options?.map((result: T, idx: number) => (
									<Combobox.Option
										key={
											(result as any)[optionKey] ?? idx // fallback to index if missing
										}
										className={({
											active
										}: {
											active: boolean;
										}) =>
											`relative z-50 cursor-pointer select-none py-2 pl-10 pr-4 ${
												active ? 'bg-secondary' : ''
											}`
										}
										value={result}>
										{({
											selected,
											active
										}: {
											selected: boolean;
											active: boolean;
										}) => (
											<>
												<span
													className={`flex justify-between truncate ${
														selected
															? 'font-medium'
															: 'font-normal'
													} text-xs sm:text-sm`}>
													{
														result[
															displayValue
														] as string
													}

													{custom && (
														<span>
															{custom ===
															'regularPrice'
																? formatCurrency(
																		result[
																			custom
																		]
																	)
																: (result[
																		custom
																	] as string)}
														</span>
													)}
												</span>

												{selected ? (
													<span
														className={`absolute inset-y-0 left-0  text-status-resolved flex items-center pl-3 ${
															active
																? 'bg-secondary '
																: ''
														}`}>
														<CheckIcon
															className='h-5 w-5'
															aria-hidden='true'
														/>
													</span>
												) : null}
											</>
										)}
									</Combobox.Option>
								))
							)}
						</Combobox.Options>
					</Transition>
				</div>
			</Combobox>
		</div>
	);
}
