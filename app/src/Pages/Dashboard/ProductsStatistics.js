import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { ConfigContext } from "../../Context/ConfigContext";
import Select from "react-select";

const ProductsStatistics = () => {
  const { apiURL, apiHeaderJson } = useContext(ConfigContext);
  const [statistics, setStatistics] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const getStatistics = async () => {
    try {
      const response = await axios.get(
        `${apiURL}Products/GetProductsStatistics?month=${selectedMonth}`,
        { headers: apiHeaderJson }
      );

      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching product statistics:", error);
    }
  };

  useEffect(() => {
    getStatistics();
  }, [selectedMonth]);

  const handleMonthChange = (selectedOption) => {
    setSelectedMonth(selectedOption.value);
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header align-items-center d-flex">
              <h4 className="card-title mb-0 flex-grow-1">Product Statistics</h4>
              <div className="col-md-4">
                <Select
                  options={monthOptions}
                  value={monthOptions.find(option => option.value === selectedMonth) || null}
                  onChange={handleMonthChange}
                  placeholder="Select a month"
                />
              </div>
            </div>
            <div className="card-body">
              {statistics.map((stat, index) => (
                <div key={index} className="mb-3">
                  <h5 className="fs-14 fw-normal">Total Amount: ₹{stat.total_amount.toFixed(2)}</h5>
                  <h5 className="fs-14 fw-normal">Total Sold: {stat.total_sold}</h5>
                  <h5 className="fs-14 fw-normal">Total Not Sold: {stat.total_not_sold}</h5>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsStatistics;
