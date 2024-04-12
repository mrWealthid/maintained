import RequestsList from './list/RequestList';

export default function Home() {
	function handleClick(val: number) {}

	return (
		<div className='w-full flex flex-col gap-3'>
			<div className='flex items-center justify-between'>
				<h1 className='title'> All Requests </h1>
			</div>
			<RequestsList />
		</div>
	);
}
