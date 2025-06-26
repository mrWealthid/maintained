import React from 'react';
import SwitchToggle from '../switch/SwitchToggle';

const Header = async () => {
	return (
		<div className='py-4 px-4  card text-sm  items-center w-full flex justify-end gap-3 text-black dark:text-white'>
			{/* <Profile /> */}
			<SwitchToggle />
			{/* <Link href={'/dashboard/account'}>Account</Link> */}
			{/* <Logout /> */}
		</div>
	);
};

export default Header;
