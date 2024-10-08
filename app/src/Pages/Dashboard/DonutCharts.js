import React, { useContext, useEffect, useRef, useState } from "react";
import { ConfigContext } from "../../Context/ConfigContext";
import axios from "axios";
import * as echarts from 'echarts';
import Select from "react-select"; // Ensure you have react-select installed

const DonutChart = () => {
  const { apiURL, apiHeaderJson } = useContext(ConfigContext);
  const chartRef = useRef(null); // Reference to the chart DOM element
  const [chartData, setChartData] = useState(null); // To store the fetched data
  const [selectedMonth, setSelectedMonth] = useState(5); // Default month to January

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

  // Fetching donut chart data from the API
  const getDonutInfo = async () => {
    const headers = apiHeaderJson;
    const response = await axios.get(
      `${apiURL}Products/GetProductsPieChart`,
      { params: { month: selectedMonth }, headers }
    );

    if (response.data.success) {
      setChartData(response.data.data);
    }
  };

  useEffect(() => {
    getDonutInfo();
  }, [selectedMonth]); // Fetch data whenever selectedMonth changes

  useEffect(() => {
    // Initialize ECharts when chartData is available
    if (chartData) {
      const chartDom = chartRef.current;
      const myChart = echarts.init(chartDom);

      // Extract the data for the chart from the new API response
      const seriesData = [
        {
          value: Number(chartData.total_electronics),
          name: `Electronics (${chartData.electronics_percentage}%)`,
        },
        {
          value: Number(chartData.total_jewelry),
          name: `Jewelry (${chartData.jewelry_percentage}%)`,
        },
        {
          value: Number(chartData.total_mens_clothing),
          name: `Men's Clothing (${chartData.mens_clothing_percentage}%)`,
        },
        {
          value: Number(chartData.total_womens_clothing),
          name: `Women's Clothing (${chartData.womens_clothing_percentage}%)`,
        },
      ].filter(item => item.value > 0);

      // Define the chart options using the new style
      const option = {
        title: {
          text: 'Products Category',
          subtext: 'Sales Data',
          left: 'bottom'
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            name: 'Product Categories',
            type: 'pie',
            radius: '50%',
            data: seriesData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      };

      myChart.setOption(option);
      return () => {
        myChart.dispose();
      };
    }
  }, [chartData]);

  const handleMonthChange = (selectedOption) => {
    setSelectedMonth(selectedOption.value);
  };

  return (
    <>
      <div className="card-header align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">Products Category</h4>
        <div className="col-md-4">
          <Select
            options={monthOptions}
            value={monthOptions.find(option => option.value === selectedMonth) || null}
            onChange={handleMonthChange}
            placeholder="Please select a month"
          />
        </div>
      </div>

      <div className="card-body">
        <div ref={chartRef} style={{ width: '100%', height: '400px' }}></div>
      </div>
    </>
  );
};

export default DonutChart;
