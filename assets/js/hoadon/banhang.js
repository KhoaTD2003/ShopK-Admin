function addToCart(product) {
    // Lấy giỏ hàng từ localStorage (nếu có)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    console.log("Adding product to cart:", product);

    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    let productIndex = cart.findIndex(item => item.prodId === product.prodId);

    // Kiểm tra nếu số lượng sản phẩm nhập vào vượt quá số lượng tồn kho
    if (product.quantity > product.stock) {
        alert(`Sản phẩm "${product.prodName}" không đủ số lượng trong kho. Tồn kho hiện tại: ${product.stock}`);
        return; // Dừng việc thêm sản phẩm vào giỏ hàng nếu số lượng vượt quá tồn kho
    }

    if (productIndex !== -1) {
        // Nếu sản phẩm đã có trong giỏ, tăng số lượng của sản phẩm đó
        if (cart[productIndex].quantity + product.quantity > product.stock) {
            alert(`Không thể thêm vào giỏ, số lượng sản phẩm "${product.prodName}" vượt quá số lượng tồn kho. Tồn kho: ${product.stock}`);
            return;
        }
        cart[productIndex].quantity += product.quantity; // Tăng số lượng
    } else {
        // Nếu chưa có trong giỏ, thêm sản phẩm vào giỏ
        cart.push(product);
    }

    // Lưu giỏ hàng lại vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log("Giỏ hàng sau khi thêm:", cart); // In giỏ hàng ra console
    renderCart();
    updateTotalAmount()
    // Thông báo thêm thành công
    // alert("Đã thêm vào giỏ hàng thành công!");
}
// function addToCart(product) {
//     // Lấy giỏ hàng từ localStorage (nếu có), nếu không thì khởi tạo giỏ hàng rỗng
//     let cart = JSON.parse(localStorage.getItem('cart')) || [];

//     // Kiểm tra xem sản phẩm đã có trong giỏ chưa
//     let existingProductIndex = cart.findIndex(item => item.prodId === product.prodId);

//     if (existingProductIndex !== -1) {
//         // Nếu sản phẩm đã có trong giỏ, tăng số lượng lên 1
//         cart[existingProductIndex].quantity += 1;
//     } else {
//         // Nếu chưa có, thêm sản phẩm mới vào giỏ
//         cart.push(product);
//     }

//     // Lưu giỏ hàng lại vào localStorage
//     localStorage.setItem('cart', JSON.stringify(cart));

//     // Cập nhật giỏ hàng trên giao diện
//     renderCart();
//     updateTotalAmount()
// }

// Hàm hiển thị giỏ hàng
function renderCart() {
    // Lấy giỏ hàng từ localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Tạo nội dung giỏ hàng
    let cartItemsHtml = cart.map(product => {
        // Định dạng giá của sản phẩm và tổng tiền cho sản phẩm
        const formattedPrice = product.price.toLocaleString('vi-VN');
        const formattedTotal = (product.price * product.quantity).toLocaleString('vi-VN');

        return `
            <tr>
                <td>${product.prodName}</td>
                <td>${product.quantity}</td>
                <td>${formattedPrice} VND</td>
                <td>${formattedTotal} VND</td>
                <td><button onclick="removeFromCart('${product.prodId}')">Xóa</button></td>
            </tr>
        `;
    }).join('');

    // Hiển thị giỏ hàng lên giao diện
    document.getElementById('cartItems').innerHTML = cartItemsHtml;

    // Cập nhật tổng tiền giỏ hàng
    updateTotalAmount();
}

