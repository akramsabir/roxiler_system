import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { ConfigContext } from "../../Context/ConfigContext";
import Select from 'react-select';
import {
    TimeFormater,
    DateFormater,
} from "../../Components/GlobalFunctions.js";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { NoRecords } from "../../Components/Shimmer.js";

const TransactionTable = () => {
    const [transactionData, setTransactionData] = useState([]);
    const { apiURL, apiHeaderJson } = useContext(ConfigContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [keyword, setkeyword] = useState("");
    const [reload, setReload] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(3);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const monthOptions = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    const handleMonthChange = (selectedOption) => {
        setSelectedMonth(selectedOption.value);
    };
    const handleProductDetails = (product) => {
        setSelectedProduct(product);
    };

    const getRecentOrders = async (page) => {
        try {
            const response = await axios.get(`${apiURL}Products/GetProducts`, {
                params: {
                    page: page,
                    limit: 10,
                    month: selectedMonth,
                    keyword: keyword,
                },
                headers: apiHeaderJson,
            });

            if (response.data.success) {
                setTransactionData(response.data.data);
                setTotalPages(response.data.total_pages);
                setTotalRecords(response.data.total_records);
                setReload(false);
            }
        } catch (error) {
            console.error("Error getRecentOrders products:", error);
        }
    };
    const handlePageChange = (selectedPage) => {
        if (selectedPage >= 1 && selectedPage <= totalPages) {
            setCurrentPage(selectedPage);
        }
    };

    const handleExcelDownload = () => {
        const headers = apiHeaderJson;
        Swal.fire({
            title: "Please wait...",
            html: "Your file is being prepared for download.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        axios
            .get(`${apiURL}Products/GetProducts`, {
                params: {
                    limit: totalRecords,
                    page: 1,
                    month: selectedMonth,
                    keyword: keyword,
                },
                headers,
            })
            .then(async (response) => {
                if (response.data.success === true) {
                    const rows = response.data.data;

                    const data = rows.map((product) => ({
                        "Product ID": product.product_id,
                        "Product Category": product.product_category,
                        "Product Title": product.product_title,
                        "Product Description": product.product_description,
                        "Product Price": '₹ ' + product.product_price,
                        "Product Sold": product.product_sold_label,
                        "Product Date Of Sale": DateFormater(product.product_date_of_sale) + ' - ' + TimeFormater(product.product_date_of_sale),

                    }));

                    const columns = [
                        { header: "Product ID", key: "Product ID", width: 20 },
                        { header: "Product Category", key: "Product Category", width: 20 },
                        { header: "Product Title", key: "Product Title", width: 40 },
                        { header: "Product Description", key: "Product Description", width: 50 },
                        { header: "Product Price", key: "Product Price", width: 20 },
                        { header: "Product Sold", key: "Product Sold", width: 20 },
                        { header: "Product Date Of Sale", key: "Product Date Of Sale", width: 30 },

                    ];

                    const wb = XLSX.utils.book_new();
                    const ws = XLSX.utils.json_to_sheet(data, {
                        header: columns.map((column) => column.header),
                    });
                    ws["!cols"] = columns.map((column) => ({ wch: column.width }));
                    XLSX.utils.book_append_sheet(wb, ws, "Recent Orders Report");

                    const date = new Date();
                    const dateString = date.toLocaleDateString();
                    const timeString = date.toLocaleTimeString();

                    XLSX.writeFile(
                        wb, `Transaction_Report_${dateString}_${timeString}.xlsx`
                    );

                    Swal.close();

                    Swal.fire({
                        title: "<strong>Success</strong>",
                        html: "Your file has been downloaded successfully.",
                        icon: "success",
                    });
                } else {
                    Swal.close();
                    Swal.fire({
                        title: "<strong>Error</strong>",
                        html: response.data.message,
                        icon: "error",
                    });
                }
            })
            .catch((error) => {
                Swal.close();
                Swal.fire({
                    title: "<strong>Error</strong>",
                    html: error.message,
                    icon: "error",
                });
            });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "keyword") {
            const containsLetters = /[a-zA-Z]/.test(value);

            if (containsLetters) {
                setkeyword(value);
            } else {
                setkeyword(Number(value));
            }
        }
    };


    const handleFilter = () => {
        getRecentOrders(currentPage);
    };

    const handleClearAll = () => {
        setkeyword("");
        setSelectedMonth(null);
        setReload(true);
        setCurrentPage(1);
    };
    useEffect(() => {
        getRecentOrders(currentPage);
    }, [currentPage]);

    useEffect(() => {
        reload && getRecentOrders(currentPage);
    }, [reload]);
    return (
        <>

            <div className="main-content">
                <div className="">
                    <div className="">
                        <br />
                        <h4 className="fs-16 mb-3">Transaction Table</h4>
                        <div className="row">
                            <div className="col-xl-12">
                                <div className="card">
                                    <div className="card-header" style={{ border: "none" }}>
                                        <div className="col-md-12">
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <label htmlFor="keyword">Search By Transaction</label>
                                                    <div className="input-group pb-3">
                                                        <input
                                                            type="text"
                                                            className="form-control "
                                                            name="keyword"
                                                            aria-label="keyword"
                                                            aria-describedby="button-addon2"
                                                            placeholder="Please Enter /title/description/price"
                                                            value={keyword}
                                                            onChange={handleInputChange}
                                                        />
                                                        <button
                                                            className="btn btn-success"
                                                            type="button"
                                                            id="button-addon2"
                                                            disabled={!keyword}
                                                            onClick={handleFilter}
                                                        >
                                                            <i className="ri-search-line"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <label htmlFor="orderId">Select Month</label>
                                                    <Select

                                                        options={monthOptions}
                                                        value={
                                                            selectedMonth
                                                                ? monthOptions.find(
                                                                    (option) =>
                                                                        option.value === selectedMonth
                                                                )
                                                                : null
                                                        }
                                                        onChange={handleMonthChange}
                                                        placeholder="Please select a month"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div>
                                                                <label>Apply Filter</label>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={handleFilter}
                                                                disabled={keyword === "" && !selectedMonth}
                                                                className={`w-100 btn btn-info btn-label waves-effect waves-light`}
                                                            >
                                                                <i className=" ri-filter-3-fill label-icon align-middle fs-16 me-2" />
                                                                Filter
                                                            </button>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div>
                                                                <label>Clear Filter</label>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={handleClearAll}
                                                                disabled={keyword === "" && !selectedMonth}
                                                                className={`btn btn-secondary btn-label waves-effect waves-light`}
                                                            >
                                                                <i className=" ri-database-2-line  label-icon align-middle fs-16 me-2"></i>
                                                                Clear
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div>
                                                        <label>Generate Report</label>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-soft-info ms-2 "
                                                        onClick={handleExcelDownload}
                                                    >
                                                        <i className="ri-file-list-3-line align-middle" />
                                                        Generate Report
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="table-responsive table-card">
                                            <table className="table table-borderless table-centered table-hover align-middle table-nowrap mb-0">
                                                <thead className="text-muted table-light">
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Category</th>
                                                        <th>Title</th>
                                                        <th>Description</th>
                                                        <th>Price</th>
                                                        <th>Sold</th>
                                                        <th>Image</th>
                                                        <th>More</th>
                                                    </tr>
                                                </thead>
                                                {transactionData.length > 0 ?
                                                    <tbody>
                                                        {transactionData.map((product) => (
                                                            <tr>
                                                                <td>{product.product_id}</td>
                                                                <td>
                                                                    <span className="text-primary">
                                                                        {product.product_category}
                                                                    </span>
                                                                </td>
                                                                <td className="ellipsis-text-title">
                                                                    {product.product_title}
                                                                </td>
                                                                <td className="ellipsis-text">
                                                                    {product.product_description}
                                                                </td>
                                                                <td>₹{product.product_price}</td>
                                                                <td>
                                                                    <span
                                                                        className={`badge bg-${product.product_sold_class}-subtle text-${product.product_sold_class}`}
                                                                    >
                                                                        {product.product_sold_label}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <img
                                                                        src={product.product_image}
                                                                        alt={product.product_title}
                                                                        className="img-fluid rounded-circle"
                                                                        style={{ width: '70px', height: '70px' }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        className="btn btn-soft-secondary btn-sm dropdown"
                                                                        type="button"
                                                                        data-bs-toggle="dropdown"
                                                                        aria-expanded="false"
                                                                    >
                                                                        <i className="ri-more-fill" />
                                                                    </button>
                                                                    <ul className="dropdown-menu dropdown-menu-end">
                                                                        <li>
                                                                            <button
                                                                                type="button"
                                                                                className="dropdown-item"
                                                                                data-bs-toggle="modal"
                                                                                data-bs-target="#staticBackdrop"
                                                                                onClick={() => handleProductDetails(product)}
                                                                            >
                                                                                <i className="ri-eye-line align-bottom mx-2" />
                                                                                Product Details
                                                                            </button>
                                                                        </li>
                                                                    </ul>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody> :
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan={8}>
                                                                <NoRecords />
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                }
                                            </table>
                                        </div>
                                        <div className="align-items-center pt-4 pb-2  justify-content-between row text-center text-sm-start">
                                            <div className="col-sm">
                                                <div className="text-muted ">
                                                    Showing page{" "}
                                                    <span className="fw-semibold">{currentPage}</span>{" "}
                                                    of <span className="fw-semibold">{totalPages}</span>{" "}
                                                    pages
                                                </div>
                                            </div>
                                            <div className="col-sm-auto mt-3 mt-sm-0">
                                                <ul className="pagination pagination-separated pagination-sm mb-0 justify-content-center">
                                                    <li
                                                        className={`page-item ${currentPage === 1 && "disabled"
                                                            }`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() =>
                                                                handlePageChange(currentPage - 1)
                                                            }
                                                            disabled={currentPage === 1}
                                                        >
                                                            ←
                                                        </button>
                                                    </li>
                                                    {Array.from({ length: totalPages }, (_, index) => {
                                                        const page = index + 1;
                                                        if (
                                                            page === currentPage ||
                                                            page === currentPage - 1 ||
                                                            page === currentPage + 1
                                                        ) {
                                                            return (
                                                                <li
                                                                    key={page}
                                                                    className={`page-item ${currentPage === page && "active"
                                                                        }`}
                                                                >
                                                                    <button
                                                                        className="page-link"
                                                                        onClick={() => handlePageChange(page)}
                                                                    >
                                                                        {page}
                                                                    </button>
                                                                </li>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                    <li
                                                        className={`page-item ${currentPage === totalPages && "disabled"
                                                            }`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() =>
                                                                handlePageChange(currentPage + 1)
                                                            }
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            →
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div
                        className="modal fade"
                        id="staticBackdrop"
                        data-bs-backdrop="static"
                        data-bs-keyboard="false"
                        tabIndex={-1}
                        role="dialog"
                        aria-labelledby="staticBackdropLabel"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-body text-center p-5">
                                    {selectedProduct && (
                                        <>
                                            <img
                                                src={selectedProduct.product_image}
                                                alt={selectedProduct.product_title}
                                                className="img-fluid mb-3"
                                                style={{ width: '150px', height: '150px' }}
                                            />
                                            <h5 className="mb-4">Price: ₹{selectedProduct.product_price}</h5>
                                            <table className="table table-bordered">
                                                <tbody>
                                                    <tr>
                                                        <th scope="row" className="text-justify">Title</th>
                                                        <td style={{ textAlign: "justify" }} className="text-muted">{selectedProduct.product_title}</td>
                                                    </tr>
                                                    <tr>
                                                        <th scope="row" className="text-justify">Description</th>
                                                        <td style={{ textAlign: "justify" }} className="text-muted">{selectedProduct.product_description}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </>
                                    )}

                                    <div className="hstack gap-2 justify-content-center">
                                        <button
                                            className="btn btn-link link-success fw-medium"
                                            data-bs-dismiss="modal"
                                        >
                                            <i className="ri-close-line me-1 align-middle" /> Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TransactionTable;
