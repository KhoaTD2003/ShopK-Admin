$(document).ready(function () {
   

    function loadInvoiceData() {
        $.ajax({
            url: 'http://localhost:8080/api/hoadon', // Sửa lại URL theo yêu cầu
            type: 'GET',
            success: function (data) {
                // Xử lý dữ liệu trả về từ API
                let tableRows = '';
                if (data.length === 0) {
                    // Thêm thông báo khi không có hóa đơn nào
                    tableRows = `
                        <tr>
                            <td colspan="11" class="text-center" style="font-weight: bold;
                                 color: #555;">Không có hóa đơn nào</td>                
                        </tr>
                    `;
                } else {
                    data.forEach(function (invoice, index) {
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
                        <button class="btn btn-outline-info btn-rounded editInvoiceBtn" data-id="${invoice.id}">
                            <i class="fas fa-pen"></i> Xem
                        </button>
                      ${invoice.trangThai !== 'Ðã Thanh Toán' ? `
                        <button class="btn btn-outline-danger btn-rounded" data-id="${invoice.id}">
                           <i class="fas fa-trash"></i> Delete
                        </button>
                         ` : ''}
                        </td>
                    </tr>
                `;
                    });
                }

                $('#invoiceTableBody').html(tableRows);
                registerEdit();

            },
            error: function (xhr, status, error) {
                alert('Có lỗi xảy ra khi tải dữ liệu hóa đơn.');
            }

        });
    }
    // <td>${invoice.id}</td> <!-- ID Hóa đơn -->

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

    // Hiển thị khu vực cập nhật trạng thái
    $('#statusUpdateContainer').show();

    // Lắng nghe sự kiện khi nhấn nút "Cập nhật trạng thái"
    $('#updateStatusBtn').off('click').on('click', function () {
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
