

$(document).ready(function () {
    const today = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại dưới định dạng YYYY-MM-DD
    console.log(today);
    // Hàm để gọi API và cập nhật số liệu
    function updateData(timePeriod) {
        // Gọi API Chưa Thanh Toán
        $.ajax({
            url: 'http://localhost:8080/api/hoadon/unpaid',
            data: { timePeriod: timePeriod, startDate: today },
            method: 'GET',
            success: function (response) {
                $('#unpaidNumber').text(response); // Cập nhật số đơn chưa thanh toán
            },
            error: function (err) {
                console.error('Error fetching unpaid data', err);
            }
        });

        // Gọi API Đã Thanh Toán
        $.ajax({
            url: 'http://localhost:8080/api/hoadon/paid',
            data: { timePeriod: timePeriod, startDate: today },
            method: 'GET',
            success: function (response) {
                $('#paidNumber').text(response); // Cập nhật số đơn đã thanh toán
            },
            error: function (err) {
                console.error('Error fetching paid data', err);
            }
        });

        // Gọi API Đơn Hủy
        $.ajax({
            url: 'http://localhost:8080/api/hoadon/cancelled',
            data: { timePeriod: timePeriod, startDate: today },
            method: 'GET',
            success: function (response) {
                $('#cancelledNumber').text(response); // Cập nhật số đơn đã hủy
            },
            error: function (err) {
                console.error('Error fetching cancelled data', err);
            }
        });

        // Gọi API Doanh Thu
        $.ajax({
            url: 'http://localhost:8080/api/hoadon/revenue',
            data: { timePeriod: timePeriod },
            method: 'GET',
            success: function (response) {
                if (!response) {
                    response = 0; // Gán giá trị mặc định là 0
                }
                console.log(response);
                $('#revenueAmount').text(response); // Cập nhật doanh thu

            },
            error: function (err) {
                console.error('Error fetching revenue data', err);
            }
        });
    }

    // Khi trang được tải, mặc định gọi API với thời gian là 'day'
    updateData('day');

    // Lắng nghe sự kiện thay đổi của các select để cập nhật dữ liệu theo thời gian
    $('#unpaidTimeRangeSelector, #paidTimeRangeSelector, #revenueTimeRangeSelector, #cancelledTimeRangeSelector').change(function () {
        const selectedTimePeriod = $(this).val();
        updateData(selectedTimePeriod); // Cập nhật dữ liệu theo thời gian đã chọn
    });

    // function loadTopSellingProducts() {
    //     $.ajax({
    //         url: 'http://localhost:8080/api/sanpham/bestseller',
    //         method: "GET",
    //         dataType: "json",
    //         success: function (response) {
    //             // Xóa dữ liệu cũ trong bảng
    //             const tbody = $(".table-responsive tbody");
    //             tbody.empty();

    //             if (response.length === 0) {
    //                 tbody.append(`
    //                     <tr>
    //                         <td colspan="4" class="text-center">Không có sản phẩm nào</td>
    //                     </tr>
    //                 `);
    //             } else {
    //                 // Duyệt qua dữ liệu và thêm vào bảng
    //                 response.forEach((product, index) => {
    //                     tbody.append(`
    //                     <tr>
    //                         <td>${index + 1}</td>
    //                         <td>${product.tenSanPham}</td>
    //                         <td>${product.soLuong}</td>
    //                         <td>${product.tongTien.toLocaleString()} VND</td>
    //                     </tr>
    //                 `);
    //                 });
    //             }
    //         },
    //         error: function (xhr, status, error) {
    //             console.error("Lỗi khi tải danh sách sản phẩm:", error);
    //         },
    //     });
    // }
    function loadTopSellingProducts() {
        $.ajax({
            url: 'http://localhost:8080/api/sanpham/bestseller', // Endpoint lấy danh sách sản phẩm bán chạy
            method: "GET",
            dataType: "json",
            success: function (response) {
                // Xóa dữ liệu cũ trong bảng
                const tbody = $("#product_list");
                tbody.empty();

                if (response.length === 0) {
                    // Nếu không có sản phẩm nào
                    tbody.append(`
                        <tr>
                            <td colspan="4" class="text-center">Không có sản phẩm nào</td>
                        </tr>
                    `);
                } else {
                    // Duyệt qua danh sách sản phẩm và thêm vào bảng
                    response.forEach((product, index) => {
                        tbody.append(`
                            <tr>
                                <td>${index + 1}</td>
                                <td>${product.tenSanPham}</td>
                                <td>${product.soLuong}</td>
                                <td>${product.tongTien.toLocaleString()} VND</td>
                            </tr>
                        `);
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi tải danh sách sản phẩm:", error);
            },
        });
    }

    // Gọi hàm loadTopSellingProducts khi trang được tải

    // Tùy chọn: Tự động làm mới danh sách sản phẩm mỗi 1 phút
    setInterval(loadTopSellingProducts, 60000);


    // Gọi hàm loadTopSellingProducts khi trang được tải
    loadTopSellingProducts();

    // Hàm lấy danh sách đơn hàng mới
    function loadNewOrders() {
        $.ajax({
            url: 'http://localhost:8080/api/hoadon/bill/today',
            type: "GET",
            dataType: "json",
            success: function (response) {
                console.log(response, "new bill");
                // Xóa nội dung cũ trong bảng
                $("#order-list").empty();

                if (response.length > 0) {
                    
                    response.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));

                    // Lặp qua danh sách đơn hàng và hiển thị
                    response.forEach((order, index) => {

                        let actionButton = `
                                <button class="btn btn-sm btn-primary btn-view" data-id="${order.id}">Xem</button>
                            `;

                        let row = `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${order.maHoaDon}</td>
                                    <td>
                                        ${order.ghiChu === 'Online'
                                ? '<i class="fas fa-globe" style="color: blue;"></i> Online'
                                : '<i class="fas fa-store" style="color: green;"></i> In-Store'}
                                    </td>                                    
                                    <td>${order.trangThai}</td>
                                    <td>${actionButton}</td>
                                </tr>
                            `;
                        $("#order-list").append(row);
                    });
                } else {
                    // Hiển thị thông báo nếu không có đơn hàng
                    $("#order-list").append(`<tr><td colspan="5" class="text-center">Không có đơn hàng mới hôm nay</td></tr>`);
                }
            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi tải đơn hàng: ", error);
            },
        });
    }

    // Gọi hàm loadNewOrders khi trang được tải
    loadNewOrders();

    // Tùy chọn: Tải lại danh sách mỗi 30 giây
    setInterval(loadNewOrders, 30000);

    // Xử lý sự kiện khi bấm nút Xem hoặc Xóa
    // $(document).on("click", ".btn-view", function () {
    //     let orderId = $(this).data("id");
    //     // Logic xử lý xem đơn hàng (mở modal, chuyển trang, v.v.)
    //     console.log("Xem đơn hàng ID:", orderId);
    // });

    // Xử lý sự kiện nhấn nút Xem
    $(document).on('click', '.btn-view', function () {
        const orderId = $(this).data('id'); // Lấy ID đơn hàng từ nút
        console.log(`Loading details for order ID: ${orderId}`);

        // Gọi API để lấy chi tiết hóa đơn
        $.ajax({
            url: `http://localhost:8080/api/hoadon/billdetail/${orderId}`, // API chi tiết hóa đơn
            type: 'GET',
            success: function (invoiceData) {
                console.log(invoiceData); // Kiểm tra dữ liệu trả về trong console

                // Làm trống bảng chi tiết trước khi cập nhật
                $('#productTableBody').empty();

                let totalAmount = 0;
                let discountAmount = 0;
                let totalAfterDiscount = 0;

                // Tạo các hàng dữ liệu từ mảng trả về
                let productRows = '';
                invoiceData.forEach(function (item) {
                    totalAmount = item.tongTien; // Cộng dồn tổng tiền
                    discountAmount = item.giamGia;
                    totalAfterDiscount = item.tongTienSauGiamGia;

                    productRows += `
                    <tr data-id="${item.id}" data-status="${item.trangThai}">
                        <td>${item.tenSanPham}</td>
                        <td>${item.soLuong}</td>
                        <td>${formatCurrency(item.donGia)}</td>
                        <td>
                            <span class="${item.trangThai === 'PENDING' ? 'badge bg-warning' : 'badge bg-success'}">
                                ${item.trangThai === 'PENDING' ? 'Chưa Thanh Toán' : 'Đã Thanh Toán'}
                            </span>
                        </td>
                    </tr>`;
                });

                // Gắn các hàng vào bảng
                $('#productTableBody').html(productRows);

                // Hiển thị tổng tiền và thông tin chiết khấu
                $('#totalAmountContainer').text(`Tổng tiền: ${formatCurrency(totalAmount)}`);
                $('#discountAmountContainer').text(`Tiền giảm: ${formatCurrency(discountAmount)}`);
                $('#totalAfterDiscountContainer').text(`Tổng tiền sau giảm: ${formatCurrency(totalAfterDiscount)}`);

                // Hiển thị modal
                $('#editInvoiceModal').modal('show');
            },
            error: function () {
                alert('Không thể tải chi tiết hóa đơn.');
            }
        });
    });

    function formatCurrency(amount) {
        if (typeof amount !== 'number') amount = Number(amount); // Đảm bảo đầu vào là số
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }
    
  
});




// document.addEventListener("DOMContentLoaded", function () {

//     // Hàm lấy dữ liệu từ API
//     function fetchRevenueData(date) {
//         $.ajax({
//             url: 'http://localhost:8080/api/hoadon/total-revenue',

//             type: 'GET',
//             data: { date: date }, // Truyền tham số ngày (yyyy-MM-dd)
//             success: function (response) {
//                 // Khi API trả về dữ liệu, cập nhật biểu đồ
//                 updateChart(date, response);

//             },
//             error: function (xhr, status, error) {
//                 console.error("Error fetching data: ", error);
//                 alert("Có lỗi xảy ra khi lấy dữ liệu!");
//             }
//         });
//     }

//     // Hàm cập nhật dữ liệu vào biểu đồ
//     function updateChart(date, totalRevenue) {
//         // Cập nhật dữ liệu cho biểu đồ
//         const dateIndex = revenueChart.data.labels.indexOf(date); // Tìm vị trí của ngày trong trục X

//         if (dateIndex !== -1) {
//             // Nếu ngày đã tồn tại, cập nhật doanh thu
//             revenueChart.data.datasets[0].data[dateIndex] = totalRevenue;
//         } else {
//             // Nếu ngày chưa tồn tại, thêm ngày và doanh thu mới
//             revenueChart.data.labels.push(date); // Thêm ngày vào trục X
//             revenueChart.data.datasets[0].data.push(totalRevenue); // Thêm tổng doanh thu vào trục Y
//         }

//         // revenueChart.data.labels.push(date); // Thêm ngày
//         // revenueChart.data.datasets[0].data.push(totalRevenue); // Thêm tổng doanh thu
//         revenueChart.update(); // Cập nhật biểu đồ
//     }

//     // Khởi tạo biểu đồ
//     const ctx = document.getElementById("revenueChart").getContext("2d");
//     const revenueChart = new Chart(ctx, {
//         type: 'bar', // Loại biểu đồ (bar: cột, line: đường, pie: tròn)
//         data: {
//             labels: [], // Mảng chứa ngày
//             datasets: [
//                 {
//                     label: 'Doanh thu (VND)', // Tên dataset
//                     data: [], // Dữ liệu doanh thu
//                     backgroundColor: 'rgba(75, 192, 192, 0.2)', // Màu nền
//                     borderColor: 'rgba(75, 192, 192, 1)', // Màu viền
//                     borderWidth: 1
//                 }
//             ]
//         },
//         options: {
//             responsive: true,
//             scales: {
//                 y: {
//                     beginAtZero: true // Bắt đầu từ 0
//                 }
//             }
//         }
//     });

//     // Ví dụ: Gọi API với ngày hôm nay
//     const today = new Date().toISOString().split('T')[0]; // yyyy-MM-dd
//     fetchRevenueData(today);

//     // Xử lý sự kiện khi người dùng nhấn nút "Xem doanh thu"
//     document.getElementById("loadData").addEventListener("click", function () {
//         const selectedDate = document.getElementById("datePicker").value;
//         if (selectedDate) {
//             fetchRevenueData(selectedDate); // Gọi API với ngày được chọn
//         } else {
//             alert("Vui lòng chọn ngày!");
//         }
//     });
// });



document.addEventListener("DOMContentLoaded", function () {

    // Hàm lấy dữ liệu từ API
    function fetchRevenueData(startDate, endDate) {
        $.ajax({
            url: 'http://localhost:8080/api/hoadon/total-revenue',
            type: 'GET',
            data: {
                startDate: startDate, // Ngày bắt đầu (yyyy-MM-dd)
                endDate: endDate // Ngày kết thúc (yyyy-MM-dd)
            },
            success: function (response) {
                // Khi API trả về dữ liệu, cập nhật biểu đồ
                updateChart(response);
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data: ", error);
                alert("Có lỗi xảy ra khi lấy dữ liệu!");
            }
        });
    }

    // Hàm cập nhật dữ liệu vào biểu đồ
    function updateChart(revenueData) {
        // Cập nhật dữ liệu cho biểu đồ
        revenueChart.data.labels = []; // Xóa nhãn cũ
        revenueChart.data.datasets[0].data = []; // Xóa dữ liệu cũ

        // Thêm dữ liệu mới vào biểu đồ
        revenueData.forEach(function (item) {
            revenueChart.data.labels.push(item.date); // Thêm ngày vào trục X
            revenueChart.data.datasets[0].data.push(item.totalRevenue); // Thêm doanh thu vào trục Y
        });

        revenueChart.update(); // Cập nhật biểu đồ
    }

    // Khởi tạo biểu đồ
    const ctx = document.getElementById("revenueChart").getContext("2d");
    const revenueChart = new Chart(ctx, {
        type: 'bar', // Loại biểu đồ (bar: cột, line: đường, pie: tròn)
        data: {
            labels: [], // Mảng chứa ngày
            datasets: [
                {
                    label: 'Doanh thu (VND)', // Tên dataset
                    data: [], // Dữ liệu doanh thu
                    backgroundColor: 'rgba(75, 192, 192, 0.2)', // Màu nền
                    borderColor: 'rgba(75, 192, 192, 1)', // Màu viền
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true // Bắt đầu từ 0
                }
            }
        }
    });

    // Hàm lấy ngày hôm nay
    function getTodayDate() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
    }

    // Hiển thị doanh thu của ngày hôm nay mặc định
    const today = getTodayDate();
    fetchRevenueData(today, today);

    // Xử lý sự kiện khi người dùng nhấn nút "Xem doanh thu"
    document.getElementById("loadData").addEventListener("click", function () {
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;

        if (startDate && endDate) {
            fetchRevenueData(startDate, endDate); // Gọi API với khoảng thời gian đã chọn
        } else {
            alert("Vui lòng chọn cả ngày bắt đầu và ngày kết thúc!");
        }
    });
});

