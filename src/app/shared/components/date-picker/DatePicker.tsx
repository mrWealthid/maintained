import { FC, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Label from '../form-elements/Label';
import { addDays } from 'date-fns';

interface DateRangeProps {
	startDate: string;
	endDate: string;
	handleStartDate: (date: Date | null) => void;
	handleEndDate: (date: Date | null) => void;
	labelText: string;
	maxEndDate: string | null;
	minEndDate: string | null;
	minStartDate: string | null;
	maxStartDate: string | null;
	required?: boolean;
}

export const DateRangePicker: FC<DateRangeProps> = ({
	startDate,
	endDate,
	handleStartDate,
	handleEndDate,
	labelText,
	maxEndDate = null,
	minEndDate = startDate,
	minStartDate = null,
	maxStartDate = null,
	required = true
}: any) => {
	return (
		<>
			<Label required={required} name={labelText} text={labelText} />
			<section className='flex -mt-2 gap-2 w-full'>
				<DatePicker
					selected={startDate}
					onChange={(date: any) => {
						handleStartDate(date);
						handleEndDate(null); //This will reset end date when state date changes
					}}
					selectsStart
					startDate={startDate}
					endDate={endDate}
					minDate={minStartDate}
					isClearable={true}
					placeholderText='Start Date'
					className='input-style'
					required
				/>
				<DatePicker
					selected={endDate}
					onChange={(date: Date | null) => handleEndDate(date)}
					selectsEnd
					startDate={startDate}
					endDate={endDate}
					minDate={minEndDate}
					isClearable={true}
					maxDate={maxEndDate}
					className='input-style'
					placeholderText='End Date'
					required
				/>
			</section>
		</>
	);
};
