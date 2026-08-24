import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Inbox,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const DataTable = ({
  data = [],
  columns = [],
  filterProjects,
  pageSize = 10,
  searchPlaceholder = "Search records...",
  addButton,
  extraButton,
  expandableRow,
  serverPagination,
  isLoading = false,
  isFetching = false,
  hideSearch = false,
  hideColumns = false,
  onRowClick,
}) => {

  const isServer = !!serverPagination;
  const [sorting, setSorting] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  // Sync pageSize prop when changed
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageSize,
    }));
  }, [pageSize]);

  const table = useReactTable({
    data: data || [],
    columns: columns || [],
    state: {
      sorting,
      globalFilter,
      pagination: isServer
        ? {
            pageIndex: serverPagination?.pageIndex ?? 0,
            pageSize: pageSize,
          }
        : pagination,
    },
    manualPagination: isServer,
    pageCount: isServer ? (serverPagination?.pageCount ?? 1) : undefined,
    autoResetPageIndex: false,
    onPaginationChange: isServer
      ? (updater) => {
          const next =
            typeof updater === "function"
              ? updater({
                  pageIndex: serverPagination?.pageIndex ?? 0,
                  pageSize,
                })
              : updater;

          console.log("[DataTable] onPaginationChange -> next:", next);
          serverPagination?.onPageChange?.(next.pageIndex);
        }
      : setPagination,

    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: isServer ? undefined : getFilteredRowModel(),
    getPaginationRowModel: isServer ? undefined : getPaginationRowModel(),
  });

  const toggleRow = (rowId) => {
    setExpandedRows((prev) => (prev[rowId] ? {} : { [rowId]: true }));
  };

  const handlePageSizeChange = (size) => {
    const numSize = Number(size);
    if (isServer) {
      serverPagination.onPageSizeChange?.(numSize);
      serverPagination.onPageChange?.(0);
    } else {
      table.setPageSize(numSize);
      table.setPageIndex(0);
    }
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
    if (isServer) {
      serverPagination.onSearch?.(value);
      serverPagination.onPageChange?.(0);
    } else {
      setGlobalFilter(value);
      table.setPageIndex(0);
    }
  };

  const handleClearSearch = () => {
    handleSearchChange("");
  };

  // Pagination calculation
  const totalItems = isServer
    ? (serverPagination?.total ?? (data?.length || 0))
    : table.getFilteredRowModel().rows.length;

  const totalPages = isServer
    ? Math.max(1, serverPagination?.pageCount ?? Math.ceil(totalItems / (pageSize || 10)) ?? 1)
    : Math.max(1, table.getPageCount() || 1);

  const currentPage = isServer
    ? (serverPagination?.pageIndex ?? 0)
    : table.getState().pagination.pageIndex;

  const currentPageSize = isServer
    ? pageSize
    : table.getState().pagination.pageSize;

  const startRecord = totalItems === 0 ? 0 : currentPage * currentPageSize + 1;
  const endRecord = Math.min((currentPage + 1) * currentPageSize, totalItems);

  // Pagination item list generator
  const paginationItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    if (currentPage < 4) {
      return [0, 1, 2, 3, 4, "...", totalPages - 1];
    }
    if (currentPage >= totalPages - 4) {
      return [
        0,
        "...",
        totalPages - 5,
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
      ];
    }
    return [
      0,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages - 1,
    ];
  }, [currentPage, totalPages]);

  const handlePageSelect = (pageIndex) => {
    console.log("[DataTable] Clicked page index:", pageIndex, "page number:", pageIndex + 1, "isServer:", isServer);
    if (isServer) {
      serverPagination.onPageChange?.(pageIndex);
    } else {
      table.setPageIndex(pageIndex);
    }
  };


  const canPrevious = isServer
    ? currentPage > 0
    : table.getCanPreviousPage();

  const canNext = isServer
    ? currentPage < totalPages - 1
    : table.getCanNextPage();

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", y: 12 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4 w-full"
    >
      {/* 🔹 Top Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {!hideSearch && (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9 pr-8 h-9 text-xs rounded-lg border-border bg-background shadow-2xs focus-visible:ring-1 opacity-100"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {filterProjects && (
            <div className="flex items-center gap-2">{filterProjects}</div>
          )}

          {isFetching && !isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Updating...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 justify-end">
          {!hideColumns && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-lg border-border text-xs font-medium bg-background opacity-100"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Columns</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border border-border bg-popover">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const columnDef = columns.find(
                      (col) =>
                        col.accessorKey === column.id || col.id === column.id
                    );
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                        className="text-xs capitalize cursor-pointer"
                      >
                        {typeof columnDef?.header === "string"
                          ? columnDef.header
                          : column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {addButton &&
            (addButton.to ? (
              <Link to={addButton.to}>
                <Button
                  size="sm"
                  className="h-9 gap-1.5 rounded-lg shadow-xs font-medium text-xs bg-primary text-primary-foreground hover:bg-primary/90 opacity-100"
                >
                  <Plus className="h-4 w-4" />
                  {addButton.label}
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                className="h-9 gap-1.5 rounded-lg shadow-xs font-medium text-xs bg-primary text-primary-foreground hover:bg-primary/90 opacity-100"
                onClick={addButton.onClick}
              >
                <Plus className="h-4 w-4" />
                {addButton.label}
              </Button>
            ))}

          {extraButton}
        </div>
      </div>

      {/* 🔹 Table Container */}
      <div
        key={`table-container-${currentPage}`}
        className="relative rounded-xl border border-border bg-card text-card-foreground shadow-2xs overflow-hidden opacity-100"
      >
        {/* Shimmer loading bar */}
        {isFetching && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary/20 overflow-hidden z-20">
            <div className="w-full h-full bg-primary origin-left animate-pulse" />
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-b border-border hover:bg-transparent">
                  {expandableRow && <TableHead className="w-10" />}
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();

                    return (
                      <TableHead
                        key={header.id}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        className={`h-11 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${
                          canSort ? "cursor-pointer select-none hover:text-foreground transition-colors" : ""
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                          {canSort && (
                            <span className="text-muted-foreground">
                              {isSorted === "asc" ? (
                                <ArrowUp className="size-3 text-primary" />
                              ) : isSorted === "desc" ? (
                                <ArrowDown className="size-3 text-primary" />
                              ) : (
                                <ArrowUpDown className="size-3 opacity-40 hover:opacity-100 transition-opacity" />
                              )}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (expandableRow ? 1 : 0)}
                    className="h-36 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Loading data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      className={`group border-b border-border/70 hover:bg-muted/40 transition-colors ${
                        onRowClick ? "cursor-pointer" : ""
                      }`}
                      onClick={() => onRowClick && onRowClick(row.original)}
                    >
                      {expandableRow && (
                        <TableCell className="w-10 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-md"
                            onClick={() => toggleRow(row.id)}
                          >
                            <ChevronRight
                              className={`size-3.5 transition-transform duration-200 ${
                                expandedRows[row.id] ? "rotate-90 text-primary" : "text-muted-foreground"
                              }`}
                            />
                          </Button>
                        </TableCell>
                      )}

                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 px-4 text-xs font-normal text-foreground">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {expandedRows[row.id] && expandableRow && (
                      <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/70">
                        <TableCell
                          colSpan={columns.length + 1}
                          className="p-4"
                        >
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {expandableRow(row.original)}
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (expandableRow ? 1 : 0)}
                    className="h-36 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                      <p className="text-sm font-medium">No records found</p>
                      <p className="text-xs text-muted-foreground/70">
                        Try adjusting your search or filter parameters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 🔹 Bottom Pagination & Row Count Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1 px-1">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span>
            Showing <strong className="text-foreground font-semibold">{startRecord}</strong> to{" "}
            <strong className="text-foreground font-semibold">{endRecord}</strong> of{" "}
            <strong className="text-foreground font-semibold">{totalItems}</strong> entries
          </span>

          <div className="flex items-center gap-1.5 border-l border-border pl-3">
            <span className="text-muted-foreground hidden sm:inline">Rows per page:</span>
            <Select
              value={String(currentPageSize)}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-18 text-xs rounded-lg border-border bg-background shadow-2xs">
                <SelectValue placeholder={String(currentPageSize)} />
              </SelectTrigger>
              <SelectContent align="start" className="min-w-18 rounded-xl shadow-lg border border-border bg-popover">
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)} className="text-xs cursor-pointer">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* First Page */}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-lg border-border bg-background"
            onClick={() => handlePageSelect(0)}
            disabled={!canPrevious || isFetching}
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous Page */}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-lg border-border bg-background"
            onClick={() => handlePageSelect(currentPage - 1)}
            disabled={!canPrevious || isFetching}
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1">
            {paginationItems.map((item, idx) => {
              if (item === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="h-8 w-6 flex items-center justify-center text-muted-foreground font-mono"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = item === currentPage;
              return (
                <Button
                  key={item}
                  size="icon"
                  variant={isCurrent ? "default" : "outline"}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-xs pointer-events-none"
                      : "border-border bg-background hover:bg-accent hover:text-accent-foreground text-foreground"
                  }`}
                  onClick={() => handlePageSelect(item)}
                  disabled={isFetching}
                >
                  {item + 1}
                </Button>
              );
            })}
          </div>

          {/* Next Page */}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-lg border-border bg-background"
            onClick={() => handlePageSelect(currentPage + 1)}
            disabled={!canNext || isFetching}
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last Page */}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-lg border-border bg-background"
            onClick={() => handlePageSelect(totalPages - 1)}
            disabled={!canNext || isFetching}
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DataTable;
