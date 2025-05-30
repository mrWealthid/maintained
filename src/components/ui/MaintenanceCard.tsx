import React from 'react';
import { IRequest } from '../shared/model/model';
import { FaCircle } from 'react-icons/fa';
import { getStatusColor } from '@/utils/helper';
import { CiUser } from 'react-icons/ci';

const MaintenanceCard = ({
	title,
	description,
	status,
	_id: id,
	createdAt,
	images,
	videos,
	user,
	area,
	category
}: IRequest) => {
	return (
		<section className='request-card'>
			<div className='flex items-center justify-between w-full text-xs'>
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
					className='mt-3 text-lg font-semibold title leading-6  dark:text-gray-400 text-primary dark:group-hover:text-white group-hover:text-gray-600'>
					{title}
				</h3>
				<p className='mt-5 line-clamp-3 description text-sm leading-6 text-gray-600  dark:text-gray-400'>
					{description}
				</p>
			</div>

			<div className='w-full mt-8 flex text-xs justify-between items-center gap-x-4'>
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

				<section className='flex gap-2 items-center text-xs'>
					<span className='article-url' title='External URL'>
						<a
							target='_blank'
							href='{{ article.url }}'
							className='relative z-10 rounded-full flex items-center gap-2 bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100'>
							view
							<i className='fa-solid fa-arrow-up-right-from-square'></i>
						</a>
					</span>

					{/* <div className='w-full flex justify-end'>
				<button className='btn  rounded-3xl !py-1 px-2 btn-primary !w-1/3'>
					View
				</button>
			</div> */}
				</section>
			</div>
		</section>
	);
};

export default MaintenanceCard;

// <article class="card">
//   <div class="flex items-center gap-x-4 text-xs">
//     <time class="text-gray-500">
//       <p>{{ article.publishedAt | date : "medium" || "Unavailable" }}</p>
//     </time>
//     <span
//       title="{{ article.source.name }}"
//       class="z-10 rounded-full bg-gray-50 px-3 source py-1.5 font-medium text-gray-600 hover:bg-gray-100"
//       >{{ article.source.name || "Anonymous" }}</span
//     >

//     <span
//       *ngIf="isViewed"
//       title="Viewed"
//       class="relative z-10 flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
//     >
//       <i class="fa-regular fa-eye"></i>
//       Seen</span
//     >
//   </div>
//   <div class="group">
//     <h3
//       title="{{ article.title }}"
//       class="mt-3 text-lg font-semibold title leading-6 text-primary group-hover:text-gray-600"
//     >
//       {{ article.title || "Title is unavailable" }}
//     </h3>
//     <p class="mt-5 line-clamp-3 description text-sm leading-6 text-gray-600">
//       {{
//         article.description ||
//           article.content ||
//           "Content summary is unavailable, kindly visit blog to read content, by clicking the read more button below."
//       }}...
//     </p>
//   </div>

//   <div class="w-full mt-8 flex text-xs justify-between items-center gap-x-4">
//     <span
//       title="{{ article.author }}"
//       class="request-card__details"
//     >
//       <i class="fa-regular fa-user"></i>
//       <span class="ellipsis-overflow">
//         {{ article.author || "Anonymous" }}</span
//       >
//     </span>

//     <section class="flex gap-2 items-center text-xs">
//       <span class="article-url" *ngIf="article.url" title="External URL">
//         <a
//           target="_blank"
//           (click)="handleAddSeen(article.url)"
//           href="{{ article.url }}"
//           class="relative z-10 rounded-full flex items-center gap-2 bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
//         >
//           Read More <i class="fa-solid fa-arrow-up-right-from-square"></i>
//         </a>
//       </span>

//       <span
//         *ngIf="article.url"
//         title="{{ isBookmarked ? 'Remove Bookmark' : 'Add Bookmark' }}"
//         (click)="
//           isBookmarked
//             ? handleRemoveBookmark(article.url)
//             : handleAddBookmark(article)
//         "
//         class="border w-8 h-8 transition-all bookmark  duration-300 cursor-pointer flex justify-center items-center rounded-full"
//         [ngClass]="{ 'border-primary border-2 border-double': isBookmarked }"
//       >
//         <i *ngIf="isBookmarked" class="fa-solid fa-bookmark"></i>
//         <i *ngIf="!isBookmarked" class="fa-regular fa-bookmark"></i>
//       </span>
//     </section>
//   </div>
// </article>
