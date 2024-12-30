$(document).ready(function () {


    function loadInvoiceData(pageNumber = 0, searchKeyword = '', ghiChu = '', trangThai = '') {
        console.log("Trang Thai:", trangThai);  // Kiểm tra giá trị trangThai

        $.ajax({
            url: `http://localhost:8080/api/hoadon`, // Sửa lại URL theo yêu cầu
            type: 'GET',
            data: {
                pageNumber: pageNumber,      // Số trang
                maHoaDon: searchKeyword, // Từ khóa tìm kiếm (nếu có)
                sdt: searchKeyword, // Từ khóa tìm kiếm (nếu có)
                ghiChu: ghiChu,  // Gửi giá trị ghiChu đúng với dữ liệu API
                trangThai: trangThai     // Trạng thái hóa đơn (Đã Thanh Toán/Chưa Thanh Toán)

            },
            success: function (data) {
                console.log("Dữ liệu API trả về: ", data);  // Kiểm tra dữ liệu trả về từ API

                // Xử lý dữ liệu trả về từ API
                let tableRows = '';
                if (data.content.length === 0) {
                    // Thêm thông báo khi không có hóa đơn nào
                    tableRows = `
                        <tr>
                            <td colspan="11" class="text-center" style="font-weight: bold;
                                 color: #555;">NO DATA FOUND !</td>                
                        </tr>
                    `;
                } else {
                    data.content.forEach(function (invoice, index) {
                        if ((trangThai === '' && invoice.trangThai !== 'Cancle') || (trangThai === 'Cancle' && invoice.trangThai === 'Cancle')) {

                        tableRows += `
                    <tr>
                        <td>${index + 1}</td> <!-- Thêm STT -->
                        <td>${invoice.maHoaDon}</td> <!-- Mã Hóa đơn -->
                        <td>${invoice.tenKH}</td> <!-- Tên Khách -->
                        <td>${invoice.sdt}</td> <!-- Tên Khách -->
                        <td>${formatDate(new Date(invoice.ngayTao))}</td> <!-- Ngày tạo -->
                        <td>${formatCurrency(invoice.tongTien)}</td> <!-- Tổng tiền -->
                        <td>${formatCurrency(invoice.tienGiam)}</td> <!-- Tiền giảm -->
                        <td>${formatCurrency(invoice.tienThu)}</td> <!-- Tiền thu -->
                        <td>
                             ${invoice.ghiChu === 'Online'
                                ? '<i class="fas fa-globe" style="color: blue;"></i> Online'
                                : '<i class="fas fa-store" style="color: green;"></i> In-Store'}
                        </td>

                        <td>${invoice.trangThai || 'N/A'}</td> <!-- Trạng thái tài khoản -->
                      
                        <td class="text-end">
                            ${invoice.trangThai !== 'Cancle'
                                ? `
                            <button class="btn btn-outline-info btn-rounded editInvoiceBtn" data-id="${invoice.id}">
                                <i class="fas fa-pen"></i> Xem
                            </button>
                            `
                                : ''
                            }
                    
                        ${invoice.trangThai === 'Chua Thanh Toán' ? `
                            <button class="btn btn-outline-danger btn-rounded cancelInvoiceBtn" data-id="${invoice.id}">
                                <i class="fas fa-times"></i> Cancel
                            </button> `
                                : invoice.trangThai === 'Cancle' ? `
                            <button class="btn btn-outline-danger btn-rounded deleteInvoiceBtn" data-id="${invoice.id}">
                                <i class="fas fa-trash"></i> Xóa
                            </button>  `: ''}
                            </td>
                        </tr>
                    `;
                        }
                    });
                }

                $('#invoiceTableBody').html(tableRows);
                registerEdit();
                renderPaginatio(data.totalPages, pageNumber);

            },
            error: function (xhr, status, error) {
                alert('Có lỗi xảy ra khi tải dữ liệu hóa đơn.');
            }

        });
    }

    $('#sortStatus').change(function () {
        const trangThai = $(this).val(); // Lấy giá trị trạng thái được chọn
        const searchKeyword = $('#searchKeyword').val(); // Lấy từ khóa tìm kiếm
        const ghiChu = $('input[name="billStatus"]:checked').val() === 'Online' ? 'Online' : ''; // Ghi chú nếu có (Online hoặc In Store)

        console.log("Trang Thai Chon:", trangThai);  // Kiểm tra trạng thái đã chọn

        loadInvoiceData(0, searchKeyword, ghiChu, trangThai);  // Truyền giá trị trạng thái vào API
    });


    $('input[name="billStatus"]').change(function () {
        const billStatus = $('input[name="billStatus"]:checked').val();  // Lấy giá trị trạng thái lọc
        console.log("Trạng thái lọc: " + billStatus);  // Kiểm tra giá trị của billStatus
        const searchKeyword = $('#searchKeyword').val();  // Lấy từ khóa tìm kiếm

        // Dựa vào giá trị billStatus, gửi đúng giá trị ghiChu vào API
        let ghiChu = '';
        if (billStatus === 'Online') {
            ghiChu = 'Online';
        } else if (billStatus === 'In Store') {
            ghiChu = 'In Store';
        } else {
            ghiChu = '';  // Nếu chọn "Tất cả", không lọc theo trạng thái ghi chú
        }
        console.log("Giá trị ghiChu trước khi gửi: " + ghiChu);  // Debug giá trị ghiChu

        loadInvoiceData(0, searchKeyword, ghiChu);  // Gọi lại load dữ liệu với ghiChu được truyền vào
    });

    $('#searchKeyword').on('input', function () {
        const searchKeyword = $(this).val(); // Lấy từ khóa người dùng nhập
        loadInvoiceData(0, searchKeyword);   // Gọi hàm loadProductData với từ khóa tìm kiếm

    });

    function deleteInvoice(invoiceId) {
        // Gửi yêu cầu DELETE tới API
        $.ajax({
            url: `http://localhost:8080/api/hoadon/${invoiceId}`,  // URL của API xóa hóa đơn, thay đổi theo API của bạn
            type: 'DELETE',
            success: function(response) {
                // Nếu xóa thành công, cập nhật lại danh sách hóa đơn
                alert('Hóa đơn đã được xóa!');
                loadInvoiceData(0, '', '', '');  // Gọi lại hàm loadInvoiceData để tải lại danh sách
            },
            error: function(xhr, status, error) {
                alert('Có lỗi xảy ra khi xóa hóa đơn.');
            }
        });
    }

    $(document).on('click', '.deleteInvoiceBtn', function() {
        // Lấy id của hóa đơn từ thuộc tính data-id của nút
        var invoiceId = $(this).data('id');
        
        // Xác nhận việc xóa trước khi thực hiện
        if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
            // Gọi hàm xóa
            deleteInvoice(invoiceId);
        }
    });

    // Khi bấm vào nút "Hủy"
    $(document).on("click", ".cancelInvoiceBtn", function () {
        console.log("Nút 'Hủy' đã được bấm"); // Log kiểm tra

        var invoiceId = $(this).data("id"); // Lấy ID của hóa đơn từ thuộc tính data-id

        // Xác nhận hành động hủy
        if (confirm("Bạn có chắc chắn muốn hủy hóa đơn này?")) {
            // Gửi yêu cầu AJAX đến server
            $.ajax({
                url: `http://localhost:8080/api/hoadon/status/${invoiceId}`,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify({
                    trangThai: "Cancle" // Cập nhật trạng thái thành "Đã hủy"
                }),
                success: function (response) {
                    // Nếu thành công, cập nhật giao diện
                    alert("Hóa đơn đã được hủy!");
                    // Có thể thêm logic để cập nhật lại trạng thái trên giao diện nếu cần
                    location.reload(); // Reload lại trang để thấy thay đổi
                },
                error: function (error) {
                    // Nếu có lỗi, hiển thị thông báo lỗi
                    alert("Có lỗi xảy ra khi hủy hóa đơn!");
                }
            });
        }
    });

    function renderPaginatio(totalPages, currentPage) {
        console.log(totalPages + "trang");
        let paginationHtml = '';
        for (let i = 0; i < totalPages; i++) {
            paginationHtml += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                                    <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
                               </li>`;
        }
        // console.log('Generated HTML:', paginationHtml); // Kiểm tra HTML sinh ra

        $('#pagination').html(paginationHtml);
    }

    // Bắt sự kiện khi click vào các nút phân trang
    $('#pagination').on('click', '.page-link', function (e) {
        e.preventDefault();
        const pageNumber = $(this).data('page');  // Lấy số trang từ thuộc tính data-page
        loadInvoiceData(pageNumber);  // Tải dữ liệu của trang tương ứng
    });

    loadInvoiceData();



    $(document).on('hidden.bs.modal', '#editInvoiceModal', function () {
        console.log('Modal đã đóng, tải lại dữ liệu...');
        loadInvoiceData();
    });

});



function formatCurrency(amount) {
    if (typeof amount !== 'number') amount = Number(amount); // Đảm bảo đầu vào là số
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function formatDate(date) {
    let datePart = [
        date.getMonth() + 1,
        date.getDate(),
        date.getFullYear()
    ].map((n, i) => n.toString().padStart(i === 2 ? 4 : 2, "0")).join("/");
    let timePart = [
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
    ].map((n, i) => n.toString().padStart(2, "0")).join(":");
    return datePart + " " + timePart;
}



function registerEdit() {
    $('.editInvoiceBtn').on('click', function () {
        const id = $(this).data('id'); // Lấy ID hóa đơn từ nút
        console.log(`Loading details for invoice ID: ${id}`);

        $.ajax({
            url: `http://localhost:8080/api/hoadon/billdetail/${id}`, // API chi tiết hóa đơn
            type: 'GET',
            success: function (invoiceData) {
                console.log(invoiceData); // Kiểm tra dữ liệu trả về trong console

                // Làm trống nội dung bảng trước khi cập nhật
                $('#productTableBody').empty();

                let totalAmount = 0;

                // Tạo các hàng dữ liệu từ mảng trả về
                let productRows = '';
                invoiceData.forEach(function (item) {
                    totalAmount = item.tongTien; // Cộng dồn tổng tiền
                    discountAmount = item.giamGia;
                    totalAfter = item.tongTienSauGiamGia;

                    //      // Kiểm tra trạng thái của hóa đơn
                    //      let statusText = item.trangThai === 'PENDING' ? 'Chưa Thanh Toán' : 'Đã Thanh Toán';
                    //      let statusClass = item.trangThai === 'PENDING' ? 'badge bg-warning' : 'badge bg-success';
                    //     <td>
                    //     <span class="${statusClass}">
                    //         ${statusText}
                    //     </span>
                    // </td>
                    productRows += `
                        <tr data-id="${item.id}" data-status="${item.trangThai}"> <!-- Lưu id và trạng thái trong data attribute -->
                            <td hidden>${item.id}</td> <!-- Tên sản phẩm -->
                            <td>${item.tenSanPham}</td> <!-- Tên sản phẩm -->
                            <td>${item.soLuong}</td> <!-- Số lượng -->
                            <td>${formatCurrency(item.donGia)}</td> <!-- Đơn giá -->

                            <td>
                                 <span class="${item.trangThai ? 'badge bg-success' : 'badge bg-warning'}">
                                  ${item.trangThai ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                                  </span>
                            </td>

                        </tr>`;
                });

                // Gắn các hàng vào <tbody>
                $('#productTableBody').html(productRows);

                $('#totalAmountContainer').text(`Tổng tiền: ${formatCurrency(totalAmount)} `);

                $('#discountAmountContainer').text(`Tiền giảm: ${formatCurrency(discountAmount)} `);

                $('#totalAfterDiscountContainer').text(`Tổng tiền sau giảm: ${formatCurrency(totalAfter)} `);

                // Điền ID hóa đơn vào input ẩn
                $('#invoiceId').val(id);

                // Hiển thị modal
                $('#editInvoiceModal').modal('show');

            },
            error: function () {
                alert('Không thể tải chi tiết hóa đơn.');
            }
        });
    });
}


