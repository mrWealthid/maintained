import React, { FC, Fragment } from 'react';
import { FaCircle } from 'react-icons/fa';
import { getStatusColor } from '@/utils/helper';
import { CiUser } from 'react-icons/ci';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { HiEye, HiPencil, HiTrash } from 'react-icons/hi2';
import ConfirmationPage from '../../components/ui/ConfirmationPage';
import { useDeleteTicket } from '@/app/shared/ticket-feat/hooks/ticketHooks';
import { Ticket } from '@/app/shared/model/model';
import Modal from '../../components/modal/Modal';
import { ROUTES_DEFINITION } from '@/app/shared/routes/routes';
import { TfiMore } from 'react-icons/tfi';
import { ROLES } from '../../enums/enums';
// import { useLayoutContext } from '../../contexts/LayoutContextProvider';
// import MiddlewareFeatures from '@/middlewareFeatures';

const TicketCard: FC<Ticket> = ({
	title,
	description,
	status,
	_id: id,
	createdAt,
	user,
	area,
	category
}) => {
	const { isDeleting, handleDeleteTicket } = useDeleteTicket();

	// const { data: currentUser } = useLayoutContext();
	function handleDelete(onCloseModal: () => void) {
		handleDeleteTicket(id, {
			onSuccess: () => onCloseModal()
		});
	}

	// const verify = new MiddlewareFeatures().verifyToken();

	return (
		<section className='request-card w-full border'>
			<div className='flex items-center flex-wrap justify-between w-full text-xs'>
				<section className='flex gap-5 items-center'>
					<time className='text-gray-500 dark:text-white'>
						<p>{new Date(createdAt).toLocaleDateString()}</p>
					</time>
					<span title={area} className='request-card__details'>
						{area}
					</span>
				</section>

				<section>
					<span className='request-card__details '>
						<FaCircle color={`${getStatusColor(status)}`} />
						{status}
					</span>

					{/* {status} */}
				</section>
			</div>

			<div className='group'>
				<h3
					title={title}
					className='mt-3 text-lg font-semibold title leading-6   dark:group-hover:text-white '>
					{title}
				</h3>
				<p className='mt-5 line-clamp-3 description text-sm leading-6 '>
					{description}
				</p>
			</div>

			<div className='w-full mt-8 flex  flex-wrap text-xs justify-between items-center gap-x-4'>
				<span className='request-card__details'>
					<CiUser />
					<span className='ellipsis-overflow'>{user.name}</span>
				</span>
				<span
					title={'category:' + category.name}
					className='request-card__details'>
					<i className='fa-regular fa-user'></i>
					<span className='ellipsis-overflow'>{category.name}</span>
				</span>

				{/* <section className='flex request-card__details gap-2 items-center text-xs'>
					<span>View</span>
					<span>{<FaEye className='text-primary' />}</span>
				</section> */}
				<section className='flex gap-2 items-center text-xs'>
					<Modal>
						<Menu
							as='div'
							className='relative  inline-block text-left'>
							{({ open }) => (
								<>
									<div>
										<Menu.Button
											className={`inline-flex  w-full justify-center rounded-full border p-3 text-sm font-medium

		  ${open ? 'ring-1 ring-button-primary ring-offset-1  ' : ''}
		`}>
											<TfiMore />
										</Menu.Button>
									</div>
									<Transition
										as={Fragment}
										enter='transition ease-out duration-100'
										enterFrom='transform opacity-0 scale-95'
										enterTo='transform opacity-100 scale-100'
										leave='transition ease-in duration-75'
										leaveFrom='transform opacity-100 scale-100'
										leaveTo='transform opacity-0 scale-95'>
										<Menu.Items className='absolute  bg-card border z-50 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md  shadow-lg ring-1 ring-black/5 focus:outline-none'>
											<div className='px-1 py-1'>
												<Menu.Item>
													{({ active }) => (
														<Link
															href={`bookings/`}
															className='group gap-2 flex w-full  duration-700 transition-all hover:bg-secondary   items-center rounded-md px-2 py-2 text-sm'>
															{active ? (
																<HiEye />
															) : (
																<HiEye />
															)}
															View Details
														</Link>
													)}
												</Menu.Item>

												{'USER' === ROLES.user && (
													<Menu.Item>
														{({ active }) => (
															<Link
																href={`
																${ROUTES_DEFINITION.DASHBOARD.MANAGE_TICKET}/
																${id}
															`}
																className='group gap-2 flex w-full  duration-700 transition-all hover:bg-secondary    items-center rounded-md px-2 py-2 text-sm'>
																{active ? (
																	<HiPencil color='green' />
																) : (
																	<HiPencil color='green' />
																)}
																Edit Details
															</Link>
														)}
													</Menu.Item>
												)}

												<Menu.Item>
													{({ active }) => (
														<Modal.Open opens='delete-ticket'>
															<button className='group gap-2 flex w-full  duration-700 transition-all hover:bg-secondary   items-center rounded-md px-2 py-2 text-sm'>
																{active ? (
																	<HiTrash color='red' />
																) : (
																	<HiTrash color='red' />
																)}
																Delete
															</button>
														</Modal.Open>
													)}
												</Menu.Item>
											</div>
										</Menu.Items>
									</Transition>
								</>
							)}
						</Menu>

						<Modal.Window
							name='delete-ticket'
							title='Delete Maintenance Ticket'
							description='Request ticket will be deleted permanently'>
							<ConfirmationPage
								handler={(onCloseModal: () => void) => {
									handleDelete(onCloseModal);
								}}
								isLoading={isDeleting}
								modalText={
									'Are you sure you want to delete this ticket'
								}
							/>
						</Modal.Window>
					</Modal>
				</section>
			</div>
		</section>
	);
};

export default TicketCard;