$(document).ready(function () {
    $('#customerPhone').on('input', function () {
        const customerPhone = $(this).val().trim();

        if (customerPhone.length > 10) {
            $(this).val(customerPhone.slice(0, 10)); // Cắt bớt nếu quá 10 ký tự
            alert('Số điện thoại không hợp lệ');
        }

        // Kiểm tra tính hợp lệ của số điện thoại
        if (/^\d{10}$/.test(customerPhone)) {

            // Gọi API để lấy tên khách hàng
            $.ajax({
                url: `http://127.0.0.1:8080/api/find?sdt=${customerPhone}`, // Thay bằng URL của bạn
                method: 'GET',
                success: function (data) {
                    if (data) {
                        $('#customerName').val(data); // Điền tên khách hàng vào ô
                    } else {
                        $('#customerName').val(''); // Nếu không có tên, xóa ô tên
                    }
                },
                error: function () {
                    $('#customerName').val(''); // Xóa tên nếu không tìm thấy
                    // alert('Không tìm thấy khách hàng với số điện thoại này.');
                }
            });
        } else {
            $('#customerName').val(''); // Xóa tên nếu số điện thoại không hợp lệ
            // alert('Số điện thoại không hợp lệ');

        }
    });



    function loadDiscounts() {
        $.ajax({
            url: 'http://127.0.0.1:8080/api/giamgia', // Thay bằng URL API thực tế
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                console.log("Danh sách giảm giá:", response);

                // Lấy phần tử dropdown "Giảm giá"
                const discountSelect = $('#discountSelect');

                // Xóa các option cũ (nếu có)
                discountSelect.empty();

                // Thêm lựa chọn mặc định
                discountSelect.append('<option value="0">Không giảm giá</option>');

                const now = new Date();
                now.setHours(0, 0, 0, 0);

                // Thêm các tùy chọn giảm giá từ API
                response.forEach(discount => {
                    const endDate = new Date(discount.ngayKetThuc); // Chuyển đổi ngày kết thúc từ chuỗi thành đối tượng Date
                    endDate.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00 để chỉ so sánh ngày

                    if (discount.soLansd > 0 && discount.trangThai == true && endDate >= now) { // Kiểm tra nếu số lần sử dụng lớn hơn 0
                        // discountSelect.append(`<option value="${discount.ten}">Giảm ${discount.giamGia}</option>`);
                        const isPercentage = discount.giamGia.includes('%');

                        // Nếu là phần trăm, không cần format, nếu là số tiền thì định dạng
                        const discountValue = isPercentage ? discount.giamGia : formatCurrency(discount.giamGia);                        // const option = `<option value="${value}" data-id="${discount.ma}">${discount.ten} - ${discount.giamGia}% (Còn ${discount.soLansd} lượt)</option>`;

                        const option = `<option value="${discount.giamGia}" data-id="${discount.ma}" data-min="${discount.giaTriMin}">
                        ${discount.ten} - ${discountValue} Đơn Min ${formatCurrency(discount.giaTriMin)} (Còn ${discount.soLansd} lượt)</option>`;

                        discountSelect.append(option);
                    }
                });

                // Gán sự kiện khi thay đổi mức giảm giá
                discountSelect.change(updateTotalAmount);
            },
            error: function (xhr, status, error) {
                console.error('Lỗi khi lấy danh sách giảm giá:', error);
            }
        });
    }

    function formatCurrency(amount) {
        if (typeof amount !== 'number') amount = Number(amount); // Đảm bảo đầu vào là số
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    loadDiscounts()

    var maGiamGiaSelected;

    $('#discountSelect').on('change', function () {
        const selectedOption = $(this).find('option:selected'); // Lấy option được chọn
        maGiamGiaSelected = selectedOption.data('id'); // Lấy giá trị thuộc tính data-id

        // const minOrderValue = parseFloat(selectedOption.data('min')) || 0; // Lấy giá trị tối thiểu từ data-min
        // const totalAmount = parseFloat($('#totalAmount').text()); // Tổng tiền từ giỏ hàng

        // if (totalAmount < minOrderValue) {
        //     alert(`Đơn hàng cần đạt tối thiểu ${minOrderValue} VNĐ để áp dụng mã giảm giá này.`);
        //     $(this).val(''); // Reset dropdown
        // }
    });

    // Xử lý nút "Thanh toán"
    $('#checkoutBtn').click(function (e) {
        e.preventDefault();

        // Thu thập thông tin khách hàng từ form
        const customerName = $('#customerName').val().trim();
        const customerPhone = $('#customerPhone').val().trim();

        if (!customerName || !customerPhone) {
            alert('Vui lòng nhập đầy đủ thông tin khách hàng!');
            return;
        }

        if (!/^\d{10}$/.test(customerPhone)) {
            alert("Số điện thoại phải có đúng 10 chữ số.");
            return; // Ngăn chặn việc gửi yêu cầu
        }
        // Lấy giỏ hàng từ localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (cart.length === 0) {
            alert('Giỏ hàng trống!');
            return;
        }

        // Tính tổng tiền
        const totalAmount = cart.reduce((total, product) => total + (product.price * product.quantity), 0);

        // Lấy giá trị giảm giá và tính tổng sau giảm
        // const discount = parseFloat($('#discountSelect').val() || 0);
        // const finalAmount = totalAmount - (totalAmount * discount / 100);

        let discountPercentage = $('#discountSelect').val().trim(); // Lấy giá trị giảm giá từ form
        let finalAmount = totalAmount; // Khởi tạo số tiền cuối cùng bằng tổng tiền ban đầu

        console.log(discountPercentage);
        if (typeof discountPercentage === 'string' && discountPercentage.includes('%')) {
            // Nếu giá trị giảm giá là phần trăm
            discountPercentage = parseFloat(discountPercentage.replace('%', '').trim()); // Chuyển phần trăm thành số
            finalAmount = totalAmount - (totalAmount * discountPercentage / 100); // Tính số tiền sau giảm giá
        } else if (typeof discountPercentage === 'string' && !isNaN(discountPercentage)) {
            // Nếu giá trị giảm giá là số tiền
            discountPercentage = parseFloat(discountPercentage.trim()); // Chuyển số tiền thành số thực
            finalAmount = totalAmount - discountPercentage; // Tính số tiền sau giảm giá theo số tiền
        } else {
            // Nếu không có giá trị giảm giá hợp lệ, không thay đổi số tiền cuối cùng
            finalAmount = totalAmount;
        } if (finalAmount < 0) {
            finalAmount = 0
        }

        // Chuẩn bị dữ liệu để gửi đến API
        const invoiceData = {
            nguoiDung: {
                hoTen: customerName,
                sdt: customerPhone
            },
            sanPhamList: cart.map(product => ({
                idSanPham: product.prodId,
                ten: product.prodName,// ID sản phẩm
                soLuong: product.quantity,
                donGia: product.price
            })),
            tongTien: totalAmount,
            tienThu: finalAmount,
            tienGiam: totalAmount - finalAmount,
            maGiamGia: maGiamGiaSelected,  // Mã giảm giá nếu có
            ghiChu: "In Store"
        };

        if (confirm('Bạn có chắc chắn thanh toán?')) {

            // Gửi yêu cầu tạo hóa đơn và thanh toán
            $.ajax({
                url: 'http://127.0.0.1:8080/api/datdon/taiquay', // Thay bằng URL của bạn
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(invoiceData),
                success: function (response) {
                    alert('Thanh toán thành công!');
                    console.log('Kết quả thanh toán:', response);
                    // location.reload();
                    loadDiscounts();
                    // <p>Ngày: ${new Date().toLocaleDateString('vi-VN')}</p>

                    const invoiceHtml = `
                    <div id="invoiceContainer" class="invoice-container">
                        <div class="header">
                           <h1>HÓA ĐƠN BÁN HÀNG KSHOP</h1>
                            <p>Địa chỉ: Fpoly Hà Nội , Phường Xuân Phương, Quận Nam Từ Liêm, Hà Nội</p>
                            <p>Số điện thoại: 0988 168 168</p>
                            <p>Ngày: ${getCurrentDateTime()}</p>
                        </div>

                        <div class="details">
                            <p><strong>Tên khách hàng:</strong> ${customerName}</p>
                            <p><strong>Số điện thoại:</strong> ${customerPhone}</p>
                            <p><strong>Ghi Chú:</strong> In Store</p>

                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Số lượng</th>
                                    <th>Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cart.map((product, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${product.prodName}</td>
                                        <td>${product.quantity}</td>
                                        <td>${formatCurrency(product.price)}</td>
                                        <td>${formatCurrency(product.quantity * product.price)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <div class="totals">
                            <p><strong>Tổng tiền hàng:</strong> ${formatCurrency(totalAmount)}</p>
                            <p><strong>Giảm giá:</strong> ${formatCurrency(totalAmount - finalAmount)}</p>
                            <p><strong>Thành tiền:</strong> ${formatCurrency(finalAmount)}</p>
                        </div>

                        <div class="footer">
                            <p>Cảm ơn quý khách đã mua hàng tại KSHOP!</p>
                            <p>Hẹn gặp lại!</p>
                        </div>
                    </div>
                    <button id="printInvoiceBtn" class="btn btn-primary">In hóa đơn</button>`;

                    // Hiển thị hóa đơn trong modal
                    $('#invoiceModalBody').html(invoiceHtml);
                    $('#invoiceModal').modal('show');

                    // Xử lý nút In hóa đơn
                    $('#printInvoiceBtn').click(function () {
                        const invoiceContent = document.getElementById('invoiceContainer').innerHTML;
                        const printWindow = window.open('', '_blank');
                        printWindow.document.open();
                        printWindow.document.write(`
                            <html>
                                <head>
                                    <title>In hóa đơn</title>
                                    <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        margin: 0;
                                        padding: 20px;
                                        background-color: #f9f9f9;
                                        color: #333;
                                    }
                                    .invoice-container {
                                        max-width: 800px;
                                        margin: 0 auto;
                                        background-color: #fff;
                                        padding: 20px;
                                        border: 1px solid #ddd;
                                        border-radius: 8px;
                                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                                    }
                                    .header, .footer {
                                        text-align: center;
                                        margin-bottom: 20px;
                                    }
                                    table {
                                        width: 100%;
                                        border-collapse: collapse;
                                    }
                                    th, td {
                                        border: 1px solid #ddd;
                                        padding: 8px;
                                        text-align: center;
                                    }
                                    th {
                                        background-color: #007bff;
                                        color: #fff;
                                        font-weight: bold;
                                    }
                                </style>
                                </head>
                            <body onload="window.print(); window.close();">
                                    ${invoiceContent}
                                </body>
                            </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                    });

                    // Xóa giỏ hàng và làm mới giao diện
                    localStorage.removeItem('cart');
                    $('#cartItems').empty();
                    $('#totalAmount').text('0 ');
                    $('#finalAmount').text('0 ');
                    $('#customerForm')[0].reset(); // Đặt lại toàn bộ form
                },
                error: function (xhr, status, error) {
                    // console.error('Lỗi khi thanh toán:', error);
                    console.log(xhr)
                    alert(xhr.responseText);

                    // alert('Có lỗi xảy ra khi thanh toán.');
                }
            });
        }
    });
});

$('#closeButton, .close').click(function () {
    $('#invoiceModal').modal('hide');
});

// Hàm lấy ngày giờ hiện tại theo định dạng dd/MM/yyyy HH:mm:ss
function getCurrentDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Tháng tính từ 0
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function updateTotalAmount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Tính tổng tiền giỏ hàng
    let totalAmount = cart.reduce((total, product) => total + (product.price * product.quantity), 0);

    // Lấy giá trị giảm giá từ dropdown
    // const discountPercentage = parseFloat(document.getElementById('discountSelect').value) || 0;

    // Tính tổng tiền sau giảm giá
    // const discountAmount = (totalAmount * discountPercentage) / 100;
    // const finalAmount = totalAmount - discountAmount;

    let discountPercentage = $('#discountSelect').val().trim(); // Lấy giá trị giảm giá từ form
    let finalAmount = totalAmount; // Khởi tạo số tiền cuối cùng bằng tổng tiền ban đầu

    console.log(discountPercentage);
    if (typeof discountPercentage === 'string' && discountPercentage.includes('%')) {
        // Nếu giá trị giảm giá là phần trăm
        discountPercentage = parseFloat(discountPercentage.replace('%', '').trim()); // Chuyển phần trăm thành số
        finalAmount = totalAmount - (totalAmount * discountPercentage / 100); // Tính số tiền sau giảm giá
    } else if (typeof discountPercentage === 'string' && !isNaN(discountPercentage)) {
        // Nếu giá trị giảm giá là số tiền
        discountPercentage = parseFloat(discountPercentage.trim()); // Chuyển số tiền thành số thực
        finalAmount = totalAmount - discountPercentage; // Tính số tiền sau giảm giá theo số tiền
    } else {
        // Nếu không có giá trị giảm giá hợp lệ, không thay đổi số tiền cuối cùng
        finalAmount = totalAmount;
    }
    if (finalAmount < 0) {
        finalAmount = 0
    }
    // Định dạng số tiền
    const formattedTotalAmount = totalAmount.toLocaleString('vi-VN');
    const formattedFinalAmount = finalAmount.toLocaleString('vi-VN');

    // Cập nhật giao diện
    document.getElementById('totalAmount').textContent = `${formattedTotalAmount} `; // Tổng tiền gốc
    document.getElementById('finalAmount').textContent = `${formattedFinalAmount} `; // Tổng sau giảm
}


// Hàm xóa sản phẩm khỏi giỏ hàng
function removeFromCart(prodId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Lọc ra sản phẩm không phải có prodId cần xóa
    cart = cart.filter(product => product.prodId !== prodId);

    // Lưu giỏ hàng mới vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Cập nhật giỏ hàng trên giao diện
    renderCart();
}

// Hàm khởi tạo giỏ hàng khi trang được tải
function initCart() {
    renderCart();  // Hiển thị giỏ hàng lên giao diện ngay khi trang được tải
}

// Gọi hàm khởi tạo giỏ hàng khi trang tải
window.onload = initCart;


function displayProducts(pageNumber = 1) {
    const paramData = {
        search: $("#searchInput").val(),  // Từ khóa tìm kiếm
        sortOrder: "asc",  // Sắp xếp theo thứ tự tăng dần
        pageSize: 12,      // Số sản phẩm mỗi trang
        pageNumber: pageNumber - 1 // Trang hiện tại (API yêu cầu pageNumber bắt đầu từ 0)
    };

    const productList = $("#productList");  // Phần tử chứa danh sách sản phẩm
    const paginationContainer = $("#paginationContainer");  // Phần tử chứa phân trang

    $.support.cors = true;
    $.ajax({
        url: 'http://127.0.0.1:8080/api/sanpham', // Đường dẫn API
        type: 'GET',
        dataType: 'json',
        data: paramData,
        success: function (response) {
            console.log("Response from API:", response);  // Kiểm tra response từ API

            // Xóa danh sách sản phẩm hiện tại trước khi thêm mới
            $(productList).empty();

            if (response.content.length === 0) {
                $(productList).append(` <p class="text-center style="font-weight: bold;
                                 color: #555;">NO DATA FOUND !</td>                
                    `);
                return; // Không làm gì nếu không có sản phẩm
            }

            // Tính tổng số sản phẩm
            // updateProductCount(response.content.length);
            updatePagination(response.totalPages, pageNumber); // Cập nhật phân trang

            // Xây dựng toàn bộ HTML cho tất cả sản phẩm
            $.each(response.content, function (index, product) {
                var productHtml = buildProductHtml(product);  // Xây dựng HTML cho mỗi sản phẩm
                $(productList).append(productHtml);  // Thêm sản phẩm vào danh sách
            });
        },
        error: function (xhr, status, error) {
            console.error('Error retrieving products:', error);
        }
    });
}

function buildProductHtml(product) {
    const formattedPrice = product.giaBan.toLocaleString('vi-VN');
  // <div class="col-md-3 mb-3">
        //     <div class="card" style="width: 100%; max-width: 200px;">
        //         <img src="/assets/${product.anh}" class="card-img-top"  style="width: 100%; height: 250px; max-height: 150px; object-fit: cover;">
        //         <div class="card-body p-2">
        //             <h6 class="card-title" style="font-size: 0.9rem;">${product.tenSP}</h6>
        //             <p class="card-text" style="font-size: 0.8rem;">Giá: ${formattedPrice} VND</p> <!-- Hiển thị giá đã được định dạng -->
                   
        //             <button class="btn btn-primary btn-sm" onclick="addToCart({
        //                 prodId: '${product.idSP}', 
        //                 prodName: '${product.tenSP}', 
        //                 price: ${product.giaBan}, 
        //                 stock:${product.stock},
        //                 quantity: 1
        //             })">Thêm vào giỏ</button>
        //         </div>
        //     </div>
        // </div>

    return `
      
        <div class="col-md-3 mb-3">
    <div class="card" style="width: 100%; max-width: 200px; display: flex; flex-direction: column; height: 100%;">
        <img src="/assets/${product.anh}" class="card-img-top" style="width: 100%; height: 250px; max-height: 150px; object-fit: cover;">
        <div class="card-body p-2 d-flex flex-column" style="flex-grow: 1;">
            <h6 class="card-title" style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${product.tenSP}</h6>
            <p class="card-text" style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Thương hiệu: ${product.thuongHieu.ten}</p>
            <p class="card-text" style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Giá: ${formattedPrice} VND</p> <!-- Hiển thị giá đã được định dạng -->
            <button class="btn btn-primary btn-sm" onclick="addToCart({
                prodId: '${product.idSP}', 
                prodName: '${product.tenSP}', 
                price: ${product.giaBan}, 
                stock:${product.stock},
                quantity: 1
            })">Thêm vào giỏ</button>
        </div>
    </div>
</div>

    `;
}
// <p class="card-text" style="font-size: 0.8rem;">Thương hiệu: ${product.thuongHieu.ten}</p>
// <p class="card-text" style="font-size: 0.8rem;">Màu sắc: ${product.mauSac.ten}</p>
// Hàm cập nhật phân trang
function updatePagination(totalPages, currentPage) {
    const paginationContainer = $("#paginationContainer");
    paginationContainer.empty();  // Xóa các phân trang cũ

    if (totalPages > 1) {
        let paginationHtml = '<nav aria-label="Page navigation"><ul class="pagination justify-content-center">';

        // Nút Previous
        if (currentPage > 1) {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" id="previousPage" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
            `;
        }

        // Các số trang
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>
                </li>
            `;
        }

        // Nút Next
        if (currentPage < totalPages) {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" id="nextPage" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            `;
        }

        paginationHtml += '</ul></nav>';
        paginationContainer.html(paginationHtml);

        // Sự kiện cho nút Previous
        $('#previousPage').on('click', function () {
            if (currentPage > 1) {
                goToPage(currentPage - 1);
            }
        });

        // Sự kiện cho nút Next
        $('#nextPage').on('click', function () {
            if (currentPage < totalPages) {
                goToPage(currentPage + 1); // Lấy trang tiếp theo
            }
        });
    }
}

// Hàm chuyển đến trang mới
function goToPage(pageNumber) {
    displayProducts(pageNumber);  // Gọi lại hàm để tải sản phẩm của trang mới
}

// Hàm tìm kiếm sản phẩm
$("#searchInput").on("input", function () {
    displayProducts(1); // Mỗi khi người dùng nhập tìm kiếm, tải lại từ trang 1
});

// Gọi hàm hiển thị sản phẩm lần đầu
displayProducts(1);


// function createInvoice() {
//     let cart = JSON.parse(localStorage.getItem('cart')) || [];
//     let customerName = document.getElementById('customerName').value;
//     let customerPhone = document.getElementById('customerPhone').value;

//     if (!customerName) {
//         customerName = "Khách vãng lai";
//     }
//     // if (!customerPhone) {
//     //     customerPhone = "Khách lẻ";
//     // }
//     if (cart.length > 0) {
//         // Tạo hóa đơn
//         let invoice = {
//             id: new Date().getTime(),  // Sử dụng thời gian làm ID hóa đơn
//             customer: {
//                 name: customerName,
//                 phone: customerPhone
//             },
//             items: cart,
//             // status: 'pending'  // Trạng thái hóa đơn là chờ thanh toán
//         };

//         // Lấy danh sách hóa đơn chờ từ localStorage
//         let pendingInvoices = JSON.parse(localStorage.getItem('pendingInvoices')) || [];

//         // Thêm hóa đơn mới lên đầu danh sách
//         pendingInvoices.unshift(invoice);

//         // Giới hạn số lượng hóa đơn chờ (tối đa 5 hóa đơn)
//         if (pendingInvoices.length > 5) {
//             pendingInvoices.pop(); // Xóa hóa đơn cũ nhất nếu có hơn 5 hóa đơn
//         }

//         // Lưu danh sách hóa đơn vào localStorage
//         localStorage.setItem('pendingInvoices', JSON.stringify(pendingInvoices));

//         // Xóa giỏ hàng
//         localStorage.removeItem('cart');
//         renderCart();  // Cập nhật lại giỏ hàng trên giao diện

//         alert('Hóa đơn đã được tạo và lưu vào hóa đơn chờ.');

//         // Hiển thị lại danh sách hóa đơn chờ
//         renderPendingInvoices();
//     } else {
//         alert('Giỏ hàng trống hoặc thông tin khách hàng chưa đầy đủ.');
//     }
// }


// function viewPendingInvoice(invoiceId) {
//     // Lấy danh sách hóa đơn chờ từ localStorage
//     let pendingInvoices = JSON.parse(localStorage.getItem('pendingInvoices')) || [];
//     let invoice = pendingInvoices.find(inv => inv.id === invoiceId);

//     if (invoice) {


//         // Lưu lại giỏ hàng tạm thời từ hóa đơn chờ
//         localStorage.setItem('cart', JSON.stringify(invoice.items));

//          // Lưu thông tin khách hàng vào localStorage


//         // Hiển thị lại giỏ hàng
//         renderCart();

//         // Xóa hóa đơn chờ sau khi chuyển vào giỏ hàng
//         pendingInvoices = pendingInvoices.filter(inv => inv.id !== invoiceId);
//         localStorage.setItem('pendingInvoices', JSON.stringify(pendingInvoices));

//         // Cập nhật lại danh sách hóa đơn chờ
//         renderPendingInvoices();

//         // Thông báo đã chuyển hóa đơn chờ vào giỏ hàng
//         alert('Hóa đơn đã được chuyển vào giỏ hàng và xóa khỏi danh sách chờ.');
//     } else {
//         alert('Hóa đơn không tồn tại.');
//     }
// }
function createInvoice() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let customerName = document.getElementById('customerName').value;
    let customerPhone = document.getElementById('customerPhone').value;

    // Nếu không có thông tin tên hoặc số điện thoại, mặc định là "Khách vãng lai"
    if (!customerName) {
        customerName = "Khách vãng lai";
    }

    if (cart.length > 0) {
        // Tạo hóa đơn
        let invoice = {
            id: new Date().getTime(),  // Sử dụng thời gian làm ID hóa đơn
            customer: {
                name: customerName,
                phone: customerPhone
            },
            items: cart,
        };

        // // Lưu thông tin khách hàng và giỏ hàng vào localStorage
        // localStorage.setItem('customerName', customerName);
        // localStorage.setItem('customerPhone', customerPhone);
        // localStorage.setItem('cart', JSON.stringify(cart));

        // Lưu danh sách hóa đơn chờ vào localStorage
        let pendingInvoices = JSON.parse(localStorage.getItem('pendingInvoices')) || [];
        pendingInvoices.unshift(invoice);  // Thêm hóa đơn mới vào đầu danh sách

        // Giới hạn số lượng hóa đơn chờ (tối đa 5 hóa đơn)
        if (pendingInvoices.length > 10) {
            pendingInvoices.pop();  // Xóa hóa đơn cũ nhất nếu có hơn 5 hóa đơn
        }

        localStorage.setItem('pendingInvoices', JSON.stringify(pendingInvoices));

        // Xóa giỏ hàng và thông tin khách hàng sau khi tạo hóa đơn
        localStorage.removeItem('cart');
        $('#customerForm')[0].reset(); // Đặt lại toàn bộ form
        $('#discountSelect').val('0');  // Chọn giá trị "Không giảm giá"


        renderCart();  // Cập nhật lại giỏ hàng trên giao diện

        alert('Hóa đơn đã được tạo và lưu vào hóa đơn chờ.');

        // Hiển thị lại danh sách hóa đơn chờ
        renderPendingInvoices();
    } else {
        alert('Giỏ hàng trống hoặc thông tin khách hàng chưa đầy đủ.');
    }
}
function viewPendingInvoice(invoiceId) {
    // Lấy danh sách hóa đơn chờ từ localStorage
    let pendingInvoices = JSON.parse(localStorage.getItem('pendingInvoices')) || [];
    let invoice = pendingInvoices.find(inv => inv.id === invoiceId);

    if (invoice) {
        // Lưu lại giỏ hàng tạm thời từ hóa đơn chờ
        localStorage.setItem('cart', JSON.stringify(invoice.items));

        // Lưu thông tin khách hàng vào localStorage
        localStorage.setItem('customerName', invoice.customer.name);
        localStorage.setItem('customerPhone', invoice.customer.phone);

        // Hiển thị lại giỏ hàng
        renderCart();

        // Cập nhật thông tin khách hàng
        document.getElementById('customerName').value = invoice.customer.name;
        document.getElementById('customerPhone').value = invoice.customer.phone;

        // Xóa hóa đơn chờ sau khi chuyển vào giỏ hàng
        pendingInvoices = pendingInvoices.filter(inv => inv.id !== invoiceId);
        localStorage.setItem('pendingInvoices', JSON.stringify(pendingInvoices));

        // Cập nhật lại danh sách hóa đơn chờ
        renderPendingInvoices();

        // Thông báo đã chuyển hóa đơn chờ vào giỏ hàng
        alert('Hóa đơn đã được chuyển vào giỏ hàng và xóa khỏi danh sách chờ.');
    } else {
        alert('Hóa đơn không tồn tại.');
    }
}

// Biến trạng thái để theo dõi xem danh sách hóa đơn chờ có hiển thị hay không
let isPendingInvoicesVisible = false;

// Khi bấm vào nút "Xem hóFa đơn chờ"
document.getElementById('showPendingInvoicesBtn').addEventListener('click', function () {
    let pendingInvoicesSection = document.getElementById('pendingInvoicesSection');

    // Lấy danh sách hóa đơn chờ từ localStorage
    let pendingInvoices = JSON.parse(localStorage.getItem('pendingInvoices')) || [];

    // Nếu có hóa đơn chờ, hiển thị chúng
    if (pendingInvoices.length > 0) {
        // Nếu đang ẩn thì hiển thị, ngược lại thì ẩn
        if (isPendingInvoicesVisible) {
            pendingInvoicesSection.style.display = 'none';  // Ẩn danh sách hóa đơn chờ
        } else {
            pendingInvoicesSection.style.display = 'block';  // Hiển thị danh sách hóa đơn chờ
            renderPendingInvoices();  // Hiển thị lại danh sách hóa đơn chờ
        }
        // Cập nhật trạng thái hiển thị
        isPendingInvoicesVisible = !isPendingInvoicesVisible;
    } else {
        alert('Không có hóa đơn chờ.');
    }
});


function renderPendingInvoices() {
    // Lấy danh sách hóa đơn chờ từ localStorage
    let pendingInvoices = JSON.parse(localStorage.getItem('pendingInvoices')) || [];
    let invoiceContainer = document.getElementById('pendingInvoices').getElementsByTagName('tbody')[0];

    // Xóa nội dung cũ
    invoiceContainer.innerHTML = '';

    if (pendingInvoices.length > 0) {
        pendingInvoices.forEach(invoice => {
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>${invoice.id}</td>
                <td>${invoice.customer.name}</td>
                <td>${invoice.customer.phone}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewPendingInvoice(${invoice.id})">Xem</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePendingInvoice(${invoice.id})">Xóa</button>
                </td>
            `;
            invoiceContainer.appendChild(row);
        });
    } else {
        invoiceContainer.innerHTML = '<tr><td colspan="4">Không có hóa đơn chờ.</td></tr>';
    }
}





function deletePendingInvoice(invoiceId) {
    // Lấy danh sách hóa đơn chờ từ localStorage
    let pendingInvoices = JSON.parse(localStorage.getItem('pendingInvoices')) || [];

    // Xóa hóa đơn trong danh sách
    pendingInvoices = pendingInvoices.filter(invoice => invoice.id !== invoiceId);

    // Lưu lại danh sách hóa đơn chờ sau khi xóa
    localStorage.setItem('pendingInvoices', JSON.stringify(pendingInvoices));

    // Cập nhật lại danh sách hiển thị
    renderPendingInvoices();

    // alert('Hóa đơn đã được xóa.');
}


// Gọi hàm renderPendingInvoices khi trang tải
// window.onload = function () {
//     renderPendingInvoices(); // Hiển thị danh sách hóa đơn chờ
//     renderCart(); // Hiển thị giỏ hàng nếu có
// };