// Xử lý sự kiện cập nhật trạng thái chi tiết hóa đơn
// $('#productTableBody').on('click', '.updateStatusBtn', function () {
//     const chiTietId = $(this).data('id'); // ID của chi tiết hóa đơn
//     const currentStatus = $(this).data('status'); // Trạng thái hiện tại của chi tiết hóa đơn
//     const newStatus = !currentStatus; // Lật trạng thái (nếu là true thì thành false, ngược lại)

//     // Gửi yêu cầu cập nhật trạng thái chi tiết hóa đơn
//     $.ajax({
//         url: `http://localhost:8080/api/hoadon/${chiTietId}/update-details-status?newStatus=${newStatus}`,
//         type: 'PUT',
//         contentType: 'application/json',
//         data: JSON.stringify({ newStatus: newStatus }), // Gửi dữ liệu dưới dạng JSON
//         success: function (updatedChiTiet) {
//             console.log(updatedChiTiet); // Kiểm tra dữ liệu trả về trong console

//             // Cập nhật lại trạng thái trong bảng
//             const row = $(`button[data-id="${chiTietId}"]`).closest('tr');
//             row.find('td:nth-child(6) span')
//                 .removeClass('badge bg-success badge bg-warning')
//                 .addClass(updatedChiTiet.trangThai ? 'badge bg-success' : 'badge bg-warning')
//                 .text(updatedChiTiet.trangThai ? 'Đã Thanh Toán' : 'Chưa Thanh Toán');

