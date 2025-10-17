"use client";
import React, {
  cloneElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createContext } from "react";
import {
  IListResponse,
  ITable,
  TableColumn,
  IsearchParams,
  IselectOptions,
} from "./models/table.model";
import { formatCurrency } from "@/utils/helper";
import { useTable } from "./hooks/useTable";
import { useForm } from "react-hook-form";
import { FcFilledFilter } from "react-icons/fc";
import { CiFilter } from "react-icons/ci";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { IoCloudDownloadOutline } from "react-icons/io5";
import Image from "next/image";
import TextInput from "../form-elements/Text-Input";
import Modal from "../modal/Modal";
import ButtonComponent from "../form-elements/Button";
import Search from "../search/Search";
import { useDebounce } from "@uidotdev/usehooks";
import Empty from "../empty/Empty";
import AnimatedBorderWrapper from "../animation/AnimatedBorder";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const TableContext = createContext({});

function TableComponent<T>({
  queryKey,
  children,
  columns,
  headerActions,
  service,
  limit: limitVal,
  actionable = true,
  isDownloadable = true,
  defaultParams,
  searchKey,
}: ITable) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(limitVal || 5);
  const [search, setSearch] = useState<IsearchParams | null>(
    defaultParams ?? null
  );
  const [filterIsActive, setfilterIsActive] = useState(search ?? false);

  const {
    isLoading,
    error,
    data = [],
    summary,
    totalRecords,
    results,
    isRefetching,
  }: IListResponse<T> = useTable<T>(page, limit, service, queryKey, search);

  //reload my table
  // function reloadTable() {
  // 	setPage(1);
  // 	// Remove all filters
  // 	setSearch(null);
  // 	setfilterIsActive(false);
  // }

  function handleFilter(val: IsearchParams | null) {
    let transformedSearchQuery = "";
    if (!val) {
      setfilterIsActive(false);
      setSearch(null);
      return;
    }

    // transformedSearchQuery = buildQueryString(val);

    // transformedSearchQuery = objectToQueryParams(val);

    setSearch((search) => ({ ...search, ...val }));
    setPage(1);

    setfilterIsActive(true);
  }

  function cancelFilter() {
    setfilterIsActive(false);
    setSearch(null);
  }

  // const queryClient = useQueryClient();

  function handlePaginate(page: number, limit: number) {
    setPage(page);
    setLimit(limit);
  }

  function updateLimit(val: number) {
    setLimit(val);
  }
  function updatePage(val: number) {
    setPage(val);
  }

  function removeEmptyKeys(obj: { [key: string]: any }): {
    [key: string]: any;
  } {
    const cleanedObj: { [key: string]: any } = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
        cleanedObj[key] = obj[key];
      }
    });
    return cleanedObj;
  }
  function objectToQueryParams(obj: { [key: string]: any }): string {
    return Object.keys(removeEmptyKeys(obj))
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(
            obj[key].toString()
          )}`
      )
      .join("&");
  }
  const tableRef = useRef(null);

  const CardContent = (
    <div className=" bg-card  p-2">
      <TableHeaderAction handleFilter={handleFilter}>
        {headerActions}
      </TableHeaderAction>

      {!isLoading && !data.length && (
        <section className="flex justify-center items-center">
          <Empty />
        </section>
      )}

      {!isLoading && data.length > 0 && (
        <Table
          ref={tableRef}
          className="w-full overflow-hidden  rounded-xl  border text-xs"
        >
          {children}
        </Table>
      )}

      {data.length > 0 && (
        <div className="mt-3 border  rounded-xl text-xs">
          <Paginator />
        </div>
      )}
    </div>
  ); // Render it conditionally with/without animation return

  return (
    <TableContext.Provider
      value={{
        data,
        columns,
        headerActions,
        service,
        limit,
        page,
        updateLimit,
        totalRecords,
        handlePaginate,
        handleFilter,
        objectToQueryParams,
        cancelFilter,
        filterIsActive,
        actionable,
        tableRef,
        queryKey,
        isDownloadable,
        isRefetching,
        search,
        searchKey,
        summary,
      }}
    >
      <AnimatedBorderWrapper loading={isLoading || isRefetching}>
        {CardContent}
      </AnimatedBorderWrapper>
    </TableContext.Provider>
  );
}

function TableFilterForm({ column, onCloseModal }: any) {
  const { handleFilter, cancelFilter, search }: any = useContext(TableContext);
  const { register, handleSubmit, formState } = useForm({
    mode: "onChange",
    defaultValues: { ...search },
  });
  // const { errors, isSubmitting } = formState;

  const { columns, isRefetching }: any = useContext(TableContext);

  async function onSubmit(data: any, onCloseModal: () => void) {
    handleFilter({ ...search, ...data });

    onCloseModal();
    // console.log(objectToQueryParams(data));
  }

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data, onCloseModal))}
      className=' flex flex-col gap-3  items-center"'
    >
      <section className=" grid  gap-3 grid-cols-1 ">
        {columns
          .slice()
          .filter((val: TableColumn) => val.searchType)
          .map((column: TableColumn) => {
            if (/TEXT/.test(column.searchType!)) {
              return (
                <TextInput
                  key={column.accessor}
                  name={column.header}
                  label={column.header}
                >
                  <input
                    {...register(
                      column.filterKey ? column.filterKey : column.header,
                      {}
                    )}
                    className="input-style"
                    placeholder={`Enter ${column.header}`}
                    type="text"
                    id={column.header}
                  />
                </TextInput>
              );
            }
            if (/NUMBER/.test(column.searchType!)) {
              return (
                <TextInput
                  key={column.accessor}
                  name={column.header}
                  label={column.header}
                >
                  <input
                    {...register(
                      column.filterKey ? column.filterKey : column.header
                    )}
                    className="input-style"
                    type="number"
                    id={column.header}
                  />
                </TextInput>
              );
            }
            if (/DROPDOWN/.test(column.searchType!)) {
              return (
                <TextInput
                  key={column.accessor}
                  name={column.header}
                  label={column.header}
                >
                  <select
                    className="input-style"
                    {...register(
                      column.filterKey ? column.filterKey : column.header
                    )}
                  >
                    <option value="">Select Options</option>
                    {column.selectOptions?.map((options: IselectOptions, i) => (
                      <React.Fragment key={i}>
                        <option value={options.value}>{options.name}</option>
                      </React.Fragment>
                    ))}
                  </select>
                </TextInput>
              );
            }
          })}
      </section>
      {/* <TextInput
				name={'description'}
				placeholder="Enter Description"
				label="Description"
				error={errors?.['description']?.message?.toString()}>
				<textarea
					className="input-style"
					{...register('description', {
						required: 'This field is required'
					})}
					disabled={isSubmitting}
					id="description"
					cols={40}
					rows={3}></textarea>
			</TextInput> */}

      {/* <TextInput
				name={column.header}
				placeholder={`Enter ${column.header}`}
				label={column.header}
				error={errors?.[`${column.header}`]?.message?.toString()}>
				<input
					{...register(column.header, {
						required: 'This field is required'
					})}
					className="input-style"
					type="text"
					id={column.header}
				/>
			</TextInput> */}
      <hr className=" my-3" />
      <section className="flex justify-end  gap-4">
        <ButtonComponent
          type="reset"
          handleClick={() => {
            cancelFilter();
            onCloseModal();
          }}
          styles="rounded-3xl"
          btnText={"Cancel"}
        ></ButtonComponent>

        <ButtonComponent
          type="submit"
          loading={isRefetching}
          styles="rounded-3xl"
          disabled={!formState.isValid}
          btnText={`Search
					`}
        ></ButtonComponent>
      </section>
    </form>
  );
}

function TableFilter() {
  const { columns, filterIsActive }: any = useContext(TableContext);
  return (
    <div>
      <Modal>
        <Modal.Open opens="filter-form">
          <button
            type="button"
            className={`  ${
              filterIsActive
                ? "ring-1  ring-offset-2 text-success  ring-success"
                : ""
            } w-full flex items-center gap-1  text-xs px-4 py-2 rounded-3xl   font-light  border btn`}
          >
            {filterIsActive ? (
              <FcFilledFilter size={15} color="green" />
            ) : (
              <CiFilter size={15} />
            )}
            Filter
          </button>
        </Modal.Open>

        <Modal.Window
          title="Manage filters"
          description="Quickly find table records using available filters"
          name="filter-form"
        >
          <TableFilterForm />
        </Modal.Window>
      </Modal>
    </div>
  );
}

function TableHeaders() {
  const { columns, actionable }: any = useContext(TableContext);
  return (
    <TableHeader className="bg-muted capitalize sticky  top-0">
      <TableRow>
        {/* <th className="px-2 py-4 uppercase">
					<input
						title="check"
						id="checkbox-all-search"
						type="checkbox"
						className="w-4 h-4 m-0 border-gray-300 rounded focus:ring-gray-500 "
					/>
					<label
						htmlFor="checkbox-all-search text-sm"
						className="sr-only">
						#
					</label>
				</th> */}

        <TableHead className=" font-medium px-2  whitespace-nowrap">
          <span>S/N</span>
        </TableHead>

        {columns.map((col: TableColumn) => (
          <TableHead
            colSpan={col.colspan}
            key={col.header}
            className=" px-2 flex-grow"
          >
            {col.header}
          </TableHead>
        ))}
        {actionable && <TableHead className="px-2  ">Actions</TableHead>}
      </TableRow>
    </TableHeader>
  );
}
export function TableHeaderAction({ children }: any) {
  const {
    handleFilter,
    tableRef,
    queryKey,
    isDownloadable,
    searchKey,
    search,
    summary,
  }: any = useContext(TableContext);

  // const [searchValue, setSearchValue] = useState("");

  function debounce<T extends (...args: any[]) => void>(fn: T, delay = 500) {
    let t: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  const debouncedFilter = useMemo(
    () =>
      debounce((value: string) => {
        handleFilter({ ...search, [searchKey]: value ?? undefined });
      }, 500),
    [handleFilter, search, searchKey]
  );

  return (
    <div className="flex flex-col flex-wrap  gap-1  justify-between mb-2 ">
      <div className="flex flex-wrap">
        <div className="w-1/2 items-start">
          <Search
            placeHolder={`Search by ${searchKey}`}
            onSearch={(val) => {
              // setSearchValue(val); // keep local UI responsive
              debouncedFilter(val); // side-effect at the event boundary
            }}
          />
        </div>

        <div className=" flex flex-1 flex-wrap justify-end  gap-2">
          <TableFilter />
          {isDownloadable && (
            <DownloadTableExcel
              filename={`${queryKey} table`}
              sheet={queryKey}
              currentTableRef={tableRef.current}
            >
              <button
                type="button"
                className="w-full btn-primary  text-xs px-6 py-2 gap-1 rounded-3xl flex items-center    font-light  border"
              >
                <IoCloudDownloadOutline /> Export
              </button>
            </DownloadTableExcel>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        {" "}
        {cloneElement(children, { handleFilter, summary })}
      </div>

      {/* <div className="flex gap-3 items-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 512 512"
						fill=" #ff931f">
						<path d="M448 192H64C28.65 192 0 220.7 0 256v96c0 17.67 14.33 32 32 32h32v96c0 17.67 14.33 32 32 32h320c17.67 0 32-14.33 32-32v-96h32c17.67 0 32-14.33 32-32V256C512 220.7 483.3 192 448 192zM384 448H128v-96h256V448zM432 296c-13.25 0-24-10.75-24-24c0-13.27 10.75-24 24-24s24 10.73 24 24C456 285.3 445.3 296 432 296zM128 64h229.5L384 90.51V160h64V77.25c0-8.484-3.375-16.62-9.375-22.62l-45.25-45.25C387.4 3.375 379.2 0 370.8 0H96C78.34 0 64 14.33 64 32v128h64V64z" />
					</svg>
					<p className="text-sm w-11">Print</p>
				</div> */}
    </div>
  );
}
function TableRows({ children, customRow }: any) {
  const { columns, data, actionable }: any = useContext(TableContext);

  // if (data?.length < 1) {
  // 	return (
  // 		<tbody className=' w-full h-5'>
  // 			<tr>
  // 				<td className='  block p-2 text-sm '>No data available</td>
  // 			</tr>
  // 		</tbody>
  // 	);
  // }

  return (
    <TableBody className="">
      {!customRow
        ? data?.map((row: any, i: any) => {
            return (
              <TableRow key={i} className=" px-2  relative border-b  ">
                {/* <td className=" font-medium whitespace-nowrap">
									<input
										title="check"
										id="checkbox-all-search"
										type="checkbox"
										className="w-4 h-4 m-0 border-gray-300 rounded focus:ring-gray-500 "
									/>
									<label
										htmlFor="checkbox-all-search text-sm"
										className="sr-only">
										#
									</label>
								</td> */}
                <TableCell className=" font-medium">
                  <span>{i + 1}.</span>
                </TableCell>

                {columns.map((column: TableColumn, i: any) => {
                  //This logic helps check for more accessors; double items in a row cell
                  const value = column.accessor
                    ?.split(".")
                    .reduce((obj, key) => obj[key], row);

                  if (column.custom) {
                    if (column.custom.type === "style") {
                      return (
                        <TableCell
                          className={`${
                            column.custom.bolden && "font-semibold"
                          }`}
                          key={column.accessor + i}
                        >
                          <span
                            title={value}
                            className="bg-green-400 text-xs capitalize w-1/2 lg:w-1/4 justify-center text-white py-2 px-3 rounded-3xl inline-flex"
                          >
                            {value}
                          </span>
                        </TableCell>
                      );
                    }
                    if (column.custom.type === "date") {
                      return (
                        <TableCell
                          className={`${
                            column.custom.bolden && "font-semibold"
                          } ellipisis-overflow block`}
                          title={new Date(value).toDateString()}
                          key={column.accessor + i}
                        >
                          {new Date(value).toDateString()}
                        </TableCell>
                      );
                    }
                    if (column.custom.type === "currency") {
                      return (
                        <TableCell
                          className={`${
                            column.custom.bolden && "font-semibold"
                          }  `}
                          key={column.accessor + i}
                        >
                          <span
                            title={formatCurrency(value)}
                            className="ellipsis-overflow block"
                          >
                            {formatCurrency(value)}
                          </span>
                        </TableCell>
                      );
                    }
                    if (column.custom.type === "percent") {
                      return (
                        <TableCell
                          className={`${
                            column.custom.bolden && "font-semibold"
                          } `}
                          title={value}
                          key={column.accessor + i}
                        >
                          {value} %
                        </TableCell>
                      );
                    }
                    if (column.custom.type === "sentence") {
                      return (
                        <TableCell
                          className={`${
                            column.custom.bolden && "font-semibold"
                          } `}
                          key={column.accessor + i}
                        >
                          {value} {""} {column.custom.suffix}
                        </TableCell>
                      );
                    }
                  }
                  return (
                    <TableCell key={column.accessor + i}>
                      <span title={value} className="block ellipsis-overflow">
                        {value}
                      </span>
                    </TableCell>
                  );
                })}

                {actionable && cloneElement(children, { rowData: row })}
              </TableRow>
            );
          })
        : cloneElement(children, { data })}
    </TableBody>
  );
}

function Paginator() {
  const { updateLimit, data, limit, page, totalRecords, handlePaginate }: any =
    useContext(TableContext);

  const maxNumPage = useMemo(() => {
    return Math.ceil(totalRecords / limit);
  }, [totalRecords, limit]);

  const numPages = Math.ceil(totalRecords / limit);
  const pageNumbers = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <section className="flex justify-between p-4 items-center w-full">
      <div className="flex flex-col gap-1">
        <strong>Summary</strong>
        <p>
          Showing <span>1</span> to <span>{data?.length}</span> of{" "}
          <span>{totalRecords}</span> results
        </p>
        <div className="text-sm text-muted-foreground">
          Total: {totalRecords} | Size: {limit} | Page: {page}
        </div>
      </div>

      {data?.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="flex w-full items-center gap-2">
            <label htmlFor="limit" className="text-sm">
              Rows per page
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => updateLimit(Number(e.target.value))}
              className="text-xs bg-background border rounded px-2 py-1"
            >
              {[5, 10, 15, 20].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && handlePaginate(page - 1, limit)}
                  className={
                    page === 1
                      ? " cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {pageNumbers.slice(Math.max(0, page - 2), page + 1).map((num) => (
                <PaginationItem key={num}>
                  <PaginationLink
                    className="cursor-pointer"
                    isActive={page === num}
                    onClick={() => handlePaginate(num, limit)}
                  >
                    {num}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {numPages > page + 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    page < maxNumPage && handlePaginate(page + 1, limit)
                  }
                  className={
                    page >= maxNumPage
                      ? " cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </section>
  );
}

TableComponent.TableHeader = TableHeaders;
TableComponent.TableRow = TableRows;

export default TableComponent;
