"use client"

/**
 * Reports.jsx
 *
 * Vai trò: Trang báo cáo thống kê cho admin.
 * Chức năng:
 * - Hiển thị báo cáo doanh thu (theo tháng, tổng hợp năm)
 * - Hiển thị báo cáo công suất phòng (theo ngày)
 *
 * Quyền truy cập: Admin
 */

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Line, Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { FaChartLine, FaHotel } from "react-icons/fa"
import { format, parseISO, getYear, getMonth, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns"
import { vi } from 'date-fns/locale';
import { toast } from "react-toastify"
import reportService from "../../../services/reportService"
import "./Reports.css"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = () => {
  const [activeTab, setActiveTab] = useState("revenue")
  const [revenueData, setRevenueData] = useState(null)
  const [occupancyData, setOccupancyData] = useState(null)
  const [activeQuickSelect, setActiveQuickSelect] = useState('last6Months');
  const [dateRange, setDateRange] = useState(() => {
      const endDate = new Date();
      const startDate = startOfMonth(subMonths(endDate, 5));
      return {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      }
  });
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    setRevenueData(null);
    setOccupancyData(null);
    try {
      const { startDate, endDate } = dateRange;
      if (!startDate || !endDate) {
          toast.warn("Vui lòng chọn khoảng thời gian hợp lệ.");
          setLoading(false);
          return;
      }

      switch (activeTab) {
        case "revenue":
          const revenueResponse = await reportService.getRevenueReport(startDate, endDate)
          prepareRevenueChartData(revenueResponse.data || [])
          break
        case "occupancy":
          const occupancyResponse = await reportService.getOccupancyReport(startDate, endDate)
          prepareOccupancyChartData(occupancyResponse.data || [])
          break
        default:
          break
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu báo cáo")
      console.error("Error fetching report data:", error)
      if(activeTab === 'revenue') setRevenueData(null);
      if(activeTab === 'occupancy') setOccupancyData(null);
    } finally {
      setLoading(false)
    }
  }

  const handleQuickSelect = (period) => {
    setActiveQuickSelect(period);
    let startDate, endDate = new Date();

    switch (period) {
      case 'thisMonth':
        startDate = startOfMonth(endDate);
        break;
      case 'last6Months':
        const sixMonthsAgo = subMonths(endDate, 5);
        startDate = startOfMonth(sixMonthsAgo);
        break;
      case 'thisYear':
        startDate = startOfYear(endDate);
        break;
      default:
        const defaultStart = subMonths(endDate, 5);
        startDate = startOfMonth(defaultStart);
        break;
    }

    setDateRange({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
    });
  };

  const handleManualDateChange = (e) => {
    setActiveQuickSelect(null);
    handleDateRangeChange(e);
  }

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target
    setDateRange((prev) => ({ ...prev, [name]: value }))
  }

  const prepareRevenueChartData = (monthlyData) => {
    if (!monthlyData || monthlyData.length === 0) {
        setRevenueData(null);
        return;
    }
    monthlyData.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });
    const monthlyLabels = monthlyData.map(item => `T${item.month}/${item.year}`);
    const monthlyRevenue = monthlyData.map(item => item.totalRevenue / 1000000);
    const yearlyAggregation = monthlyData.reduce((acc, item) => {
      acc[item.year] = (acc[item.year] || 0) + item.totalRevenue;
      return acc;
    }, {});
    const yearlyTotalData = monthlyData.map(item => (yearlyAggregation[item.year] || 0) / 1000000);

    setRevenueData({
      labels: monthlyLabels,
      datasets: [
        {
          label: "Doanh thu Tháng",
          data: monthlyRevenue,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.3,
          fill: true,
          yAxisID: 'yMonthly',
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: "#3b82f6",
        },
         {
          label: "Tổng Năm",
          data: yearlyTotalData,
          borderColor: "#14b8a6",
          tension: 0.3,
          fill: false,
          yAxisID: 'yYearly',
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    })
  }

  const prepareOccupancyChartData = (dailyData) => {
     if (!dailyData || dailyData.length === 0) {
        setOccupancyData(null);
        return;
    }
    dailyData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = dailyData.map(item => format(parseISO(item.date), "dd/MM", { locale: vi }));
    const occupancyPercentage = dailyData.map(item => (item.occupancyRate || 0) * 100);

    setOccupancyData({
      labels,
      datasets: [
        {
          label: "Tỷ lệ lấp đầy (%)",
          data: occupancyPercentage,
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "#059669",
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
      ],
    })
  }

  const baseChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
          legend: { position: 'top' },
          tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              titleFont: { weight: 'bold' },
              bodyFont: { size: 13 },
              padding: 10,
              cornerRadius: 4,
              displayColors: true,
              boxPadding: 4,
          },
      },
      scales: {
          x: {
              grid: { display: false },
              ticks: { font: { size: 11 }, color: '#4b5563' },
          },
          y: {
              beginAtZero: true,
              grid: { color: '#e5e7eb' },
              ticks: { font: { size: 11 }, color: '#4b5563' },
          },
      },
      interaction: {
          mode: 'index',
          intersect: false,
      },
  };

  const revenueChartOptions = {
      ...baseChartOptions,
      plugins: {
          ...baseChartOptions.plugins,
          tooltip: {
              ...baseChartOptions.plugins.tooltip,
              callbacks: {
                  label: (context) => {
                      let label = context.dataset.label || '';
                      if (label) { label += ': '; }
                      if (context.parsed.y !== null) {
                          label += `${context.parsed.y.toFixed(2)} triệu VND`;
                      }
                      return label;
                  }
              },
          },
      },
      scales: {
          ...baseChartOptions.scales,
          x: { ...baseChartOptions.scales.x, title: { display: true, text: 'Thời gian', color: '#4b5563' } },
          yMonthly: {
              ...baseChartOptions.scales.y,
              position: 'left',
              title: { display: true, text: 'Doanh thu Tháng (Triệu VND)', color: '#4b5563' },
          },
           yYearly: {
              ...baseChartOptions.scales.y,
              position: 'right',
              title: { display: true, text: 'Tổng Doanh thu Năm (Triệu VND)', color: '#4b5563' },
              grid: { drawOnChartArea: false },
          },
      },
  };

 const occupancyChartOptions = {
      ...baseChartOptions,
      plugins: {
          ...baseChartOptions.plugins,
          legend: { display: false },
          tooltip: {
              ...baseChartOptions.plugins.tooltip,
              callbacks: {
                  label: (context) => {
                      let label = context.dataset.label || '';
                      if (label) { label += ': '; }
                      if (context.parsed.y !== null) {
                          label += `${context.parsed.y.toFixed(1)}%`;
                      }
                      return label;
                  }
              },
          },
      },
      scales: {
          ...baseChartOptions.scales,
          x: { ...baseChartOptions.scales.x, title: { display: true, text: 'Ngày', color: '#4b5563' } },
          y: {
              ...baseChartOptions.scales.y,
              max: 100,
              title: { display: true, text: 'Tỷ lệ lấp đầy (%)', color: '#4b5563' },
          },
      },
 };

  return (
    <div className="reports-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="page-header"
      >
        <h1>Báo cáo thống kê</h1>
      </motion.div>

      <div className="report-tabs">
        <button
          className={`tab-button ${activeTab === "revenue" ? "active" : ""}`}
          onClick={() => setActiveTab("revenue")}
        >
          <FaChartLine /> Doanh thu
        </button>
        <button
          className={`tab-button ${activeTab === "occupancy" ? "active" : ""}`}
          onClick={() => setActiveTab("occupancy")}
        >
          <FaHotel /> Công suất phòng
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="report-controls"
      >
         <div className="quick-select-buttons">
            <button
                className={`quick-select-btn ${activeQuickSelect === 'thisMonth' ? 'active' : ''}`}
                onClick={() => handleQuickSelect('thisMonth')}
            >
                Tháng này
            </button>
             <button
                className={`quick-select-btn ${activeQuickSelect === 'last6Months' ? 'active' : ''}`}
                onClick={() => handleQuickSelect('last6Months')}
            >
                6 Tháng qua
            </button>
            <button
                className={`quick-select-btn ${activeQuickSelect === 'thisYear' ? 'active' : ''}`}
                onClick={() => handleQuickSelect('thisYear')}
            >
                Năm nay
            </button>
         </div>

         <div className="date-range">
              <div className="date-input">
                <label htmlFor="report-startDate">Từ ngày:</label>
                <input id="report-startDate" type="date" name="startDate" value={dateRange.startDate} onChange={handleManualDateChange} />
              </div>
              <div className="date-input">
                <label htmlFor="report-endDate">Đến ngày:</label>
                <input id="report-endDate" type="date" name="endDate" value={dateRange.endDate} onChange={handleManualDateChange} />
              </div>
            </div>
      </motion.div>

      {loading ? (
        <div className="loading-indicator">Đang tải dữ liệu báo cáo...</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="report-content"
        >
          {activeTab === "revenue" && (
              <motion.div layout className="chart-container">
                 {revenueData ? (
                    <>
                        <h3>Doanh thu theo thời gian</h3>
                        <div className="chart-wrapper">
                            <Line data={revenueData} options={revenueChartOptions} />
                        </div>
                    </>
                 ) : (
                     <p className="no-data-message">Không có dữ liệu doanh thu cho khoảng thời gian đã chọn.</p>
                 )}
              </motion.div>
          )}

          {activeTab === "occupancy" && (
             <motion.div layout className="chart-container">
                {occupancyData ? (
                    <>
                        <h3>Công suất phòng hàng ngày</h3>
                        <div className="chart-wrapper">
                            <Bar data={occupancyData} options={occupancyChartOptions} />
                        </div>
                    </>
                ) : (
                    <p className="no-data-message">Không có dữ liệu công suất phòng cho khoảng thời gian đã chọn.</p>
                )}
              </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default Reports