//             // Cập nhật lại trạng thái nút
//             $(`button[data-id="${chiTietId}"]`).data('status', updatedChiTiet.trangThai);

//             // Hiển thị thông báo thành công
//             alert('Cập nhật trạng thái thành công!');
//             $('#editInvoiceModal').modal('hide');

//         },
//         error: function () {
//             alert('Không thể cập nhật trạng thái chi tiết hóa đơn.');
//         }
//     });
// });

$('#productTableBody').on('click', 'tr', function () {
    const productId = $(this).data('id'); // Lấy id từ data-id của dòng
    const currentStatus = $(this).data('status'); // Lấy trạng thái hiện tại từ data-status
    console.log(currentStatus, "okokok");
    // Hiển thị khu vực cập nhật trạng thái
    $('#statusUpdateContainer').show();

    // Lắng nghe sự kiện khi nhấn nút "Cập nhật trạng thái"
    $('#updateStatusBtn').off('click').on('click', function () {

        // if (currentStatus === true) {
        //     // Nếu trạng thái hiện tại là true (Đã Thanh Toán), không cho phép cập nhật
        //     alert('Không thể cập nhật trạng thái vì hóa đơn đã được thanh toán!');
        //     return; // Kết thúc xử lý tại đây
        // }
        const newStatus = !currentStatus; // Lật trạng thái (nếu true thành false, ngược lại)

        // Gửi yêu cầu cập nhật trạng thái chi tiết hóa đơn
        $.ajax({
            url: `http://localhost:8080/api/hoadon/${productId}/update-details-status?newStatus=${newStatus}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ newStatus: newStatus }), // Gửi dữ liệu dưới dạng JSON
            success: function (updatedChiTiet) {
                console.log(updatedChiTiet); // Kiểm tra dữ liệu trả về trong console

                // Cập nhật lại trạng thái trong bảng
                const row = $('#productTableBody').find(`tr[data-id="${productId}"]`);
                row.find('td:nth-child(4) span')
                    .removeClass('badge bg-success badge bg-warning')
                    .addClass(updatedChiTiet.trangThai ? 'badge bg-success' : 'badge bg-warning')
                    .text(updatedChiTiet.trangThai ? 'Đã Thanh Toán' : 'Chưa Thanh Toán');

                // Ẩn khu vực nút cập nhật trạng thái sau khi cập nhật

                // Hiển thị thông báo thành công
                alert('Cập nhật trạng thái thành công!');
                $('#statusUpdateContainer').hide();
                $('#editInvoiceModal').modal('hide');

            },
            error: function () {
                alert('Không thể cập nhật trạng thái chi tiết hóa đơn.');
            }
        });
    });
});



// Gắn sự kiện click vào các nút Xóa

