import React from 'react';
import SwitchToggle from '../switch/SwitchToggle';

const Header = async () => {
	return (
		<div className='dashboard-header  text-sm  justify-between items-center  flex  gap-3'>
			{/* <Profile /> */}

			<SwitchToggle />
			{/* <Link href={'/dashboard/account'}>Account</Link> */}
			{/* <Logout /> */}
		</div>
	);
};

export default Header;
