import React, { useState } from 'react';
import {
	Popover,
	PopoverTrigger,
	PopoverContent
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';

const options = [
	{ label: 'Apples', value: 'apples' },
	{ label: 'Bananas', value: 'bananas' },
	{ label: 'Grapes', value: 'grapes' },
	{ label: 'Oranges', value: 'oranges' }
];

export default function MultiSelectCombobox() {
	const [open, setOpen] = useState(false);
	const [selectedValues, setSelectedValues] = useState<string[]>([]);

	const toggleSelection = (value: string) => {
		setSelectedValues((prev) =>
			prev.includes(value)
				? prev.filter((v) => v !== value)
				: [...prev, value]
		);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					role='combobox'
					aria-expanded={open}
					className='w-[300px] justify-between'>
					{selectedValues.length > 0
						? selectedValues.join(', ')
						: 'Select fruits'}
					<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-[300px] p-0'>
				<Command>
					<CommandGroup>
						{options.map((option) => (
							<CommandItem
								key={option.value}
								onSelect={() => toggleSelection(option.value)}>
								<div className='flex items-center gap-2'>
									<Check
										className={cn(
											'h-4 w-4',
											selectedValues.includes(
												option.value
											)
												? 'opacity-100'
												: 'opacity-0'
										)}
									/>
									<span>{option.label}</span>
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
