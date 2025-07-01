import React from 'react';
import SwitchToggle from '../switch/SwitchToggle';

const Header = async () => {
	return (
		<div className='py-4 px-4     dashboard-header  text-sm  items-center w-full  flex justify-end gap-3'>
			{/* <Profile /> */}
			<SwitchToggle />
			{/* <Link href={'/dashboard/account'}>Account</Link> */}
			{/* <Logout /> */}
		</div>
	);
};

export default Header;
